/* =========================================
   MISTERY DUO BEHEER
   ========================================= */


/* SUPABASE */

const SUPABASE_URL =
    "https://msvesugylaeffjqiizzm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable__cDajfEACOoUZ9xOU8ZtYQ_Q5XFtp5B";


const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* BEHEERDERSCODE */

const ADMIN_PASSWORD =
    "misteryduo";


/* KORTE FUNCTIES */

function $(id) {
    return document.getElementById(id);
}


function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================
   LOGIN
   ========================================= */

$("loginButton").addEventListener(
    "click",
    login
);


$("password").addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Enter") {

            login();

        }

    }
);


function login() {

    const password =
        $("password").value;


    if (password !== ADMIN_PASSWORD) {

        $("loginMessage").textContent =
            "Verkeerd wachtwoord.";

        return;

    }


    sessionStorage.setItem(
        "misteryDuoAdmin",
        "true"
    );


    $("loginScreen")
        .classList
        .add("hidden");


    $("adminApp")
        .classList
        .remove("hidden");


    startAdmin();

}


/* =========================================
   UITLOGGEN
   ========================================= */

$("logoutButton").addEventListener(
    "click",
    function() {

        sessionStorage.removeItem(
            "misteryDuoAdmin"
        );

        location.reload();

    }
);


/* =========================================
   PAGINA NAVIGATIE
   ========================================= */

const pageNames = {

    dashboard: "Dashboard",

    logo: "Logo",

    live: "Livestream",

    videos: "Video's",

    events: "Optredens",

    news: "Nieuws",

    photos: "Foto's",

    shop: "Merchandise",

    bookings: "Boekingen"

};


document
    .querySelectorAll(".nav-button")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                openPage(
                    button.dataset.page
                );

            }
        );

    });


function openPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(function(section) {

            section.classList.remove(
                "active"
            );

        });


    const selected =
        $(page);


    if (selected) {

        selected.classList.add(
            "active"
        );

    }


    document
        .querySelectorAll(".nav-button")
        .forEach(function(button) {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    $("pageTitle").textContent =
        pageNames[page] || page;


    if (page === "dashboard") {

        loadCounts();

    }

    if (page === "logo") {

        updateLogos();

    }

    if (page === "live") {

        loadLivestream();

    }

    if (page === "videos") {

        loadVideos();

    }

    if (page === "events") {

        loadEvents();

    }

    if (page === "news") {

        loadNews();

    }

    if (page === "photos") {

        loadPhotos();

    }

    if (page === "shop") {

        loadProducts();

    }

    if (page === "bookings") {

        loadBookings();

    }

}


/* =========================================
   LOGO
   ========================================= */

function getSavedLogo() {

    return localStorage.getItem(
        "misteryDuoLogo"
    ) || "assets/mistery-duo-logo.jpg";

}


function updateLogos() {

    const logo =
        getSavedLogo();


    $("loginLogo").src =
        logo;

    $("sidebarLogo").src =
        logo;

    $("dashboardLogo").src =
        logo;

    $("logoPreview").src =
        logo;

}


$("logoFile").addEventListener(
    "change",
    function(event) {

        const file =
            event.target.files[0];


        if (!file) return;


        $("logoPreview").src =
            URL.createObjectURL(file);

    }
);


$("saveLogoButton").addEventListener(
    "click",
    async function() {

        const file =
            $("logoFile").files[0];


        if (!file) {

            showMessage(
                "logoMessage",
                "Kies eerst een logo."
            );

            return;

        }


        try {

            const path =
                "logo-" +
                Date.now() +
                "-" +
                cleanFileName(file.name);


            const url =
                await uploadFile(
                    "photos",
                    file,
                    path
                );


            localStorage.setItem(
                "misteryDuoLogo",
                url
            );


            updateLogos();


            showSuccess(
                "logoMessage",
                "Logo succesvol opgeslagen."
            );


            toast(
                "Logo opgeslagen"
            );


        } catch (error) {

            showMessage(
                "logoMessage",
                error.message
            );

        }

    }
);


$("resetLogoButton").addEventListener(
    "click",
    function() {

        localStorage.removeItem(
            "misteryDuoLogo"
        );

        updateLogos();

        showSuccess(
            "logoMessage",
            "Standaardlogo ingesteld."
        );

    }
);


/* =========================================
   SUPABASE STORAGE
   ========================================= */

async function uploadFile(
    bucket,
    file,
    path
) {

    const result =
        await supabaseClient
            .storage
            .from(bucket)
            .upload(
                path,
                file,
                {
                    upsert: true,
                    contentType: file.type
                }
            );


    if (result.error) {

        throw result.error;

    }


    const publicURL =
        supabaseClient
            .storage
            .from(bucket)
            .getPublicUrl(path);


    return publicURL.data.publicUrl;

}


function cleanFileName(name) {

    return name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
    );

}


/* =========================================
   LIVESTREAM
   ========================================= */

function getYoutubeID(url) {

    const match =
        String(url).match(
            /(?:v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/)([^&?\/\s]+)/
        );


    return match
        ? match[1]
        : null;

}


$("activateLive").addEventListener(
    "click",
    saveLivestream
);


async function saveLivestream() {

    const url =
        $("liveUrl").value.trim();


    const id =
        getYoutubeID(url);


    if (!id) {

        showMessage(
            "liveMessage",
            "Gebruik een geldige YouTube-link."
        );

        return;

    }


    const result =
        await supabaseClient
            .from("settings")
            .upsert(
                {
                    key: "livestream",
                    value: url,
                    active: true
                },
                {
                    onConflict: "key"
                }
            );


    if (result.error) {

        showMessage(
            "liveMessage",
            result.error.message
        );

        return;

    }


    showLiveVideo(id);


    showSuccess(
        "liveMessage",
        "Livestream geactiveerd."
    );


    toast(
        "Livestream staat live"
    );

}


$("disableLive").addEventListener(
    "click",
    async function() {

        const result =
            await supabaseClient
                .from("settings")
                .upsert(
                    {
                        key: "livestream",
                        value: "",
                        active: false
                    },
                    {
                        onConflict: "key"
                    }
                );


        if (result.error) {

            showMessage(
                "liveMessage",
                result.error.message
            );

            return;

        }


        $("livePreview").innerHTML = "";

        showSuccess(
            "liveMessage",
            "Livestream uitgezet."
        );

    }
);


function showLiveVideo(id) {

    $("livePreview").innerHTML =

        `<iframe
            src="https://www.youtube.com/embed/${escapeHTML(id)}"
            allowfullscreen>
        </iframe>`;

}


async function loadLivestream() {

    const result =
        await supabaseClient
            .from("settings")
            .select("*")
            .eq(
                "key",
                "livestream"
            )
            .maybeSingle();


    if (result.error) return;


    if (!result.data) return;


    $("liveUrl").value =
        result.data.value || "";


    if (
        result.data.active &&
        result.data.value
    ) {

        const id =
            getYoutubeID(
                result.data.value
            );


        if (id) {

            showLiveVideo(id);

        }

    }

}


/* =========================================
   VIDEO'S
   ========================================= */

$("uploadVideo").addEventListener(
    "click",
    async function() {

        const title =
            $("videoTitle").value.trim();

        const file =
            $("videoFile").files[0];


        if (!title || !file) {

            showMessage(
                "videoMessage",
                "Titel en video zijn verplicht."
            );

            return;

        }


        const video =
            document.createElement(
                "video"
            );


        video.preload =
            "metadata";


        video.onloadedmetadata =
            async function() {

                if (video.duration > 60) {

                    showMessage(
                        "videoMessage",
                        "Deze video is langer dan 1 minuut."
                    );

                    return;

                }


                try {

                    const path =
                        "video-" +
                        Date.now() +
                        "-" +
                        cleanFileName(
                            file.name
                        );


                    const url =
                        await uploadFile(
                            "videos",
                            file,
                            path
                        );


                    const result =
                        await supabaseClient
                            .from("videos")
                            .insert(
                                {
                                    title: title,
                                    video_url: url
                                }
                            );


                    if (result.error) {

                        throw result.error;

                    }


                    $("videoTitle").value =
                        "";

                    $("videoFile").value =
                        "";


                    showSuccess(
                        "videoMessage",
                        "Video succesvol geplaatst."
                    );


                    toast(
                        "Video geplaatst"
                    );


                    loadVideos();

                    loadCounts();


                } catch (error) {

                    showMessage(
                        "videoMessage",
                        error.message
                    );

                }

            };


        video.src =
            URL.createObjectURL(file);

    }
);


async function loadVideos() {

    const result =
        await supabaseClient
            .from("videos")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (result.error) {

        $("videosList").innerHTML =
            `<div class="empty">
                ${escapeHTML(result.error.message)}
            </div>`;

        return;

    }


    if (!result.data.length) {

        $("videosList").innerHTML =
            `<div class="empty">
                Nog geen video's.
            </div>`;

        return;

    }


    $("videosList").innerHTML =
        result.data
            .map(function(video) {

                return `
                    <div class="media-card">

                        <video
                            controls
                            src="${escapeHTML(video.video_url)}">
                        </video>

                        <div class="media-content">

                            <strong>
                                ${escapeHTML(video.title)}
                            </strong>

                        </div>

                        <button
                            class="danger-button"
                            onclick="deleteItem('videos', ${video.id})">
                            Verwijderen
                        </button>

                    </div>
                `;

            })
            .join("");

}


/* =========================================
   OPTREDENS
   ========================================= */

$("addEvent").addEventListener(
    "click",
    async function() {

        const data = {

            name:
                $("eventName").value.trim(),

            location:
                $("eventLocation").value.trim(),

            event_date:
                $("eventDate").value,

            event_time:
                $("eventTime").value

        };


        if (
            !data.name ||
            !data.location ||
            !data.event_date
        ) {

            showMessage(
                "eventMessage",
                "Vul naam, locatie en datum in."
            );

            return;

        }


        const result =
            await supabaseClient
                .from("events")
                .insert(data);


        if (result.error) {

            showMessage(
                "eventMessage",
                result.error.message
            );

            return;

        }


        $("eventName").value = "";
        $("eventLocation").value = "";
        $("eventDate").value = "";
        $("eventTime").value = "";


        showSuccess(
            "eventMessage",
            "Optreden toegevoegd."
        );


        toast(
            "Optreden toegevoegd"
        );


        loadEvents();
        loadCounts();

    }
);


async function loadEvents() {

    const result =
        await supabaseClient
            .from("events")
            .select("*")
            .order(
                "event_date",
                {
                    ascending: true
                }
            );


    if (result.error) {

        $("eventsList").innerHTML =
            `<div class="empty">
                ${escapeHTML(result.error.message)}
            </div>`;

        return;

    }


    if (!result.data.length) {

        $("eventsList").innerHTML =
            `<div class="empty">
                Nog geen optredens.
            </div>`;

        return;

    }


    $("eventsList").innerHTML =
        result.data
            .map(function(event) {

                return `
                    <div class="content-item">

                        <div>

                            <strong>
                                ${escapeHTML(event.name)}
                            </strong>

                            <small>
                                📍 ${escapeHTML(event.location)}
                                ·
                                ${escapeHTML(event.event_date)}
                                ${escapeHTML(event.event_time || "")}
                            </small>

                        </div>


                        <button
                            class="danger-button"
                            onclick="deleteItem('events', ${event.id})">
                            Verwijderen
                        </button>

                    </div>
                `;

            })
            .join("");

}


/* =========================================
   NIEUWS
   ========================================= */

$("publishNews").addEventListener(
    "click",
    async function() {

        const title =
            $("newsTitle").value.trim();

        const content =
            $("newsContent").value.trim();


        if (!title || !content) {

            showMessage(
                "newsMessage",
                "Titel en bericht zijn verplicht."
            );

            return;

        }


        const result =
            await supabaseClient
                .from("news")
                .insert(
                    {
                        title,
                        content
                    }
                );


        if (result.error) {

            showMessage(
                "newsMessage",
                result.error.message
            );

            return;

        }


        $("newsTitle").value = "";
        $("newsContent").value = "";


        showSuccess(
            "newsMessage",
            "Nieuws gepubliceerd."
        );


        toast(
            "Nieuws gepubliceerd"
        );


        loadNews();
        loadCounts();

    }
);


async function loadNews() {

    const result =
        await supabaseClient
            .from("news")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (result.error) {

        $("newsList").innerHTML =
            `<div class="empty">
                ${escapeHTML(result.error.message)}
            </div>`;

        return;

    }


    if (!result.data.length) {

        $("newsList").innerHTML =
            `<div class="empty">
                Nog geen nieuws.
            </div>`;

        return;

    }


    $("newsList").innerHTML =
        result.data
            .map(function(news) {

                return `
                    <div class="content-item">

                        <div>

                            <strong>
                                ${escapeHTML(news.title)}
                            </strong>

                            <small>
                                ${escapeHTML(news.content)}
                            </small>

                        </div>

                        <button
                            class="danger-button"
                            onclick="deleteItem('news', ${news.id})">
                            Verwijderen
                        </button>

                    </div>
                `;

            })
            .join("");

}


/* =========================================
   FOTO'S
   ========================================= */

$("uploadPhoto").addEventListener(
    "click",
    async function() {

        const file =
            $("photoFile").files[0];

        const title =
            $("photoTitle").value.trim();


        if (!file) {

            showMessage(
                "photoMessage",
                "Kies eerst een foto."
            );

            return;

        }


        try {

            const path =
                "photo-" +
                Date.now() +
                "-" +
                cleanFileName(file.name);


            const url =
                await uploadFile(
                    "photos",
                    file,
                    path
                );


            const result =
                await supabaseClient
                    .from("photos")
                    .insert(
                        {
                            title,
                            image_url: url
                        }
                    );


            if (result.error) {

                throw result.error;

            }


            $("photoFile").value = "";
            $("photoTitle").value = "";


            showSuccess(
                "photoMessage",
                "Foto geplaatst."
            );


            toast(
                "Foto geplaatst"
            );


            loadPhotos();

        } catch (error) {

            showMessage(
                "photoMessage",
                error.message
            );

        }

    }
);


async function loadPhotos() {

    const result =
        await supabaseClient
            .from("photos")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (result.error) {

        $("photosList").innerHTML =
            `<div class="empty">
                ${escapeHTML(result.error.message)}
            </div>`;

        return;

    }


    if (!result.data.length) {

        $("photosList").innerHTML =
            `<div class="empty">
                Nog geen foto's.
            </div>`;

        return;

    }


    $("photosList").innerHTML =
        result.data
            .map(function(photo) {

                return `
                    <div class="media-card">

                        <img
                            src="${escapeHTML(photo.image_url)}"
                            alt=""
                        >

                        <div class="media-content">

                            <strong>
                                ${escapeHTML(photo.title || "Foto")}
                            </strong>

                        </div>


                        <button
                            class="danger-button"
                            onclick="deleteItem('photos', ${photo.id})">
                            Verwijderen
                        </button>

                    </div>
                `;

            })
            .join("");

}


/* =========================================
   MERCHANDISE
   ========================================= */

$("addProduct").addEventListener(
    "click",
    async function() {

        const name =
            $("productName").value.trim();

        const price =
            $("productPrice").value.trim();

        const description =
            $("productDescription").value.trim();

        const file =
            $("productFile").files[0];


        if (!name || !price) {

            showMessage(
                "productMessage",
                "Productnaam en prijs zijn verplicht."
            );

            return;

        }


        try {

            let imageURL = null;


            if (file) {

                imageURL =
                    await uploadFile(
                        "photos",
                        file,
                        "merch-" +
                        Date.now() +
                        "-" +
                        cleanFileName(file.name)
                    );

            }


            const result =
                await supabaseClient
                    .from("products")
                    .insert(
                        {
                            name,
                            price,
                            description,
                            image_url: imageURL
                        }
                    );


            if (result.error) {

                throw result.error;

            }


            $("productName").value = "";
            $("productPrice").value = "";
            $("productDescription").value = "";
            $("productFile").value = "";


            showSuccess(
                "productMessage",
                "Product toegevoegd."
            );


            toast(
                "Product toegevoegd"
            );


            loadProducts();

        } catch (error) {

            showMessage(
                "productMessage",
                error.message
            );

        }

    }
);


async function loadProducts() {

    const result =
        await supabaseClient
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (result.error) {

        $("productsList").innerHTML =
            `<div class="empty">
                ${escapeHTML(result.error.message)}
            </div>`;

        return;

    }


    if (!result.data.length) {

        $("productsList").innerHTML =
            `<div class="empty">
                Nog geen merchandise.
            </div>`;

        return;

    }


    $("productsList").innerHTML =
        result.data
            .map(function(product) {

                return `
                    <div class="media-card">

                        ${
                            product.image_url
                            ?
                            `<img
                                src="${escapeHTML(product.image_url)}"
                                alt=""
                            >`
                            :
                            ""
                        }


                        <div class="media-content">

                            <strong>
                                ${escapeHTML(product.name)}
                            </strong>

                            <br>

                            <small>
                                € ${escapeHTML(product.price)}
                            </small>

                            <p>
                                ${escapeHTML(product.description || "")}
                            </p>

                        </div>


                        <button
                            class="danger-button"
                            onclick="deleteItem('products', ${product.id})">
                            Verwijderen
                        </button>

                    </div>
                `;

            })
            .join("");

}


/* =========================================
   BOEKINGEN
   ========================================= */

async function loadBookings() {

    const result =
        await supabaseClient
            .from("bookings")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (result.error) {

        $("bookingsList").innerHTML =
            `<div class="empty">
                ${escapeHTML(result.error.message)}
            </div>`;

        return;

    }


    if (!result.data.length) {

        $("bookingsList").innerHTML =
            `<div class="empty">
                Nog geen boekingsaanvragen.
            </div>`;

        return;

    }


    $("bookingsList").innerHTML =
        result.data
            .map(function(booking) {

                return `
                    <div class="content-item">

                        <div>

                            <strong>
                                ${escapeHTML(booking.name)}
                            </strong>

                            <small>
                                📧 ${escapeHTML(booking.email || "")}
                                <br>
                                📍 ${escapeHTML(booking.location || "")}
                                <br>
                                📅 ${escapeHTML(booking.event_date || "")}
                            </small>

                            <p>
                                ${escapeHTML(booking.message || "")}
                            </p>

                        </div>


                        <button
                            class="danger-button"
                            onclick="deleteItem('bookings', ${booking.id})">
                            Verwijderen
                        </button>

                    </div>
                `;

            })
            .join("");

}


/* =========================================
   VERWIJDEREN
   ========================================= */

async function deleteItem(
    table,
    id
) {

    if (
        !confirm(
            "Weet je zeker dat je dit wilt verwijderen?"
        )
    ) {

        return;

    }


    const result =
        await supabaseClient
            .from(table)
            .delete()
            .eq(
                "id",
                id
            );


    if (result.error) {

        alert(
            "Verwijderen mislukt:\n" +
            result.error.message
        );

        return;

    }


    toast(
        "Item verwijderd"
    );


    if (table === "videos")
        loadVideos();

    if (table === "events")
        loadEvents();

    if (table === "news")
        loadNews();

    if (table === "photos")
        loadPhotos();

    if (table === "products")
        loadProducts();

    if (table === "bookings")
        loadBookings();


    loadCounts();

}


window.deleteItem =
    deleteItem;


/* =========================================
   DASHBOARD TELLERS
   ========================================= */

async function getCount(table) {

    const result =
        await supabaseClient
            .from(table)
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            );


    return result.error
        ? 0
        : result.count || 0;

}


async function loadCounts() {

    $("videoCount").textContent =
        await getCount("videos");

    $("eventCount").textContent =
        await getCount("events");

    $("newsCount").textContent =
        await getCount("news");

    $("bookingCount").textContent =
        await getCount("bookings");

}


/* =========================================
   DATABASE TEST
   ========================================= */

async function testConnection() {

    const result =
        await supabaseClient
            .from("events")
            .select("id")
            .limit(1);


    if (result.error) {

        $("connectionStatus").textContent =
            "● Database niet verbonden";

        $("connectionStatus")
            .classList
            .remove("online");

        console.error(
            result.error
        );

        return;

    }


    $("connectionStatus").textContent =
        "● Online verbonden";

    $("connectionStatus")
        .classList
        .add("online");

}


/* =========================================
   MESSAGES
   ========================================= */

function showMessage(
    element,
    message
) {

    $(element).textContent =
        message;

    $(element)
        .classList
        .remove("success");

}


function showSuccess(
    element,
    message
) {

    $(element).textContent =
        message;

    $(element)
        .classList
        .add("success");

}


function toast(message) {

    const element =
        $("toast");


    element.textContent =
        message;


    element.classList.add(
        "show"
    );


    setTimeout(
        function() {

            element.classList.remove(
                "show"
            );

        },
        2200
    );

}


/* =========================================
   START
   ========================================= */

async function startAdmin() {

    updateLogos();

    testConnection();

    loadCounts();

    loadLivestream();

}


/* =========================================
   AUTOMATISCH INLOGGEN
   ========================================= */

if (
    sessionStorage.getItem(
        "misteryDuoAdmin"
    ) === "true"
) {

    $("loginScreen")
        .classList
        .add("hidden");


    $("adminApp")
        .classList
        .remove("hidden");


    startAdmin();

} else {

    updateLogos();

}
