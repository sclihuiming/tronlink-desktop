import { getAllWindow } from '../../main/store/windowManager';
import { simplexMessageEntryType } from '../../constants';

function send(method: string, params: any) {
  const args = {
    method,
    params,
  };
  const wins = getAllWindow();
  wins.forEach((win) => {
    win.webContents.send(simplexMessageEntryType.main2Render, args);
  });
  // ipcMain.emit(simplexMessageEntryType.main2Render, ...args);
  return null;
}

export function setAccounts(accounts: JSON[]) {
  return send('setAccounts', accounts);
}

export function setSelectedAddress(address: string) {
  return send('setSelectedAddress', address);
}
