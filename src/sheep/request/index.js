/**
 * Shopro-request
 * @description api模块管理，loading配置，请求拦截，错误处理
 */

import Request from 'luch-request';
import { baseUrl, apiPath, authApiPath, userApiPath, authPlatformUrl } from '@/sheep/config';
import $store from '@/sheep/store';
import $platform from '@/sheep/platform';
import { showAuthModal } from '@/sheep/hooks/useModal';
import { REQUEST_PLATFORM_TYPES, concatProtocol } from '@/sheep/hooks/useApi';
import { removeAllStorage, USER_KEY_OBJ, USER_LOGIN_TYPE_OBJ } from '@/sheep/hooks/useLogin';
import sheep from '@/sheep';

const options = {
    // 显示操作成功消息 默认不显示
    showSuccess: false,
    // 成功提醒 默认使用后端返回值
    successMsg: '',
    // 显示失败消息 默认显示
    showError: true,
    // 失败提醒 默认使用后端返回信息
    errorMsg: '',
    // 显示请求时loading模态框 默认显示
    showLoading: true,
    // loading提醒文字
    loadingMsg: '加载中',
    // 需要授权才能请求 默认放开
    auth: false,
    // ...
};

// Loading全局实例
let LoadingInstance = {
    target: null,
    count: 0,
};

/**
 * 关闭loading
 */
function closeLoading() {
    if (LoadingInstance.count > 0) LoadingInstance.count--;
    if (LoadingInstance.count === 0) uni.hideLoading();
}

/**
 * @description 请求基础配置 可直接使用访问自定义请求
 */
const http = new Request({
    baseURL: baseUrl,
    timeout: 8000,
    method: 'GET',
    header: {
        Accept: 'text/json',
        ['Content-Type']: 'application/x-www-form-urlencoded;charset=UTF-8',
        platform: $platform.name,
    },
    // #ifdef APP-PLUS
    sslVerify: false,
    // #endif
    // #ifdef H5
    // 跨域请求时是否携带凭证（cookies）仅H5支持（HBuilderX 2.6.15+）
    withCredentials: false,
    // #endif
    custom: options,
});

/**
 * @description 请求拦截器
 */
http.interceptors.request.use(
    (config) => {
        if (config.custom.auth && !$store('user').isLogin) {
            sheep.$router.go('/pages/login/login');
            return Promise.reject();
        }
        if (config.custom.showLoading) {
            LoadingInstance.count++;
            LoadingInstance.count === 1 &&
                uni.showLoading({
                    title: config.custom.loadingMsg,
                    mask: true,
                    fail: () => {
                        uni.hideLoading();
                    },
                });
        }
        const token = uni.getStorageSync(USER_KEY_OBJ.USER_TOKEN);
        // 授权平台的token
        if (config?.custom?.isAuthPlatform) {
            const authToken = uni.getStorageSync(USER_KEY_OBJ.AUTH_PLATFORM_TOKEN);
            if (authToken) config.header['Authorization'] = authToken;
        } else {
            if (token) config.header['Access-Token'] = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

/**
 * @description 响应拦截器
 */
http.interceptors.response.use(
    (response) => {
        // 自动设置登陆令牌
        if (response.header['Access-Token'] || response.header.Authorization) {
            //$store('user').setToken(response.header['Access-Token'] || response.header.Authorization);
        }

        response.config.custom.showLoading && closeLoading();
        /*if (response.data.error !== 0) {
          if (response.config.custom.showError)
            uni.showToast({
              title: response.data.msg || '服务器开小差啦,请稍后再试~',
              icon: 'none',
              mask: true,
            });
          return Promise.resolve(response.data);
        }
        if (
          response.data.error === 0 &&
          response.data.msg !== '' &&
          response.config.custom.showSuccess
        ) {
          uni.showToast({
            title: response.config.custom.successMsg || response.data.msg,
            icon: 'none',
          });
        }*/

        // token过期
        if (
            response.data.error === 'INVALID_TOKEN' ||
            response.data.error === 'NO_LOGIN' ||
            response.data.error === 'TOKEN_ERROR'
        ) {
            const loginType = uni.getStorageSync(USER_KEY_OBJ.USER_LOGIN_TYPE);
            // 移除所有的登录信息
            removeAllStorage();
            // 刷新登录状态
            sheep.$store('user').setToken('');
            uni.redirectTo({
                url:
                    loginType === USER_LOGIN_TYPE_OBJ.QY_WX_LOGIN
                        ? '/pages/login/qyLogin'
                        : '/pages/login/login',
            });
        }

        return Promise.resolve(response?.method === 'HEAD' ? response : response.data);
    },
    (error) => {
        const userStore = $store('user');
        const isLogin = userStore.isLogin;
        let errorMessage = '网络请求出错';
        if (error !== undefined) {
            switch (error.statusCode) {
                case 400:
                    errorMessage = '请求错误';
                    break;
                case 401:
                    if (isLogin) {
                        errorMessage = '您的登陆已过期';
                    } else {
                        errorMessage = '请先登录';
                    }
                    userStore.logout(true);
                    showAuthModal();
                    break;
                case 403:
                    errorMessage = '拒绝访问';
                    break;
                case 404:
                    errorMessage = '请求出错';
                    break;
                case 408:
                    errorMessage = '请求超时';
                    break;
                case 429:
                    errorMessage = '请求频繁, 请稍后再访问';
                    break;
                case 500:
                    errorMessage = '服务器开小差啦,请稍后再试~';
                    break;
                case 501:
                    errorMessage = '服务未实现';
                    break;
                case 502:
                    errorMessage = '网络错误';
                    break;
                case 503:
                    errorMessage = '服务不可用';
                    break;
                case 504:
                    errorMessage = '网络超时';
                    break;
                case 505:
                    errorMessage = 'HTTP版本不受支持';
                    break;
            }
            if (error.errMsg.includes('timeout')) errorMessage = '请求超时';
            // #ifdef H5
            if (error.errMsg.includes('Network'))
                errorMessage = window.navigator.onLine ? '服务器异常' : '请检查您的网络连接';
            // #endif
        }

        if (error && error.config) {
            if (error.config.custom.showError === false) {
                uni.showToast({
                    title: error.data?.msg || errorMessage,
                    icon: 'none',
                    mask: true,
                });
            }
            error.config.custom.showLoading && closeLoading();
        }

        return false;
    },
);

/**
 * @param {object} config 请求配置
 * @param {string} requestPlatform 请求平台
 */
const request = (config, requestPlatform = '') => {
    // 默认为主平台
    if (requestPlatform === '') {
        requestPlatform = REQUEST_PLATFORM_TYPES.REQUEST_PLATFORM_MAIN;
    }

    // 通用接口前缀
    let prefixPath = '';
    // 接口地址
    let currentApiUrl = '';
    // 是否需要拼接完整地址
    let isFullUrl = false;
    if (requestPlatform === REQUEST_PLATFORM_TYPES.REQUEST_PLATFORM_MAIN) {
        prefixPath = apiPath;
    } else if (requestPlatform === REQUEST_PLATFORM_TYPES.REQUEST_PLATFORM_AUTH) {
        prefixPath = authApiPath;
        currentApiUrl = authPlatformUrl;
        isFullUrl = true;
    } else if (requestPlatform === REQUEST_PLATFORM_TYPES.REQUEST_PLATFORM_USER) {
        prefixPath = userApiPath;
        currentApiUrl = concatProtocol(uni.getStorageSync(USER_KEY_OBJ.USER_PLATFORM_HOST));
        isFullUrl = true;
    }

    // 当写法不是以/开头时，拼接通用前缀
    if (config.url[0] !== '/') {
        config.url = prefixPath + config.url;
    }

    if (isFullUrl) {
        config.url = currentApiUrl + config.url;
    }

    return http.middleware(config);
};

export default request;
