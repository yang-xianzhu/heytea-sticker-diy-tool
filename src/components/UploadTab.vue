<template>
    <div class="upload-container p-6">
        <h2 class="text-2xl font-bold mb-6 text-center">上传自定义杯贴</h2>

        <!-- 图片预览区域 -->
        <el-card class="mb-4" shadow="hover">
            <template #header>
                <span class="font-semibold">图片预览</span>
            </template>

            <div class="preview-area">
                <div v-if="previewUrl" class="preview-image-container">
                    <img :src="previewUrl" alt="预览图片" class="preview-image" />
                </div>
                <div v-else class="preview-placeholder">
                    <el-icon :size="48" class="text-gray-400">
                        <Picture />
                    </el-icon>
                    <p class="text-gray-400 mt-2">未选择图片</p>
                </div>
            </div>
        </el-card>

        <!-- 按钮区域 -->
        <div class="button-area mb-4">
            <el-button @click="selectImage" :disabled="!isLoggedIn">
                选择图片
            </el-button>
            <el-button type="primary" @click="uploadImageHandler" :disabled="!isLoggedIn || !selectedFile || uploading"
                :loading="uploading">
                上传图片
            </el-button>
        </div>

        <!-- 图片处理工具链接 -->
        <div class="link-area mb-4">
            <el-link href="https://power888777.github.io/heyteapng/" target="_blank" type="primary">
                点击打开图片处理工具
            </el-link>
        </div>

        <!-- 上传状态 -->
        <div v-if="uploadStatus" class="upload-status">
            <el-alert :title="uploadStatus" :type="uploadStatusType" :closable="false" show-icon />
        </div>

        <!-- 隐藏的文件输入 -->
        <input ref="fileInput" type="file" accept=".png" style="display: none" @change="handleFileSelect" />
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { uploadImage as uploadImageApi } from '../services/heyteaApi'

const props = defineProps({
    isLoggedIn: {
        type: Boolean,
        default: false
    },
    token: {
        type: String,
        default: ''
    },
    userMainId: {
        type: Number,
        default: null
    }
})

const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref('')
const uploading = ref(false)
const uploadStatus = ref('')
const uploadStatusType = ref('info')

// 选择图片
const selectImage = () => {
    if (!props.isLoggedIn) {
        ElMessage.warning('请先登录')
        return
    }
    fileInput.value?.click()
}

// 处理文件选择
const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (!file) return

    // 检查文件格式
    if (!file.name.toLowerCase().endsWith('.png')) {
        ElMessage.error('只支持PNG格式的图片！')
        return
    }

    // 检查图片尺寸
    const img = new Image()
    img.onload = () => {
        if (img.width !== 596 || img.height !== 832) {
            ElMessage.error(`当前图片尺寸为 ${img.width}x${img.height}\n必须使用 596x832 尺寸的图片！`)
            return
        }

        // 尺寸正确，保存文件并显示预览
        selectedFile.value = file
        previewUrl.value = URL.createObjectURL(file)
    }

    img.onerror = () => {
        ElMessage.error('无法读取图片')
    }

    img.src = URL.createObjectURL(file)
}

// 上传图片
const uploadImageHandler = async () => {
    if (!props.isLoggedIn) {
        ElMessage.error('请先登录')
        return
    }

    if (!selectedFile.value) {
        ElMessage.error('请先选择图片')
        return
    }

    if (!props.token || !props.userMainId) {
        ElMessage.error('登录信息不完整')
        return
    }

    uploading.value = true
    uploadStatus.value = '上传中...'
    uploadStatusType.value = 'info'

    try {
        const resp = await uploadImageApi(props.token, props.userMainId, selectedFile.value)

        if (resp.code !== 0 || resp.message !== 'SUCCESS') {
            throw new Error(resp.message || '未知错误')
        }

        uploadStatus.value = '上传成功！'
        uploadStatusType.value = 'success'
        ElMessage.success('图片上传成功！')
    } catch (error) {
        uploadStatus.value = '上传失败'
        uploadStatusType.value = 'error'
        ElMessage.error('上传失败: ' + error.message)
    } finally {
        uploading.value = false
    }
}

// 暴露方法给父组件
defineExpose({
    uploadImage: uploadImageHandler
})
</script>

<style scoped>
.upload-container {
    max-width: 600px;
    margin: 0 auto;
}

.preview-area {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    border-radius: 8px;
    padding: 20px;
}

.preview-image-container {
    max-width: 100%;
    max-height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.preview-image {
    max-width: 100%;
    max-height: 400px;
    object-fit: contain;
    border-radius: 8px;
}

.preview-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #999;
}

.button-area {
    display: flex;
    gap: 10px;
    justify-content: center;
}

.link-area {
    text-align: center;
}

.upload-status {
    margin-top: 20px;
}
</style>
