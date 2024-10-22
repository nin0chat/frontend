import { makeError } from "./errors";
import { debug, token } from "./global";

export function setupListeners() {
    window.addEventListener("DOMContentLoaded", () => {
        (document.querySelector("#ok") as HTMLButtonElement).addEventListener(
            "click",
            async (e) => {
                (document.querySelector("#ok-txt") as HTMLParagraphElement).style.display = "none";
                const response = await fetch(
                    debug
                        ? "http://127.0.0.1:5174/api/user/update"
                        : "https://chatapi.nin0.dev/api/user/update",
                    {
                        method: "PATCH",
                        body: JSON.stringify({
                            oldPassword: (
                                document.querySelector(
                                    "input[name='old-password']"
                                ) as HTMLInputElement
                            ).value,
                            newPassword: (
                                document.querySelector(
                                    "input[name='new-password']"
                                ) as HTMLInputElement
                            ).value,
                            newUsername: (
                                document.querySelector("input[name='username']") as HTMLInputElement
                            ).value
                        }),
                        headers: {
                            "Content-Type": "application/json",
                            ...(token && { Authorization: token })
                        }
                    }
                );
                if (response.status === 204) {
                    (document.querySelector("#ok-txt") as HTMLParagraphElement).style.display =
                        "block";
                } else {
                    const responseJson = await response.json();
                    makeError(responseJson.error || "An error occurred, please try again later.");
                }
            }
        );
    });
}
