import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getDatabase,
    ref,
    onValue,
    push,
    set
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";


/* =========================================================
   FIREBASE
========================================================= */

const firebaseConfig = {
    apiKey: "AIzaSyDf15-6xqLR32Hq4xXeW5hvfUTqPzi52Vs",
    authDomain: "mistery-duo.firebaseapp.com",
    databaseURL: "https://mistery-duo-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mistery-duo",
    storageBucket: "mistery-duo.firebasestorage.app",
    messagingSenderId: "36695107825",
    appId: "1:36695107825:web:d92d202a3dd50c1f932150",
    measurementId: "G-P37CVN099B"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);


/* =========================================================
   HELPERS
========================================================= */

function escapeHTML(value) {

    if (value === undefined || value === null) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function objectToArray(data) {

    if (!data) {
        return [];
    }

    return Object.entries(data).map(
        ([id, value]) => ({
            id,
            ...value
        })
    );
}


/* =========================================================
   HEADER
========================================================= */

const header = document.getElementById("header");

window.addEventListener("scroll", () => {

    if (window.scrollY > 40) {
        header.classList.add("scrolled");
    } else {
        header.classList.remove("scrolled");
    }

});


/* =========================================================
   MOBILE MENU
========================================================= */

const menuButton =
    document.getElementById("menuButton");

const navigation =
    document.getElementById("navigation");

menuButton.addEventListener("click", () => {
    navigation.classList.toggle("open");
});

navigation.querySelectorAll("a").forEach(link => {

    link.addEventListener("click", () => {
        navigation.classList.remove("open");
    });

});


/* =========================================================
   SETTINGS
========================================================= */

onValue(
    ref(db, "settings"),
    snapshot => {

        const settings =
            snapshot.val() || {};

        applySettings(settings);

    }
);


function applySettings(settings) {

    if (settings.logo) {

        const logo =
            document.getElementById("siteLogo");

        const fallback =
            document.getElementById("logoFallback");

        logo.src = settings.logo;
        logo.style.display = "block";
        fallback.style.display = "none";


        const footerLogo =
            document.getElementById("footerLogo");

        const footerFallback =
            document.getElementById("footerFallback");

        footerLogo.src = settings.logo;
        footerLogo.style.display = "block";
        footerFallback.style.display = "none";
    }


    if (settings.facebook) {
        document.getElementById("facebookLink").href =
            settings.facebook;
    }

    if (settings.instagram) {
        document.getElementById("instagramLink").href =
            settings.instagram;
    }

    if (settings.youtube) {
        document.getElementById("youtubeLink").href =
            settings.youtube;
    }


    if (
        settings.live &&
        settings.live.enabled &&
        settings.live.url
    ) {

        showLive(settings.live.url);

    } else {

        showOffline();

    }

}


/* =========================================================
   SHOWS
========================================================= */

onValue(
    ref(db, "shows"),
    snapshot => {

        const shows =
            objectToArray(snapshot.val());

        renderShows(shows);

    }
);


function renderShows(shows) {

    const grid =
        document.getElementById("showsGrid");

    if (!shows.length) {

        grid.innerHTML = `
            <div class="loading">
                Binnenkort verschijnen hier nieuwe optredens.
            </div>
        `;

        return;
    }


    shows.sort((a, b) => {

        return String(a.date || "")
            .localeCompare(
                String(b.date || "")
            );

    });


    grid.innerHTML =
        shows.map(show => `

            <article class="show-card">

                <div class="show-date">
                    ${escapeHTML(show.date || "Binnenkort")}
                </div>

                <h3>
                    ${escapeHTML(show.title || "Mistery Duo Live")}
                </h3>

                <div class="show-location">
                    📍 ${escapeHTML(show.location || "België")}
                </div>

                <div class="show-footer">

                    <span>
                        ${escapeHTML(show.time || "")}
                    </span>

                    <span>
                        MISTERY DUO
                    </span>

                </div>

            </article>

        `).join("");

}


/* =========================================================
   LIVE
========================================================= */

function showLive(url) {

    const player =
        document.getElementById("livePlayer");

    const status =
        document.getElementById("liveStatus");

    status.classList.add("online");

    status.innerHTML = `
        <span></span>
        LIVE
    `;


    player.innerHTML = `
        <iframe
            class="live-frame"
            src="${escapeHTML(url)}"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowfullscreen>
        </iframe>
    `;

}


function showOffline() {

    const player =
        document.getElementById("livePlayer");

    const status =
        document.getElementById("liveStatus");

    status.classList.remove("online");

    status.innerHTML = `
        <span></span>
        OFFLINE
    `;


    player.innerHTML = `
        <div>

            <div class="live-icon">
                ▶
            </div>

            <h3>Mistery Duo Live</h3>

            <p>
                Er is momenteel geen livestream actief.
            </p>

        </div>
    `;

}


/* =========================================================
   VIDEOS
========================================================= */

onValue(
    ref(db, "videos"),
    snapshot => {

        const videos =
            objectToArray(snapshot.val());

        renderVideos(videos);

    }
);


function renderVideos(videos) {

    const grid =
        document.getElementById("videosGrid");

    if (!videos.length) {

        grid.innerHTML = `
            <div class="loading">
                Binnenkort verschijnen hier video's.
            </div>
        `;

        return;
    }


    grid.innerHTML =
        videos.map(video => `

            <article class="video-card">

                <a
                    href="${escapeHTML(video.url || "#")}"
                    target="_blank"
                >

                    <div class="video-image">

                        ${
                            video.image
                            ?
                            `<img
                                src="${escapeHTML(video.image)}"
                                alt="${escapeHTML(video.title)}"
                            >`
                            :
                            ""
                        }

                        <div class="play">
                            ▶
                        </div>

                    </div>

                    <div class="video-info">

                        <h3>
                            ${escapeHTML(
                                video.title ||
                                "Mistery Duo"
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                video.description || ""
                            )}
                        </p>

                    </div>

                </a>

            </article>

        `).join("");

}


/* =========================================================
   NEWS
========================================================= */

onValue(
    ref(db, "news"),
    snapshot => {

        const news =
            objectToArray(snapshot.val());

        renderNews(news);

    }
);


function renderNews(news) {

    const grid =
        document.getElementById("newsGrid");

    if (!news.length) {

        grid.innerHTML = `
            <div class="loading">
                Er is momenteel geen nieuws.
            </div>
        `;

        return;
    }


    news.sort((a, b) => {

        return String(b.date || "")
            .localeCompare(
                String(a.date || "")
            );

    });


    grid.innerHTML =
        news.map(item => `

            <article class="news-card">

                <div class="news-image">

                    ${
                        item.image
                        ?
                        `<img
                            src="${escapeHTML(item.image)}"
                            alt="${escapeHTML(item.title)}"
                        >`
                        :
                        ""
                    }

                </div>

                <div class="news-content">

                    <div class="news-date">
                        ${escapeHTML(item.date || "")}
                    </div>

                    <h3>
                        ${escapeHTML(
                            item.title ||
                            "Mistery Duo Nieuws"
                        )}
                    </h3>

                    <p>
                        ${escapeHTML(
                            item.text ||
                            item.description ||
                            ""
                        )}
                    </p>

                </div>

            </article>

        `).join("");

}


/* =========================================================
   PHOTOS
========================================================= */

onValue(
    ref(db, "photos"),
    snapshot => {

        const photos =
            objectToArray(snapshot.val());

        renderPhotos(photos);

    }
);


function renderPhotos(photos) {

    const grid =
        document.getElementById("photoGrid");

    if (!photos.length) {

        grid.innerHTML = `
            <div class="loading">
                De fotogalerij wordt binnenkort gevuld.
            </div>
        `;

        return;
    }


    grid.innerHTML =
        photos.map(photo => `

            <div class="photo">

                <img
                    src="${escapeHTML(photo.image)}"
                    alt="${escapeHTML(photo.title || "Mistery Duo")}"
                >

            </div>

        `).join("");


    document
        .querySelectorAll(".photo img")
        .forEach(image => {

            image.addEventListener(
                "click",
                () => openLightbox(image.src)
            );

        });

}


/* =========================================================
   SHOP
========================================================= */

onValue(
    ref(db, "products"),
    snapshot => {

        const products =
            objectToArray(snapshot.val());

        renderProducts(products);

    }
);


function renderProducts(products) {

    const grid =
        document.getElementById("shopGrid");

    if (!products.length) {

        grid.innerHTML = `
            <div class="loading">
                Merchandise wordt binnenkort toegevoegd.
            </div>
        `;

        return;
    }


    grid.innerHTML =
        products.map(product => `

            <article class="product-card">

                <div class="product-image">

                    ${
                        product.image
                        ?
                        `<img
                            src="${escapeHTML(product.image)}"
                            alt="${escapeHTML(product.name)}"
                        >`
                        :
                        ""
                    }

                </div>

                <div class="product-info">

                    <h3>
                        ${escapeHTML(
                            product.name ||
                            "Mistery Duo Merchandise"
                        )}
                    </h3>

                    <div class="product-price">
                        ${escapeHTML(
                            product.price ||
                            "Binnenkort"
                        )}
                    </div>

                    ${
                        product.url
                        ?
                        `<a
                            class="button gold full"
                            href="${escapeHTML(product.url)}"
                            target="_blank"
                        >
                            Bestellen →
                        </a>`
                        :
                        `<button
                            class="button outline full"
                            disabled
                        >
                            Binnenkort
                        </button>`
                    }

                </div>

            </article>

        `).join("");

}


/* =========================================================
   BOOKING
========================================================= */

const bookingForm =
    document.getElementById("bookingForm");


bookingForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const result =
            document.getElementById("bookingResult");


        const bookingRef =
            push(ref(db, "bookings"));


        const booking = {

            name:
                document.getElementById(
                    "bookingName"
                ).value.trim(),

            email:
                document.getElementById(
                    "bookingEmail"
                ).value.trim(),

            date:
                document.getElementById(
                    "bookingDate"
                ).value,

            location:
                document.getElementById(
                    "bookingLocation"
                ).value.trim(),

            message:
                document.getElementById(
                    "bookingMessage"
                ).value.trim(),

            status:
                "nieuw",

            createdAt:
                Date.now()

        };


        try {

            await set(
                bookingRef,
                booking
            );


            result.textContent =
                "✓ Je aanvraag is succesvol verzonden!";

            result.style.color =
                "#d6b36a";


            bookingForm.reset();


        } catch (error) {

            console.error(error);

            result.textContent =
                "Er ging iets mis. Probeer het opnieuw.";

            result.style.color =
                "#ff6666";

        }

    }
);


/* =========================================================
   LIGHTBOX
========================================================= */

const lightbox =
    document.getElementById("lightbox");

const lightboxImage =
    document.getElementById("lightboxImage");

const closeLightbox =
    document.getElementById("closeLightbox");


function openLightbox(src) {

    lightboxImage.src = src;

    lightbox.classList.add("active");

}


closeLightbox.addEventListener(
    "click",
    () => {

        lightbox.classList.remove(
            "active"
        );

    }
);


lightbox.addEventListener(
    "click",
    event => {

        if (event.target === lightbox) {

            lightbox.classList.remove(
                "active"
            );

        }

    }
);


/* =========================================================
   YEAR
========================================================= */

document.getElementById("year")
    .textContent =
    new Date().getFullYear();
