const { ipcRenderer } = require('electron');
const { nanoid } = require('nanoid');
const { get } = require('lodash');

const outgoing = new Map();

function send(...args) {
  ipcRenderer.send('render2Main_simplex', ...args);
  return null;
}

function invoke(...args) {
  return ipcRenderer.invoke('render2Main_duplex', ...args);
}

function sendOrInvoke(method, params, ack = false) {
  const args = {
    method,
    params,
  };

  if (ack) {
    return invoke(args);
  }
  return send(args);
}

function getInitParams() {
  return sendOrInvoke('getInitParams', null, true);
}

function signTransaction(transaction) {
  return new Promise((resolve, reject) => {
    const messageID = nanoid();

    outgoing.set(messageID, resolve);
    sendOrInvoke(
      'signTransaction',
      {
        transaction,
        messageID,
      },
      false
    );
  });
}

function bindEvents(dispatchEvents) {
  ipcRenderer.on('main2Render_simplex', (event, args) => {
    const method = get(args, 'method');
    const params = get(args, 'params', {});
    switch (method) {
      case 'signTransactionReply':
        // eslint-disable-next-line no-case-declarations
        const { messageID, error, data } = params;
        if (!outgoing.has(messageID)) return;
        if (error) outgoing.get(messageID)(Promise.reject(data));
        else outgoing.get(messageID)(data);
        outgoing.delete(messageID);
        break;
      default:
        dispatchEvents(event, args);
    }
  });
}

module.exports = {
  getInitParams,
  signTransaction,
  bindEvents,
};
