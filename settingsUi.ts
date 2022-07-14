import { elementIdPrefix, settingKeyPrefix } from './constants';
import { createElement, toggleDisplay } from "./elements";

export class CheckboxSetting{
    public constructor(private input: HTMLInputElement, private label: HTMLLabelElement){

    }

    public get checked(){return this.input.checked;}
    public set checked(value: boolean){this.input.checked = value;}

    public hide(){
        toggleDisplay(this.input, false);
        toggleDisplay(this.label, false);
    }

    public show(){
        toggleDisplay(this.input, true);
        toggleDisplay(this.label, true);
    }
}

export class SettingsUi{
    private _settingsPanel: HTMLDivElement;
    public constructor(settingsPanel: HTMLDivElement){
        this._settingsPanel = settingsPanel;

        createElement(GAME_VERSION === "old" ? "h2" : "h3", {innerText: "Desktop"}, settingsPanel);
    }

    public createCheckboxSetting(name: string, text: string, defaultValue: boolean, onChange: (value: boolean) => void = (value) => {}){
        const inputId = elementIdPrefix + name;
        const settingName = settingKeyPrefix + name;

        const label = createElement<HTMLLabelElement>("label", {innerText: text, for: inputId}, this._settingsPanel); 
        const input = createElement<HTMLInputElement>("input", {type: "checkbox", id: inputId, class: "desktop", checked: defaultValue}, this._settingsPanel);

        const setting = localStorage.getItem(settingName);
        if(setting){
            input.checked = JSON.parse(setting);
        }

        input.addEventListener("input", () => {
            localStorage.setItem(settingName, JSON.stringify(input.checked));
            onChange(input.checked);
        });

        return new CheckboxSetting(input, label);
    }
}