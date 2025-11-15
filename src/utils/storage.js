const CONFIG_KEY = "heytea_config";

/**
 * 保存配置到本地存储
 * @param {Object} config - 配置对象
 */
export function saveConfig(config) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("保存配置失败:", error);
  }
}

/**
 * 从本地存储加载配置
 * @returns {Object|null} 配置对象，失败返回null
 */
export function loadConfig() {
  try {
    const configStr = localStorage.getItem(CONFIG_KEY);
    if (configStr) {
      return JSON.parse(configStr);
    }
  } catch (error) {
    console.error("加载配置失败:", error);
  }
  return null;
}

/**
 * 删除配置
 */
export function removeConfig() {
  try {
    localStorage.removeItem(CONFIG_KEY);
  } catch (error) {
    console.error("删除配置失败:", error);
  }
}
