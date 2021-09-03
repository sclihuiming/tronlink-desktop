import { ipcMain } from 'electron';
import { get } from 'lodash';
import {
  simplexMessageEntryType,
  duplexMessageEntryType,
} from '../../constants';

import { accountController } from '../../main/controller/index';

const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;

function dispatchInvokeEvent(event: any, args: any) {
  const method: string = get(args, 'method');
  const params = get(args, 'params');
  switch (method) {
    case 'getAccount':
      return null;
    case 'getAccounts':
      return {
        code: 200,
        data: [],
      };
    case 'addAccount':
      return accountController.addAccount(params);
    case 'ipc-example':
      return {
        code: 200,
        data: msgTemplate(params),
      };
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
      console.log('dispatchCommonEvent########%%%%%0000', args);
      event.reply(simplexMessageEntryType.main2Render, {
        method: 'ipc-example',
        data: msgTemplate(params),
      });
      return null;
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
