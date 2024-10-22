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
        window.location.href.includes("nin0.dev") ? "wss://chatws.nin0.dev" : "ws://localhost:8928"
    );

    ws!.onopen = function () {
        shouldLogWebSocket && console.log("Connected to ws");
        if (token) {
            ws.send(JSON.stringify({ op: 1, d: { token, anon: false, device: "web" } }));
        }
    };

    ws!.onclose = function () {
        makeError("Disconnected from Gateway, reloading in a few seconds...");
        setTimeout(window.location.reload, 2000);
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
                        : ". <a href='pfthing'>Edit profile</a><a id='members-chat-link'> • View members</a>"
                }`;
                infoBox.innerHTML = infoBox.innerHTML.replace(
                    "&lt;a href='pfthing'&gt;Edit profile&lt;/a&gt;",
                    '<a href="/editProfile.html">Edit profile</a>'
                );
                infoBox.innerHTML = infoBox.innerHTML.replace(
                    "&lt;a id='members-chat-link'&gt; • View members&lt;/a&gt;",
                    '<a id="members-chat-link" href="#"> • View members</a>'
                );
                infoBox.style.fontWeight = "bold";
                const membersLink = (document.querySelector(
                    "#members-chat-link"
                ) as HTMLLinkElement)!;
                membersLink.addEventListener("click", () => {
                    if (membersLink.innerText.includes("chat")) {
                        document.querySelector("#members")?.classList.add("still-hide");
                        document.querySelector("#content")?.classList.add("still-show");
                        document.querySelector("#members")?.classList.remove("still-show");
                        document.querySelector("#content")?.classList.remove("still-hide");
                        membersLink.innerText = " • View members";
                    } else {
                        document.querySelector("#members")?.classList.add("still-show");
                        document.querySelector("#content")?.classList.add("still-hide");
                        document.querySelector("#members")?.classList.remove("still-hide");
                        document.querySelector("#content")?.classList.remove("still-show");
                        membersLink.innerText = " • View chat";
                    }
                });
                (document.querySelector("#input-bar") as HTMLDivElement)!.style.visibility =
                    "visible";
                break;
            }
            case 2: {
                ws.send(JSON.stringify({ op: 2, d: {} }));
                break;
            }
            case 3: {
                data.d.history.forEach((message: any) => {
                    addMessage(message);
                });
                break;
            }
            case 4: {
                const membersItem = document.querySelector("#members") as HTMLDivElement;
                membersItem.innerHTML = "";
                const membersHeading = document.createElement("strong");
                membersHeading.innerText = `members (${data.d.users.length})`;
                membersItem.appendChild(membersHeading);
                data.d.users.forEach((user) => {
                    const memberItem = document.createElement("p");
                    memberItem.innerText = user.username;
                    if (user.roles & Role.Guest) memberItem.style.color = "#666666";
                    if (user.roles & Role.Mod) memberItem.style.color = "var(--tag-mod-color)";
                    if (user.roles & Role.Admin) memberItem.style.color = "var(--tag-admin-color)";
                    if (user.roles & Role.Bot) memberItem.style.color = "var(--tag-bot-color)";
                    memberItem.addEventListener("click", () => {
                        navigator.clipboard.writeText(user.id);
                    });
                    membersItem.appendChild(memberItem);
                });
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
    if (message.userInfo.roles & Role.Bot) {
        tagTag.textContent = "Bot";
        usernameTag.style.color = "var(--tag-bot-color)";
        tagTag.classList.add("tag-bot");
    }
    if (message.type === 4) {
        tagTag.textContent = "Bridge";
        tagTag.classList.add("tag-bridge");
        tagTag.title = `Bridged by ${message.userInfo.bridgeMetadata?.from}`;
        if (message.userInfo.bridgeMetadata?.color !== "0") {
            usernameTag.style.color = `#${message.userInfo.bridgeMetadata?.color}`;
        }
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
