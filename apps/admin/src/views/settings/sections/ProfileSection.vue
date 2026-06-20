<script setup lang="ts">
import { ref, onMounted } from "vue";
import { toast } from "vue-sonner";
import Input from "~/components/base/Input.vue";
import Button from "~/components/base/Button.vue";
import { getConfig, updateConfig } from "~/api/config";
import type { PersonalInfo } from "~/api/config/types";

const loading = ref(true);
const saving = ref(false);
const form = ref<PersonalInfo>({ name: '', email: '', avatar: '', bio: '' });

async function load() {
  loading.value = true;
  try {
    const config = await getConfig();
    form.value = { ...config.personalInfo };
  } catch {
    toast.error("加载失败");
  } finally {
    loading.value = false;
  }
}

async function save() {
  saving.value = true;
  try {
    await updateConfig("personalInfo", form.value);
    toast.success("已保存");
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "保存失败");
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>

<template>
  <div class="section">
    <h2 class="section-title">个人信息</h2>
    <p class="section-desc">管理你的个人资料，这些信息会展示在博客前台。</p>

    <div v-if="loading" class="dim">加载中...</div>
    <div v-else class="form">
      <div class="avatar-row">
        <img
          v-if="form.avatar"
          :src="form.avatar"
          alt="avatar"
          class="avatar-preview"
        />
        <div v-else class="avatar-placeholder">{{ form.name?.[0] || "?" }}</div>
        <div class="avatar-field">
          <label class="field">
            <span>头像 URL</span>
            <Input v-model="form.avatar" placeholder="https://..." />
          </label>
        </div>
      </div>

      <label class="field">
        <span>名称</span>
        <Input v-model="form.name" placeholder="你的名字" />
      </label>

      <label class="field">
        <span>邮箱</span>
        <Input v-model="form.email" type="email" placeholder="email@example.com" />
      </label>

      <label class="field">
        <span>简介</span>
        <textarea
          v-model="form.bio"
          class="textarea"
          rows="3"
          placeholder="一句话介绍自己"
        />
      </label>

      <div class="actions">
        <Button :loading="saving" @click="save">保存</Button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.section {
  max-width: 28rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.section-desc {
  font-size: 0.8125rem;
  opacity: 0.4;
  margin: 0 0 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.avatar-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar-preview {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 0.0625rem solid var(--color-border);
}

.avatar-placeholder {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-base-200);
  font-size: 1.25rem;
  font-weight: 600;
  opacity: 0.5;
}

.avatar-field {
  flex: 1;
  min-width: 0;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;

  > span {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025rem;
    opacity: 0.4;
  }
}

.textarea {
  padding: 0.4375rem 0.625rem;
  border-radius: 0.5rem;
  border: 0.0625rem solid var(--color-border);
  background: var(--color-base-100);
  font-size: 0.8125rem;
  color: var(--color-base-content);
  font-family: inherit;
  outline: none;
  resize: vertical;

  &:focus {
    border-color: var(--color-primary);
  }
}

.actions {
  padding-top: 0.5rem;
}

.dim {
  font-size: 0.875rem;
  opacity: 0.35;
  padding: 2rem 0;
}

@media (max-width: 48rem) {
  .section {
    max-width: 100%;
  }

  .avatar-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .avatar-field {
    width: 100%;
  }
}
</style>
