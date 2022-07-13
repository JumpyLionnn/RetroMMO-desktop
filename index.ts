import { app, BrowserWindow, ipcMain, protocol, shell } from 'electron';
import * as path from 'path';
import * as fs from "fs";
import { windowTitle, gameUrl, settingKeyPrefix } from './constants';
import Store from "electron-store";

const store = new Store();

function createWindow () {
    const win = new BrowserWindow({
        title: windowTitle,
        icon: "./assets/favicon.png",
        webPreferences: {
        preload: path.join(__dirname, 'preload.js')
        }
    });
    
    
    win.setMenuBarVisibility(false);
    
    //debug
    win.webContents.openDevTools();
    
   
    win.loadURL(gameUrl);
    win.webContents.on('did-finish-load', () => {
        fs.readFile("style.css", {encoding: "utf-8"}, (error, css) => {
            win.webContents.insertCSS(css);
        });
    });

    // handling links from inside the application
    win.webContents.on('new-window', function(e: Event, url: string) {
        e.preventDefault();
        shell.openExternal(url);
    });

    // setting up the stay on top feature
    ///////////////////////////////////////
    // non pinned size
    // for restoring this size after an unpin
    let regularSize = win.getSize();
    let regularPosition = win.getPosition();

    // window starts maximized
    win.maximize();
    let maximized = win.isMaximized();

    ipcMain.addListener("stayOnTopStateChange", async (event: any, state: {value: boolean}) => {
        win.setAlwaysOnTop(state.value);
        if(state.value){
            const pinnedSize = <{size: number[], position: number[]} | undefined>store.get("pinnedSize");
            maximized = win.isMaximized();
            if(!maximized){
                regularSize = win.getSize();
                regularPosition = win.getPosition();
            }
            
            if(maximized)
            win.unmaximize();
            if(pinnedSize){
                console.log(pinnedSize);
                win.setSize(pinnedSize.size[0], pinnedSize.size[1]);
                win.setPosition(pinnedSize.position[0], pinnedSize.position[1]);
            }
        }
        else{
            win.setSize(regularSize[0], regularSize[1]);
            win.setPosition(regularPosition[0], regularPosition[1]);
            if(maximized){
                win.maximize();
            }
            
        }
    });

    win.addListener("resize", () => {
        if(win.isAlwaysOnTop()){
            store.set("pinnedSize", {size: win.getSize(), position: win.getPosition()});
        }
    });

    win.addListener("move", () => {
        if(win.isAlwaysOnTop()){
            store.set("pinnedSize", {size: win.getSize(), position: win.getPosition()});
        }
    });
  
}

app.whenReady().then(() => {
    
    protocol.registerFileProtocol('desktopmmo', (request: any, callback: any) => {
        const url = request.url.replace('desktopmmo://', '');
        try {
            return callback(decodeURIComponent(url))
        }
        catch (error) {
            // Handle the error as needed
            console.error(error);
        }
    });
    

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