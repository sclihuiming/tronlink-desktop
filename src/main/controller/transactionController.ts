/* eslint-disable consistent-return */
/* eslint-disable no-console */
import { get } from 'lodash';
import { nanoid } from 'nanoid';
import { simplexMessageEntryType } from '../../constants';

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
}

export function getTransaction() {
  return transactionQueue;
}
