<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <el-container class="container mx-auto py-8">
      <el-header class="text-center mb-6">
        <h1 class="text-4xl font-bold text-gray-800">喜茶自定义杯贴上传工具</h1>
      </el-header>

      <el-main>
        <el-tabs v-model="activeTab" type="border-card" class="max-w-4xl mx-auto">
          <el-tab-pane label="登录" name="login">
            <LoginTab @login-success="handleLoginSuccess" @logout="handleLogout" />
          </el-tab-pane>

          <el-tab-pane label="上传图片" name="upload">
            <UploadTab :is-logged-in="isLoggedIn" :token="token" :user-main-id="userMainId" />
          </el-tab-pane>

          <el-tab-pane label="关于" name="about">
            <AboutTab />
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import LoginTab from './components/LoginTab.vue'
import UploadTab from './components/UploadTab.vue'
import AboutTab from './components/AboutTab.vue'

const activeTab = ref('login')
const isLoggedIn = ref(false)
const token = ref('')
const userMainId = ref(null)

const handleLoginSuccess = ({ token: userToken, userInfo }) => {
  isLoggedIn.value = true
  token.value = userToken
  userMainId.value = userInfo.userMainId
  // 登录成功后切换到上传标签页
  activeTab.value = 'upload'
}

const handleLogout = () => {
  isLoggedIn.value = false
  token.value = ''
  userMainId.value = null
  activeTab.value = 'login'
}
</script>

<style>
#app {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.container {
  max-width: 1200px;
}
</style>
