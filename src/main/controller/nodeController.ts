import { get } from 'lodash';
import TronWeb from 'tronweb';
import { getDBInstance } from '../store';

const TRON_GRID_API_KEY = 'f20ce1cd-dd43-4dfc-9db6-6cbfe4d554d9';
const nodes = {
  '99def0880e627a80d9f7f7655426b05541b99f15': {
    name: 'Mainnet (trongrid)',
    fullNode: 'https://api.trongrid.io',
    eventServer: 'https://api.trongrid.io',
    default: true, // false
    netType: 0,
    headers: {
      'TRON-PRO-API-Key': TRON_GRID_API_KEY,
    },
  },
  '6265f8e7676d66d70b90b049230024bf6ed52d93': {
    name: 'Nile Testnet',
    fullNode: 'https://api.nileex.io',
    eventServer: 'https://event.nileex.io',
    default: false,
    netType: 1,
  },
};

const defaultSelectedNode = '6265f8e7676d66d70b90b049230024bf6ed52d93';

let tronWebInstance: any;

async function getSelectedNode() {
  const dbInstance = await getDBInstance();
  await dbInstance.read();
  let selectedNode = dbInstance.get('selectedNode', '').value();
  if (!selectedNode) {
    selectedNode = defaultSelectedNode;
    dbInstance.set('selectedNode', selectedNode).write();
  }
  return selectedNode;
}

async function getNodeList() {
  const dbInstance = await getDBInstance();
  await dbInstance.read();
  const customNodeList = dbInstance.get('customNodeList', {}).value();
  return { ...nodes, ...customNodeList };
}

export async function getCurrentNodeInfo() {
  const selectedNode: string = await getSelectedNode();
  return get(nodes, selectedNode, {});
}

export function getTronwebInstance() {
  return tronWebInstance;
}

export async function getAbiCode(contractAddress: string) {
  const contract = await tronWebInstance.contract().at(contractAddress);
  return contract.abi;
}

async function initTronwebInterval() {
  if (!tronWebInstance) {
    const nodeInfo = await getCurrentNodeInfo();
    tronWebInstance = new TronWeb(
      nodeInfo.fullNode,
      nodeInfo.fullNode,
      nodeInfo.eventServer
    );
  }
}

initTronwebInterval();
