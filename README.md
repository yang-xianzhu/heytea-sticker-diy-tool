# 喜茶自定义杯贴上传工具 (Vue 版本)

一个基于 Vue 3 的 Web 应用，用于上传自定义杯贴图片到喜茶服务器。

## 功能特性

- ✅ 短信验证码登录（支持人机验证）
- ✅ Token 直接登录
- ✅ 记住登录信息（本地存储）
- ✅ 图片上传（支持 596x832 PNG 格式）
- ✅ 图片预览
- ✅ 响应式 UI（使用 Element Plus 和 Tailwind CSS）
- ✅ 代理服务器解决 CORS 跨域问题

## 技术栈

- **前端**: Vue 3 + Vite
- **UI 组件**: Element Plus
- **样式**: Tailwind CSS
- **HTTP 请求**: Axios
- **加密**: crypto-js
- **后端代理**: Express.js (Node.js)

## 安装依赖

```bash
pnpm install
# 或
npm install
```

## 运行项目

### 方式一：同时启动前端和代理服务器（推荐）

```bash
pnpm dev:all
# 或
npm run dev:all
```

这将同时启动：

- 代理服务器：http://localhost:3000
- 前端开发服务器：http://localhost:5173

### 方式二：分别启动

1. 启动代理服务器：

```bash
pnpm server
# 或
npm run server
```

2. 启动前端开发服务器（新开一个终端）：

```bash
pnpm dev
# 或
npm run dev
```

## 使用说明

1. 打开浏览器访问 http://localhost:5173
2. 在"登录"标签页中：
   - 输入手机号获取验证码（可能需要完成人机验证）
   - 输入收到的验证码进行登录
   - 或直接使用 Token 登录
3. 登录成功后，切换到"上传图片"标签页
4. 选择 596x832 尺寸的 PNG 图片
5. 点击"上传图片"按钮

## 项目结构

```
hey-tea-vue/
├── server.js              # Node.js 代理服务器
├── src/
│   ├── components/         # Vue 组件
│   │   ├── LoginTab.vue    # 登录组件
│   │   ├── UploadTab.vue   # 上传组件
│   │   └── AboutTab.vue    # 关于组件
│   ├── services/           # API 服务
│   │   └── heyteaApi.js    # API 调用封装
│   ├── utils/              # 工具函数
│   │   ├── apiConfig.js    # API 配置
│   │   ├── heyteaCryption.js # 加密/解密工具
│   │   └── storage.js      # 本地存储工具
│   ├── App.vue             # 主应用组件
│   └── main.js             # 入口文件
└── package.json
```

## 注意事项

1. **CORS 跨域问题**：由于浏览器的同源策略，直接从前端访问喜茶 API 会遇到 CORS 问题。本项目使用 Node.js 代理服务器来解决这个问题。

2. **代理服务器**：代理服务器运行在 `http://localhost:3000`，前端会自动检测并使用代理服务器。

3. **图片格式**：只支持 PNG 格式，且尺寸必须为 596x832 像素。

4. **验证码冷却**：获取验证码后需要等待 120 秒才能再次获取。

## 构建生产版本

```bash
pnpm build
# 或
npm run build
```

构建后的文件在 `dist` 目录中。

## 许可证

MIT
