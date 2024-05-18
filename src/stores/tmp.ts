export const useTmpStore = defineStore('tmpStore', () => {
  const networkFilter = ref<string>('')
  const networkCurrent = ref<string>('')
  return {
    networkFilter,
    networkCurrent,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useTmpStore as any, import.meta.hot))
