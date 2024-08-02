<template>
  <view class="content">
    <image class="logo" src="/static/logo.png" />
    <view class="text-area">
      <text class="title">{{ title }}</text>
      <t-row>
        <t-button theme="primary" size="small">填充按钮</t-button>
      </t-row>
      <t-row>
        <t-radio :value="radio1" label="单选" default-checked />
      </t-row>
      <t-row>
        <t-col span="8" t-class="dark">col-8</t-col>
        <t-col span="8" t-class="light">col-8</t-col>
        <t-col span="8" t-class="dark">col-8</t-col>
      </t-row>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const title = ref('Hello')
const radio1 = ref(false)
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
