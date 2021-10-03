import { ipcRenderer } from 'electron';
import { AddAccountParams, DappData, RegisterData } from 'types';
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

export function removeAccount(address: string) {
  return sendOrInvoke('removeAccount', address, true);
}

export function getSelectedAccountInfo() {
  return sendOrInvoke('getSelectedAccountInfo', null, true);
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

export function getDappList() {
  return sendOrInvoke('getDappList', null, true);
}

export function addDappData(data: DappData) {
  return sendOrInvoke('addDappData', data, true);
}

export function removeDappData(url: string) {
  return sendOrInvoke('removeDappData', url, true);
}

export function getTransactions() {
  return sendOrInvoke('getTransactions', null, true);
}

export function rejectConfirmation(messageID: string) {
  return sendOrInvoke('rejectConfirmation', messageID, true);
}

export function acceptConfirmation(messageID: string) {
  return sendOrInvoke('acceptConfirmation', messageID, true);
}

export function registerNewUser(authInfo: RegisterData) {
  return sendOrInvoke('registerNewUser', authInfo, true);
}

export function isNewUser() {
  return sendOrInvoke('isNewUser', null, true);
}

export function isLogin() {
  return sendOrInvoke('isLogin', null, true);
}

export function login(password: string) {
  return sendOrInvoke('login', password, true);
}

export function logOut() {
  return sendOrInvoke('logOut', null, true);
}

export function getNodeId() {
  return sendOrInvoke('getNodeId', null, true);
}

export function getCurrentNodeInfo() {
  return sendOrInvoke('getCurrentNodeInfo', null, true);
}

export function getNodeList() {
  return sendOrInvoke('getNodeList', null, true);
}

export function changeNode(nodeId: string) {
  return sendOrInvoke('changeNode', nodeId, true);
}

export function getCurrentAccountAndNodeInfo() {
  return sendOrInvoke('getInitParams', null, true);
}

export function getLanguage() {
  return sendOrInvoke('getLanguage', null, true);
}

export function setLanguage(lang: string) {
  return sendOrInvoke('setLanguage', lang, true);
}

export function checkTransport(useBlueTooth: boolean) {
  return sendOrInvoke('checkTransport', useBlueTooth, true);
}

export function getAddressInfo(
  index: number,
  boolDisplay = false,
  useBlueTooth = false
) {
  return sendOrInvoke(
    'getAddressInfo',
    { index, boolDisplay, useBlueTooth },
    true
  );
}

export function generateMnemonic() {
  return sendOrInvoke('generateMnemonic', null, true);
}

export function generateMnemonicChinese() {
  return sendOrInvoke('generateMnemonicChinese', null, true);
}

export function validateMnemonic(mnemonic: string) {
  return sendOrInvoke('validateMnemonic', mnemonic, true);
}

export function validateMnemonicChinese(mnemonic: string) {
  return sendOrInvoke('validateMnemonicChinese', mnemonic, true);
}

export function batchGenerateAccount(mnemonic: string, page = 0, size = 5) {
  return sendOrInvoke('batchGenerateAccount', { mnemonic, page, size }, true);
}
