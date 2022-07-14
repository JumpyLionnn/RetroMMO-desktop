import { app, BrowserWindow, ipcMain, protocol, shell, safeStorage } from 'electron';
import * as path from 'path';
import * as fs from "fs";
import { windowTitle, gameUrl, oldGameUrl } from './constants';
import Store from "electron-store";

let store: Store;

function clientLog(win: BrowserWindow, message: string){
    win.webContents.send("log", message);
}

function createWindow () {
    const win = new BrowserWindow({
        title: windowTitle,
        icon: "./assets/favicon.png",
        webPreferences: {
        preload: path.join(__dirname, 'preload.js')
        }
    });
    
    
    win.setMenuBarVisibility(false);

    if(DEBUG)
        win.webContents.openDevTools();
    
    win.loadURL(GAME_VERSION == "old" ? oldGameUrl : gameUrl);
    win.webContents.on('did-finish-load', () => {
        const cssPath = GAME_VERSION === "old" ? "css/styleForOld.css" : "css/style.css";
        fs.readFile(path.resolve(__dirname, cssPath), {encoding: "utf-8"}, (error, css) => {
            if(error){
                console.error("error:", error);
                clientLog(win,"error: " + error);
            }  
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

    ipcMain.addListener("save-email", (event: any, login: {email: string}) => {
        if(safeStorage.isEncryptionAvailable()){
            try{
                store.set("login.email", safeStorage.encryptString(login.email));
            }
            catch{
                console.error("error: encryption failed");
                clientLog(win, "error: encryption failed");
            }
        }
        else{
            // still uses a basic encryption
            store.set("login.email", login.email);
        }
    });

    ipcMain.handle("get-email", (event: any) => {
        const email = <string | undefined>store.get("login.email");
        if(email){
            if(safeStorage.isEncryptionAvailable()){
                try{
                    return safeStorage.decryptString(Buffer.from(email, "utf-8"));
                }
                catch{
                    console.error("error: decryption failed.");
                    clientLog(win,"error: decryption failed.");
                    return undefined;   
                }

            }
            else{
                return email;
            }
        }  
        else{
            return undefined;
        }
    });

    function checkWindowVisibility(win: BrowserWindow){
        win.webContents.send("focus-change");
        ipcMain.once("focus-change-reply", (event, mute) => {
            win.webContents.setAudioMuted((!win.isFocused() && (!win.isAlwaysOnTop() || win.isMinimized())) && mute);
        });
    }
    
    win.on("blur", () => checkWindowVisibility(win));
    win.on("focus", () => checkWindowVisibility(win));
    win.on("always-on-top-changed", () => checkWindowVisibility(win));

    win.addListener("resize", () => {
        if(win.isAlwaysOnTop()){
            store.set("pinnedSize.size", win.getSize());
        }
    });

    win.addListener("move", () => {
        if(win.isAlwaysOnTop()){
            store.set("pinnedSize.position", win.getPosition());
        }
    });
  
}

app.whenReady().then(() => {
    
    protocol.registerFileProtocol('desktopmmo', (request: any, callback: any) => {
        const url = request.url.replace('desktopmmo://', '');
        try {
            return callback(decodeURIComponent(path.resolve(__dirname, url)))
        }
        catch (error) {
            // Handle the error as needed
            console.error(error);
        }
    });

    if(safeStorage.isEncryptionAvailable()){
        store = new Store();
    }
    else{
        /* 
        setting here a random encryptionKey because, if a user looks through the config directory and finds the 
        config file, since it's just a JSON file, they may be tempted to modify it. By providing an encryption key, 
        the file will be obfuscated, which should hopefully deter any users from doing so.
        */
        
        store = new Store({encryptionKey: "kjrz43jkqb64npgnelkfzj3w4r4p3kfm;lqsd"});
    }
    

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