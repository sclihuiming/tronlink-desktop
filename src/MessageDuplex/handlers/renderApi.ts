import { ipcRenderer } from 'electron';
import { AddAccountParams } from 'types';
import {
  simplexMessageEntryType,
  duplexMessageEntryType,
} from '../../constants';

function send(...args: any[]) {
  ipcRenderer.send(simplexMessageEntryType.render2Main, ...args);
  return null;
}

function invoke(...args: any[]) {
  return ipcRenderer.invoke(duplexMessageEntryType.render2Main, ...args);
}

function sendOrInvoke(method: string, params: any, ack = false) {
  const args = {
    method,
    params,
  };

  if (ack) {
    return invoke(args);
  }
  return send(args);
}

export function getAccount(address: string) {
  return sendOrInvoke('getAccount', address, true);
}

export function getAccounts() {
  return sendOrInvoke('getAccounts', null, true);
}

export function addAccount(params: AddAccountParams) {
  return sendOrInvoke('addAccount', params, true);
}

export function ipcExample(ping: string) {
  return sendOrInvoke('ipc-example', ping, false);
}

export function setSelectedAddress(address: string) {
  return sendOrInvoke('setSelectedAddress', address, true);
}

export function getSelectedAddress() {
  return sendOrInvoke('getSelectedAddress', null, true);
}
