document.addEventListener('DOMContentLoaded', function() {
    // Navigation active state
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Animation pour les cartes
    const cards = document.querySelectorAll('.card-preview');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
});

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function play() {
    for (let i = 0; i < 150; i++) {
        blob.radius += 30;
        await sleep(0.001)
    }
    window.location.href = 'app?animation=true'
}

async function playDemo() {
    for (let i = 0; i < 150; i++) {
        blob.radius += 30;
        await sleep(0.001)
    }
    window.location.href = 'demo?animation=true'
}