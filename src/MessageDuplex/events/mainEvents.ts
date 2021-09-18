import { ipcMain } from 'electron';
import { get } from 'lodash';
import {
  simplexMessageEntryType,
  duplexMessageEntryType,
} from '../../constants';
import { Response } from '../../types';

import {
  accountController,
  dappController,
  getInitParams,
  transactionController,
  systemController,
} from '../../main/controller/index';

const makeResponseData = async (dataP: Promise<any>) => {
  let msg = '';
  let data = '';
  let code = 200;
  try {
    data = await dataP;
  } catch (error) {
    msg = error.message;
    code = 1000;
  }

  return <Response>{
    code,
    data,
    msg,
  };
};

function dispatchInvokeEvent(event: any, args: any) {
  const method: string = get(args, 'method');
  const params = get(args, 'params');
  switch (method) {
    case 'getAccount':
      return null;
    case 'getAccounts':
      return makeResponseData(accountController.getAccounts());
    case 'addAccount':
      return makeResponseData(accountController.addAccount(params));
    case 'setSelectedAddress':
      return makeResponseData(accountController.setSelectedAddress(params));
    case 'getSelectedAddress':
      return makeResponseData(accountController.getSelectedAddress());
    case 'getDappList':
      return makeResponseData(dappController.getDappList());
    case 'addDappData':
      return makeResponseData(dappController.addDappData(params));
    case 'getInitParams':
      return makeResponseData(getInitParams());
    case 'getTransactions':
      return makeResponseData(transactionController.getTransactions());
    case 'rejectConfirmation':
      return makeResponseData(transactionController.rejectConfirmation(params));
    case 'acceptConfirmation':
      return makeResponseData(transactionController.acceptConfirmation(params));
    case 'registerNewUser':
      return makeResponseData(systemController.registerNewUser(params));
    case 'isNewUser':
      return makeResponseData(systemController.isNewUser());
    case 'login':
      return makeResponseData(systemController.login(params));
    default:
      return null;
  }
}

function dispatchCommonEvent(event: any, args: any) {
  const method: string = get(args, 'method');
  const params = get(args, 'params');
  switch (method) {
    case 'getAccount':
      return null;
    case 'ipc-example':
      event.reply(simplexMessageEntryType.main2Render, {
        method: 'ipc-example',
        data: 'test-example',
      });
      return null;
    case 'signTransaction':
      return transactionController.signTransaction(event, params);
    default:
      return null;
  }
}

function bindInvokeEvents() {
  ipcMain.handle(
    duplexMessageEntryType.render2Main,
    (event: any, args: any) => {
      return dispatchInvokeEvent(event, args);
    }
  );
}

function bindCommonEvents() {
  ipcMain.on(simplexMessageEntryType.render2Main, (event: any, args: any) => {
    return dispatchCommonEvent(event, args);
  });
}

export function bindEvents(): void {
  bindInvokeEvents();
  bindCommonEvents();
}

export const a1 = 1;
