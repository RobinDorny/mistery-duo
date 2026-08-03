// ==========================================
// MYSTERY DUO ADMIN PLATFORM
// ==========================================


// ==========================================
// DATUM
// ==========================================

const todayElement =
    document.getElementById("today");

if (todayElement) {

    const date = new Date();

    todayElement.textContent =
        date.toLocaleDateString(
            "nl-BE",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );
}


// ==========================================
// SECTIES
// ==========================================

function openSection(section, button) {

    document
        .querySelectorAll(".admin-page-section")
        .forEach(element => {

            element.classList.add("hidden");

        });


    const selected =
        document.getElementById(
            section + "-section"
        );


    if (selected) {

        selected.classList.remove("hidden");

    }


    document
        .querySelectorAll(".sidebar-button")
        .forEach(element => {

            element.classList.remove("active");

        });


    if (button) {

        button.classList.add("active");

    }

}


// ==========================================
// SNELLE KNOPPEN
// ==========================================

function showLive() {

    const button =
        document.querySelectorAll(
            ".sidebar-button"
        )[1];

    openSection(
        "live",
        button
    );

}


function showVideos() {

    const button =
        document.querySelectorAll(
            ".sidebar-button"
        )[2];

    openSection(
        "videos",
        button
    );

}


function showEvents() {

    const button =
        document.querySelectorAll(
            ".sidebar-button"
        )[3];

    openSection(
        "events",
        button
    );

}


function showNews() {

    const button =
        document.querySelectorAll(
            ".sidebar-button"
        )[4];

    openSection(
        "news",
        button
    );

}


// ==========================================
// LIVESTREAM
// ==========================================

let liveActive = false;


function getYouTubeID(url) {

    if (!url) {
        return null;
    }


    // Normale YouTube URL

    const normal =
        url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/
        );


    if (normal) {

        return normal[1];

    }


    // YouTube embed URL

    const embed =
        url.match(
            /youtube\.com\/embed\/([^&?/]+)/
        );


    if (embed) {

        return embed[1];

    }


    return null;

}


function loadLive() {

    const url =
        document
            .getElementById("live-url")
            .value
            .trim();


    const videoID =
        getYouTubeID(url);


    const player =
        document.getElementById(
            "live-player"
        );


    const message =
        document.getElementById(
            "live-message"
        );


    if (!videoID) {

        message.textContent =
            "❌ Dit lijkt geen geldige YouTube-link.";

        message.className =
            "admin-message error";

        return;

    }


    player.innerHTML = `

        <iframe

            src="https://www.youtube.com/embed/${videoID}?autoplay=0"

            title="Mystery Duo Livestream"

            allow="
                autoplay;
                encrypted-media;
                picture-in-picture;
                fullscreen
            "

            allowfullscreen>

        </iframe>

    `;


    message.textContent =
        "✅ Livestream geladen in de preview.";

    message.className =
        "admin-message success";

}


function toggleLive() {

    liveActive =
        !liveActive;


    const badge =
        document.getElementById(
            "live-badge"
        );


    const dashboardStatus =
        document.getElementById(
            "dashboard-live-status"
        );


    const miniText =
        document.getElementById(
            "mini-live-text"
        );


    if (liveActive) {

        badge.textContent =
            "● LIVE";

        badge.classList.add("active");


        dashboardStatus.textContent =
            "LIVE";

        dashboardStatus.className =
            "status-pill live";


        miniText.textContent =
            "🔴 Mystery Duo is momenteel LIVE";


    } else {

        badge.textContent =
            "● OFFLINE";

        badge.classList.remove("active");


        dashboardStatus.textContent =
            "OFFLINE";

        dashboardStatus.className =
            "status-pill offline";


        miniText.textContent =
            "Geen livestream actief";

    }

}


// ==========================================
// VIDEO'S
// ==========================================

function uploadVideo() {

    const fileInput =
        document.getElementById(
            "video-file"
        );


    const title =
        document.getElementById(
            "video-title"
        ).value.trim();


    const status =
        document.getElementById(
            "video-status"
        );


    const info =
        document.getElementById(
            "video-info"
        );


    if (!fileInput.files.length) {

        status.textContent =
            "❌ Kies eerst een video.";

        status.className =
            "admin-message error";

        return;

    }


    if (!title) {

        status.textContent =
            "❌ Geef de video een titel.";

        status.className =
            "admin-message error";

        return;

    }


    const file =
        fileInput.files[0];


    const video =
        document.createElement(
            "video"
        );


    video.preload =
        "metadata";


    video.onloadedmetadata =
        function() {

            URL.revokeObjectURL(
                video.src
            );


            const duration =
                video.duration;


            info.textContent =
                "Duur: " +
                formatTime(duration);


            if (duration > 60) {

                status.textContent =
                    "❌ Video is langer dan 1 minuut.";

                status.className =
                    "admin-message error";

                return;

            }


            status.textContent =
                "✅ Video is geschikt!";

            status.className =
                "admin-message success";

        };


    video.src =
        URL.createObjectURL(
            file
        );

}


// ==========================================
// OPTREDENS
// ==========================================

function addEvent() {

    const title =
        document
            .getElementById(
                "event-title"
            )
            .value.trim();


    const location =
        document
            .getElementById(
                "event-location"
            )
            .value.trim();


    const date =
        document
            .getElementById(
                "event-date"
            )
            .value;


    const time =
        document
            .getElementById(
                "event-time"
            )
            .value;


    if (
        !title ||
        !location ||
        !date ||
        !time
    ) {

        alert(
            "Vul alle velden in."
        );

        return;

    }


    alert(
        "✅ Optreden ingevuld. De database-koppeling komt in de volgende stap."
    );

}


// ==========================================
// NIEUWS
// ==========================================

function addNews() {

    const title =
        document
            .getElementById(
                "news-title"
            )
            .value.trim();


    const text =
        document
            .getElementById(
                "news-text"
            )
            .value.trim();


    if (!title || !text) {

        alert(
            "Vul de titel en tekst in."
        );

        return;

    }


    alert(
        "✅ Nieuwsbericht klaar om te publiceren."
    );

}


// ==========================================
// FOTO'S
// ==========================================

function uploadPhoto() {

    const input =
        document.getElementById(
            "photo-file"
        );


    const status =
        document.getElementById(
            "photo-status"
        );


    if (!input.files.length) {

        status.textContent =
            "❌ Kies eerst een foto.";

        status.className =
            "admin-message error";

        return;

    }


    status.textContent =
        "✅ Foto geselecteerd.";

    status.className =
        "admin-message success";

}


// ==========================================
// MERCH
// ==========================================

function addProduct() {

    const name =
        document
            .getElementById(
                "product-name"
            )
            .value.trim();


    const price =
        document
            .getElementById(
                "product-price"
            )
            .value;


    if (!name || !price) {

        alert(
            "Vul de productnaam en prijs in."
        );

        return;

    }


    alert(
        "✅ Product klaar om toe te voegen."
    );

}


// ==========================================
// INSTELLINGEN
// ==========================================

function saveSettings() {

    const name =
        document
            .getElementById(
                "site-name"
            )
            .value.trim();


    if (!name) {

        alert(
            "Vul een naam in."
        );

        return;

    }


    localStorage.setItem(
        "mysteryDuoSiteName",
        name
    );


    alert(
        "✅ Instellingen opgeslagen."
    );

}


// ==========================================
// HULPFUNCTIES
// ==========================================

function formatTime(seconds) {

    const minutes =
        Math.floor(seconds / 60);


    const remaining =
        Math.floor(seconds % 60);


    return (
        minutes +
        ":" +
        remaining
            .toString()
            .padStart(2, "0")
    );

}
