/* eslint-disable no-param-reassign */
const { get, size } = require('lodash');
const TronWeb = require('tronweb');
const SunWeb = require('sunweb');
const {
  getInitParams,
  signTransaction,
  bindEvents,
} = require('./MessageDuplex');
const { ProxiesProvider } = require('./ProxiesProvider');
const { injectPromise } = require('./utils');

// 代理方法
const proxiesMethods = {};

const CONTRACT_ADDRESS = {
  USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  MAIN: 'TL9q7aDAHYbW5KdPCwk8oJR3bCDhRwegFf',
  SIDE: 'TGKotco6YoULzbYisTBuP6DWXDjEgJSpYz',
  MAIN_TEST: 'TFLtPoEtVJBMcj6kZPrQrwEdM3W3shxsBU', // testnet mainchain
  SIDE_TEST: 'TRDepx5KoQ8oNbFVZ5sogwUxtdYmATDRgX', // testnet sidechain
  MAIN_TEST_NILE: 'TTYtjySdWFkZeUnQEB7cfwyxj3PD2ZsEmd',
  SIDE_TEST_NILE: 'TWLoD341FRJ43JfwTPADRqGnUT4zEU3UxG',
};

const SIDE_CHAIN_ID = '41E209E4DE650F0150788E8EC5CAFA240A23EB8EB7';

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

function setHeaderInternal(args, tronWeb) {
  const [headers = {}] = args;
  tronWeb.fullNode.configure(tronWeb.fullNode.host, headers);
  tronWeb.solidityNode.configure(tronWeb.solidityNode.host, headers);
  tronWeb.eventServer.configure(tronWeb.eventServer.host, headers);
}

function signInternal(params, tronWebSign) {
  const [transaction] = params;
  let [, privateKey, useTronHeader = true, callback] = params;
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
    return injectPromise(
      signInternal,
      tronWebSign,
      transaction,
      privateKey,
      useTronHeader
    );
  }

  if (privateKey) {
    return tronWebSign(transaction, privateKey, useTronHeader, callback);
  }

  if (!transaction) {
    return callback('Invalid transaction provided');
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

async function requestHandlerInterval(args = {}, provider) {
  if (args && args.method === 'tron_requestAccounts') {
    args.params = { ...args.params, ...provider.tronlinkParams };
  }
  // TODO:
  return {
    code: 200,
    message: 'success',
  };
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
  proxiesMethods.setAddress = tronWeb.setAddress.bind(tronWeb);

  const tronWeb1 = new TronWeb(
    new ProxiesProvider(),
    new ProxiesProvider(),
    new ProxiesProvider()
  );

  const tronWeb2 = new TronWeb(
    new ProxiesProvider(1),
    new ProxiesProvider(1),
    new ProxiesProvider(1)
  );
  const sunWeb = new SunWeb(
    tronWeb1,
    tronWeb2,
    CONTRACT_ADDRESS.MAIN,
    CONTRACT_ADDRESS.SIDE,
    SIDE_CHAIN_ID
  );

  [
    'setPrivateKey',
    'setAddress',
    'setFullNode',
    'setSolidityNode',
    'setEventServer',
  ].forEach((method) => {
    tronWeb[method] = () => new Error('TronLink has disabled this method');
  });

  // setAddress
  if (get(accountInfo, 'address')) {
    proxiesMethods.setAddress(accountInfo.address);
  }
  tronWeb.defaultAddress.name = accountInfo.name;
  tronWeb.defaultAddress.type = accountInfo.type;

  // setNode
  tronWeb.fullNode.configure(nodeInfo.fullNode);
  tronWeb.solidityNode.configure(nodeInfo.fullNode);
  tronWeb.eventServer.configure(nodeInfo.eventServer);

  // Binding internal methods
  tronWeb.setHeader = (...args) => setHeaderInternal(args, tronWeb);
  const tronWebSign = tronWeb.trx.sign.bind(tronWeb);
  tronWeb.trx.sign = (...args) => {
    return signInternal(args, tronWebSign);
  };

  tronWeb.request = (args) => {
    return requestHandlerInterval(args, tronWeb);
  };

  sunWeb.request = (args) => {
    return requestHandlerInterval(args, sunWeb);
  };

  tronWeb.ready = true;
  tronWeb.defaultPrivateKey = false;
  const tronLink = {
    ready: true,
    tronWeb,
  };

  tronLink.request = (args) => {
    return requestHandlerInterval(args, tronWeb);
  };

  return { tronWeb, tronLink, sunWeb };
}

function setGlobalProvider(
  _tronWebProvider,
  _tronLinkProvider,
  _sunWebProvider
) {
  _tronWebProvider.isTronLink = true;
  _tronLinkProvider.isTronLink = true;
  _sunWebProvider.isDeprecation = true;

  window.tronWeb = new Proxy(_tronWebProvider, {
    deleteProperty: () => true,
  });
  window.tronLink = new Proxy(_tronLinkProvider, {
    deleteProperty: () => true,
  });
  window.sunWeb = _sunWebProvider;
}

function postEvent(action, data) {
  window.postMessage(
    {
      message: {
        action,
        data,
      },
      source: 'contentScript',
      isTronLink: true,
    },
    '*'
  );
}

function dispatchEvents(event, args) {
  const method = get(args, 'method');
  const params = get(args, 'params');
  switch (method) {
    case 'setAccount_interval':
      if (get(params, 'address')) {
        proxiesMethods.setAddress(params.address);
      }
      window.tronWeb.defaultAddress.name = params.name;
      window.tronWeb.defaultAddress.type = params.type;
      postEvent('setAccount', params);
      postEvent('accountsChanged', params);
      break;
    case 'setNode_interval':
      window.tronWeb.fullNode.configure(params.fullNode);
      window.tronWeb.solidityNode.configure(params.fullNode);
      window.tronWeb.eventServer.configure(params.eventServer);
      postEvent('setNode', params);
      break;
    default:
      break;
  }
}

async function injectTronWebPropertyToWindow() {
  const { tronWeb, tronLink, sunWeb } = await createTronInstance();
  bindEvents(dispatchEvents);
  setGlobalProvider(tronWeb, tronLink, sunWeb);
  window.dispatchEvent(new Event('tronLink#initialized'));
}

module.exports = {
  createTronWebInstance,
  injectTronWebPropertyToWindow,
};
