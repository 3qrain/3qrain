<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { toast } from 'vue-sonner'
import { User as UserIcon } from '@lucide/vue'

const avatarSrc = '/storage/2026/06/9yazht8d98-original.png'

interface UserInfo {
  id: number
  username: string
  email: string
  avatarUrl: string
  role: 'system' | 'admin' | 'visitor'
}

const user = ref<UserInfo | null>(null)
const showLoginModal = ref(false)
const showProfileModal = ref(false)
const loadingProvider = ref<string | null>(null)
const savingProfile = ref(false)
const profileForm = ref({ username: '', email: '' })

function loginWith(provider: string) {
  loadingProvider.value = provider
  window.location.href = `/api/auth/${provider}`
}

function openProfile() {
  if (!user.value) return
  profileForm.value = { username: user.value.username, email: user.value.email }
  showProfileModal.value = true
}

async function saveProfile() {
  savingProfile.value = true
  try {
    const res = await fetch('/api/user/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileForm.value),
    })
    const json = await res.json()
    if (json.success && json.data) {
      user.value = json.data
      showProfileModal.value = false
      toast.success('已保存')
    } else {
      toast.error(json.message || '保存失败')
    }
  } catch {
    toast.error('网络错误')
  } finally {
    savingProfile.value = false
  }
}

async function fetchUser() {
  try {
    const res = await fetch('/api/user/me')
    const json = await res.json()
    user.value = json.data ?? null
  } catch { /* not logged in */ }
}

async function logout() {
  try {
    await fetch('/api/user/logout', { method: 'POST' })
    user.value = null
    showProfileModal.value = false
  } catch { /* ignore */ }
}

onMounted(fetchUser)
</script>

<template>
  <header class="header">
    <div class="header-inner">
      <NuxtLink to="/" class="brand">
        <img :src="avatarSrc" alt="" class="avatar" />
        <span class="brand-name">3qrain</span>
      </NuxtLink>

      <nav class="nav">
        <NuxtLink to="/posts" class="nav-link">文章</NuxtLink>
        <NuxtLink to="/tags" class="nav-link">标签</NuxtLink>
      </nav>

      <div class="actions">
        <button v-if="user" class="user-trigger" @click="openProfile">
          <img :src="user.avatarUrl" alt="" class="user-avatar" />
        </button>
        <button v-else class="trigger" @click="showLoginModal = true">
          <UserIcon :size="18" :stroke-width="1.5" />
        </button>
      </div>
    </div>
  </header>

  <Teleport to="body">
    <!-- 登录 Modal -->
    <Transition name="modal">
      <div v-if="showLoginModal" class="overlay" @click.self="showLoginModal = false">
        <div class="modal">
          <h3 class="modal-title">选择登录方式</h3>
          <div class="providers">
            <button class="provider" :disabled="!!loadingProvider" @click="loginWith('github')">
              <svg v-if="loadingProvider === 'github'" class="spin" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" opacity="0.2" /><path d="M22 12a10 10 0 0 0-10-10" stroke-linecap="round" /></svg>
              <svg v-else viewBox="0 0 16 16" width="24" height="24" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
              <span>GitHub</span>
            </button>
            <button class="provider" :disabled="!!loadingProvider" @click="loginWith('google')">
              <svg v-if="loadingProvider === 'google'" class="spin" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" opacity="0.2" /><path d="M22 12a10 10 0 0 0-10-10" stroke-linecap="round" /></svg>
              <svg v-else viewBox="0 0 24 24" width="24" height="24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              <span>Google</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 个人资料 Modal -->
    <Transition name="modal">
      <div v-if="showProfileModal && user" class="overlay" @click.self="showProfileModal = false">
        <div class="modal profile-modal">
          <div class="profile-header">
            <img :src="user.avatarUrl" alt="" class="profile-avatar" />
          </div>
          <div class="profile-form">
            <label class="field">
              <span>昵称</span>
              <input v-model="profileForm.username" class="input" />
            </label>
            <label class="field">
              <span>邮箱</span>
              <input v-model="profileForm.email" type="email" class="input" placeholder="用于接收通知" />
            </label>
          </div>
          <div class="profile-actions">
            <button class="btn-logout" @click="logout">退出登录</button>
            <button class="btn-save" :disabled="savingProfile" @click="saveProfile">
              {{ savingProfile ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="less">
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: 4rem;
  display: flex;
  align-items: center;

  &-inner {
    width: 100%;
    max-width: 75rem;
    margin: 0 auto;
    padding: 0 2rem;
    display: flex;
    align-items: center;
  }
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  color: var(--color-base-content);
  flex-shrink: 0;
}

.avatar {
  width: 2.125rem;
  height: 2.125rem;
  border-radius: 50%;
  object-fit: cover;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

  .brand:hover & {
    transform: rotate(20deg);
  }
}

.brand-name {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.nav {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.nav-link {
  position: relative;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-base-content);
  opacity: 0.4;
  text-decoration: none;
  padding: 0.25rem 0;
  transition: opacity 0.25s;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -0.125rem;
    width: 100%;
    height: 0.125rem;
    border-radius: 0.0625rem;
    background: var(--color-primary);
    transform: scaleX(0);
    transform-origin: center;
    transition: transform 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  }

  &:hover { opacity: 0.7; }

  &.router-link-active {
    opacity: 1;

    &::after { transform: scaleX(1); }
  }
}

/* ---- Actions ---- */
.actions {
  flex-shrink: 0;
  width: 2.125rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.trigger,
.user-trigger {
  width: 2.125rem;
  height: 2.125rem;
  border-radius: 50%;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: opacity 0.15s;
}

.trigger {
  color: var(--color-base-content);
  opacity: 0.35;

  &:hover { opacity: 0.7; }
}

.user-avatar {
  width: 2.125rem;
  height: 2.125rem;
  border-radius: 50%;
  object-fit: cover;
}

/* ---- Modal ---- */
.overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgb(0 0 0 / 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal {
  background: var(--color-base-100, #fff);
  border-radius: 1rem;
  padding: 1.75rem 2rem;
  width: 20rem;
  box-shadow: 0 1rem 3rem rgb(0 0 0 / 0.15);
}

.modal-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 1.25rem;
  text-align: center;
}

.providers {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.provider {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 0.625rem;
  border: 0.0625rem solid var(--color-border, #e5e5e5);
  background: transparent;
  color: var(--color-base-content, #333);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.12s;

  &:hover { background: var(--color-base-200, #f5f5f5); }

  &:disabled {
    opacity: 0.35;
    cursor: default;

    &:hover { background: transparent; }
  }
}

/* ---- Profile Modal ---- */
.profile-header {
  display: flex;
  justify-content: center;
  margin-bottom: 1.25rem;
}

.profile-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
}

.profile-form {
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

.input {
  padding: 0.4375rem 0.625rem;
  border-radius: 0.4375rem;
  border: 0.0625rem solid var(--color-border, #e5e5e5);
  background: var(--color-base-100, #fff);
  font-size: 0.8125rem;
  color: var(--color-base-content, #333);
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;

  &:focus { border-color: var(--color-primary, #6366f1); }
}

.profile-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.25rem;
}

.btn-logout {
  border: none;
  background: transparent;
  font-size: 0.75rem;
  color: var(--color-base-content, #333);
  opacity: 0.35;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover { opacity: 0.7; }
}

.btn-save {
  padding: 0.375rem 1rem;
  border-radius: 0.4375rem;
  border: none;
  background: var(--color-primary, #6366f1);
  color: var(--color-primary-content, #fff);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity 0.15s;

  &:hover { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: default; }
}

/* ---- Shared ---- */
.spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;

  .modal { transition: transform 0.2s ease; }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal { transform: scale(0.95); }
}
</style>
