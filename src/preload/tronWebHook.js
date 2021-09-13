/* eslint-disable no-param-reassign */
const { get } = require('lodash');
const TronWeb = require('tronweb');
const { getInitParams, signTransaction } = require('./MessageDuplex');
const { ProxiesProvider } = require('./ProxiesProvider');
const { injectPromise } = require('./utils');

const priKey =
  '0c6e219d4c53649a14c2613c3a123a7b084d7c8caf67325ed8e2fb137fbcc943';

let tronWebLocal;

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
  if (!(tronWebLocal instanceof TronWeb)) {
    tronWebLocal = createTronWeb();

    tronWebLocal.ready = true;
    tronWebLocal.defaultAddress.name = 'test';
    tronWebLocal.defaultAddress.type = 1;
    tronWebLocal.defaultPrivateKey = false;
  }

  tronWebLocal.trx.sign = (...args) => {
    return sign(...args);
  };

  return tronWebLocal;
}

function setHeaderInternal(headers = {}, tronWeb) {
  tronWeb.fullNode.configure(tronWeb.fullNode.host, headers);
  tronWeb.solidityNode.configure(tronWeb.solidityNode.host, headers);
  tronWeb.eventServer.configure(tronWeb.eventServer.host, headers);
}

function signInternal(params, tronWebIns) {
  const [transaction] = params;
  let [, privateKey = priKey, useTronHeader = true, callback] = params;
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

  if (!callback) {
    return injectPromise(signInternal, transaction, privateKey, useTronHeader);
  }

  if (privateKey) {
    return tronWebIns.trx.sign(
      transaction,
      privateKey,
      useTronHeader,
      callback
    );
  }

  if (!transaction) {
    return callback('Invalid transaction provided');
  }

  if (!tronWebIns.ready) {
    return callback('User has not unlocked wallet');
  }

  // eslint-disable-next-line no-underscore-dangle
  const payload = transaction.__payload__;
  const inputValue =
    typeof transaction === 'string'
      ? transaction
      : payload || transaction.raw_data.contract[0].parameter.value;

  return signTransaction({
    transaction,
    useTronHeader,
    input: inputValue,
  })
    .then((transactionRes) => callback(null, transactionRes))
    .catch((err) => {
      callback(err);
    });
}

async function createTronInstance() {
  const res = await getInitParams();
  const accountInfo = get(res, 'data.accountInfo', {});
  const nodeInfo = get(res, 'data.nodeInfo', {});

  const tronWeb = new TronWeb(
    new ProxiesProvider(),
    new ProxiesProvider(),
    new ProxiesProvider()
  );

  // setAddress
  tronWeb.setAddress(accountInfo.address);
  tronWeb.defaultAddress.name = accountInfo.name;
  tronWeb.defaultAddress.type = accountInfo.type;

  // setNode
  tronWeb.fullNode.configure(nodeInfo.fullNode);
  tronWeb.solidityNode.configure(nodeInfo.fullNode);
  tronWeb.eventServer.configure(nodeInfo.eventServer);

  // Binding internal methods
  tronWeb.setHeader = (...args) => setHeaderInternal(...args, tronWeb);
  tronWeb.trx.sign = (...args) => {
    return signInternal(args, tronWeb);
  };

  tronWeb.ready = true;
  tronWeb.defaultPrivateKey = false;
  const tronLink = {
    ready: true,
    tronWeb,
  };

  return { tronWeb, tronLink };
}

function setGlobalProvider(_tronWebProvider, _tronLinkProvider) {
  _tronWebProvider.isTronLink = true;
  _tronLinkProvider.isTronLink = true;

  window.tronWeb = new Proxy(_tronWebProvider, {
    deleteProperty: () => true,
  });
  window.tronLink = new Proxy(_tronLinkProvider, {
    deleteProperty: () => true,
  });
}

function bindEvents() {}

function injectTronWebPropertyToWindow() {
  const { tronWeb, tronLink } = createTronInstance();
  setGlobalProvider(tronWeb, tronLink);
  window.dispatchEvent(new Event('tronLink#initialized'));
}

module.exports = {
  createTronWebInstance,
  injectTronWebPropertyToWindow,
};
