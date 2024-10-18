import { ws } from ".";

export function sendMessage(content) {
    ws.send(
        JSON.stringify({
            op: 0,
            d: {
                content
            }
        })
    );
}
