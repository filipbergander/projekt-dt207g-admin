"use strict";
checkAuthAccess();

/**
 * Autentiserar användare och kollar om den har behöriget för resten av webbplatsen
 * @returns {void} - Returnerar ingenting
 */
export function checkAuthAccess() {

    // Sökvägen för användarens webbfönster just nu
    const userPath = window.location.pathname;

    // Routes som kräver inloggning
    const protectedRoutes = [
        "/index.html",
        "/register.html",
        "/dinner.html",
        "/booking.html",
        "/"
    ]

    // Om man försöker navigerar till sida som inte är login och ingen key finns sparad
    if (protectedRoutes.includes(userPath) && !localStorage.getItem("login-key")) {
        window.location.href = "login.html"; // Redirect till login-sidan
    }
    // Förhindrar att vanliga användare som personal kan navigera till registera-sidan
    if (userPath === "/register.html" && localStorage.getItem("role") !== "admin") {
        return window.location.href = "index.html"; // Redirect till index-sidan
    }
    // Ändrar footerns utseende när man inte har behörigheten för admin
    if ((userPath === "/index.html" || userPath === "/") && localStorage.getItem("role") !== "admin") {
        changeFooterText();
    }
}
/**
 * Ändrar footerns utseende och tar bort länk till registrera-sidan om man inte är inloggad som admin
 */
export function changeFooterText() {
    const footer = document.getElementById("footer");
    footer.innerHTML = "";
    footer.innerHTML = `
            <p> Admin-sida för Osteria Lema</p>
    `;
}