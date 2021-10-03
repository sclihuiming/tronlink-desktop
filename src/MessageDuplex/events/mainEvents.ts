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
  nodeController,
  commonController,
  ledgerController,
  mnemonicController,
} from '../../main/controller/index';

const makeResponseData = async (dataP: Promise<any>) => {
  let msg = '';
  let data = '';
  let code = 200;
  try {
    data = await dataP;
  } catch (error: any) {
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
    case 'removeAccount':
      return makeResponseData(accountController.removeAccount(params));
    case 'getSelectedAccountInfo':
      return makeResponseData(accountController.getSelectedAccountInfo());
    case 'getDappList':
      return makeResponseData(dappController.getDappList());
    case 'addDappData':
      return makeResponseData(dappController.addDappData(params));
    case 'removeDappData':
      return makeResponseData(dappController.removeDappData(params));
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
    case 'isLogin':
      return makeResponseData(systemController.isLogin());
    case 'login':
      return makeResponseData(systemController.login(params));
    case 'logOut':
      return makeResponseData(systemController.logOut());
    case 'getLanguage':
      return makeResponseData(systemController.getLanguage());
    case 'setLanguage':
      return makeResponseData(systemController.setLanguage(params));
    case 'getNodeId':
      return makeResponseData(nodeController.getSelectedNode());
    case 'getCurrentNodeInfo':
      return makeResponseData(nodeController.getCurrentNodeInfo());
    case 'getNodeList':
      return makeResponseData(nodeController.getNodeList());
    case 'changeNode':
      return makeResponseData(commonController.changeNode(params));
    case 'checkTransport':
      return makeResponseData(ledgerController.checkTransport(params));
    case 'getAddressInfo':
      return makeResponseData(ledgerController.getAddressInfo(params));
    case 'generateMnemonic':
      return makeResponseData(mnemonicController.generateMnemonic());
    case 'generateMnemonicChinese':
      return makeResponseData(
        mnemonicController.generateMnemonicChinese(params)
      );
    case 'validateMnemonic':
      return makeResponseData(mnemonicController.validateMnemonic(params));
    case 'validateMnemonicChinese':
      return makeResponseData(
        mnemonicController.validateMnemonicChinese(params)
      );
    case 'batchGenerateAccount':
      return makeResponseData(mnemonicController.batchGenerateAccount(params));
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
