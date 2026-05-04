import { writeFileSync, renameSync, promises as fsp } from 'fs'

// Debounced + crash-safe JSON writer: coalesces bursts, writes via .tmp + rename
// so a crash mid-write can't leave a half-written file. Use flushSync on shutdown.
export function createJsonWriter<T>(filePath: string, debounceMs = 200) {
  const tmpPath = filePath + '.tmp'
  // `latest` tracks the most recent value handed to schedule(), regardless of
  // whether the timer already drained it into the async write chain. flushSync
  // must persist this on shutdown — otherwise an in-flight async write may not
  // finish before Electron exits and the freshest value is lost.
  let latest: { value: T } | null = null
  let pending: T | null = null
  let timer: ReturnType<typeof setTimeout> | null = null
  let disposed = false
  // Serialize async writes so bursts can't race the rename.
  let inflight: Promise<void> = Promise.resolve()

  function writeNowSync(value: T): void {
    const json = JSON.stringify(value, null, 2)
    writeFileSync(tmpPath, json)
    renameSync(tmpPath, filePath)
  }

  async function writeNowAsync(value: T): Promise<void> {
    if (disposed) return
    const json = JSON.stringify(value, null, 2)
    await fsp.writeFile(tmpPath, json)
    if (disposed) return
    await fsp.rename(tmpPath, filePath)
  }

  function flushSync(): void {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    pending = null
    if (latest === null) return
    const value = latest.value
    latest = null
    disposed = true
    try {
      writeNowSync(value)
    } catch (err) {
      console.error('[json-writer] sync flush failed for', filePath, err)
    }
  }

  function schedule(value: T): void {
    if (disposed) return
    latest = { value }
    pending = value
    if (timer) return
    timer = setTimeout(() => {
      timer = null
      const value = pending
      pending = null
      if (value === null) return
      inflight = inflight
        .then(() => writeNowAsync(value))
        .then(() => {
          // Only clear `latest` if it still matches the value we just wrote;
          // a newer schedule() during the await would have replaced it.
          if (latest && latest.value === value) latest = null
        })
        .catch((err) => console.error('[json-writer] write failed for', filePath, err))
    }, debounceMs)
  }

  return { schedule, flushSync }
}
