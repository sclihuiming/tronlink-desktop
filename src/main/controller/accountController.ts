import { AddAccountParams, Response } from 'types';
import { get, omit, size } from 'lodash';
import crypto from 'crypto';
import TronWeb from 'tronweb';
import { BigNumber } from 'bignumber.js';
import { getDBInstance } from '../store/index';
import { getTronwebInstance } from '../service/nodeService';

const encryptionAlgorithm = 'aes-256-ctr';

function encrypt(encodedStr: string, key: string) {
  // const encoded = JSON.stringify(data);
  const cipher = crypto.createCipher(encryptionAlgorithm, key);

  let crypted = cipher.update(encodedStr, 'utf8', 'hex');
  crypted += cipher.final('hex');

  return crypted;
}

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
  // trx.getUnconfirmedAccount(address)
  return <Response>{
    code: 200,
    data: accounts,
  };
}
