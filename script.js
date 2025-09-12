// Float-Input-Felder generieren
const floatInputsDiv = document.getElementById('floatInputs');
for (let i = 1; i <= 10; i++) {
    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.id = `float${i}`;
    input.placeholder = `Float ${i}`;
    floatInputsDiv.appendChild(input);
}

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
    if (avgFloat === null) {
        document.getElementById('finalFloatResult').textContent = 'Bitte zuerst den Durchschnitt berechnen!';
        return;
    }
    if (isNaN(maxCap) || isNaN(minCap)) {
        document.getElementById('finalFloatResult').textContent = 'Bitte Max Cap und Min Cap eingeben!';
        return;
    }
    const resultFloat = (maxCap - minCap) * avgFloat + minCap;
    document.getElementById('finalFloatResult').textContent = `Endgültiger Float: ${resultFloat.toFixed(6)}`;
});
