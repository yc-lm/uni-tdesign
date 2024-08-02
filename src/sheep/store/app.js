import { defineStore } from 'pinia';
import { getCollectionInTree } from '@/sheep/business/permission';

const app = defineStore({
  id: 'app',
  state: () => ({
    info: {},
    platform: {},
    chat: {},
    template: {},
    shareInfo: {}, // 全局分享信息
    has_wechat_trade_managed: 0, // 小程序发货信息管理  0 没有 || 1 有

    // 用户权限
    permission: [],
  }),
  actions: {
    // 获取Shopro应用配置和模板
    async init(templateId = null) {},

    // 设置用户权限
    updatePermission(data) {
      this.permission = getCollectionInTree(data, 'menu_url', [], { map_key: 'menu_code' });
      console.log('updatePermission', this.permission)
    },
  },
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'app-store',
      },
    ],
  },
});

export default app;
