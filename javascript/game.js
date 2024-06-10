document.addEventListener('DOMContentLoaded', function () {
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

document.addEventListener('DOMContentLoaded', async function () {
    stations = await loadStationData();
    selectRandomStation();
});

// Function to load station data (reusing earlier load function)
async function loadStationData() {
    const response = await fetch("/json/metro_stations.json"); 
    const data = await response.json();
    return data;
}

let selectedStation = null; 
function selectRandomStation() {
    if (stations.length > 0) {
        const randomIndex = Math.floor(Math.random() * stations.length);
        selectedStation = stations[randomIndex]; 
        document.getElementById('random-station').textContent = selectedStation.Station;
        console.log(selectedStation.Station);
    }
}

console.log(document.getElementById('submit'));
document.getElementById('submit').addEventListener('click', function () {
    const userAnswer = document.getElementById('answer').value;
    checkAnswer();
});

document.getElementById('answer').addEventListener('keydown', function (event) {
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
orange = '#FFA500';

function compareStations(userStation, randomStation) {
    const keys = ['Station', 'Ligne', 'Rang alpha-bétique', "Date d'ouverture", 'Situation', 'Commune', 'Fréquentation annuelle 2021[2]'];
    let resultsHTML = '<tr>';

    keys.forEach(key => {
        let userValue = userStation[key] || 'N/A';
        let randomValue = randomStation[key] || 'N/A';
        let color = red;
        let arrow = '';
        const basePath = "../img/";
        backgroundImg = '';

        if (key === 'Ligne') {
            userValue = formatLineToImage(userValue);
            randomValue = formatLineToImage(randomValue);
            const userLines = parseLines(userStation[key]);
            const randomLines = parseLines(randomStation[key]);
            const isMatch = userLines.some(line => randomLines.includes(line));
            color = isMatch ? 'orange' : red;  
        }

        if (key === 'Fréquentation annuelle 2021[2]') {
            let userFreq = parseInt(userValue.replace(/\D/g, ''), 10);
            let randomFreq = parseInt(randomValue.replace(/\D/g, ''), 10);

            userValue = isNaN(userFreq) ? 'N/A' : userFreq.toLocaleString();
            randomValue = isNaN(randomFreq) ? 'N/A' : randomFreq.toLocaleString();
            let comparisonResult = compareValues(userValue, randomValue, key);
            color = comparisonResult.color;
            arrow = comparisonResult.arrow;
            if (comparisonResult.arrow !== 'no_arrow') {
                backgroundImg = `background-image: url('${basePath}${comparisonResult.arrow}.png'); background-size: contain; background-repeat: no-repeat; background-position: center;`;
            }
        
        }
        if (key === "Date d'ouverture") {
            let comparisonResult = compareValues(userValue, randomValue, key);
            color = comparisonResult.color;
            arrow = comparisonResult.arrow;
            if (comparisonResult.arrow !== 'no_arrow') {
                backgroundImg = `background-image: url('${basePath}${comparisonResult.arrow}.png'); background-size: contain; background-repeat: no-repeat; background-position: center; `;
            }
        }

        if (key === "Rang alpha-bétique") {
            userValue = userValue.toLowerCase();
            randomValue = randomValue.toLowerCase();
            let comparisonResult = compareValues(userValue, randomValue, key);
            color = comparisonResult.color;
            arrow = comparisonResult.arrow;
            if (comparisonResult.arrow !== 'no_arrow') {
                backgroundImg = `background-image: url('${basePath}${comparisonResult.arrow}.png'); background-size: contain; background-repeat: no-repeat; background-position: center;`;
            }
        }
        if (key === 'Commune'){
            let userCommune = userValue.toLowerCase();
            let randomCommune = randomValue.toLowerCase();
            let comparisonResult = compareValues(userCommune, randomCommune, key);
            color = comparisonResult.color;
            arrow = comparisonResult.arrow;
            if (comparisonResult.arrow !== 'no_arrow') {
                backgroundImg = `background-image: url('${basePath}${comparisonResult.arrow}.png'); background-size: contain; background-repeat: no-repeat; background-position: center;`;
            }
        }
        else if (userValue === randomValue) {
            color = green;
        }
        resultsHTML += `<td style="background-color: ${color};${backgroundImg}">${userValue}</td>`;
    });

    resultsHTML += '</tr>';
    document.getElementById('table_result').innerHTML += resultsHTML;
}

function compareValues(userVal, randomVal, type) {
    let color = red;
    let arrow = 'no_arrow'; 
    console.log(userVal, randomVal, type)
    if (type === "Date d'ouverture") {
        const userDate = parseFrenchDate(userVal);
        const randomDate = parseFrenchDate(randomVal);
        console.log("date", userDate, randomDate);
        if (!isNaN(userDate) && !isNaN(randomDate)) {
            if (userDate > randomDate) {
                arrow = 'down_arrow';
            } else if (userDate < randomDate) {
                arrow = 'up_arrow';
            }
            else if (userDate === randomDate){
                color = green;
            }
    }
    } 
    if (type === 'Rang alpha-bétique') {
        const userNum = parseFloat(userVal);
        const randomNum = parseFloat(randomVal);
        if (userNum > randomNum) {
            arrow = 'up_arrow';
        }else if (userNum < randomNum) {
            arrow = 'down_arrow';
        }
        else if (userNum === randomNum){
            color = green;
        }
    }
    if (type === 'Fréquentation annuelle 2021[2]') {
        const userNum = parseFloat(userVal);
        const randomNum = parseFloat(randomVal);
        if (!isNaN(userNum) && !isNaN(randomNum)) {
            if (userNum > randomNum) {
                arrow = 'down_arrow';
            } else if (userNum < randomNum) {
                arrow = 'up_arrow';
            }
    }}
    if (type === 'Commune'){
        const userCity = userVal.match(/^\D+/); 
        const randomCity = randomVal.match(/^\D+/);
        if (userVal === randomVal) {
            color = green;
        } else if (userCity && randomCity && userCity[0] === randomCity[0]) {
            color = orange;
        }
        else color = red;
    }
    return { color, arrow };
}


function parseFrenchDate(dateStr) {
    const months = {
        'janvier': 'January', 'février': 'February', 'mars': 'March', 'avril': 'April',
        'mai': 'May', 'juin': 'June', 'juillet': 'July', 'août': 'August',
        'septembre': 'September', 'octobre': 'October', 'novembre': 'November', 'décembre': 'December'
    };
    const engDateStr = dateStr.replace(/(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre)/gi, 
                                       matched => months[matched.toLowerCase()]);

    return new Date(engDateStr).getTime();
}

function parseLines(linesString) {
    if (!linesString) return [];
    return linesString.match(/(\d+)(bis)?/gi) || []; 
}

function formatLineToImage(lineNumbers) {
    if (!lineNumbers) return 'N/A';
    const basePath = "../img/metrostation/";
    return lineNumbers.split(', ').map(lineNumber => {
        const line = lineNumber.match(/(\d+)(bis)?/i);
        const lineId = line ? line[1] + (line[2] ? line[2] : '') : ''; 
        return `<img src="${basePath}${lineId}.png" alt="Line ${lineId}" style="height: 20px;">`;
    }).join(' ');
}
console.log();

function highlightSuggestion(suggestions, index) {
    suggestions.forEach(item => item.classList.remove('highlight'));
    suggestions[index].classList.add('highlight');
}


