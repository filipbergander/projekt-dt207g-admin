# Projektuppgift | Backend-baserad webbutveckling DT207G
## Admin-webbplats för fiktiv restaurang

Uppgiften består av tre delar, en webbtjänst, en admin-sida och publik webbplats. I detta repo skapade jag admin-sidan genom HTML, SCSS, JavaScript samt VITE.
Sidan är till för personalen på restaurangen **Trattoria Lema**. 
De ska ha möjlighet att administrera inkommande bokningar, publicera nyhetsinlägg samt skapa kvällsmenyn genom att hantera den med maträtter och bilder. 
Jag valde alltså genom dessa funktioner att skapa ytterligare funktionalitet utöver grundkraven i uppgiften.
  
All funktionalitet för att administrera restaurangens gränssnitt görs mot databasen MongoDB samt hosten Render.  

**Webbplats**: https://admin-trattorialema.netlify.app/  
**JSDoc**: https://admin-trattorialema.netlify.app/docs/index.html

## Webbplatsens sidor
- Logga in
- Startsida med dashboard
- Bokningar
- Kvällsmeny
- Nyhetsinlägg
- Registrera användare

### Funktionalitet

**Inloggning** behöver först göras för att kunna administrera och detta sköts genom JSON-Webtokens och hashade lösenord.
På startsidan finns en dashboard som kort beskriver användarens behörighet och användarnamn samt inleder med frasen "Vad vill du göra?"
Två behörigheter finns, **Admin** samt **Personal**. Personalen kan endast generera innehåll till den publika restaurangwebbplatsen, medan admin kan skapa både användare och innehåll.
<p align="center">
<img width="900" height="550" alt="image" src="https://github.com/user-attachments/assets/09a52b7c-f029-49e7-ad4e-d47b7870005f" />
</p>


**Bokningar** kan skapas på den publika restaurangwebbplatsen och skickas sedan till admin-sidan genom databasen. Inom sidan bokningar kan personalen fiktivt neka eller godkänna dem. Ingen uppdatering sker mot backend när man "leker" med att neka eller godkänna, utan först när en bokning raderas anropas backend med "DELETE". Detta ses som en visuell markering enbart med selectbox av pending, approved eller declined där bokningens färg ändras beroende på val. Sammanfattningsvis sker inget anrop mot den faktiska mejlen, telefonnumret eller namnet som användaren matar in utan de är endast synliga för uppgiftens skull.  

**Kvällsmeny** finns för att skapa nya maträtter med namn, beskrivning, pris och kategori. Bilder skapas i ett annat formulär till respektive kategori av maträtt där begränsningen är en bild per kategori av maträtt. För bilder anger personalen kategori, bildfil och alt-text. Funktionalitet för att uppdatera bildens kategori och alt-text finns tillgängligt.

**Nyhetsinlägg** skapas genom ett formulär med rubrik, textinnehåll samt skribent. På admin-sidan visas även timestamp när artikeln blev publicerad samt skribentens namn. Stöd finns för att redigera eller ta bort inlägg.


## Övrigt
Mitt mål med hemsidan var att skapa en enkel men användarvänlig plattform till personalen på restaurangen. Hemsidan testades inom webbläsarna Google Chrome, Microsoft Edge samt Mozilla Firefox. Validering gjordes i WCAG, WAVE, PageSpeed Insights och W3Cs testverktyg för HTML och stilmallar. Dokumentation för JavaScript skapades med JSDoc.

*Filip Bergander Mittuniversitetet*
