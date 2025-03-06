// Add interactive elements
const sleep = ms => new Promise(r => setTimeout(r, ms));
blob.radius = 0;
document.querySelectorAll('.menu-option').forEach(option => {
    option.addEventListener('click', async function(e) {
        e.preventDefault(); // Prevent default action

        // Add click animation
        this.style.transform = 'scale(0.97)';
        setTimeout(() => {
            this.style.transform = 'scale(1)';
        }, 100);
        songManager.playSong('buttonClick');

        // Check if the clicked option is "PLAY"
        if (this.dataset.action === 'play') {
            // Show the overlay
            // document.querySelector('.overlay').style.display = 'block';

            for (let i = 0; i < 150; i++) {
                blob.radius += 30;
                await sleep(0.001)
            }

            songManager.fadeSong('menu', false, 0.2, () => {
                console.log("Music faded out")
                window.location.href = 'app?animation=true'
            })

            // After the animation, you can redirect or perform other actions
            // setTimeout(() => {
            //     window.location.href = 'app?animation=true'; // example redirection
            // }, 1000); // Match the animation duration
        }
    });
});

let backgroundThemePlaying = false;
document.addEventListener('click', function() {
    // document.querySelector(".overlay").style.display = 'none';
    console.log("clicked");
    if (!backgroundThemePlaying) {
        console.log("playing theme");
        songManager.playSong('menu');
        backgroundThemePlaying = true;
    }
});

songManager.playSong('menu');

async function loadAndInsert(url, targetId) {
    const response = await fetch(url);
    const text = await response.text();
    document.body.insertAdjacentHTML('beforeend', text); // Append to body
}

// loadAndInsert('/rules-panel.html', 'game-container');

document.addEventListener('DOMContentLoaded', function() {
    const rulesPanel = document.getElementById('rules-panel');
    const closeRules = document.getElementById('close-rules');
    const rulesOption = Array.from(document.querySelectorAll('.menu-option')).find(el => el.querySelector('h3').textContent === 'RULES');

    rulesOption.addEventListener('click', function(e) {
        e.preventDefault();
        rulesPanel.style.display = 'flex';
    });

    closeRules.addEventListener('click', function() {
        rulesPanel.style.display = 'none';
    });
});