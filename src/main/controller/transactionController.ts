/* eslint-disable consistent-return */
/* eslint-disable no-console */
import { get, omit, size } from 'lodash';
import { nanoid } from 'nanoid';
import { REFER_ABI, simplexMessageEntryType } from '../../constants';
import {
  closeSignModalWindow,
  createSignModalWindow,
} from './windowController';
import { getAbiCode, getTronwebInstance } from './nodeController';
import { decodeParams } from '../../utils';
import { authTransaction } from './signController';
import { AccountData } from '../../types';
import { getSelectedAccountInfo } from './accountController';
import { signTransactionByLedger } from './ledgerController';

const requestMap = new Map();
const transactionQueue: {
  resolve: (res: any) => void;
  reject: (res: any) => void;
  data: any;
  hostname: string;
  origin: string;
  sender?: any;
}[] = [];

const findTargetTransaction = (messageID: string) => {
  let targetTransaction;
  transactionQueue.forEach((transaction) => {
    if (get(transaction, 'data.messageID') === messageID) {
      targetTransaction = transaction;
    }
  });
  return targetTransaction;
};

const deleteTargetTransaction = (messageID: string) => {
  let targetIndex;
  transactionQueue.forEach((transaction, index) => {
    if (get(transaction, 'data.messageID') === messageID) {
      targetIndex = index;
    }
  });
  if (targetIndex !== undefined) {
    transactionQueue.splice(targetIndex, 1);
  }
};

export async function signTransaction(event: any, data: any) {
  const url = event.sender.getURL();
  const tmpObj = new URL(url);
  const hostname = get(tmpObj, 'hostname');
  const origin = get(tmpObj, 'origin');
  const messageID = nanoid();

  requestMap.set(messageID, (res: any) =>
    event.reply(simplexMessageEntryType.main2Render, {
      method: 'signTransactionReply',
      params: res,
    })
  );

  transactionQueue.push({
    resolve: (res: any) => {
      if (!requestMap.get(messageID))
        return console.warn(`Message ${messageID} expired`);

      requestMap.get(messageID)({ error: false, ...res });
      requestMap.delete(messageID);
    },
    reject: (res: any) => {
      if (!requestMap.get(messageID))
        return console.warn(`Message ${messageID} expired`);

      requestMap.get(messageID)({ error: true, ...res });
      requestMap.delete(messageID);
    },
    // sender: event.sender,
    data,
    hostname,
    origin,
  });

  // open new window
  createSignModalWindow();
}

export async function getTransactions() {
  const target = transactionQueue[size(transactionQueue) - 1];
  const transaction = get(target, 'data', {});
  transaction.hostname = target.hostname;
  transaction.origin = target.origin;

  try {
    const tronWebInstance = getTronwebInstance();
    let contractAddress = get(
      transaction,
      'transaction.input.contract_address',
      ''
    );
    const functionSelector = get(
      transaction,
      'transaction.input.function_selector'
    );
    const parameter = get(transaction, 'transaction.input.parameter');
    let functionName;
    const match = String(functionSelector).match(/[\w-]+/);
    if (typeof match === 'object') {
      functionName = get(match, '0');
      transaction.functionName = functionName;
    }
    let abi = REFER_ABI;
    if (contractAddress) {
      contractAddress = tronWebInstance.address.fromHex(contractAddress);
      abi = await getAbiCode(contractAddress);
      const args = decodeParams(parameter, abi, functionSelector);
      transaction.args = args;
    }
    transaction.contractType = get(
      transaction,
      'transaction.transaction.raw_data.contract.0.type'
    );
  } catch (error) {
    console.error('getTransactions error:', error);
  }
  return transaction;
}

export async function acceptConfirmation(messageID: string) {
  if (size(transactionQueue) === 0) {
    return new Error('NO_CONFIRMATIONS');
  }
  const targetTransaction = findTargetTransaction(messageID);
  if (size(targetTransaction) === 0) {
    return new Error('NOT_FOUND_TARGET_TRANSACTION');
  }

  const resolve = get(targetTransaction, 'resolve', (args: any) => {});

  const transactionBody = get(
    targetTransaction,
    'data.transaction.transaction'
  );
  const input = get(targetTransaction, 'data.transaction.input');

  // check account
  const {
    address: fromAddress,
    index = 0,
    importType,
  } = <AccountData>await getSelectedAccountInfo();

  let signedTransaction;
  try {
    if (importType === 'ledger') {
      signedTransaction = await signTransactionByLedger(
        fromAddress,
        index,
        transactionBody,
        input
      );
    } else {
      signedTransaction = await authTransaction(transactionBody, input);
    }
    resolve({
      success: true,
      data: signedTransaction,
      messageID,
    });
  } catch (error) {
    console.warn(error);
    resolve({
      success: false,
      data: signedTransaction,
      messageID,
    });
  }

  // 删除目标交易 关闭模态框
  deleteTargetTransaction(messageID);
  closeSignModalWindow();

  // 判断待签名列表
  if (size(transactionQueue) > 0) {
    createSignModalWindow();
  }
  return true;
}

export async function rejectConfirmation(messageID: string) {
  if (size(transactionQueue) === 0) {
    return Promise.reject(new Error('NO_CONFIRMATIONS'));
  }
  const targetTransaction = findTargetTransaction(messageID);
  if (size(targetTransaction) === 0) {
    return Promise.reject(new Error('NOT_FOUND_TARGET_TRANSACTION'));
  }

  const resolve = get(targetTransaction, 'resolve', (args: any) => {});

  resolve({
    success: false,
    data: 'Confirmation declined by user',
    messageID,
  });

  // 删除目标交易 关闭模态框
  deleteTargetTransaction(messageID);
  closeSignModalWindow();

  // 判断待签名列表
  if (size(transactionQueue) > 0) {
    createSignModalWindow();
  }
  return true;
}
