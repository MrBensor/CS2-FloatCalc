// Tab-Logik
const tabFloat = document.getElementById('tabFloat');
const tabAvg = document.getElementById('tabAvg');
const tabContentFloat = document.getElementById('tabContentFloat');
const tabContentAvg = document.getElementById('tabContentAvg');
tabFloat.addEventListener('click', function() {
    tabFloat.classList.add('active');
    tabAvg.classList.remove('active');
    tabContentFloat.style.display = 'block';
    tabContentAvg.style.display = 'none';
});
tabAvg.addEventListener('click', function() {
    tabAvg.classList.add('active');
    tabFloat.classList.remove('active');
    tabContentFloat.style.display = 'none';
    tabContentAvg.style.display = 'block';
});

// Float-Input-Felder generieren und Wear Rating anzeigen
const floatInputsDiv = document.getElementById('floatInputs');
const wearRatingsDiv = document.getElementById('wearRatings');
function getWearRating(floatVal) {
    if (floatVal < 0.07) return 'Factory New (FN)';
    if (floatVal < 0.15) return 'Minimal Wear (MW)';
    if (floatVal < 0.38) return 'Field-Tested (FT)';
    if (floatVal < 0.45) return 'Well-Worn (WW)';
    if (floatVal <= 1.00) return 'Battle-Scarred (BS)';
    return '';
}
function updateWearRatings() {
    let html = '';
    for (let i = 1; i <= 10; i++) {
        const val = parseFloat(document.getElementById(`float${i}`).value);
        if (!isNaN(val)) {
            html += `Float ${i}: <span>${getWearRating(val)}</span><br>`;
        } else {
            html += `Float ${i}: <span>-</span><br>`;
        }
    }
    wearRatingsDiv.innerHTML = html;
}
for (let i = 1; i <= 10; i++) {
    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.id = `float${i}`;
    input.placeholder = `Float ${i}`;
    input.addEventListener('input', updateWearRatings);
    floatInputsDiv.appendChild(input);
}
updateWearRatings();

// Durchschnitt berechnen
let avgFloat = null;
document.getElementById('calcAvgBtn').addEventListener('click', function() {
    let sum = 0;
    let count = 0;
    for (let i = 1; i <= 10; i++) {
        const val = parseFloat(document.getElementById(`float${i}`).value);
        if (!isNaN(val)) {
            sum += val;
            count++;
        }
    }
    if (count === 10) {
        avgFloat = sum / 10;
        document.getElementById('avgResult').textContent = `Durchschnittlicher Float: ${avgFloat.toFixed(6)}`;
    } else {
        document.getElementById('avgResult').textContent = 'Bitte alle 10 Floats eingeben!';
        avgFloat = null;
    }
});

// Endgültigen Float berechnen

document.getElementById('calcFloatBtn').addEventListener('click', function() {
    const maxCap = parseFloat(document.getElementById('maxCap').value);
    const minCap = parseFloat(document.getElementById('minCap').value);
    if (isNaN(maxCap) || isNaN(minCap)) {
        document.getElementById('finalFloatResult').textContent = 'Bitte Max Cap und Min Cap eingeben!';
        return;
    }
    if (avgFloat === null) {
        document.getElementById('finalFloatResult').textContent = 'Bitte zuerst den Durchschnitt berechnen!';
        return;
    }
    const resultFloat = (maxCap - minCap) * avgFloat + minCap;
    document.getElementById('finalFloatResult').textContent = `Endgültiger Float: ${resultFloat.toFixed(6)} (${getWearRating(resultFloat)})`;
});

// Maximalen Avg Float Tab
document.getElementById('calcMaxAvgBtn').addEventListener('click', function() {
    const targetFloat = parseFloat(document.getElementById('targetFloat').value);
    const maxCap2 = parseFloat(document.getElementById('maxCap2').value);
    const minCap2 = parseFloat(document.getElementById('minCap2').value);
    if (isNaN(targetFloat) || isNaN(maxCap2) || isNaN(minCap2)) {
        document.getElementById('maxAvgResult').textContent = 'Bitte alle Werte eingeben!';
        return;
    }
    const maxAvg = (targetFloat - minCap2) / (maxCap2 - minCap2);
    document.getElementById('maxAvgResult').textContent = `Maximaler Avg Float für Ziel-Float ${targetFloat.toFixed(6)}: ${maxAvg.toFixed(6)}`;
});
