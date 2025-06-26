<script setup lang="ts">
import { ElContainer, ElHeader, ElMain, ElMenu, ElMenuItem, ElButton } from 'element-plus'
import { ref, watchEffect, onMounted } from 'vue'

const handleFeedback = () => {
  window.open('https://liuyan.people.com.cn/pro-dfbbs-front/index', '_blank')
}

const isDark = ref(false)

// 读取本地存储
onMounted(() => {
  const saved = localStorage.getItem('theme')
  if (saved) isDark.value = saved === 'dark'
})

watchEffect(() => {
  if (isDark.value) {
    document.body.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.body.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
})
</script>

<template>
  <el-container class="app-container">
    <el-header height="60px">
      <div class="header-content">
        <h1>武汉市"共同缔造"社情民意反映平台</h1>
        <div class="nav-group">
        <el-menu mode="horizontal" :router="true">
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/map">地图</el-menu-item>
          <el-menu-item index="#" @click="handleFeedback">民意反馈</el-menu-item>
          <el-menu-item index="/admin-login">管理员登陆</el-menu-item>
        </el-menu>
          <el-button @click="isDark = !isDark" circle :icon="isDark ? 'Sunny' : 'Moon'" style="margin-left: 16px;">
            <template #icon>
              <el-icon v-if="isDark"><Sunny /></el-icon>
              <el-icon v-else><Moon /></el-icon>
            </template>
          </el-button>
        </div>
      </div>
    </el-header>
    
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<style scoped>
.app-container {
  width: 100vw;
  /* height: 100vh; */
  /* overflow: hidden; */
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
  max-width: 1920px;
  margin: 0 auto;
}

.nav-group {
  display: flex;
  align-items: center;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #409EFF;
  white-space: nowrap;
  font-weight: bold;
}

:deep(.el-menu--horizontal .el-menu-item) {
  font-weight: bold;
}

:deep(.el-menu--horizontal .el-menu-item) {
  transition: color 0.2s, background 0.2s;
}

:deep(.dark .el-menu--horizontal .el-menu-item),
:deep(body.dark .el-menu--horizontal .el-menu-item) {
  color: #fff !important;
  font-weight: bold;
}

:deep(.dark .el-menu--horizontal),
:deep(body.dark .el-menu--horizontal) {
  background: #232323 !important;
}

:deep(.el-main) {
  padding: 0;
  /* height: calc(100vh - 60px); */
  /* overflow: hidden; */
}

:deep(.el-header) {
  padding: 0;
  height: 60px !important;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.el-button {
  vertical-align: middle;
}
</style>
