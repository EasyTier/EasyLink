import type { DataInfo, PeerRoutePair } from '~/types/network'

export function humanFileSize(bytes: number, si = true, dp = 1) {
  const thresh = si ? 1000 : 1024

  if (Math.abs(bytes) < thresh)
    return `${bytes} B`

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
  let u = -1
  const r = 10 ** dp

  do {
    bytes /= thresh
    ++u
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1)

  return `${bytes.toFixed(dp)} ${units[u]}`
}

export function statsCommon(info: PeerRoutePair, field: string): number | undefined {
  if (!info.peer)
    return undefined

  const conns = info.peer.conns
  return conns.reduce((acc: number, conn: any) => {
    return acc + resolveObjPath(field, conn)
  }, 0)
}

function resolveObjPath(path: string, obj = globalThis, separator = '.') {
  const properties = Array.isArray(path) ? path : path.split(separator)
  return properties.reduce((prev, curr) => prev?.[curr], obj)
}

export function peerRoutePairToStatusData(prp: PeerRoutePair[]): DataInfo[] {
  return prp.map((p) => {
    const latency = statsCommon(p, 'stats.latency_us')
    const tx = statsCommon(p, 'stats.tx_bytes')
    const rx = statsCommon(p, 'stats.rx_bytes')
    const lossRate = statsCommon(p, 'loss_rate')

    return {
      name: p.route.hostname,
      ip: p.route.ipv4_addr,
      cost: p.route ? p.route.cost : undefined,
      latency: latency ? latency / 1000 / (p.peer?.conns.length || 1) : undefined,
      tx,
      rx,
      lossRate,
    }
  }) || []
}
