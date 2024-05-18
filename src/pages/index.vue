<script setup lang="ts">
import type { Network } from '~/types/network'

const networkStore = useNetworkStore()
const tmpStore = useTmpStore()

const { addNetwork, removeNetwork } = networkStore
const { networkList } = storeToRefs(networkStore)
const { networkCurrent } = storeToRefs(tmpStore)
const config = ref(false)

const currentNetwork = computed<Network | undefined>(() => {
  return networkList.value.find(item => item.config.id === networkCurrent.value)
})

const networkGroupType = [
  {
    label: 'token',
    value: 'token',
  },
  {
    label: 'group',
    value: 'group',
  },
]

const groupType = ref('token')

function removeThisNetwork(id: string) {
  if (id) {
    removeNetwork(id)
    networkCurrent.value = ''
  }
}
</script>

<template>
  <n-flex h-full w-full align="center" justify="center">
    <n-grid v-if="currentNetwork" :x-gap="8" :y-gap="8" :cols="8">
      <n-gi offset="1" span="6">
        <n-flex :wrap="false">
          <n-input-group>
            <n-input
              v-if="groupType === 'token'" type="text" placeholder="token" size="medium"
              :style="{ width: '75%' }"
            />
            <template v-else>
              <n-input type="text" placeholder="组名" :style="{ width: '40%' }" />
              <n-input type="text" placeholder="密码(可为空)" :style="{ width: '35%' }" />
            </template>
            <n-select v-model:value="groupType" :style="{ width: '25%' }" :options="networkGroupType" />
          </n-input-group>
          <n-button type="primary" size="medium">
            组网
          </n-button>
        </n-flex>
      </n-gi>
      <n-gi offset="1" span="6">
        <n-flex :wrap="false" align="center">
          <n-button text @click="config = true">
            <template #icon>
              <n-icon i-carbon-settings />
            </template>
            设置
          </n-button>

          <n-popconfirm
            negative-text="删除" positive-text="取消"
            @negative-click="removeThisNetwork(currentNetwork.config.id)"
          >
            <template #trigger>
              <n-button text>
                <template #icon>
                  <n-icon i-carbon-task-remove />
                </template>
                移除本配置
              </n-button>
            </template>
            注意！删除不可恢复。
          </n-popconfirm>
        </n-flex>
      </n-gi>
    </n-grid>
    <n-result v-else status="404" title="还没有组网配置呢" description="快快选一个或新增一个吧">
      <template #footer>
        <n-button @click="addNetwork">
          新增组网配置
        </n-button>
      </template>
    </n-result>
  </n-flex>
  <n-drawer v-model:show="config" :width="420">
    <n-drawer-content body-content-class="!p-2">
      <NetworkConfig />
    </n-drawer-content>
  </n-drawer>
</template>

<style scoped lang="postcss">

</style>
