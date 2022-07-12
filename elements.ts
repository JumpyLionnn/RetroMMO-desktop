export function createElement<T extends HTMLElement>(tag: string, options: {[name: string]: any} = {}, parent?: HTMLElement): T{
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

export function toggleDisplay(element: HTMLElement, value: boolean){
    if(!value)
        element.style.setProperty("display", "none");
    else
        element.style.removeProperty("display");
}