import { setupListeners } from "./domListeners";
import { makeError } from "./errors";
import { token } from "./global";
import { Message, Role, shouldLogWebSocket } from "./utils";
import { Converter } from "showdown";

export let ws: WebSocket;
const mdConverter = new Converter();
mdConverter.setOption("strikethrough", true);
mdConverter.setOption("simpleLineBreaks", true);
mdConverter.setOption("simplifiedAutoLink", true);

export function initWebSocket() {
    ws = new WebSocket(
        window.location.href.includes("nin0.dev") ? "wss://chatws.nin0.dev" : "ws://localhost:8080"
    );

    ws!.onopen = function () {
        shouldLogWebSocket && console.log("Connected to ws");
        if (token) {
            ws.send(JSON.stringify({ op: 1, d: { token, anon: false, device: "web" } }));
        }
    };

    ws!.onclose = function () {
        window.location.reload();
    };

    ws!.onmessage = function (event) {
        const data = JSON.parse(event.data);
        shouldLogWebSocket && console.log("Message received: ", JSON.parse(event.data));
        switch (data.op) {
            case -1: {
                makeError(JSON.parse(event.data).d.message);
                break;
            }
            case 0: {
                addMessage(data.d);
                break;
            }
            case 1: {
                const infoBox = document.querySelector("#information") as HTMLElement;
                infoBox.innerText = `Connected as ${data.d.username}${
                    data.d.roles & Role.Guest
                        ? " (guest), refresh to disconnect."
                        : ". <a href='pfthing'>Edit profile</a>"
                }`;
                infoBox.innerHTML = infoBox.innerHTML.replace(
                    "&lt;a href='pfthing'&gt;Edit profile&lt;/a&gt;",
                    '<a href="/editProfile.html">Edit profile</a>'
                );
                infoBox.style.fontWeight = "bold";
                (document.querySelector("#input-bar") as HTMLDivElement)!.style.visibility =
                    "visible";
                break;
            }
            case 2: {
                ws.send(JSON.stringify({ op: 2, d: {} }));
            }
        }
    };
}

setupListeners();

export function addMessage(message: Message) {
    if (
        message.userInfo.roles & Role.System &&
        token &&
        message.content ===
            "Welcome to nin0chat! You are currently connected as an unauthenticated guest and cannot talk until you either login (unless you're already logged in?) or set your username."
    )
        return;
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message");
    messageContainer.innerHTML = `
        <span class="tag"></span> <span class="username"></span> <span class="timestamp"></span> <span class="content"></span>
    `;
    const contentContainer: HTMLElement = document.querySelector("#content")!;
    let shouldRescroll = false;
    const usernameTag: HTMLElement = messageContainer.querySelector(".username")!;
    const contentTag: HTMLElement = messageContainer.querySelector(".content")!;
    const timestampTag: HTMLElement = messageContainer.querySelector(".timestamp")!;
    const tagTag: HTMLElement = messageContainer.querySelector(".tag")!;
    usernameTag.textContent = `<${message.userInfo.username}>`;
    timestampTag.textContent =
        new Date(message.timestamp).getHours() + ":" + new Date(message.timestamp).getMinutes();
    usernameTag.style.fontWeight = "600";
    if (message.userInfo.roles & Role.System) {
        usernameTag.textContent = "";
        messageContainer.classList.add("system-msg");
    }
    if (message.userInfo.roles & Role.Guest) {
        tagTag.textContent = "Guest";
        tagTag.classList.add("tag-guest");
    }
    if (message.userInfo.roles & Role.Mod) {
        tagTag.textContent = "Mod";
        usernameTag.style.color = "var(--tag-mod-color)";
        tagTag.classList.add("tag-mod");
    }
    if (message.userInfo.roles & Role.Admin) {
        tagTag.textContent = "Admin";
        usernameTag.style.color = "var(--tag-admin-color)";
        tagTag.classList.add("tag-admin");
    }
    if (!tagTag.textContent) tagTag.remove();
    contentTag.innerHTML = mdConverter
        .makeHtml(message.content.replace(/</g, "&lt;").replace(/>/g, "&gt;"))
        .replace("<p>", "")
        .replace("</p>", "");
    contentTag.style.margin = "0 !important";
    document.querySelector("#content")!.appendChild(messageContainer);
    document
        .querySelector("#content")!
        .scroll({ top: document.querySelector("#content")!.scrollHeight, behavior: "smooth" });
}
