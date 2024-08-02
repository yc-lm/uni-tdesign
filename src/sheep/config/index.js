// 开发环境配置
// 首次调用地址
export let baseUrl;
export let version;
const currentEnvObj = import.meta.env;
// 是否启用内网环境
const isInnerEnv = currentEnvObj?.SHOPRO_ENABLE_INNER_ENV === '1';

// 使用公网环境还是内网环境
function getConfigByKey(configObj, key, isInner = false) {
  if (isInner) {
    key = `${key}_INNER`;
  }
  return configObj[key];
}

if (process.env.NODE_ENV === 'development') {
  baseUrl = currentEnvObj.SHOPRO_DEV_BASE_URL;
} else {
  baseUrl = currentEnvObj.SHOPRO_BASE_URL;
}
version = currentEnvObj?.SHOPRO_VERSION;
if (typeof baseUrl === 'undefined') {
  console.error('请检查.env配置文件是否存在');
} else {
  console.log(`[Shopro ${version}]`);
}

// 授权平台地址
export const authPlatformUrl = getConfigByKey(currentEnvObj, 'SHOPRO_AUTH_PLATFORM_BASE_URL', isInnerEnv);
// 静态资源地址
export const staticUrl = currentEnvObj.SHOPRO_STATIC_URL;
export const apiPath = currentEnvObj.SHOPRO_API_PATH;
export const userApiPath = currentEnvObj.SHOPRO_USER_API_PATH;
export const authApiPath = currentEnvObj.SHOPRO_AUTH_API_PATH;

const CURRENT_ENV_OBJ = {
  baseUrl,
  apiPath,
  staticUrl,
  authPlatformUrl,
  userApiPath,
  authApiPath,
};
console.log('CURRENT_ENV_OBJ', CURRENT_ENV_OBJ);
export default CURRENT_ENV_OBJ;
