import { ipcMain } from 'electron';
import { simplexMessageEntryType } from '../../constants';

function send(...args: any[]) {
  console.log('setAccounts', args);
  ipcMain.emit(simplexMessageEntryType.main2Render, ...args);
  return null;
}

export function setAccounts(accounts: JSON[]) {
  return send('setAccounts', accounts);
}

export const seat = 1;
export const seat1 = 1;
