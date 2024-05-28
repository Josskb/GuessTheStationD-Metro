const logo = document.getElementById('RATTP');

logo.addEventListener('mouseover', () => {
    logo.classList.add("expand");
})

logo.addEventListener('mouseout', () => {
    logo.classList.remove("expand");
})