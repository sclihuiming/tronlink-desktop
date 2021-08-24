/* eslint-disable no-param-reassign */
import TronWeb from 'tronweb';
import { privateKey as priKey } from '../../constants/index';
// import { injectPromise } from '../../utils/index';

let tronWeb;

function createTronWeb() {
  const serverAddress = 'https://api.nileex.io';
  const eventServer = 'https://event.nileex.io';
  const tronWebIns = new TronWeb(
    serverAddress,
    serverAddress,
    eventServer,
    priKey
  );
  tronWebIns.defaultPrivateKey = false;
  return tronWebIns;
}

export function sign(
  transaction,
  privateKey = priKey,
  useTronHeader = true,
  callback: any
) {
  if (Object.prototype.toString.call(privateKey).slice(8, -1) === 'Function') {
    callback = privateKey;
    privateKey = priKey;
  }

  if (
    Object.prototype.toString.call(useTronHeader).slice(8, -1) === 'Function'
  ) {
    callback = useTronHeader;
    useTronHeader = true;
  }

  const tronWebIns = createTronWeb();
  return tronWebIns.trx.sign(transaction, privateKey, useTronHeader, callback);
}

export function createTronWebInstance() {
  if (!(tronWeb instanceof TronWeb)) {
    tronWeb = createTronWeb();

    tronWeb.ready = true;
    tronWeb.defaultAddress.name = 'test';
    tronWeb.defaultAddress.type = 1;
    tronWeb.defaultPrivateKey = false;
  }

  tronWeb.trx.sign = (...args) => {
    return sign(...args);
  };

  return tronWeb;
}
