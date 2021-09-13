const { ipcRenderer } = require('electron');

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
  return sendOrInvoke('signTransaction', transaction, true);
}

function bindEvents(dispatchEvents) {
  ipcRenderer.on('main2Render_simplex', (event, args) => {
    dispatchEvents(event, args);
  });
}

module.exports = {
  getInitParams,
  signTransaction,
  bindEvents,
};
