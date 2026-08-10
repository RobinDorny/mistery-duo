const SUPABASE_URL =
    "https://msvesugylaeffjqiizzm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable__cDajfEACOoUZ9xOU8ZtYQ_Q5XFtp5B";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


/* =========================
   HULPFUNCTIES
========================= */

const $ = (id) => document.getElementById(id);

function escapeHTML(value) {
    return String(value ?? "").replace(
        /[&<>"']/g,
        (char) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[char]
    );
}

function showToast(message) {
    const toast = $("toast");

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2200);
}

function showStatus(id, message, success = false) {
    const element = $(id);

    if (!element) return;

    element.textContent = message;
    element.className =
        "status " + (success ? "ok" : "error");
}


/* =========================
   PAGINA NAVIGATIE
========================= */

const pageTitles = {
    dashboard: "Dashboard",
    logo: "Logo beheren",
    live: "Livestream",
    videos: "Video's",
    events: "Optredens",
    news: "Nieuws",
    photos: "Foto's",
    merch: "Merchandise",
    bookings: "Boekingen"
};

document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => {
        showPage(button.dataset.page);
    });
});

function showPage(page) {

    document.querySelectorAll(".page").forEach((section) => {
        section.classList.remove("active");
    });

    const target = $(page);

    if (target) {
        target.classList.add("active");
    }

    document.querySelectorAll(".nav-btn").forEach((button) => {
        button.classList.toggle(
            "active",
            button.dataset.page === page
        );
    });

    $("pageTitle").textContent =
        pageTitles[page] || "Dashboard";

    if (page === "dashboard") loadCounts();
    if (page === "logo") loadLogo();
    if (page === "live") loadLive();
    if (page === "videos") loadVideos();
    if (page === "events") loadEvents();
    if (page === "news") loadNews();
    if (page === "photos") loadPhotos();
    if (page === "merch") loadProducts();
    if (page === "bookings") loadBookings();
}


/* =========================
   SUPABASE VERBINDING
========================= */

async function testConnection() {

    const { error } = await db
        .from("events")
        .select("id")
        .limit(1);

    const connection =
        document.querySelector(".connection");

    if (!error) {
        connection.classList.add("ok");
        $("connectionText").textContent =
            "Online verbonden";
    } else {
        connection.classList.remove("ok");
        $("connectionText").textContent =
            "Verbinding controleren";
    }
}


/* =========================
   DASHBOARD
========================= */

async function getCount(table) {

    const { count, error } = await db
        .from(table)
        .select("*", {
            count: "exact",
            head: true
        });

    if (error) {
        return 0;
    }

    return count || 0;
}

async function loadCounts() {

    $("countVideos").textContent =
        await getCount("videos");

    $("countEvents").textContent =
        await getCount("events");

    $("countNews").textContent =
        await getCount("news");

    $("countBookings").textContent =
        await getCount("bookings");
}


/* =========================
   LOGO
========================= */

function loadLogo() {

    const savedLogo =
        localStorage.getItem("misteryDuo_logoUrl");

    const defaultLogo =
        "assets/mistery-duo-logo.jpg";

    const logo =
        savedLogo || defaultLogo;

    $("logoPreview").src = logo;
    $("sidebarLogo").src = logo;
    $("dashboardLogo").src = logo;
}

$("logoFile").addEventListener("change", (event) => {

    const file = event.target.files[0];

    if (!file) return;

    $("logoPreview").src =
        URL.createObjectURL(file);
});


async function uploadFile(
    bucket,
    file,
    path
) {

    const { error } =
        await db.storage
            .from(bucket)
            .upload(
                path,
                file,
                {
                    upsert: true,
                    contentType: file.type
                }
            );

    if (error) {
        throw error;
    }

    return getPublicURL(bucket, path);
}


function getPublicURL(bucket, path) {

    return (
        SUPABASE_URL +
        "/storage/v1/object/public/" +
        bucket +
        "/" +
        encodeURIComponent(path)
            .replace(/%2F/g, "/")
    );
}


$("uploadLogo").addEventListener(
    "click",
    async () => {

        const file =
            $("logoFile").files[0];

        if (!file) {
            showStatus(
                "logoStatus",
                "Kies eerst een logo."
            );
            return;
        }

        try {

            const cleanName =
                file.name.replace(
                    /[^a-z0-9._-]/gi,
                    "_"
                );

            const path =
                `site/logo-${Date.now()}-${cleanName}`;

            const url =
                await uploadFile(
                    "photos",
                    file,
                    path
                );

            localStorage.setItem(
                "misteryDuo_logoUrl",
                url
            );

            loadLogo();

            showStatus(
                "logoStatus",
                "Logo succesvol opgeslagen.",
                true
            );

            showToast(
                "Logo opgeslagen"
            );

        } catch (error) {

            showStatus(
                "logoStatus",
                "Upload mislukt: " +
                error.message
            );
        }
    }
);


$("resetLogo").addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "misteryDuo_logoUrl"
        );

        loadLogo();

        showToast(
            "Standaard logo ingesteld"
        );
    }
);


/* =========================
   LIVESTREAM
========================= */

function getYouTubeID(url) {

    const match = String(url).match(
        /(?:v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/)([^&?\/\s]+)/
    );

    return match
        ? match[1]
        : null;
}


async function loadLive() {

    const { data, error } =
        await db
            .from("news")
            .select("id,content")
            .eq(
                "title",
                "__MISTERY_DUO_LIVE__"
            )
            .maybeSingle();

    if (error || !data) {
        return;
    }

    try {

        const settings =
            JSON.parse(data.content);

        $("liveUrl").value =
            settings.url || "";

        if (
            settings.active &&
            getYouTubeID(settings.url)
        ) {

            showLivePreview(
                settings.url
            );
        }

    } catch {
        console.log(
            "Livestream-instellingen konden niet worden gelezen."
        );
    }
}


function showLivePreview(url) {

    const id =
        getYouTubeID(url);

    if (!id) return;

    $("livePreview").innerHTML = `
        <iframe
            src="https://www.youtube.com/embed/${id}"
            allowfullscreen>
        </iframe>
    `;
}


async function saveLive(active) {

    const url =
        $("liveUrl").value.trim();

    if (
        active &&
        !getYouTubeID(url)
    ) {

        showStatus(
            "liveStatus",
            "Gebruik een geldige YouTube-link."
        );

        return;
    }

    const content =
        JSON.stringify({
            url: url,
            active: active
        });

    const { data: existing } =
        await db
            .from("news")
            .select("id")
            .eq(
                "title",
                "__MISTERY_DUO_LIVE__"
            )
            .maybeSingle();

    let result;

    if (existing) {

        result =
            await db
                .from("news")
                .update({
                    content: content
                })
                .eq(
                    "id",
                    existing.id
                );

    } else {

        result =
            await db
                .from("news")
                .insert({
                    title:
                        "__MISTERY_DUO_LIVE__",
                    content:
                        content
                });
    }

    if (result.error) {

        showStatus(
            "liveStatus",
            result.error.message
        );

        return;
    }

    if (active) {
        showLivePreview(url);
    } else {
        $("livePreview").innerHTML = "";
    }

    showStatus(
        "liveStatus",
        active
            ? "Livestream staat online."
            : "Livestream staat uit.",
        true
    );

    showToast(
        "Livestream bijgewerkt"
    );
}


$("saveLive").addEventListener(
    "click",
    () => saveLive(true)
);

$("disableLive").addEventListener(
    "click",
    () => saveLive(false)
);


/* =========================
   VIDEO'S
========================= */

$("uploadVideo").addEventListener(
    "click",
    async () => {

        const file =
            $("videoFile").files[0];

        const title =
            $("videoTitle").value.trim();

        if (!file || !title) {

            showStatus(
                "videoStatus",
                "Titel en video zijn verplicht."
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

                    showStatus(
                        "videoStatus",
                        "De video mag maximaal 1 minuut zijn."
                    );

                    return;
                }

                try {

                    const filename =
                        file.name.replace(
                            /[^a-z0-9._-]/gi,
                            "_"
                        );

                    const path =
                        `videos/${Date.now()}-${filename}`;

                    const url =
                        await uploadFile(
                            "videos",
                            file,
                            path
                        );

                    const { error } =
                        await db
                            .from("videos")
                            .insert({
                                title: title,
                                video_url: url
                            });

                    if (error) {
                        throw error;
                    }

                    $("videoTitle").value = "";
                    $("videoFile").value = "";

                    showStatus(
                        "videoStatus",
                        "Video online gepubliceerd.",
                        true
                    );

                    showToast(
                        "Video gepubliceerd"
                    );

                    loadVideos();
                    loadCounts();

                } catch (error) {

                    showStatus(
                        "videoStatus",
                        "Upload mislukt: " +
                        error.message
                    );
                }
            };

        video.src =
            URL.createObjectURL(file);
    }
);


async function loadVideos() {

    const { data, error } =
        await db
            .from("videos")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        $("videoList").innerHTML =
            `<div class="empty">
                ${escapeHTML(error.message)}
            </div>`;

        return;
    }

    if (!data.length) {

        $("videoList").innerHTML =
            `<div class="empty">
                Nog geen video's.
            </div>`;

        return;
    }

    $("videoList").innerHTML =
        data.map(video => `

            <div class="media-card">

                <video
                    src="${escapeHTML(video.video_url)}"
                    controls>
                </video>

                <div class="media-info">
                    <strong>
                        ${escapeHTML(video.title)}
                    </strong>
                </div>

                <button
                    class="delete"
                    onclick="deleteItem('videos', ${video.id})">
                    Verwijderen
                </button>

            </div>

        `).join("");
}


/* =========================
   OPTREDENS
========================= */

$("addEvent").addEventListener(
    "click",
    async () => {

        const event = {
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
            !event.name ||
            !event.location ||
            !event.event_date
        ) {

            showStatus(
                "eventStatus",
                "Vul naam, locatie en datum in."
            );

            return;
        }

        const { error } =
            await db
                .from("events")
                .insert(event);

        if (error) {

            showStatus(
                "eventStatus",
                error.message
            );

            return;
        }

        $("eventName").value = "";
        $("eventLocation").value = "";
        $("eventDate").value = "";
        $("eventTime").value = "";

        showStatus(
            "eventStatus",
            "Optreden gepubliceerd.",
            true
        );

        showToast(
            "Optreden toegevoegd"
        );

        loadEvents();
        loadCounts();
    }
);


async function loadEvents() {

    const { data, error } =
        await db
            .from("events")
            .select("*")
            .order(
                "event_date",
                {
                    ascending: true
                }
            );

    if (error) {

        $("eventList").innerHTML =
            `<div class="empty">
                ${escapeHTML(error.message)}
            </div>`;

        return;
    }

    if (!data.length) {

        $("eventList").innerHTML =
            `<div class="empty">
                Nog geen optredens.
            </div>`;

        return;
    }

    $("eventList").innerHTML =
        data.map(event => `

            <div class="row">

                <div>
                    <strong>
                        ${escapeHTML(event.name)}
                    </strong>

                    <small>
                        📍 ${escapeHTML(event.location)}
                        · ${escapeHTML(event.event_date)}
                        · ${escapeHTML(event.event_time || "")}
                    </small>
                </div>

                <button
                    class="delete"
                    onclick="deleteItem('events', ${event.id})">
                    Verwijderen
                </button>

            </div>

        `).join("");
}


/* =========================
   NIEUWS
========================= */

$("addNews").addEventListener(
    "click",
    async () => {

        const title =
            $("newsTitle").value.trim();

        const content =
            $("newsContent").value.trim();

        if (!title || !content) {

            showStatus(
                "newsStatus",
                "Titel en bericht zijn verplicht."
            );

            return;
        }

        const { error } =
            await db
                .from("news")
                .insert({
                    title,
                    content
                });

        if (error) {

            showStatus(
                "newsStatus",
                error.message
            );

            return;
        }

        $("newsTitle").value = "";
        $("newsContent").value = "";

        showStatus(
            "newsStatus",
            "Nieuws gepubliceerd.",
            true
        );

        showToast(
            "Nieuws gepubliceerd"
        );

        loadNews();
        loadCounts();
    }
);


async function loadNews() {

    const { data, error } =
        await db
            .from("news")
            .select("*")
            .neq(
                "title",
                "__MISTERY_DUO_LIVE__"
            )
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        $("newsList").innerHTML =
            `<div class="empty">
                ${escapeHTML(error.message)}
            </div>`;

        return;
    }

    if (!data.length) {

        $("newsList").innerHTML =
            `<div class="empty">
                Nog geen nieuws.
            </div>`;

        return;
    }

    $("newsList").innerHTML =
        data.map(news => `

            <div class="row">

                <div>
                    <strong>
                        ${escapeHTML(news.title)}
                    </strong>

                    <small>
                        ${escapeHTML(
                            news.content
                        ).slice(0, 180)}
                    </small>
                </div>

                <button
                    class="delete"
                    onclick="deleteItem('news', ${news.id})">
                    Verwijderen
                </button>

            </div>

        `).join("");
}


/* =========================
   FOTO'S
========================= */

$("uploadPhoto").addEventListener(
    "click",
    async () => {

        const file =
            $("photoFile").files[0];

        const title =
            $("photoTitle").value.trim();

        if (!file) {

            showStatus(
                "photoStatus",
                "Kies eerst een foto."
            );

            return;
        }

        try {

            const filename =
                file.name.replace(
                    /[^a-z0-9._-]/gi,
                    "_"
                );

            const path =
                `photos/${Date.now()}-${filename}`;

            const url =
                await uploadFile(
                    "photos",
                    file,
                    path
                );

            const { error } =
                await db
                    .from("photos")
                    .insert({
                        title: title,
                        image_url: url
                    });

            if (error) {
                throw error;
            }

            $("photoFile").value = "";
            $("photoTitle").value = "";

            showStatus(
                "photoStatus",
                "Foto online gepubliceerd.",
                true
            );

            showToast(
                "Foto gepubliceerd"
            );

            loadPhotos();

        } catch (error) {

            showStatus(
                "photoStatus",
                "Upload mislukt: " +
                error.message
            );
        }
    }
);


async function loadPhotos() {

    const { data, error } =
        await db
            .from("photos")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        $("photoList").innerHTML =
            `<div class="empty">
                ${escapeHTML(error.message)}
            </div>`;

        return;
    }

    if (!data.length) {

        $("photoList").innerHTML =
            `<div class="empty">
                Nog geen foto's.
            </div>`;

        return;
    }

    $("photoList").innerHTML =
        data.map(photo => `

            <div class="media-card">

                <img
                    src="${escapeHTML(photo.image_url)}"
                    alt="${escapeHTML(photo.title || "Foto")}">

                <div class="media-info">

                    <strong>
                        ${escapeHTML(
                            photo.title || "Foto"
                        )}
                    </strong>

                </div>

                <button
                    class="delete"
                    onclick="deleteItem('photos', ${photo.id})">
                    Verwijderen
                </button>

            </div>

        `).join("");
}


/* =========================
   MERCHANDISE
========================= */

$("addProduct").addEventListener(
    "click",
    async () => {

        const name =
            $("productName").value.trim();

        const price =
            $("productPrice").value.trim();

        const description =
            $("productDescription").value.trim();

        const file =
            $("productImage").files[0];

        if (!name || !price) {

            showStatus(
                "productStatus",
                "Naam en prijs zijn verplicht."
            );

            return;
        }

        try {

            let image_url = null;

            if (file) {

                const filename =
                    file.name.replace(
                        /[^a-z0-9._-]/gi,
                        "_"
                    );

                image_url =
                    await uploadFile(
                        "photos",
                        file,
                        `merch/${Date.now()}-${filename}`
                    );
            }

            const { error } =
                await db
                    .from("products")
                    .insert({
                        name,
                        price,
                        description,
                        image_url
                    });

            if (error) {
                throw error;
            }

            $("productName").value = "";
            $("productPrice").value = "";
            $("productDescription").value = "";
            $("productImage").value = "";

            showStatus(
                "productStatus",
                "Product toegevoegd.",
                true
            );

            showToast(
                "Product toegevoegd"
            );

            loadProducts();

        } catch (error) {

            showStatus(
                "productStatus",
                "Mislukt: " +
                error.message
            );
        }
    }
);


async function loadProducts() {

    const { data, error } =
        await db
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        $("productList").innerHTML =
            `<div class="empty">
                ${escapeHTML(error.message)}
            </div>`;

        return;
    }

    if (!data.length) {

        $("productList").innerHTML =
            `<div class="empty">
                Nog geen producten.
            </div>`;

        return;
    }

    $("productList").innerHTML =
        data.map(product => `

            <div class="media-card">

                ${
                    product.image_url
                        ? `<img
                            src="${escapeHTML(
                                product.image_url
                            )}"
                            alt="">`
                        : ""
                }

                <div class="media-info">

                    <strong>
                        ${escapeHTML(
                            product.name
                        )}
                    </strong>

                    <small>
                        € ${escapeHTML(
                            product.price
                        )}
                    </small>

                    <p>
                        ${escapeHTML(
                            product.description || ""
                        )}
                    </p>

                </div>

                <button
                    class="delete"
                    onclick="deleteItem('products', ${product.id})">
                    Verwijderen
                </button>

            </div>

        `).join("");
}


/* =========================
   BOEKINGEN
========================= */

async function loadBookings() {

    const { data, error } =
        await db
            .from("bookings")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );

    if (error) {

        $("bookingList").innerHTML =
            `<div class="empty">
                ${escapeHTML(error.message)}
            </div>`;

        return;
    }

    if (!data.length) {

        $("bookingList").innerHTML =
            `<div class="empty">
                Nog geen boekingsaanvragen.
            </div>`;

        return;
    }

    $("bookingList").innerHTML =
        data.map(booking => `

            <div class="booking">

                <h3>
                    ${escapeHTML(
                        booking.name
                    )}
                </h3>

                <div class="meta">
                    ${escapeHTML(
                        booking.email
                    )}
                    ·
                    ${escapeHTML(
                        booking.event_date
                    )}
                    ·
                    ${escapeHTML(
                        booking.location
                    )}
                </div>

                <p>
                    ${escapeHTML(
                        booking.message || ""
                    )}
                </p>

                <button
                    class="delete"
                    onclick="deleteItem('bookings', ${booking.id})">
                    Aanvraag verwijderen
                </button>

            </div>

        `).join("");
}


/* =========================
   VERWIJDEREN
========================= */

async function deleteItem(
    table,
    id
) {

    const confirmed =
        confirm(
            "Weet je zeker dat je dit wilt verwijderen?"
        );

    if (!confirmed) return;

    const { error } =
        await db
            .from(table)
            .delete()
            .eq("id", id);

    if (error) {

        alert(
            "Verwijderen mislukt: " +
            error.message
        );

        return;
    }

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

    showToast(
        "Item verwijderd"
    );
}

window.deleteItem = deleteItem;


/* =========================
   START
========================= */

loadLogo();
testConnection();
loadCounts();
loadVideos();
loadEvents();
loadNews();
loadPhotos();
loadProducts();
loadBookings();
loadLive();
