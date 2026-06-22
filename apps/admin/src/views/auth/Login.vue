<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue-sonner'
import Input from '~/components/base/Input.vue'
import Button from '~/components/base/Button.vue'
import { checkStatus, setup, login, recover } from '~/api/auth'

const router = useRouter()

const loading = ref(true)
const initialized = ref(false)
const hasAdminUser = ref(false)
const submitting = ref(false)
const recoveryKey = ref('')
const showRecover = ref(false)
const recoveryKeyInput = ref('')

const form = ref({
  nickname: '3qrain',
  email: '',
  password: '',
  confirmPassword: '',
})

const isFreshSetup = () => !initialized.value && !hasAdminUser.value
const isRecoverySetup = () => !initialized.value && hasAdminUser.value

onMounted(async () => {
  if (localStorage.getItem('admin')) {
    router.push('/')
    return
  }
  try {
    const result = await checkStatus()
    initialized.value = result.initialized
    hasAdminUser.value = result.hasAdminUser
  } catch {
    toast.error('无法连接服务器')
  } finally {
    loading.value = false
  }
})

async function handleSetup() {
  const { password, confirmPassword, email, nickname } = form.value

  if (password.length < 6) { toast.error('密码长度至少 6 位'); return }
  if (password !== confirmPassword) { toast.error('两次密码不一致'); return }
  if (isFreshSetup() && !email) { toast.error('邮箱不能为空'); return }

  submitting.value = true
  try {
    const result = await setup({
      password,
      confirmPassword,
      ...(isFreshSetup() ? { email, nickname: nickname || '3qrain' } : {}),
    })
    recoveryKey.value = result.recoveryKey
  } catch (e: any) {
    toast.error(e.response?.data?.message || '设置失败')
  } finally {
    submitting.value = false
  }
}

async function handleLogin() {
  if (!form.value.password) { toast.error('请输入密码'); return }
  submitting.value = true
  try {
    await login(form.value.password)
    router.push('/')
  } catch (e: any) {
    toast.error(e.response?.data?.message || '登录失败')
  } finally {
    submitting.value = false
  }
}

async function handleRecover() {
  if (!recoveryKeyInput.value) { toast.error('请输入恢复密钥'); return }
  submitting.value = true
  try {
    await recover(recoveryKeyInput.value)
    toast.success('密码已重置')
    recoveryKeyInput.value = ''
    initialized.value = false
    hasAdminUser.value = true
    showRecover.value = false
    form.value.password = ''
    form.value.confirmPassword = ''
  } catch (e: any) {
    toast.error(e.response?.data?.message || '恢复失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="page">
    <div v-if="loading" class="card">
      <p class="dim">检查中...</p>
    </div>

    <!-- 设置成功：显示恢复密钥 -->
    <div v-else-if="recoveryKey" class="card">
      <h2>设置成功</h2>
      <p class="hint">请妥善保存恢复密钥，丢失将无法找回。此密钥仅显示一次。</p>
      <div class="key-box">
        <code>{{ recoveryKey }}</code>
      </div>
      <Button @click="router.push('/')">进入后台</Button>
    </div>

    <!-- 恢复密钥重置 -->
    <div v-else-if="showRecover" class="card">
      <h2>忘记密码</h2>
      <p class="hint">输入恢复密钥来重置密码。</p>
      <div class="form">
        <label class="field">
          <span>恢复密钥</span>
          <Input v-model="recoveryKeyInput" placeholder="粘贴恢复密钥" @keyup.enter="handleRecover" />
        </label>
        <Button :loading="submitting" @click="handleRecover">重置密码</Button>
        <button class="link" @click="showRecover = false">返回登录</button>
      </div>
    </div>

    <!-- 首次设置 -->
    <div v-else-if="!initialized" class="card">
      <h2>{{ isFreshSetup() ? '初始化系统' : '重新设置密码' }}</h2>

      <div class="form">
        <template v-if="isFreshSetup()">
          <label class="field">
            <span>昵称</span>
            <Input v-model="form.nickname" placeholder="3qrain" />
          </label>
          <label class="field">
            <span>邮箱</span>
            <Input v-model="form.email" type="email" placeholder="admin@example.com" />
          </label>
        </template>

        <label class="field">
          <span>密码</span>
          <Input v-model="form.password" type="password" placeholder="至少 6 位" />
        </label>
        <label class="field">
          <span>确认密码</span>
          <Input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" @keyup.enter="handleSetup" />
        </label>

        <Button :loading="submitting" @click="handleSetup">
          {{ isFreshSetup() ? '初始化' : '设置密码' }}
        </Button>
      </div>
    </div>

    <!-- 登录 -->
    <div v-else class="card">
      <h2>登录</h2>
      <div class="form">
        <label class="field">
          <span>密码</span>
          <Input v-model="form.password" type="password" placeholder="请输入密码" @keyup.enter="handleLogin" />
        </label>
        <Button :loading="submitting" @click="handleLogin">登录</Button>
        <button class="link" @click="showRecover = true">忘记密码</button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: var(--color-base-100);
}

.card {
  width: 22rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;

  h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }
}

.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  > span {
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.025rem;
    opacity: 0.4;
  }
}

.hint {
  font-size: 0.8125rem;
  opacity: 0.5;
  text-align: center;
  line-height: 1.5;
  margin: 0;
}

.key-box {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: var(--color-base-200);
  text-align: center;
  word-break: break-all;

  code {
    font-size: 0.8125rem;
    font-family: monospace;
    color: var(--color-error);
  }
}

.link {
  border: none;
  background: transparent;
  font-size: 0.75rem;
  color: var(--color-base-content);
  opacity: 0.35;
  cursor: pointer;
  text-align: center;
  transition: opacity 0.15s;

  &:hover { opacity: 0.6; }
}

.dim {
  font-size: 0.875rem;
  opacity: 0.35;
  margin: 0;
}
</style>
