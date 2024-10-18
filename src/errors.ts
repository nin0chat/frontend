export function makeError(error: string) {
    const err = document.querySelector("#error") as HTMLDivElement;
    (err.querySelector("p") as HTMLParagraphElement).innerHTML = `<b>Error:</b> ${error}`;
    err.style.display = "block";
    setTimeout(() => {
        err.style.display = "none";
    }, 2000);
}
