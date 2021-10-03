import { getAllWindow } from '../../main/store/windowManager';
import { simplexMessageEntryType } from '../../constants';
import { AccountData, DappData } from '../../types';

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

export function setAccounts(accounts: AccountData[]) {
  return send('setAccounts', accounts);
}

export function setSelectedAddress(address: string) {
  return send('setSelectedAddress', address);
}

export function setDappList(dappList: DappData[]) {
  return send('setDappList', dappList);
}

export function changeNodeId(nodeId: string) {
  return send('changeNodeId', nodeId);
}

export function changeLanguage(lang: string) {
  return send('changeLanguage', lang);
}
