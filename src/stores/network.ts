import type { Network, NetworkInstanceInfo } from '~/types/network'

interface DataInfo {
  name: string
  ip: string
  cost?: number
  latency?: number
  tx?: number
  rx?: number
  lossRate?: number
}
const MAX_STACK = 120
export const useNetworkStore = defineStore('networkStore', () => {
  const networkList = useStorage<Network[]>('networkList', [])
  const networkInfo = ref<NetworkInstanceInfo[]>([])

  const networkFilter = ref<string>('')
  const networkCurrentId = ref<string>(networkList.value.length ? networkList.value[0].config.id : '')

  const currentNetwork = computed<Network | undefined>(() => {
    return networkList.value.find(item => item.config.id === networkCurrentId.value)
  })

  const currentNetworkInfo = computed<NetworkInstanceInfo | undefined>(() => {
    return networkInfo.value.find(item => item.id.toLowerCase() === networkCurrentId.value.toLowerCase())
  })

  const currentNetworkInfoData = computed<DataInfo[]>(() => {
    return currentNetworkInfo.value?.peer_route_pairs.map((p) => {
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
  })

  const isCurrentNetworkRunning = computed<boolean>(() => {
    return !!networkInfo.value.find(i => i.id.toLowerCase() === networkCurrentId.value.toLowerCase())
  })

  const networkInfoDataStack = reactive<Record<string, { time: string, data: DataInfo[] }[]>>({})

  const currentNetworkInfoDataStack = computed<{ time: string, data: DataInfo[] }[]>(() => {
    return networkInfoDataStack[networkCurrentId.value] || []
  })

  function pushInfoStack(id: string, info: NetworkInstanceInfo) {
    const now = new Date()
    const nowTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    if (!networkInfoDataStack[id])
      networkInfoDataStack[id] = []

    networkInfoDataStack[id].push({
      time: nowTime,
      data: info.peer_route_pairs.map((p) => {
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
      }) || [],
    })

    if (networkInfoDataStack[id].length > MAX_STACK)
      networkInfoDataStack[id].shift()
  }

  function addNetwork() {
    const newNetwork: Network = {
      name: `EasyLink-${uuid(3)}`,
      config: DEFAULT_NETWORK_CONFIG(),
      status: NetworkStatus.OFF,
      otherConfig: DEFAULT_NETWORK_OTHER_CONFIG(),
    }
    networkList.value.push(newNetwork)
  }

  function removeNetwork(id: string) {
    networkList.value = networkList.value.filter(network => network.config.id !== id)
  }

  async function startNetwork(id: string) {
    const net = networkList.value.find(network => network.config.id === id)
    if (!net)
      return

    net.status = NetworkStatus.STARTING

    // TODO: start network
  }

  async function stopNetwork(id: string) {
    const net = networkList.value.find(network => network.config.id === id)
    if (!net)
      return
    // TODO:

    net.status = NetworkStatus.STOPPED
  }

  return {
    networkList,
    networkInfo,
    networkFilter,
    networkCurrentId,
    networkInfoDataStack,
    currentNetwork,
    currentNetworkInfo,
    currentNetworkInfoData,
    isCurrentNetworkRunning,
    currentNetworkInfoDataStack,
    addNetwork,
    removeNetwork,
    startNetwork,
    stopNetwork,
    pushInfoStack,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useNetworkStore as any, import.meta.hot))
