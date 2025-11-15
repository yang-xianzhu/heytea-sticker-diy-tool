import CryptoJS from "crypto-js";

/**
 * 按喜茶的方式加密手机号码
 * @param {string} mobile - 手机号码字符串
 * @returns {string|null} 加密后的Base64字符串，失败返回null
 */
export function encryptHeyteaMobile(mobile) {
  try {
    // 喜茶的固定密钥和IV
    const key = CryptoJS.enc.Utf8.parse("23290CFFBB5D39B8");
    const iv = CryptoJS.enc.Utf8.parse("HEYTEA1A2B3C4D5E");

    // AES-CBC加密
    const encrypted = CryptoJS.AES.encrypt(mobile, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Base64编码
    return encrypted.toString();
  } catch (error) {
    console.error("加密失败:", error);
    return null;
  }
}

/**
 * 生成时间戳签名
 * @param {number} userMainId - 用户主ID
 * @param {number} timestamp - 时间戳（毫秒）
 * @returns {string} 签名字符串
 */
export function timestampSign(userMainId, timestamp) {
  const salt = "r5YWPjgSGAT2dbOJzwiDBK";
  const signStr = `${salt}${userMainId}${timestamp}`;

  return CryptoJS.MD5(signStr).toString();
}

/**
 * 解密服务器响应数据
 * @param {string} encryptedResponse - 带前缀的加密响应数据
 * @param {boolean} isApp - 是否为APP版本 (默认为小程序版本)
 * @returns {string|null} 解密后的JSON字符串
 */
export function decryptResponseData(encryptedResponse, isApp = false) {
  const encryptionPrefix = "HEYTEA_ENCRYPTION_TRANSMISSION";
  const iv = CryptoJS.enc.Utf8.parse("HEYTEA1A2B3C4D5E");

  // 响应数据解密的密钥 (根据平台不同)
  const responseKeyApp = CryptoJS.enc.Utf8.parse("F61niK84bDQAsVHy"); // APP版本
  const responseKeyWeapp = CryptoJS.enc.Utf8.parse("ByOCfgNpMRKtwWhJ"); // 小程序版本

  try {
    // 检查是否有加密前缀
    if (!encryptedResponse.startsWith(encryptionPrefix)) {
      return encryptedResponse; // 未加密，直接返回
    }

    // 去除前缀
    const encryptedData = encryptedResponse.substring(encryptionPrefix.length);

    // 选择对应的密钥
    const responseKey = isApp ? responseKeyApp : responseKeyWeapp;

    // Base64解码并解密
    const decrypted = CryptoJS.AES.decrypt(encryptedData, responseKey, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    // 转换为字符串
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("响应数据解密失败:", error);
    return null;
  }
}
