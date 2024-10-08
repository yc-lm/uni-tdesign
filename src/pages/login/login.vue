<!--
 * @name: login.vue
 * @author: yangcongcong
 * @date: 2024/8/2
 * @description: 登录
-->

<template>
  <div class="login-container">
    <t-row class="login-title">请输入 6 位邀请码</t-row>
    <dx-code-input v-model="codeValue" :max-length="6" focus @finish="finish" />
    <t-row class="login-footer">
      <t-radio v-model="agreement">我已阅读并同意</t-radio>
      <t-link>服务协议及隐私政策</t-link>
    </t-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import DxCodeInput from '@/sheep/components/dx-code-input/index.vue';

defineOptions({ name: 'Login' });

const codeValue = ref('');
const agreement = ref(false);

const finish = (value: string) => {
  console.error(value);
  uni.reLaunch({
    url: '/pages/index/index',
  });
};
</script>

<style lang="scss" scoped>
.login-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  // align-items: center;
  gap: 36px;
  padding: 54px 24px 0;

  .login-title {
    font-weight: 600;
    font-size: 24px;
    color: rgb(26 29 52 / 90%);
    line-height: 36px;
    text-align: left;
  }

  .login-footer {
    .t-link {
      color: #017fff;
      font-size: 14px;
    }

    :deep(.t-radio) {
      padding: 0;
      align-items: center;

      .t-radio__content {
        font-size: 14px;
        color: rgb(26 29 52 / 60%);
      }

      .t-radio__border {
        display: none;
      }

      .t-radio__icon {
        width: 14px;
        height: 14px;

        .t-radio__icon-circle {
          width: 100%;
          height: 100%;

          &.t-radio__icon--checked {
            .t-icon {
              width: 14px;
              height: 14px;

              .t-icon-check-circle-filled {
                width: 100%;
                height: 100%;

                &::before {
                  width: 100%;
                  height: 100%;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
