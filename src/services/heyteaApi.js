import axios from "axios";
import { HEYTEA_API_BASE } from "../utils/apiConfig";
import {
  encryptHeyteaMobile,
  timestampSign,
  decryptResponseData,
} from "../utils/heyteaCryption";

// 判断是否使用代理服务器
const useProxy = HEYTEA_API_BASE.includes("localhost");

/**
 * 发送验证码
 * @param {string} mobile - 手机号
 * @param {string} ticket - 验证码ticket（可选）
 * @param {string} randstr - 验证码randstr（可选）
 * @returns {Promise} API响应
 */
export async function sendVerificationCode(
  mobile,
  ticket = null,
  randstr = null
) {
  const encryptedMobile = encryptHeyteaMobile(mobile);

  if (useProxy) {
    // 使用代理服务器
    const response = await axios.post(
      `${HEYTEA_API_BASE}/api/send-verification-code`,
      {
        mobile: encryptedMobile,
        ticket,
        randstr,
      }
    );
    return response.data;
  } else {
    // 直接请求（可能遇到CORS问题）
    const headers = {
      "Content-Type": "application/json",
    };
    headers["current-page"] = "/pages/login/login_app/index";

    const endpoint = `${HEYTEA_API_BASE}/api/service-member/openapi/vip/user/sms/verifiyCode/send`;

    const requestData = {
      client: "app",
      brandId: "1000001",
      mobile: encryptedMobile,
      zone: "86",
      cryptoLevel: 2,
      ticketFrom: "min",
    };

    if (ticket && randstr) {
      requestData.ticket = ticket;
      requestData.randstr = randstr;
    }

    const response = await axios.post(endpoint, requestData, { headers });
    return response.data;
  }
}

/**
 * 使用短信验证码登录
 * @param {string} mobile - 手机号
 * @param {string} code - 验证码
 * @returns {Promise} API响应
 */
export async function loginWithSms(mobile, code) {
  const encryptedMobile = encryptHeyteaMobile(mobile);

  if (useProxy) {
    // 使用代理服务器
    const response = await axios.post(`${HEYTEA_API_BASE}/api/login-with-sms`, {
      mobile: encryptedMobile,
      code,
    });
    return response.data;
  } else {
    // 直接请求
    const headers = {
      "Content-Type": "application/json",
    };
    headers["current-page"] = "/pages/login/login_app/verify_code/index";

    const endpoint = `${HEYTEA_API_BASE}/api/service-login/openapi/vip/user/login_v1`;

    const response = await axios.post(
      endpoint,
      {
        channel: "A",
        client: "app",
        loginType: "APP_CODE",
        brand: "1000001",
        phone: encryptedMobile,
        email: null,
        smsCode: code,
        zone: "86",
        cryptoLevel: 2,
        ticketFrom: "min",
      },
      { headers }
    );

    return response.data;
  }
}

/**
 * 获取用户信息
 * @param {string} token - 用户token
 * @returns {Promise} 用户信息
 */
export async function getUserInfo(token) {
  if (useProxy) {
    // 使用代理服务器
    const response = await axios.get(`${HEYTEA_API_BASE}/api/user-info`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const resp = response.data;

    if (resp.code === 0 && resp.message === "SUCCESS") {
      const userInfo = resp.data;
      const decryptedData = decryptResponseData(userInfo, true);
      return JSON.parse(decryptedData);
    }

    throw new Error(resp.message || "获取用户信息失败");
  } else {
    // 直接请求
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    headers["current-page"] = "/pages/my/index";

    const endpoint = `${HEYTEA_API_BASE}/api/service-member/vip/user/info`;

    const response = await axios.get(endpoint, { headers });
    const resp = response.data;

    if (resp.code === 0 && resp.message === "SUCCESS") {
      const userInfo = resp.data;
      const decryptedData = decryptResponseData(userInfo, true);
      return JSON.parse(decryptedData);
    }

    throw new Error(resp.message || "获取用户信息失败");
  }
}

/**
 * 上传图片
 * @param {string} token - 用户token
 * @param {number} userMainId - 用户主ID
 * @param {File} file - 图片文件
 * @returns {Promise} API响应
 */
export async function uploadImage(token, userMainId, file) {
  const timestamp = Date.now();
  const sign = timestampSign(userMainId, timestamp);

  if (useProxy) {
    // 使用代理服务器
    const formData = new FormData();
    formData.append("file", file);
    formData.append("width", "596");
    formData.append("height", "832");

    const response = await axios.post(
      `${HEYTEA_API_BASE}/api/upload-image?sign=${sign}&t=${timestamp}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          // 让浏览器自动设置Content-Type
        },
      }
    );
    return response.data;
  } else {
    // 直接请求
    const endpoint = `${HEYTEA_API_BASE}/api/service-cps/user/diy?sign=${sign}&t=${timestamp}`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("width", "596");
    formData.append("height", "832");

    const headers = {
      Authorization: `Bearer ${token}`,
    };
    // 移除Content-Type，让浏览器自动设置
    delete headers["Content-Type"];

    const response = await axios.post(endpoint, formData, { headers });
    return response.data;
  }
}
