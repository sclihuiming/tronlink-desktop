const { contextBridge } = require('electron');
const {
  createTronWebInstance,
  injectTronWebPropertyToWindow,
} = require('./tronWebHook');

// contextIsolation=false
// window.tronWeb = createTronWebInstance();
injectTronWebPropertyToWindow();
