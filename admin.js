/* =========================================
   MYSTERY DUO ADMIN
========================================= */

document.addEventListener("DOMContentLoaded", function () {

    setupNavigation();
    setupDashboard();
    setupLive();
    setupVideos();
    setupEvents();
    setupNews();
    setupPhotos();
    setupMerchandise();
    setupSettings();

    loadEverything();

});


/* =========================================
   NAVIGATIE
========================================= */

function setupNavigation() {

    const buttons =
        document.querySelectorAll(".menu-btn");

    buttons.forEach(function (button) {

        button.addEventListener("click", function () {

            const page =
                button.dataset.page;

            openPage(page);

        });

    });


    const quickButtons =
        document.querySelectorAll("[data-goto]");

    quickButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            openPage(
                button.dataset.goto
            );

        });

    });

}


function openPage(pageName) {

    const pages =
        document.querySelectorAll(".page");

    pages.forEach(function (page) {

        page.classList.remove("active");

    });


    const selected =
        document.getElementById(pageName);

    if (selected) {

        selected.classList.add("active");

    }


    const menuButtons =
        document.querySelectorAll(".menu-btn");

    menuButtons.forEach(function (button) {

        button.classList.remove("active");

        if (button.dataset.page === pageName) {

            button.classList.add("active");

        }

    });

}


/* =========================================
   DATUM
========================================= */

function setupDashboard() {

    const today =
        document.getElementById("today");

    if (today) {

        today.textContent =
            new Date().toLocaleDateString(
                "nl-BE",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

    }

}


/* =========================================
   LIVESTREAM
========================================= */

let live = false;


function setupLive() {

    const loadButton =
        document.getElementById("loadLive");

    const toggleButton =
        document.getElementById("toggleLive");


    if (loadButton) {

        loadButton.addEventListener(
            "click",
            loadLivestream
        );

    }


    if (toggleButton) {

        toggleButton.addEventListener(
            "click",
            toggleLivestream
        );

    }

}


function getYoutubeId(url) {

    if (!url) return null;


    let match =
        url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/)([^&?/\s]+)/
        );


    if (match) {

        return match[1];

    }


    return null;

}


function loadLivestream() {

    const input =
        document.getElementById("youtubeUrl");

    const player =
        document.getElementById("player");

    const message =
        document.getElementById("liveMessage");


    const url =
        input.value.trim();


    const id =
        getYoutubeId(url);


    if (!id) {

        showMessage(
            message,
            "❌ Geen geldige YouTube-link.",
            "error"
        );

        return;

    }


    player.innerHTML = `

        <iframe
            src="https://www.youtube.com/embed/${id}"
            title="Mystery Duo Live"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen>
        </iframe>

    `;


    localStorage.setItem(
        "mysteryDuoLiveUrl",
        url
    );


    showMessage(
        message,
        "✓ Livestream geladen.",
        "success"
    );

}


function toggleLivestream() {

    live = !live;


    localStorage.setItem(
        "mysteryDuoLive",
        live
    );


    updateLiveStatus();

}


function updateLiveStatus() {

    const badge =
        document.getElementById("liveBadge");

    const dashboard =
        document.getElementById("dashboardLive");

    const dashboardText =
        document.getElementById(
            "dashboardLiveText"
        );


    if (live) {

        badge.textContent =
            "● LIVE";

        badge.className =
            "badge live";


        dashboard.textContent =
            "LIVE";

        dashboard.className =
            "badge live";


        dashboardText.textContent =
            "🔴 Mystery Duo is momenteel LIVE";

    } else {

        badge.textContent =
            "● OFFLINE";

        badge.className =
            "badge offline";


        dashboard.textContent =
            "OFFLINE";

        dashboard.className =
            "badge offline";


        dashboardText.textContent =
            "Geen livestream actief";

    }

}


/* =========================================
   VIDEO'S
========================================= */

function setupVideos() {

    const button =
        document.getElementById("checkVideo");

    const input =
        document.getElementById("videoFile");


    if (button) {

        button.addEventListener(
            "click",
            checkVideo
        );

    }


    if (input) {

        input.addEventListener(
            "change",
            previewVideo
        );

    }

}


function previewVideo() {

    const input =
        document.getElementById("videoFile");

    const preview =
        document.getElementById("videoPreview");


    if (!input.files.length) {

        preview.innerHTML = "";

        return;

    }


    const file =
        input.files[0];


    const url =
        URL.createObjectURL(file);


    preview.innerHTML = `

        <video
            src="${url}"
            controls>
        </video>

    `;

}


function checkVideo() {

    const input =
        document.getElementById("videoFile");

    const title =
        document.getElementById("videoTitle");

    const message =
        document.getElementById("videoMessage");


    if (!title.value.trim()) {

        showMessage(
            message,
            "❌ Geef de video een titel.",
            "error"
        );

        return;

    }


    if (!input.files.length) {

        showMessage(
            message,
            "❌ Selecteer eerst een video.",
            "error"
        );

        return;

    }


    const file =
        input.files[0];


    const video =
        document.createElement("video");


    video.preload = "metadata";


    video.onloadedmetadata = function () {

        const duration =
            video.duration;


        if (duration > 60) {

            showMessage(
                message,
                "❌ De video is langer dan 1 minuut.",
                "error"
            );

            return;

        }


        const videos =
            getData("videos");


        videos.push({

            title: title.value.trim(),

            fileName: file.name,

            duration: Math.round(duration),

            date: new Date().toLocaleDateString("nl-BE")

        });


        saveData(
            "videos",
            videos
        );


        showMessage(
            message,
            "✓ Video toegevoegd aan het beheer.",
            "success"
        );


        title.value = "";

        input.value = "";

        document.getElementById(
            "videoPreview"
        ).innerHTML = "";


        updateCounters();

    };


    video.src =
        URL.createObjectURL(file);

}


/* =========================================
   OPTREDENS
========================================= */

function setupEvents() {

    document
        .getElementById("addEvent")
        ?.addEventListener(
            "click",
            addEvent
        );

}


function addEvent() {

    const name =
        value("eventName");

    const location =
        value("eventLocation");

    const date =
        value("eventDate");

    const time =
        value("eventTime");


    if (!name || !location || !date || !time) {

        alert(
            "Vul alle gegevens in."
        );

        return;

    }


    const events =
        getData("events");


    events.push({

        name,
        location,
        date,
        time

    });


    saveData(
        "events",
        events
    );


    document.getElementById(
        "eventName"
    ).value = "";

    document.getElementById(
        "eventLocation"
    ).value = "";

    document.getElementById(
        "eventDate"
    ).value = "";

    document.getElementById(
        "eventTime"
    ).value = "";


    renderEvents();

    updateCounters();

}


function renderEvents() {

    const list =
        document.getElementById("eventList");

    const events =
        getData("events");


    list.innerHTML = "";


    events.forEach(function (event, index) {

        list.innerHTML += `

            <div class="saved-item">

                <div>

                    <strong>
                        ${escapeHTML(event.name)}
                    </strong>

                    <small>
                        📍 ${escapeHTML(event.location)}
                        · ${event.date}
                        · ${event.time}
                    </small>

                </div>

                <button
                    onclick="deleteItem('events', ${index})">
                    Verwijder
                </button>

            </div>

        `;

    });

}


/* =========================================
   NIEUWS
========================================= */

function setupNews() {

    document
        .getElementById("addNews")
        ?.addEventListener(
            "click",
            addNews
        );

}


function addNews() {

    const title =
        value("newsTitle");

    const text =
        value("newsText");


    if (!title || !text) {

        alert(
            "Vul de titel en tekst in."
        );

        return;

    }


    const news =
        getData("news");


    news.push({

        title,
        text,

        date:
            new Date().toLocaleDateString(
                "nl-BE"
            )

    });


    saveData(
        "news",
        news
    );


    document.getElementById(
        "newsTitle"
    ).value = "";

    document.getElementById(
        "newsText"
    ).value = "";


    renderNews();

    updateCounters();


    alert(
        "✓ Nieuwsbericht gepubliceerd."
    );

}


function renderNews() {

    const list =
        document.getElementById("newsList");

    const news =
        getData("news");


    list.innerHTML = "";


    news.forEach(function (item, index) {

        list.innerHTML += `

            <div class="saved-item">

                <div>

                    <strong>
                        ${escapeHTML(item.title)}
                    </strong>

                    <small>
                        ${escapeHTML(item.date)}
                    </small>

                </div>

                <button
                    onclick="deleteItem('news', ${index})">
                    Verwijder
                </button>

            </div>

        `;

    });

}


/* =========================================
   FOTO'S
========================================= */

function setupPhotos() {

    const input =
        document.getElementById("photoFile");

    const button =
        document.getElementById("addPhoto");


    input?.addEventListener(
        "change",
        previewPhoto
    );


    button?.addEventListener(
        "click",
        addPhoto
    );

}


function previewPhoto() {

    const input =
        document.getElementById("photoFile");

    const preview =
        document.getElementById("photoPreview");


    if (!input.files.length) {

        preview.innerHTML = "";

        return;

    }


    const url =
        URL.createObjectURL(
            input.files[0]
        );


    preview.innerHTML = `

        <img src="${url}" alt="Voorbeeld">

    `;

}


function addPhoto() {

    const input =
        document.getElementById("photoFile");

    const message =
        document.getElementById("photoMessage");


    if (!input.files.length) {

        showMessage(
            message,
            "❌ Selecteer eerst een foto.",
            "error"
        );

        return;

    }


    const photos =
        getData("photos");


    photos.push({

        name:
            input.files[0].name,

        date:
            new Date().toLocaleDateString(
                "nl-BE"
            )

    });


    saveData(
        "photos",
        photos
    );


    input.value = "";

    document.getElementById(
        "photoPreview"
    ).innerHTML = "";


    showMessage(
        message,
        "✓ Foto toegevoegd.",
        "success"
    );


    updateCounters();

}


/* =========================================
   MERCHANDISE
========================================= */

function setupMerchandise() {

    document
        .getElementById("addProduct")
        ?.addEventListener(
            "click",
            addProduct
        );

}


function addProduct() {

    const name =
        value("productName");

    const price =
        value("productPrice");

    const description =
        value("productDescription");


    if (!name || !price || !description) {

        alert(
            "Vul alle productgegevens in."
        );

        return;

    }


    const products =
        getData("products");


    products.push({

        name,
        price,
        description

    });


    saveData(
        "products",
        products
    );


    document.getElementById(
        "productName"
    ).value = "";

    document.getElementById(
        "productPrice"
    ).value = "";

    document.getElementById(
        "productDescription"
    ).value = "";


    renderProducts();

}


function renderProducts() {

    const list =
        document.getElementById(
            "productList"
        );

    const products =
        getData("products");


    list.innerHTML = "";


    products.forEach(function (product, index) {

        list.innerHTML += `

            <div class="saved-item">

                <div>

                    <strong>
                        ${escapeHTML(product.name)}
                    </strong>

                    <small>
                        € ${escapeHTML(product.price)}
                    </small>

                </div>

                <button
                    onclick="deleteItem('products', ${index})">
                    Verwijder
                </button>

            </div>

        `;

    });

}


/* =========================================
   INSTELLINGEN
========================================= */

function setupSettings() {

    document
        .getElementById("saveSettings")
        ?.addEventListener(
            "click",
            saveSettings
        );


    document
        .getElementById("logoFile")
        ?.addEventListener(
            "change",
            previewLogo
        );

}


function saveSettings() {

    const name =
        value("siteName");

    const message =
        document.getElementById(
            "settingsMessage"
        );


    if (!name) {

        showMessage(
            message,
            "❌ Vul een naam in.",
            "error"
        );

        return;

    }


    localStorage.setItem(
        "mysteryDuoName",
        name
    );


    showMessage(
        message,
        "✓ Instellingen opgeslagen.",
        "success"
    );

}


function previewLogo() {

    const input =
        document.getElementById("logoFile");

    const preview =
        document.getElementById("logoPreview");


    if (!input.files.length) {

        preview.innerHTML = "";

        return;

    }


    const url =
        URL.createObjectURL(
            input.files[0]
        );


    preview.innerHTML = `

        <img
            src="${url}"
            alt="Logo voorbeeld">

    `;

}


/* =========================================
   DATA
========================================= */

function getData(key) {

    try {

        return JSON.parse(
            localStorage.getItem(
                "mysteryDuo_" + key
            )
        ) || [];

    } catch {

        return [];

    }

}


function saveData(key, data) {

    localStorage.setItem(
        "mysteryDuo_" + key,
        JSON.stringify(data)
    );

}


function deleteItem(key, index) {

    const data =
        getData(key);


    data.splice(
        index,
        1
    );


    saveData(
        key,
        data
    );


    loadEverything();

}


/* =========================================
   ALLES LADEN
========================================= */

function loadEverything() {

    live =
        localStorage.getItem(
            "mysteryDuoLive"
        ) === "true";


    const liveUrl =
        localStorage.getItem(
            "mysteryDuoLiveUrl"
        );


    if (liveUrl) {

        document.getElementById(
            "youtubeUrl"
        ).value = liveUrl;

    }


    updateLiveStatus();

    renderEvents();

    renderNews();

    renderProducts();

    updateCounters();

}


/* =========================================
   TELLERS
========================================= */

function updateCounters() {

    document.getElementById(
        "videoCount"
    ).textContent =
        getData("videos").length;


    document.getElementById(
        "eventCount"
    ).textContent =
        getData("events").length;


    document.getElementById(
        "newsCount"
    ).textContent =
        getData("news").length;


    document.getElementById(
        "photoCount"
    ).textContent =
        getData("photos").length;

}


/* =========================================
   HULPFUNCTIES
========================================= */

function value(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


function showMessage(element, text, type) {

    if (!element) return;

    element.textContent = text;

    element.className =
        "message " + type;

}


function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;

}
