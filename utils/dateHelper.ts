/**
 * 日期工具函数
 * 统一处理前端和后端的日期格式转换
 */

/**
 * 将 JavaScript 的 getDay() 结果（0-6，周日到周六）
 * 转换为后端格式（1-7，周一到周日）
 * 
 * @param jsDay - JavaScript Date.getDay() 返回值 (0=周日, 1=周一, ..., 6=周六)
 * @returns 后端格式的星期值 (1=周一, 2=周二, ..., 7=周日)
 * 
 * @example
 * const today = new Date().getDay(); // 假设今天是周日，返回 0
 * const backendDay = jsToBackendDay(today); // 返回 7
 */
export function jsToBackendDay(jsDay: number): number {
  return jsDay === 0 ? 7 : jsDay;
}

/**
 * 将后端格式（1-7，周一到周日）
 * 转换为 JavaScript 的 getDay() 格式（0-6，周日到周六）
 * 
 * @param backendDay - 后端格式的星期值 (1=周一, 2=周二, ..., 7=周日)
 * @returns JavaScript Date.getDay() 格式 (0=周日, 1=周一, ..., 6=周六)
 * 
 * @example
 * const backendDay = 7; // 周日
 * const jsDay = backendToJsDay(backendDay); // 返回 0
 */
export function backendToJsDay(backendDay: number): number {
  return backendDay === 7 ? 0 : backendDay;
}

/**
 * 获取今天对应的后端格式星期值
 * 
 * @returns 后端格式的今天星期值 (1-7)
 * 
 * @example
 * const today = getTodayBackendDay(); // 假设今天是周一，返回 1
 */
export function getTodayBackendDay(): number {
  const today = new Date().getDay();
  return jsToBackendDay(today);
}

/**
 * 检查某个微行为是否应该在今天显示
 * 
 * @param frequency - 微行为的频率数组（后端格式 1-7）
 * @returns 是否应该在今天显示
 * 
 * @example
 * const frequency = [1, 2, 3, 4, 5]; // 周一到周五
 * const shouldShow = shouldShowToday(frequency); // 如果今天是工作日返回 true
 */
export function shouldShowToday(frequency: number[]): boolean {
  const today = getTodayBackendDay();
  return frequency.includes(today);
}

/**
 * 星期名称映射（后端格式）
 */
export const WEEKDAY_NAMES = {
  1: '周一',
  2: '周二',
  3: '周三',
  4: '周四',
  5: '周五',
  6: '周六',
  7: '周日',
} as const;

/**
 * 星期简称映射（后端格式）
 */
export const WEEKDAY_SHORT_NAMES = {
  1: '一',
  2: '二',
  3: '三',
  4: '四',
  5: '五',
  6: '六',
  7: '日',
} as const;

/**
 * 获取星期名称
 * 
 * @param backendDay - 后端格式的星期值 (1-7)
 * @param short - 是否返回简称
 * @returns 星期名称
 * 
 * @example
 * getWeekdayName(1); // 返回 "周一"
 * getWeekdayName(1, true); // 返回 "一"
 */
export function getWeekdayName(backendDay: number, short: boolean = false): string {
  if (short) {
    return WEEKDAY_SHORT_NAMES[backendDay as keyof typeof WEEKDAY_SHORT_NAMES] || '';
  }
  return WEEKDAY_NAMES[backendDay as keyof typeof WEEKDAY_NAMES] || '';
}
