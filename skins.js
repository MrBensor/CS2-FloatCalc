// skins.js - Separate Skin-Logik
let skins = [];

// Funktion zum Laden der Skins
function fetchSkins(language) {
    const skinSuggestions = document.getElementById('skinSuggestions');
    skinSuggestions.innerHTML = `<div class="suggestion">${translations[currentLang].loadingSkinsText}</div>`;
    skinSuggestions.style.display = 'block';
    
    return fetch(`https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/${language}/skins.json`)
        .then(res => res.json())
        .then(data => {
            skins = data;
            skinSuggestions.innerHTML = '';
            skinSuggestions.style.display = 'none';
            return skins;
        })
        .catch(() => {
            skinSuggestions.innerHTML = `<div class="suggestion">${translations[currentLang].skinErrorText}</div>`;
            skinSuggestions.style.display = 'block';
            return [];
        });
}

// Skin-Suche und Autovervollständigung
function initSkinSearch() {
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
        
        // Split search term into words, all must be present in name, weapon or pattern
        const words = val.split(/\s+/).filter(Boolean);
        let matches = skins.filter(skin => {
            // Check name, weapon.name, pattern.name
            const fields = [skin.name, skin.weapon?.name, skin.pattern?.name].filter(Boolean).map(s => s.toLowerCase());
            return words.every(w => fields.some(f => f.includes(w)));
        })
        .sort((a, b) => a.name.localeCompare(b.name, 'en', {sensitivity: 'base'}))
        .slice(0, 500);
        
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
            floatSpan.textContent = `${translations[currentLang].floatRangeText} ${skin.min_float} - ${skin.max_float}`;
            
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
}

// Funktion zum Abrufen von Skin-Daten
function getSkinData(skinName) {
    return skins.find(skin => skin.name === skinName);
}

// Funktion zum Abrufen aller Waffen
function getAllWeapons() {
    const weapons = new Set();
    skins.forEach(skin => {
        if (skin.weapon && skin.weapon.name) {
            weapons.add(skin.weapon.name);
        }
    });
    return Array.from(weapons).sort();
}

// Funktion zum Filtern von Skins nach Waffe
function getSkinsByWeapon(weaponName) {
    return skins.filter(skin => skin.weapon && skin.weapon.name === weaponName);
}
