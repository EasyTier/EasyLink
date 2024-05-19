<script setup lang="ts">
import type { Network } from '~/types/network'
import { NetworkStatus } from '~/types/network'

const networkStore = useNetworkStore()
const tmpStore = useTmpStore()
const { t } = useI18n()

const { networkList } = storeToRefs(networkStore)
const { networkFilter, networkCurrent } = storeToRefs(tmpStore)

const filterList = computed<Network[]>(() => {
  return networkList.value.filter((net) => {
    if (!networkFilter.value)
      return true
    return net.name?.includes(networkFilter.value) || net.config.id?.includes(networkFilter.value)
  })
})

function statusToTagType(status: NetworkStatus) {
  switch (status) {
    case NetworkStatus.RUNNING:
      return 'success'
    case NetworkStatus.STARTING:
      return 'info'
    case NetworkStatus.ERROR:
      return 'error'
    default:
      return 'default'
  }
}

function statusToTagText(status: NetworkStatus) {
  switch (status) {
    case NetworkStatus.RUNNING:
      return t('network.status.running')
    case NetworkStatus.STARTING:
      return t('network.status.starting')
    case NetworkStatus.ERROR:
      return t('network.status.error')
    case NetworkStatus.OFF:
      return t('network.status.off')
    case NetworkStatus.STOPPED:
      return t('network.status.stopped')
  }
}

function setActive(id: string) {
  if (networkCurrent.value !== id)
    networkCurrent.value = id
  else
    networkCurrent.value = ''
}
</script>

<template>
  <n-scrollbar :style="{ 'max-height': 'calc(100vh - 55px)' }">
    <n-list hoverable clickable>
      <n-flex v-if="networkFilter" justify="center" align="center" mb-2>
        {{ `${t('component.networkList.filterResults')}: ${filterList.length} / ${networkList.length}` }}
      </n-flex>
      <n-list-item
        v-for="net in filterList" :key="net.config.id"
        :class="net.config.id === networkCurrent ? 'active' : ''"
      >
        <n-dropdown trigger="manual" size="small">
          <n-thing content-class="mt-2" @click="setActive(net.config.id)">
            <template #header>
              <n-performant-ellipsis w-100px select-none text-sm>
                {{ net.name ? net.name : net.config.id }}
              </n-performant-ellipsis>
            </template>
            <template #header-extra>
              <n-tag :bordered="false" size="small" :type="statusToTagType(net.status)" select-none>
                {{ statusToTagText(net.status) }}
              </n-tag>
            </template>
          </n-thing>
        </n-dropdown>
      </n-list-item>
    </n-list>
  </n-scrollbar>
</template>

<style scoped lang="postcss">
.n-list-item {
  @apply !p-2;

  &.active {
    background-color: #2e33383b;
  }
}
</style>
