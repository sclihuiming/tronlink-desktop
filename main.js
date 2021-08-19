// Modules to control application life and create native browser window
const {app, BrowserWindow, BrowserView} = require('electron')
const path = require('path')

function createWindow () {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1300,
    height: 800,
    // webPreferences: {
    //   preload: path.join(__dirname, 'preload.js'),
    //   nodeIntegration: false,
    //   contextIsolation: false
    // }
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  // mainWindow.loadURL('http://localhost:3000')
  // mainWindow.loadURL('http://123.56.166.152:18096/#/home')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  const view = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: false
    }
  })
  mainWindow.setBrowserView(view)
  view.setBounds({ x: 10, y: 10, width: 1250, height: 750 })
  // view.webContents.loadURL('https://nile.tronscan.org/')
  view.webContents.loadURL('http://123.56.166.152:18096/#/home')
  // view.webContents.executeJavaScript("window.tronWeb = {ready: true, defaultAddress: {base58: 'TRM11TZjzC8Gksria7tpYZvHEWpGW2T68r'}}")

  view.webContents.openDevTools()

  // mainWindow.webContents.executeJavaScript("window.tronWeb = 1232")

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
