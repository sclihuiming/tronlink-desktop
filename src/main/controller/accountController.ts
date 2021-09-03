import { AddAccountParams, Response } from 'types';
import { get } from 'lodash';
import crypto from 'crypto';
import { getDBInstance } from '../store/index';

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
): Promise<boolean> {
  console.log(importType, name, privateKey);
  const dbInstance = await getDBInstance();
  const encodePrivateKey = encrypt(privateKey, '12345678');
  const accountInfo = {
    importType,
    name,
    privateKey: encodePrivateKey,
  };
  dbInstance.get('accounts', []).push(accountInfo).write();
  return true;
}

async function addAccountByMnemonic(
  importType: string,
  name: string,
  mnemonic: string
): Promise<boolean> {
  console.log(importType, name, mnemonic);
  return true;
}

export async function addAccount(params: AddAccountParams): Promise<Response> {
  const importType: string = get(params, 'importType', '');
  if (importType === 'privateKey') {
    const res = await addAccountByPrivatekey(
      importType,
      params.user.name,
      params.user.privateKey as string
    );
    return <Response>{
      code: 200,
      msg: 'not support type',
    };
  }
  if (importType === 'mnemonic') {
    const res = await addAccountByMnemonic(
      importType,
      params.user.name,
      params.user.mnemonic as string
    );
    return <Response>{
      code: 200,
      msg: 'not support type',
    };
  }
  return <Response>{
    code: 1000,
    msg: 'not support type',
  };
}

export function getAccount(params: any) {}
