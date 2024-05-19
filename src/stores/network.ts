import type { Network } from '~/types/network'

export const useNetworkStore = defineStore('networkStore', () => {
  const networkList = useStorage<Network[]>('networkList', [])

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
    addNetwork,
    removeNetwork,
    startNetwork,
    stopNetwork,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useNetworkStore as any, import.meta.hot))
