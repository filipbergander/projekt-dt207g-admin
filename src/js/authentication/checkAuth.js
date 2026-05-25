"use strict";
checkAuthAccess();
// Ser över om användaren har behörighet till admin-sidan
export function checkAuthAccess() {
    const adminUser = document.getElementById("admin-user");

    // Går inte att navigera till admin-sidan om användaren inte är inloggad
    if (window.location.pathname.endsWith("index.html") && !localStorage.getItem("login-key")) {
        adminUser.innerHTML = "";
        window.location.href = "login.html"; // Redirect till login-sidan
    };

}