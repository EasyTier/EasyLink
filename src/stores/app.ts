export const useAppStore = defineStore('appStore', () => {
  const isDark = useStorage('dark', true)
  const showMultipleNetwork = useStorage('multiple', false)

  const toggleDark = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    showMultipleNetwork,
    toggleDark,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAppStore as any, import.meta.hot))
