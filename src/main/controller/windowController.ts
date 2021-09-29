/* eslint global-require: off, no-console: off */
import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import log from 'electron-log';
import { autoUpdater } from 'electron-updater';
import { addWindow, deleteWindow } from '../store/windowManager';
import MenuBuilder from '../menu';
import { resolveHtmlPath } from '../../utils';

let mainWindow: BrowserWindow | null = null;
let modalWindow: BrowserWindow | null = null;

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(log.error);
};

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

export function createModalWindow(url: string, parentWindow: BrowserWindow) {
  if (modalWindow) {
    modalWindow.close();
    deleteWindow(modalWindow);
    modalWindow = null;
  }

  modalWindow = new BrowserWindow({
    parent: parentWindow,
    modal: true,
    show: false,
    width: 660,
    height: 600,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
    },
  });
  modalWindow.loadURL(url);
  modalWindow.once('ready-to-show', () => {
    if (modalWindow) {
      modalWindow.show();
      modalWindow.focus();
    }
  });

  modalWindow.on('closed', () => {
    deleteWindow(<BrowserWindow>modalWindow);
    modalWindow = null;
  });
}

export function createSignModalWindow() {
  const url = `${resolveHtmlPath('index.html')}?sign=true`;
  if (mainWindow) {
    createModalWindow(url, mainWindow);
  }
}

export function closeSignModalWindow() {
  if (modalWindow) {
    modalWindow.close();
    deleteWindow(<BrowserWindow>modalWindow);
    modalWindow = null;
  }
}

export async function createMainWindow() {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1250,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, '../../preload/preload.common.js'),
      contextIsolation: false,
      nodeIntegration: true,
      webviewTag: true,
    },
  });

  // console.log('resolveHtmlPath:', resolveHtmlPath('index.html'));
  mainWindow.loadURL(resolveHtmlPath('index.html'));
  // mainWindow.loadURL('http://123.56.166.152:18096/#/home');

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/main/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  addWindow(mainWindow);

  mainWindow.on('closed', () => {
    deleteWindow(<BrowserWindow>mainWindow);
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.on('new-window', (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
}

export function activateWindow() {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createMainWindow();
}
