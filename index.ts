import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from "fs";

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        title: "RetroMMO",
        webPreferences: {
        preload: path.join(__dirname, 'preload.js')
        }
        
    });

    win.webContents.openDevTools();

    win.setMenuBarVisibility(false);

    win.maximize();
    win.loadURL("https://retrommo2.herokuapp.com");
    win.webContents.on('did-finish-load', () => {
        fs.readFile("style.css", {encoding: "utf-8"}, (error, css) => {
            win.webContents.insertCSS(css);
        });
    });

    ipcMain.addListener("stayOnTopStateChange", (event, state: {value: boolean}) => {
        win.setAlwaysOnTop(state.value);
    });
  
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