const buttons = document.querySelectorAll(".play-button");

let currentAudio = null;
let currentButton = null;
let currentProgress = null;
let currentTimeText = null;
let currentDurationText = null;


// ---------------------------------------------
// Crear reproductor debajo del botón
// ---------------------------------------------

function createPlayer(button) {

    const card = button.closest(".sound-card");

    if (!card) return null;

    let player = card.querySelector(".audio-player");

    if (!player) {

        player = document.createElement("div");

        player.className = "audio-player";

        player.innerHTML = `
            <div class="progress-container">
                <div class="progress-bar"></div>
            </div>

            <div class="audio-times">
                <span class="current-time">0:00</span>
                <span class="duration">0:00</span>
            </div>
        `;

        button.insertAdjacentElement(
            "afterend",
            player
        );
    }

    return {
        player: player,
        progress: player.querySelector(".progress-bar"),
        currentTime: player.querySelector(".current-time"),
        duration: player.querySelector(".duration")
    };
}


// ---------------------------------------------
// Formatear tiempo
// ---------------------------------------------

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds
        .toString()
        .padStart(2, "0")}`;
}


// ---------------------------------------------
// Cambiar botón
// ---------------------------------------------

function setButton(button, icon, text) {

    button.innerHTML =
        `<span>${icon}</span> ${text}`;
}


// ---------------------------------------------
// Configurar botones
// ---------------------------------------------

buttons.forEach((button) => {

    const player = createPlayer(button);

    if (!player) return;


    // -----------------------------------------
    // Click en barra de progreso
    // -----------------------------------------

    player.player
        .querySelector(".progress-container")
        .addEventListener("click", (event) => {

            if (
                !currentAudio ||
                currentButton !== button
            ) {
                return;
            }

            const rect =
                event.currentTarget.getBoundingClientRect();

            const position =
                (event.clientX - rect.left) /
                rect.width;

            currentAudio.currentTime =
                position * currentAudio.duration;
        });


    // -----------------------------------------
    // Click en botón
    // -----------------------------------------

    button.addEventListener("click", async () => {

        const audioPath =
            button.dataset.audio;


        if (!audioPath) {

            console.error(
                "Este botón no tiene audio:",
                button
            );

            return;
        }


        // -------------------------------------
        // MISMO AUDIO
        // -------------------------------------

        if (
            currentAudio &&
            currentButton === button
        ) {

            if (!currentAudio.paused) {

                currentAudio.pause();

                setButton(
                    button,
                    "▶",
                    "Escuchar"
                );

            } else {

                try {

                    await currentAudio.play();

                    setButton(
                        button,
                        "❚❚",
                        "Pausar"
                    );

                } catch (error) {

                    console.error(error);
                }
            }

            return;
        }


        // -------------------------------------
        // DETENER AUDIO ANTERIOR
        // -------------------------------------

        if (currentAudio) {

            currentAudio.pause();

            currentAudio.currentTime = 0;

            if (currentButton) {

                setButton(
                    currentButton,
                    "▶",
                    "Escuchar"
                );
            }

            if (currentProgress) {
                currentProgress.style.width = "0%";
            }

            if (currentTimeText) {
                currentTimeText.textContent = "0:00";
            }
        }


        // -------------------------------------
        // Crear nuevo audio
        // -------------------------------------

        const audio =
            new Audio(audioPath);

        currentAudio = audio;
        currentButton = button;

        currentProgress =
            player.progress;

        currentTimeText =
            player.currentTime;

        currentDurationText =
            player.duration;


        // -------------------------------------
        // Cargar duración
        // -------------------------------------

        audio.addEventListener(
            "loadedmetadata",
            () => {

                currentDurationText.textContent =
                    formatTime(audio.duration);
            }
        );


        // -------------------------------------
        // Actualizar progreso
        // -------------------------------------

        audio.addEventListener(
            "timeupdate",
            () => {

                if (
                    !Number.isFinite(audio.duration)
                ) {
                    return;
                }

                const percentage =
                    (audio.currentTime /
                    audio.duration) * 100;

                player.progress.style.width =
                    `${percentage}%`;

                player.currentTime.textContent =
                    formatTime(
                        audio.currentTime
                    );
            }
        );


        // -------------------------------------
        // Cuando termina
        // -------------------------------------

        audio.addEventListener(
            "ended",
            () => {

                setButton(
                    button,
                    "▶",
                    "Escuchar"
                );

                player.progress.style.width =
                    "0%";

                player.currentTime.textContent =
                    "0:00";

                currentAudio = null;
                currentButton = null;
                currentProgress = null;
                currentTimeText = null;
                currentDurationText = null;
            }
        );


        // -------------------------------------
        // Error
        // -------------------------------------

        audio.addEventListener(
            "error",
            () => {

                console.error(
                    "No se pudo cargar:",
                    audioPath
                );

                setButton(
                    button,
                    "⚠",
                    "Error"
                );

                currentAudio = null;
                currentButton = null;
            }
        );


        // -------------------------------------
        // Reproducir
        // -------------------------------------

        try {

            await audio.play();

            setButton(
                button,
                "❚❚",
                "Pausar"
            );

        } catch (error) {

            console.error(
                "No se pudo reproducir:",
                audioPath,
                error
            );

            setButton(
                button,
                "⚠",
                "Error"
            );
        }

    });

});