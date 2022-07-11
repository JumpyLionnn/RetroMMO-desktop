import {app, BrowserWindow} from 'electron';
import * as path from 'path';

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    title: "RetroMMO",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
    
  });

  win.setMenuBarVisibility(false);

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});