// 开发环境使用本地代理服务器，生产环境可以配置为实际API地址
const API_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://app-go.heytea.com"
    : "http://localhost:3000";

export const HEYTEA_API_BASE = API_BASE_URL;

// 这些配置现在主要用于参考，实际请求头在服务器端设置
export const HEYTEA_HEADER = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 16; 2410DPN6CC Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4433 MMWEBSDK/20220904 Mobile Safari/537.36 MMWEBID/5976 SAAASDK miniProgram Luggage/3.0.2 NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
  Connection: "keep-alive",
  Accept: "application/prs.heytea.v1+json",
  "Accept-Encoding": "gzip",
  "Content-Type": "application/json",
  charset: "utf-8",
  "accept-language": "zh-CN",
  "x-client-version": "4.0.1",
  "current-page": "/pages/login/login_app/index",
  "client-version": "4.0.1",
  version: "4.0.1",
  "gmt-zone": "+08:00",
  "x-region-id": "10",
  "x-client": "app",
  client: "2",
  region: "1",
  "x-version": "4.0.1",
  referer:
    "https://servicewechat.com/wx696a42df4f2456d3/400000137/page-frame.html",
};

export const HEYTEA_UPLOAD_HEADER = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 16; 2410DPN6CC Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.7204.180 Mobile Safari/537.36 XWEB/1380283 MMWEBSDK/20250904 MMWEBID/9130 MicroMessenger/8.0.64.2940(0x28004033) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
  Connection: "keep-alive",
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  "Content-Type": "multipart/form-data",
  charset: "utf-8",
  Referer:
    "https://servicewechat.com/wx696a42df4f2456d3/400000137/page-frame.html",
};

export const CAPTCHA_APP_ID = "197451715";
