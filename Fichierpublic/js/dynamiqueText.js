const phrases = [
    "Bienvenue sur notre espace virtuele",
    "Sur votre parcours vers un projet immobilier réussi, Nous sommes votre choisissez La Colombe pour un aboutissement magique",
    "Nous vous accompagnons à chaque étape de votre projet",
    "Découvrez des opportunités uniques et des solutions sur mesure pour concrétiser vos rêves immobiliers.",
    "Avec La Colombe, chaque projet devient une réalité grâce à notre expertise et notre engagement.",
    "Faites confiance à une équipe dédiée à transformer vos aspirations en succès tangibles.",
    "Votre satisfaction est notre priorité, et nous mettons tout en œuvre pour dépasser vos attentes.",
    "Merci pour votre attention !",
];

let index = 0;
let charIndex = 0;
const textElement = document.querySelector(".dynamic-text");

function typeText() {
    if (charIndex < phrases[index].length) {
        textElement.textContent += phrases[index].charAt(charIndex);
        charIndex++;
        setTimeout(typeText, 100); // Temps entre chaque lettre (en ms)
    } else {
        setTimeout(eraseText, 2000); // Temps avant de commencer à effacer (en ms)
    }
}

function eraseText() {
    if (charIndex > 0) {
        textElement.textContent = textElement.textContent.slice(0, -1);
        charIndex--;
        setTimeout(eraseText, 20); // Temps entre chaque suppression de lettre (en ms)
    } else {
        index = (index + 1) % phrases.length; // Passer à la phrase suivante
        setTimeout(typeText, 500); // Temps avant de commencer la nouvelle phrase (en ms)
    }
}

typeText();