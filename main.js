// Modules to control application life and create native browser window
const {app, BrowserWindow, session, ipcMain } = require('electron')
const path = require('path')
const partition = 'persist:serviceworker-partition';

function createWindow (preloadScript) {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      nodeIntegrationInWorker: true,
      preload: path.join(__dirname, preloadScript),
      partition: partition
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')

  return mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  const command = app.commandLine.getSwitchValue('command');
  if (command === 'cleanup') {
    console.info('* * * cleaning up...');
    session.fromPartition(partition)
      .clearStorageData({storages: ['serviceworkers']})
      .then(() => {
        console.info('* * * cleaning up...done');
        app.quit();
      });
  } else if (command === 'install-sw') {
    console.info('* * * installing service worker...');
    ipcMain.on('IPC_SW_INSTALLED', (e, arg) => {
      console.info('* * * installing service worker...done');
      app.quit();
    });
    ipcMain.on('IPC_SW_FAILED', (e, arg) => {
      console.info('* * * installing service worker...failed');
      app.quit();
    });
    createWindow('preload-install.js');
  } else {
    const mainWindow = createWindow('preload.js');
    mainWindow.webContents.on('crashed', () =>
      console.info('* * * renderer process is crashed...'));
    mainWindow.once('ready-to-show', () => {
      mainWindow.show();
      mainWindow.webContents.openDevTools();
    });
  }
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
