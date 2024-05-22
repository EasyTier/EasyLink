import type { DataInfo, Network, NetworkConfig, NetworkInfoStack, NetworkInstanceInfo } from '~/types/network'

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
    return peerRoutePairToStatusData(currentNetworkInfo.value?.peer_route_pairs || [])
  })

  const isCurrentNetworkRunning = computed<boolean>(() => {
    return !!networkInfo.value.find(i => i.id.toLowerCase() === networkCurrentId.value.toLowerCase())
  })

  const networkInfoDataStack = reactive<Record<string, NetworkInfoStack[]>>({})

  const currentNetworkInfoDataStack = computed<NetworkInfoStack[]>(() => {
    return networkInfoDataStack[networkCurrentId.value] || []
  })

  function pushInfoStack(id: string, info: NetworkInstanceInfo) {
    const now = new Date()
    const nowTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`
    if (!networkInfoDataStack[id])
      networkInfoDataStack[id] = []

    networkInfoDataStack[id].push({
      time: nowTime,
      id: info.id,
      node: info.node,
      peerRoutePair: info.peer_route_pairs,
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

  async function startNetwork(callback: (e: any) => void, id: string | undefined = undefined) {
    const network = id ? networkList.value.find(network => network.config.id === id) : currentNetwork.value
    if (network) {
      const cfg: NetworkConfig = JSON.parse(JSON.stringify(network.config))
      if (network.otherConfig.token) {
        delete cfg.networkName
        delete cfg.networkSecret
      }
      else {
        delete cfg.token
      }
      // link!
      try {
        await parseNetworkConfig(cfg)
        await startNetworkInstance(cfg)
      }
      catch (e: any) {
        callback(e)
      }
    }
  }

  async function stopNetwork(callback: (e: any) => void = () => { }, id: string | undefined = undefined) {
    const network = id ? networkList.value.find(network => network.config.id === id) : currentNetwork.value
    if (network) {
      try {
        await stopNetworkInstance(network.config.id)
      }
      catch (e: any) {
        callback(e)
      }
    }
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
