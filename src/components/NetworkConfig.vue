<script setup lang="ts">
import type { Network } from '~/types/network'

const networkStore = useNetworkStore()
const tmpStore = useTmpStore()

const { networkList } = storeToRefs(networkStore)
const { networkCurrent } = storeToRefs(tmpStore)

const currentNetwork = computed<Network | undefined>(() => {
  return networkList.value.find(item => item.config.id === networkCurrent.value)
})

function onlyAllowHostname(value: string) {
  return !value || /^[\u4E00-\u9FA5a-z0-9\-]*$/i.test(value)
}
</script>

<template>
  <n-tabs v-if="currentNetwork" type="line" animated>
    <n-tab-pane name="common" tab="常规设置">
      <n-form label-width="auto">
        <n-form-item label="配置名称">
          <n-input v-model:value="currentNetwork.name" placeholder="本配置的名称" />
        </n-form-item>
        <n-form-item label="设备名">
          <n-input
            v-model:value="currentNetwork.config.deviceName" placeholder="留空默认为主机名称："
            :allow-input="onlyAllowHostname"
          />
        </n-form-item>
        <n-form-item label="虚拟ip">
          <template #label>
            <n-flex align="center">
              <n-text>虚拟ip</n-text>
              <n-checkbox v-model:checked="currentNetwork.config.dhcp" :checked-value="true" :unchecked-value="false">
                DHCP
              </n-checkbox>
            </n-flex>
          </template>
          <n-input v-model:value="currentNetwork.config.ipv4" :disabled="currentNetwork.config.dhcp" />
        </n-form-item>
        <n-form-item label="服务器">
          <n-select v-model:value="currentNetwork.config.peerUrls" filterable tag />
        </n-form-item>
      </n-form>
    </n-tab-pane>
    <n-tab-pane name="advance" tab="高级设置">
      <n-form label-width="auto">
        <n-form-item label="子网代理">
          <n-dynamic-tags />
        </n-form-item>
        <n-form-item label="RPC端口">
          <n-input-number v-model:value="currentNetwork.config.rpcPort" :min="0" :max="65535" />
        </n-form-item>
        <n-form-item label="VPN Portal">
          <n-input-group>
            <n-input v-model:value="currentNetwork.config.vpnPortalAddr" type="text" :style="{ width: '70%' }" />
            <n-input v-model:value="currentNetwork.config.vpnPortalPort" type="text" :style="{ width: '30%' }" />
          </n-input-group>
        </n-form-item>
      </n-form>
    </n-tab-pane>
  </n-tabs>
  <n-empty v-else description="该网络配置不存在" h-full justify-center>
    <template #extra>
      <n-button size="small" @click="networkCurrent = ''">
        看看别的
      </n-button>
    </template>
  </n-empty>
</template>

<style scoped lang="postcss">
.n-dynamic-input {
  & :deep(.n-button) {
    @apply rounded-none;
  }
}
</style>
