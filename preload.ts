import { ipcRenderer } from 'electron';
import { alwaysShowGameCursorSettingName, censorChatSettingName, elementIdPrefix, hideOverlayWhenPinnedSettingName, hideSidebarWhenPinnedSettingName, pingSoundEffectSettingName, settingKeyPrefix } from './constants';
import { alwaysShowGameCursorDefault, censorChatDefault, hideOverlaysWhenPinnedDefault, hideSidebarWhenPinnedDefault, pingSoundEffectDefault } from './defaults';
import { createElement, isInputTypeable, toggleDisplay } from './elements';
import Filter from "bad-words";

// might vary between game versions
const sidebarSelector = "#game\\/sidebar";
const gameMainSelector = "#game\\/main";
const gameMainCanvasSelector = "#game\\/main\\/screen > canvas";
const fpsCounterSelector = "#game\\/main\\/screen\\/fps-count";
const settingsPanelSelector = "#game\\/sidebar\\/content\\/settings\\/box";
const actionsPanelSelector = "#game\\/sidebar\\/content\\/actions\\/box";
const integrationButtonsSelector = ".game\\/sidebar\\/content\\/settings\\/integration-button";
const chatBoxSelector = "#game\\/sidebar\\/content\\/chat\\/box";
const soundEffectVolumeSliderSelector = "#game\\/sidebar\\/content\\/settings\\/sfx-volume";
const loginFormSelector = "#auth\\/existing-user\\/form";
const loginEmailInputSelector = "#auth\\/existing-user\\/email";
const loginPasswordInputSelector = "#auth\\/existing-user\\/password";
const loginSubmitButtonSelector = "#auth\\/existing-user\\/form > input.auth\\/button";
const playerBoxTitleSelector = "#game\\/sidebar\\/content\\/players\\/count";
const playerListBoxSelector = "#game\\/sidebar\\/content\\/players\\/list";
const specialFocusBehaviorElementsSelector = "game\\/sidebar\\/content\\/chat\\/buttons button, " + gameMainCanvasSelector;

const pingSoundEffect = new Audio("desktopmmo://assets/audio/ping.mp3");


// for backend log package
ipcRenderer.on("log", (event, message) => {
    console.log("backend:", message);
});

window.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector<HTMLDivElement>(sidebarSelector)!;
    const gameMain = document.querySelector<HTMLDivElement>(gameMainSelector)!;

    let gameMainCanvas = document.querySelector<HTMLCanvasElement>(gameMainCanvasSelector)!;

    const fpsCounter = document.querySelector<HTMLParagraphElement>(fpsCounterSelector)!;

    const settingsPanel = document.querySelector<HTMLDivElement>(settingsPanelSelector)!;
    const actionsPanel = document.querySelector<HTMLDivElement>(actionsPanelSelector)!;

    const chatBox = document.querySelector<HTMLDivElement>(chatBoxSelector)!;

    const soundEffectVolumeSlider = document.querySelector<HTMLInputElement>(soundEffectVolumeSliderSelector)!;

    const loginForm = document.querySelector<HTMLFormElement>(loginFormSelector)!;
    const loginEmailInput = document.querySelector<HTMLInputElement>(loginEmailInputSelector)!;
    const loginPasswordInput = document.querySelector<HTMLInputElement>(loginPasswordInputSelector)!;
    const loginSubmitButton = document.querySelector<HTMLInputElement>(loginSubmitButtonSelector)!;

    const playerBoxTitle = document.querySelector(playerBoxTitleSelector)!;
    const playerListBox = document.querySelector(playerListBoxSelector)!;

    function focusGameCanvas(){
        if(gameMainCanvas === null){
            gameMainCanvas = document.querySelector<HTMLCanvasElement>(gameMainCanvasSelector)!;
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

    const censorChatInputId = elementIdPrefix + "game/sidebar/content/settings/censor-chat"
    createElement("label", {innerText: "Censor chat(slow)", for: censorChatInputId}, settingsPanel);
    const censorChatInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: censorChatInputId, class: "desktop", checked: censorChatDefault}, settingsPanel);

    const pingSoundEffectInputId = elementIdPrefix + "game/sidebar/content/settings/ping-sound-effect"
    createElement("label", {innerText: "Ping sound effect", for: pingSoundEffectInputId}, settingsPanel);
    const pingSoundEffectInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: pingSoundEffectInputId, class: "desktop", checked: pingSoundEffectDefault}, settingsPanel);
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
    const censorChatSetting = localStorage.getItem(censorChatSettingName);
    if(censorChatSetting){
        censorChatInput.checked = JSON.parse(censorChatSetting);
    }
    const pingSoundEffectSetting = localStorage.getItem(pingSoundEffectSettingName);
    if(pingSoundEffectSetting){
        pingSoundEffectInput.checked = JSON.parse(pingSoundEffectSetting);
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
    pingSoundEffectInput.addEventListener("input", () => {
        localStorage.setItem(pingSoundEffectSettingName, JSON.stringify(pingSoundEffectInput.checked));
    });
    ///////////////////////////////////
    
    
    // actions ui
    ////////////////////
    createElement("label", {for: "desktop/game/sidebar/content/settings/pin", innerText: "Stay On Top"}, actionsPanel);
    const stayOnTopInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: elementIdPrefix + "game/sidebar/content/settings/pin", class: "desktop"}, actionsPanel);
    stayOnTopInput.addEventListener("input", stayOnTopChange);
    ////////////////////


    // jump down button
    //////////////////////
    const chatContainer = createElement("div", {id: "chat-container"});
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
    document.querySelectorAll(integrationButtonsSelector).forEach((element: Element) => {
        const button = <HTMLButtonElement>element;
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            alert("Please use the web client to perform this action(for safety reasons).");
        });
    });
    /////////////////////////////////

    // player list
    ////////////////////////
    const playerSearchInput = createElement<HTMLInputElement>("input", {type: "search", id: "player-search-input"});
    playerBoxTitle.insertAdjacentElement("afterend", playerSearchInput);

    playerSearchInput.addEventListener("input", () => {
        playerSearchInput.value = playerSearchInput.value.trimStart();
        const searchValue = playerSearchInput.value.toLowerCase();
        playerListBox.querySelectorAll("p").forEach((element: Element) => {
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


    // basic chat censoring & ping sound effect
    ///////////////////
    const filter = new Filter();
    const newMessageObserver = new MutationObserver((mutationList, observer) => {
        if(!censorChatInput.checked) return;
        for(const mutation of mutationList) {
            mutation.addedNodes.forEach((node: Node) => {
                const element = <HTMLParagraphElement>node;
                if(element.classList.contains("highlight") && pingSoundEffectInput.checked){
                    pingSoundEffect.play();
                }

                if(censorChatInput.checked){
                    if(element.classList.contains("message")){
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
    const savedEmail = <string | undefined>ipcRenderer.sendSync("get-email");
    if(savedEmail){
        loginEmailInput.value = savedEmail;
        loginPasswordInput.focus();
    }
    const formMutationObserver = new MutationObserver((mutationList) => {
        if(loginForm.classList.contains("shown") && savedEmail){
            loginPasswordInput.focus();
        }
    });
    formMutationObserver.observe(loginForm, {
        attributes: true,
        attributeFilter: ["class"]
    });

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
        if(element.tagName === "INPUT"){
            if(!isInputTypeable(<HTMLInputElement>element)){
                console.log("input change");
                focusGameCanvas();
            }
        }
        else if(!element.matches(specialFocusBehaviorElementsSelector)){
            console.log("any element clicked");
            focusGameCanvas();
        }
    });
    //////////////////////////////

});
  