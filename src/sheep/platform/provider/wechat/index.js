// #ifdef H5
// #endif
// #ifdef MP-WEIXIN
import service from './miniProgram';
import service from './officialAccount';
// #endif
// #ifdef APP-PLUS
import service from './openPlatform';
// #endif

const wechat = service;

export default wechat;
