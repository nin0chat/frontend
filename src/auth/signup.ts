import { debug } from "../global";
import { makeError } from "../errors";
let cfToken = "";

function checkIfWeShouldUnlockTheSignupButton() {
    const username = (document.querySelector("input[name='username']") as HTMLInputElement).value;
    const password = (document.querySelector("input[name='password']") as HTMLInputElement).value;
    const email = (document.querySelector("input[name='email']") as HTMLInputElement).value;
    if (username && password && email && cfToken && email.match(/^.+@.+\..+$/)) {
        try {
            (document.querySelector("#ok") as HTMLButtonElement).attributes.removeNamedItem(
                "disabled"
            );
        } catch {}
    } else {
        (document.querySelector("#ok") as HTMLButtonElement).setAttribute("disabled", "true");
    }
}

export function setupListeners() {
    window.addEventListener("DOMContentLoaded", () => {
        // @ts-ignore
        turnstile.ready(() => {
            // @ts-ignore
            turnstile.render(".cf-turnstile", {
                sitekey: window.location.href.includes("nin0.dev")
                    ? "0x4AAAAAAAx2eURQHoIyp8l6"
                    : "1x00000000000000000000AA",
                callback: function (token) {
                    cfToken = token;
                    checkIfWeShouldUnlockTheSignupButton();
                }
            });
        });

        (document.querySelector("#ok") as HTMLButtonElement).addEventListener(
            "click",
            async (e) => {
                const response = await fetch(
                    debug ? "http://127.0.0.1:3000/api/auth/signup" : "/api/auth/signup",
                    {
                        method: "POST",
                        body: JSON.stringify({
                            username: (
                                document.querySelector("input[name='username']") as HTMLInputElement
                            ).value,
                            password: (
                                document.querySelector("input[name='password']") as HTMLInputElement
                            ).value,
                            email: (
                                document.querySelector("input[name='email']") as HTMLInputElement
                            ).value,
                            turnstileKey: cfToken
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
                if (response.status === 204) {
                    (document.querySelector("#ok-txt") as HTMLParagraphElement).style.display =
                        "block";
                } else {
                    makeError(
                        "Something happened while making your account, make sure all fields are filled and that the CAPTCHA is succeeded"
                    );
                }
            }
        );

        document.querySelectorAll("input").forEach((input) => {
            input.addEventListener("input", checkIfWeShouldUnlockTheSignupButton);
        });
    });
}
