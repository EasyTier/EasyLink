<script setup lang="ts">
import type { Network } from '~/types/network'

const { t } = useI18n()
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

function addAndSelectNetwork() {
  addNetwork()
  if (networkList.value.length)
    networkCurrent.value = networkList.value[networkList.value.length - 1].config.id
}
</script>

<template>
  <n-flex h-full w-full align="center" justify="center">
    <n-grid v-if="currentNetwork" :x-gap="8" :y-gap="8" :cols="8">
      <n-gi offset="1" span="6">
        <n-flex :wrap="false">
          <n-input-group>
            <n-input
              v-if="groupType === 'token'" type="text" :placeholder="t('page.index.tokenPlaceholder')"
              size="medium" :style="{ width: '75%' }"
            />
            <template v-else>
              <n-input type="text" :placeholder="t('page.index.networkNamePlaceholder')" :style="{ width: '40%' }" />
              <n-input type="text" :placeholder="t('page.index.networkSecretPlaceholder')" :style="{ width: '35%' }" />
            </template>
            <n-select v-model:value="groupType" :style="{ width: '25%' }" :options="networkGroupType" />
          </n-input-group>
          <n-button type="primary" size="medium">
            {{ t('page.index.networking') }}
          </n-button>
        </n-flex>
      </n-gi>
      <n-gi offset="1" span="6">
        <n-flex :wrap="false" align="center">
          <n-button text @click="config = true">
            <template #icon>
              <n-icon i-carbon-settings />
            </template>
            {{ t('page.index.config') }}
          </n-button>

          <n-popconfirm
            :negative-text="t('page.index.delete')" :positive-text="t('page.index.cancel')"
            @negative-click="removeThisNetwork(currentNetwork.config.id)"
          >
            <template #trigger>
              <n-button text>
                <template #icon>
                  <n-icon i-carbon-task-remove />
                </template>
                {{ t('page.index.confirmDeleteConfigMessage') }}
              </n-button>
            </template>
            {{ t('page.index.confirmDeleteConfigMessageTwice') }}
          </n-popconfirm>
        </n-flex>
      </n-gi>
    </n-grid>
    <n-result
      v-else status="404" :title="t('page.index.noNetworkTitle')"
      :description="t('page.index.noNetworkDescription')"
    >
      <template #footer>
        <n-button @click="addAndSelectNetwork">
          {{ t('page.index.addAndSelectNewNetwork') }}
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

<style scoped lang="postcss"></style>
