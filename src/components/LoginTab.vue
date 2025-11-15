<template>
    <div class="login-container p-6">
        <h2 class="text-2xl font-bold mb-6 text-center">喜茶登录</h2>

        <!-- 短信验证码登录 -->
        <el-card class="mb-4" shadow="hover">
            <template #header>
                <span class="font-semibold">短信验证码登录</span>
            </template>

            <el-form :model="smsForm" label-width="80px">
                <el-form-item label="手机号">
                    <el-input v-model="smsForm.mobile" placeholder="请输入手机号" maxlength="11" class="w-full" />
                </el-form-item>

                <el-form-item label="验证码">
                    <div class="flex gap-2">
                        <el-input v-model="smsForm.code" placeholder="请输入验证码" maxlength="6" class="flex-1" />
                        <el-button :disabled="cooldownSeconds > 0" @click="getVerificationCode" :loading="sendingCode">
                            {{ cooldownSeconds > 0 ? `重新获取(${cooldownSeconds}s)` : '获取验证码' }}
                        </el-button>
                    </div>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="loginWithSms" :loading="logging" class="w-full">
                        登录
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <el-divider />

        <!-- Token登录 -->
        <el-card class="mb-4" shadow="hover">
            <template #header>
                <span class="font-semibold">Token登录</span>
            </template>

            <el-form :model="tokenForm" label-width="80px">
                <el-form-item label="Token">
                    <el-input v-model="tokenForm.token" type="textarea" :rows="3" placeholder="请输入Token"
                        class="w-full" />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="loginWithToken" :loading="logging" class="w-full">
                        使用Token登录
                    </el-button>
                </el-form-item>
            </el-form>
        </el-card>

        <!-- 记住登录信息 -->
        <div class="mb-4">
            <el-checkbox v-model="rememberLogin">记住登录信息</el-checkbox>
        </div>

        <!-- 状态显示 -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
                <el-tag :type="isLoggedIn ? 'success' : 'danger'">
                    {{ isLoggedIn ? `已登录 ${userInfo.nickname} (${userInfo.userMainId})` : '未登录' }}
                </el-tag>
            </div>

            <el-button v-if="isLoggedIn" @click="handleLogout" type="danger" plain>
                退出登录
            </el-button>
        </div>

        <!-- 验证码对话框 -->
        <el-dialog v-model="showCaptchaDialog" title="人机验证" width="500px" :close-on-click-modal="false"
            :close-on-press-escape="false" @closed="handleCaptchaDialogClosed">
            <div class="captcha-container">
                <p class="mb-4 text-gray-600">为了保护您的账号安全，请完成以下验证</p>
                <p class="text-sm text-gray-500 mb-4">点击下方按钮开始验证</p>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { sendVerificationCode, loginWithSms as loginWithSmsApi, getUserInfo } from '../services/heyteaApi'
import { saveConfig, loadConfig, removeConfig } from '../utils/storage'
import { CAPTCHA_APP_ID } from '../utils/apiConfig'

const emit = defineEmits(['login-success', 'logout'])

const smsForm = ref({
    mobile: '',
    code: ''
})

const tokenForm = ref({
    token: ''
})

const rememberLogin = ref(true)
const sendingCode = ref(false)
const logging = ref(false)
const cooldownSeconds = ref(0)
const cooldownTimer = ref(null)

const userInfo = ref({
    nickname: '',
    userMainId: null
})

const showCaptchaDialog = ref(false)
const captchaInstance = ref(null)
const currentMobile = ref('')
const captchaTicket = ref(null)
const captchaRandstr = ref(null)

const isLoggedIn = computed(() => !!userInfo.value.userMainId)

// 加载验证码脚本
const loadCaptchaScript = () => {
    return new Promise((resolve, reject) => {
        if (window.TencentCaptcha) {
            resolve()
            return
        }

        const script = document.createElement('script')
        script.src = 'https://turing.captcha.qcloud.com/TJCaptcha.js'
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
    })
}

// 显示验证码
const showCaptcha = async () => {
    try {
        await loadCaptchaScript()

        if (!captchaInstance.value) {
            captchaInstance.value = new window.TencentCaptcha(
                CAPTCHA_APP_ID,
                (res) => {
                    if (res.ret === 0) {
                        captchaTicket.value = res.ticket
                        captchaRandstr.value = res.randstr
                        showCaptchaDialog.value = false
                        // 验证成功后重新发送验证码
                        handleSendVerificationCode(currentMobile.value, res.ticket, res.randstr)
                    } else if (res.ret === 2) {
                        showCaptchaDialog.value = false
                        ElMessage.warning('已取消验证')
                    } else {
                        ElMessage.error('验证失败: ' + (res.errorMessage || '未知错误'))
                    }
                },
                {
                    userLanguage: 'zh-cn'
                }
            )
        }

        showCaptchaDialog.value = true
        // 等待对话框打开后再显示验证码
        setTimeout(() => {
            captchaInstance.value?.show()
        }, 100)
    } catch (error) {
        console.error('加载验证码失败:', error)
        ElMessage.error('验证码加载失败，请检查网络连接')
        showCaptchaDialog.value = false
    }
}

// 验证码对话框关闭处理
const handleCaptchaDialogClosed = () => {
    // 对话框关闭时的处理
}

// 获取验证码
const getVerificationCode = async () => {
    if (cooldownSeconds.value > 0) {
        ElMessage.warning(`请等待 ${cooldownSeconds.value} 秒后再试`)
        return
    }

    const mobile = smsForm.value.mobile.trim()
    if (!mobile) {
        ElMessage.error('请输入手机号')
        return
    }

    if (mobile.length !== 11) {
        ElMessage.error('请输入正确的手机号')
        return
    }

    currentMobile.value = mobile
    startCooldown()
    await handleSendVerificationCode(mobile)
}

// 发送验证码
const handleSendVerificationCode = async (mobile, ticket = null, randstr = null) => {
    sendingCode.value = true
    try {
        const resp = await sendVerificationCode(mobile, ticket, randstr)

        // 检查是否需要人机验证
        if (resp.code === 4005021) {
            ElMessage.info('需要进行人机验证')
            await showCaptcha()
            return
        }

        // 检查其他错误
        if (resp.code !== 0 || resp.message !== 'SUCCESS') {
            throw new Error(resp.message || '未知错误')
        }

        ElMessage.success('验证码已发送')
    } catch (error) {
        ElMessage.error('发送验证码失败: ' + error.message)
    } finally {
        sendingCode.value = false
    }
}

// 开始冷却倒计时
const startCooldown = () => {
    cooldownSeconds.value = 120
    updateCooldownButton()
}

// 更新冷却按钮
const updateCooldownButton = () => {
    if (cooldownSeconds.value > 0) {
        cooldownSeconds.value--
        cooldownTimer.value = setTimeout(updateCooldownButton, 1000)
    } else {
        if (cooldownTimer.value) {
            clearTimeout(cooldownTimer.value)
            cooldownTimer.value = null
        }
    }
}

// 短信验证码登录
const loginWithSms = async () => {
    const mobile = smsForm.value.mobile.trim()
    const code = smsForm.value.code.trim()

    if (!mobile || !code) {
        ElMessage.error('请输入手机号和验证码')
        return
    }

    logging.value = true
    try {
        const resp = await loginWithSmsApi(mobile, code)

        if (resp.code !== 0 || resp.message !== 'SUCCESS') {
            throw new Error(resp.message || '未知错误')
        }

        const token = resp.data?.token
        if (!token) {
            throw new Error('登录失败，未获取到token')
        }

        await handleLoginSuccess(token)
    } catch (error) {
        ElMessage.error('登录失败: ' + error.message)
    } finally {
        logging.value = false
    }
}

// Token登录
const loginWithToken = async () => {
    const token = tokenForm.value.token.trim()

    if (!token) {
        ElMessage.error('请输入Token')
        return
    }

    await handleLoginSuccess(token)
}

// 登录成功处理
const handleLoginSuccess = async (token) => {
    logging.value = true
    try {
        const info = await getUserInfo(token)

        userInfo.value = {
            nickname: info.name,
            userMainId: info.user_main_id
        }

        // 保存配置
        if (rememberLogin.value) {
            saveConfig({ token })
        } else {
            removeConfig()
        }

        emit('login-success', { token, userInfo: userInfo.value })
        ElMessage.success('登录成功！')
    } catch (error) {
        ElMessage.error('获取用户信息失败: ' + error.message)
    } finally {
        logging.value = false
    }
}

// 退出登录
const handleLogout = async () => {
    try {
        await ElMessageBox.confirm('确定要退出登录吗？', '确认', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })

        userInfo.value = {
            nickname: '',
            userMainId: null
        }

        smsForm.value = {
            mobile: '',
            code: ''
        }

        tokenForm.value = {
            token: ''
        }

        removeConfig()
        emit('logout')
        ElMessage.success('已退出登录')
    } catch {
        // 用户取消
    }
}

// 加载保存的配置
const loadSavedConfig = async () => {
    const config = loadConfig()
    if (config && config.token) {
        tokenForm.value.token = config.token
        rememberLogin.value = true
        await handleLoginSuccess(config.token)
    }
}

onMounted(() => {
    loadSavedConfig()
})

onUnmounted(() => {
    if (cooldownTimer.value) {
        clearTimeout(cooldownTimer.value)
    }
})
</script>

<style scoped>
.login-container {
    max-width: 600px;
    margin: 0 auto;
}

.captcha-container {
    text-align: center;
    padding: 20px;
}
</style>
