<script setup lang="ts">
const appStore = useAppStore()
const networkStore = useNetworkStore()
const { config } = storeToRefs(appStore)
const { networkList } = storeToRefs(networkStore)

async function toggleConfigAutostart(enable: boolean) {
  const ret = await setAutostart(enable)
  config.value.autostart.enable = ret
  await notify({
    title: 'Autostart',
    body: `Autostart ${enable ? 'enabled' : 'disabled'}`,
  })
}

const networkListOptions = computed(() => {
  return networkList.value.map(item => ({
    label: item.name,
    value: item.config.id,
  }))
})


</script>

<template>
  <n-card title="config" w-360px>
    <n-form label-width="auto">
      <n-form-item label="autostart">
        <n-switch :value="config.autostart.enable" @update:value="toggleConfigAutostart" />
      </n-form-item>
      <n-form-item label="autostart / network">
        <n-select v-model:value="config.autostart.network" multiple clearable :options="networkListOptions" />
      </n-form-item>
    </n-form>
  </n-card>
</template>

<style scoped lang="ts">

</style>
