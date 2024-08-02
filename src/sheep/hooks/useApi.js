import {isArray, isNull, isUndefined} from "lodash";
import {isString} from "@/sheep/helper/utils";
import sheep from '@/sheep';

export const OK = 'OK';

/**
 * 处理接口返回的数据
 * @param {Function} api       接口方法，必传
 * @param {Object} [params]    接口入参，可选
 * @param {*} [defaultValue]   出错时的默认出参，可选
 * @param {Boolean} [notifyError]   是否显示错误通知，可选
 * @param {Boolean} [isPostSuccessMsg]   post请求成功后弹出提示
 * @param {Number} [toastDuration]  错误通知的持续时间，单位毫秒，默认2000
 * @return {Promise<any>} 传入默认值，则出错时，resolve 默认值；不传，则出错时，reject 错误数据，需要 catch 处理
 */
export function apiSimpleWrapper({
                                     api,
                                     params,
                                     defaultValue,
                                     notifyError = false,
                                     isPostSuccessMsg = false,
                                     toastDuration = 2000
                                 }) {
    return new Promise(async (resolve, reject) => {
        try {
            let {error, value, msg} = await api(params).catch(error => {
                if (isUndefined(defaultValue)) {
                    reject(error);
                } else {
                    resolve(defaultValue);
                }
                if (notifyError) {
                    const errorMsg = error === 'ECONNABORTED' ? '等待超时' : error;
                    sheep.$helper.toast(errorMsg ? errorMsg : '操作失败',toastDuration);
                }
            });
            // 兼容msg为空
            msg = msg ? msg : isString(value) ? value : isArray(value) && value.length ? value[0] : '操作失败';
            if (error === OK && !isUndefined(value) && !(isNull(value) && !isArray(value))) {
                if (isPostSuccessMsg) {
                    sheep.$helper.toast('操作成功',toastDuration);
                }
                resolve(value);
            } else {
                if (isUndefined(defaultValue)) {
                    reject(msg);
                } else {
                    resolve(defaultValue);
                }
                if (notifyError) {
                    sheep.$helper.toast(msg,toastDuration);
                }
            }
        } catch (e) {
            console.log(e);
        }
    });
}


// 主平台
export const REQUEST_PLATFORM_MAIN = 'REQUEST_PLATFORM_MAIN';

// 授权平台
export const REQUEST_PLATFORM_AUTH = 'REQUEST_PLATFORM_AUTH';

// 用户登录的平台
export const REQUEST_PLATFORM_USER = 'REQUEST_PLATFORM_USER';

export const REQUEST_PLATFORM_TYPES = {
    REQUEST_PLATFORM_MAIN,
    REQUEST_PLATFORM_AUTH,
    REQUEST_PLATFORM_USER
}

export function concatProtocol(url, https = true) {
    if (url?.includes('http')) {
        return url;
    }
    const protocol = https ? 'https' : 'http';
    return `${protocol}://${url}`;
}

export function useApi() {
    return {}
}

export const URL = '/bmd/jsonApi.php'
export const RS_URL = '/app'