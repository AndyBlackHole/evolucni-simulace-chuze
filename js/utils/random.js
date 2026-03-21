// random.js
// Tento modul poskytuje náhodné utility použitelné v evolučním algoritmu.
// Funkce jsou čisté (bez vedlejších efektů mimo vlastní generování náhodných čísel).
// Cílem je mít všechny náhodné operace na jednom místě,
// což zvyšuje čitelnost a kontrolu nad celým projektem.


// Náhodné reálné číslo z intervalu <min, max>.
// Používá se pro mutace úhlů nebo jiné hodnoty.
export function randomFloat(min, max) {
    return Math.random() * (max - min) + min;
}


// Náhodné celé číslo z intervalu <min, max> včetně max.
// Užitečné pro náhodné indexy do pole.
export function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// Náhodný výběr hodnoty z pole.
// Při výběru rodičů nebo instrukcí je tato funkce základní pomocná rutina.
export function randomChoice(array) {
    if (!Array.isArray(array) || array.length === 0) {
        throw new Error("randomChoice: prázdné nebo neplatné pole");
    }
    const index = randomInt(0, array.length - 1);
    return array[index];
}


// Náhodná hodnota true/false podle pravděpodobnosti chance.
// Například s chance = 0.1 vrací pravdu v 10 % případů.
export function randomChance(chance) {
    return Math.random() < chance;
}


// Náhodný úhel v intervalu <minDeg, maxDeg>.
// Evoluční algoritmus pracuje s úhly ve stupních.
export function randomAngle(minDeg, maxDeg) {
    return randomFloat(minDeg, maxDeg);
}


// Náhodná změna úhlu pro mutaci.
// Hodnota je z intervalu <-strength, +strength>.
export function randomAngleDelta(strength) {
    return randomFloat(-strength, strength);
}