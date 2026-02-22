/** Return `val` if it is a finite number, otherwise return `fallback`. */
export function safeNum(val: unknown, fallback: number = 0): number {
  return typeof val === 'number' && isFinite(val) ? val : fallback
}
