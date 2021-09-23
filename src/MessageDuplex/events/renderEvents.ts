import { ipcRenderer } from 'electron';
import { get } from 'lodash';
import { simplexMessageEntryType } from '../../constants';
import {
  setAccounts,
  setSelectedAddress,
  setNodeId,
  setLanguage,
} from '../../renderer/reducers/appReducer';
import { setDappList } from '../../renderer/reducers/dappReducer';
import store from '../../renderer/store/index';

function dispatchEvents(event: any, args: any) {
  const method: string = get(args, 'method');
  const params = get(args, 'params');
  switch (method) {
    case 'ipc-example':
      break;
    case 'setAccounts':
      store.dispatch(setAccounts(params));
      break;
    case 'setSelectedAddress':
      store.dispatch(setSelectedAddress(params));
      break;
    case 'setDappList':
      store.dispatch(setDappList(params));
      break;
    case 'changeNodeId':
      store.dispatch(setNodeId(params));
      break;
    case 'changeLanguage':
      store.dispatch(setLanguage(params));
      break;
    default:
      break;
  }
}

export function bindEvents(): void {
  ipcRenderer.on(
    simplexMessageEntryType.main2Render,
    (event: any, args: any) => {
      dispatchEvents(event, args);
    }
  );
}

export const a = 1;
