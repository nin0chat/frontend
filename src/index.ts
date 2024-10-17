const shouldLogWebSocket = !window.location.href.includes("nin0.dev");

// #region listeners
document.addEventListener("DOMContentLoaded", function () {
    document.querySelector("#guest-join-field button").addEventListener("click", function () {});

    const messageSendBox = document.querySelector("#input-bar textarea");
    messageSendBox.style.height = messageSendBox.scrollHeight + "px";
    //messageSendBox.style.overflowY = "hidden";
    messageSendBox.addEventListener(
        "input",
        (a) => {
            messageSendBox.style.height = "auto";
            messageSendBox.style.height = messageSendBox.scrollHeight + "px";
        },
        false
    );
});
// #endregion

const ws = new WebSocket(
    window.location.href.includes("nin0.dev") ? "wss://chatws.nin0.dev" : "ws://localhost:8080"
);

// #region utilities
function addMessage(message) {
    const messageContainer = document.createElement("div");
    messageContainer.classList.add("message");
    messageContainer.innerHTML = message;
    document.querySelector("#messages").appendChild(messageContainer);
}
// #endregion

// #region ws listeners
ws.onopen = function () {
    shouldLogWebSocket && console.log("Connected to ws");
};

ws.onmessage = function (event) {
    shouldLogWebSocket && console.log("Message received: ", JSON.parse(event.data));
};
// #endregion
