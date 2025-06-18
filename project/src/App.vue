<script setup lang="ts">
import { ElContainer, ElHeader, ElMain, ElMenu, ElMenuItem } from 'element-plus'
</script>

<template>
  <el-container class="app-container">
    <el-header height="60px">
      <div class="header-content">
        <h1>武汉市"共同缔造"社情民意反映平台</h1>
        <el-menu mode="horizontal" :router="true">
          <el-menu-item index="/">首页</el-menu-item>
          <el-menu-item index="/map">地图</el-menu-item>
          <el-menu-item index="/feedback">民意反馈</el-menu-item>
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
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #409EFF;
}
</style>
