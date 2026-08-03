// ==========================================
// MYSTERY DUO - ADMIN PLATFORM
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    // Datum
    const today = document.getElementById("today");

    if (today) {
        today.textContent = new Date().toLocaleDateString("nl-BE", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    // Dashboard standaard tonen
    showSection("dashboard");

});


// ==========================================
// SECTIES
// ==========================================

function showSection(sectionName) {

    const sections = document.querySelectorAll(".admin-page-section");

    sections.forEach(section => {
        section.classList.add("hidden");
    });

    const selected = document.getElementById(
        sectionName + "-section"
    );

    if (selected) {
        selected.classList.remove("hidden");
    }

    // Sidebar actieve knop
    const buttons = document.querySelectorAll(".sidebar-button");

    buttons.forEach(button => {
        button.classList.remove("active");
    });

}


// Deze functie wordt gebruikt door de knoppen
function openSection(sectionName, button) {

    showSection(sectionName);

    if (button) {
        document.querySelectorAll(".sidebar-button")
            .forEach(btn => btn.classList.remove("active"));

        button.classList.add("active");
    }

}


// ==========================================
// SNELLE ACTIES
// ==========================================

function showLive() {

    const buttons = document.querySelectorAll(".sidebar-button");

    showSection("live");

    buttons.forEach(btn => btn.classList.remove("active"));

    if (buttons[1]) {
        buttons[1].classList.add("active");
    }

}


function showVideos() {

    const buttons = document.querySelectorAll(".sidebar-button");

    showSection("videos");

    buttons.forEach(btn => btn.classList.remove("active"));

    if (buttons[2]) {
        buttons[2].classList.add("active");
    }

}


function showEvents() {

    const buttons = document.querySelectorAll(".sidebar-button");

    showSection("events");

    buttons.forEach(btn => btn.classList.remove("active"));

    if (buttons[3]) {
        buttons[3].classList.add("active");
    }

}


function showNews() {

    const buttons = document.querySelectorAll(".sidebar-button");

    showSection("news");

    buttons.forEach(btn => btn.classList.remove("active"));

    if (buttons[4]) {
        buttons[4].classList.add("active");
    }

}


// ==========================================
// YOUTUBE LIVESTREAM
// ==========================================

let liveActive = false;


function getYouTubeID(url) {

    if (!url) {
        return null;
    }

    // youtube.com/watch?v=
    let match = url.match(
        /youtube\.com\/watch\?v=([^&]+)/i
    );

    if (match) {
        return match[1];
    }

    // youtu.be/
    match = url.match(
        /youtu\.be\/([^?&]+)/i
    );

    if (match) {
        return match[1];
    }

    // youtube.com/live/
    match = url.match(
        /youtube\.com\/live\/([^?&]+)/i
    );

    if (match) {
        return match[1];
    }

    // youtube.com/embed/
    match = url.match(
        /youtube\.com\/embed\/([^?&]+)/i
    );

    if (match) {
        return match[1];
    }

    return null;

}


function loadLive() {

    const urlElement =
        document.getElementById("live-url");

    const player =
        document.getElementById("live-player");

    const message =
        document.getElementById("live-message");


    if (!urlElement || !player) {
        return;
    }


    const url =
        urlElement.value.trim();


    const videoID =
        getYouTubeID(url);


    if (!videoID) {

        if (message) {

            message.textContent =
                "❌ Ongeldige YouTube-link.";

            message.className =
                "admin-message error";

        }

        return;
    }


    player.innerHTML = `
        <iframe
            src="https://www.youtube.com/embed/${videoID}"
            title="Mystery Duo livestream"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen>
        </iframe>
    `;


    if (message) {

        message.textContent =
            "✓ Livestream geladen.";

        message.className =
            "admin-message success";

    }

}


// ==========================================
// LIVE AAN / UIT
// ==========================================

function toggleLive() {

    liveActive = !liveActive;


    const badge =
        document.getElementById("live-badge");

    const dashboardStatus =
        document.getElementById(
            "dashboard-live-status"
        );

    const miniText =
        document.getElementById(
            "mini-live-text"
        );


    if (liveActive) {

        if (badge) {
            badge.textContent = "● LIVE";
            badge.classList.add("active");
        }

        if (dashboardStatus) {
            dashboardStatus.textContent = "LIVE";
            dashboardStatus.className =
                "status-pill live";
        }

        if (miniText) {
            miniText.textContent =
                "🔴 Mystery Duo is momenteel LIVE";
        }

    } else {

        if (badge) {
            badge.textContent = "● OFFLINE";
            badge.classList.remove("active");
        }

        if (dashboardStatus) {
            dashboardStatus.textContent = "OFFLINE";
            dashboardStatus.className =
                "status-pill offline";
        }

        if (miniText) {
            miniText.textContent =
                "Geen livestream actief";
        }

    }

}


// ==========================================
// VIDEO TOEVOEGEN
// ==========================================

function uploadVideo() {

    const fileInput =
        document.getElementById("video-file");

    const titleInput =
        document.getElementById("video-title");

    const status =
        document.getElementById("video-status");

    const info =
        document.getElementById("video-info");


    if (!fileInput || !fileInput.files.length) {

        showMessage(
            status,
            "❌ Kies eerst een video.",
            "error"
        );

        return;
    }


    if (!titleInput.value.trim()) {

        showMessage(
            status,
            "❌ Geef de video een titel.",
            "error"
        );

        return;
    }


    const file =
        fileInput.files[0];


    if (!file.type.startsWith("video/")) {

        showMessage(
            status,
            "❌ Dit is geen videobestand.",
            "error"
        );

        return;
    }


    const video =
        document.createElement("video");


    video.preload = "metadata";


    video.onloadedmetadata = () => {

        URL.revokeObjectURL(video.src);


        const duration =
            video.duration;


        if (info) {

            info.textContent =
                "Duur: " +
                formatTime(duration) +
                " • Grootte: " +
                formatFileSize(file.size);

        }


        if (duration > 60) {

            showMessage(
                status,
                "❌ De video mag maximaal 1 minuut zijn.",
                "error"
            );

            return;
        }


        showMessage(
            status,
            "✓ Video is geschikt en klaar voor upload.",
            "success"
        );

    };


    video.src =
        URL.createObjectURL(file);

}


// ==========================================
// OPTREDEN TOEVOEGEN
// ==========================================

function addEvent() {

    const title =
        getValue("event-title");

    const location =
        getValue("event-location");

    const date =
        getValue("event-date");

    const time =
        getValue("event-time");


    if (!title || !location || !date || !time) {

        alert(
            "Vul alle gegevens van het optreden in."
        );

        return;
    }


    alert(
        "✓ Optreden toegevoegd!"
    );

}


// ==========================================
// NIEUWS
// ==========================================

function addNews() {

    const title =
        getValue("news-title");

    const text =
        getValue("news-text");


    if (!title || !text) {

        alert(
            "Vul een titel en tekst in."
        );

        return;
    }


    alert(
        "✓ Nieuwsbericht gepubliceerd!"
    );

}


// ==========================================
// FOTO'S
// ==========================================

function uploadPhoto() {

    const input =
        document.getElementById("photo-file");

    const status =
        document.getElementById("photo-status");


    if (!input || !input.files.length) {

        showMessage(
            status,
            "❌ Kies eerst een foto.",
            "error"
        );

        return;
    }


    const file =
        input.files[0];


    if (!file.type.startsWith("image/")) {

        showMessage(
            status,
            "❌ Dit bestand is geen foto.",
            "error"
        );

        return;
    }


    showMessage(
        status,
        "✓ Foto geselecteerd en klaar voor upload.",
        "success"
    );

}


// ==========================================
// MERCHANDISE
// ==========================================

function addProduct() {

    const name =
        getValue("product-name");

    const price =
        getValue("product-price");

    const description =
        getValue("product-description");


    if (!name || !price || !description) {

        alert(
            "Vul alle productgegevens in."
        );

        return;
    }


    alert(
        "✓ Product toegevoegd!"
    );

}


// ==========================================
// INSTELLINGEN
// ==========================================

function saveSettings() {

    const name =
        getValue("site-name");


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
        "✓ Instellingen opgeslagen!"
    );

}


// ==========================================
// HULPFUNCTIES
// ==========================================

function getValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return element.value.trim();

}


function showMessage(element, text, type) {

    if (!element) {
        return;
    }

    element.textContent =
        text;

    element.className =
        "admin-message " + type;

}


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


function formatFileSize(bytes) {

    const mb =
        bytes / (1024 * 1024);

    return mb.toFixed(2) + " MB";

}
