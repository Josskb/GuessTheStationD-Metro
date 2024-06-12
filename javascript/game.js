const selectedStations = new Set();

document.addEventListener('DOMContentLoaded', function () {
    const inputField = document.getElementById('answer');
    

    async function loadStationData() {
        const response = await fetch("/json/metro_stations.json");
        const stations = await response.json();
        return stations;
    }
    
    async function showSuggestions(value) {
        const stations = await loadStationData();
        const suggestions = stations.filter(station =>
            station.Station.toLowerCase().startsWith(value.toLowerCase()) &&
            !selectedStations.has(station.Station.toLowerCase()));
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
    document.getElementById('answer').value = stationName;
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
    userAnswer.value = '';
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
    
    if (userStation && !selectedStations.has(userAnswer.toLowerCase())) {
        compareStations(userStation, selectedStation);
    } else if (userAnswer === '') {
        alert("Please enter a station name.");
    } else if (selectedStations.has(userAnswer.toLowerCase())) {
        alert("You have already guessed this station. Please try another one.");
    } else {
        alert("Station not found. Please try again.");
    }
    if (userStation === selectedStation) {
        win();
    }
    document.getElementById('answer').value = '';
    selectedStations.add(userAnswer.toLowerCase());
}

function win() {
    confetti({
        particleCount: 100, 
        spread: 70,         
        origin: { y: 0.6 }  
    });
    confetti({
        particleCount: 100, 
        spread: 100,         
        origin: { x : 0.4 }  
    });
    confetti({
        particleCount: 100, 
        spread: 70,         
        origin: { x : 0.7 }  
    });

    document.getElementById('submit').disabled = true;
    document.getElementById('answer').disabled = true;
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('game-over').innerHTML = `
    <h1>GG!</h1>
    <p>The Metro Station was:</p>
    <h2 id='found_station'>${selectedStation.Station} </h2>
    <img src="${selectedStation.Image}" alt="${selectedStation.Station}" style="width: 100px;">
    <p>with a number of <br>Attempts:</p>
    <div id="attemptCounter">${attemptCount}</div>
    
    <p>Would you like to play again?</p>
    <button id="play-again" onclick="window.location.reload()">Play Again</button>`;
}

function refreshPage() {
    window.location.reload()
}


document.querySelectorAll('#comparison-title th').forEach(element => {
    element.addEventListener('mouseenter', function() {
        const info = this.getAttribute('data-info');
        if (info) {
            const popover = document.createElement('div');
            popover.className = 'popover';
            popover.textContent = info; 
            document.body.appendChild(popover);
            const rect = this.getBoundingClientRect();
            popover.style.top = (rect.bottom + window.scrollY) + 'px';
            popover.style.left = rect.left + 'px';
            popover.classList.add('visible');
            this._popover = popover;
        }
    });

    element.addEventListener('mouseleave', function() {
        if (this._popover) {
            document.body.removeChild(this._popover);
            this._popover = null;
        }
    });
});


red = "#EA895F";
green = "#7ECA58";
blue = '#5F9BEA';
orange = '#FFA500';
let attemptCount = 0;

function compareStations(userStation, randomStation) {
    resetAnimations();
    const keys = ['Station', 'Ligne', 'Rang alpha-bétique', "Date d'ouverture", 'Situation', 'Commune', 'Fréquentation annuelle 2021[2]'];
    let resultsHTML = '<tr class="new-row-animation">';

    attemptCount++;
    const counterDiv = document.getElementById('attemptCounter');
    if (attemptCount > 0) {
        counterDiv.style.display = 'block'; 
        counterDiv.innerHTML = 'Attempts: <strong>' + attemptCount + '</strong>'; 
    }

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
                backgroundImg = `background-image: url('${basePath}${arrow}.png'); animation-delay: 0.1s;background-size: contain; background-repeat: no-repeat; background-position: center; style `;
            }
        }
        if (key === 'Situation') {
            let comparisonResult = compareValues(userValue, randomValue, key);
            color = comparisonResult.color;
        }
        else if (userValue === randomValue) {
            color = green;
        }
        if (arrow !== 'no_arrow') {
            resultsHTML += `<td style="background-color: ${color}; ${backgroundImg}">${userValue}</td>`;
        }
        else {
            resultsHTML += `<td style="background-color: ${color};">${userValue}</td>`;
        }
    });

    resultsHTML += '</tr>';
    document.getElementById('table_result').innerHTML += resultsHTML;
}

function compareValues(userVal, randomVal, type) {
    let color = red;
    let arrow = 'no_arrow'; 
    if (type === "Date d'ouverture") {
        const userDate = parseFrenchDate(userVal);
        const randomDate = parseFrenchDate(randomVal);
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

    if (type === 'Situation') {
        userVal = userVal.toLowerCase();
        randomVal = randomVal.toLowerCase();
        if (userVal === randomVal) {
            color = green;
        } else if (userVal.includes(randomVal)) {
            color = orange;
        }
        else{
            color = red;
        }
    }
    return { color, arrow };
}

function resetAnimations() {
    document.querySelectorAll('#table_result tr').forEach(row => {
        row.classList.remove('new-row-animation');
    });
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

function highlightSuggestion(suggestions, index) {
    suggestions.forEach(item => item.classList.remove('highlight'));
    suggestions[index].classList.add('highlight');
}


