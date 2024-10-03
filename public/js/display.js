const backButton = document.querySelector("#backButton")

backButton.addEventListener("click", () => {
    sessionStorage.clear();
    window.location.href = "/"
    console.log("Session Cleared")
})
