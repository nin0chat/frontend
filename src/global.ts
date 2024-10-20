export const debug = !window.location.href.includes("nin0.dev");
export const token = localStorage.getItem("nin0chat-token");

export function configButtonsRow() {
    try {
        document.querySelectorAll("#buttons-row button").forEach((button: HTMLButtonElement) => {
            button.addEventListener("click", () => {
                window.location.href = button.dataset.href || "/";
            });
        });
    } catch {}
}
