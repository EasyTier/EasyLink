import type {
  Options,
} from '@tauri-apps/plugin-notification'
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification'

export async function notify(options: string | Options) {
  let permissionGranted = await isPermissionGranted()

  if (!permissionGranted) {
    const permission = await requestPermission()
    permissionGranted = permission === 'granted'
  }

  if (permissionGranted)
    sendNotification(options)
}
