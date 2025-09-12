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
function getWearRatingShort(floatVal) {
    if (floatVal < 0.07) return 'FN';
    if (floatVal < 0.15) return 'MW';
    if (floatVal < 0.38) return 'FT';
    if (floatVal < 0.45) return 'WW';
    if (floatVal <= 1.00) return 'BS';
    return '';
}
// Float-Inputs mit Wear-Label daneben generieren
for (let i = 1; i <= 10; i++) {
    const wrapper = document.createElement('div');
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '8px';
    const input = document.createElement('input');
    input.type = 'number';
    input.step = 'any';
    input.id = `float${i}`;
    input.placeholder = `Float ${i}`;
    input.style.flex = '1';
    const label = document.createElement('span');
    label.id = `wearLabel${i}`;
    label.style.minWidth = '38px';
    label.style.fontWeight = 'bold';
    label.style.color = '#43b581';
    input.addEventListener('input', function() {
        const val = parseFloat(input.value);
        label.textContent = !isNaN(val) ? '= ' + getWearRatingShort(val) : '';
    });
    wrapper.appendChild(input);
    wrapper.appendChild(label);
    floatInputsDiv.appendChild(wrapper);
}
// Initial anzeigen
for (let i = 1; i <= 10; i++) {
    document.getElementById(`wearLabel${i}`).textContent = '';
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


// --- Maximalen Avg Float Tab: Skin Search, Autocomplete, Auto-Cap ---
let skins = [];
fetch('skins.json')
    .then(res => res.json())
    .then(data => { skins = data; });

const skinSearch = document.getElementById('skinSearch');
const skinSuggestions = document.getElementById('skinSuggestions');
const maxCap2 = document.getElementById('maxCap2');
const minCap2 = document.getElementById('minCap2');

skinSearch.addEventListener('input', function() {
    const val = skinSearch.value.trim().toLowerCase();
    skinSuggestions.innerHTML = '';
    if (!val) {
        skinSuggestions.style.display = 'none';
        return;
    }
    const matches = skins.filter(s => s.name.toLowerCase().includes(val));
    if (matches.length === 0) {
        skinSuggestions.style.display = 'none';
        return;
    }
    matches.forEach(skin => {
        const div = document.createElement('div');
        div.className = 'suggestion';
        div.textContent = skin.name;
        div.addEventListener('click', function() {
            skinSearch.value = skin.name;
            maxCap2.value = skin.max;
            minCap2.value = skin.min;
            skinSuggestions.style.display = 'none';
        });
        skinSuggestions.appendChild(div);
    });
    skinSuggestions.style.display = 'block';
});

// Hide suggestions on blur
skinSearch.addEventListener('blur', function() {
    setTimeout(() => skinSuggestions.style.display = 'none', 150);
});

document.getElementById('calcMaxAvgBtn').addEventListener('click', function() {
    const targetFloat = parseFloat(document.getElementById('targetFloat').value);
    const maxCap2Val = parseFloat(maxCap2.value);
    const minCap2Val = parseFloat(minCap2.value);
    if (isNaN(targetFloat) || isNaN(maxCap2Val) || isNaN(minCap2Val)) {
        document.getElementById('maxAvgResult').textContent = 'Bitte Skin und Wear auswählen!';
        return;
    }
    let wearName = '';
    switch(targetFloat) {
        case 0.07: wearName = 'Factory New'; break;
        case 0.15: wearName = 'Minimal Wear'; break;
        case 0.38: wearName = 'Field-Tested'; break;
        case 0.45: wearName = 'Well-Worn'; break;
        case 1.00: wearName = 'Battle-Scarred'; break;
        default: wearName = '';
    }
    const maxAvg = (targetFloat - minCap2Val) / (maxCap2Val - minCap2Val);
    document.getElementById('maxAvgResult').textContent = `Maximaler Avg Float für ${wearName} (${targetFloat.toFixed(2)}): ${maxAvg.toFixed(6)}`;
});
