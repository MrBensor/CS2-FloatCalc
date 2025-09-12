// skins.js - Separate Skin-Logik mit Filter-Funktionen
let skins = [];
let filters = {
    rarity: [],
    collection: []
};

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
            updateFilterOptions();
            return skins;
        })
        .catch(() => {
            skinSuggestions.innerHTML = `<div class="suggestion">${translations[currentLang].skinErrorText}</div>`;
            skinSuggestions.style.display = 'block';
            return [];
        });
}

// Filter-Optionen aktualisieren
function updateFilterOptions() {
    // Rarity-Filter extrahieren
    const rarities = new Set();
    skins.forEach(skin => {
        if (skin.rarity) {
            rarities.add(skin.rarity.name);
        }
    });
    
    // Collection-Filter extrahieren
    const collections = new Set();
    skins.forEach(skin => {
        if (skin.collection) {
            collections.add(skin.collection.name);
        }
    });
    
    // Filter-UI aktualisieren
    updateRarityFilterOptions(Array.from(rarities));
    updateCollectionFilterOptions(Array.from(collections));
}

// Rarity-Filter-Optionen aktualisieren
function updateRarityFilterOptions(rarities) {
    const container = document.getElementById('rarityFilterOptions');
    container.innerHTML = '';
    
    rarities.sort().forEach(rarity => {
        const div = document.createElement('div');
        div.className = 'filter-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `rarity-${rarity}`;
        checkbox.value = rarity;
        checkbox.checked = filters.rarity.includes(rarity);
        
        const label = document.createElement('label');
        label.htmlFor = `rarity-${rarity}`;
        label.textContent = rarity;
        
        // Rarity-Farbe anwenden (basierend auf bekannten Rarity-Farben)
        const rarityColor = getRarityColor(rarity);
        if (rarityColor) {
            label.style.color = rarityColor;
        }
        
        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
        
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                filters.rarity.push(rarity);
            } else {
                filters.rarity = filters.rarity.filter(r => r !== rarity);
            }
            applyFilters();
        });
    });
}

// Collection-Filter-Optionen aktualisieren
function updateCollectionFilterOptions(collections) {
    const container = document.getElementById('collectionFilterOptions');
    container.innerHTML = '';
    
    collections.sort().forEach(collection => {
        const div = document.createElement('div');
        div.className = 'filter-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `collection-${collection}`;
        checkbox.value = collection;
        checkbox.checked = filters.collection.includes(collection);
        
        const label = document.createElement('label');
        label.htmlFor = `collection-${collection}`;
        label.textContent = collection;
        
        // Collection-Icon hinzufügen (falls verfügbar)
        const collectionSkin = skins.find(skin => skin.collection && skin.collection.name === collection);
        if (collectionSkin && collectionSkin.collection && collectionSkin.collection.image) {
            const img = document.createElement('img');
            img.src = collectionSkin.collection.image;
            img.alt = collection;
            img.className = 'collection-icon';
            label.insertBefore(img, label.firstChild);
        }
        
        div.appendChild(checkbox);
        div.appendChild(label);
        container.appendChild(div);
        
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                filters.collection.push(collection);
            } else {
                filters.collection = filters.collection.filter(c => c !== collection);
            }
            applyFilters();
        });
    });
}

// Rarity-Farbe basierend auf Rarity-Name
function getRarityColor(rarity) {
    const colorMap = {
        'Consumer Grade': '#b0c3d9',
        'Industrial Grade': '#5e98d9',
        'Mil-Spec Grade': '#4b69ff',
        'Restricted': '#8847ff',
        'Classified': '#d32ce6',
        'Covert': '#eb4b4b',
        'Contraband': '#ffae39',
        'Extraordinary': '#eb4b4b'
    };
    
    return colorMap[rarity] || '#ffffff';
}

// Filter anwenden
function applyFilters() {
    const searchValue = document.getElementById('skinSearch').value.trim().toLowerCase();
    const words = searchValue ? searchValue.split(/\s+/).filter(Boolean) : [];
    
    let filteredSkins = skins;
    
    // Rarity-Filter anwenden
    if (filters.rarity.length > 0) {
        filteredSkins = filteredSkins.filter(skin => 
            skin.rarity && filters.rarity.includes(skin.rarity.name)
        );
    }
    
    // Collection-Filter anwenden
    if (filters.collection.length > 0) {
        filteredSkins = filteredSkins.filter(skin => 
            skin.collection && filters.collection.includes(skin.collection.name)
        );
    }
    
    // Text-Suche anwenden
    if (words.length > 0) {
        filteredSkins = filteredSkins.filter(skin => {
            const fields = [skin.name, skin.weapon?.name, skin.pattern?.name].filter(Boolean).map(s => s.toLowerCase());
            return words.every(w => fields.some(f => f.includes(w)));
        });
    }
    
    // Ergebnisse anzeigen
    displaySkinSuggestions(filteredSkins);
}

// Skin-Vorschläge anzeigen
function displaySkinSuggestions(skinsToShow) {
    const skinSuggestions = document.getElementById('skinSuggestions');
    skinSuggestions.innerHTML = '';
    
    if (skinsToShow.length === 0) {
        skinSuggestions.style.display = 'none';
        return;
    }
    
    const limitedSkins = skinsToShow.slice(0, 500);
    
    limitedSkins.forEach(skin => {
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
        
        // Rarity mit Farbe anzeigen
        if (skin.rarity) {
            const raritySpan = document.createElement('span');
            raritySpan.className = 'skin-rarity';
            raritySpan.textContent = skin.rarity.name;
            raritySpan.style.color = getRarityColor(skin.rarity.name);
            info.appendChild(raritySpan);
        }
        
        const floatSpan = document.createElement('span');
        floatSpan.className = 'skin-float';
        floatSpan.textContent = `${translations[currentLang].floatRangeText} ${skin.min_float} - ${skin.max_float}`;
        
        info.appendChild(name);
        info.appendChild(floatSpan);
        div.appendChild(img);
        div.appendChild(info);
        
        div.addEventListener('click', function() {
            document.getElementById('skinSearch').value = skin.name;
            document.getElementById('maxCap2').value = skin.max_float;
            document.getElementById('minCap2').value = skin.min_float;
            
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
}

// Filter-Popup öffnen
function openFilterPopup() {
    document.getElementById('filterPopup').style.display = 'block';
}

// Filter-Popup schließen
function closeFilterPopup() {
    document.getElementById('filterPopup').style.display = 'none';
}

// Filter zurücksetzen
function resetFilters() {
    filters = {
        rarity: [],
        collection: []
    };
    
    // Checkboxes zurücksetzen
    document.querySelectorAll('#rarityFilterOptions input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    document.querySelectorAll('#collectionFilterOptions input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    applyFilters();
}

// Skin-Suche und Autovervollständigung
function initSkinSearch() {
    const skinSearch = document.getElementById('skinSearch');
    const skinSuggestions = document.getElementById('skinSuggestions');

    skinSearch.addEventListener('input', function() {
        applyFilters();
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
    
    // Filter-Button Event-Listener
    document.getElementById('filterButton').addEventListener('click', openFilterPopup);
    document.getElementById('closeFilterPopup').addEventListener('click', closeFilterPopup);
    document.getElementById('applyFilters').addEventListener('click', closeFilterPopup);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
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
