const loader = document.querySelector(".loader");
const form = document.querySelector("form");
const inpContainer = document.querySelector("#participantContainer");

window.addEventListener("load", () => {
    form.reset()
})

form.addEventListener("submit", () => {
    loader.style.visibility = "visible";
})

form.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault()
        const newInp = document.createElement('input')

    }
})
