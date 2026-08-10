/* ==========================================
   MISTERY DUO BEHEER
========================================== */


/* SUPABASE */

const SUPABASE_URL =
    "https://msvesugylaeffjqiizzm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable__cDajfEACOoUZ9xOU8ZtYQ5XFtp5B";

const db =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* WACHTWOORD */

const ADMIN_PASSWORD =
    "misteryduo";


/* ==========================================
   HELPERS
========================================== */

const $ = id =>
    document.getElementById(id);


function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


function message(id, text, success = false) {

    const element = $(id);

    element.textContent = text;

    element.classList.toggle(
        "success",
        success
    );

}


function toast(text) {

    const element = $("toast");

    element.textContent = text;

    element.classList.add("show");

    setTimeout(() => {

        element.classList.remove("show");

    }, 2200);

}


/* ==========================================
   LOGIN
========================================== */

$("loginBtn").addEventListener(
    "click",
    login
);


$("passwordInput").addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            login();

        }

    }
);


function login() {

    const password =
        $("passwordInput").value;


    if (password !== ADMIN_PASSWORD) {

        message(
            "loginError",
            "Het wachtwoord is niet correct."
        );

        return;

    }


    sessionStorage.setItem(
        "misteryDuoAdmin",
        "true"
    );


    showAdmin();

}


function showAdmin() {

    $("loginPage")
        .classList
        .add("hidden");

    $("adminPage")
        .classList
        .remove("hidden");


    initialise();

}


$("logoutBtn").addEventListener(
    "click",
    () => {

        sessionStorage.removeItem(
            "misteryDuoAdmin"
        );

        location.reload();

    }
);


/* ==========================================
   NAVIGATIE
========================================== */

const titles = {

    dashboard: "Dashboard",
    live: "Livestream",
    videos: "Video's",
    events: "Optredens",
    news: "Nieuws",
    photos: "Foto's",
    shop: "Merchandise",
    bookings: "Boekingen",
    settings: "Instellingen"

};


document
    .querySelectorAll(".menu")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openPage(
                    button.dataset.page
                );

            }
        );

    });


document
    .querySelectorAll("[data-open]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openPage(
                    button.dataset.open
                );

            }
        );

    });


function openPage(name) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove(
                "active"
            );

        });


    $(name)
        .classList
        .add("active");


    document
        .querySelectorAll(".menu")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === name
            );

        });


    $("pageTitle").textContent =
        titles[name];


    if (name === "dashboard")
        loadDashboard();

    if (name === "live")
        loadLive();

    if (name === "videos")
        loadVideos();

    if (name === "events")
        loadEvents();

    if (name === "news")
        loadNews();

    if (name === "photos")
        loadPhotos();

    if (name === "shop")
        loadProducts();

    if (name === "bookings")
        loadBookings();

}


/* ==========================================
   CONNECTION
========================================== */

async function testConnection() {

    const result =
        await db
            .from("events")
            .select("id")
            .limit(1);


    if (result.error) {

        $("status").classList.remove(
            "online"
        );

        $("status").innerHTML =
            "<span></span>Database fout";

        console.error(
            result.error
        );

        return;

    }


    $("status").classList.add(
        "online"
    );

    $("status").innerHTML =
        "<span></span>Verbonden";

}


/* ==========================================
   DASHBOARD
========================================== */

async function count(table) {

    const result =
        await db
            .from(table)
            .select(
                "*",
                {
                    count: "exact",
                    head: true
                }
            );


    return result.count || 0;

}


async function loadDashboard() {

    $("statVideos").textContent =
        await count("videos");

    $("statEvents").textContent =
        await count("events");

    $("statNews").textContent =
        await count("news");

    const bookings =
        await count("bookings");


    $("statBookings").textContent =
        bookings;

    $("bookingBadge").textContent =
        bookings;

}


/* ==========================================
   YOUTUBE
========================================== */

function youtubeId(url) {

    if (!url)
        return null;


    const patterns = [

        /youtube\.com\/watch\?v=([^&]+)/,

        /youtu\.be\/([^?]+)/,

        /youtube\.com\/live\/([^?]+)/,

        /youtube\.com\/embed\/([^?]+)/

    ];


    for (
        const pattern of patterns
    ) {

        const match =
            url.match(pattern);


        if (match)
            return match[1];

    }


    return null;

}


/* ==========================================
   LIVESTREAM
========================================== */

$("startLiveBtn").addEventListener(
    "click",
    activateLive
);


$("stopLiveBtn").addEventListener(
    "click",
    stopLive
);


async function activateLive() {

    const url =
        $("liveUrl").value.trim();


    const id =
        youtubeId(url);


    if (!id) {

        message(
            "liveMessage",
            "Vul een geldige YouTube-link in."
        );

        return;

    }


    const result =
        await db
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

        message(
            "liveMessage",
            result.error.message
        );

        return;

    }


    showLive(id);


    message(
        "liveMessage",
        "Livestream geactiveerd.",
        true
    );


    toast("Livestream geactiveerd");

}


async function stopLive() {

    const result =
        await db
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

        message(
            "liveMessage",
            result.error.message
        );

        return;

    }


    $("livePreview").innerHTML =
        "<div>Livestream staat uit.</div>";


    message(
        "liveMessage",
        "Livestream gestopt.",
        true
    );

}


function showLive(id) {

    $("livePreview").innerHTML = `

        <iframe
            src="https://www.youtube.com/embed/${escapeHTML(id)}"
            allow="autoplay; encrypted-media"
            allowfullscreen>
        </iframe>

    `;

}


async function loadLive() {

    const result =
        await db
            .from("settings")
            .select("*")
            .eq(
                "key",
                "livestream"
            )
            .maybeSingle();


    if (
        result.error ||
        !result.data
    )
        return;


    $("liveUrl").value =
        result.data.value || "";


    if (
        result.data.active &&
        result.data.value
    ) {

        const id =
            youtubeId(
                result.data.value
            );


        if (id)
            showLive(id);

    }

}


/* ==========================================
   VIDEO UPLOAD
========================================== */

$("uploadVideoBtn").addEventListener(
    "click",
    uploadVideo
);


async function uploadVideo() {

    const file =
        $("videoFile").files[0];

    const title =
        $("videoTitle").value.trim();


    if (!file || !title) {

        message(
            "videoMessage",
            "Vul een titel en kies een video."
        );

        return;

    }


    if (
        !file.type.startsWith("video/")
    ) {

        message(
            "videoMessage",
            "Dit bestand is geen video."
        );

        return;

    }


    const video =
        document.createElement("video");


    video.preload = "metadata";


    video.onloadedmetadata =
        async () => {

            URL.revokeObjectURL(
                video.src
            );


            if (video.duration > 60) {

                message(
                    "videoMessage",
                    "De video mag maximaal 1 minuut zijn."
                );

                return;

            }


            try {

                const path =
                    `videos/${Date.now()}-${safeName(file.name)}`;


                const upload =
                    await db
                        .storage
                        .from("videos")
                        .upload(
                            path,
                            file,
                            {
                                upsert: false
                            }
                        );


                if (upload.error)
                    throw upload.error;


                const publicURL =
                    db
                        .storage
                        .from("videos")
                        .getPublicUrl(path)
                        .data
                        .publicUrl;


                const insert =
                    await db
                        .from("videos")
                        .insert(
                            {
                                title,
                                video_url:
                                    publicURL
                            }
                        );


                if (insert.error)
                    throw insert.error;


                $("videoTitle").value = "";

                $("videoFile").value = "";


                message(
                    "videoMessage",
                    "Video succesvol toegevoegd.",
                    true
                );


                toast("Video toegevoegd");

                loadVideos();

                loadDashboard();


            } catch (error) {

                console.error(error);

                message(
                    "videoMessage",
                    "Upload mislukt: " +
                    error.message
                );

            }

        };


    video.onerror = () => {

        message(
            "videoMessage",
            "De video kon niet worden gelezen."
        );

    };


    video.src =
        URL.createObjectURL(file);

}


async function loadVideos() {

    const result =
        await db
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
            errorHTML(
                result.error.message
            );

        return;

    }


    if (!result.data.length) {

        $("videosList").innerHTML =
            emptyHTML(
                "Nog geen video's."
            );

        return;

    }


    $("videosList").innerHTML =
        result.data
            .map(video => `

                <div class="item">

                    <div class="item-main">

                        <strong>
                            ${escapeHTML(video.title)}
                        </strong>

                        <small>
                            Video gepubliceerd
                        </small>

                    </div>

                    <div class="item-actions">

                        <button
                            class="delete-button"
                            onclick="deleteRow('videos', ${video.id})">
                            Verwijderen
                        </button>

                    </div>

                </div>

            `)
            .join("");

}


/* ==========================================
   OPTREDENS
========================================== */

$("addEventBtn").addEventListener(
    "click",
    addEvent
);


async function addEvent() {

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

        message(
            "eventMessage",
            "Naam, locatie en datum zijn verplicht."
        );

        return;

    }


    const result =
        await db
            .from("events")
            .insert(data);


    if (result.error) {

        message(
            "eventMessage",
            result.error.message
        );

        return;

    }


    $("eventName").value = "";
    $("eventLocation").value = "";
    $("eventDate").value = "";
    $("eventTime").value = "";


    message(
        "eventMessage",
        "Optreden toegevoegd.",
        true
    );


    toast("Optreden toegevoegd");

    loadEvents();

    loadDashboard();

}


async function loadEvents() {

    const result =
        await db
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
            errorHTML(
                result.error.message
            );

        return;

    }


    if (!result.data.length) {

        $("eventsList").innerHTML =
            emptyHTML(
                "Nog geen optredens."
            );

        return;

    }


    $("eventsList").innerHTML =
        result.data
            .map(event => `

                <div class="item">

                    <div class="item-main">

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

                    <div class="item-actions">

                        <button
                            class="delete-button"
                            onclick="deleteRow('events', ${event.id})">
                            Verwijderen
                        </button>

                    </div>

                </div>

            `)
            .join("");

}


/* ==========================================
   NIEUWS
========================================== */

$("publishNewsBtn").addEventListener(
    "click",
    publishNews
);


async function publishNews() {

    const title =
        $("newsTitle").value.trim();

    const content =
        $("newsContent").value.trim();


    if (!title || !content) {

        message(
            "newsMessage",
            "Titel en bericht zijn verplicht."
        );

        return;

    }


    const result =
        await db
            .from("news")
            .insert({
                title,
                content
            });


    if (result.error) {

        message(
            "newsMessage",
            result.error.message
        );

        return;

    }


    $("newsTitle").value = "";

    $("newsContent").value = "";


    message(
        "newsMessage",
        "Nieuws gepubliceerd.",
        true
    );


    toast("Nieuws gepubliceerd");

    loadNews();

    loadDashboard();

}


async function loadNews() {

    const result =
        await db
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
            errorHTML(
                result.error.message
            );

        return;

    }


    if (!result.data.length) {

        $("newsList").innerHTML =
            emptyHTML(
                "Nog geen nieuws."
            );

        return;

    }


    $("newsList").innerHTML =
        result.data
            .map(news => `

                <div class="item">

                    <div class="item-main">

                        <strong>
                            ${escapeHTML(news.title)}
                        </strong>

                        <small>
                            ${escapeHTML(news.content)}
                        </small>

                    </div>

                    <div class="item-actions">

                        <button
                            class="delete-button"
                            onclick="deleteRow('news', ${news.id})">
                            Verwijderen
                        </button>

                    </div>

                </div>

            `)
            .join("");

}


/* ==========================================
   FOTO'S
========================================== */

$("uploadPhotoBtn").addEventListener(
    "click",
    uploadPhoto
);


async function uploadPhoto() {

    const file =
        $("photoFile").files[0];

    const title =
        $("photoTitle").value.trim();


    if (!file) {

        message(
            "photoMessage",
            "Kies eerst een foto."
        );

        return;

    }


    try {

        const path =
            `photos/${Date.now()}-${safeName(file.name)}`;


        const upload =
            await db
                .storage
                .from("photos")
                .upload(
                    path,
                    file,
                    {
                        upsert: false
                    }
                );


        if (upload.error)
            throw upload.error;


        const url =
            db
                .storage
                .from("photos")
                .getPublicUrl(path)
                .data
                .publicUrl;


        const result =
            await db
                .from("photos")
                .insert({
                    title,
                    image_url: url
                });


        if (result.error)
            throw result.error;


        $("photoTitle").value = "";

        $("photoFile").value = "";


        message(
            "photoMessage",
            "Foto succesvol toegevoegd.",
            true
        );


        toast("Foto toegevoegd");

        loadPhotos();


    } catch (error) {

        message(
            "photoMessage",
            error.message
        );

    }

}


async function loadPhotos() {

    const result =
        await db
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
            errorHTML(
                result.error.message
            );

        return;

    }


    if (!result.data.length) {

        $("photosList").innerHTML =
            emptyHTML(
                "Nog geen foto's."
            );

        return;

    }


    $("photosList").innerHTML =
        result.data
            .map(photo => `

                <div class="media-card">

                    <img
                        src="${escapeHTML(photo.image_url)}"
                        alt=""
                    >

                    <div class="media-info">

                        <strong>
                            ${escapeHTML(
                                photo.title || "Foto"
                            )}
                        </strong>

                        <button
                            class="delete-button"
                            onclick="deleteRow('photos', ${photo.id})">
                            Verwijderen
                        </button>

                    </div>

                </div>

            `)
            .join("");

}


/* ==========================================
   MERCHANDISE
========================================== */

$("addProductBtn").addEventListener(
    "click",
    addProduct
);


async function addProduct() {

    const name =
        $("productName").value.trim();

    const price =
        $("productPrice").value.trim();

    const description =
        $("productDescription").value.trim();

    const file =
        $("productFile").files[0];


    if (!name || !price) {

        message(
            "productMessage",
            "Productnaam en prijs zijn verplicht."
        );

        return;

    }


    try {

        let imageURL = "";


        if (file) {

            const path =
                `products/${Date.now()}-${safeName(file.name)}`;


            const upload =
                await db
                    .storage
                    .from("photos")
                    .upload(
                        path,
                        file,
                        {
                            upsert: false
                        }
                    );


            if (upload.error)
                throw upload.error;


            imageURL =
                db
                    .storage
                    .from("photos")
                    .getPublicUrl(path)
                    .data
                    .publicUrl;

        }


        const result =
            await db
                .from("products")
                .insert({

                    name,

                    price,

                    description,

                    image_url:
                        imageURL

                });


        if (result.error)
            throw result.error;


        $("productName").value = "";

        $("productPrice").value = "";

        $("productDescription").value = "";

        $("productFile").value = "";


        message(
            "productMessage",
            "Product toegevoegd.",
            true
        );


        toast("Product toegevoegd");

        loadProducts();


    } catch (error) {

        message(
            "productMessage",
            error.message
        );

    }

}


async function loadProducts() {

    const result =
        await db
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
            errorHTML(
                result.error.message
            );

        return;

    }


    if (!result.data.length) {

        $("productsList").innerHTML =
            emptyHTML(
                "Nog geen producten."
            );

        return;

    }


    $("productsList").innerHTML =
        result.data
            .map(product => `

                <div class="media-card">

                    ${
                        product.image_url
                        ?
                        `
                        <img
                            src="${escapeHTML(
                                product.image_url
                            )}"
                            alt=""
                        >
                        `
                        :
                        ""
                    }

                    <div class="media-info">

                        <strong>
                            ${escapeHTML(
                                product.name
                            )}
                        </strong>

                        <small>
                            ${escapeHTML(
                                product.price
                            )}
                        </small>

                        <p>
                            ${escapeHTML(
                                product.description || ""
                            )}
                        </p>

                        <button
                            class="delete-button"
                            onclick="deleteRow('products', ${product.id})">
                            Verwijderen
                        </button>

                    </div>

                </div>

            `)
            .join("");

}


/* ==========================================
   BOEKINGEN
========================================== */

async function loadBookings() {

    const result =
        await db
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
            errorHTML(
                result.error.message
            );

        return;

    }


    if (!result.data.length) {

        $("bookingsList").innerHTML =
            emptyHTML(
                "Er zijn nog geen boekingsaanvragen."
            );

        return;

    }


    $("bookingsList").innerHTML =
        result.data
            .map(booking => `

                <div class="item">

                    <div class="item-main">

                        <strong>
                            ${escapeHTML(
                                booking.name
                            )}
                        </strong>

                        <small>
                            ✉ ${escapeHTML(
                                booking.email || ""
                            )}

                            <br>

                            📍 ${escapeHTML(
                                booking.location || ""
                            )}

                            <br>

                            📅 ${escapeHTML(
                                booking.event_date || ""
                            )}

                            <br><br>

                            ${escapeHTML(
                                booking.message || ""
                            )}
                        </small>

                    </div>

                    <button
                        class="delete-button"
                        onclick="deleteRow('bookings', ${booking.id})">
                        Verwijderen
                    </button>

                </div>

            `)
            .join("");

}


/* ==========================================
   VERWIJDEREN
========================================== */

async function deleteRow(
    table,
    id
) {

    const confirmed =
        confirm(
            "Weet je zeker dat je dit wilt verwijderen?"
        );


    if (!confirmed)
        return;


    const result =
        await db
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


    toast("Verwijderd");


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


    loadDashboard();

}


window.deleteRow =
    deleteRow;


/* ==========================================
   LOGO
========================================== */

$("saveLogoBtn").addEventListener(
    "click",
    saveLogo
);


async function saveLogo() {

    const file =
        $("logoFile").files[0];


    if (!file) {

        message(
            "logoMessage",
            "Kies eerst een logo."
        );

        return;

    }


    try {

        const path =
            `logo/logo-${Date.now()}-${safeName(file.name)}`;


        const upload =
            await db
                .storage
                .from("photos")
                .upload(
                    path,
                    file,
                    {
                        upsert: true
                    }
                );


        if (upload.error)
            throw upload.error;


        const url =
            db
                .storage
                .from("photos")
                .getPublicUrl(path)
                .data
                .publicUrl;


        localStorage.setItem(
            "misteryDuoLogo",
            url
        );


        $("logoPreview").src =
            url;


        message(
            "logoMessage",
            "Logo opgeslagen.",
            true
        );


        toast("Logo opgeslagen");


    } catch (error) {

        message(
            "logoMessage",
            error.message
        );

    }

}


/* ==========================================
   INITIALISEREN
========================================== */

async function initialise() {

    await testConnection();

    await loadDashboard();

    loadLogo();

}


function loadLogo() {

    const logo =
        localStorage.getItem(
            "misteryDuoLogo"
        );


    if (logo) {

        $("logoPreview").src =
            logo;

    }

}


/* ==========================================
   HULPFUNCTIES
========================================== */

function safeName(name) {

    return name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
    );

}


function emptyHTML(text) {

    return `
        <div class="item">
            <div class="item-main">
                <small>${escapeHTML(text)}</small>
            </div>
        </div>
    `;

}


function errorHTML(text) {

    return `
        <div class="item">
            <div class="item-main">
                <strong>Er is een probleem</strong>
                <small>${escapeHTML(text)}</small>
            </div>
        </div>
    `;

}


/* ==========================================
   AUTOMATISCH INLOGGEN
========================================== */

if (
    sessionStorage.getItem(
        "misteryDuoAdmin"
    ) === "true"
) {

    showAdmin();

}
