import { db } from "./firebase.js";

import {
    ref,
    onValue,
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


const $ = (id) => document.getElementById(id);

const defaultSettings = {
    name: "Mistery Duo",
    heroTitle: "MISTERY DUO",
    heroText: "Twee stemmen. Eén passie. Muziek voor iedereen.",
    aboutText: "Welkom bij Mistery Duo. Wij brengen muziek van toen en nu samen op één podium.",
    footerText: "Muziek van toen en nu.",
    logoUrl: ""
};


/* =========================
   LOADING
========================= */

window.addEventListener("load", () => {

    setTimeout(() => {

        const loading = $("loadingScreen");

        if (loading) {
            loading.style.opacity = "0";

            setTimeout(() => {
                loading.remove();
            }, 500);
        }

    }, 500);

});


/* =========================
   NAVIGATION
========================= */

const menuButton = $("menuButton");
const mainNav = $("mainNav");

if (menuButton) {

    menuButton.addEventListener("click", () => {
        mainNav.classList.toggle("open");
    });

}

document.querySelectorAll("#mainNav a").forEach(link => {

    link.addEventListener("click", () => {
        mainNav.classList.remove("open");
    });

});


/* =========================
   SETTINGS
========================= */

onValue(ref(db, "settings"), (snapshot) => {

    const data = snapshot.val() || defaultSettings;

    applySettings(data);

});


function applySettings(data) {

    $("brandText").textContent =
        data.name || "MISTERY DUO";

    $("heroText").textContent =
        data.heroText || defaultSettings.heroText;

    $("aboutText").textContent =
        data.aboutText || defaultSettings.aboutText;

    $("footerText").textContent =
        data.footerText || defaultSettings.footerText;


    if (data.heroTitle) {

        const words = String(data.heroTitle).split(" ");

        if (words.length >= 2) {

            $("heroTitle").innerHTML =
                `${escapeHtml(words[0])}<br><span>${escapeHtml(words.slice(1).join(" "))}</span>`;

        } else {

            $("heroTitle").textContent = data.heroTitle;

        }

    }


    setLogo($("headerLogo"), data.logoUrl);
    setLogo($("footerLogo"), data.logoUrl);

}


function setLogo(element, url) {

    if (!element) return;

    if (url) {

        element.src = url;
        element.style.display = "block";

    } else {

        element.removeAttribute("src");
        element.style.display = "none";

    }

}


/* =========================
   SHOWS
========================= */

onValue(ref(db, "shows"), (snapshot) => {

    const data = snapshot.val() || {};

    const shows = Object.entries(data)
        .map(([id, value]) => ({
            id,
            ...value
        }))
        .filter(item => item.published !== false)
        .sort((a, b) =>
            String(a.date || "").localeCompare(String(b.date || ""))
        );

    renderShows(shows);

});


function renderShows(shows) {

    const container = $("showsContainer");

    if (!shows.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nog geen optredens aangekondigd.
            </div>
        `;

        return;
    }

    container.innerHTML = shows.map(show => `

        <article class="show-card">

            <div class="show-date">
                ${escapeHtml(formatDate(show.date))}
            </div>

            <div class="show-info">

                <h3>
                    ${escapeHtml(show.title || "Optreden")}
                </h3>

                <p>
                    📍 ${escapeHtml(show.location || "Locatie wordt binnenkort bekendgemaakt")}
                    ${show.time ? ` · 🕐 ${escapeHtml(show.time)}` : ""}
                </p>

                ${show.description ? `
                    <p>${escapeHtml(show.description)}</p>
                ` : ""}

            </div>

            ${
                show.ticketUrl
                ? `
                    <a
                        class="button button-primary"
                        href="${safeUrl(show.ticketUrl)}"
                        target="_blank"
                        rel="noopener"
                    >
                        Tickets
                    </a>
                `
                : ""
            }

        </article>

    `).join("");

}


/* =========================
   LIVE
========================= */

onValue(ref(db, "livestream"), (snapshot) => {

    const live = snapshot.val();

    renderLive(live);

});


function renderLive(live) {

    const container = $("liveContainer");

    if (!live || live.active !== true || !live.url) {

        container.innerHTML = `
            <div class="live-offline">

                <div class="live-icon">●</div>

                <h3>Momenteel niet live</h3>

                <p>
                    Wanneer Mistery Duo live gaat,
                    verschijnt de livestream hier.
                </p>

            </div>
        `;

        return;
    }


    const embedUrl = convertToEmbed(live.url);

    if (!embedUrl) {

        container.innerHTML = `
            <div class="live-offline">

                <div class="live-icon">!</div>

                <h3>Livestream ingesteld</h3>

                <p>
                    De livestream-link is beschikbaar,
                    maar kan niet automatisch worden ingebed.
                </p>

                <br>

                <a
                    class="button button-primary"
                    href="${safeUrl(live.url)}"
                    target="_blank"
                    rel="noopener"
                >
                    Open livestream
                </a>

            </div>
        `;

        return;
    }


    container.innerHTML = `

        <div class="live-online">

            <div class="live-label">
                <span class="live-dot"></span>
                NU LIVE
            </div>

            <iframe
                class="live-frame"
                src="${escapeAttribute(embedUrl)}"
                title="Mistery Duo livestream"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowfullscreen>
            </iframe>

        </div>

    `;

}


/* =========================
   VIDEOS
========================= */

onValue(ref(db, "videos"), (snapshot) => {

    const data = snapshot.val() || {};

    const videos = Object.entries(data)
        .map(([id, value]) => ({
            id,
            ...value
        }))
        .filter(video => video.published !== false);

    renderVideos(videos);

});


function renderVideos(videos) {

    const container = $("videosContainer");

    if (!videos.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nog geen video's toegevoegd.
            </div>
        `;

        return;
    }

    container.innerHTML = videos.map(video => {

        const embed = convertToEmbed(video.url);

        if (!embed) return "";

        return `

            <article class="video-card">

                <iframe
                    class="video-frame"
                    src="${escapeAttribute(embed)}"
                    title="${escapeAttribute(video.title || "Mistery Duo video")}"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen>
                </iframe>

                <div class="video-info">

                    <h3>
                        ${escapeHtml(video.title || "Mistery Duo")}
                    </h3>

                    ${
                        video.description
                        ? `<p>${escapeHtml(video.description)}</p>`
                        : ""
                    }

                </div>

            </article>

        `;

    }).join("");

}


/* =========================
   NEWS
========================= */

onValue(ref(db, "news"), (snapshot) => {

    const data = snapshot.val() || {};

    const news = Object.entries(data)
        .map(([id, value]) => ({
            id,
            ...value
        }))
        .filter(item => item.published !== false)
        .sort((a, b) =>
            String(b.date || "").localeCompare(String(a.date || ""))
        );

    renderNews(news);

});


function renderNews(news) {

    const container = $("newsContainer");

    if (!news.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nog geen nieuwsberichten.
            </div>
        `;

        return;
    }

    container.innerHTML = news.map(item => `

        <article class="news-card">

            ${
                item.imageUrl
                ? `
                    <img
                        class="news-image"
                        src="${safeUrl(item.imageUrl)}"
                        alt=""
                        loading="lazy"
                    >
                `
                : ""
            }

            <div class="news-content">

                <span class="news-date">
                    ${escapeHtml(formatDate(item.date))}
                </span>

                <h3>
                    ${escapeHtml(item.title || "Nieuws")}
                </h3>

                <p>
                    ${escapeHtml(item.text || "")}
                </p>

            </div>

        </article>

    `).join("");

}


/* =========================
   PHOTOS
========================= */

onValue(ref(db, "photos"), (snapshot) => {

    const data = snapshot.val() || {};

    const photos = Object.entries(data)
        .map(([id, value]) => ({
            id,
            ...value
        }))
        .filter(item => item.published !== false);

    renderPhotos(photos);

});


function renderPhotos(photos) {

    const container = $("photosContainer");

    if (!photos.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nog geen foto's toegevoegd.
            </div>
        `;

        return;
    }

    container.innerHTML = photos.map(photo => `

        <div class="photo-card">

            <img
                src="${safeUrl(photo.imageUrl)}"
                alt="${escapeAttribute(photo.title || "Mistery Duo foto")}"
                loading="lazy"
            >

        </div>

    `).join("");

}


/* =========================
   MERCH
========================= */

onValue(ref(db, "merchandise"), (snapshot) => {

    const data = snapshot.val() || {};

    const products = Object.entries(data)
        .map(([id, value]) => ({
            id,
            ...value
        }))
        .filter(item => item.available !== false);

    renderMerch(products);

});


function renderMerch(products) {

    const container = $("merchContainer");

    if (!products.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nog geen merchandise beschikbaar.
            </div>
        `;

        return;
    }

    container.innerHTML = products.map(product => `

        <article class="merch-card">

            ${
                product.imageUrl
                ? `
                    <img
                        class="merch-image"
                        src="${safeUrl(product.imageUrl)}"
                        alt=""
                        loading="lazy"
                    >
                `
                : ""
            }

            <div class="merch-content">

                <h3>
                    ${escapeHtml(product.name || "Mistery Duo product")}
                </h3>

                ${
                    product.description
                    ? `
                        <p class="merch-description">
                            ${escapeHtml(product.description)}
                        </p>
                    `
                    : ""
                }

                <div class="merch-bottom">

                    <span class="price">
                        ${escapeHtml(product.price || "")}
                    </span>

                    ${
                        product.orderUrl
                        ? `
                            <a
                                class="button button-primary"
                                href="${safeUrl(product.orderUrl)}"
                                target="_blank"
                                rel="noopener"
                            >
                                Bestellen
                            </a>
                        `
                        : ""
                    }

                </div>

            </div>

        </article>

    `).join("");

}


/* =========================
   BOOKING
========================= */

$("bookingForm").addEventListener("submit", async (event) => {

    event.preventDefault();

    const status = $("bookingStatus");

    status.className = "";
    status.textContent = "Aanvraag wordt verstuurd...";


    const booking = {

        name: $("bookingName").value.trim(),

        email: $("bookingEmail").value.trim(),

        phone: $("bookingPhone").value.trim(),

        date: $("bookingDate").value,

        location: $("bookingLocation").value.trim(),

        message: $("bookingMessage").value.trim(),

        status: "nieuw",

        createdAt: Date.now()

    };


    try {

        const newBooking = push(ref(db, "bookings"));

        await set(newBooking, booking);

        status.className = "success";

        status.textContent =
            "✓ Je aanvraag is verstuurd! We nemen zo snel mogelijk contact op.";

        $("bookingForm").reset();

    } catch (error) {

        console.error(error);

        status.className = "error";

        status.textContent =
            "Er ging iets mis. Probeer het later opnieuw.";

    }

});


/* =========================
   HELPERS
========================= */

function formatDate(value) {

    if (!value) return "Datum volgt";

    const date = new Date(value + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("nl-BE", {
        day: "2-digit",
        month: "long",
        year: "numeric"
    }).format(date);

}


function convertToEmbed(url) {

    if (!url) return "";

    try {

        const parsed = new URL(url);

        if (parsed.hostname.includes("youtube.com")) {

            const videoId = parsed.searchParams.get("v");

            if (videoId) {
                return `https://www.youtube.com/embed/${videoId}`;
            }

            if (parsed.pathname.startsWith("/live/")) {
                return `https://www.youtube.com/embed/${parsed.pathname.split("/")[2]}`;
            }
        }


        if (parsed.hostname === "youtu.be") {

            const id = parsed.pathname.substring(1);

            if (id) {
                return `https://www.youtube.com/embed/${id}`;
            }

        }


        return url;

    } catch {

        return "";

    }

}


function safeUrl(url) {

    if (!url) return "";

    try {

        const parsed = new URL(url);

        if (
            parsed.protocol === "https:" ||
            parsed.protocol === "http:"
        ) {
            return parsed.href;
        }

    } catch {}

    return "#";

}


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function escapeAttribute(value) {
    return escapeHtml(value);
}


$("year").textContent = new Date().getFullYear();
