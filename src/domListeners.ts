export function setupListeners() {
    document.addEventListener("DOMContentLoaded", function () {
        document
            .querySelector("#guest-join-field button")!
            .addEventListener("click", function () {});

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
