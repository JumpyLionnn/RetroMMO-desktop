import { PlayerData } from "./api";
import { createElement } from "./elements";

function toLocaleDate(apiDate: string){
    const splittedDate = apiDate.split("-");
    const year = parseInt(splittedDate[0]);
    const month = parseInt(splittedDate[1]);
    const day = parseInt(splittedDate[2]);

    return (new Date(year, month, day)).toLocaleDateString();
}

const animationTiming = {
    duration: 150,
    iterations: 1,
};

class PlayerDataDisplayCard{
    private container: HTMLDivElement;
    private rank: HTMLSpanElement;
    private dateCreated: HTMLSpanElement;
    constructor(){
        this.container = createElement("div", {id: "player-data"});
        const rankContainer = createElement("div", {id: "player-data-rank-container"}, this.container);
        this.rank = createElement("span", {id: "player-data-rank", innerText: " "}, rankContainer);
        const timeCreatedContainer = createElement("div", {id: "player-data-rank-container"}, this.container);
        createElement("span", {innerText: "Registered At: "}, timeCreatedContainer);
        this.dateCreated = createElement("span", {id: "player-data-experience"}, timeCreatedContainer);
    }

    public remove(){
        this.container.remove();
    }

    public updateRank(rank: number, xp: number){
        this.rank.innerText = "#" + rank + " with " + xp.toLocaleString() + " total exp.";
    }

    public updateDateCreated(date: string){
        this.dateCreated.innerText = toLocaleDate(date);
    }

    public clearData(){
        this.rank.innerText = "\n";
        this.dateCreated.innerText = "";
    }

    public expand(){
        return this.container.animate([
            { maxHeight: '0' },
            { maxHeight: this.container.clientHeight + 'px' }
        ], animationTiming);
    }

    public shrink(){
        return this.container.animate([
            { maxHeight: this.container.clientHeight + 'px' },
            { maxHeight: '0' }
        ], animationTiming);
    }

    public appendAfter(element: HTMLElement){
        element.insertAdjacentElement("afterend", this.container);
    }
}

interface OpenPlayerData {
    name: string;
    element: HTMLElement;
    dataCard: PlayerDataDisplayCard;
};
let currentOpenPlayerData: OpenPlayerData | null = null;

function updatePlayerData(name: string){
    currentOpenPlayerData!.dataCard.clearData();
    fetch(`https://play.retro-mmo.com/users/${name}.json`)
        .then((respose) => { return respose.json() })
        .then((respose: PlayerData) => {
            currentOpenPlayerData!.dataCard.updateRank(respose.rank, respose.lifetimeExperience);
            const date = respose.registeredAt.slice(0, respose.registeredAt.indexOf("T"));
            currentOpenPlayerData!.dataCard.updateDateCreated(date);
        });
}

function closePlayerInfo({dataCard, element}: OpenPlayerData){
    const animation = dataCard.shrink();
    animation.onfinish = () => {
        dataCard.remove();
        element.classList.remove("selected");
    };
}
function openPlayerInfo(playerName: string, element: HTMLElement){
    currentOpenPlayerData = { name: playerName, element: element, dataCard: new PlayerDataDisplayCard() };
    currentOpenPlayerData.dataCard.appendAfter(element);
    element.classList.add("selected");
    currentOpenPlayerData.dataCard.expand();
    updatePlayerData(playerName);
}
function togglePlayerInfo(element: HTMLElement, playerName: string){
    if(currentOpenPlayerData === null){
        openPlayerInfo(playerName, element);
    }
    else{
        if(currentOpenPlayerData.name === playerName){
            closePlayerInfo(currentOpenPlayerData);
            currentOpenPlayerData = null;
        }
        else{
            closePlayerInfo(currentOpenPlayerData);
            openPlayerInfo(playerName, element);
        }
    }
}

function getName(element: HTMLElement){
   return GAME_VERSION === "old" ? element.dataset.username! : element.querySelector<HTMLSpanElement>("span.username")!.innerText.trim();
}

export function init(playerListBox: HTMLDivElement){
    const playerSelector = GAME_VERSION === "old" ? "p.players-entry" : "p";
    const newPlayerEvent = new MutationObserver((mutations) => {
        for(const mutation of mutations){
            if(mutation.type === "childList"){
                mutation.addedNodes.forEach((node) => {
                    const element = <HTMLElement>node;
                    if(element.matches(playerSelector)){
                        element.onclick = () => {
                            togglePlayerInfo(element, getName(element));
                        }
                    }
                });
                if(currentOpenPlayerData !== null){
                    mutation.removedNodes.forEach((node) => {
                        const element = <HTMLElement>node;
                        if(element.tagName !== "P") return;
                        const name = getName(element);
                        if(name === currentOpenPlayerData!.name){
                            currentOpenPlayerData!.dataCard.remove();
                        }
                    });
                }  
            }
        }
    });
    newPlayerEvent.observe(playerListBox, {
        childList: true
    });
}

export function removeAllDisplays(){
    if(currentOpenPlayerData){
        currentOpenPlayerData.dataCard.remove();
        currentOpenPlayerData.element.classList.remove("selected");
    }
}