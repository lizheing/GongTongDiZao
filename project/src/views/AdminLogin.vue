<template>
  <div class="admin-login-container">
    <el-card class="admin-login-card">
      <template #header>
        <span>管理员登录</span>
      </template>
      <el-form :model="form" class="admin-login-form">
        <el-form-item label="账号">
          <el-input v-model="form.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="login">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const form = ref({ username: '', password: '' })
const login = () => {
  // 这里只做前端跳转，后续可接入后端API
  if (form.value.username && form.value.password) {
    router.push('/admin')
  }
}
</script>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f6fa;
}
.admin-login-card {
  width: 350px;
}
.admin-login-form {
  margin-top: 20px;
}
</style> 