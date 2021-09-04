import TronWeb from 'tronweb';

let tronWebInstance: any;

const fullNode = 'https://api.nileex.io';
const eventServer = 'https://event.nileex.io';

function initTronweb() {
  if (!tronWebInstance)
    tronWebInstance = new TronWeb(fullNode, fullNode, eventServer);
}

export function getTronwebInstance() {
  return tronWebInstance;
}

export const a = 1;

initTronweb();
