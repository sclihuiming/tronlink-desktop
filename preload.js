const { contextBridge } = require('electron')
const { createTronWebInstance } = require('./hooks/tronWebHook')

// contextBridge.exposeInMainWorld(
//   'tronWeb',
//   createTronWebInstance()
// )

window.tronWeb = createTronWebInstance();
console.log(window.tronWeb)


// window.addEventListener('DOMNodeInserted', () => {
//   window.tronWeb = createTronWebInstance();
// })



// DOMNodeInserted
// window.addEventListener('DOMContentLoaded', () => {
//   const injectionSite = (document.head || document.documentElement);
//   const container = document.createElement('script');

//   // container.src = path.join('./pageHook/index.js');
//   container.text = fs.readFileSync(path.join(__dirname, './pageHook/index.js'))
//   container.onload = function () {
//     this.parentNode.removeChild(this);
//   };

//   injectionSite.insertBefore(
//     container,
//     injectionSite.children[0]
//   );

//   console.info('TronLink injected');
// })


// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
// window.addEventListener('DOMContentLoaded', () => {
//   const replaceText = (selector, text) => {
//     const element = document.getElementById(selector)
//     if (element) element.innerText = text
//   }

//   for (const type of ['chrome', 'node', 'electron']) {
//     replaceText(`${type}-version`, process.versions[type])
//   }
// })
