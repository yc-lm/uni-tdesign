/**
 * 本模块封装微信浏览器下的一些方法。
 * 更多微信网页开发sdk方法,详见:https://developers.weixin.qq.com/doc/offiaccount/OA_Web_Apps/JS-SDK.html
 */

import jweixin from 'weixin-js-sdk';

import third from '@/sheep/api/third';
import $helper from '@/sheep/helper';

let configSuccess = false;

export default {
    // 判断是否在微信中
    isWechat() {
        const ua = window.navigator.userAgent.toLowerCase();
        if (ua.match(/micromessenger/i) == 'micromessenger') {
            return true;
        }
        return false;
    },

    isReady(api) {
        jweixin.ready(api);
    },

    // 初始化JSSDK
    async init(callback) {
        if (!this.isWechat()) {
            $helper.toast('请使用微信网页浏览器打开');
            return;
        }

        const url = location.href.split('#')[0];

        const { error, data } = await third.wechat.jssdk({
            platform: 'officialAccount',
            payload: encodeURIComponent(
                JSON.stringify({
                    url,
                }),
            ),
        });

        if (error === 0) {
            jweixin.config({
                debug: false,
                appId: data.appId,
                timestamp: data.timestamp,
                nonceStr: data.nonceStr,
                signature: data.signature,
                jsApiList: data.jsApiList,
                openTagList: data.openTagList,
            });
        }

        configSuccess = true;

        jweixin.error((err) => {
            configSuccess = false;
            // $helper.toast('微信JSSDK:' + err.errMsg);
        });

        if (callback) {
            callback(data);
        }
    },

    // 在需要定位页面调用
    getLocation(callback) {
        this.isReady(() => {
            jweixin.getLocation({
                type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
                success(res) {
                    callback(res);
                },
                fail(res) {
                    console.log('%c微信H5sdk,getLocation失败：', 'color:green;background:yellow');
                },
            });
        });
    },

    // 获取微信收货地址
    openAddress(callback) {
        this.isReady(() => {
            jweixin.openAddress({
                success(res) {
                    callback.success && callback.success(res);
                },
                fail(err) {
                    callback.error && callback.error(err);
                    console.log('%c微信H5sdk,openAddress失败：', 'color:green;background:yellow');
                },
                complete(res) {},
            });
        });
    },

    // 微信扫码
    scanQRCode(callback) {
        this.isReady(() => {
            jweixin.scanQRCode({
                needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
                scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
                success(res) {
                    callback(res);
                },
                fail(res) {
                    console.log('%c微信H5sdk,scanQRCode失败：', 'color:green;background:yellow');
                },
            });
        });
    },

    // 更新微信分享信息
    updateShareInfo(data, callback = null) {
        this.isReady(() => {
            const shareData = {
                title: data.title,
                desc: data.desc,
                link: data.link,
                imgUrl: data.image,
                success(res) {
                    if (callback) {
                        callback(res);
                    }
                    // 分享后的一些操作,比如分享统计等等
                },
                cancel(res) {},
            };

            // 新版 分享聊天api
            jweixin.updateAppMessageShareData(shareData);
            // 新版 分享到朋友圈api
            jweixin.updateTimelineShareData(shareData);
        });
    },

    // 打开坐标位置
    openLocation(data, callback) {
        this.isReady(() => {
            jweixin.openLocation({
                // 根据传入的坐标打开地图
                latitude: data.latitude,
                longitude: data.longitude,
            });
        });
    },

    // 选择图片
    chooseImage(callback) {
        this.isReady(() => {
            jweixin.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: ['album'],
                success(rs) {
                    callback(rs);
                },
            });
        });
    },

    // 微信支付
    wxpay(data, callback) {
        this.isReady(() => {
            jweixin.chooseWXPay({
                timestamp: data.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                nonceStr: data.nonceStr, // 支付签名随机串，不长于 32 位
                package: data.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=\*\*\*）
                signType: data.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                paySign: data.paySign, // 支付签名
                success(res) {
                    callback.success && callback.success(res);
                },
                fail(err) {
                    callback.fail && callback.fail(err);
                },
                cancel(err) {
                    callback.cancel && callback.cancel(err);
                },
            });
        });
    },
};
