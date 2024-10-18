import { setupListeners } from "./domListeners";
import { Message, Role, shouldLogWebSocket } from "./utils";
import { Converter } from "showdown";

export let ws: WebSocket | null = null;
const mdConverter = new Converter();
mdConverter.setOption("strikethrough", true);
mdConverter.setOption("simpleLineBreaks", true);

export function initWebSocket() {
    ws = new WebSocket(
        window.location.href.includes("nin0.dev") ? "wss://chatws.nin0.dev" : "ws://localhost:8080"
    );

    ws!.onopen = function () {
        shouldLogWebSocket && console.log("Connected to ws");
    };

    ws!.onmessage = function (event) {
        const data = JSON.parse(event.data);
        shouldLogWebSocket && console.log("Message received: ", JSON.parse(event.data));
        switch (data.op) {
            case 0: {
                addMessage(data.d);
                break;
            }
            case 1: {
                const infoBox = document.querySelector("#information") as HTMLElement;
                infoBox.innerText = `Connected as ${data.d.username} (guest), refresh to disconnect.`;
                infoBox.style.fontWeight = "bold";
            }
        }
    };
}

setupListeners();

export function addMessage(message: Message) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message");
    messageContainer.innerHTML = `
        <span class="username"></span> <span class="content"></span>
    `;
    const contentContainer: HTMLElement = document.querySelector("#content")!;
    let shouldRescroll = false;
    const usernameTag: HTMLElement = messageContainer.querySelector(".username")!;
    const contentTag: HTMLElement = messageContainer.querySelector(".content")!;
    usernameTag.textContent = `<${message.userInfo.username}>`;
    usernameTag.style.fontWeight = "600";
    if (message.userInfo.roles & Role.System) {
        usernameTag.textContent = "";
        messageContainer.classList.add("system-msg");
    }
    contentTag.innerHTML = mdConverter.makeHtml(
        message.content.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    );
    document.querySelector("#content")!.appendChild(messageContainer);
    document
        .querySelector("#content")!
        .scroll({ top: document.querySelector("#content")!.scrollHeight, behavior: "smooth" });
}
