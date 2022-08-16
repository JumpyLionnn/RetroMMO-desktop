import { ipcRenderer } from 'electron';
import { elementIdPrefix } from './constants';
import { alwaysShowGameCursorDefault, censorChatDefault, hideOverlaysWhenPinnedDefault, hideSidebarWhenPinnedDefault, muteWhenUnfocusedDefault, pingSoundEffectDefault } from './defaults';
import { createElement, isInputTypeable, toggleDisplay } from './elements';
import Filter from "bad-words";
import { SettingsUi } from './settingsUi';
import * as playerDataDisplay from './playerDataDisplay';

// might vary between game versions
const selectors: {[key: string]: string} = {};
if(GAME_VERSION == "old"){
    selectors.sidebarSelector = "#chat-container";
    selectors.gameMainSelector = "#canvas-outer-container";
    selectors.gameMainCanvasSelector = "#canvas";
    selectors.fpsCounterSelector = "#fps"; // there is none
    selectors.settingsPanelSelector = "#settings";
    selectors.actionsPanelSelector = "#actions";
    selectors.integrationButtonsSelector = "#discord-linked, #discord-not-linked";
    selectors.chatBoxSelector = "#chat-box";
    selectors.soundEffectVolumeSliderSelector = "#sfx-volume";
    selectors.loginFormSelector = "#auth-menu";
    selectors.loginEmailInputSelector = "#sign-in-email";
    selectors.loginPasswordInputSelector = "#sign-in-password";
    selectors.loginSubmitButtonSelector = "#existing-user-form > input.auth-button";
    selectors.playerListTabSelector = "#players";
    selectors.playerBoxTitleSelector = "#online-players";
    selectors.playerListBoxSelector = "#players";
    selectors.specialFocusBehaviorElementsSelector = "#chat-buttons img, " + selectors.gameMainCanvasSelector + ", #overlay-canvas";
}
else{
    selectors.sidebarSelector = "#game\\/sidebar";
    selectors.gameMainSelector = "#game\\/main";
    selectors.gameMainCanvasSelector = "#game\\/main\\/screen > canvas";
    selectors.fpsCounterSelector = "#game\\/main\\/screen\\/fps-count";
    selectors.settingsPanelSelector = "#game\\/sidebar\\/content\\/settings\\/box";
    selectors.actionsPanelSelector = "#game\\/sidebar\\/content\\/actions\\/box";
    selectors.integrationButtonsSelector = ".game\\/sidebar\\/content\\/settings\\/integration-button";
    selectors.chatBoxSelector = "#game\\/sidebar\\/content\\/chat\\/box";
    selectors.soundEffectVolumeSliderSelector = "#game\\/sidebar\\/content\\/settings\\/sfx-volume";
    selectors.loginFormSelector = "#auth\\/existing-user\\/form";
    selectors.loginEmailInputSelector = "#auth\\/existing-user\\/email";
    selectors.loginPasswordInputSelector = "#auth\\/existing-user\\/password";
    selectors.loginSubmitButtonSelector = "#auth\\/existing-user\\/form > input.auth\\/button";
    selectors.playerBoxTitleSelector = "#game\\/sidebar\\/content\\/players\\/count";
    selectors.playerListTabSelector = "#game\\/sidebar\\/content\\/players";
    selectors.playerListBoxSelector = "#game\\/sidebar\\/content\\/players\\/list";
    selectors.specialFocusBehaviorElementsSelector = "game\\/sidebar\\/content\\/chat\\/buttons button, " + selectors.gameMainCanvasSelector;
}


const pingSoundEffect = new Audio("desktopmmo://assets/audio/ping.mp3");


// for backend log package
ipcRenderer.on("log", (event, message) => {
    console.log("backend:", message);
});

window.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector<HTMLDivElement>(selectors.sidebarSelector)!;
    const gameMain = document.querySelector<HTMLDivElement>(selectors.gameMainSelector)!;

    let gameMainCanvas = document.querySelector<HTMLCanvasElement>(selectors.gameMainCanvasSelector)!;

    const fpsCounter = document.querySelector<HTMLParagraphElement>(selectors.fpsCounterSelector)!;

    const settingsPanel = document.querySelector<HTMLDivElement>(selectors.settingsPanelSelector)!;
    const actionsPanel = document.querySelector<HTMLDivElement>(selectors.actionsPanelSelector)!;

    const chatBox = document.querySelector<HTMLDivElement>(selectors.chatBoxSelector)!;

    const soundEffectVolumeSlider = document.querySelector<HTMLInputElement>(selectors.soundEffectVolumeSliderSelector)!;

    const loginForm = document.querySelector<HTMLFormElement>(selectors.loginFormSelector)!;
    const loginEmailInput = document.querySelector<HTMLInputElement>(selectors.loginEmailInputSelector)!;
    const loginPasswordInput = document.querySelector<HTMLInputElement>(selectors.loginPasswordInputSelector)!;
    const loginSubmitButton = document.querySelector<HTMLInputElement>(selectors.loginSubmitButtonSelector)!;

    const playersListTab = document.querySelector(selectors.playerListTabSelector)!;
    const playerBoxTitle = document.querySelector(selectors.playerBoxTitleSelector)!;
    const playerListBox = document.querySelector<HTMLDivElement>(selectors.playerListBoxSelector)!;

    function focusGameCanvas(){
        if(gameMainCanvas === null){
            gameMainCanvas = document.querySelector<HTMLCanvasElement>(selectors.gameMainCanvasSelector)!;
            if(gameMainCanvas === null){
                return;
            }
        }
        gameMainCanvas.focus();
    }
    
    function checkDisplay(){
        const shouldHideSidebar = stayOnTopInput.checked && hideSidebarWhenPinnedInput.checked;
        toggleDisplay(unpinButton, stayOnTopInput.checked && hideSidebarWhenPinnedInput.checked);
        toggleDisplay(sidebar, !shouldHideSidebar);

        if(GAME_VERSION === "new")
            toggleDisplay(fpsCounter, !(stayOnTopInput.checked && hideOverlayWhenPinnedInput.checked));
    }

    function stayOnTopChange(){
        ipcRenderer.send("stayOnTopStateChange", {value: stayOnTopInput.checked});
        checkDisplay();
        
        // to resize the canvas from the actual game
        window.dispatchEvent(new UIEvent("resize"));
    }

    function isElementMessage(element: HTMLParagraphElement){
        if(GAME_VERSION === "old"){
            return element.classList.contains("say") || element.classList.contains("wsay") || element.classList.contains("psay") || element.classList.contains("tsay");
        }
        else{
            return element.classList.contains("message")
        }
    }
    
    const settingUi = new SettingsUi(settingsPanel);

    // settings setup
    /////////////////////

    const hideOverlayWhenPinnedInput = settingUi.createCheckboxSetting(
        "hide-overlay-pinned", "Hide overlays when pinned", hideOverlaysWhenPinnedDefault, (value) => {
            checkDisplay();
    });
    if(GAME_VERSION === "old"){
        hideOverlayWhenPinnedInput.hide();
    }
    
   const hideSidebarWhenPinnedInput =  settingUi.createCheckboxSetting(
        "hide-sidebar-pinned", "Hide sidebar when pinned", hideSidebarWhenPinnedDefault, (value) => {
            checkDisplay();
    });

    const alwaysShowGameCursorInput = settingUi.createCheckboxSetting(
        "always-show-game-cursor", "Always show game cursor", alwaysShowGameCursorDefault, (value) => {
            document.body.classList.toggle("always-show-game-cursor");
    });
    if(alwaysShowGameCursorInput.checked){
        document.body.classList.add("always-show-game-cursor");
    }

    const censorChatInput = settingUi.createCheckboxSetting("censor-chat", "Censor chat(slow)", censorChatDefault);
    const pingSoundEffectInput = settingUi.createCheckboxSetting("ping-sound-effect", "Ping sound effect", pingSoundEffectDefault);
    const muteWhenUnfocusedInput = settingUi.createCheckboxSetting("mute-when-unfocused", "Mute when unfocused", muteWhenUnfocusedDefault);
    ///////////////////////////////
    
    
    // actions ui
    ////////////////////
    createElement("label", {for: "desktop/game/sidebar/content/settings/pin", innerText: "Stay On Top"}, actionsPanel);
    const stayOnTopInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: elementIdPrefix + "game/sidebar/content/settings/pin", class: "desktop"}, actionsPanel);
    stayOnTopInput.addEventListener("input", stayOnTopChange);
    ////////////////////

    // mute when unfocused
    ////////////////////////////
    ipcRenderer.on("focus-change", () => {
        ipcRenderer.send("focus-change-reply", muteWhenUnfocusedInput.checked);
    });
    ////////////////////////////


    // chat jump down button
    //////////////////////
    const chatContainer = createElement("div", {id: "desktop-chat-container"});
    chatBox.parentElement!.insertBefore(chatContainer, chatBox);
    chatBox.remove();
    chatContainer.appendChild(chatBox);


    const jumpDownButton = createElement("button", {id: "jump-down-button"}, chatContainer);
    toggleDisplay(jumpDownButton, false);
    jumpDownButton.addEventListener("click", () => {
        chatBox.scrollTo({
            behavior: "smooth",
            top: chatBox.scrollHeight
        });
    });

    chatBox.addEventListener("scroll", () => {
        toggleDisplay(jumpDownButton, chatBox.scrollHeight - (chatBox.scrollTop + chatBox.clientHeight) > 100);
    });
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
    document.querySelectorAll(selectors.integrationButtonsSelector).forEach((element: Element) => {
        const button = <HTMLButtonElement>element;
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            event.cancelBubble = true;
            alert("Please use the web client to perform this action(for safety reasons).");
        });
    });
    /////////////////////////////////

    // player list
    ////////////////////////
    const playerSearchInput = createElement<HTMLInputElement>("input", {type: "search", id: "player-search-input"});
    playerBoxTitle.insertAdjacentElement("afterend", playerSearchInput);
    const playerEntrySelector = GAME_VERSION === "old" ? "p.players-entry" : "p"
    playerSearchInput.addEventListener("input", () => {
        playerSearchInput.value = playerSearchInput.value.trimStart();
        const searchValue = playerSearchInput.value.toLowerCase();
        playerListBox.querySelectorAll(playerEntrySelector).forEach((element: Element) => {
            const p = <HTMLParagraphElement>element;
            toggleDisplay(p, p.innerText.toLowerCase().includes(searchValue));
        });
    });

    // to overrite default game behavior
    playerSearchInput.addEventListener("keydown", (e) => {
        if(e.code === "KeyT" || e.code == "KeyH" || e.code == "KeyY" || e.code == "KeyU"){
            e.preventDefault(); // the default game behavior(opening chat) 
            let selectionStart = playerSearchInput.selectionStart!;
            let selectionEnd = playerSearchInput.selectionEnd!;
            playerSearchInput.value = playerSearchInput.value.substring(0, selectionStart) + e.key + playerSearchInput.value.substring(selectionEnd);
            playerSearchInput.selectionStart = selectionStart + 1;
            playerSearchInput.selectionEnd = selectionStart + 1;
        }
    });
    ////////////////////////


    // player data
    /////////////////
    playerDataDisplay.init(playerListBox);
    const tabChanges = new MutationObserver((mutations) => {
        if(GAME_VERSION === "old"){
            const oldClasses = mutations[0].oldValue!;
            const newClasses = (<HTMLElement>mutations[1].target).classList.toString();
            if(oldClasses !== newClasses){
                playerDataDisplay.removeAllDisplays();
            }
        }
        else{
            if(mutations.length !== 2){
                playerDataDisplay.removeAllDisplays();
            }
        }
    });
    tabChanges.observe(GAME_VERSION === "old" ? sidebar : playersListTab, {
        attributes: true,
        attributeFilter: ["class"],
        attributeOldValue: true
    });
    /////////////////

    // basic chat censoring & ping sound effect
    ///////////////////
    const filter = new Filter();
    const highlightClass = GAME_VERSION === "old" ? "at" : "highlight";
    const newMessageObserver = new MutationObserver((mutationList, observer) => {
        for(const mutation of mutationList) {
            mutation.addedNodes.forEach((node: Node) => {
                const element = <HTMLParagraphElement>node;
                if(element.classList.contains(highlightClass) && pingSoundEffectInput.checked){
                    pingSoundEffect.play();
                }

                if(censorChatInput.checked){
                    if(isElementMessage(element)){
                        element.querySelectorAll("span.contents").forEach((element: Element) => {
                            const span = <HTMLSpanElement>element;
                            span.innerText = filter.clean(span.innerText);
                        });
                    }
                }
                
            });
            
        }
    });
    newMessageObserver.observe(chatBox, { childList: true });

    pingSoundEffect.volume = parseInt(soundEffectVolumeSlider.value) / 100;
    soundEffectVolumeSlider.addEventListener("input", () => {
        pingSoundEffect.volume = parseInt(soundEffectVolumeSlider.value) / 100;
    });
    ///////////////////


    // saving email
    //////////////////

    // loading
    (async function(){
        const savedEmail = await <Promise<string | undefined>>ipcRenderer.invoke("get-email");
        if(savedEmail){
            loginEmailInput.value = savedEmail;
            loginPasswordInput.focus();
        }

        const loginFormShownClass = GAME_VERSION == "old" ? "existing-user" : "shown";
        const formMutationObserver = new MutationObserver((mutationList) => {
            if(loginForm.classList.contains(loginFormShownClass) && savedEmail){
                loginPasswordInput.focus();
            }
        });
        formMutationObserver.observe(loginForm, {
            attributes: true,
            attributeFilter: ["class"]
        });
    })();
    // saving
    loginSubmitButton.addEventListener("click", () => {
        // not saving passwords for security reasons
        ipcRenderer.send("save-email", {email: loginEmailInput.value});
    });
    //////////////////


    // refocusing game canvas
    //////////////////////////////
    document.addEventListener("click", (e: MouseEvent) => {
        const element = <HTMLElement>e.target;
        const selection = document.getSelection();
        if(element.tagName === "INPUT"){
            if(!isInputTypeable(<HTMLInputElement>element)){
                focusGameCanvas();
            }
        }
        else if(!element.matches(selectors.specialFocusBehaviorElementsSelector) && (selection === undefined || selection?.isCollapsed)){
            focusGameCanvas();
        }
    });
    //////////////////////////////

});
  