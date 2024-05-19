export const useTmpStore = defineStore('tmpStore', () => {
  const networkStore = useNetworkStore()
  const { networkList } = storeToRefs(networkStore)
  const networkFilter = ref<string>('')
  const networkCurrent = ref<string>(networkList.value.length ? networkList.value[0].config.id : '')
  return {
    networkFilter,
    networkCurrent,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useTmpStore as any, import.meta.hot))
