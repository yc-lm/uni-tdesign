import { defineStore } from 'pinia';

const modal = defineStore({
    id: 'modal',
    state: () => ({
        auth: '', // 授权弹框 accountLogin|smsLogin|smsRegister|resetPassword|changeMobile|changePassword|changeUsername
        share: false, // 分享弹框
        menu: false, // 快捷菜单弹框
        advHistory: [], // 广告弹框记录
        lastTimer: {
            // 短信验证码计时器，为了防止刷新请求做了持久化
            smsLogin: 0,
            smsRegister: 0,
            changeMobile: 0,
            resetPassword: 0,
        },
        selectSchool: false, // 选学校
        isRegister: false, // 注册成功
        isRegisterUser: false, // 注册用户
        isCourse: false, // 课程消息弹窗
        courseMessage: {},
        modalMessage: {},
        isToast: false,
    }),
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'modal-store',
                paths: ['lastTimer', 'advHistory'],
            },
        ],
    },
});

export default modal;
