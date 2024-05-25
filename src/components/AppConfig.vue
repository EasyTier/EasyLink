<script setup lang="ts">
const { t } = useI18n()
const appStore = useAppStore()
const networkStore = useNetworkStore()
const { toggleAutostart } = appStore
const { config } = storeToRefs(appStore)
const { networkList } = storeToRefs(networkStore)

async function toggleConfigAutostart(enable: boolean) {
  const ret = await toggleAutostart(enable)
  await notify({
    title: t('component.appConfig.autostart.title'),
    body: `${ret ? t('component.appConfig.autostart.enable') : t('component.appConfig.autostart.disable')}${t('component.appConfig.autostart.title')}`,
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
  <n-card :title="t('component.appConfig.title')" w-360px>
    <n-form label-width="auto">
      <n-form-item>
        <template #label>
          <n-flex align="center">
            <n-text>{{ t('component.appConfig.autostart.title') }}</n-text>
            <n-switch :value="config.autostart.enable" @update:value="toggleConfigAutostart" />
          </n-flex>
        </template>
        <n-select
          v-model:value="config.autostart.network" :disabled="!config.autostart.enable" multiple clearable
          :options="networkListOptions"
        />
      </n-form-item>
    </n-form>
  </n-card>
</template>

<style scoped lang="ts">

</style>
