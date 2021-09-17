import { AddAccountParams } from 'types';
import { find, get, omit, size } from 'lodash';
import TronWeb from 'tronweb';
import { BigNumber } from 'bignumber.js';
import * as mainApi from '../../MessageDuplex/handlers/mainApi';
import { encrypt } from '../../utils';
import {
  getAccountsCache,
  getSelectedAddressCache,
  setAccountsCache,
  setSelectedAddressCache,
} from '../service/cacheService';
import { getDBInstance } from '../store/index';
import { getTronwebInstance } from './nodeController';

export async function getSelectedAddress() {
  const dbInstance = await getDBInstance();
  let selectedAddress = getSelectedAddressCache();
  if (!selectedAddress) {
    await dbInstance.read();
    const tmpAddress = dbInstance.get('accounts.0.address', '').value();
    selectedAddress = dbInstance
      .get('selectAccountAddress', tmpAddress)
      .value();
  }
  return selectedAddress;
}

export async function refreshAccountsData(isLoadByNetwork: boolean) {
  const dbInstance = await getDBInstance();
  const tronwebInstance = getTronwebInstance();
  await dbInstance.read();
  const accounts = dbInstance
    .get('accounts', [])
    .map((item: JSON) => omit(item, 'privateKey'))
    .value();

  // eslint-disable-next-line no-restricted-syntax
  for (const account of accounts) {
    const address = get(account, 'address');
    if (isLoadByNetwork) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const res = await tronwebInstance.trx.getUnconfirmedAccount(address);
        const balance = new BigNumber(get(res, 'balance', 0))
          .shiftedBy(-6)
          .toFixed();
        account.balance = balance;
      } catch (e) {
        console.error(e);
      }
    }
  }

  dbInstance.set('accounts', accounts).write();
  setAccountsCache(accounts);
  mainApi.setAccounts(accounts);
  dbInstance.write();
  return accounts;
}

export async function getAccounts(): Promise<any> {
  let accounts: any = await getAccountsCache();
  if (size(accounts) === 0) {
    accounts = await refreshAccountsData(true);
  }
  return accounts;
}

export async function getSelectedAccountInfo() {
  const selectedAddress = await getSelectedAddress();
  const accounts = await getAccounts();
  return find(accounts, (account) => account.address === selectedAddress);
}

export async function setSelectedAddress(address: string) {
  const dbInstance = await getDBInstance();
  await dbInstance.set('selectAccountAddress', address).write();
  setSelectedAddressCache(address);
  mainApi.setSelectedAddress(address);
  return address;
}

async function addAccountByPrivatekey(
  importType: string,
  name: string,
  privateKey: string
): Promise<any> {
  const dbInstance = await getDBInstance();
  const address = TronWeb.address.fromPrivateKey(privateKey);

  const existAccount = dbInstance
    .get('accounts', [])
    .find((item: JSON) => item.address === address)
    .value();
  if (size(existAccount) > 0) {
    return Promise.reject(new Error('账户已经存在'));
  }
  // TODO: password
  const encodePrivateKey = encrypt(privateKey, '12345678');
  const accountInfo = {
    importType,
    name,
    address,
    privateKey: encodePrivateKey,
  };
  dbInstance.get('accounts', []).push(accountInfo).write();
  dbInstance.get('certificate', {}).value();
  dbInstance
    .get('certificate', {})
    .assign({ [address]: { privateKey: encodePrivateKey } })
    .write();
  setSelectedAddress(address);
  return '成功保存';
}

async function addAccountByMnemonic(
  importType: string,
  name: string,
  mnemonic: string
): Promise<any> {
  return Promise.reject(new Error('not support type'));
}

export async function addAccount(params: AddAccountParams): Promise<any> {
  const importType: string = get(params, 'importType', '');
  if (importType === 'privateKey') {
    return addAccountByPrivatekey(
      importType,
      params.user.name,
      params.user.privateKey as string
    );
  }
  if (importType === 'mnemonic') {
    return addAccountByMnemonic(
      importType,
      params.user.name,
      params.user.mnemonic as string
    );
  }
  return Promise.reject(new Error('not support type'));
}

export async function getSelectedAuthKey() {
  const dbInstance = await getDBInstance();
  const selectedAddress = await getSelectedAddress();
  const encryptKey = dbInstance.get(`certificate.${selectedAddress}`).value();
  return encryptKey;
}
