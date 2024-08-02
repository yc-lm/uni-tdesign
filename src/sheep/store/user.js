import { defineStore } from 'pinia';
import userApi from '@/sheep/api/user';
import { cloneDeep, clone } from 'lodash';
import { getUserBriefInfo, USER_KEY_OBJ } from '@/sheep/hooks/useLogin';

// 默认用户信息
const defaultUserInfo = {};

// 默认订单、优惠券等其他资产信息
const defaultNumData = {
    coupons_num: '--',
    order_num: {
        aftersale: 0,
        nocomment: 0,
        noget: 0,
        nosend: 0,
        unpaid: 0,
    },
};

const user = defineStore({
    id: 'user',
    state: () => ({
        userInfo: clone(defaultUserInfo), // 用户信息
        isLogin: !!uni.getStorageSync(USER_KEY_OBJ.USER_TOKEN), // 登录状态
        numData: cloneDeep(defaultNumData), // 用户其他数据
        agentInfo: {}, // 分销商信息
        lastUpdateTime: 0, // 上次更新时间
        loginType: uni.getStorageSync(USER_KEY_OBJ.USER_LOGIN_TYPE) || '', // 登录方式
        platformHost: uni.getStorageSync(USER_KEY_OBJ.USER_PLATFORM_HOST) || '', // 用户登录平台的host
        schoolOption: uni.getStorageSync(USER_KEY_OBJ.USER_SCHOOL_OPTION), //获取学校配置
        // 是否开启详情页图片占位
        isVideoPlaceholder: false,
        // 当前是什么版本：develop开发版、trial体验版、release正式版、gray灰度版（仅支付宝小程序支持），
        envVersion: '',
    }),

    actions: {
        /**
         * 获取个人信息
         * @param {boolean} isBoolean 是否返回boolean
         * @param {boolean} isLoading 接口是否loading
         */
        async getInfo(isBoolean = false, isLoading = true) {
            const userInfo = await getUserBriefInfo(isLoading);

            if (!userInfo || !Object.keys(userInfo).length) {
                return isBoolean ? false : {};
            }
            this.userInfo = userInfo;

            return isBoolean ? true : userInfo;
        },

        // 获取分销商信息
        async getAgentInfo() {
        },

        // 获取订单、优惠券等其他资产信息
        async getNumData() {
            const { error, data } = await userApi.data();
            if (error === 0) {
                this.numData = data;
            }
        },

        // 添加分享记录
        async addShareLog(params) {
            const { error } = await userApi.addShareLog(params);
            if (error === 0) uni.removeStorageSync('shareLog');
        },

        // 设置token
        setToken(token = '') {
            if (token === '') {
                this.isLogin = false;
                uni.removeStorageSync(USER_KEY_OBJ.USER_TOKEN);
            } else {
                this.isLogin = true;
                uni.setStorageSync(USER_KEY_OBJ.USER_TOKEN, token);
            }
            return this.isLogin;
        },

        updateLoginType(type) {
            uni.setStorageSync(USER_KEY_OBJ.USER_LOGIN_TYPE, type);
            this.loginType = type;
        },

        updateUseInfo(val) {
            this.userInfo = val;
        },

        updateUserPlatformInfo(id, host) {
            uni.setStorageSync(USER_KEY_OBJ.USER_PLATFORM_ID, id);
            uni.setStorageSync(USER_KEY_OBJ.USER_PLATFORM_HOST, host);
            console.log('updateUserPlatformInfo', host);
            // 只用到了host挂载到store
            this.platformHost = host;
        },

        // 更新用户相关信息 (手动限流 5秒之内不刷新)
        async updateUserData() {
            if (!this.isLogin) {
                this.resetUserData();
                return;
            }
            const nowTime = new Date().getTime();
            if (this.lastUpdateTime + 5000 > nowTime) return;

            // 不用每次都刷新一次用户信息
            //await this.getInfo();
            this.lastUpdateTime = nowTime;
            return this.userInfo;
        },

        // 重置用户默认数据
        resetUserData() {
            this.setToken();
            this.userInfo = clone(defaultUserInfo);
            this.numData = cloneDeep(defaultNumData);
            this.agentInfo = {};
        },

        // 登录后
        async loginAfter() {
            await this.updateUserData();
            /*// 登录后设置全局分享参数
                  $share.getShareInfo();
                  // 提醒绑定手机号
                  if (app().platform.bind_mobile && !this.userInfo.verification?.mobile) {
                    showAuthModal('changeMobile');
                  }

                  // 添加分享记录
                  const shareLog = uni.getStorageSync('shareLog');
                  if (!isEmpty(shareLog)) {
                    this.addShareLog({
                      ...shareLog,
                    });
                  }*/
        },

        // 登出
        async logout(force = false) {
            if (!force) {
                const { error } = await userApi.logout();
                if (error === 0) {
                    this.resetUserData();
                }
            }
            if (force) {
                this.resetUserData();
            }

            return !this.isLogin;
        },
        updateSchoolOption(value) {
            uni.setStorageSync(USER_KEY_OBJ.USER_SCHOOL_OPTION, value);
        },
        updateVideoPlaceholder(value) {
            this.isVideoPlaceholder = value;
        },
        updateEnvVersion(value) {
            this.envVersion = value;
        },
    },
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'user-store',
            },
        ],
    },
});

export default user;
