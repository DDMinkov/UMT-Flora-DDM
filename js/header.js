const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const overlay = document.querySelector('.nav-overlay');
const body = document.body;

function closeMenu() {
    navLinks.classList.remove('is-open');
    menuToggle.classList.remove('is-active');
    overlay.classList.remove('is-open');
    body.style.overflow = 'initial';
}

menuToggle.addEventListener('click', () => {
    navLinks.classList.toggle('is-open');
    menuToggle.classList.toggle('is-active');
    overlay.classList.toggle('is-open');

    if (navLinks.classList.contains('is-open')) {
        body.style.overflow = 'hidden';
    } else {
        body.style.overflow = 'initial';
    }
});

overlay.addEventListener('click', closeMenu);

document.querySelectorAll('.nav-links a, .logo').forEach(element => {
    element.addEventListener('click', closeMenu);
});
