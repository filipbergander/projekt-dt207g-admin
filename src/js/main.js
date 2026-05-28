import '../sass/main.scss'
import { checkAuthAccess } from "./authentication/checkAuth.js";
import { changeFooterText } from "./authentication/checkAuth.js";

"use strict";
const url = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
    checkAuthAccess();
    initLoginForm();
    initRegisterForm();
    initNewDinnerForm()
    logoutUser();
    listenDinnerBtns();
    changeDinnerForm();
    displayUserUi(); // Om användaren befinner sig på admin-sidan och har loggat in visas deras användarnamn i UI

    document.getElementById("reset-form-btn").addEventListener("click", () => {
        resetDishForm();
    });
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

// Lyssnar på ändringar som görs i formuläret, visar felmeddelanden i DOM och anropar funktionen för att skapa en ny användare
function initRegisterForm() {
    // Formuläret med knapp för att registrera en ny användare
    const registerForm = document.getElementById("register-form");
    const registerBtn = document.getElementById("register-user-btn");

    // Eventlyssnare för registreringsformuläret
    if (registerForm) {
        registerForm.addEventListener("submit", (event) => {
            event.preventDefault();
            let errors = [];

            // Hämtar värden inom registreringsformuläret
            const registerEmail = document.getElementById("register-email").value.trim();
            const registerPassword = document.getElementById("register-password").value.trim();
            const registerUsername = document.getElementById("register-username").value.trim();
            const registerRole = document.getElementById("register-role").value.trim();

            // Specifika felmeddelande för inputs
            if (registerEmail === "") errors.push("Du måste fylla i email!");
            if (registerPassword === "") {
                errors.push("Du måste fylla i lösenord!")
            } else if (registerPassword.length < 6) {
                errors.push("Lösenordet måste vara minst 6 tecken!");
            }
            if (registerUsername === "") errors.push("Du måste fylla i användarnamn!");

            // Om felmeddelanden finns visas dem genom funktionen displayErrorMsg
            if (errors.length > 0) {
                displayErrorMsg(errors);
                return; // Stoppar formuläret från att bli submittat
            } else { // Annars om inga felmeddelanden finns, anropas createUser
                createUser();
            }
        });
    }

}

// formulär för att lägga till en ny maträtt med felhantering
function initNewDinnerForm() {

    // Formulär och knappar
    const newDishForm = document.getElementById("new-dish-form");
    const newDinnerBtn = document.getElementById("add-dish-btn");

    // Inputs
    const categoryInput = document.getElementById("dish-category");
    const nameInput = document.getElementById("dish-name");
    const priceInput = document.getElementById("dish-price");
    const descriptionInput = document.getElementById("dish-description");

    // Eventlyssnare för formuläret
    if (newDishForm) {
        newDishForm.addEventListener("submit", async(event) => {
            event.preventDefault();
            let errors = [];

            // Är det tänkt att man ska uppdatera en befintlig maträtt?
            const dinnerId = localStorage.getItem("dinner-id");

            // Hämtar värden inom formuläret
            const dinnerDishPrice = priceInput.value.trim();
            const dinnerDishName = nameInput.value.trim();
            const dinnerDishDescription = descriptionInput.value.trim();
            const dinnerCategory = categoryInput.value.trim();

            const categoriesAllowed = ["Förrätt", "Huvudrätt", "Efterrätt"];

            // Specifika felmeddelande för inputs
            if (!categoriesAllowed.includes(dinnerCategory.trim().toLowerCase())) {
                errors.push("Fy! Manipulera inte kategorin...");
            }

            if (dinnerDishName === "")
                errors.push("Du måste fylla i namn!");
            if (dinnerDishName.length < 3) {
                errors.push("Namnet måste vara längre än 3 bokstäver...");
            } else if (dinnerDishName.length > 40) {
                errors.push("Namnet kan inte vara längre än 40 bokstäver...");
            }

            if (dinnerDishPrice <= 0) {
                errors.push("Priset måste vara större än 0 kr");
            } else if (dinnerDishPrice > 1000) {
                errors.push("Priset kan inte vara dyrare än 1000 kr")
            }

            if (dinnerDishDescription === "") {
                errors.push("Lägg till en beskrivning!")
            } else if (dinnerDishDescription.length < 6 || dinnerDishDescription.length > 100) {
                errors.push("Beskrivning för en maträtt måste vara mellan 6 och 100 tecken")
            }

            // Om felmeddelanden finns visas dem genom funktionen displayErrorMsg
            if (errors.length > 0) {
                displayErrorMsg(errors);
                return; // Stoppar formuläret från att bli submittat
            }
            // Kollar om id för en post finns lagrat i localstorage, -> vid uppdatering av maträtt
            if (dinnerId) {
                newDinnerBtn.textContent = "Uppdatera maträtten";
                const successMsgList = document.querySelector(".success-message ul"); // Meddelanden vid lyckat resultat
                await updateDinnerDish(dinnerId);
                let successMsg = [];
                successMsg.push("Uppdaterar maträtten!")
                displaySuccessMsg(successMsg);
                document.querySelector(".loading-spinner").classList.remove("hidden");
                setTimeout(() => {
                    document.querySelector(".loading-spinner").classList.add("hidden"); // Döljer ikonen

                    // Resettar formuläret efter lyckad registrering
                    resetDishForm();
                    // Visar listan av maträtter
                    document.getElementById("new-dish-container").classList.add("hidden");
                    document.getElementById("edit-dish-container").classList.remove("hidden");
                }, 1000);
                // Hämtar listan av maträtter 

                // Felmeddelanden i formuläret
                document.querySelector(".error-message ul").innerHTML = "";
                await fetchDinnerDishes();
            } else {

                /* Annars om inga felmeddelanden eller något lagrat i localstorage för en maträtt finns, anropas funktionen för att använda till att skapa en ny rätt*/
                createNewDinnerDish();
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

// För att skapa en ny användare
async function createUser() {

    const emailInput = document.getElementById("register-email");
    const passwordInput = document.getElementById("register-password");
    const usernameInput = document.getElementById("register-username");
    const roleInput = document.getElementById("register-role");

    // Inputs inom formuläret 
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const username = usernameInput.value.trim();
    const role = roleInput.value.trim();

    const registerForm = document.getElementById("register-form");
    const errorMsgList = document.querySelector(".error-message ul"); // Felmeddelanden
    const successMsgList = document.querySelector(".success-message ul"); // Meddelanden vid lyckat resultat
    successMsgList.innerHTML = ""; // Tar bort tidigare inloggningsmeddelanden

    const token = fetchToken(); // Kollar om token finns för att använda i anropet

    //Meddelanden
    let errors = [];
    let successMsg = [];
    // Skapar en ny användare genom routen i backend
    try {
        const response = await fetch(`${url}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ username, email, password, role })
        });
        const data = await response.json();
        // Vid misslyckat resultat
        if (!response.ok) {
            document.querySelector(".loading-spinner").classList.add("hidden"); // Visar ingen laddningsikon
            const BackendError = data.error || "Kunde inte skapa en ny användare..."; // Felmeddelande från backend eller vanligt
            showError(BackendError); // Visar felmeddelanden från backend, ex upptagna användarnamn/email
            return;
        }

        // Vid lyckat resultat
        document.querySelector(".loading-spinner").classList.remove("hidden"); // Visar laddningsikonen
        errorMsgList.innerHTML = ""; // Raderar eventuella felmeddelanden från tidigare försök
        successMsg.push("Användare skapas!") // Meddelande i DOM att inloggningen gick bra
        displaySuccessMsg(successMsg); // Visar att inloggningen lyckades i DOM
        setTimeout(() => {
            document.querySelector(".loading-spinner").classList.add("hidden"); // Döljer ikonen
            // Resettar formuläret efter lyckad registrering
            successMsgList.innerHTML = "";

            emailInput.value = "";
            passwordInput.value = "";
            usernameInput.value = "";

        }, 1000);
    } catch (error) {
        console.error("Kunde inte skapa en ny användare: ", error);
        showError("Oväntat fel. Försök igen om en stund!"); // Visar felmeddelande i DOM
    }
}
// Skapar en ny maträtt genom databasen
async function createNewDinnerDish() {
    const categoryInput = document.getElementById("dish-category");
    const nameInput = document.getElementById("dish-name");
    const priceInput = document.getElementById("dish-price");
    const descriptionInput = document.getElementById("dish-description");

    // Inputs inom formuläret 
    const category = categoryInput.value.trim();
    const name = nameInput.value.trim();
    const price = priceInput.value.trim();
    const description = descriptionInput.value.trim();

    const newDishForm = document.getElementById("new-dish-form");
    const errorMsgList = document.querySelector(".error-message ul"); // Felmeddelanden
    const successMsgList = document.querySelector(".success-message ul"); // Meddelanden vid lyckat resultat
    successMsgList.innerHTML = ""; // Tar bort tidigare inloggningsmeddelanden

    const token = fetchToken(); // Kollar om token finns för att använda i anropet

    // Meddelanden i DOM
    let errors = [];
    let successMsg = [];
    // Skapar en ny användare genom routen i backend
    try {
        const response = await fetch(`${url}/dinner`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ category, name, description, price })
        });
        const data = await response.json();
        // Vid misslyckat resultat
        if (!response.ok) {
            document.querySelector(".loading-spinner").classList.add("hidden"); // Visar ingen laddningsikon
            const BackendError = data.error || "Kunde inte skapa en ny maträtt, ej autentiserad..."; // Felmeddelande från backend eller vanligt
            showError(BackendError); // Visar felmeddelanden från backend, ex upptagna användarnamn/email
            return;
        }

        // Vid lyckat resultat
        document.querySelector(".loading-spinner").classList.remove("hidden"); // Visar laddningsikonen
        errorMsgList.innerHTML = ""; // Raderar eventuella felmeddelanden från tidigare försök
        successMsg.push("Ny maträtt skapas!") // Meddelande i DOM att maträtten skapas
        displaySuccessMsg(successMsg); // Visar meddelandet
        setTimeout(() => {
            document.querySelector(".loading-spinner").classList.add("hidden"); // Döljer ikonen

            // Resettar formuläret efter lyckad maträtt
            resetDishForm();
        }, 1000);
    } catch (error) {
        console.error("Kunde inte skapa en ny middags-maträtt: ", error);
        showError("Oväntat fel. Försök igen om en stund!"); // Visar felmeddelande i DOM
    }
}
// Hämtar maträtter från middagsmeny i backend
async function fetchDinnerDishes() {
    const dishList = document.getElementById("dishes-list");
    const loadingText = document.getElementById("loading-text");
    const token = fetchToken(); // Token används för att se om användaren är behörig
    // Meddelande innan data har hämtats i backend
    loadingText.textContent = "Hämtar maträtter från databasen, vänta på att servern ska vakna..."
    try {
        const response = await fetch(`${url}/dinner`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            throw Error(`Fel hos server, kunde inte hämta maträtter : ${response.status}`)
        }
        const dinnerDishes = await response.json();
        loadingText.textContent = ""; // Tömmer tidigare maträtter innan nya hämtas
        if (dinnerDishes.length === 0) {
            loadingText.textContent = "Inga maträtter finns tillagda i middagsmenyn än..."
            loadingText.style.textAlign = "center";
            //dishList.innerHTML = "";
            return;
        }
        filterDinnerDishes(dinnerDishes);
    } catch (error) {
        console.error("Kunde inte hämta middags-maträtter: ", error);
        //dishList.innerHTML = "";
        // Felmeddelanden i DOM
        loadingText.textContent = "Kunde inte hämta maträtter för middagsmeny från servern, prova logga in igen..."
        loadingText.style.textAlign = "center";
    }
}
// Används för att filtrera kategorier på maträtterna inom middagsmenyn
async function filterDinnerDishes(dinnerDishes) {

    //Filtrerar efter kategorier som finns för maträtter
    const starter = dinnerDishes.filter(dinner => dinner.category.trim() === "Förrätt");
    const main = dinnerDishes.filter(dinner => dinner.category.trim() === "Huvudrätt");
    const dessert = dinnerDishes.filter(dinner => dinner.category.trim() === "Efterrätt");

    // Container som kolumn för varje kategori av maträtt
    const startList = document.getElementById("starters-list");
    const mainCourseList = document.getElementById("main-course-list");
    const dessertList = document.getElementById("dessert-list");

    // Anropar funktionen efter alla kategorier med sina containers
    renderCategoryDish(startList, starter);
    renderCategoryDish(mainCourseList, main);
    renderCategoryDish(dessertList, dessert);
}

async function fetchDinnerById(id) {
    const token = fetchToken(); // Token används för att se om användaren är behörig
    try {
        const response = await fetch(`${url}/dinner/${id}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            throw new Error("Kunde inte hämta den specifika maträtten");
        }
        const fetchedDish = await response.json();
        console.log(fetchedDish);
        return fetchedDish;
    } catch (error) {
        console.error("Det gick inte att hämta den specifika maträtten:", error);
        throw error;
    }
}

// Skriver ut maträtterna efter kategori
async function renderCategoryDish(container, dinnerDishes) {

    // Om ingen container-element för kategori finns
    if (!container) return; // Resten av koden körs inte
    container.innerHTML = ""; // Tömmer innan lägger på nya maträtter

    // Skriver ut maträtterna efter kategori
    dinnerDishes.forEach(dish => {
        const article = document.createElement("article"); // Skapar artikel
        article.classList.add("dinner-article");

        const title = document.createElement("h4"); // Skapar rubrik för varje artikel
        title.textContent = dish.name; // Namnet på varje maträtt i databasen

        const price = document.createElement("p");
        price.textContent = `${dish.price} kr`; // Priset för varje maträtt

        const description = document.createElement("p");
        description.classList.add("dish-dinner-description")
        description.textContent = dish.description; // Beskrivning av varje maträtt

        const div = document.createElement("div");
        div.classList.add("dish-row-btns");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Radera";
        deleteBtn.classList.add("delete-dinner-btn");
        deleteBtn.dataset.id = dish._id;

        const editBtn = document.createElement("button");
        editBtn.textContent = "Uppdatera";
        editBtn.classList.add("update-dinner-btn");
        editBtn.dataset.id = dish._id;

        // Lägger till varje element inom artikeln
        article.appendChild(title);
        article.appendChild(price);
        article.appendChild(description);
        article.appendChild(div);
        div.appendChild(deleteBtn);
        div.appendChild(editBtn);
        // Lägger till artikeln till varje kategori av maträtt
        container.appendChild(article);
    });
}
// Tar bort en rätt från middagsmenyn
async function deleteDinnerDish(id) {
    const token = fetchToken(); // Kollar om token finns för att använda i anropet
    try {
        const response = await fetch(`${url}/dinner/${id}`, {
            method: "DELETE",
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        // Om man inte fick en respons
        if (!response.ok) {
            throw new Error(`Det gick inte att radera maträtten från middagsmenyn`);
        }
        const data = await response.json();
        console.log("Raderad maträtt:", data); // Om man lyckats radera ett jobb visas det i konsollen samt inom frontend såklart
    } catch (error) {
        console.error("Det gick inte att radera den specifika maträtten:", error);
        throw error;
    }
}
// Uppdaterar en rätt från middagsmenyn
async function updateDinnerDish(id) {
    const token = fetchToken(); // Hämtar token

    const categoryInput = document.getElementById("dish-category");
    const nameInput = document.getElementById("dish-name");
    const priceInput = document.getElementById("dish-price");
    const descriptionInput = document.getElementById("dish-description");

    // Inputs inom formuläret 
    const category = categoryInput.value.trim();
    const name = nameInput.value.trim();
    const price = priceInput.value.trim();
    const description = descriptionInput.value.trim();

    const updateDinnerDish = {
        category,
        name,
        price,
        description
    }

    try {
        const response = await fetch(`${url}/dinner/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(updateDinnerDish)
        });
    } catch (error) {
        console.error("Det gick inte att uppdatera den specifika maträtten:", error);
        throw error;
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

// Skapar och visar felmeddelanden som finns i backend(API), till frontend i DOM
function showError(error) {
    const errorMsgList = document.querySelector(".error-message ul");
    errorMsgList.innerHTML = "";
    const li = document.createElement("li");
    li.textContent = error;
    errorMsgList.appendChild(li);
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

    // Om man inte är på startsidan -> fortsätter inte koden att köras
    if (!adminUser) return;
    // Om det finns användarnamn sparat
    if (localStorage.getItem("login-key") && window.location.pathname.endsWith("index.html")) {
        // Struktur med meddelande
        adminUser.innerHTML = `
        <p> Inloggad som ${role}: <span class="user-span">${usernameKey} </span></p>
        <p>Vad vill du göra?</p>
        `;
    } else { // Annars tomt
        adminUser.innerHTML = "";
    }
}

function changeDinnerForm() {
    // Knappar inom middag-sidan
    const newDishBtn = document.getElementById("new-dish-btn");
    const editDishBtn = document.getElementById("edit-dish-btn");

    // Formulär inom middag-sidan
    const newDishForm = document.getElementById("new-dish-form");

    // Sektioner inom middag-sidan
    const newDishContainer = document.getElementById("new-dish-container");
    const editDishContainer = document.getElementById("edit-dish-container");

    // Visar formuläret för en ny maträtt
    if (newDishBtn) {
        newDishBtn.addEventListener("click", () => {
            newDishContainer.classList.remove("hidden");
            newDishBtn.classList.add("active");

            editDishContainer.classList.add("hidden");
            editDishBtn.classList.remove("active");

        });
    }

    // Visar listan av maträtter för att kunna uppdatera/radera dem
    if (editDishBtn) {
        editDishBtn.addEventListener("click", () => {
            fetchDinnerDishes(); // Hämtar in alla maträtter
            editDishContainer.classList.remove("hidden");
            editDishBtn.classList.add("active");

            newDishContainer.classList.add("hidden");
            newDishBtn.classList.remove("active");
        });
    }

}

// Loggar ut användare
function logoutUser() {
    const logoutBtn = document.getElementById("logout-button");
    // Om ingen logga ut knapp finns, -> inloggningssidan
    if (!logoutBtn) return;

    // Vid klick tar bort från localstorage och navigerar till logga in sidan
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("login-key");
        localStorage.removeItem("username");
        localStorage.removeItem("role");
        window.location.href = "login.html";
    });
}

function listenDinnerBtns() {
    // Formulär inom middag-sidan
    const newDishForm = document.getElementById("new-dish-form");

    // Sektioner inom middag-sidan
    const newDishContainer = document.getElementById("new-dish-container");
    const editDishContainer = document.getElementById("edit-dish-container");

    document.addEventListener("click", async(event) => {
        const target = event.target;

        if (target.classList.contains("delete-dinner-btn")) {
            const deleteBtnId = target.dataset.id; // Knappens dataset-id 
            await deleteDinnerDish(deleteBtnId); // Anropar funktionen med id som argument
            target.closest("article").remove(); // Tar bort artikeln från DOM
        } else if (target.classList.contains("update-dinner-btn")) {
            // Hämtar in ID från knappen och sparar till localstorage
            const updateBtnId = target.dataset.id;
            localStorage.setItem("dinner-id", updateBtnId);

            // Visar formuläret men döljer listan av maträtter
            newDishContainer.classList.remove("hidden");
            editDishContainer.classList.add("hidden");

            document.querySelector(".success-message ul").innerHTML = "";
            document.querySelector(".error-message ul").innerHTML = "";

            document.getElementById("dish-form-title").textContent = "Uppdatera maträtt"
            document.getElementById("add-dish-btn").textContent = "Uppdatera maträtt"

            const dishInfo = await fetchDinnerById(updateBtnId);
            fillUpdatedForm(dishInfo);
        }
    });
}

function fillUpdatedForm(dishInfo) {
    const categoryInput = document.getElementById("dish-category");
    const nameInput = document.getElementById("dish-name");
    const priceInput = document.getElementById("dish-price");
    const descriptionInput = document.getElementById("dish-description");

    categoryInput.value = dishInfo.category;
    nameInput.value = dishInfo.name;
    priceInput.value = dishInfo.price;
    descriptionInput.value = dishInfo.description;
}

// Resettar formuläret för en middagsmaträtt
function resetDishForm() {
    // Inputs
    document.getElementById("dish-category").value = "Förrätt";
    document.getElementById("dish-name").value = "";
    document.getElementById("dish-price").value = "";
    document.getElementById("dish-description").value = "";

    // Meddelanden i formuläret
    document.querySelector(".success-message ul").innerHTML = "";
    document.querySelector(".error-message ul").innerHTML = "";

    // Texter
    document.getElementById("dish-form-title").textContent = "Lägg till maträtt"
    document.getElementById("add-dish-btn").textContent = "Lägg till maträtt"
        // Localstorage key
    localStorage.removeItem("dinner-id");
}

// Hämtar in token från localstorage
function fetchToken() {
    return localStorage.getItem("login-key");
}