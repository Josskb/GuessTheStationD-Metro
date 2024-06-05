document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.getElementById('answer');

    async function loadStationData() {
        const response = await fetch("/json/metro_stations.json"); // Ajustez le chemin selon votre structure de dossiers
        const stations = await response.json();
        return stations;  // Retourner l'objet complet de chaque station
    }
    async function showSuggestions(value) {
        const stations = await loadStationData();
        const suggestions = stations.filter(station => station.Station.toLowerCase().startsWith(value.toLowerCase()));
        
        // Affichage des suggestions avec les images
        let suggestionsHTML = '';
        suggestions.forEach(station => {
            suggestionsHTML += `
        <div class="suggestion-item" onclick="selectStation('${station.Station.replace(/'/g, "\\'")}')" title="${station.Station}">
            <img src="${station.Image}" alt="${station.Station}" style="width:50px; vertical-align:middle;">
            <span>${station.Station}</span>
        </div>`;
        });
        document.getElementById('suggestions').innerHTML = suggestionsHTML;
    }
    
    inputField.addEventListener('input', () => {
        const inputValue = inputField.value;
        if (inputValue.length > 0) {
            showSuggestions(inputValue);
        } else {
            document.getElementById('suggestions').innerHTML = '';
        }
    });
});

// Fonction pour mettre à jour la valeur de l'entrée avec la station sélectionnée
function selectStation(stationName) {
    const inputField = document.getElementById('answer');
    inputField.value = stationName;  // Met à jour le champ de texte avec le nom de la station
    document.getElementById('suggestions').innerHTML = '';  // Efface les suggestions
}



// Assume the stations are loaded and stored in 'stations' variable


document.addEventListener('DOMContentLoaded', async function() {
    stations = await loadStationData(); // Load the data once when the document is ready
    selectRandomStation(); // Select a random station when the page loads
});

// Function to load station data (reusing earlier load function)
async function loadStationData() {
    const response = await fetch("/json/metro_stations.json"); // Adjust the path as needed
    const data = await response.json();
    return data;
}

let selectedStation = null; // Store the selected station
// Function to select a random station and display it
function selectRandomStation() {
    if (stations.length > 0) {
        const randomIndex = Math.floor(Math.random() * stations.length);
        selectedStation = stations[randomIndex]; // Stockez la station sélectionnée
        document.getElementById('random-station').textContent = selectedStation.Station;
        console.log(selectedStation.Station); 
    }
}

console.log(document.getElementById('submit'));
document.getElementById('submit').addEventListener('click', function() {
    const userAnswer = document.getElementById('answer').value;
    checkAnswer();
});

document.getElementById('answer').addEventListener('keydown', function(event) {
    const suggestions = document.querySelectorAll('.suggestion-item');
    const currentIndex = Array.from(suggestions).findIndex(item => item.classList.contains('highlight'));

    // Gérer la navigation par flèches et la sélection
    if (event.key === 'ArrowDown') {
        const nextIndex = currentIndex < suggestions.length - 1 ? currentIndex + 1 : 0;
        highlightSuggestion(suggestions, nextIndex);
        event.preventDefault();
    } else if (event.key === 'ArrowUp') {
        const nextIndex = currentIndex > 0 ? currentIndex - 1 : suggestions.length - 1;
        highlightSuggestion(suggestions, nextIndex);
        event.preventDefault();
    } else if (event.key === 'Enter') {
        if (currentIndex >= 0) {
            // Sélectionner la suggestion actuelle
            suggestions[currentIndex].click();
            event.preventDefault();
        } else {
            // Ici, l'utilisateur n'a pas navigué dans les suggestions mais appuie sur Entrée
            checkAnswer(); // Appel de la fonction qui gère la vérification
            event.preventDefault();
        }
    }
});

function checkAnswer() {
    const userAnswer = document.getElementById('answer').value;
    const userStation = stations.find(station => station.Station.toLowerCase() === userAnswer.toLowerCase());
    
    if (userStation) {
        compareStations(userStation, selectedStation);
    } else {
        alert("Station not found. Please try again.");
    }
}

function compareStations(userStation, randomStation) {
    const keys = ["Station", 'Ligne', 'Rang alpha-bétique', "Date d'ouverture", 'Situation', 'Commune', 'Fréquentation annuelle 2021[2]', 'Particularité(nom précédent)'];
    let resultsHTML = '';
    keys.forEach(key => {
        
        const userValue = userStation[key];
        const randomValue = randomStation[key];
        const match = userValue === randomValue;
        resultsHTML += 
        `<div style="background-color: ${match ? 'green' : 'red'}; margin: 2px; padding: 5px;">
            <strong>${key}:</strong> ${userValue} ${match ? '(Match)' : '(No Match)'}
        </div>`;
    });

    document.getElementById('comparison-results').innerHTML = resultsHTML;
}


function highlightSuggestion(suggestions, index) {
    // Supprimer les highlights existants
    suggestions.forEach(item => item.classList.remove('highlight'));
    // Ajouter un highlight à l'élément courant
    suggestions[index].classList.add('highlight');
}


