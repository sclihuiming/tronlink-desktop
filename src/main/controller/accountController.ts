import { AccountData, AddAccountParams } from 'types';
import { find, get, keyBy, omit, size } from 'lodash';
import TronWeb from 'tronweb';
import { BigNumber } from 'bignumber.js';
import * as mainApi from '../../MessageDuplex/handlers/mainApi';
import { encrypt, cryptoUtil } from '../../utils';
import {
  getAccountsCache,
  getAuthentication,
  getSelectedAddressCache,
  setAccountsCache,
  setSelectedAddressCache,
} from '../service/cacheService';
import { getDBInstance } from '../store/index';
import { getTronwebInstance } from './nodeController';
import { getAccountAtIndex } from './mnemonicController';

export async function getSelectedAddress(): Promise<string> {
  const dbInstance = await getDBInstance();
  let selectedAddress: string = getSelectedAddressCache();
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

  const balanceInfo: { [propName: string]: string } = {};
  if (isLoadByNetwork) {
    const accounts: AccountData[] = dbInstance
      .get('accounts', [])
      .map((item: JSON) => omit(item, 'privateKey'))
      .value();
    // eslint-disable-next-line no-restricted-syntax
    for (const account of accounts) {
      const address = get(account, 'address');
      try {
        // eslint-disable-next-line no-await-in-loop
        const res = await tronwebInstance.trx.getUnconfirmedAccount(address);
        const balance = new BigNumber(get(res, 'balance', 0))
          .shiftedBy(-6)
          .toFixed();
        balanceInfo[address] = balance;
        // account.balance = balance;
      } catch (e) {
        console.error(e);
      }
    }
    dbInstance
      .get('accounts')
      .forEach((item: AccountData) => {
        const address = get(item, 'address');
        if (Object.prototype.hasOwnProperty.call(balanceInfo, address)) {
          item.balance = balanceInfo[address] || item.balance || '0';
        }
      })
      .write();
  }

  setAccountsCache(dbInstance.get('accounts').value());
  mainApi.setAccounts(dbInstance.get('accounts').value());
  dbInstance.write();
  return dbInstance.get('accounts').value();
}

export async function getAccounts(): Promise<AccountData[]> {
  let accounts: AccountData[] = await getAccountsCache();
  if (size(accounts) === 0) {
    accounts = await refreshAccountsData(true);
  }
  return accounts;
}

export async function getSelectedAccountInfo() {
  const selectedAddress: string = await getSelectedAddress();
  const accounts: AccountData[] = await getAccounts();
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
    .find((item: AccountData) => item.address === address)
    .value();
  if (size(existAccount) > 0) {
    return Promise.reject(new Error('账户已经存在'));
  }

  const authKey = getAuthentication();
  const encodePrivateInfo = cryptoUtil.encryptSync(privateKey, <string>authKey);
  const accountInfo = {
    importType,
    name,
    address,
  };
  dbInstance.get('accounts', []).push(accountInfo).write();
  dbInstance.get('certificate', {}).value();
  dbInstance
    .get('certificate', {})
    .assign({ [address]: { privateKey: JSON.stringify(encodePrivateInfo) } })
    .write();
  setSelectedAddress(address);
  mainApi.setAccounts(dbInstance.get('accounts', []).value());
  return '成功保存';
}

async function addAccountByMnemonic(
  importType: string,
  name: string,
  mnemonic: string,
  mnemonicIndexes: number[]
): Promise<any> {
  const dbInstance = await getDBInstance();
  const accounts = dbInstance.get('accounts', []).value();
  const accountInfos = keyBy(accounts, 'address');

  const authKey = getAuthentication();
  // eslint-disable-next-line no-restricted-syntax
  for await (const index of mnemonicIndexes) {
    const { address, privateKey } = await getAccountAtIndex(mnemonic, index);
    if (size(accountInfos[address]) === 0 && privateKey) {
      const encodePrivateInfo = cryptoUtil.encryptSync(
        privateKey,
        <string>authKey
      );
      const encodeMnemonicInfo = cryptoUtil.encryptSync(
        mnemonic,
        <string>authKey
      );
      dbInstance
        .get('certificate', {})
        .assign({
          [address]: {
            privateKey: JSON.stringify(encodePrivateInfo),
            mnemonic: JSON.stringify(encodeMnemonicInfo),
          },
        })
        .write();

      const formatAddressInfo = {
        importType,
        address,
        index,
        name: `${name} #${index}`,
      };
      dbInstance.get('accounts').push(formatAddressInfo).write();
    }
  }
  mainApi.setAccounts(dbInstance.get('accounts', []).value());
  return '成功保存';
}

async function addLedgerAccounts(
  importType: string,
  name: string,
  accountList: any[]
) {
  const dbInstance = await getDBInstance();
  const accounts = dbInstance.get('accounts', []).value();
  const accountInfos = keyBy(accounts, 'address');
  // eslint-disable-next-line no-restricted-syntax
  for await (const accountInfo of accountList) {
    if (size(accountInfos[accountInfo.address]) === 0) {
      const formatAddressInfo = {
        importType,
        name: `${name} #${accountInfo.index}`,
        address: accountInfo.address,
        index: accountInfo.index,
      };
      dbInstance.get('accounts', []).push(formatAddressInfo).write();
    }
  }
  mainApi.setAccounts(dbInstance.get('accounts', []).value());
  return '成功保存';
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
      params.user.mnemonic as string,
      params.user.mnemonicIndexes as number[]
    );
  }
  if (importType === 'ledger') {
    return addLedgerAccounts(
      importType,
      params.user.name,
      params.user.ledgerAccounts as any[]
    );
    return true;
  }
  return Promise.reject(new Error('not support type'));
}

export async function getSelectedAuthKey() {
  const dbInstance = await getDBInstance();
  const selectedAddress = await getSelectedAddress();
  const encryptKey = dbInstance.get(`certificate.${selectedAddress}`).value();
  return encryptKey;
}

export async function removeAccount(address: string) {
  const dbInstance = await getDBInstance();
  const accountInfo = dbInstance
    .get('accounts', [])
    .find((item: AccountData) => item.address === address)
    .value();
  if (size(accountInfo) === 0) {
    return Promise.reject(new Error('Account does not exist'));
  }
  dbInstance.get('accounts').remove({ address }).write();
  if (accountInfo.importType !== 'ledger') {
    dbInstance.unset(`certificate.${address}`).write();
  }
  mainApi.setAccounts(dbInstance.get('accounts', []).value());
  return true;
}
