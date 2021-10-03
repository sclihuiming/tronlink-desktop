import { setSelectedNode } from './nodeController';
import { refreshAccountsData } from './accountController';

export async function changeNode(nodeId: string) {
  try {
    await setSelectedNode(nodeId);
    await refreshAccountsData(true);
    return true;
  } catch (error) {
    return Promise.reject(error);
  }
}

export const a = 1;
