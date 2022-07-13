import { elementIdPrefix, settingKeyPrefix } from './constants';
import { createElement } from "./elements";



export class SettingsUi{
    private _settingsPanel: HTMLDivElement;
    public constructor(settingsPanel: HTMLDivElement){
        this._settingsPanel = settingsPanel;
        createElement("h3", {innerText: "Desktop"}, settingsPanel);
    }

    public createCheckboxSetting(name: string, text: string, defaultValue: boolean, onChange: (value: boolean) => void = (value) => {}){
        const inputId = elementIdPrefix + name;
        const settingName = settingKeyPrefix + name;

        createElement("label", {innerText: text, for: inputId}, this._settingsPanel); 
        const input = createElement<HTMLInputElement>("input", {type: "checkbox", id: inputId, class: "desktop", checked: defaultValue}, this._settingsPanel);

        const setting = localStorage.getItem(settingName);
        if(setting){
            input.checked = JSON.parse(setting);
        }

        input.addEventListener("input", () => {
            localStorage.setItem(settingName, JSON.stringify(input.checked));
            onChange(input.checked);
        });

        return input;
    }
}