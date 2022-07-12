import { app, BrowserWindow, ipcMain, protocol, shell } from 'electron';
import * as path from 'path';
import * as fs from "fs";
import { windowTitle, gameUrl, settingKeyPrefix } from './constants';


// local storage
///////////////////
async function getLocalStorage(win: BrowserWindow, key: string): Promise<string | null>{
    return await win.webContents.executeJavaScript(`localStorage.getItem("${settingKeyPrefix + key}");`, true);
}
async function setLocalStorage(win: BrowserWindow, key: string, value: string | null){
    await win.webContents.executeJavaScript(`localStorage.setItem("${settingKeyPrefix + key}", "${value?.replaceAll("\"", "\\\"")}");`, true);
}
////////////////////


function createWindow () {
    const win = new BrowserWindow({
        title: windowTitle,
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
            const pinnedSizeStr = await getLocalStorage(win, "pinnedSize");
            maximized = win.isMaximized();
            if(!maximized){
                regularSize = win.getSize();
                regularPosition = win.getPosition();
            }
            
            if(maximized)
                win.unmaximize();
            if(pinnedSizeStr){
                const pinnedSize = JSON.parse(pinnedSizeStr);
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
            setLocalStorage(win, "pinnedSize", JSON.stringify({size: win.getSize(), position: win.getPosition()}));
        }
    });

    win.addListener("move", () => {
        if(win.isAlwaysOnTop()){
            setLocalStorage(win, "pinnedSize", JSON.stringify({size: win.getSize(), position: win.getPosition()}));
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