import { apiSimpleWrapper } from '@/sheep/hooks/useApi';
import userApi from '@/sheep/api/user';


export async function getUserName(apiParams){
  return await apiSimpleWrapper({
    api: userApi.getUserLoginName,
    params: apiParams,
    notifyError: true,
    defaultValue: {},
  });
}

//获取密码强度
export  async function  getPasswordOption(apiParams){
  return await apiSimpleWrapper({
    api: userApi.getSchoolOption,
    params: apiParams,
    notifyError: true,
    defaultValue: {},
  });
}


//修改密码
export async function editPassword(apiParams){
  return await apiSimpleWrapper({
    api: userApi.editUserPassword,
    params: apiParams,
    notifyError: true,
    defaultValue: {},
  });
}

//微信绑定
export async function  setAccountBind(apiParams){
  return await apiSimpleWrapper({
    api: userApi.setWechatBind,
    params: apiParams,
    notifyError: true,
    defaultValue: {},
  });
}


export async function  loginOut(apiParams){
  return await apiSimpleWrapper({
    api: userApi.logout,
    params: apiParams,
    notifyError: true,
    defaultValue: {},
  });
}

export async function getSchoolOptionInfo(apiParams){
  return await apiSimpleWrapper({
    api:userApi.getSchoolOption,
    params: apiParams,
    notifyError: true,
    defaultValue: {},
  })
}
