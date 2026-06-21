// 优化用户体验，防止 UI 组件（如加载骨架屏或 Loading 转圈）出现一闪而过的情况。
export async function withMinDuration<T>(fn: () => Promise<T>, minMs = 200): Promise<T> {
  const start = Date.now()
  const result = await fn()
  // 看是否过了最小时间，如果没过，就等待剩余时间再返回结果。
  const remaining = minMs - (Date.now() - start)
  if (remaining > 0) {
    await new Promise(resolve => setTimeout(resolve, remaining))
  }
  return result
}
