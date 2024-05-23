import type { Menu, Submenu } from '@tauri-apps/api/menu'
import { TrayIcon } from '@tauri-apps/api/tray'

import pkg from '~/../package.json'

const DEFAULT_TRAY_NAME = 'main'

export async function useTray() {
  let tray = await TrayIcon.getById(DEFAULT_TRAY_NAME)
  if (!tray) {
    tray = await TrayIcon.new({ tooltip: `EasyLink\n${pkg.version}`, id: DEFAULT_TRAY_NAME })
    tray.setIcon('icons/icon.ico')
  }
  return tray
}

export async function setTrayMenu(menu: Menu | Submenu | null) {
  const tray = await useTray()
  tray.setMenu(menu)
}

export async function setTrayRunState(isRunning: boolean) {
  const tray = await useTray()
  if (isRunning)
    tray.setIcon('icons/icon-inactive.ico')
  else
    tray.setIcon('icons/icon.ico')
}
