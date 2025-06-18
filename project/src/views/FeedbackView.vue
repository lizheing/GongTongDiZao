<template>
  <div class="feedback-container">
    <el-card class="feedback-form">
      <template #header>
        <div class="card-header">
          <h2>民意反馈</h2>
        </div>
      </template>
      
      <el-form :model="feedbackForm" label-width="100px">
        <el-form-item label="标题">
          <el-input v-model="feedbackForm.title" placeholder="请输入反馈标题"></el-input>
        </el-form-item>
        
        <el-form-item label="类型">
          <el-select v-model="feedbackForm.type" placeholder="请选择反馈类型">
            <el-option label="基础设施" value="infrastructure"></el-option>
            <el-option label="环境问题" value="environment"></el-option>
            <el-option label="公共服务" value="public_service"></el-option>
            <el-option label="其他" value="other"></el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="位置">
          <el-input v-model="feedbackForm.location" placeholder="请输入具体位置"></el-input>
        </el-form-item>
        
        <el-form-item label="详细描述">
          <el-input
            v-model="feedbackForm.description"
            type="textarea"
            rows="4"
            placeholder="请详细描述您的问题或建议"
          ></el-input>
        </el-form-item>
        
        <el-form-item label="联系方式">
          <el-input v-model="feedbackForm.contact" placeholder="请输入您的联系方式"></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitFeedback">提交反馈</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'

const feedbackForm = reactive({
  title: '',
  type: '',
  location: '',
  description: '',
  contact: ''
})

const submitFeedback = () => {
  // TODO: 实现提交逻辑
  ElMessage.success('反馈提交成功！')
  resetForm()
}

const resetForm = () => {
  feedbackForm.title = ''
  feedbackForm.type = ''
  feedbackForm.location = ''
  feedbackForm.description = ''
  feedbackForm.contact = ''
}
</script>

<style scoped>
.feedback-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.feedback-form {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

h2 {
  margin: 0;
  color: #409EFF;
}
</style> 