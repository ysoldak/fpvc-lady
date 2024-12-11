const electron = require('electron');
const createServer = require('http');
const parse = require('url');
const next = require('next');
const { app, BrowserWindow } = electron;
// const path = require('path');

let mainWindow;

app.on('ready', async () => {

  // Use server-side rendering for both dev and production builds
  const nextApp = next({
    dev: false,
    dir: app.getAppPath() + '/'
  });
  const requestHandler = nextApp.getRequestHandler();

  // Build the renderer code and watch the files
  await nextApp.prepare();

  // Create a new native HTTP server (which supports hot code reloading)
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    requestHandler(req, res, parsedUrl)
  }).listen(3000, () => {
    console.log('> Ready on http://localhost:3000')
  })

  mainWindow = new BrowserWindow({
      width: 1024,
      height: 856
  });

  //  mainWindow.setTitle('FPVCManager: ' + `file://${path.join(__dirname, '../build/index.html')}`);
  // mainWindow.loadURL(`file://${path.join(__dirname, '../build/index.html')}`);

  mainWindow.setTitle('FPVCManager');  
  mainWindow.loadURL('http://localhost:3000/')

  mainWindow.on('closed', () => {
      mainWindow = null;
      app.quit()
  });
  
});

/*
const electron = require('electron');
const { app, BrowserWindow } = electron;
const path = require('path');
const isDev = require('electron-is-dev');

import electron from 'electron';
import path from 'path';
import isDev from 'electron-is-dev';
const { app, BrowserWindow } = electron;


let mainWindow = null;
app.on('ready', createWindow);
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
});
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 856,
    title: "FPVC Experimental Window"
  });
  mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
  mainWindow.on('closed', function () {
    mainWindow = null
  })
  mainWindow.on('page-title-updated', function (e) {
    e.preventDefault()
  });
}
*/