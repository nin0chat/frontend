import { addMessage, ws } from ".";
import { Message, Role } from "./utils";

export function setupListeners() {
    document.addEventListener("DOMContentLoaded", function () {
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
    });
}
