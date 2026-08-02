// ============================================
// MYSTERY DUO ADMIN
// ============================================


// ============================================
// SECTIES OPENEN
// ============================================

function openSection(section, button) {

    // Alle secties verbergen
    document.querySelectorAll('.admin-section')
        .forEach(section => {

            section.classList.add('hidden');

        });


    // Dashboard verbergen
    const dashboard =
        document.querySelector(
            '.admin-section:not([id])'
        );

    if (dashboard) {
        dashboard.classList.add('hidden');
    }


    // Gekozen sectie tonen
    if (section === 'dashboard') {

        if (dashboard) {
            dashboard.classList.remove('hidden');
        }

    } else {

        const selectedSection =
            document.getElementById(
                section + '-section'
            );

        if (selectedSection) {
            selectedSection.classList.remove('hidden');
        }

    }


    // Actieve knop veranderen

    document.querySelectorAll('.admin-button')
        .forEach(btn => {

            btn.classList.remove('active');

        });


    if (button) {
        button.classList.add('active');
    }

}


// ============================================
// VIDEO CONTROLEREN
// ============================================

function uploadVideo() {

    const fileInput =
        document.getElementById('video-file');

    const titleInput =
        document.getElementById('video-title');

    const status =
        document.getElementById('video-status');

    const info =
        document.getElementById('video-info');


    if (!fileInput.files.length) {

        status.textContent =
            '❌ Kies eerst een video.';

        return;

    }


    const file =
        fileInput.files[0];


    if (!file.type.startsWith('video/')) {

        status.textContent =
            '❌ Dit bestand is geen video.';

        return;

    }


    const video =
        document.createElement('video');


    video.preload = 'metadata';


    video.onloadedmetadata = function() {

        const duration =
            video.duration;


        URL.revokeObjectURL(video.src);


        info.textContent =
            `Duur: ${formatTime(duration)} | Grootte: ${formatFileSize(file.size)}`;


        // MAXIMUM 60 SECONDEN

        if (duration > 60) {

            status.textContent =
                '❌ Deze video is langer dan 1 minuut.';

            status.className =
                'status error';

            return;

        }


        if (!titleInput.value.trim()) {

            status.textContent =
                '❌ Geef de video eerst een titel.';

            status.className =
                'status error';

            return;

        }


        status.textContent =
            '✅ Video is geschikt! De echte upload wordt gekoppeld aan Supabase.';

        status.className =
            'status success';

    };


    video.src =
        URL.createObjectURL(file);

}


// ============================================
// OPTREDEN TOEVOEGEN
// ============================================

function addEvent() {

    const title =
        document.getElementById(
            'event-title'
        ).value.trim();

    const location =
        document.getElementById(
            'event-location'
        ).value.trim();

    const date =
        document.getElementById(
            'event-date'
        ).value;

    const time =
        document.getElementById(
            'event-time'
        ).value;


    if (!title ||
        !location ||
        !date ||
        !time) {

        alert(
            'Vul alle velden in.'
        );

        return;

    }


    console.log({
        title,
        location,
        date,
        time
    });


    alert(
        'Het optreden is klaar om opgeslagen te worden. In de volgende stap koppelen we dit aan Supabase.'
    );

}


// ============================================
// NIEUWS TOEVOEGEN
// ============================================

function addNews() {

    const title =
        document.getElementById(
            'news-title'
        ).value.trim();

    const text =
        document.getElementById(
            'news-text'
        ).value.trim();


    if (!title || !text) {

        alert(
            'Vul een titel en bericht in.'
        );

        return;

    }


    console.log({
        title,
        text
    });


    alert(
        'Nieuwsbericht klaar! In de volgende stap koppelen we dit aan Supabase.'
    );

}


// ============================================
// FOTO UPLOAD
// ============================================

function uploadPhoto() {

    const fileInput =
        document.getElementById(
            'photo-file'
        );

    const status =
        document.getElementById(
            'photo-status'
        );


    if (!fileInput.files.length) {

        status.textContent =
            '❌ Kies eerst een foto.';

        return;

    }


    const file =
        fileInput.files[0];


    if (!file.type.startsWith('image/')) {

        status.textContent =
            '❌ Dit bestand is geen foto.';

        return;

    }


    status.textContent =
        '✅ Foto geselecteerd. De echte upload wordt gekoppeld aan Supabase.';

}


// ============================================
// MERCHANDISE
// ============================================

function addProduct() {

    const name =
        document.getElementById(
            'product-name'
        ).value.trim();

    const price =
        document.getElementById(
            'product-price'
        ).value;

    const description =
        document.getElementById(
            'product-description'
        ).value.trim();


    if (!name ||
        !price ||
        !description) {

        alert(
            'Vul alle velden in.'
        );

        return;

    }


    console.log({
        name,
        price,
        description
    });


    alert(
        'Product klaar om opgeslagen te worden.'
    );

}


// ============================================
// LIVE
// ============================================

let liveActive = false;


function toggleLive() {

    liveActive =
        !liveActive;


    const indicator =
        document.getElementById(
            'live-status-indicator'
        );


    if (liveActive) {

        indicator.textContent =
            '🔴 LIVE';

        indicator.className =
            'live';

    } else {

        indicator.textContent =
            '⚪ OFFLINE';

        indicator.className =
            'offline';

    }

}


// ============================================
// INSTELLINGEN
// ============================================

function saveSettings() {

    const name =
        document.getElementById(
            'site-name'
        ).value;


    if (!name.trim()) {

        alert(
            'Geef een naam op.'
        );

        return;

    }


    localStorage.setItem(
        'mysteryDuoSiteName',
        name
    );


    alert(
        'Instellingen opgeslagen.'
    );

}


// ============================================
// HULPFUNCTIES
// ============================================

function formatTime(seconds) {

    const minutes =
        Math.floor(seconds / 60);

    const remainingSeconds =
        Math.floor(seconds % 60);


    return (
        minutes +
        ':' +
        remainingSeconds
            .toString()
            .padStart(2, '0')
    );

}


function formatFileSize(bytes) {

    const megabytes =
        bytes / (1024 * 1024);


    return (
        megabytes.toFixed(2) +
        ' MB'
    );

}


// ============================================
// START
// ============================================

document.addEventListener(
    'DOMContentLoaded',
    function() {

        console.log(
            'Mystery Duo Admin geladen.'
        );

    }
);
