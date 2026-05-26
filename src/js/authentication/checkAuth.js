"use strict";
checkAuthAccess();

// Ser över om användaren har behörighet till admin-sidan
export function checkAuthAccess() {

    // Sökväg
    const userPath = window.location.pathname;

    // Routes som kräver inloggning
    const protectedRoutes = [
        "/index.html",
        "/register.html",
        "/dinner.html",
        "/"
    ]

    // Går inte att navigera till admin-sidan om användaren inte är inloggad
    if (protectedRoutes.includes(userPath) && !localStorage.getItem("login-key")) {
        window.location.href = "login.html"; // Redirect till login-sidan
    }
    // Förhindrar att vanliga användare som personal kan navigera till registera-sidan
    if (userPath === "/register.html" && localStorage.getItem("role") !== "admin") {
        return window.location.href = "index.html"; // Redirect till index-sidan
    }

    if ((userPath === "/index.html" || userPath === "/") && localStorage.getItem("role") !== "admin") {
        changeFooterText();
    }
}

export function changeFooterText() {
    const footer = document.getElementById("footer");
    footer.innerHTML = "";
    footer.innerHTML = `
            <p> Admin-sida för Osteria Lema</p>
    `;
}