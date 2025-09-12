// --- TAB LOGIC ---
const tabFloat = document.getElementById('tabFloat');
const tabAvg = document.getElementById('tabAvg');
const tabContentFloat = document.getElementById('tabContentFloat');
const tabContentAvg = document.getElementById('tabContentAvg');

tabFloat.addEventListener('click', () => {
    tabContentFloat.style.display = '';
    tabContentAvg.style.display = 'none';
    tabFloat.classList.add('active');
    tabAvg.classList.remove('active');
});

tabAvg.addEventListener('click', () => {
    tabContentFloat.style.display = 'none';
    tabContentAvg.style.display = '';
    tabAvg.classList.add('active');
    tabFloat.classList.remove('active');
});

// --- FLOAT INPUTS & WEAR LABELS ---
const floatInputsDiv = document.getElementById('floatInputs');

// Nutze Übersetzungen aus lang.js
function getWearRatingShort(floatVal) {
    const wear = translations[langSelect.value].wearShort;
    if (floatVal < 0.07) return wear[0];
    if (floatVal < 0.15) return wear[1];
    if (floatVal < 0.38) return wear[2];
    if (floatVal < 0.45) return wear[3];
    if (floatVal <= 1.0) return wear[4];
    return '';
}

function getWearRating(floatVal) {
    const wear = translations[langSelect.value].wearFull;
    if (floatVal >= 0 && floatVal < 0.07) return wear[0];
    if (floatVal >= 0.07 && floatVal < 0.15) return wear[1];
    if (floatVal >= 0.15 && floatVal < 0.38) return wear[2];
    if (floatVal >= 0.38 && floatVal < 0.45) return wear[3];
    if (floatVal >= 0.45 && floatVal <= 1.0) return wear[4];
    return '';
}

// Generate float inputs with labels
function createFloatInputs() {
    floatInputsDiv.innerHTML = '';
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

        input.addEventListener('input', () => {
            const val = parseFloat(input.value);
            label.textContent = !isNaN(val) ? '= ' + getWearRatingShort(val) : '';
        });

        wrapper.appendChild(input);
        wrapper.appendChild(label);
        floatInputsDiv.appendChild(wrapper);
    }
}
createFloatInputs();

// --- CALCULATE AVERAGE ---
let avgFloat = null;
document.getElementById('calcAvgBtn').addEventListener('click', () => {
    let sum = 0, count = 0;
    for (let i = 1; i <= 10; i++) {
        const val = parseFloat(document.getElementById(`float${i}`).value);
        if (!isNaN(val)) { sum += val; count++; }
    }
    if (count === 10) {
        avgFloat = sum / 10;
        const currentLang = document.getElementById('langSelect').value;
        const avgText = currentLang === 'de' ? 'Durchschnittlicher Float:' : 'Average float:';
        document.getElementById('avgResult').textContent = `${avgText} ${avgFloat.toFixed(6)}`;
    } else {
        avgFloat = null;
        const currentLang = document.getElementById('langSelect').value;
        const errorText = currentLang === 'de' ? 'Bitte alle 10 Floats eingeben!' : 'Please enter all 10 floats!';
        document.getElementById('avgResult').textContent = errorText;
    }
});

// --- MAX/MIN CAP CALCULATION ---
document.getElementById('calcFloatBtn').addEventListener('click', () => {
    const maxCap = parseFloat(document.getElementById('maxCap').value);
    const minCap = parseFloat(document.getElementById('minCap').value);
    if (isNaN(maxCap) || isNaN(minCap)) {
        const currentLang = document.getElementById('langSelect').value;
        const errorText = currentLang === 'de' ? 'Bitte Max Cap und Min Cap eingeben!' : 'Please enter Max Cap and Min Cap!';
        document.getElementById('finalFloatResult').textContent = errorText;
        return;
    }
    if (avgFloat === null) {
        const currentLang = document.getElementById('langSelect').value;
        const errorText = currentLang === 'de' ? 'Bitte zuerst den Durchschnitt berechnen!' : 'Please calculate the average first!';
        document.getElementById('finalFloatResult').textContent = errorText;
        return;
    }
    const resultFloat = (maxCap - minCap) * avgFloat + minCap;
    const currentLang = document.getElementById('langSelect').value;
    const finalText = currentLang === 'de' ? 'Finaler Float:' : 'Final float:';
    document.getElementById('finalFloatResult').textContent = `${finalText} ${resultFloat.toFixed(6)} (${getWearRating(resultFloat)})`;
});

// --- SKIN SEARCH / AUTOCOMPLETE / LANGUAGE ---
let skins = [];
const skinSearch = document.getElementById('skinSearch');
const skinSuggestions = document.getElementById('skinSuggestions');
const maxCap2 = document.getElementById('maxCap2');
const minCap2 = document.getElementById('minCap2');
const langSelect = document.getElementById('langSelect');

function fetchSkins(language) {
    skinSuggestions.innerHTML = '<div class="suggestion">Loading skins...</div>';
    skinSuggestions.style.display = 'block';
    fetch(`https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/${language}/skins.json`)
        .then(res => res.json())
        .then(data => {
            skins = data;
            skinSuggestions.innerHTML = '';
            skinSuggestions.style.display = 'none';
        })
        .catch(() => {
            skinSuggestions.innerHTML = '<div class="suggestion">Error loading skins</div>';
            skinSuggestions.style.display = 'block';
        });
}

// Fix: language change updates both skins AND wear ratings
langSelect.addEventListener('change', () => {
    const lang = langSelect.value;
    fetchSkins(lang);
    
    // Update all UI text based on selected language
    applyTranslations(lang);
    
    // Update all current floats to show correct =FN / etc. in new language
    for (let i = 1; i <= 10; i++) {
        const val = parseFloat(document.getElementById(`float${i}`).value);
        document.getElementById(`wearLabel${i}`).textContent = !isNaN(val) ? '= ' + getWearRatingShort(val) : '';
    }
    
    // Update result texts if they exist
    if (document.getElementById('avgResult').textContent) {
        document.getElementById('calcAvgBtn').click();
    }
    if (document.getElementById('finalFloatResult').textContent) {
        document.getElementById('calcFloatBtn').click();
    }
});

fetchSkins(langSelect.value);

skinSearch.addEventListener('input', function() {
    const val = skinSearch.value.trim().toLowerCase();
    skinSuggestions.innerHTML = '';
    if (!val) {
        skinSuggestions.style.display = 'none';
        return;
    }
    // Split search term into words, all must be present in name, weapon or pattern
    const words = val.split(/\s+/).filter(Boolean);
        let matches = skins.filter(skin => {
            // Check name, weapon.name, pattern.name
            const fields = [skin.name, skin.weapon?.name, skin.pattern?.name].filter(Boolean).map(s => s.toLowerCase());
            return words.every(w => fields.some(f => f.includes(w)));
        })
    .sort((a, b) => a.name.localeCompare(b.name, 'en', {sensitivity: 'base'}))
    .slice(0, 500); // Always sort alphabetically and limit to 500
    if (matches.length === 0) {
        skinSuggestions.style.display = 'none';
        return;
    }
    matches.forEach(skin => {
        const div = document.createElement('div');
        div.className = 'suggestion';
    // Image, name, float caps
        const img = document.createElement('img');
        img.src = skin.image;
        img.alt = skin.name;
        img.className = 'skin-img';
        const info = document.createElement('div');
        info.className = 'skin-info';
        const name = document.createElement('span');
        name.className = 'skin-name';
        name.textContent = skin.name;
        const floatSpan = document.createElement('span');
        floatSpan.className = 'skin-float';
        floatSpan.textContent = `Float: ${skin.min_float} - ${skin.max_float}`;
        info.appendChild(name);
        info.appendChild(floatSpan);
        div.appendChild(img);
        div.appendChild(info);
        div.addEventListener('click', function() {
            skinSearch.value = skin.name;
            maxCap2.value = skin.max_float;
            minCap2.value = skin.min_float;
            // Show image left of search field
            const selectedImg = document.getElementById('selectedSkinImg');
            selectedImg.src = skin.image;
            selectedImg.alt = skin.name;
            selectedImg.style.display = 'block';
            skinSuggestions.style.display = 'none';
        });
        skinSuggestions.appendChild(div);
    });
    skinSuggestions.style.display = 'block';
});

skinSearch.addEventListener('focus', function() {
    if (skinSuggestions.innerHTML) skinSuggestions.style.display = 'block';
});
// Reset image if search field is cleared
skinSearch.addEventListener('input', function() {
    if (!skinSearch.value.trim()) {
        const selectedImg = document.getElementById('selectedSkinImg');
        selectedImg.src = '';
        selectedImg.alt = '';
        selectedImg.style.display = 'none';
    }
});
skinSearch.addEventListener('blur', function() {
    setTimeout(() => skinSuggestions.style.display = 'none', 150);
});

document.getElementById('calcMaxAvgBtn').addEventListener('click', function() {
    const targetFloat = parseFloat(document.getElementById('targetFloat').value);
    const maxCap2Val = parseFloat(maxCap2.value);
    const minCap2Val = parseFloat(minCap2.value);
    if (isNaN(targetFloat) || isNaN(maxCap2Val) || isNaN(minCap2Val)) {
        const currentLang = document.getElementById('langSelect').value;
        const errorText = currentLang === 'de' ? 'Bitte Skin und Abnutzung auswählen!' : 'Please select skin and wear!';
        document.getElementById('maxAvgResult').textContent = errorText;
        return;
    }
    let wearName = '';
    // Compare exact values, do not round
    if (targetFloat === 0.0699999) wearName = translations[langSelect.value].wearFull[0];
    else if (targetFloat === 0.1499999) wearName = translations[langSelect.value].wearFull[1];
    else if (targetFloat === 0.3799999) wearName = translations[langSelect.value].wearFull[2];
    else if (targetFloat === 0.4499999) wearName = translations[langSelect.value].wearFull[3];
    else if (targetFloat === 1.00) wearName = translations[langSelect.value].wearFull[4];
    
    const maxAvg = (targetFloat - minCap2Val) / (maxCap2Val - minCap2Val);
    const currentLang = document.getElementById('langSelect').value;
    const resultText = currentLang === 'de' ? 'Max. Durchschnitt für' : 'Max Avg Float for';
    document.getElementById('maxAvgResult').textContent = `${resultText} ${wearName} (${targetFloat}): ${maxAvg.toFixed(6)}`;
});

// Sprache aus URL oder localStorage holen
function getLang() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('lang') || 'de';
}

function setLang(lang) {
    localStorage.setItem('lang', lang);
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
}

function applyTranslations(lang) {
    const t = translations[lang] || translations['en'];
    document.title = t.titleTag;
    document.getElementById('titleTag').textContent = t.titleTag;
    document.getElementById('mainTitle').textContent = t.mainTitle;
    document.getElementById('langLabel').textContent = t.langLabel;
    document.getElementById('tabFloat').textContent = t.tabFloat;
    document.getElementById('tabAvg').textContent = t.tabAvg;
    document.getElementById('floatStep1').textContent = t.floatStep1;
    document.getElementById('calcAvgBtn').textContent = t.calcAvgBtn;
    document.getElementById('floatStep2').textContent = t.floatStep2;
    document.getElementById('maxCapLabel').textContent = t.maxCapLabel;
    document.getElementById('minCapLabel').textContent = t.minCapLabel;
    document.getElementById('calcFloatBtn').textContent = t.calcFloatBtn;
    document.getElementById('avgStep2').textContent = t.avgStep2;
    document.getElementById('skinSearchLabel').textContent = t.skinSearchLabel;
    document.getElementById('skinSearch').placeholder = t.skinSearchPlaceholder;
    document.getElementById('targetFloatLabel').textContent = t.targetFloatLabel;
    document.getElementById('optFactoryNew').textContent = t.optFactoryNew;
    document.getElementById('optMinimalWear').textContent = t.optMinimalWear;
    document.getElementById('optFieldTested').textContent = t.optFieldTested;
    document.getElementById('optWellWorn').textContent = t.optWellWorn;
    document.getElementById('optBattleScarred').textContent = t.optBattleScarred;
    document.getElementById('maxCap2Label').textContent = t.maxCap2Label;
    document.getElementById('minCap2Label').textContent = t.minCap2Label;
    document.getElementById('calcMaxAvgBtn').textContent = t.calcMaxAvgBtn;
    document.getElementById('langSelect').value = lang;
}

// Initialize with German language
const lang = getLang();
applyTranslations(lang);
