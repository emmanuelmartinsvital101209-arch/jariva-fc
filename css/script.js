// ===============================
// MENU MOBILE
// ===============================

const menuButton = document.getElementById("menuButton");
const nav = document.querySelector(".nav");

menuButton.addEventListener("click", () => {

    nav.classList.toggle("mobile-open");

});


// ===============================
// ANIMAÇÃO AO ENTRAR NA TELA
// ===============================

const elements = document.querySelectorAll(
    ".stat-box, .scorer-row, .sponsor-card, .match-card"
);


const observer = new IntersectionObserver((entries) => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {
    threshold: 0.1
});


elements.forEach(element => {

    element.classList.add("hidden");

    observer.observe(element);

});
