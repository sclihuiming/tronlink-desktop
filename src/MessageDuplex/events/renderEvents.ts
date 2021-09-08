import { ipcRenderer } from 'electron';
import { get } from 'lodash';
import { simplexMessageEntryType } from '../../constants';
import { setAccounts } from '../../renderer/reducers/appReducer';
import store from '../../renderer/store/index';

function dispatchEvents(event: any, args: any) {
  const method: string = get(args, 'method');
  const params = get(args, 'params');
  switch (method) {
    case 'ipc-example':
      console.log('dispatchEvents:', params);
      break;
    case 'setAccounts':
      console.log('setAccounts:', params);
      store.dispatch(setAccounts(params));
      break;
    default:
      break;
  }
}

export function bindEvents(): void {
  console.log('bindEvents');
  ipcRenderer.on(
    simplexMessageEntryType.main2Render,
    (event: any, args: any) => {
      console.log('bindEvents', event, args);
      dispatchEvents(event, args);
    }
  );
}

export const a = 1;
