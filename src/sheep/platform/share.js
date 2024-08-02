import $store from '@/sheep/store';
import $platform from '@/sheep/platform';
import $router from '@/sheep/router';
import $url from '@/sheep/url';
// #ifdef H5
import $wxsdk from '@/sheep/libs/sdk-h5-weixin';
// #endif

// 设置分享的平台渠道: 1=H5,2=微信公众号网页,3=微信小程序,4=App,...按需扩展
const platformMap = ['H5', 'WechatOfficialAccount', 'WechatMiniProgram', 'App'];

// 设置分享方式: 1=直接转发,2=海报,3=复制链接,...按需扩展
const fromMap = ['forward', 'poster', 'link'];

// 设置分享信息参数
const getShareInfo = (
  scene = {
    title: '', // 自定义分享标题
    desc: '', // 自定义描述
    image: '', // 自定义分享图片
    params: {}, // 自定义分享参数
  },
  poster = {
    // 自定义海报数据
    type: 'user',
  },
) => {
  let shareInfo = {
    title: '', // 分享标题
    desc: '', // 描述
    image: '', // 分享图片
    path: '', // 分享页面+参数
    link: '', // 分享Url+参数
    query: '', // 分享参数
    poster, // 海报所需数据
  };

  return shareInfo;
};

// 构造spm分享参数
const buildSpmQuery = (params) => {
  //spmParams = ...  可按需扩展
  return ``;
};

// 构造页面分享参数
const buildSpmPath = (query) => {
  return `/pages/index/index?${query}`;
};

// 构造分享链接
const buildSpmLink = (query, linkAddress = '') => {
  return `${linkAddress}?${query}`;
};

// 解析Spm
const decryptSpm = (spm) => {
  const user = $store('user');
  let shareParamsArray = spm.split('.');
  let shareParams = {
    spm,
    shareId: 0,
    page: '',
    query: {},
    platform: '',
    from: '',
  };
  let query;
  shareParams.shareId = shareParamsArray[0];
  switch (shareParamsArray[1]) {
    case '1':
      // 默认首页不跳转
      shareParams.page = '/pages/index/index';
      break;
    case '2':
      // 普通商品
      shareParams.page = '/pages/goods/index';
      shareParams.query = {
        id: shareParamsArray[2],
      };
      break;
    case '3':
      // 拼团商品
      shareParams.page = '/pages/goods/groupon';
      query = shareParamsArray[2].split(',');
      shareParams.query = {
        id: query[0],
        activity_id: query[1],
      };
      break;
    case '4':
      // 秒杀商品
      shareParams.page = '/pages/goods/seckill';
      query = shareParamsArray[2].split(',');
      shareParams.query = {
        id: query[0],
        activity_id: query[1],
      };
      break;
    case '5':
      // 参与拼团
      shareParams.page = '/pages/activity/groupon/detail';
      shareParams.query = {
        id: shareParamsArray[2],
      };
      break;
  }
  shareParams.platform = platformMap[shareParamsArray[3] - 1];
  shareParams.from = fromMap[shareParamsArray[4] - 1];
  if (shareParams.shareId != 0) {
    // 已登录 立即添加分享记录
    if (user.isLogin) {
      user.addShareLog(shareParams);
    } else {
      // 未登录 待用户登录后添加分享记录
      uni.setStorageSync('shareLog', shareParams);
    }
  }

  if (shareParams.page !== '/pages/index/index') {
    $router.go(shareParams.page, shareParams.query);
  }
  return shareParams;
};

// 更新公众号分享sdk
const updateShareInfo = (shareInfo) => {
  // #ifdef H5
  if ($platform.name === 'WechatOfficialAccount') {
    $wxsdk.updateShareInfo(shareInfo);
  }
  // #endif
};

export default {
  getShareInfo,
  updateShareInfo,
  decryptSpm,
};
