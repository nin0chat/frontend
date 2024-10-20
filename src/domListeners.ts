import { addMessage, ws } from ".";
import { token } from "./global";
import { sendMessage } from "./messageCreation";
import { Message, Role } from "./utils";

export function setupListeners() {
    document.addEventListener("DOMContentLoaded", function () {
        if (token) {
            (
                document.querySelectorAll("#buttons-row button")[0] as HTMLButtonElement
            ).dataset.href = "";
            (document.querySelectorAll("#buttons-row button")[0] as HTMLButtonElement).onclick =
                () => {
                    localStorage.removeItem("nin0chat-token");
                    window.location.href = "/";
                };
            (document.querySelectorAll("#buttons-row button")[0] as HTMLButtonElement).innerText =
                "logout";
        }

        document.querySelector("#guest-join-field button")!.addEventListener("click", function () {
            ws!.send(
                JSON.stringify({
                    op: 1,
                    d: {
                        anon: true,
                        username: (
                            document.querySelector("#guest-join-field input") as HTMLInputElement
                        ).value
                    }
                })
            );
        });

        const messageSendBox = document.querySelector<HTMLTextAreaElement>("#input-bar textarea");
        if (!messageSendBox) return;
        messageSendBox.style.height = messageSendBox.scrollHeight + "px";
        messageSendBox.addEventListener(
            "input",
            (_) => {
                messageSendBox.style.height = "auto";
                messageSendBox.style.height = messageSendBox.scrollHeight + "px";
            },
            false
        );
        const messageSendHandler = (event) => {
            if ((event.key === "Enter" && !event.shiftKey) || event.type === "click") {
                event.preventDefault();
                sendMessage(messageSendBox.value);
                messageSendBox.value = "";
                messageSendBox.style.height = "auto";
                messageSendBox.style.height = messageSendBox.scrollHeight + "px";
            }
        };
        (document.querySelector("#input-bar #send") as HTMLButtonElement)!.addEventListener(
            "click",
            messageSendHandler
        );
        messageSendBox.addEventListener("keydown", messageSendHandler);
    });
}
