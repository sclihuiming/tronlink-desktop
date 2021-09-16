/* eslint-disable consistent-return */
/* eslint-disable no-console */
import { get, omit, size } from 'lodash';
import { nanoid } from 'nanoid';
import { REFER_ABI, simplexMessageEntryType } from '../../constants';
import { createSignModalWindow } from './windowController';
import { getAbiCode, getTronwebInstance } from './nodeController';
import { decodeParams } from '../../utils';

const requestMap = new Map();
const transactionQueue: {
  resolve: (res: any) => void;
  reject: (res: any) => void;
  data: any;
  hostname: string;
  origin: string;
  sender?: any;
}[] = [];

export async function signTransaction(event: any, data: any) {
  const url = event.sender.getURL();
  const tmpObj = new URL(url);
  const hostname = get(tmpObj, 'hostname');
  const origin = get(tmpObj, 'origin');
  const messageID = nanoid();

  requestMap.set(messageID, (res: any) =>
    event.reply(simplexMessageEntryType.main2Render, {
      method: 'signTransactionReply',
      params: {
        messageID,
        ...res,
      },
    })
  );

  transactionQueue.push({
    resolve: (res: any) => {
      if (!requestMap.get(messageID))
        return console.warn(`Message ${messageID} expired`);

      requestMap.get(messageID)({ error: false, res });
      requestMap.delete(messageID);
    },
    reject: (res: any) => {
      if (!requestMap.get(messageID))
        return console.warn(`Message ${messageID} expired`);

      requestMap.get(messageID)({ error: true, res });
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
