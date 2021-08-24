const { contextBridge } = require('electron');
const { createTronWebInstance } = require('../hooks/tronWebHook');

// contextIsolation=false
window.tronWeb = createTronWebInstance();
