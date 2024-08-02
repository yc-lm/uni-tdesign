import sheep from '@/sheep';
import third from '@/sheep/api/third';
import {
    getOpenInfo,
    getPlatformInfoById,
    getToken,
    getUserOpenInfo,
    STORE_KEY_LIST,
    USER_KEY_OBJ,
    USER_PLATFORM_HOST,
    WX_LOGIN_STATUS_OBJ,
} from '@/sheep/hooks/useLogin';
import $store from '@/sheep/store';

let subscribeEventList = [];

// 加载微信小程序
function load() {
    checkUpdate();
    // const sessionStatus = await checkSession();
    // 小程序的接口改动太频繁了 强制每次进入都重新获取
    const sessionStatus = false;
    if (!sessionStatus) {
        // getOpenId();
    }
    // getSubscribeTemplate();
}

/**
 * 微信登录
 * @param {boolean} isNotify
 * @return {number} WX_LOGIN_STATUS_OBJ
 * {
 *     SUCCESS: 1,// 成功
 *     NOT_BIND_PLATFORM: 2, // 未绑定平台
 *     NOT_GET_DOMAIN_NAME: 3, // 未获取到平台域名
 * }
 */
const login = async (isNotify = true) => {
    // 1.先判断是否有平台相关的信息
    let openId = uni.getStorageSync(USER_KEY_OBJ.USER_OPENID);
    const platformId = uni.getStorageSync(USER_KEY_OBJ.USER_PLATFORM_ID);
    const schoolId = uni.getStorageSync(USER_KEY_OBJ.USER_SCHOOL_ID);
    const platformHost = uni.getStorageSync(USER_KEY_OBJ.USER_PLATFORM_HOST);
    const loginName = uni.getStorageSync(USER_KEY_OBJ.USER_LOGIN_NAME);
    if (!openId || !platformId) {
        await getOpenId();
    }

    // 如果继续没有openid
    openId = uni.getStorageSync(USER_KEY_OBJ.USER_OPENID);
    if (!openId) {
        isNotify && sheep.$helper.toast('网络错误');
        return WX_LOGIN_STATUS_OBJ.OPEN_ID_ERROR;
    }

    // 没有平台信息或者没有登录名，需要先关联平台
    if (!platformId || !loginName || !schoolId) {
        return WX_LOGIN_STATUS_OBJ.NOT_BIND_PLATFORM;
    }

    // 没有获取到平台域名
    if (!platformHost) {
        // 重新获取一次
        const platformInfo = await getPlatformInfoById(platformId);
        if (!platformInfo?.domain_name) {
            isNotify && sheep.$helper.toast('未获取到平台信息');
            return WX_LOGIN_STATUS_OBJ.NOT_GET_DOMAIN_NAME;
        }
    }

    // 2.通过登录账号获取token
    const result = await getToken(loginName, schoolId, true);
    // 无权限登录
    if (result?.error === 'NO_PERMISSION') {
        isNotify && sheep.$helper.toast('您无权限访问');
        return WX_LOGIN_STATUS_OBJ.NOT_POWER_LOGIN;
    }

    const token = result?.value['Access-Token'] || '';
    if (!token) {
        isNotify && sheep.$helper.toast('登录失败');
        return WX_LOGIN_STATUS_OBJ.TOKEN_ERROR;
    }
    uni.setStorageSync(USER_KEY_OBJ.USER_TOKEN, token);
    return WX_LOGIN_STATUS_OBJ.SUCCESS;
};

// 微信小程序手机号授权登陆
const mobileLogin = async (e) => {
    return new Promise(async (resolve, reject) => {
        if (e.errMsg !== 'getPhoneNumber:ok') {
            resolve(false);
            return;
        }

        const { error } = await third.wechat.login({
            platform: 'miniProgram',
            shareInfo: uni.getStorageSync('shareLog') || {},
            payload: encodeURIComponent(
                JSON.stringify({
                    sessionId: uni.getStorageSync('sessionId'),
                    code: e.code,
                    iv: e.iv,
                    encryptedData: e.encryptedData,
                }),
            ),
        });

        if (error === 0) {
            resolve(true);
        }

        if (error === -1) {
            getOpenId(false);
        }
        resolve(false);
    });
};

// 微信小程序绑定
const bind = () => {
    return new Promise(async (resolve, reject) => {
        const loginRes = await third.wechat.bind({
            platform: 'miniProgram',
            payload: encodeURIComponent(
                JSON.stringify({
                    sessionId: uni.getStorageSync('sessionId'),
                }),
            ),
        });

        if (loginRes.error === -1) {
            getOpenId(false);
        } else if (loginRes.error === 0) {
            resolve(true);
        } else {
            reject(false);
        }
    });
};

// 微信小程序解除绑定
const unbind = async () => {
    const { error } = await third.wechat.unbind({
        platform: 'miniProgram',
    });
    return !error;
};

// 获取用户openid
const getOpenId = async (auto_login = null) => {
    // 获取code
    let codeStr = '';
    const loginResult = await uni.login();
    if (loginResult.errMsg === 'login:ok') {
        codeStr = loginResult.code;
    } else {
        getOpenId(auto_login);
        return false;
    }
    if (auto_login === null) {
        auto_login = !!($store('app').platform.auto_login && !$store('user').isLogin);
    }

    return await getUserOpenInfo(codeStr);
};

// 检查sessionId是否可用
const checkSession = () => {
    return new Promise((resolve, reject) => {});
};

// 小程序更新
const checkUpdate = async (silence = true) => {
    if (uni.canIUse('getUpdateManager')) {
        const updateManager = uni.getUpdateManager();
        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            if (res.hasUpdate) {
                updateManager.onUpdateReady(function () {
                    uni.showModal({
                        title: '更新提示',
                        content: '新版本已经准备好，是否重启应用？',
                        success(res) {
                            if (res.confirm) {
                                // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                                updateManager.applyUpdate();
                            }
                        },
                    });
                });
                updateManager.onUpdateFailed(function () {
                    // 新的版本下载失败
                    // uni.showModal({
                    //   title: '已经有新版本了哟~',
                    //   content: '新版本已经上线啦，请您删除当前小程序，重新搜索打开~',
                    // });
                });
            } else if (!silence) {
                uni.showModal({
                    title: '当前为最新版本',
                    showCancel: false,
                });
            }
        });
    }
};

// 绑定用户手机号
const bindUserPhoneNumber = (e) => {
    return new Promise(async (resolve, reject) => {
        const { error } = await third.wechat.bindUserPhoneNumber({
            platform: 'miniProgram',
            payload: encodeURIComponent(
                JSON.stringify({
                    sessionId: uni.getStorageSync('sessionId'),
                    iv: e.iv,
                    encryptedData: e.encryptedData,
                    code: e.code,
                }),
            ),
        });
        if (error === 0) {
            resolve(true);
        }
        resolve(false);
    });
};

// 获取订阅消息模板
async function getSubscribeTemplate() {
    const { error, data } = await third.wechat.subscribeTemplate();
    if (error === 0) {
        subscribeEventList = data;
    }
}

// 订阅消息
function subscribeMessage(event) {
    const tmplIds = [];
    if (typeof event === 'string') {
        tmplIds.push(subscribeEventList[event]);
    }
    if (typeof event === 'object') {
        event.forEach((item) => {
            if (typeof subscribeEventList[item] !== 'undefined')
                tmplIds.push(subscribeEventList[item]);
        });
    }
    if (tmplIds.length === 0) return;

    uni.requestSubscribeMessage({
        tmplIds,
        fail: (err) => {
            console.log(err);
        },
    });
}

export default {
    load,
    login,
    bind,
    unbind,
    checkUpdate,
    bindUserPhoneNumber,
    subscribeMessage,
};
