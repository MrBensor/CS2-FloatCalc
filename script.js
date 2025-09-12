// Tab logic
const tabFloat = document.getElementById('tabFloat');
const tabAvg = document.getElementById('tabAvg');
const tabContentFloat = document.getElementById('tabContentFloat');
const tabContentAvg = document.getElementById('tabContentAvg');
document.getElementById('tabFloat').addEventListener('click', function() {
    document.getElementById('tabContentFloat').style.display = '';
    document.getElementById('tabContentAvg').style.display = 'none';
    this.classList.add('active');
    document.getElementById('tabAvg').classList.remove('active');
});
document.getElementById('tabAvg').addEventListener('click', function() {
    document.getElementById('tabContentFloat').style.display = 'none';
    document.getElementById('tabContentAvg').style.display = '';
    this.classList.add('active');
    document.getElementById('tabFloat').classList.remove('active');
});

// Generate float input fields and show wear rating
const floatInputsDiv = document.getElementById('floatInputs');
function getWearRatingShort(floatVal) {
    if (floatVal < 0.07) return 'FN';
    if (floatVal < 0.15) return 'MW';
    if (floatVal < 0.38) return 'FT';
    if (floatVal < 0.45) return 'WW';
    if (floatVal <= 1.00) return 'BS';
    return '';
}
// Generate float inputs with wear label next to them
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
// Show initially
for (let i = 1; i <= 10; i++) {
    document.getElementById(`wearLabel${i}`).textContent = '';
}

// Calculate average
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
    document.getElementById('avgResult').textContent = `Average float: ${avgFloat.toFixed(6)}`;
    } else {
    document.getElementById('avgResult').textContent = 'Please enter all 10 floats!';
        avgFloat = null;
    }
});

document.getElementById('calcFloatBtn').addEventListener('click', function() {
    const maxCap = parseFloat(document.getElementById('maxCap').value);
    const minCap = parseFloat(document.getElementById('minCap').value);
    if (isNaN(maxCap) || isNaN(minCap)) {
    document.getElementById('finalFloatResult').textContent = 'Please enter Max Cap and Min Cap!';
        return;
    }
    if (avgFloat === null) {
    document.getElementById('finalFloatResult').textContent = 'Please calculate the average first!';
        return;
    }
    const resultFloat = (maxCap - minCap) * avgFloat + minCap;
    document.getElementById('finalFloatResult').textContent = `Final float: ${resultFloat.toFixed(6)} (${getWearRating(resultFloat)})`;
});

// Correct the comparison operators so that the upper limit is no longer inclusive
function getWearRating(floatVal) {
    if (floatVal >= 0 && floatVal < 0.07) return 'Factory New';
    if (floatVal >= 0.07 && floatVal < 0.15) return 'Minimal Wear';
    if (floatVal >= 0.15 && floatVal < 0.38) return 'Field-Tested';
    if (floatVal >= 0.38 && floatVal < 0.45) return 'Well-Worn';
    if (floatVal >= 0.45 && floatVal <= 1.00) return 'Battle-Scarred';
    return '';
}


// --- Max Avg Float Tab: Skin Search, Autocomplete, Auto-Cap ---


// --- Max Avg Float Tab: Skin Search, Autocomplete, Auto-Cap, Language ---
let skins = [];
let lang = 'en';
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

langSelect.addEventListener('change', function() {
    lang = langSelect.value;
    fetchSkins(lang);
    skinSearch.value = '';
    maxCap2.value = '';
    minCap2.value = '';
    skinSuggestions.innerHTML = '';
});

fetchSkins(lang);

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
    document.getElementById('maxAvgResult').textContent = 'Please select skin and wear!';
        return;
    }
    let wearName = '';
    // Compare exact values, do not round
    if (targetFloat === 0.0699999) wearName = 'Factory New';
    else if (targetFloat === 0.1499999) wearName = 'Minimal Wear';
    else if (targetFloat === 0.3799999) wearName = 'Field-Tested';
    else if (targetFloat === 0.4499999) wearName = 'Well-Worn';
    else if (targetFloat === 1.00) wearName = 'Battle-Scarred';
    const maxAvg = (targetFloat - minCap2Val) / (maxCap2Val - minCap2Val);
    document.getElementById('maxAvgResult').textContent = `Max Avg Float for ${wearName} (${targetFloat}): ${maxAvg}`;
});

// Sprache aus URL oder localStorage holen
function getLang() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('lang') || localStorage.getItem('lang') || 'en';
}

function setLang(lang) {
    localStorage.setItem('lang', lang);
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.location = url;
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

document.getElementById('langSelect').addEventListener('change', function() {
    setLang(this.value);
});

const lang = getLang();
applyTranslations(lang);

// Create float input fields
function createFloatInputs() {
    const floatInputs = document.getElementById('floatInputs');
    floatInputs.innerHTML = '';
    for (let i = 0; i < 10; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = 'any';
        input.id = 'float' + i;
        input.name = 'float' + i;
        input.placeholder = (i + 1) + '.';
        floatInputs.appendChild(input);
    }
}
createFloatInputs();
