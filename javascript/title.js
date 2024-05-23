const logo = document.getElementById('title');

logo.addEventListener('mouseover', () => {
    logo.classList.add("expand");
})

logo.addEventListener('mouseout', () => {
    logo.classList.remove("expand");
})