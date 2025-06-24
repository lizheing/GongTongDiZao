<template>
  <div class="admin-panel-container">
    <el-card>
      <template #header>
        <span>管理员后台 - message表管理</span>
        <el-button type="primary" size="small" style="float:right" @click="openAddDialog">新增留言</el-button>
      </template>
      <el-table :data="messageList" border stripe style="width: 100%" height="600px">
        <el-table-column prop="message_id" label="ID" width="80" fixed />
        <el-table-column prop="original_id" label="原始ID" width="100" />
        <el-table-column prop="link_url" label="链接" width="120" />
        <el-table-column prop="user_nickname" label="昵称" width="120" />
        <el-table-column prop="original_message_id" label="原始留言ID" width="120" />
        <el-table-column prop="subject" label="主题" width="180" />
        <el-table-column prop="message_time" label="留言时间" width="160" />
        <el-table-column prop="category" label="类别" width="100" />
        <el-table-column prop="domain" label="领域" width="100" />
        <el-table-column prop="status" label="状态" width="100" />
        <el-table-column prop="location" label="位置" width="120" />
        <el-table-column prop="target_object" label="目标对象" width="120" />
        <el-table-column prop="content" label="内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="reply_id" label="回复ID" width="100" />
        <el-table-column prop="reply_nickname" label="回复人昵称" width="120" />
        <el-table-column prop="reply_organization" label="回复单位" width="120" />
        <el-table-column prop="reply_time" label="回复时间" width="160" />
        <el-table-column prop="reply_content" label="回复内容" min-width="200" show-overflow-tooltip />
        <el-table-column prop="satisfaction" label="满意度" width="100" />
        <el-table-column prop="solution_score" label="解决分" width="80" />
        <el-table-column prop="attitude_score" label="态度分" width="80" />
        <el-table-column prop="speed_score" label="速度分" width="80" />
        <el-table-column prop="wuhan_gid" label="武汉GID" width="100" />
        <el-table-column prop="district_name" label="地区" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteMessage(scope.row.message_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="900px">
      <el-form :model="form" label-width="120px" :rules="rules" ref="formRef" status-icon>
        <el-row :gutter="10">
          <el-col :span="12"><el-form-item label="原始ID" prop="original_id"><el-input v-model="form.original_id" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="链接" prop="link_url"><el-input v-model="form.link_url" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12"><el-form-item label="昵称" prop="user_nickname"><el-input v-model="form.user_nickname" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="原始留言ID" prop="original_message_id"><el-input v-model="form.original_message_id" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12"><el-form-item label="主题" prop="subject"><el-input v-model="form.subject" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="留言时间" prop="message_time"><el-date-picker v-model="form.message_time" type="datetime" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12"><el-form-item label="类别" prop="category"><el-select v-model="form.category" placeholder="请选择类别"><el-option v-for="item in categoryOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="领域" prop="domain"><el-select v-model="form.domain" placeholder="请选择领域"><el-option v-for="item in domainOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12"><el-form-item label="状态" prop="status"><el-select v-model="form.status" placeholder="请选择状态"><el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="位置" prop="location"><el-input v-model="form.location" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12"><el-form-item label="目标对象" prop="target_object"><el-input v-model="form.target_object" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="内容" prop="content"><el-input v-model="form.content" type="textarea" rows="2" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12"><el-form-item label="回复ID" prop="reply_id"><el-input v-model="form.reply_id" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="回复人昵称" prop="reply_nickname"><el-input v-model="form.reply_nickname" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="12"><el-form-item label="回复单位" prop="reply_organization"><el-input v-model="form.reply_organization" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="回复时间" prop="reply_time"><el-date-picker v-model="form.reply_time" type="datetime" style="width:100%" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="回复内容" prop="reply_content"><el-input v-model="form.reply_content" type="textarea" rows="2" /></el-form-item>
        <el-row :gutter="10">
          <el-col :span="8"><el-form-item label="满意度" prop="satisfaction"><el-select v-model="form.satisfaction" placeholder="请选择满意度"><el-option v-for="item in satisfactionOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="解决分" prop="solution_score"><el-input v-model="form.solution_score" type="number" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="态度分" prop="attitude_score"><el-input v-model="form.attitude_score" type="number" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="10">
          <el-col :span="8"><el-form-item label="速度分" prop="speed_score"><el-input v-model="form.speed_score" type="number" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="武汉GID" prop="wuhan_gid"><el-input v-model="form.wuhan_gid" type="number" /></el-form-item></el-col>
          <el-col :span="8"><el-form-item label="地区" prop="district_name"><el-select v-model="form.district_name" placeholder="请选择地区"><el-option v-for="item in districtOptions" :key="item" :label="item" :value="item" /></el-select></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 下拉选项
const categoryOptions = ['投诉/求助', '咨询', '建言']
const domainOptions = ['城建', '就业', '企业', '教育', '交通', '政务', '环保', '治安', '三农', '医疗', '文娱', '金融', '旅游']
const statusOptions = ['已办理', '办理中', '待回复']
const satisfactionOptions = ['满意', '不满意']
const districtOptions = ['江岸区', '江汉区', '硚口区', '汉阳区', '武昌区', '青山区', '洪山区', '东西湖区', '汉南区', '蔡甸区', '江夏区', '黄陂区', '新洲区']

// 数据列表
const messageList = ref([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const form = reactive<any>({})
const formRef = ref()
const rules = {
  user_nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  subject: [{ required: true, message: '请输入主题', trigger: 'blur' }],
  category: [{ required: true, message: '请选择类别', trigger: 'change' }],
  domain: [{ required: true, message: '请选择领域', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  message_time: [{ required: true, message: '请选择留言时间', trigger: 'change' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }],
  satisfaction: [{ required: true, message: '请选择满意度', trigger: 'change' }],
  district_name: [{ required: true, message: '请选择地区', trigger: 'change' }]
}

function openAddDialog() {
  dialogTitle.value = '新增留言'
  Object.assign(form, {
    message_id: undefined,
    original_id: '',
    link_url: '',
    user_nickname: '',
    original_message_id: '',
    subject: '',
    message_time: '',
    category: '',
    domain: '',
    status: '',
    location: '',
    target_object: '',
    content: '',
    reply_id: '',
    reply_nickname: '',
    reply_organization: '',
    reply_time: '',
    reply_content: '',
    satisfaction: '',
    solution_score: '',
    attitude_score: '',
    speed_score: '',
    wuhan_gid: '',
    district_name: ''
  })
  dialogVisible.value = true
}

function openEditDialog(row: any) {
  dialogTitle.value = '编辑留言'
  Object.assign(form, row)
  dialogVisible.value = true
}

function submitForm() {
  formRef.value.validate((valid: boolean) => {
    if (!valid) return
    if (dialogTitle.value === '新增留言') {
      form.message_id = Date.now()
      messageList.value.push({ ...form })
      ElMessage.success('新增成功')
    } else {
      const idx = messageList.value.findIndex((item) => item.message_id === form.message_id)
      if (idx !== -1) {
        messageList.value[idx] = { ...form }
        ElMessage.success('编辑成功')
      }
    }
    dialogVisible.value = false
  })
}

function deleteMessage(id: number) {
  messageList.value = messageList.value.filter(item => item.message_id !== id)
  ElMessage.success('删除成功')
}
</script>

<style scoped>
.admin-panel-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f4f6fa;
}
.el-card {
  width: 100%;
  max-width: 1800px;
}
</style> 