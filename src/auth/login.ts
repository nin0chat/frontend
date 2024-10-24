import { gatewayURL, setToken } from "../global";
import { makeError } from "../errors";

function checkIfWeShouldUnlockTheLoginButton() {
    const password = (document.querySelector("input[name='password']") as HTMLInputElement).value;
    const email = (document.querySelector("input[name='email']") as HTMLInputElement).value;
    if (password && email && email.match(/^.+@.+\..+$/)) {
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
        (document.querySelector("#ok") as HTMLButtonElement).addEventListener(
            "click",
            async (e) => {
                const response = await fetch(
					`${gatewayURL}/api/auth/login`,
                    {
                        method: "POST",
                        body: JSON.stringify({
                            password: (
                                document.querySelector("input[name='password']") as HTMLInputElement
                            ).value,
                            email: (
                                document.querySelector("input[name='email']") as HTMLInputElement
                            ).value
                        }),
                        headers: {
                            "Content-Type": "application/json"
                        }
                    }
                );
                const responseJson = await response.json();
                if (response.status === 200) {
                    setToken(responseJson.token)
                    window.location.href = "/";
                } else {
                    makeError(responseJson.error || "An error occurred, please try again later.");
                }
            }
        );

        document.querySelectorAll("input").forEach((input) => {
            input.addEventListener("input", checkIfWeShouldUnlockTheLoginButton);
        });
    });
}
