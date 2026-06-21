// 未上传完成的tus文件到期时间（milliseconds）

// 后台uppy每次初始化前清除localstorage中过期的tus记录，不要设置太短，不然影响续传功能
export const expireTime_localstorage = 12 * 60 * 60 * 1000; // 12小时
// 后端周期性清理过期的tus文件，不要设置太短，不然影响续传功能
export const expireTime_tus = 12 * 60 * 60 * 1000; // 12小时