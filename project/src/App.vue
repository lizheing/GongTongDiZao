<script setup lang="ts">
import { ElContainer, ElHeader, ElMain, ElMenu, ElMenuItem } from 'element-plus'

const handleFeedback = () => {
  window.open('https://liuyan.people.com.cn/pro-dfbbs-front/index', '_blank')
}
</script>

<template>
  <el-container class="app-container">
    <el-header height="60px">
      <div class="header-content">
        <h1>武汉市"共同缔造"社情民意反映平台</h1>
        <el-menu mode="horizontal" :router="true">
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/map">地图</el-menu-item>
          <el-menu-item index="#" @click="handleFeedback">民意反馈</el-menu-item>
        </el-menu>
      </div>
    </el-header>
    
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
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

h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #409EFF;
  white-space: nowrap;
}

:deep(.el-main) {
  padding: 0;
  height: calc(100vh - 60px);
  overflow: hidden;
}

:deep(.el-header) {
  padding: 0;
  height: 60px !important;
  background-color: #fff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}
</style>
