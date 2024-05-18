import { invoke } from '@tauri-apps/api/core'
import type { NetworkConfig } from '~/types/network'

export async function parseNetworkConfig(cfg: NetworkConfig) {
  return invoke('parse_network_config', { cfg })
}

export async function startNetworkInstance(cfg: NetworkConfig) {
  return invoke('start_network_instance', { cfg })
}

export async function stopNetworkInstance(id: string) {
  return invoke('stop_network_instance', { id })
}

export async function collectNetworkInfos() {
  return await invoke('collect_network_infos')
}

export async function test_config(cfg: NetworkConfig) {
  return await invoke('test_config', { config: cfg })
}
