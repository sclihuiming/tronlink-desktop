import { get } from 'lodash';
import { InjectData } from '../../types';
import { getCurrentNodeInfo } from './nodeController';
import { getSelectedAccountInfo } from './accountController';

export * as accountController from './accountController';
export * as dappController from './dappController';
export * as nodeController from './nodeController';
export * as transactionController from './transactionController';

export async function getInitParams(): Promise<InjectData> {
  const accountInfo = await getSelectedAccountInfo();
  const nodeInfo = await getCurrentNodeInfo();
  const importType = get(accountInfo, 'importType');
  let type = 1;
  switch (importType) {
    case 'mnemonic':
      type = 0;
      break;
    case 'ledger':
      type = 2;
      break;
    default:
      type = 1;
  }

  return {
    accountInfo: {
      address: get(accountInfo, 'address'),
      name: get(accountInfo, 'name'),
      type,
    },
    nodeInfo: {
      fullNode: nodeInfo.fullNode,
      eventServer: nodeInfo.eventServer,
    },
  };
}
