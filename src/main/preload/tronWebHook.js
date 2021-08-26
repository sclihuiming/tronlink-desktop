/* eslint-disable no-param-reassign */
const TronWeb = require('tronweb');

const priKey =
  '0c6e219d4c53649a14c2613c3a123a7b084d7c8caf67325ed8e2fb137fbcc943';

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

function sign(
  transaction,
  privateKey = priKey,
  useTronHeader = true,
  callback
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

function createTronWebInstance() {
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

module.exports = {
  createTronWebInstance,
};
