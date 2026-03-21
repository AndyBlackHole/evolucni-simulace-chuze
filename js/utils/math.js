// math.js
// Tento modul obsahuje čisté matematické utility,
// které používají další části aplikace (fyzika, vykreslování, tvor).
// Jedná se o malé jednoúčelové funkce, které zlepšují čitelnost a údržbu kódu.
// Všechny funkce jsou čisté (pure functions), bez vedlejších efektů.


// Převod stupňů na radiány.
// Trigonometrické funkce v JavaScriptu pracují v radiánech,
// ale evoluční algoritmus používá úhly ve stupních.
export function degToRad(deg) {
    return deg * (Math.PI / 180);
}


// Oříznutí hodnoty do intervalu [min, max].
// Funkce clamp se používá k omezení úhlů, rychlostí nebo pozic,
// aby simulace zůstala stabilní.
export function clamp(value, min, max) {
    if (value < min) return min;
    if (value > max) return max;
    return value;
}


// Normalizace úhlu do intervalu -180 až 180 stupňů.
// Chrání nás před postupnou akumulací velkých čísel
// a zároveň nepovoluje úhly mimo rozumný rozsah.
export function normalizeAngle(deg) {
    let result = deg % 360;
    if (result > 180) result -= 360;
    if (result < -180) result += 360;
    return result;
}


// Výpočet Eukleidovské vzdálenosti dvou bodů.
// Používá se pro měření kroků tvora nebo vzdálenost segmentů.
export function distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
}


// Lineární interpolace mezi hodnotami a a b.
// Užitečné pro vyhlazování animací nebo přechodů.
export function lerp(a, b, t) {
    return a + (b - a) * t;
}


// Výpočet délky vektoru (dx, dy).
// Používá se v jednoduché fyzice pro výpočet velikosti síly.
export function vectorLength(dx, dy) {
    return Math.sqrt(dx * dx + dy * dy);
}


// Výpočet směrového vektoru podle úhlu a délky.
// Umožňuje získat pozici konce segmentu nohy na základě úhlu.
// Výpočet směrového vektoru podle úhlu a délky.
// Umožňuje získat pozici konce segmentu nohy na základě úhlu.
export function angleToVector(angleDeg, length) {
    // Přidáme 90 stupňů, aby úhel 0 znamenal směr dolů (k zemi) a ne doprava!
    const rad = degToRad(angleDeg + 90); 
    return {
        x: Math.cos(rad) * length,
        y: Math.sin(rad) * length
    };
}


// Zjištění, zda je hodnota v určité toleranci.
// Tato funkce je užitečná pro porovnávání úhlů nebo pozic.
export function approxEqual(a, b, tolerance = 0.0001) {
    return Math.abs(a - b) <= tolerance;
}