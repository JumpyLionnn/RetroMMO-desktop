import { ipcRenderer } from 'electron';
import { off } from 'process';

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
    const fpsCounter = document.querySelector<HTMLParagraphElement>("#game\\/main\\/screen\\/fps-count")!;

    

    const settingsPanel = document.querySelector<HTMLDivElement>("#game\\/sidebar\\/content\\/settings\\/box")!;

    createElement("h3", {innerText: "Desktop"}, settingsPanel);
    createElement("label", {innerText: "Hide overlays when pinned", for: "desktop/game/sidebar/content/settings/hide-fps-pinned"}, settingsPanel);
    
    const hideFpsWhenPinnedInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: "desktop/game/sidebar/content/settings/hide-fps-pinned", class: "desktop"}, settingsPanel);
    hideFpsWhenPinnedInput.checked = true; // default value
    const hideFpsWhenPinnedSetting = localStorage.getItem("hide-fps-when-pinned");
    if(hideFpsWhenPinnedSetting){
        hideFpsWhenPinnedInput.checked = JSON.parse(hideFpsWhenPinnedSetting);
    }

    hideFpsWhenPinnedInput.addEventListener("input", () => {
        fpsCounter.hidden = stayOnTopInput.checked && hideFpsWhenPinnedInput.checked;
        localStorage.setItem("hide-fps-when-pinned", JSON.stringify(hideFpsWhenPinnedInput.checked));
    });


    const actionsPanel = document.querySelector<HTMLDivElement>("#game\\/sidebar\\/content\\/actions\\/box")!;

    const stayOnTopInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: "desktop/game/sidebar/content/settings/pin", class: "desktop"});
    
    createElement("label", {for: "desktop/game/sidebar/content/settings/pin", innerText: "Stay On Top"}, actionsPanel);
    actionsPanel.appendChild(stayOnTopInput);
    


    stayOnTopInput.addEventListener("input", () => {
        ipcRenderer.send("stayOnTopStateChange", {value: stayOnTopInput.checked});
        fpsCounter.hidden = stayOnTopInput.checked && hideFpsWhenPinnedInput.checked;
    });

});
  