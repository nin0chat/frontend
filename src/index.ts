import { setupListeners } from "./domListeners";
import { shouldLogWebSocket } from "./utils";

let ws;

export function initWebSocket() {
    ws = new WebSocket(
        window.location.href.includes("nin0.dev") ? "wss://chatws.nin0.dev" : "ws://localhost:8080"
    );

    ws!.onopen = function () {
        shouldLogWebSocket && console.log("Connected to ws");
    };

    ws!.onmessage = function (event) {
        shouldLogWebSocket && console.log("Message received: ", JSON.parse(event.data));
    };
}

setupListeners();

export function addMessage(message) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message");
    messageContainer.innerHTML = message;
    document.querySelector("#messages")!.appendChild(messageContainer);
}
