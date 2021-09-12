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

export function getInitParams() {
  return sendOrInvoke('getInitParams', null, true);
}

export function signTransaction(transaction) {
  return sendOrInvoke('signTransaction', transaction, true);
}

export function bindEvents(dispatchEvents) {
  ipcRenderer.on('main2Render_simplex', (event, args) => {
    dispatchEvents(event, args);
  });
}
