const TronWeb = require('tronweb');
const axios = require('axios');

const { HttpProvider } = TronWeb.providers;

class ProxiesProvider extends HttpProvider {
  constructor(chainType = 0) {
    super('http://127.0.0.1');

    this.ready = false;
    this.queue = [];
    this.chainType = chainType;
  }

  configure(url, headers = {}) {
    this.host = url;
    this.instance = axios.create({
      baseURL: url,
      timeout: 30000,
      headers,
    });

    this.ready = true;

    while (this.queue.length) {
      const { args, resolve, reject } = this.queue.shift();

      this.request(...args)
        .then(resolve)
        .catch(reject);
    }
  }

  request(endpoint, payload = {}, method = 'get') {
    if (!this.ready) {
      return new Promise((resolve, reject) => {
        this.queue.push({
          args: [endpoint, payload, method],
          resolve,
          reject,
        });
      });
    }

    return super.request(endpoint, payload, method).then((res) => {
      const response = res.transaction || res;
      Object.defineProperty(response, '__payload__', {
        writable: false,
        enumerable: false,
        configurable: false,
        value: { ...payload, chainType: this.chainType },
      });
      return res;
    });
  }
}

module.exports = {
  ProxiesProvider,
};
