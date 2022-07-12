import { ipcRenderer } from 'electron';
import { elementIdPrefix, hideOverlayWhenPinnedSettingName, hideSidebarWhenPinnedSettingName, settingKeyPrefix } from './constants';
import { hideOverlaysWhenPinnedDefault, hideSidebarWhenPinnedDefault } from './defaults';
import { createElement, toggleDisplay } from './elements';

// might vary between game versions
const sidebarSelector = "#game\\/sidebar";
const gameMainSelector = "#game\\/main";
const fpsCounterSelector = "#game\\/main\\/screen\\/fps-count";
const settingsPanelSelector = "#game\\/sidebar\\/content\\/settings\\/box";
const actionsPanelSelector = "#game\\/sidebar\\/content\\/actions\\/box";




window.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector<HTMLDivElement>(sidebarSelector)!;
    const gameMain = document.querySelector<HTMLDivElement>(gameMainSelector)!;

    const fpsCounter = document.querySelector<HTMLParagraphElement>(fpsCounterSelector)!;

    const settingsPanel = document.querySelector<HTMLDivElement>(settingsPanelSelector)!;
    const actionsPanel = document.querySelector<HTMLDivElement>(actionsPanelSelector)!;

    function checkDisplay(){
        const shouldHideSidebar = stayOnTopInput.checked && hideSidebarWhenPinnedInput.checked;
        toggleDisplay(unpinButton, stayOnTopInput.checked && hideSidebarWhenPinnedInput.checked);
        toggleDisplay(sidebar, !shouldHideSidebar);

        toggleDisplay(fpsCounter, !(stayOnTopInput.checked && hideOverlayWhenPinnedInput.checked));
    }

    function stayOnTopChange(){
        ipcRenderer.send("stayOnTopStateChange", {value: stayOnTopInput.checked});
        checkDisplay();
        
        // to resize the canvas from the actual game
        window.dispatchEvent(new UIEvent("resize"));
    }
    

    // settings ui
    /////////////////////
    createElement("h3", {innerText: "Desktop"}, settingsPanel);

    const hideOverlayWhenPinnedInputId = elementIdPrefix + "game/sidebar/content/settings/hide-sidebar-pinned";
    createElement("label", {innerText: "Hide overlays when pinned", for: hideOverlayWhenPinnedInputId}, settingsPanel); 
    const hideOverlayWhenPinnedInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: elementIdPrefix + "game/sidebar/content/settings/hide-sidebar-pinned", class: "desktop", checked: hideOverlaysWhenPinnedDefault}, settingsPanel);
    

    const hideSidebarWhenPinnedInputId = elementIdPrefix + "game/sidebar/content/settings/hide-sidebar-pinned"
    createElement("label", {innerText: "Hide sidebar when pinned", for: hideSidebarWhenPinnedInputId}, settingsPanel);
    
    const hideSidebarWhenPinnedInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: hideSidebarWhenPinnedInputId, class: "desktop", checked: hideSidebarWhenPinnedDefault}, settingsPanel);
    ///////////////////////////////


    // loading saved settings if exist
    ///////////////////////////////////
    const hideOverlayWhenPinnedSetting = localStorage.getItem(hideOverlayWhenPinnedSettingName);
    if(hideOverlayWhenPinnedSetting){
        hideOverlayWhenPinnedInput.checked = JSON.parse(hideOverlayWhenPinnedSetting);
    }
    
    const hideSidebarWhenPinnedSetting = localStorage.getItem(hideSidebarWhenPinnedSettingName);
    if(hideSidebarWhenPinnedSetting){
        hideSidebarWhenPinnedInput.checked = JSON.parse(hideSidebarWhenPinnedSetting);
    }
    ////////////////////////////////////
    

    // listening for settings change
    ///////////////////////////////////
    hideOverlayWhenPinnedInput.addEventListener("input", () => {
        checkDisplay();
        localStorage.setItem(hideOverlayWhenPinnedSettingName, JSON.stringify(hideOverlayWhenPinnedInput.checked));
    });

    hideSidebarWhenPinnedInput.addEventListener("input", () => {
        checkDisplay();
        localStorage.setItem(hideSidebarWhenPinnedSettingName, JSON.stringify(hideSidebarWhenPinnedInput.checked));
    });
    ///////////////////////////////////
    
    
    // actions ui
    ////////////////////
    createElement("label", {for: "desktop/game/sidebar/content/settings/pin", innerText: "Stay On Top"}, actionsPanel);
    const stayOnTopInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: "desktop/game/sidebar/content/settings/pin", class: "desktop"}, actionsPanel);
    stayOnTopInput.addEventListener("input", stayOnTopChange);
    ////////////////////



    // overlay
    ///////////////////////
    const unpinButton = createElement("button", {id: "unpin"}, gameMain);
    toggleDisplay(unpinButton, false);
    unpinButton.addEventListener("click", () => {
        stayOnTopInput.checked = false;
        stayOnTopChange();
    });
    //////////////////////

});
  