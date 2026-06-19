<script setup lang="ts">
import { ref } from "vue";
import { toast } from "vue-sonner";
import Input from "~/components/base/Input.vue";
import Button from "~/components/base/Button.vue";
import { changePassword } from "~/api/account";

const saving = ref(false);
const form = ref({ oldPassword: "", newPassword: "", confirmPassword: "" });

function reset() {
  form.value = { oldPassword: "", newPassword: "", confirmPassword: "" };
}

async function submit() {
  const { oldPassword, newPassword, confirmPassword } = form.value;

  if (!oldPassword || !newPassword) {
    toast.error("请填写完整");
    return;
  }
  if (newPassword !== confirmPassword) {
    toast.error("两次密码不一致");
    return;
  }

  saving.value = true;
  try {
    await changePassword({ oldPassword, newPassword });
    toast.success("密码已修改，即将重新登录");
    reset();
  } catch (e: any) {
    toast.error(e?.response?.data?.message || "修改失败");
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <div class="section">
    <h2 class="section-title">安全</h2>
    <p class="section-desc">修改密码后所有设备会被强制下线。</p>

    <div class="form">
      <label class="field">
        <span>当前密码</span>
        <Input v-model="form.oldPassword" type="password" placeholder="输入当前密码" />
      </label>

      <label class="field">
        <span>新密码</span>
        <Input v-model="form.newPassword" type="password" placeholder="输入新密码" />
      </label>

      <label class="field">
        <span>确认新密码</span>
        <Input v-model="form.confirmPassword" type="password" placeholder="再次输入新密码" />
      </label>

      <div class="actions">
        <Button variant="danger" :loading="saving" @click="submit">修改密码</Button>
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

.actions {
  padding-top: 0.5rem;
}

@media (max-width: 48rem) {
  .section {
    max-width: 100%;
  }
}
</style>
