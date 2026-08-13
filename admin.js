import { db, auth } from "./firebase.js";

import {
    ref,
    onValue,
    push,
    set,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


const $ = (id) => document.getElementById(id);


/* =========================
   AUTHENTICATION
========================= */

onAuthStateChanged(auth, (user) => {

    if (user) {

        $("loginScreen").classList.add("hidden");
        $("adminApp").classList.remove("hidden");

        $("userEmail").textContent = user.email || "";

        loadEverything();

    } else {

        $("loginScreen").classList.remove("hidden");
        $("adminApp").classList.add("hidden");

    }

});


$("loginForm").addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = $("loginEmail").value.trim();
    const password = $("loginPassword").value;

    const message = $("loginMessage");

    message.textContent = "Inloggen...";
    message.style.color = "#aaa";

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );

        message.textContent = "";

    } catch (error) {

        console.error(error);

        message.style.color = "#ff6178";

        message.textContent =
            getAuthError(error);

    }

});


$("logoutButton").addEventListener("click", async () => {

    await signOut(auth);

});


function getAuthError(error) {

    if (error.code === "auth/invalid-credential") {
        return "E-mailadres of wachtwoord is incorrect.";
    }

    if (error.code === "auth/too-many-requests") {
        return "Te veel pogingen. Probeer later opnieuw.";
    }

    return "Inloggen mislukt. Controleer je gegevens.";

}


/* =========================
   NAVIGATION
========================= */

document.querySelectorAll(".nav-button").forEach(button => {

    button.addEventListener("click", () => {

        const target = button.dataset.section;

        document.querySelectorAll(".nav-button")
            .forEach(item => item.classList.remove("active"));

        button.classList.add("active");

        document.querySelectorAll(".admin-section")
            .forEach(section => section.classList.remove("active"));

        $(target).classList.add("active");

        const title =
            button.textContent.trim();

        $("pageTitle").textContent = title;

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });

});


/* =========================
   LOAD EVERYTHING
========================= */

function loadEverything() {

    loadSettings();
    loadShows();
    loadNews();
    loadVideos();
    loadPhotos();
    loadLive();
    loadMerchandise();
    loadBookings();

}


/* =========================
   SETTINGS
========================= */

function loadSettings() {

    onValue(ref(db, "settings"), (snapshot) => {

        const data = snapshot.val() || {};

        $("siteName").value =
            data.name || "Mistery Duo";

        $("siteLogo").value =
            data.logoUrl || "";

        $("siteHeroTitle").value =
            data.heroTitle || "MISTERY DUO";

        $("siteHeroText").value =
            data.heroText || "Twee stemmen. Eén passie. Muziek voor iedereen.";

        $("siteAboutText").value =
            data.aboutText || "";

        $("siteFooterText").value =
            data.footerText || "Muziek van toen en nu.";

        updateLogoPreview();

    });

}


$("siteLogo").addEventListener(
    "input",
    updateLogoPreview
);


function updateLogoPreview() {

    const url = $("siteLogo").value.trim();
    const image = $("logoPreview");

    if (url) {

        image.src = url;
        image.style.display = "block";

    } else {

        image.removeAttribute("src");
        image.style.display = "none";

    }

}


$("websiteForm").addEventListener("submit", async (event) => {

    event.preventDefault();

    const message = $("websiteMessage");

    try {

        await update(ref(db, "settings"), {

            name: $("siteName").value.trim(),

            logoUrl: $("siteLogo").value.trim(),

            heroTitle: $("siteHeroTitle").value.trim(),

            heroText: $("siteHeroText").value.trim(),

            aboutText: $("siteAboutText").value.trim(),

            footerText: $("siteFooterText").value.trim()

        });

        showMessage(
            message,
            "✓ Website-instellingen opgeslagen.",
            true
        );

    } catch (error) {

        console.error(error);

        showMessage(
            message,
            "Opslaan mislukt.",
            false
        );

    }

});


/* =========================
   SHOWS
========================= */

let showsCache = {};

function loadShows() {

    onValue(ref(db, "shows"), (snapshot) => {

        showsCache = snapshot.val() || {};

        const count =
            Object.keys(showsCache).length;

        $("statShows").textContent = count;

        renderAdminShows();

    });

}


$("showForm").addEventListener("submit", async (event) => {

    event.preventDefault();

    const id = $("showId").value;

    const data = {

        title: $("showTitle").value.trim(),

        date: $("showDate").value,

        time: $("showTime").value,

        location: $("showLocation").value.trim(),

        description: $("showDescription").value.trim(),

        ticketUrl: $("showTicket").value.trim(),

        published: $("showPublished").checked,

        updatedAt: Date.now()

    };


    try {

        if (id) {

            await update(
                ref(db, `shows/${id}`),
                data
            );

        } else {

            const newRef =
                push(ref(db, "shows"));

            await set(newRef, {
                ...data,
                createdAt: Date.now()
            });

        }

        clearShowForm();

        showMessage(
            $("showMessage"),
            "✓ Optreden opgeslagen.",
            true
        );

    } catch (error) {

        console.error(error);

        showMessage(
            $("showMessage"),
            "Opslaan mislukt.",
            false
        );

    }

});


function renderAdminShows() {

    const container = $("showsList");

    const entries = Object.entries(showsCache);

    if (!entries.length) {

        container.innerHTML =
            `<div class="empty-admin">Nog geen optredens.</div>`;

        return;
    }

    container.innerHTML = entries.map(([id, item]) => `

        <div class="admin-item">

            <div class="admin-item-info">

                <strong>
                    ${escapeHtml(item.title || "Optreden")}
                </strong>

                <span>
                    ${escapeHtml(item.date || "")}
                    ·
                    ${escapeHtml(item.location || "")}
                </span>

            </div>

            <div class="admin-item-actions">

                <button
                    class="small-button"
                    data-edit-show="${id}"
                >
                    Bewerken
                </button>

                <button
                    class="small-button delete"
                    data-delete-show="${id}"
                >
                    Verwijderen
                </button>

            </div>

        </div>

    `).join("");


    container.querySelectorAll("[data-edit-show]")
        .forEach(button => {

            button.addEventListener("click", () => {

                editShow(button.dataset.editShow);

            });

        });


    container.querySelectorAll("[data-delete-show]")
        .forEach(button => {

            button.addEventListener("click", () => {

                deleteShow(button.dataset.deleteShow);

            });

        });

}


function editShow(id) {

    const item = showsCache[id];

    if (!item) return;

    $("showId").value = id;

    $("showTitle").value = item.title || "";
    $("showDate").value = item.date || "";
    $("showTime").value = item.time || "";
    $("showLocation").value = item.location || "";
    $("showDescription").value = item.description || "";
    $("showTicket").value = item.ticketUrl || "";
    $("showPublished").checked =
        item.published !== false;

    $("cancelShowEdit").classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


$("cancelShowEdit").addEventListener(
    "click",
    clearShowForm
);


function clearShowForm() {

    $("showForm").reset();
    $("showId").value = "";
    $("showPublished").checked = true;

    $("cancelShowEdit").classList.add("hidden");

}


async function deleteShow(id) {

    if (!confirm("Dit optreden verwijderen?")) {
        return;
    }

    try {

        await remove(ref(db, `shows/${id}`));

    } catch (error) {

        console.error(error);
        alert("Verwijderen mislukt.");

    }

}


/* =========================
   NEWS
========================= */

let newsCache = {};

function loadNews() {

    onValue(ref(db, "news"), (snapshot) => {

        newsCache = snapshot.val() || {};

        $("statNews").textContent =
            Object.keys(newsCache).length;

        renderAdminNews();

    });

}


$("newsForm").addEventListener("submit", async (event) => {

    event.preventDefault();

    const id = $("newsId").value;

    const data = {

        title: $("newsTitle").value.trim(),

        date: $("newsDate").value,

        imageUrl: $("newsImage").value.trim(),

        text: $("newsText").value.trim(),

        published: $("newsPublished").checked,

        updatedAt: Date.now()

    };


    try {

        if (id) {

            await update(ref(db, `news/${id}`), data);

        } else {

            const newRef =
                push(ref(db, "news"));

            await set(newRef, {
                ...data,
                createdAt: Date.now()
            });

        }

        $("newsForm").reset();
        $("newsId").value = "";

        showMessage(
            $("newsMessage"),
            "✓ Nieuws opgeslagen.",
            true
        );

    } catch (error) {

        console.error(error);

        showMessage(
            $("newsMessage"),
            "Opslaan mislukt.",
            false
        );

    }

});


function renderAdminNews() {

    const container = $("newsList");

    const entries = Object.entries(newsCache);

    if (!entries.length) {

        container.innerHTML =
            `<div class="empty-admin">Nog geen nieuws.</div>`;

        return;
    }

    container.innerHTML = entries.map(([id, item]) => `

        <div class="admin-item">

            <div class="admin-item-info">

                <strong>
                    ${escapeHtml(item.title || "Nieuws")}
                </strong>

                <span>
                    ${escapeHtml(item.date || "")}
                </span>

            </div>

            <div class="admin-item-actions">

                <button
                    class="small-button"
                    data-edit-news="${id}"
                >
                    Bewerken
                </button>

                <button
                    class="small-button delete"
                    data-delete-news="${id}"
                >
                    Verwijderen
                </button>

            </div>

        </div>

    `).join("");


    container.querySelectorAll("[data-edit-news]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const item =
                    newsCache[button.dataset.editNews];

                $("newsId").value =
                    button.dataset.editNews;

                $("newsTitle").value =
                    item.title || "";

                $("newsDate").value =
                    item.date || "";

                $("newsImage").value =
                    item.imageUrl || "";

                $("newsText").value =
                    item.text || "";

                $("newsPublished").checked =
                    item.published !== false;

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            });

        });


    container.querySelectorAll("[data-delete-news]")
        .forEach(button => {

            button.addEventListener("click", async () => {

                if (!confirm("Nieuwsbericht verwijderen?")) {
                    return;
                }

                await remove(
                    ref(
                        db,
                        `news/${button.dataset.deleteNews}`
                    )
                );

            });

        });

}


/* =========================
   VIDEOS
========================= */

let videosCache = {};

function loadVideos() {

    onValue(ref(db, "videos"), (snapshot) => {

        videosCache = snapshot.val() || {};

        $("statVideos").textContent =
            Object.keys(videosCache).length;

        renderAdminVideos();

    });

}


$("videoForm").addEventListener("submit", async (event) => {

    event.preventDefault();

    const id = $("videoId").value;

    const data = {

        title: $("videoTitle").value.trim(),

        url: $("videoUrl").value.trim(),

        description:
            $("videoDescription").value.trim(),

        published:
            $("videoPublished").checked,

        updatedAt: Date.now()

    };


    try {

        if (id) {

            await update(
                ref(db, `videos/${id}`),
                data
            );

        } else {

            const newRef =
                push(ref(db, "videos"));

            await set(newRef, {
                ...data,
                createdAt: Date.now()
            });

        }

        $("videoForm").reset();
        $("videoId").value = "";

        showMessage(
            $("videoMessage"),
            "✓ Video opgeslagen.",
            true
        );

    } catch (error) {

        console.error(error);

        showMessage(
            $("videoMessage"),
            "Opslaan mislukt.",
            false
        );

    }

});


function renderAdminVideos() {

    const container = $("videosList");

    const entries = Object.entries(videosCache);

    if (!entries.length) {

        container.innerHTML =
            `<div class="empty-admin">Nog geen video's.</div>`;

        return;
    }

    container.innerHTML = entries.map(([id, item]) => `

        <div class="admin-item">

            <div class="admin-item-info">

                <strong>
                    ${escapeHtml(item.title || "Video")}
                </strong>

                <span>
                    ${escapeHtml(item.url || "")}
                </span>

            </div>

            <div class="admin-item-actions">

                <button
                    class="small-button"
                    data-edit-video="${id}"
                >
                    Bewerken
                </button>

                <button
                    class="small-button delete"
                    data-delete-video="${id}"
                >
                    Verwijderen
                </button>

            </div>

        </div>

    `).join("");


    container.querySelectorAll("[data-edit-video]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const id = button.dataset.editVideo;
                const item = videosCache[id];

                $("videoId").value = id;
                $("videoTitle").value = item.title || "";
                $("videoUrl").value = item.url || "";
                $("videoDescription").value =
                    item.description || "";
                $("videoPublished").checked =
                    item.published !== false;

            });

        });


    container.querySelectorAll("[data-delete-video]")
        .forEach(button => {

            button.addEventListener("click", async () => {

                if (!confirm("Video verwijderen?")) return;

                await remove(
                    ref(
                        db,
                        `videos/${button.dataset.deleteVideo}`
                    )
                );

            });

        });

}


/* =========================
   PHOTOS
========================= */

let photosCache = {};

function loadPhotos() {

    onValue(ref(db, "photos"), (snapshot) => {

        photosCache = snapshot.val() || {};

        renderAdminPhotos();

    });

}


$("photoForm").addEventListener("submit", async (event) => {

    event.preventDefault();

    const id = $("photoId").value;

    const data = {

        title: $("photoTitle").value.trim(),

        imageUrl: $("photoUrl").value.trim(),

        published:
            $("photoPublished").checked,

        updatedAt: Date.now()

    };


    try {

        if (id) {

            await update(
                ref(db, `photos/${id}`),
                data
            );

        } else {

            const newRef =
                push(ref(db, "photos"));

            await set(newRef, {
                ...data,
                createdAt: Date.now()
            });

        }

        $("photoForm").reset();
        $("photoId").value = "";

        showMessage(
            $("photoMessage"),
            "✓ Foto opgeslagen.",
            true
        );

    } catch (error) {

        console.error(error);

        showMessage(
            $("photoMessage"),
            "Opslaan mislukt.",
            false
        );

    }

});


function renderAdminPhotos() {

    const container = $("photosList");

    const entries = Object.entries(photosCache);

    if (!entries.length) {

        container.innerHTML =
            `<div class="empty-admin">Nog geen foto's.</div>`;

        return;
    }

    container.innerHTML = entries.map(([id, item]) => `

        <div class="admin-item">

            <div class="admin-item-info">

                <strong>
                    ${escapeHtml(item.title || "Foto")}
                </strong>

                <span>
                    ${escapeHtml(item.imageUrl || "")}
                </span>

            </div>

            <div class="admin-item-actions">

                <button
                    class="small-button"
                    data-edit-photo="${id}"
                >
                    Bewerken
                </button>

                <button
                    class="small-button delete"
                    data-delete-photo="${id}"
                >
                    Verwijderen
                </button>

            </div>

        </div>

    `).join("");


    container.querySelectorAll("[data-edit-photo]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const id = button.dataset.editPhoto;
                const item = photosCache[id];

                $("photoId").value = id;
                $("photoTitle").value = item.title || "";
                $("photoUrl").value =
                    item.imageUrl || "";
                $("photoPublished").checked =
                    item.published !== false;

            });

        });


    container.querySelectorAll("[data-delete-photo]")
        .forEach(button => {

            button.addEventListener("click", async () => {

                if (!confirm("Foto verwijderen?")) return;

                await remove(
                    ref(
                        db,
                        `photos/${button.dataset.deletePhoto}`
                    )
                );

            });

        });

}


/* =========================
   LIVESTREAM
========================= */

function loadLive() {

    onValue(ref(db, "livestream"), (snapshot) => {

        const data = snapshot.val() || {};

        $("liveActive").checked =
            data.active === true;

        $("liveUrl").value =
            data.url || "";

    });

}


$("liveForm").addEventListener("submit", async (event) => {

    event.preventDefault();

    try {

        await set(ref(db, "livestream"), {

            active:
                $("liveActive").checked,

            url:
                $("liveUrl").value.trim(),

            updatedAt:
                Date.now()

        });

        showMessage(
            $("liveMessage"),
            "✓ Livestream opgeslagen.",
            true
        );

    } catch (error) {

        console.error(error);

        showMessage(
            $("liveMessage"),
            "Opslaan mislukt.",
            false
        );

    }

});


/* =========================
   MERCHANDISE
========================= */

let merchCache = {};

function loadMerchandise() {

    onValue(ref(db, "merchandise"), (snapshot) => {

        merchCache = snapshot.val() || {};

        renderAdminMerch();

    });

}


$("merchForm").addEventListener("submit", async (event) => {

    event.preventDefault();

    const id = $("merchId").value;

    const data = {

        name: $("merchName").value.trim(),

        description:
            $("merchDescription").value.trim(),

        price:
            $("merchPrice").value.trim(),

        imageUrl:
            $("merchImage").value.trim(),

        orderUrl:
            $("merchOrderUrl").value.trim(),

        available:
            $("merchAvailable").checked,

        updatedAt:
            Date.now()

    };


    try {

        if (id) {

            await update(
                ref(db, `merchandise/${id}`),
                data
            );

        } else {

            const newRef =
                push(ref(db, "merchandise"));

            await set(newRef, {
                ...data,
                createdAt: Date.now()
            });

        }

        $("merchForm").reset();
        $("merchId").value = "";

        showMessage(
            $("merchMessage"),
            "✓ Product opgeslagen.",
            true
        );

    } catch (error) {

        console.error(error);

        showMessage(
            $("merchMessage"),
            "Opslaan mislukt.",
            false
        );

    }

});


function renderAdminMerch() {

    const container = $("merchList");

    const entries = Object.entries(merchCache);

    if (!entries.length) {

        container.innerHTML =
            `<div class="empty-admin">Nog geen producten.</div>`;

        return;
    }

    container.innerHTML = entries.map(([id, item]) => `

        <div class="admin-item">

            <div class="admin-item-info">

                <strong>
                    ${escapeHtml(item.name || "Product")}
                </strong>

                <span>
                    ${escapeHtml(item.price || "")}
                </span>

            </div>

            <div class="admin-item-actions">

                <button
                    class="small-button"
                    data-edit-merch="${id}"
                >
                    Bewerken
                </button>

                <button
                    class="small-button delete"
                    data-delete-merch="${id}"
                >
                    Verwijderen
                </button>

            </div>

        </div>

    `).join("");


    container.querySelectorAll("[data-edit-merch]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const id = button.dataset.editMerch;
                const item = merchCache[id];

                $("merchId").value = id;

                $("merchName").value =
                    item.name || "";

                $("merchDescription").value =
                    item.description || "";

                $("merchPrice").value =
                    item.price || "";

                $("merchImage").value =
                    item.imageUrl || "";

                $("merchOrderUrl").value =
                    item.orderUrl || "";

                $("merchAvailable").checked =
                    item.available !== false;

            });

        });


    container.querySelectorAll("[data-delete-merch]")
        .forEach(button => {

            button.addEventListener("click", async () => {

                if (!confirm("Product verwijderen?")) return;

                await remove(
                    ref(
                        db,
                        `merchandise/${button.dataset.deleteMerch}`
                    )
                );

            });

        });

}


/* =========================
   BOOKINGS
========================= */

function loadBookings() {

    onValue(ref(db, "bookings"), (snapshot) => {

        const data = snapshot.val() || {};

        const entries = Object.entries(data)
            .map(([id, value]) => ({
                id,
                ...value
            }))
            .sort((a, b) =>
                (b.createdAt || 0) -
                (a.createdAt || 0)
            );

        $("statBookings").textContent =
            entries.filter(item =>
                item.status === "nieuw"
            ).length;

        renderBookings(entries);

    });

}


function renderBookings(bookings) {

    const container = $("bookingsList");

    if (!bookings.length) {

        container.innerHTML =
            `<div class="empty-admin">Geen boekingen.</div>`;

        return;
    }

    container.innerHTML = bookings.map(item => `

        <article class="booking-card">

            <div class="booking-card-header">

                <div>

                    <h3>
                        ${escapeHtml(item.name || "Onbekend")}
                    </h3>

                    <div class="booking-meta">

                        ${escapeHtml(item.email || "")}
                        <br>

                        ${escapeHtml(item.phone || "")}
                        <br>

                        Datum:
                        ${escapeHtml(item.date || "")}
                        <br>

                        Locatie:
                        ${escapeHtml(item.location || "")}

                    </div>

                </div>

                <span class="booking-status">
                    ${escapeHtml(item.status || "nieuw")}
                </span>

            </div>


            ${
                item.message
                ? `
                    <div class="booking-message">
                        ${escapeHtml(item.message)}
                    </div>
                `
                : ""
            }


            <div class="admin-item-actions" style="margin-top:15px;">

                <button
                    class="small-button"
                    data-booking-status="${item.id}|beantwoord"
                >
                    Beantwoord
                </button>

                <button
                    class="small-button delete"
                    data-delete-booking="${item.id}"
                >
                    Verwijderen
                </button>

            </div>

        </article>

    `).join("");


    container.querySelectorAll("[data-booking-status]")
        .forEach(button => {

            button.addEventListener("click", async () => {

                const [id, status] =
                    button.dataset.bookingStatus.split("|");

                await update(
                    ref(db, `bookings/${id}`),
                    { status }
                );

            });

        });


    container.querySelectorAll("[data-delete-booking]")
        .forEach(button => {

            button.addEventListener("click", async () => {

                if (!confirm("Deze boeking verwijderen?")) {
                    return;
                }

                await remove(
                    ref(
                        db,
                        `bookings/${button.dataset.deleteBooking}`
                    )
                );

            });

        });

}


/* =========================
   HELPERS
========================= */

function showMessage(element, text, success) {

    element.textContent = text;

    element.style.color =
        success ? "#65dfa0" : "#ff6178";

    setTimeout(() => {

        element.textContent = "";

    }, 4000);

}


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}
