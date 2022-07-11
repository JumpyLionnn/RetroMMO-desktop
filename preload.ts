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
    const actionsPanel = document.querySelector<HTMLDivElement>("#game\\/sidebar\\/content\\/actions\\/box")!;

    const stayOnTopInput = createElement<HTMLInputElement>("input", {type: "checkbox", id: "desktop/game/sidebar/content/settings/top", class: "desktop"});
    
    createElement("label", {for: "desktop/game/sidebar/content/settings/top", innerText: "Stay On Top"}, actionsPanel);
    actionsPanel.appendChild(stayOnTopInput);
    

    const fpsCounter = document.querySelector<HTMLParagraphElement>("#game\\/main\\/screen\\/fps-count")!;

    stayOnTopInput.addEventListener("input", () => {
        ipcRenderer.send("stayOnTopStateChange", {value: stayOnTopInput.checked});
        fpsCounter.hidden = stayOnTopInput.checked;
    });
});
  