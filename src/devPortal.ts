import { debug, token } from "./global";
import { makeError } from "./errors";

export function setupListeners() {
    window.addEventListener("DOMContentLoaded", async () => {
        (document.querySelector("#ok") as HTMLButtonElement).addEventListener(
            "click",
            async (e) => {
                const response = await fetch(
                    debug ? "http://127.0.0.1:3000/api/bots" : "/api/bots",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            username: (
                                document.querySelector("input[name='username']") as HTMLInputElement
                            ).value
                        }),
                        headers: {
                            "Content-Type": "application/json",
                            ...(token ? { Authorization: token } : {})
                        }
                    }
                );
                const responseJson = await response.json();
                if (response.status === 200) {
                    (
                        document.querySelector("#ok-txt") as HTMLElement
                    ).textContent = `Bot created! The token is ${responseJson.token}, do not share it.`;
                    (document.querySelector("#ok-txt") as HTMLButtonElement).style.display =
                        "block";
                } else {
                    makeError(responseJson.error || "An error occurred, please try again later.");
                }
            }
        );
        try {
            const response = await fetch(debug ? "http://127.0.0.1:3000/api/bots" : "/api/bots", {
                method: "GET",
                headers: {
                    ...(token ? { Authorization: token } : {})
                }
            });
            const data = await response.json();
            const content = document.querySelector("#content") as HTMLElement;
            data.bots.forEach((bot: { username: string; id: string }) => {
                const botElement = document.createElement("div");
                botElement.textContent = `${bot.username} (${bot.id})`;

                const deleteLink = document.createElement("a");
                deleteLink.href = "#";
                deleteLink.textContent = " [delete]";
                deleteLink.addEventListener("click", async (e) => {
                    e.preventDefault();
                    const deleteResponse = await fetch(
                        debug ? `http://127.0.0.1:3000/api/bots` : `/api/bots`,
                        {
                            method: "DELETE",
                            body: JSON.stringify({
                                id: bot.id
                            }),
                            headers: {
                                "Content-Type": "application/json",
                                ...(token ? { Authorization: token } : {})
                            }
                        }
                    );
                    if (deleteResponse.status === 204) {
                        botElement.remove();
                    } else {
                        const deleteResponseJson = await deleteResponse.json();
                        makeError(
                            deleteResponseJson.error ||
                                "Failed to delete bot, please try again later."
                        );
                    }
                });

                botElement.appendChild(deleteLink);
                content.appendChild(botElement);
            });
        } catch (error) {
            console.log(error);
        }
    });
}
