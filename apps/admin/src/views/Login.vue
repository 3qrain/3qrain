<template>
  <div class="login">
    <!-- 加载中 -->
    <p v-if="loading">检查中...</p>

    <!-- 首次设置密码 -->
    <div v-else-if="!initialized" class="form">
      <h2>首次设置密码</h2>
      <input
        v-model="password"
        type="password"
        placeholder="请输入密码（至少6位）"
        @keyup.enter="handleSetup"
      />
      <button :disabled="submitting" @click="handleSetup">
        {{ submitting ? "设置中..." : "设置密码" }}
      </button>
      <p v-if="recoveryKey" class="recovery">
        恢复密钥（请妥善保存，仅显示一次）：<br />
        <code>{{ recoveryKey }}</code>
      </p>
    </div>

    <!-- 登录 -->
    <div v-else class="form">
      <h2>登录</h2>
      <input
        v-model="password"
        type="password"
        placeholder="请输入密码"
        @keyup.enter="handleLogin"
      />
      <button :disabled="submitting" @click="handleLogin">
        {{ submitting ? "登录中..." : "登录" }}
      </button>
      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { checkStatus, setup, login } from "~/api";

const router = useRouter();

const loading = ref(true);
const initialized = ref(false);
const password = ref("");
const submitting = ref(false);
const recoveryKey = ref("");
const error = ref("");

onMounted(async () => {
  if (localStorage.getItem("admin")) {
    router.push("/");
    return;
  }

  const result = await checkStatus();
  initialized.value = result.initialized;
  loading.value = false;
});

async function handleSetup() {
  if (password.value.length < 6) return;
  submitting.value = true;
  error.value = "";
  try {
    const result = await setup(password.value);
    recoveryKey.value = result.recoveryKey;
    initialized.value = true;
  } catch (e: any) {
    error.value = e.response?.data?.message || "设置失败";
  } finally {
    submitting.value = false;
  }
}

async function handleLogin() {
  if (!password.value) return;
  submitting.value = true;
  error.value = "";
  try {
    await login(password.value);
    router.push("/");
  } catch (e: any) {
    error.value = e.response?.data?.message || "登录失败";
  } finally {
    submitting.value = false;
  }
}
</script>

<style scoped>
.login {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

h2 {
  margin-bottom: 8px;
}

input {
  padding: 10px 16px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;
  width: 260px;
}

input:focus {
  border-color: #646cff;
}

button {
  padding: 8px 24px;
  font-size: 14px;
  cursor: pointer;
}

.error {
  color: #e53e3e;
}

.recovery {
  text-align: center;
  max-width: 320px;
  word-break: break-all;
}

.recovery code {
  font-size: 14px;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
}
</style>
