import type { Network, NetworkInstanceInfo } from '~/types/network'

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

  const currentNetworkInfoData = computed(() => {
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

  function addNetwork() {
    const newNetwork: Network = {
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
    currentNetwork,
    currentNetworkInfo,
    currentNetworkInfoData,
    isCurrentNetworkRunning,
    addNetwork,
    removeNetwork,
    startNetwork,
    stopNetwork,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useNetworkStore as any, import.meta.hot))
