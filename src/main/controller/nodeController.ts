import { get, find, concat, size, map } from 'lodash';
import TronWeb from 'tronweb';
import { changeNodeId } from '../../MessageDuplex/handlers/mainApi';
import { getDBInstance } from '../store';

const TRON_GRID_API_KEY = 'f20ce1cd-dd43-4dfc-9db6-6cbfe4d554d9';
const nodes = [
  {
    nodeId: '99def0880e627a80d9f7f7655426b05541b99f15',
    name: 'Mainnet (trongrid)',
    fullNode: 'https://api.trongrid.io',
    eventServer: 'https://api.trongrid.io',
    default: true, // false
    netType: 0,
    headers: {
      'TRON-PRO-API-Key': TRON_GRID_API_KEY,
    },
  },
  {
    nodeId: '6265f8e7676d66d70b90b049230024bf6ed52d93',
    name: 'Nile Testnet',
    fullNode: 'https://api.nileex.io',
    eventServer: 'https://event.nileex.io',
    default: false,
    netType: 1,
  },
];

// TODO: 需要改成正式网
const defaultSelectedNode = '6265f8e7676d66d70b90b049230024bf6ed52d93';

let tronWebInstance: any;

async function rebuildTronWeb(nodeInfo: any) {
  tronWebInstance = new TronWeb(
    nodeInfo.fullNode,
    nodeInfo.fullNode,
    nodeInfo.eventServer
  );
}

export async function getNodeList() {
  const dbInstance = await getDBInstance();
  await dbInstance.read();
  const customNodeList = dbInstance.get('customNodeList', []).value();
  return concat(nodes, customNodeList);
}

export async function setSelectedNode(nodeId: string) {
  const nodeList = await getNodeList();
  const nodeIds = map(nodeList, 'nodeId');
  if (!nodeIds.includes(nodeId)) {
    return Promise.reject(new Error('Non-existent node id'));
  }

  const dbInstance = await getDBInstance();
  dbInstance.set('selectedNode', nodeId).write();
  await dbInstance.read();
  const nodeInfo = find(nodes, (node) => node.nodeId === nodeId) || nodes[0];
  await rebuildTronWeb(nodeInfo);
  changeNodeId(nodeId);
  return true;
}

export async function getSelectedNode() {
  const dbInstance = await getDBInstance();
  await dbInstance.read();
  let selectedNode = dbInstance.get('selectedNode', '').value();
  if (!selectedNode) {
    selectedNode = defaultSelectedNode;
    await setSelectedNode(selectedNode);
  }
  return selectedNode;
}

export async function getCurrentNodeInfo() {
  const selectedNode: string = await getSelectedNode();
  return find(nodes, (node) => node.nodeId === selectedNode) || nodes[0];
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
