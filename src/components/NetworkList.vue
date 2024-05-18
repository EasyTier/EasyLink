<script setup lang="ts">
import type { Network } from '~/types/network'
import { NetworkStatus } from '~/types/network'

const networkStore = useNetworkStore()
const tmpStore = useTmpStore()

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
      return '运行中'
    case NetworkStatus.STARTING:
      return '启动中'
    case NetworkStatus.ERROR:
      return '发生错误'
    case NetworkStatus.OFF:
      return '未启动'
    default:
      return '未知'
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
  <n-scrollbar :style="{ 'max-height': 'calc(100vh - 88px)' }">
    <n-list hoverable clickable>
      <n-flex v-if="networkFilter" justify="center" align="center" mb-2>
        {{ `筛选结果: ${filterList.length} / ${networkList.length}` }}
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
