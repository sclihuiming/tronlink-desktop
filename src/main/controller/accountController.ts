import { AddAccountParams, Response } from 'types';
import { get, omit, size } from 'lodash';
import TronWeb from 'tronweb';
import { BigNumber } from 'bignumber.js';
import * as mainApi from '../../MessageDuplex/handlers/mainApi';
import { encrypt } from '../../utils';
import { setAccountsCache } from '../service/cacheService';
import { getDBInstance } from '../store/index';
import { getTronwebInstance } from '../service/nodeService';

async function addAccountByPrivatekey(
  importType: string,
  name: string,
  privateKey: string
): Promise<Response> {
  console.log(importType, name, privateKey);
  const dbInstance = await getDBInstance();
  const address = TronWeb.address.fromPrivateKey(privateKey);

  const existAccount = dbInstance
    .get('accounts', [])
    .find((item: JSON) => item.address === address)
    .value();
  if (size(existAccount) > 0) {
    return <Response>{
      code: 1001,
      msg: '账户已经存在',
    };
  }
  const encodePrivateKey = encrypt(privateKey, '12345678');
  const accountInfo = {
    importType,
    name,
    address,
    privateKey: encodePrivateKey,
  };
  dbInstance.get('accounts', []).push(accountInfo).write();
  return <Response>{
    code: 200,
    msg: '成功保存',
  };
}

async function addAccountByMnemonic(
  importType: string,
  name: string,
  mnemonic: string
): Promise<Response> {
  console.log(importType, name, mnemonic);
  return <Response>{
    code: 200,
    msg: 'not support type',
  };
}

export async function addAccount(params: AddAccountParams): Promise<Response> {
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
  return <Response>{
    code: 1000,
    msg: 'not support type',
  };
}

export async function getAccounts(): Promise<Response> {
  const dbInstance = await getDBInstance();
  const tronwebInstance = getTronwebInstance();
  const accounts = dbInstance
    .get('accounts', [])
    .map((item: JSON) => omit(item, 'privateKey'))
    .value();

  console.log('getAccounts', accounts);

  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const account of accounts) {
      const address = get(account, 'address');
      // eslint-disable-next-line no-await-in-loop
      const res = await tronwebInstance.trx.getUnconfirmedAccount(address);
      const balance = new BigNumber(get(res, 'balance', 0))
        .shiftedBy(-6)
        .toFixed();
      account.balance = balance;
      console.log(account);
    }
  } catch (e) {
    console.error(e);
  }

  return <Response>{
    code: 200,
    data: accounts,
  };
}

export async function refreshAccountsData() {
  const dbInstance = await getDBInstance();
  const tronwebInstance = getTronwebInstance();
  const accounts = dbInstance
    .get('accounts', [])
    .map((item: JSON) => omit(item, 'privateKey'))
    .value();

  try {
    // eslint-disable-next-line no-restricted-syntax
    for (const account of accounts) {
      const address = get(account, 'address');
      // eslint-disable-next-line no-await-in-loop
      const res = await tronwebInstance.trx.getUnconfirmedAccount(address);
      const balance = new BigNumber(get(res, 'balance', 0))
        .shiftedBy(-6)
        .toFixed();
      account.balance = balance;
    }
  } catch (e) {
    console.error(e);
  }
  setAccountsCache(accounts);
  mainApi.setAccounts(accounts);
  return accounts;
}
