import '../sass/main.scss'
import { checkAuthAccess } from "./authentication/checkAuth.js";

const url = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {

    initLoginForm();
    logoutUser();
    checkAuthAccess();

    // Om användaren befinner sig på admin-sidan och har loggat in visas deras användarnamn i UI
    if (localStorage.getItem("login-key") && window.location.pathname.endsWith("index.html")) {
        displayUserUi();
    }

});

// Lyssnar på ändringar som görs i formuläret, visar felmeddelanden i DOM och anropar funktionen för att logga in en användare
function initLoginForm() {
    // Formuläret med knapp för att logga in en användare
    const loginForm = document.getElementById("login-form");
    const loginBtn = document.getElementById("login-btn");

    // Eventlyssnare för inloggningsformuläret
    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            let errors = [];

            // Hämtar värden inom inloggningsformuläret
            const loginEmail = document.getElementById("login-email").value.trim();
            const loginPassword = document.getElementById("login-password").value.trim();

            // Specifika felmeddelande för inputs
            if (loginEmail === "") errors.push("Du måste fylla i email!");
            if (loginPassword === "") {
                errors.push("Du måste fylla i lösenord!")
            } else if (loginPassword.length < 6) {
                errors.push("Lösenordet måste vara minst 6 tecken!");
            }

            // Om felmeddelanden finns visas dem genom funktionen displayErrorMsg
            if (errors.length > 0) {
                displayErrorMsg(errors);
                return; // Stoppar formuläret från att bli submittat
            } else {
                loginUser(); // Loggar in användaren genom funktionen
            }
        });
    }
}

// För att logga in en användare
async function loginUser() {

    // Inputs inom formuläret
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    const errorMsgList = document.querySelector(".error-message ul"); // Felmeddelanden
    const successMsgList = document.querySelector(".success-message ul"); // Meddelanden vid lyckat resultat
    successMsgList.innerHTML = ""; // Tar bort tidigare inloggningsmeddelanden
    let errors = [];
    let successMsg = [];

    localStorage.removeItem("login-key"); // Tar bort tidigare login-key om det redan finns lagrat
    try {
        const response = await fetch(`${url}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json(); // Väntar på responsen tillbaka
        const token = data.response.token; // Token utifrån data
        const username = data.response.user.username; // Användarnamnet från backend
        const userRole = data.response.user.role;
        // Om token inte finns inom responsen så går inte inloggningen igenom
        if (!response.ok || !token) {
            document.getElementById("login-spinner").classList.add("hidden"); // Döljer ikonen vid misslyckad respons
            throw new Error("Kunde inte logga in användaren...");
            return;
        }
        localStorage.setItem("login-key", token); // Sparar token i localstorage
        errorMsgList.innerHTML = ""; // Raderar eventuella felmeddelanden från tidigare försök
        document.getElementById("login-spinner").classList.remove("hidden"); // Visar laddningsikonen
        // Visar ett felmeddelande i DOM vid lyckad inloggning
        successMsg.push("Loggar in användare") // Meddelande i DOM att inloggningen gick bra
        displaySuccessMsg(successMsg); // Visar att inloggningen lyckades i DOM
        localStorage.setItem("username", username); // Sparar användarnamnet i localstorage
        localStorage.setItem("role", userRole); // Sparar användarnamnet i localstorage
        // Liten delay innan redirect för att hinna spara token i localstorage och visa laddningsikon en kort stund
        setTimeout(() => {
            document.getElementById("login-spinner").classList.add("hidden"); // Döljer ikonen efter redirect
            successMsgList.innerHTML = "";
            window.location.href = "index.html";
        }, 1200);
    } catch (error) {
        console.error("Kunde inte logga in användaren: ", error);

        // Felmeddelanden i DOM
        errors.push("Kunde inte logga in...");
        errors.push("Fel email eller lösenord!");

        displayErrorMsg(errors); // Visar felmeddelanden
        return; // Kör inte vidare med inloggningen
    }
}

// Funktion som skriver ut felmeddelanden i DOM
function displayErrorMsg(errors) {
    const errorMsgList = document.querySelector(".error-message ul");
    errorMsgList.innerHTML = "";
    errors.forEach(error => {
        const liEl = document.createElement("li"); // Skapar ett li för varje specifikt felmeddelande
        liEl.textContent = error; // Tillger li-elementet texten som genererats inom arrayen av errors
        errorMsgList.appendChild(liEl); // Lägger till li-elementet inom felmeddelande-listan
    });
}

// Funktion för att visa inloggning fungerade i DOM
function displaySuccessMsg(successMsg) {

    //Lyckas success med meddelande inom DOM
    const successMsgList = document.querySelector(".success-message ul");
    successMsgList.innerHTML = "";
    const liEl = document.createElement("li");
    liEl.textContent = successMsg;
    successMsgList.appendChild(liEl);
}

// Lägger till användarnamn inom UI för inläggs-sidan
function displayUserUi() {

    const role = localStorage.getItem("role");
    const adminUser = document.getElementById("admin-user"); // Elemenent inom HTML
    const usernameKey = localStorage.getItem("username"); // Hämtar användarnamn
    // Om det finns användarnamn sparat
    if (localStorage.getItem("login-key")) {
        // Struktur med meddelande
        adminUser.innerHTML = `
        <p> Inloggad som ${role}: <span class="user-span">${usernameKey} </span></p>
        <p>Vad vill du göra?</p>
        `;
    } else { // Annars tomt
        adminUser.innerHTML = "";
    }
}
// Loggar ut användare
function logoutUser() {
    const logoutBtn = document.getElementById("logout-button");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("login-key");
            localStorage.removeItem("username");
            localStorage.removeItem("role");
            window.location.href = "login.html";
        });
    }
}