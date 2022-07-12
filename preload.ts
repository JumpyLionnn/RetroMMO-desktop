import { ipcRenderer } from 'electron';
import { alwaysShowGameCursorSettingName, censorChatSettingName, elementIdPrefix, hideOverlayWhenPinnedSettingName, hideSidebarWhenPinnedSettingName, settingKeyPrefix } from './constants';
import { alwaysShowGameCursorDefault, censorChatDefault, hideOverlaysWhenPinnedDefault, hideSidebarWhenPinnedDefault } from './defaults';
import { createElement, toggleDisplay } from './elements';
import Filter from "bad-words";

// might vary between game versions
const sidebarSelector = "#game\\/sidebar";
const gameMainSelector = "#game\\/main";
const fpsCounterSelector = "#game\\/main\\/screen\\/fps-count";
const settingsPanelSelector = "#game\\/sidebar\\/content\\/settings\\/box";
const actionsPanelSelector = "#game\\/sidebar\\/content\\/actions\\/box";
const integrationButtonsSelector = ".game\\/sidebar\\/content\\/settings\\/integration-button";
const chatBoxSelector = "#game\\/sidebar\\/content\\/chat\\/box";




window.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector<HTMLDivElement>(sidebarSelector)!;
    const gameMain = document.querySelector<HTMLDivElement>(gameMainSelector)!;

    const fpsCounter = document.querySelector<HTMLParagraphElement>(fpsCounterSelector)!;

    const settingsPanel = document.querySelector<HTMLDivElement>(settingsPanelSelector)!;
    const actionsPanel = document.querySelector<HTMLDivElement>(actionsPanelSelector)!;

    const chatBox = document.querySelector<HTMLDivElement>(chatBoxSelector)!;

    
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



    const alwaysShowGameCursorInputId = elementIdPrefix + "game/sidebar/content/settings/always-show-game-cursor"
    createElement("label", {innerText: "Always show game cursor", for: alwaysShowGameCursorInputId}, settingsPanel);
    const alwaysShowGameCursorInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: alwaysShowGameCursorInputId, class: "desktop", checked: alwaysShowGameCursorDefault}, settingsPanel);

    const censorChatInputId = elementIdPrefix + "game/sidebar/content/settings/always-show-game-cursor"
    createElement("label", {innerText: "Censor chat(slow)", for: censorChatInputId}, settingsPanel);
    const censorChatInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: censorChatInputId, class: "desktop", checked: censorChatDefault}, settingsPanel);
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
    const alwaysShowGameCursorSetting = localStorage.getItem(alwaysShowGameCursorSettingName);
    if(alwaysShowGameCursorSetting){
        alwaysShowGameCursorInput.checked = JSON.parse(alwaysShowGameCursorSetting);
        if(alwaysShowGameCursorInput.checked){
            document.body.classList.add("always-show-game-cursor");
        }
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

    alwaysShowGameCursorInput.addEventListener("input", () => {
        localStorage.setItem(alwaysShowGameCursorSettingName, JSON.stringify(alwaysShowGameCursorInput.checked));
        document.body.classList.toggle("always-show-game-cursor");
    });
    censorChatInput.addEventListener("input", () => {
        localStorage.setItem(censorChatSettingName, JSON.stringify(censorChatInput.checked));
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


    // itegration buttons override
    /////////////////////////////////
    document.querySelectorAll(integrationButtonsSelector).forEach((element: Element) => {
        const button = <HTMLButtonElement>element;
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            alert("Please use the web client to perform this action(for safety reasons).");
        });
    });
    /////////////////////////////////


    // basic chat censoring
    ///////////////////
    const filter = new Filter();
    const newMessageObserver = new MutationObserver((mutationList, observer) => {
        if(!censorChatInput.checked) return;
        for(const mutation of mutationList) {
            mutation.addedNodes.forEach((node: Node) => {
                const element = <HTMLParagraphElement>node;
                if(element.classList.contains("message")){
                    element.querySelectorAll("span.contents").forEach((element: Element) => {
                        const span = <HTMLSpanElement>element;
                        span.innerText = filter.clean(span.innerText);
                    });
                    
                }
            });
            
        }
    });
    newMessageObserver.observe(chatBox, { childList: true });
    ///////////////////

});
  