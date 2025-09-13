// filter.js - Komplette Filterlogik
let filters = {
    rarity: [],
    collection: []
};

// Rarity-Reihenfolge von häufig zu selten
const rarityOrder = [
    'Consumer Grade',
    'Industrial Grade', 
    'Mil-Spec Grade',
    'Restricted',
    'Classified',
    'Covert',
    'Contraband',
    'Extraordinary'
];

// Filter-Optionen aktualisieren
function updateFilterOptions() {
    // Rarity-Filter extrahieren - NUR die für Trade-Ups relevanten (erste 6)
    const rarities = getAllRarities().filter(rarity => 
        rarityOrder.includes(rarity) && rarityOrder.indexOf(rarity) < 6
    );

    // Collection-Filter extrahieren
    const collections = getAllCollections();

    // Filter-UI aktualisieren
    updateRarityFilterOptions(rarities);
    updateCollectionFilterOptions(collections);
}

// Rarity-Filter-Optionen aktualisieren (sortiert nach Seltenheit)
function updateRarityFilterOptions(rarities) {
    const container = document.getElementById('rarityFilterOptions');
    container.innerHTML = '';

    // Sortiere Rarities nach der definierten Reihenfolge
    const sortedRarities = rarities.sort((a, b) => {
        return rarityOrder.indexOf(a) - rarityOrder.indexOf(b);
    });

    sortedRarities.forEach(rarity => {
        const div = document.createElement('div');
        div.className = 'filter-option';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `rarity-${rarity.replace(/\s+/g, '-')}`;
        checkbox.value = rarity;
        checkbox.checked = filters.rarity.includes(rarity);

        const label = document.createElement('label');
        label.htmlFor = `rarity-${rarity.replace(/\s+/g, '-')}`;
        label.textContent = rarity;

        // Rarity-Farbe aus den Skin-Daten verwenden
        const skinWithRarity = getSkinsByRarity(rarity)[0];
        if (skinWithRarity && skinWithRarity.rarity && skinWithRarity.rarity.color) {
            label.style.color = skinWithRarity.rarity.color;
        } else {
            // Fallback-Farbe falls keine Farbe in den Daten
            label.style.color = getRarityColor(rarity);
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
        checkbox.id = `collection-${collection.replace(/\s+/g, '-')}`;
        checkbox.value = collection;
        checkbox.checked = filters.collection.includes(collection);

        const label = document.createElement('label');
        label.htmlFor = `collection-${collection.replace(/\s+/g, '-')}`;
        label.textContent = collection;

        // Collection-Icon hinzufügen (falls verfügbar)
        const skinWithCollection = getSkinsByCollection(collection)[0];
        if (skinWithCollection) {
            const collectionData = skinWithCollection.collections.find(c => c.name === collection);
            if (collectionData && collectionData.image) {
                const img = document.createElement('img');
                img.src = collectionData.image;
                img.alt = collection;
                img.className = 'collection-icon';
                label.insertBefore(img, label.firstChild);
            }
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

// Hilfsfunktion: Skins nach Rarity filtern
function getSkinsByRarity(rarityName) {
    return skins.filter(skin => skin.rarity && skin.rarity.name === rarityName);
}

// Hilfsfunktion: Skins nach Collection filtern
function getSkinsByCollection(collectionName) {
    return skins.filter(skin => 
        skin.collections && skin.collections.some(c => c.name === collectionName)
    );
}

// Fallback Rarity-Farbe basierend auf Rarity-Name
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
            skin.collections && skin.collections.some(collection => 
                filters.collection.includes(collection.name)
            )
        );
    }

    // Text-Suche anwenden
    if (words.length > 0) {
        filteredSkins = filteredSkins.filter(skin => {
            const fields = [
                skin.name, 
                skin.weapon?.name, 
                skin.pattern?.name,
                ...(skin.collections ? skin.collections.map(c => c.name) : [])
            ].filter(Boolean).map(s => s.toLowerCase());

            return words.every(w => fields.some(f => f.includes(w)));
        });
    }

    // Ergebnisse anzeigen
    displaySkinSuggestions(filteredSkins);
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

// Skin-Suche und Autovervollständigung initialisieren
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
    document.getElementById('applyFilters').addEventListener('click', function() {
        applyFilters();
        closeFilterPopup();
    });
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
}
