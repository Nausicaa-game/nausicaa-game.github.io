class SongManager {
    constructor() {
        this.audioElements = {}; // Store audio elements by name
        this.currentlyPlaying = []; // Array to store names of currently playing songs
    }

    loadSong(name, url, loop = false) {
        if (!this.audioElements[name]) {
            this.audioElements[name] = new Audio(url);
            this.audioElements[name].loop = loop; // Set loop property
            this.audioElements[name].addEventListener('ended', () => {
                this.stopSong(name); // Stop the song that ended
                this.currentlyPlaying = this.currentlyPlaying.filter(song => song !== name); // Remove from currently playing
            });
        }
    }

    playSong(name, reset = false) {
        console.log("Playing song: " + name);
        if (this.audioElements[name]) {
            this.audioElements[name].play();
            if (reset) {
                this.audioElements[name].currentTime = 0;
            }
            if (!this.currentlyPlaying.includes(name)) {
                this.currentlyPlaying.push(name);
            }
        } else {
            console.warn(`Song "${name}" not loaded. Call loadSong() first.`);
        }
    }

    pauseSong(name) {
        if (this.audioElements[name]) {
            this.audioElements[name].pause();
        }
    }

    stopSong(name) {
        if (this.audioElements[name]) {
            this.audioElements[name].pause();
            this.audioElements[name].currentTime = 0;
            this.currentlyPlaying = this.currentlyPlaying.filter(song => song !== name);
        }
    }

    stopAllSongs() {
        this.currentlyPlaying.forEach(songName => {
            if (this.audioElements[songName]) {
                this.audioElements[songName].pause();
                this.audioElements[songName].currentTime = 0;
            }
        });
        this.currentlyPlaying = [];
    }

    setVolume(name, volume) {
        if (this.audioElements[name]) {
            this.audioElements[name].volume = volume; // Volume between 0 and 1
        } else {
            console.warn(`Song "${name}" not loaded.  Call loadSong() first.`);
        }
    }

    // Optional:  Implement playlist functionality
    playPlaylist(playlist) {
        //  Implement logic to play songs in the given playlist array
    }

    transitionSong(fromName, toName, reset = false) {
        const fadeDuration = 1; // Duration of the fade in seconds
        const steps = 50; // Number of volume steps
        let currentStep = 0;
        const fromSong = this.audioElements[fromName];
        const toSong = this.audioElements[toName];

        if (!fromSong || !toSong) {
            console.warn(`One or both songs not loaded.  Call loadSong() first.`);
            return;
        }

        // Gradually fade out the first song
        const fadeOutInterval = setInterval(() => {
            currentStep++;
            const volume = Math.max(0, 1 - (currentStep / steps));
            fromSong.volume = volume;

            if (currentStep >= steps) {
                clearInterval(fadeOutInterval);
                this.stopSong(fromName);
                fromSong.volume = 1; // Reset volume for future use

                // Start playing the second song with fade-in
                toSong.volume = 0;
                this.playSong(toName, reset);
                currentStep = 0;

                const fadeInInterval = setInterval(() => {
                    currentStep++;
                    const volume = Math.min(1, currentStep / steps);
                    toSong.volume = volume;

                    if (currentStep >= steps) {
                        clearInterval(fadeInInterval);
                        toSong.volume = 1; // Ensure volume is 1 at the end
                    }
                }, fadeDuration * 1000 / steps); // Calculate interval for smooth fade
            }
        }, fadeDuration * 1000 / steps); // Calculate interval for smooth fade
    }

    fadeSong(name, fadeIn = true, duration = 1, callback = null) {
        const song = this.audioElements[name];
        if (!song) {
            console.warn(`Song "${name}" not loaded.`);
            return;
        }

        const steps = 50;
        let currentStep = 0;
        const initialVolume = fadeIn ? 0 : 1;
        const targetVolume = fadeIn ? 1 : 0;
        song.volume = initialVolume;

        if (fadeIn) {
            this.playSong(name); // Start playing if fading in
        }

        const fadeInterval = setInterval(() => {
            currentStep++;
            const volume = fadeIn ? Math.min(1, currentStep / steps) : Math.max(0, 1 - currentStep / steps);
            song.volume = volume;

            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                song.volume = targetVolume; // Ensure the final volume is set

                if (!fadeIn) {
                    this.stopSong(name); // Stop the song if fading out
                }

                if (callback) {
                    callback(); // Execute the callback function
                }
            }
        }, duration * 1000 / steps);
    }
}

let songManager = new SongManager();
songManager.loadSong('menu', '/assets/songs/menu.mp3', true);
songManager.loadSong('menu_next', '/assets/songs/menu_next.mp3', true);
songManager.loadSong('buttonClick', '/assets/songs/button_click.mp3');
songManager.loadSong('firstOracle', '/assets/songs/first-player-oracle.mp3');
songManager.loadSong('secondOracle', '/assets/songs/second-player-oracle.mp3');
songManager.loadSong('pop', '/assets/songs/pop.mp3');
songManager.loadSong('clic', '/assets/songs/clic.mp3');
songManager.loadSong('attack', '/assets/songs/attack.mp3');
songManager.loadSong('oraclePut', '/assets/songs/oracle_put.mp3');
songManager.loadSong('firstRound', '/assets/songs/first_round.mp3', true);
songManager.loadSong('announcer:allPick', '/assets/songs/all_pick.mp3');
songManager.loadSong('announcer:battleBegins', '/assets/songs/battle_begins.mp3');
songManager.loadSong('placed', '/assets/songs/placed.mp3');
songManager.loadSong('victory', '/assets/songs/victory.mp3');
songManager.loadSong('defeat', '/assets/songs/defeat.mp3');
songManager.loadSong('yourTurn', '/assets/songs/your_turn.mp3');
songManager.loadSong('notification', '/assets/songs/notification.mp3');