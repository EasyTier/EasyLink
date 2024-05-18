export const useAppStore = defineStore('appStore', () => {
  const isDark = ref<boolean>(false)

  const toggleDark = () => {
    isDark.value = !isDark.value
  }

  return {
    isDark,
    toggleDark,
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useAppStore as any, import.meta.hot))
