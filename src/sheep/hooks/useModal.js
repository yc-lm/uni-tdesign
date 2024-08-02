import $store from '@/sheep/store';
import $helper from '@/sheep/helper';
import dayjs from 'dayjs';
import { ref } from 'vue';
import test from '@/sheep/helper/test.js';
import $api from '@/sheep/api';

// 打开授权弹框
export function showAuthModal(type = 'accountLogin') {
  const modal = $store('modal');
  if (modal.auth !== '') {
    closeAuthModal();
    setTimeout(() => {
      modal.$patch((state) => {
        state.auth = type;
      });
    }, 100);
  } else {
    modal.$patch((state) => {
      state.auth = type;
    });
  }
}

// 关闭授权弹框
export function closeAuthModal() {
  $store('modal').$patch((state) => {
    state.auth = '';
  });
}

// 打开分享弹框
export function showShareModal() {
  $store('modal').$patch((state) => {
    state.share = true;
  });
}

// 关闭分享弹框
export function closeShareModal() {
  $store('modal').$patch((state) => {
    state.share = false;
  });
}

// 打开快捷菜单
export function showMenuTools() {
  $store('modal').$patch((state) => {
    state.menu = true;
  });
}

// 关闭快捷菜单
export function closeMenuTools() {
  $store('modal').$patch((state) => {
    state.menu = false;
  });
}

// 发送短信验证码  60秒
export function getSmsCode(event, mobile = '') {
  const modalStore = $store('modal');
  const lastSendTimer = modalStore.lastTimer[event];

  if (typeof lastSendTimer === 'undefined') {
    $helper.toast('短信发送事件错误');
    return;
  }

  const duration = dayjs().unix() - lastSendTimer;
  const canSend = duration >= 60;

  if (!canSend) {
    $helper.toast('请稍后再试');
    return;
  }

  if (!test.mobile(mobile)) {
    $helper.toast('手机号码格式不正确');
    return;
  }

  // 发送验证码 + 更新上次发送验证码时间
  $api.app.sendSms({ mobile, event }).then((res) => {
    if (res.error === 0) {
      modalStore.$patch((state) => {
        state.lastTimer[event] = dayjs().unix();
      });
    }
  });
}

// 获取短信验证码倒计时 -- 60秒
export function getSmsTimer(event, mobile = '') {
  const modalStore = $store('modal');
  const lastSendTimer = modalStore.lastTimer[event];

  if (typeof lastSendTimer === 'undefined') {
    $helper.toast('短信发送事件错误');
    return;
  }

  const duration = ref(dayjs().unix() - lastSendTimer - 60);
  const canSend = duration.value >= 0;

  if (canSend) {
    return '获取验证码';
  }

  if (!canSend) {
    setTimeout(() => {
      duration.value++;
    }, 1000);
    return -duration.value.toString() + ' 秒';
  }
}

// 记录广告弹框历史
export function saveAdvHistory(adv) {
  const modal = $store('modal');

  modal.$patch((state) => {
    if (!state.advHistory.includes(adv.src)) {
      state.advHistory.push(adv.src);
    }
  });
}

// 打开选学校弹框
export function showSchoolModal() {
  $store('modal').$patch((state) => {
    state.selectSchool = true;
  });
}

// 关闭学校弹框
export function closeSchoolModal() {
  console.log('closeSchoolModal')
  $store('modal').$patch((state) => {
    state.selectSchool = false;
  });
}

// 打开注册成功提示
export function showRegisterModal() {
  $store('modal').$patch((state) => {
    state.isRegister = true;
  });
}

// 关闭注册成功提示
export function closeRegisterModal() {
  $store('modal').$patch((state) => {
    state.isRegister = false;
  });
}

// 打开课程提醒弹窗
export function showCourseModal() {
  $store('modal').$patch((state) => {
    state.isCourse = true;
  });
}
// 关闭课程提醒弹窗
export function closeCourseModal() {
  $store('modal').$patch((state) => {
    state.isCourse = false;
  });
}

// 弹窗消息数据
export function modalMessageInfo(data) {
  $store('modal').$patch((state) => {
    state.modalMessage = data;
  });
}
// 课程消息数据
export function courseMessageInfo(data) {
  $store('modal').$patch((state) => {
    state.courseMessage = data;
  });
}
// toast提示打开和关闭
export function openToast(data, duration = 2000) {
  $store('modal').$patch((state) => {
    state.isToast = data;
    setTimeout(() => {
      state.isToast = false;
    }, duration);
  });
}
// 打开注册用户
export function showRegisterUserModal() {
  $store('modal').$patch((state) => {
    state.isRegisterUser = true;
  });
}

// 关闭注册用户
export function closeRegisterUserModal() {
  $store('modal').$patch((state) => {
    state.isRegisterUser = false;
  });
}
