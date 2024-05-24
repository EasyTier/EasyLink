import { disable, enable, isEnabled } from '@tauri-apps/plugin-autostart'

export async function setAutostart(status: boolean) {
  status ? await enable() : await disable()
  return await isEnabled()
}
