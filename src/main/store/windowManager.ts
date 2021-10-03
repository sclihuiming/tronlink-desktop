import { BrowserWindow } from 'electron';

const winManagerSet: Set<BrowserWindow> = new Set();

export function deleteWindow(window: BrowserWindow) {
  winManagerSet.delete(window);
}

export function addWindow(window: BrowserWindow) {
  winManagerSet.add(window);
}

export function getAllWindow(): BrowserWindow[] {
  return [...winManagerSet];
}

export default winManagerSet;
