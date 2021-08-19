const TronWeb = require('tronweb');
const { privateKey: priKey } = require('../constants/index');
const { injectPromise } = require('../utils/index');

let tronWeb;

function createTronWebInstance() {
    if (!(tronWeb instanceof TronWeb)) {
        tronWeb = createTronWeb();

        const _proto = Object.getPrototypeOf(tronWeb);

        for (let key in _proto) {
            tronWeb[key] = _proto[key].bind(tronWeb)
        }
        tronWeb.ready = true;
        tronWeb.defaultAddress.name = 'test';
        tronWeb.defaultAddress.type = 1;
        tronWeb.defaultPrivateKey = false
    }

    tronWeb.trx.sign = (...args) => {
        console.log('sign****', args)
        return sign(...args)
    };

    return tronWeb
}

function createTronWeb() {
    const serverAddress = 'https://api.nileex.io';
    const eventServer = 'https://event.nileex.io';
    const _tronWeb = new TronWeb(
        serverAddress,
        serverAddress,
        eventServer,
        priKey
    )
    _tronWeb.defaultPrivateKey = false
    return _tronWeb;
}

function sign(transaction, privateKey = priKey, useTronHeader = true, callback = false) {
    console.log('signsign', transaction, privateKey, useTronHeader, callback);
    if (Object.prototype.toString.call(privateKey).slice(8, -1) === 'Function') {
        callback = privateKey;
        privateKey = priKey;
    }

    if (Object.prototype.toString.call(useTronHeader).slice(8, -1) === 'Function') {
        callback = useTronHeader;
        useTronHeader = true;
    }

    const _tronWeb = createTronWeb();
    console.log('privateKey', transaction, privateKey, useTronHeader)
    return _tronWeb.trx.sign(transaction, privateKey, useTronHeader, callback);
}


module.exports = {
    createTronWebInstance
}
