document.addEventListener('DOMContentLoaded', function() {
    const inputField = document.getElementById('answer');

    async function loadStationData() {
        const response = await fetch("/json/metro_stations.json"); 
        const stations = await response.json();
        return stations;  
    }
    async function showSuggestions(value) {
        const stations = await loadStationData();
        const suggestions = stations.filter(station => station.Station.toLowerCase().startsWith(value.toLowerCase()));
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

function selectStation(stationName) {
    const inputField = document.getElementById('answer');
    inputField.value = stationName;  
    document.getElementById('suggestions').innerHTML = '';  
}

document.addEventListener('DOMContentLoaded', async function() {
    stations = await loadStationData(); 
    selectRandomStation(); 
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
            
            suggestions[currentIndex].click();
            event.preventDefault();
        } else {
            
            checkAnswer(); 
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

red = "#EA895F";
green = "#7ECA58";
blue = '#5F9BEA';

function compareStations(userStation, randomStation) {
    const keys = ['Station', 'Ligne', 'Rang alpha-bétique', "Date d'ouverture", 'Situation', 'Commune', 'Fréquentation annuelle 2021[2]'];
    let resultsHTML = '<tr>';

    keys.forEach(key => {
        let userValue = userStation[key] || 'N/A';
        let randomValue = randomStation[key] || 'N/A';
        let color = red;  // Default color for non-matching items

        // Special handling for Ligne to replace number with image
        if (key === 'Ligne') {
            userValue = formatLineToImage(userValue);
            randomValue = formatLineToImage(randomValue);
        }

        if (key === 'Fréquentation annuelle 2021[2]') {
            // Format both user and random frequencies to compare as integers
            let userFreq = parseInt(userValue.replace(/\D/g, ''), 10);
            let randomFreq = parseInt(randomValue.replace(/\D/g, ''), 10);

            // Convert back to nicely formatted strings for display
            userValue = isNaN(userFreq) ? 'N/A' : userFreq.toLocaleString();
            randomValue = isNaN(randomFreq) ? 'N/A' : randomFreq.toLocaleString();

            if (!isNaN(userFreq) && !isNaN(randomFreq)) {
                color = userFreq === randomFreq ? green : (userFreq > randomFreq ? 'orange' : blue);
            }
        } else if (userValue === randomValue) {
            color = green;  // Matching items are green
        }

        // Append each comparison result to the same row
        resultsHTML += `<td style="background-color: ${color};">${userValue}</td>`;
    });

    resultsHTML += '</tr>';
    document.getElementById('table_result').innerHTML += resultsHTML;
}

function formatLineToImage(lineNumbers) {
    // Assuming lineNumbers is a string like "(6), (14)"
    if (!lineNumbers) return 'N/A'; 
    const basePath = "../img/metrostation/";  // Path to your image folder
    return lineNumbers.split(', ').map(lineNumber => {
        // Extract the line number and handle 'bis' if present
        const line = lineNumber.match(/(\d+)(bis)?/i);
        const lineId = line ? line[1] + (line[2] ? line[2] : '') : ''; // Constructs '3bis' if 'bis' is present

        return `<img src="${basePath}${lineId}.png" alt="Line ${lineId}" style="height: 20px;">`;
    }).join(' ');
    
}
console.log();





function highlightSuggestion(suggestions, index) {
    // Supprimer les highlights existants
    suggestions.forEach(item => item.classList.remove('highlight'));
    // Ajouter un highlight à l'élément courant
    suggestions[index].classList.add('highlight');
}


