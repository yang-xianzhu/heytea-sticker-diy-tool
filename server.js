import express from "express";
import cors from "cors";
import axios from "axios";
import multer from "multer";
import FormData from "form-data";

const app = express();
const PORT = 3000;

// 启用CORS
app.use(cors());
app.use(express.json());

// 配置multer用于处理文件上传
const upload = multer({ storage: multer.memoryStorage() });

// 喜茶API基础地址
const HEYTEA_API_BASE = "https://app-go.heytea.com";

// 通用请求头
const HEYTEA_HEADER = {
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

const HEYTEA_UPLOAD_HEADER = {
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 16; 2410DPN6CC Build/BP2A.250605.031.A3; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/138.0.7204.180 Mobile Safari/537.36 XWEB/1380283 MMWEBSDK/20250904 MMWEBID/9130 MicroMessenger/8.0.64.2940(0x28004033) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64 MiniProgramEnv/android",
  Connection: "keep-alive",
  Accept: "*/*",
  "Accept-Encoding": "gzip, deflate, br",
  charset: "utf-8",
  Referer:
    "https://servicewechat.com/wx696a42df4f2456d3/400000137/page-frame.html",
};

// 发送验证码
app.post("/api/send-verification-code", async (req, res) => {
  try {
    const { mobile, ticket, randstr } = req.body;

    const headers = { ...HEYTEA_HEADER };
    headers["current-page"] = "/pages/login/login_app/index";

    const endpoint = `${HEYTEA_API_BASE}/api/service-member/openapi/vip/user/sms/verifiyCode/send`;

    const requestData = {
      client: "app",
      brandId: "1000001",
      mobile: mobile,
      zone: "86",
      cryptoLevel: 2,
      ticketFrom: "min",
    };

    if (ticket && randstr) {
      requestData.ticket = ticket;
      requestData.randstr = randstr;
    }

    const response = await axios.post(endpoint, requestData, { headers });
    res.json(response.data);
  } catch (error) {
    console.error("发送验证码错误:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      code: error.response?.data?.code || -1,
      message: error.response?.data?.message || error.message,
    });
  }
});

// 短信验证码登录
app.post("/api/login-with-sms", async (req, res) => {
  try {
    const { mobile, code } = req.body;

    const headers = { ...HEYTEA_HEADER };
    headers["current-page"] = "/pages/login/login_app/verify_code/index";

    const endpoint = `${HEYTEA_API_BASE}/api/service-login/openapi/vip/user/login_v1`;

    const response = await axios.post(
      endpoint,
      {
        channel: "A",
        client: "app",
        loginType: "APP_CODE",
        brand: "1000001",
        phone: mobile,
        email: null,
        smsCode: code,
        zone: "86",
        cryptoLevel: 2,
        ticketFrom: "min",
      },
      { headers }
    );

    res.json(response.data);
  } catch (error) {
    console.error("登录错误:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      code: error.response?.data?.code || -1,
      message: error.response?.data?.message || error.message,
    });
  }
});

// 获取用户信息
app.get("/api/user-info", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ code: -1, message: "未提供token" });
    }

    const headers = { ...HEYTEA_HEADER };
    headers["authorization"] = `Bearer ${token}`;
    headers["current-page"] = "/pages/my/index";

    const endpoint = `${HEYTEA_API_BASE}/api/service-member/vip/user/info`;

    const response = await axios.get(endpoint, { headers });
    res.json(response.data);
  } catch (error) {
    console.error("获取用户信息错误:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      code: error.response?.data?.code || -1,
      message: error.response?.data?.message || error.message,
    });
  }
});

// 上传图片
app.post("/api/upload-image", upload.single("file"), async (req, res) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    const { sign, t } = req.query;
    const { width, height } = req.body;

    if (!token) {
      return res.status(401).json({ code: -1, message: "未提供token" });
    }

    if (!req.file) {
      return res.status(400).json({ code: -1, message: "未提供文件" });
    }

    const endpoint = `${HEYTEA_API_BASE}/api/service-cps/user/diy?sign=${sign}&t=${t}`;

    const headers = { ...HEYTEA_UPLOAD_HEADER };
    headers["Authorization"] = `Bearer ${token}`;

    // 使用FormData格式
    const formData = new FormData();
    formData.append("file", req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append("width", width || "596");
    formData.append("height", height || "832");

    const response = await axios.post(endpoint, formData, {
      headers: {
        ...headers,
        ...formData.getHeaders(),
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error("上传图片错误:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      code: error.response?.data?.code || -1,
      message: error.response?.data?.message || error.message,
    });
  }
});

// 健康检查
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`代理服务器运行在 http://localhost:${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
});
