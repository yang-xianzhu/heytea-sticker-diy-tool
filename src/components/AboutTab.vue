<template>
    <div class="about-container p-6">
        <h2 class="text-3xl font-bold mb-4 text-center">喜茶自定义杯贴上传工具</h2>

        <div class="version-info mb-6">
            <el-tag type="info">Version {{ version }}</el-tag>
        </div>

        <div class="description mb-6">
            <p class="text-gray-600 text-center">
                一个便捷的Web工具，用于上传自定义杯贴图片到喜茶服务器
            </p>
        </div>

        <el-divider />

        <div class="links mb-6">
            <div class="link-item mb-4">
                <span class="mr-2">项目地址：</span>
                <el-link href="https://github.com/FuQuan233/HeyTea_AutoUpload" target="_blank" type="primary">
                    https://github.com/FuQuan233/HeyTea_AutoUpload
                </el-link>
            </div>
        </div>

        <div class="author-info">
            <p class="text-gray-500 text-sm text-center">© 2025 FuQuan233</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const version = ref('1.0.0')
</script>

<style scoped>
.about-container {
    max-width: 600px;
    margin: 0 auto;
    text-align: center;
}

.version-info {
    display: flex;
    justify-content: center;
}

.description {
    line-height: 1.6;
}

.links {
    text-align: left;
}

.link-item {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
