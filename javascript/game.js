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
            <div class="suggestion-item">
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

