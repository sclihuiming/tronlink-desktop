const { contextBridge } = require('electron');
const { createTronWebInstance } = require('./tronWebHook');

// contextIsolation=false
window.tronWeb = createTronWebInstance();
