// MDN says this exists
interface Location {
	searchParams
}

const { searchParams } = new URL(window.location.href)
export const debug = searchParams.has("debug") ? parseInt(searchParams.get("debug")!) != 0 : !window.location.href.includes("nin0.dev");
export const gatewayURL = searchParams.get("gateway") ?? (window.location.href.includes("nin0.dev") ? "wss://chatws.nin0.dev" : "ws://localhost:8928")
export const tokenVarName = "nin0chat-token@" + gatewayURL
export let token: string | null = localStorage.getItem("nin0chat-token@" + gatewayURL) ?? localStorage.getItem("nin0chat-token");

if (localStorage.hasItem("nin0chat-token")) {
	localStorage.setItem(tokenVarName, localStorage["nin0chat-token"])
	delete localStorage["nin0chat-token"]
}

export function setToken(newToken: string | null) {
	token = newToken
	newToken ? (localStorage[tokenVarName] = newToken) : delete localStorage[tokenVarName]
}

export function configButtonsRow() {
    try {
        document.querySelectorAll("#buttons-row button").forEach((button: HTMLButtonElement) => {
            button.addEventListener("click", () => {
                window.location.href = button.dataset.href || "/";
            });
        });
    } catch {}
}
