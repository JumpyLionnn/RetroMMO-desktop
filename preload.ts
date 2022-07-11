import { ipcRenderer } from 'electron';

function createElement<T extends HTMLElement>(tag: string, options: {[name: string]: any} = {}, parent?: HTMLElement): T{
    const element = document.createElement(tag);
    if(options.class)
    {
        if(typeof options.class == "string"){
            element.classList.value = options.class;
        }
        else if(Array.isArray(options.class)){
            element.classList.value = options.class.join(" ");
        }
    }
    Object.assign(element, options);
    delete (<any>element).class;
    if(parent){
        parent.appendChild(element);
    }
    return <T>element;
}


window.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector<HTMLDivElement>("#game\\/sidebar")!;
    const gameMain = document.querySelector<HTMLDivElement>("#game\\/main")!;


    const fpsCounter = document.querySelector<HTMLParagraphElement>("#game\\/main\\/screen\\/fps-count")!;

    const settingsPanel = document.querySelector<HTMLDivElement>("#game\\/sidebar\\/content\\/settings\\/box")!;

    createElement("h3", {innerText: "Desktop"}, settingsPanel);
    createElement("label", {innerText: "Hide overlays when pinned", for: "desktop/game/sidebar/content/settings/hide-sidebar-pinned"}, settingsPanel);
    
    const hideOverlayWhenPinnedInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: "desktop/game/sidebar/content/settings/hide-sidebar-pinned", class: "desktop"}, settingsPanel);
    hideOverlayWhenPinnedInput.checked = true; // default value
    const hideOverlayWhenPinnedSetting = localStorage.getItem("hide-overlay-when-pinned");
    if(hideOverlayWhenPinnedSetting){
        hideOverlayWhenPinnedInput.checked = JSON.parse(hideOverlayWhenPinnedSetting);
    }

    hideOverlayWhenPinnedInput.addEventListener("input", () => {
        fpsCounter.hidden = stayOnTopInput.checked && hideOverlayWhenPinnedInput.checked;
        localStorage.setItem("hide-overlay-when-pinned", JSON.stringify(hideOverlayWhenPinnedInput.checked));
    });

    createElement("label", {innerText: "Hide sidebar when pinned", for: "desktop/game/sidebar/content/settings/hide-sidebar-pinned"}, settingsPanel);
    
    const hideSidebarWhenPinnedInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: "desktop/game/sidebar/content/settings/hide-sidebar-pinned", class: "desktop"}, settingsPanel);
    hideSidebarWhenPinnedInput.checked = true; // default value
    const hideSidebarWhenPinnedSetting = localStorage.getItem("hide-sidebar-when-pinned");
    if(hideSidebarWhenPinnedSetting){
        hideSidebarWhenPinnedInput.checked = JSON.parse(hideSidebarWhenPinnedSetting);
    }

    hideSidebarWhenPinnedInput.addEventListener("input", () => {
        hideUnpinButton(!(stayOnTopInput.checked && hideSidebarWhenPinnedInput.checked));
        if( stayOnTopInput.checked && hideSidebarWhenPinnedInput.checked)
            sidebar.style.setProperty("display", "none");
        else
            sidebar.style.removeProperty("display");
        localStorage.setItem("hide-sidebar-when-pinned", JSON.stringify(hideSidebarWhenPinnedInput.checked));

    });


    const actionsPanel = document.querySelector<HTMLDivElement>("#game\\/sidebar\\/content\\/actions\\/box")!;

    const stayOnTopInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: "desktop/game/sidebar/content/settings/pin", class: "desktop"});
    
    createElement("label", {for: "desktop/game/sidebar/content/settings/pin", innerText: "Stay On Top"}, actionsPanel);
    actionsPanel.appendChild(stayOnTopInput);
    

    function stayOnTopChange(){
        ipcRenderer.send("stayOnTopStateChange", {value: stayOnTopInput.checked});
        fpsCounter.hidden = stayOnTopInput.checked && hideOverlayWhenPinnedInput.checked;
        hideUnpinButton(!(stayOnTopInput.checked && hideSidebarWhenPinnedInput.checked));
        if(stayOnTopInput.checked && hideSidebarWhenPinnedInput.checked)
            sidebar.style.setProperty("display", "none");
        
        else
            sidebar.style.removeProperty("display");
        
        window.dispatchEvent(new UIEvent("resize"));
    }


    stayOnTopInput.addEventListener("input", stayOnTopChange);


    function hideUnpinButton(value: boolean){
        if(value)
            unpinButton.style.setProperty("display", "none");
        else
            unpinButton.style.removeProperty("display");
    }
    const unpinButton = createElement("button", {id: "unpin"}, gameMain);
    unpinButton.style.setProperty("display", "none");
    unpinButton.addEventListener("click", () => {
        stayOnTopInput.checked = false;
        stayOnTopChange();
    });

});
  