import '../sass/main.scss'
import { checkAuthAccess } from "./authentication/checkAuth.js";
import { changeFooterText } from "./authentication/checkAuth.js";

"use strict";
// Url till backend
const url = "http://localhost:3000";
//const url = "https://fb-backend-api-p9fp.onrender.com";
let rotateDishIcon = 0; // Variabel för att rotera ikon till att resetta matformuläret
let rotateImageIcon = 0; // Variabel för att rotera ikon till att resetta bildformuläret
const formResetBtn = document.getElementById("reset-form-btn"); // Knapp för att resetta formulär till maträtt
const imageFormResetBtn = document.getElementById("reset-image-form-btn"); // Knapp för att resetta formulär till bild

document.addEventListener("DOMContentLoaded", () => {
    checkAuthAccess(); // Middleware för att se över om användaren är behörig
    initLoginForm(); // Formuläret för att logga in en användare
    initRegisterForm(); // Formuläret för att registrera en ny användare
    initNewDinnerForm() // Formuläret för att skapa en ny maträtt
    initNewImageForm() // Formuläret för att skapa en ny bild
    logoutUser(); //För att logga ut en användare
    listenDinnerBtns(); // Lyssnar på knappar för specifika maträtter delete/uppdatera
    listenImageBtns(); // Lyssnar på knappar för specifika bilder delete/uppdatera
    changeDinnerForm(); // Växlar mellan att visa maträtter eller formuläret
    displayUserUi(); // Visar inloggade användare sina användarnamn på startsidan
    fetchCategoryImages(); // Hämtar in bilder som lagts till för varje kategori av maträtt¨

    // Om man är på den sidan med knappen
    if (formResetBtn) {
        formResetBtn.addEventListener("click", () => {
            rotateDishIcon += -360; // Snurrar ett varv vid varje klick
            formResetBtn.style.transform = `rotate(${rotateDishIcon}deg)`; // Roterar ikonen varje gång ett varv
            resetDishForm(); // Resettar formuläret
        });
    }

    if (imageFormResetBtn) {
        imageFormResetBtn.addEventListener("click", () => {
            rotateImageIcon += -360; // Snurrar ett varv vid varje klick
            imageFormResetBtn.style.transform = `rotate(${rotateImageIcon}deg)`; // Roterar ikonen varje gång ett varv
            resetImageForm(); // Resettar formuläret
        });
    }
});

// Lyssnar på ändringar som görs i formuläret, visar felmeddelanden i DOM och anropar funktionen för att logga in en användare
function initLoginForm() {
    // Formuläret med knapp för att logga in en användare
    const loginForm = document.getElementById("login-form");
    const loginBtn = document.getElementById("login-btn");

    // Eventlyssnare för inloggningsformuläret
    if (loginForm) {
        loginForm.addEventListener("submit", async(event) => {
            event.preventDefault();
            let errors = [];

            // Hämtar värden inom inloggningsformuläret
            const loginEmail = document.getElementById("login-email").value.trim();
            const loginPassword = document.getElementById("login-password").value.trim();

            const errorMsgList = loginForm.querySelector(".error-message ul"); // Felmeddelanden

            // Specifika felmeddelande för inputs
            if (loginEmail === "") errors.push("Du måste fylla i email!");
            if (loginPassword === "") {
                errors.push("Du måste fylla i lösenord!")
            } else if (loginPassword.length < 6) {
                errors.push("Lösenordet måste vara minst 6 tecken!");
            }

            // Om felmeddelanden finns visas dem genom funktionen displayErrorMsg
            if (errors.length > 0) {
                displayErrorMsg(errors, errorMsgList);
                return; // Stoppar formuläret från att bli submittat
            } else {
                await loginUser(); // Loggar in användaren genom funktionen
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

            // Meddelanden i DOM
            const errorMsgList = registerForm.querySelector(".error-message ul");
            const successMsgList = registerForm.querySelector(".success-message ul");

            // "Registrerings-spinner"
            const loadingSpinner = registerForm.querySelector(".loading-spinner");

            // Specifika felmeddelande för inputs
            if (registerUsername === "") errors.push("Du måste fylla i användarnamn!");

            if (registerEmail === "") {
                errors.push("Du måste fylla i email!");
            } else if (!registerEmail.includes("@") || !registerEmail.includes(".") || registerEmail.length < 5) {
                errors.push("Du måste ange en giltig email-adress!");
            }

            if (registerPassword === "") {
                errors.push("Du måste fylla i lösenord!")
            } else if (registerPassword.length < 6) {
                errors.push("Lösenordet måste vara minst 6 tecken!");
            }

            // Om felmeddelanden finns visas dem genom funktionen displayErrorMsg
            if (errors.length > 0) {
                displayErrorMsg(errors, errorMsgList);
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

            // Kategorier som enbart är tillåtna att ange
            const categoriesAllowed = ["Förrätt", "Huvudrätt", "Efterrätt", "Dryck"];

            // Felmeddelanden containern
            const errorMsgList = newDishForm.querySelector(".error-message ul");

            // Specifika felmeddelande för inputs
            if (dinnerCategory === "" || dinnerCategory === "Välj kategori") {
                errors.push("Du måste välja en kategori!");
            } else if (!categoriesAllowed.includes(dinnerCategory)) {
                errors.push("Fy! Manipulera inte kategorin...");
            }

            if (dinnerDishName === "") {
                errors.push("Du måste fylla i namn!");
            } else if (dinnerDishName.length < 3) {
                errors.push("Namnet måste vara längre än 3 bokstäver...");
            } else if (dinnerDishName.length > 40) {
                errors.push("Namnet kan inte vara längre än 40 bokstäver...");
            }

            if (dinnerDishPrice === "") {
                errors.push("Ange pris!")
            } else if (dinnerDishPrice <= 0) {
                errors.push("Priset måste vara större än 0 kr");
            } else if (dinnerDishPrice > 1000) {
                errors.push("Priset kan inte vara dyrare än 1000 kr")
            }

            if (dinnerCategory !== "Dryck" && dinnerDishDescription === "") {
                errors.push("Beskrivning krävs för en maträtt...");
            }

            if (dinnerCategory !== "Dryck" && dinnerDishDescription !== "" && (dinnerDishDescription.length < 6 || dinnerDishDescription.length > 100)) {
                errors.push("Beskrivning för en maträtt måste vara mellan 6 och 100 tecken")
            }

            // Om felmeddelanden finns visas dem genom funktionen displayErrorMsg
            if (errors.length > 0) {
                displayErrorMsg(errors, errorMsgList);
                return; // Stoppar formuläret från att bli submittat
            }
            // Kollar om id för en post finns lagrat i localstorage, -> vid uppdatering av maträtt
            if (dinnerId) {
                newDinnerBtn.textContent = "Uppdatera maträtten";
                const successMsgList = newDishForm.querySelector(".success-message ul"); // Meddelanden vid lyckat resultat
                await updateDinnerDish(dinnerId);
                let successMsg = [];
                successMsg.push("Uppdaterar maträtten!")
                displaySuccessMsg(successMsg, successMsgList);
                newDishForm.querySelector(".loading-spinner").classList.remove("hidden");
                setTimeout(() => {
                    newDishForm.querySelector(".loading-spinner").classList.add("hidden"); // Döljer ikonen

                    // Resettar formuläret efter lyckad registrering
                    resetDishForm();
                    // Visar listan av maträtter
                    document.getElementById("new-dish-container").classList.add("hidden");
                    document.getElementById("edit-dish-container").classList.remove("hidden");
                }, 1000);
                // Tömmer felmeddelanden i formuläret
                errorMsgList.innerHTML = "";
                await fetchDinnerDishes(); // Hämtar listan av maträtter 
            } else {
                /* Annars om inga felmeddelanden eller något lagrat i localstorage för en maträtt finns, anropas funktionen för att använda till att skapa en ny rätt*/
                createNewDinnerDish();
            }
        });
    }
}

// formulär för att lägga till en ny bild med felhantering
function initNewImageForm() {

    // Formulär och knappar
    const addImageForm = document.getElementById("add-image-form");
    const addImageBtn = document.getElementById("add-image-btn");

    // Inputs för bilder
    const imageCategoryInput = document.getElementById("image-category");
    const fileInput = document.getElementById("image-file");
    const altInput = document.getElementById("image-name");

    // Eventlyssnare för formuläret till bilder
    if (addImageForm) {
        addImageForm.addEventListener("submit", async(event) => {
            event.preventDefault();
            let errors = [];

            // Är det tänkt att man ska uppdatera en befintlig bild?
            //const ImageId = localStorage.getItem("image-id");

            // Hämtar värden inom formuläret
            const imageCategory = imageCategoryInput.value.trim();
            const imageAlt = altInput.value.trim();

            const categoriesAllowed = ["Förrätt", "Huvudrätt", "Efterrätt", "Dryck"];

            // Felmeddelanden containern
            const errorMsgList = addImageForm.querySelector(".error-message ul");


            // Specifika felmeddelande för inputs till bilder
            if (imageCategory === "" || imageCategory === "Välj kategori") {
                errors.push("Du måste välja en kategori!");
            } else if (!categoriesAllowed.includes(imageCategory)) {
                errors.push("Fy! Manipulera inte kategorin...");
            }

            if (!fileInput.files || fileInput.files.length === 0) {
                errors.push("Lägg till en bildfil!");
            }

            if (imageAlt === "") {
                errors.push("Lägg till en alt-text!")
            } else if (imageAlt.length > 50) {
                errors.push("Alt-texter kan inte vara längre än 50 tecken...");
            }

            // Om felmeddelanden finns visas dem genom funktionen displayErrorMsg
            if (errors.length > 0) {
                displayErrorMsg(errors, errorMsgList);
                return; // Stoppar formuläret från att bli submittat
            }
            await createNewImage();
            await fetchCategoryImages();
            // Kollar om id för en post finns lagrat i localstorage, -> vid uppdatering av en bild
            /* if (ImageId) {
                 addImageBtn.textContent = "Uppdatera bilden";
                 const successMsgList = document.querySelector(".success-message ul"); // Meddelanden vid lyckat resultat
                 await updateImage(ImageId);
                 let successMsg = [];
                 successMsg.push("Uppdaterar bilden!")
                 displaySuccessMsg(successMsg);
                 document.querySelector(".loading-spinner").classList.remove("hidden");
                 setTimeout(() => {
                     document.querySelector(".loading-spinner").classList.add("hidden"); // Döljer ikonen

                     // Resettar formuläret när bilden uppdaterats
                     resetImageForm();
                 }, 1000);

                 // Felmeddelanden i formuläret
                 document.querySelector(".error-message ul").innerHTML = "";
                 await fetchCategoryImages();
             } else {

                 // Annars om inga felmeddelanden eller något lagrat i localstorage för en bild finns, anropas funktionen för att använda till att skapa en ny bild
               
             }*/
        });
    }
}

// För att logga in en användare
async function loginUser() {

    const loginForm = document.getElementById("login-form");
    if (!loginForm) return; // Om inget formulär för inloggning finns, -> return

    // Inputs inom formuläret
    const email = document.getElementById("login-email").value.trim();
    const password = document.getElementById("login-password").value.trim();

    const errorMsgList = loginForm.querySelector(".error-message ul"); // Felmeddelanden
    const successMsgList = loginForm.querySelector(".success-message ul"); // Meddelanden vid lyckat resultat
    const loadingSpinner = loginForm.querySelector("#login-spinner"); // "Inloggnings-spinner" ikon
    successMsgList.innerHTML = ""; // Tar bort tidigare inloggningsmeddelanden
    errorMsgList.innerHTML = ""; // Tar bort tidigare felmeddelanden
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

        // Om token inte finns inom responsen så går inte inloggningen igenom
        if (!response.ok) {
            loadingSpinner.classList.add("hidden"); // Döljer ikonen vid misslyckad respons
            displayErrorMsg([data.error || "Kunde inte logga in användaren..."], errorMsgList); // Visar felmeddelande från backend eller vanligt
            throw new Error("Kunde inte logga in användaren...");
            return;
        }

        const token = data.response.token; // Token utifrån data
        const username = data.response.user.username; // Användarnamnet från backend
        const userRole = data.response.user.role;

        if (!token) {
            loadingSpinner.classList.add("hidden"); // Dölje ikonen 
            displayErrorMsg(["Ingen token mottagen från servern..."]);
            return;
        }

        localStorage.setItem("login-key", token); // Sparar token i localstorage
        errorMsgList.innerHTML = ""; // Raderar eventuella felmeddelanden från tidigare försök
        loadingSpinner.classList.remove("hidden"); // Visar laddningsikonen
        // Visar ett felmeddelande i DOM vid lyckad inloggning
        successMsg.push("Loggar in användare") // Meddelande i DOM att inloggningen gick bra
        displaySuccessMsg(successMsg, successMsgList); // Visar att inloggningen lyckades i DOM
        localStorage.setItem("username", username); // Sparar användarnamnet i localstorage
        localStorage.setItem("role", userRole); // Sparar användarnamnet i localstorage
        // Liten delay innan redirect för att hinna spara token i localstorage och visa laddningsikon en kort stund
        setTimeout(() => {
            loadingSpinner.classList.add("hidden"); // Döljer ikonen efter redirect
            successMsgList.innerHTML = "";
            window.location.href = "index.html";
        }, 1200);
    } catch (error) {
        console.error("Kunde inte logga in användaren: ", error);

        // Felmeddelanden i DOM
        errors.push("Kunde inte logga in...");
        errors.push("Fel email eller lösenord!");

        displayErrorMsg(errors, errorMsgList); // Visar felmeddelanden
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
    const errorMsgList = registerForm.querySelector(".error-message ul"); // Felmeddelanden
    const successMsgList = registerForm.querySelector(".success-message ul"); // Meddelanden vid lyckat resultat
    const loadingSpinner = registerForm.querySelector(".loading-spinner"); // "Registrerings-spinner" ikon
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
            loadingSpinner.classList.add("hidden"); // Visar ingen laddningsikon
            const BackendError = data.error || "Kunde inte skapa en ny användare..."; // Felmeddelande från backend eller vanligt
            showError([BackendError], errorMsgList); // Visar felmeddelanden från backend, ex upptagna användarnamn/email
            return;
        }

        // Vid lyckat resultat
        loadingSpinner.classList.remove("hidden"); // Visar laddningsikonen
        errorMsgList.innerHTML = ""; // Raderar eventuella felmeddelanden från tidigare försök
        successMsg.push("Användare skapas!") // Meddelande i DOM att inloggningen gick bra
        displaySuccessMsg(successMsg, successMsgList); // Visar att inloggningen lyckades i DOM
        setTimeout(() => {
            loadingSpinner.classList.add("hidden"); // Döljer ikonen
            // Resettar formuläret efter lyckad registrering
            successMsgList.innerHTML = "";

            emailInput.value = "";
            passwordInput.value = "";
            usernameInput.value = "";

        }, 1000);
    } catch (error) {
        console.error("Kunde inte skapa en ny användare: ", error);
        showError(["Oväntat fel. Försök igen om en stund!"], errorMsgList); // Visar felmeddelande i DOM
    }
}
// Skapar en ny maträtt genom databasen
async function createNewDinnerDish() {
    // Variabler för inputs och formuläret
    const categoryInput = document.getElementById("dish-category");
    const nameInput = document.getElementById("dish-name");
    const priceInput = document.getElementById("dish-price");
    const descriptionInput = document.getElementById("dish-description");
    const newDishForm = document.getElementById("new-dish-form");

    // Värdem för inputs inom formuläret 
    const category = categoryInput.value.trim();
    const name = nameInput.value.trim();
    const price = priceInput.value.trim();
    const description = descriptionInput.value.trim();

    // Felmeddelanden
    const errorMsgList = newDishForm.querySelector(".error-message ul");
    //Meddelanden vid lyckat resultat
    const successMsgList = newDishForm.querySelector(".success-message ul");
    const loadingSpinner = newDishForm.querySelector(".loading-spinner"); // Ikon
    successMsgList.innerHTML = ""; // Tar bort tidigare inloggningsmeddelanden

    const token = fetchToken(); // Kollar om token finns för att använda i anropet

    // Meddelanden i DOM
    let errors = [];
    let successMsg = [];
    // Lägger till ny maträtt genom routen i backend
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
            loadingSpinner.classList.add("hidden"); // Visar ingen laddningsikon
            const BackendError = data.error || "Kunde inte skapa en ny maträtt, ej autentiserad..."; // Felmeddelande från backend eller vanligt
            showError([BackendError], errorMsgList); // Visar felmeddelanden från backend
            return;
        }

        // Vid lyckat resultat
        loadingSpinner.classList.remove("hidden"); // Visar laddningsikonen
        errorMsgList.innerHTML = ""; // Raderar eventuella felmeddelanden från tidigare försök
        successMsg.push("Ny maträtt skapas!") // Meddelande i DOM att maträtten skapas
        displaySuccessMsg(successMsg, successMsgList); // Visar meddelandet
        setTimeout(() => {
            loadingSpinner.classList.add("hidden"); // Döljer ikonen

            // Resettar formuläret efter lyckad maträtt
            resetDishForm();
        }, 1000);
    } catch (error) {
        console.error("Kunde inte skapa en ny middags-maträtt: ", error);
        showError(["Oväntat fel. Försök igen om en stund!"], errorMsgList); // Visar felmeddelande i DOM
    }
}
// Hämtar maträtter från middagsmeny i backend
async function fetchDinnerDishes() {
    const dishList = document.getElementById("dishes-list");
    const loadingText = document.getElementById("loading-text");
    //const token = fetchToken(); // Token används för att se om användaren är behörig
    // Meddelande innan data har hämtats i backend
    loadingText.textContent = "Hämtar maträtter från databasen, vänta på att servern ska vakna..."
    try {
        const response = await fetch(`${url}/dinner`);
        /*, {
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
               });*/

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
    const drink = dinnerDishes.filter(dinner => dinner.category.trim() === "Dryck");

    // Container som kolumn för varje kategori av maträtt
    const startList = document.getElementById("starters-list");
    const mainCourseList = document.getElementById("main-course-list");
    const dessertList = document.getElementById("dessert-list");
    const drinkList = document.getElementById("drink-list");

    // Anropar funktionen efter alla kategorier med sina containers
    renderCategoryDish(startList, starter);
    renderCategoryDish(mainCourseList, main);
    renderCategoryDish(dessertList, dessert);
    renderCategoryDish(drinkList, drink);
}

async function filterDinnerImages(dataImages) {
    // Filtrerar efter kategorier som finns för bilderna, samma som maträtter
    const starterImages = dataImages.filter(image => image.category.trim() === "Förrätt");
    const mainImages = dataImages.filter(image => image.category.trim() === "Huvudrätt");
    const dessertImages = dataImages.filter(image => image.category.trim() === "Efterrätt");
    const drinkImages = dataImages.filter(image => image.category.trim() === "Dryck");

    // Container för bilder inom varje kategori av maträtt
    const startImageContainer = document.getElementById("starter-images");
    const mainImageContainer = document.getElementById("main-course-images");
    const dessertImageContainer = document.getElementById("dessert-images");
    const drinkImageContainer = document.getElementById("drink-images");

    // Anropar funktionen för att visa bilderna inom sina containers
    renderCategoryImages(startImageContainer, starterImages);
    renderCategoryImages(mainImageContainer, mainImages);
    renderCategoryImages(dessertImageContainer, dessertImages);
    renderCategoryImages(drinkImageContainer, drinkImages);
}
// Hämtar specifik bild genom id från backend, används för att fylla i formuläret med data för att uppdatera en bild
async function fetchImageById(id) {
    const token = fetchToken(); // Token används för att se om användaren är behörig
    try {
        const response = await fetch(`${url}/dinner/category-images/${id}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) {
            throw new Error("Kunde inte hämta den specifika bilden...");
        }
        const fetchedImage = await response.json();
        return fetchedImage;
    } catch (error) {
        console.error("Det gick inte att hämta den specifika bilden:", error);
        throw error;
    }
}
// Hämtar specifik maträtt genom id från backend, används för att fylla i formuläret med data för att uppdatera en maträtt
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
    container.innerHTML = ""; // Tömmer innan det läggs på nya maträtter

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
        console.log("Raderad maträtt:", data); // Om man lyckats radera en maträtt
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

// Tar bort en kategoribild
async function deleteCategoryImage(id) {
    const token = fetchToken(); // Kollar om token finns för att använda i anropet
    try {
        const response = await fetch(`${url}/dinner/category-images/${id}`, {
            method: "DELETE",
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        // Om man inte fick en respons
        if (!response.ok) {
            throw new Error(`Det gick inte att radera bilden...`);
        }
        const data = await response.json();
        console.log("Raderad bild:", data); // Om man lyckats radera en bild
        return true;
    } catch (error) {
        console.error("Det gick inte att radera den specifika bilden:", error);
        throw error;
    }
}

async function fetchCategoryImages() {
    const imageSection = document.getElementById("image-container");
    if (!imageSection) return; // Om ingen container för bilderna finns, -> return
    const loadingImageText = document.getElementById("loading-images-text");
    loadingImageText.textContent = "Hämtar bilder från databasen, vänta på att servern ska vakna..."
    try {
        const response = await fetch(`${url}/dinner/category-images`);

        if (!response.ok) {
            throw new Error("Kunde inte hämta kategori-bilder...");
        }

        const dataImages = await response.json(); // Data
        loadingImageText.textContent = ""; // Tömmer tidigare text innan nya bilder hämtas
        if (dataImages.length === 0) {
            loadingImageText.textContent = "Inga bilder finns tillagda i databasen än..."
            loadingImageText.style.textAlign = "center";
            return;
        }
        filterDinnerImages(dataImages) // Anropar funktionen för att filtrera bilderna efter deras kategorier
    } catch (error) {
        console.error("Kunde inte hämta kategori-bilder: ", error);
        loadingImageText.textContent = "Kunde inte hämta bilder från servern, prova logga in igen..."
        loadingImageText.style.textAlign = "center";
    }
}
// Skapar en ny bild genom formuläret till databsen
async function createNewImage() {
    // Inputs och formulär
    const imageCategoryInput = document.getElementById("image-category");
    const fileInput = document.getElementById("image-file");
    const altInput = document.getElementById("image-name");
    const newImageForm = document.getElementById("add-image-form");

    // Värden för inputs inom formuläret 
    const imageCategory = imageCategoryInput.value.trim();
    const imageFileName = fileInput.files[0];
    const imageAlt = altInput.value.trim();

    // Felmeddelanden
    const errorMsgList = newImageForm.querySelector(".error-message ul");

    // Meddelanden vid lyckat resultat
    const successMsgList = newImageForm.querySelector(".success-message ul");
    successMsgList.innerHTML = ""; // Tar bort tidigare inloggningsmeddelanden
    // Loading-ikon
    const loadingSpinner = newImageForm.querySelector(".loading-spinner");

    const token = fetchToken(); // Kollar om token finns för att använda i anropet

    // Meddelanden i DOM
    let errors = [];
    let successMsg = [];

    // Formdata för att kunna skicka bildfilen inom anropet till backend
    const imageData = new FormData();
    imageData.append("category", imageCategory);
    imageData.append("alt", imageAlt);
    imageData.append("image", imageFileName);

    // Lägger till bild genom routen i backend
    try {
        const response = await fetch(`${url}/dinner/category-images`, {
            method: "POST",
            headers: {
                'Authorization': 'Bearer ' + token
            },
            body: imageData
        });
        const data = await response.json();
        // Vid misslyckat resultat
        if (!response.ok) {
            loadingSpinner.classList.add("hidden"); // Visar ingen laddningsikon
            const BackendError = data.error || "Kunde inte lägga till bilden, ej autentiserad..."; // Felmeddelande från backend eller vanligt
            showError([BackendError], errorMsgList); // Visar felmeddelanden från backend
            return;
            console.error("Kunde inte lägga till bilden: ", error);
        }

        // Vid lyckat resultat
        loadingSpinner.classList.remove("hidden"); // Visar laddningsikonen
        errorMsgList.innerHTML = ""; // Raderar eventuella felmeddelanden från tidigare försök
        successMsg.push("Bilden läggs till!") // Meddelande i DOM att bilden läggs till
        displaySuccessMsg(successMsg, successMsgList); // Visar meddelandet
        setTimeout(() => {
            loadingSpinner.classList.add("hidden"); // Döljer ikonen
            // Resettar formuläret när bilden blivit tillagd
            resetImageForm();
        }, 1000);
    } catch (error) {
        console.error("Kunde inte lägga till bilden: ", error);
        showError(["Oväntat fel. Försök igen om en stund!"], errorMsgList); // Visar felmeddelande i DOM
    }
}

async function renderCategoryImages(container, categoryImages) {
    // Om ingen container av kategorier för bilderna finns, return
    if (!container) return;

    container.innerHTML = ""; // Tömmer innan det läggs på nya bilder
    categoryImages.forEach(image => {
        const div = document.createElement("div"); //div för att lägga bilden inom
        div.classList.add("image-article");

        const imgEl = document.createElement("img"); // skapar img-element
        imgEl.src = image.image; // Bildens url
        imgEl.alt = image.alt; // Alt-texten för bilden som angetts

        const p = document.createElement("p");
        p.textContent = `Alt-text: ${image.alt}`; // Visar alt-texten under varje bild

        const divEl = document.createElement("div");
        divEl.classList.add("image-row-btns");

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Radera";
        deleteBtn.classList.add("delete-image-btn");
        deleteBtn.dataset.id = image._id;

        const editBtn = document.createElement("button");
        editBtn.textContent = "Uppdatera";
        editBtn.classList.add("update-image-btn");
        editBtn.dataset.id = image._id;
        // Lägger till knapparna inom deras egna div
        divEl.appendChild(deleteBtn);
        divEl.appendChild(editBtn);

        // Lägger till resten av elementen inom diven för varje bild
        div.appendChild(imgEl);
        div.appendChild(p);
        div.appendChild(divEl);

        // Lägger till själva diven inom containern
        container.appendChild(div);
    });

}
// Funktion som skriver ut felmeddelanden i DOM
function displayErrorMsg(errors, UlElement) {
    /*const errorMsgList = document.querySelector(".error-message ul");
    errorMsgList.innerHTML = "";*/
    UlElement.innerHTML = "";
    errors.forEach(error => {
        const liEl = document.createElement("li"); // Skapar ett li för varje specifikt felmeddelande
        liEl.textContent = error; // Tillger li-elementet texten som genererats inom arrayen av errors
        UlElement.appendChild(liEl); // Lägger till li-elementet inom felmeddelande-listan
    });
}

// Skapar och visar felmeddelanden som finns i backend(API), till frontend i DOM
function showError(errors, UlElement) {
    UlElement.innerHTML = "";
    errors.forEach(error => {
        const liEl = document.createElement("li");
        liEl.textContent = error;
        UlElement.appendChild(liEl);
    });
}

// Funktion för att visa inloggning fungerade i DOM
function displaySuccessMsg(messages, UlElement) {
    //Lyckas success med meddelande inom DOM
    //const successMsgList = document.querySelector(".success-message ul");
    UlElement.innerHTML = "";
    messages.forEach(message => {
        const liEl = document.createElement("li");
        liEl.textContent = message;
        UlElement.appendChild(liEl);
    });
}

// Lägger till användarnamn inom UI för inläggs-sidan
function displayUserUi() {
    const role = localStorage.getItem("role");
    const adminUser = document.getElementById("admin-user"); // Elemenent inom HTML
    const usernameKey = localStorage.getItem("username"); // Hämtar användarnamn

    // Om man inte är på startsidan -> fortsätter inte koden att köras
    if (!adminUser) return;
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

function changeDinnerForm() {
    // Knappar inom middag-sidan
    const newDishBtn = document.getElementById("new-dish-btn");
    const editDishBtn = document.getElementById("edit-dish-btn");
    const addImageBtn = document.getElementById("image-btn");

    // Formulär inom middag-sidan
    const newDishForm = document.getElementById("new-dish-form");
    const newImageForm = document.getElementById("add-image-form");

    // Sektioner inom middag-sidan
    const newDishContainer = document.getElementById("new-dish-container");
    const editDishContainer = document.getElementById("edit-dish-container");
    const imageContainer = document.getElementById("image-container");
    const newImageContainer = document.getElementById("add-new-image-container");

    // Visar formuläret för en ny maträtt
    if (newDishBtn) {
        newDishBtn.addEventListener("click", () => {
            newDishContainer.classList.remove("hidden");
            newDishBtn.classList.add("active");

            editDishContainer.classList.add("hidden");
            editDishBtn.classList.remove("active");

            imageContainer.classList.add("hidden");
            addImageBtn.classList.remove("active");

            newImageContainer.classList.add("hidden");
            newImageForm.classList.add("hidden");

        });
    }

    // Visar listan av maträtter för att kunna uppdatera/radera dem
    if (editDishBtn) {
        editDishBtn.addEventListener("click", () => {
            fetchDinnerDishes(); // Hämtar in alla maträtter
            editDishContainer.classList.remove("hidden");
            editDishBtn.classList.add("active");

            // Döljer formulär och container för att lägga till en maträtt
            newDishContainer.classList.add("hidden");
            newDishBtn.classList.remove("active");

            // Döljer formulär och container för bilder
            imageContainer.classList.add("hidden");
            addImageBtn.classList.remove("active");

            newImageContainer.classList.add("hidden");
            newImageForm.classList.add("hidden");
        });
    }

    // Visar listan av kategori-bilder samt formuläret
    if (addImageBtn) {
        addImageBtn.addEventListener("click", () => {
            fetchCategoryImages(); // Hämtar in alla kategori-bilder
            imageContainer.classList.remove("hidden");
            addImageBtn.classList.add("active");
            newImageContainer.classList.remove("hidden");
            newImageForm.classList.remove("hidden");

            // Döljer formulär med containers för att se och lägga till maträtter
            newDishContainer.classList.add("hidden");
            newDishBtn.classList.remove("active");

            editDishContainer.classList.add("hidden");
            editDishBtn.classList.remove("active");
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

// Lyssnar på knapparna för att radera och uppdatera en maträtt
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

            newDishForm.querySelector(".success-message ul").innerHTML = "";
            newDishForm.querySelector(".error-message ul").innerHTML = "";

            document.getElementById("dish-form-title").textContent = "Uppdatera maträtt"
            document.getElementById("add-dish-btn").textContent = "Uppdatera maträtt"

            const info = await fetchDinnerById(updateBtnId);
            fillUpdatedDishForm(info);
        }
    });
}

// Lyssnar på knapparna för att radera och uppdatera en bild
function listenImageBtns() {
    // Formulär inom middag-sidan
    const newImageForm = document.getElementById("add-image-form");

    // Sektioner inom middag-sidan
    const newImageContainer = document.getElementById("add-new-image-container");
    const imagesContainer = document.getElementById("image-container");

    document.addEventListener("click", async(event) => {
        const target = event.target;

        if (target.classList.contains("delete-image-btn")) {
            const deleteBtnId = target.dataset.id; // Knappens dataset-id 
            const successOk = await deleteCategoryImage(deleteBtnId); // Anropar funktionen med id som argument

            if (successOk) {
                target.closest(".image-article").remove(); // Tar bort artikeln från DOM
            }
        }

        // För att uppdatera en bilds alt-text/kategori
        else if (target.classList.contains("update-image-btn")) {
            // Hämtar in ID från knappen och sparar till localstorage
            const updateBtnId = target.dataset.id;
            localStorage.setItem("image-id", updateBtnId);

            newImageForm.querySelector(".success-message ul").innerHTML = "";
            newImageForm.querySelector(".error-message ul").innerHTML = "";

            document.getElementById("image-form-title").textContent = "Uppdatera bild";
            document.getElementById("add-image-btn").textContent = "Uppdatera bild";

            const imageInfo = await fetchImageById(updateBtnId);
            fillUpdatedImageForm(imageInfo);
        }
    });
}
// Fyller i formuläret med data från backend för en specifik maträtt -> uppdatera
function fillUpdatedDishForm(dishIfo) {
    // Input i formuläret
    const categoryInput = document.getElementById("dish-category");
    const nameInput = document.getElementById("dish-name");
    const priceInput = document.getElementById("dish-price");
    const descriptionInput = document.getElementById("dish-description");

    // Formuläret får data från backend för den specifika maträtten som ska uppdateras
    categoryInput.value = dishIfo.category;
    nameInput.value = dishIfo.name;
    priceInput.value = dishIfo.price;
    descriptionInput.value = dishIfo.description;
}

// Fyller i formuläret med data från backend för en specifik bild -> uppdatera
function fillUpdatedImageForm(imageInfo) {

    const categoryInput = document.getElementById("image-category");
    const altInput = document.getElementById("image-name");

    // Formuläret för en bild blir ifylld med data från backend
    categoryInput.value = imageInfo.category;
    altInput.value = imageInfo.alt;
}

// Resettar formuläret för en middagsmaträtt
function resetDishForm() {
    const newDishForm = document.getElementById("new-dish-form");
    // Inputs
    document.getElementById("dish-category").value = "Välj kategori";
    document.getElementById("dish-name").value = "";
    document.getElementById("dish-price").value = "";
    document.getElementById("dish-description").value = "";

    // Meddelanden i formuläret
    newDishForm.querySelector(".success-message ul").innerHTML = "";
    newDishForm.querySelector(".error-message ul").innerHTML = "";

    // Texter
    document.getElementById("dish-form-title").textContent = "Lägg till maträtt"
    document.getElementById("add-dish-btn").textContent = "Lägg till maträtt"
        // Localstorage key
    localStorage.removeItem("dinner-id");
}
// Resettar formuläret för kategori-bilder
function resetImageForm() {
    const newImageForm = document.getElementById("add-image-form");
    // Inputs
    document.getElementById("image-category").value = "Välj kategori";
    document.getElementById("image-file").value = "";
    document.getElementById("image-name").value = "";

    // Meddelanden i formuläret
    newImageForm.querySelector(".success-message ul").innerHTML = "";
    newImageForm.querySelector(".error-message ul").innerHTML = "";

    // Texter
    document.getElementById("image-form-title").textContent = "Lägg till bild"
    document.getElementById("add-image-btn").textContent = "Lägg till bild"
        // Localstorage key
    localStorage.removeItem("image-id");
}

// Hämtar in token från localstorage
function fetchToken() {
    return localStorage.getItem("login-key");
}