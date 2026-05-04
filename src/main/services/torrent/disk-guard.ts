import { statfs } from 'fs/promises'
import { TorrentError } from './errors'

/** Require this much headroom over the torrent's expected length. */
const SAFETY_MARGIN = 1.05

/**
 * Verify the destination has enough free space for `expectedBytes`.
 * Throws TorrentError('insufficient-space') if not. Silent no-op on
 * platforms where statfs isn't available (we don't fail the download
 * over a missing capability).
 */
export async function ensureFreeSpace(savePath: string, expectedBytes: number): Promise<void> {
  if (!Number.isFinite(expectedBytes) || expectedBytes <= 0) return

  let free: number
  try {
    const stats = await statfs(savePath)
    free = Number(stats.bsize) * Number(stats.bavail)
  } catch (err) {
    console.warn(`[disk-guard] statfs(${savePath}) failed:`, err)
    return
  }

  const required = Math.ceil(expectedBytes * SAFETY_MARGIN)
  if (free < required) {
    throw new TorrentError(
      'insufficient-space',
      `Need ${required} bytes free at ${savePath}, only ${free} available`
    )
  }
}
