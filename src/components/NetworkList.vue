<script setup lang="ts">
import type { Network } from '~/types/network'

const networkStore = useNetworkStore()
const { t } = useI18n()

const { networkList, networkFilter, networkCurrentId, networkInfo } = storeToRefs(networkStore)

const filterList = computed<Network[]>(() => {
  return networkList.value.filter((net) => {
    if (!networkFilter.value)
      return true
    return net.name?.includes(networkFilter.value) || net.config.id?.includes(networkFilter.value)
  })
})

const runningArray = computed(() => {
  const ids = networkInfo.value.map(n => n.id)
  return networkList.value.filter(n => ids.includes(n.config.id.toLowerCase())).map(n => n.config.id.toLowerCase()) || []
})

function setActive(id: string) {
  networkCurrentId.value = networkCurrentId.value !== id ? id : ''
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
        :class="net.config.id === networkCurrentId ? 'active' : ''"
      >
        <n-dropdown trigger="manual" size="small">
          <n-thing content-class="mt-2" @click="setActive(net.config.id)">
            <template #header>
              <n-performant-ellipsis w-100px select-none text-sm>
                {{ net.name ? net.name : net.config.id }}
              </n-performant-ellipsis>
            </template>
            <template #header-extra>
              <n-tag
                :bordered="false" size="small" :type="runningArray.includes(net.config.id.toLowerCase()) ? 'success'
                  : 'default'" select-none
              >
                {{ runningArray.includes(net.config.id.toLowerCase()) ? t('network.status.running')
                  : t('network.status.stopped') }}
              </n-tag>
            </template>
            <template v-if="networkInfo.find(n => n.id === net.config.id.toLowerCase())" #description>
              <n-tag type="info" :bordered="false" size="small">
                {{ `IP: ${networkInfo.find(n => n.id === net.config.id.toLowerCase())?.node.virtual_ipv4}` }}
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
