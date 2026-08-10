/* =========================================================
   MISTERY DUO — BEHEERPLATFORM
   ========================================================= */


/* ================================
   SUPABASE
================================ */

const SUPABASE_URL =
    "https://msvesugylaeffjqiizzm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable__cDajfEACOoUZ9xOUZtYQ_Q5XFtp5B";

const db =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


/* ================================
   HELPERS
================================ */

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


function showStatus(
    id,
    text,
    success = false
) {

    const element = $(id);

    if (!element) return;

    element.textContent = text;

    element.className =
        "status " +
        (success ? "ok" : "error");
}


function toast(text) {

    const element =
        $("toast");

    if (!element) return;

    element.textContent =
        text;

    element.classList.add("show");

    setTimeout(() => {

        element.classList.remove("show");

    }, 2600);
}


/* ================================
   NAVIGATION
================================ */

const titles = {

    dashboard:
        "Dashboard",

    logo:
        "Logo beheren",

    live:
        "Livestream",

    videos:
        "Video's",

    events:
        "Optredens",

    news:
        "Nieuws",

    photos:
        "Foto's",

    merch:
        "Merchandise",

    bookings:
        "Boekingen"

};


document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    button.dataset.page
                );

            }
        );

    });


function showPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    const target =
        $(page);

    if (!target) return;


    target.classList.add(
        "active"
    );


    document
        .querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });


    $("pageTitle").textContent =
        titles[page] || "Dashboard";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (page === "dashboard")
        refreshDashboard();

    if (page === "logo")
        loadLogo();

    if (page === "live")
        loadLive();

    if (page === "videos")
        loadVideos();

    if (page === "events")
        loadEvents();

    if (page === "news")
        loadNews();

    if (page === "photos")
        loadPhotos();

    if (page === "merch")
        loadProducts();

    if (page === "bookings")
        loadBookings();

}


window.showPage =
    showPage;


/* ================================
   CONNECTION
================================ */

async function testConnection() {

    const connection =
        $("connection");

    const text =
        $("connectionText");

    const sideDot =
        $("sideStatusDot");

    const sideText =
        $("sideStatusText");


    try {

        const { error } =
            await db
                .from("events")
                .select("id")
                .limit(1);


        if (error)
            throw error;


        connection.classList.add(
            "online"
        );

        text.textContent =
            "Online verbonden";


        sideDot.classList.add(
            "online"
        );

        sideText.textContent =
            "Online verbonden";


    } catch (error) {

        console.error(
            "Supabase:",
            error
        );


        text.textContent =
            "Database fout";


        sideText.textContent =
            "Database controleren";

    }

}


/* ================================
   COUNTERS
================================ */

async function getCount(
    table
) {

    try {

        const {
            count,
            error
        } =
            await db
                .from(table)
                .select(
                    "*",
                    {
                        count:
                            "exact",
                        head:
                            true
                    }
                );


        if (error)
            throw error;


        return count || 0;

    } catch (error) {

        console.error(
            table,
            error
        );

        return 0;

    }

}


async function refreshDashboard() {

    const [
        videos,
        events,
        news,
        bookings
    ] = await Promise.all([

        getCount("videos"),

        getCount("events"),

        getCount("news"),

        getCount("bookings")

    ]);


    $("countVideos").textContent =
        videos;

    $("countEvents").textContent =
        events;

    $("countNews").textContent =
        news;

    $("countBookings").textContent =
        bookings;

}


/* ================================
   STORAGE
================================ */

function publicURL(
    bucket,
    path
) {

    return (
        SUPABASE_URL +
        "/storage/v1/object/public/" +
        bucket +
        "/" +
        path
            .split("/")
            .map(encodeURIComponent)
            .join("/")
    );

}


async function uploadFile(
    bucket,
    file,
    path
) {

    const {
        error
    } =
        await db
            .storage
            .from(bucket)
            .upload(
                path,
                file,
                {
                    upsert: true,
                    contentType:
                        file.type
                }
            );


    if (error)
        throw error;


    return publicURL(
        bucket,
        path
    );

}


/* ================================
   LOGO
================================ */

const DEFAULT_LOGO =
    "assets/mistery-duo-logo.jpg";


function getSavedLogo() {

    return (
        localStorage.getItem(
            "misteryDuoLogo"
        ) ||
        DEFAULT_LOGO
    );

}


function applyLogo(url) {

    const logo =
        url ||
        getSavedLogo();


    [
        "sidebarLogo",
        "dashboardLogo",
        "logoPreview"
    ].forEach(id => {

        const image =
            $(id);

        if (image)
            image.src = logo;

    });

}


function loadLogo() {

    applyLogo();

}


$("logoFile").addEventListener(
    "change",
    event => {

        const file =
            event.target.files[0];

        if (!file) return;


        $("logoPreview").src =
            URL.createObjectURL(
                file
            );

    }
);


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

            const safeName =
                file.name.replace(
                    /[^a-z0-9._-]/gi,
                    "_"
                );


            const path =
                "site/logo-" +
                Date.now() +
                "-" +
                safeName;


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


            applyLogo(url);


            $("logoFile").value =
                "";


            showStatus(
                "logoStatus",
                "Logo succesvol opgeslagen.",
                true
            );


            toast(
                "Logo opgeslagen"
            );


        } catch (error) {

            console.error(error);


            showStatus(
                "logoStatus",
                "Logo upload mislukt: " +
                error.message
            );

        }

    }
);


$("resetLogo").addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "misteryDuoLogo"
        );


        applyLogo(
            DEFAULT_LOGO
        );


        showStatus(
            "logoStatus",
            "Standaardlogo hersteld.",
            true
        );


        toast(
            "Standaardlogo hersteld"
        );

    }
);


/* ================================
   YOUTUBE
================================ */

function youtubeID(
    url
) {

    const value =
        String(url || "")
            .trim();


    const match =
        value.match(
            /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([^&?\/\s]+)/
        );


    return match
        ? match[1]
        : null;

}


/* ================================
   LIVESTREAM
================================ */

async function loadLive() {

    try {

        const {
            data,
            error
        } =
            await db
                .from("settings")
                .select("*")
                .eq(
                    "key",
                    "livestream"
                )
                .maybeSingle();


        if (error)
            throw error;


        if (!data) {

            $("liveUrl").value =
                "";

            showLivePreview(
                null,
                false
            );

            return;

        }


        const url =
            data.value || "";


        const active =
            data.active === true;


        $("liveUrl").value =
            url;


        showLivePreview(
            url,
            active
        );


    } catch (error) {

        console.error(error);


        showStatus(
            "liveStatus",
            "Livestream laden mislukt: " +
            error.message
        );

    }

}


function showLivePreview(
    url,
    active
) {

    const id =
        youtubeID(url);


    const preview =
        $("livePreview");


    const dashboard =
        $("dashboardLivePreview");


    const dashboardStatus =
        $("dashboardLiveStatus");


    if (
        active &&
        id
    ) {

        const iframe =
            `
            <iframe
                src="https://www.youtube.com/embed/${escapeHTML(id)}"
                title="Mistery Duo livestream"
                allow="autoplay; encrypted-media"
                allowfullscreen>
            </iframe>
            `;


        preview.innerHTML =
            iframe;


        dashboard.innerHTML =
            iframe;


        dashboardStatus.textContent =
            "LIVE";

        dashboardStatus.className =
            "status-pill online";


    } else {

        preview.innerHTML =
            `
            <div class="preview-placeholder">
                Geen actieve livestream.
            </div>
            `;


        dashboard.innerHTML =
            "Geen livestream actief";


        dashboardStatus.textContent =
            "OFFLINE";

        dashboardStatus.className =
            "status-pill offline";

    }

}


async function saveLive(
    active
) {

    const url =
        $("liveUrl")
            .value
            .trim();


    if (
        active &&
        !youtubeID(url)
    ) {

        showStatus(
            "liveStatus",
            "Gebruik een geldige YouTube-link."
        );

        return;

    }


    try {

        const {
            error
        } =
            await db
                .from("settings")
                .upsert(
                    {
                        key:
                            "livestream",

                        value:
                            url,

                        active:
                            active
                    },
                    {
                        onConflict:
                            "key"
                    }
                );


        if (error)
            throw error;


        showLivePreview(
            url,
            active
        );


        showStatus(
            "liveStatus",
            active
                ? "Livestream is actief."
                : "Livestream is uitgezet.",
            true
        );


        toast(
            active
                ? "Livestream actief"
                : "Livestream uitgezet"
        );


    } catch (error) {

        console.error(error);


        showStatus(
            "liveStatus",
            "Opslaan mislukt: " +
            error.message
        );

    }

}


$("saveLive").addEventListener(
    "click",
    () => saveLive(true)
);


$("disableLive").addEventListener(
    "click",
    () => saveLive(false)
);


/* ================================
   VIDEO'S
================================ */

$("uploadVideo").addEventListener(
    "click",
    async () => {

        const file =
            $("videoFile")
                .files[0];

        const title =
            $("videoTitle")
                .value
                .trim();


        if (!file || !title) {

            showStatus(
                "videoStatus",
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
            async () => {

                URL.revokeObjectURL(
                    video.src
                );


                if (
                    video.duration >
                    60
                ) {

                    showStatus(
                        "videoStatus",
                        "Deze video is langer dan 1 minuut."
                    );

                    return;

                }


                try {

                    const safeName =
                        file.name.replace(
                            /[^a-z0-9._-]/gi,
                            "_"
                        );


                    const path =
                        "videos/" +
                        Date.now() +
                        "-" +
                        safeName;


                    showStatus(
                        "videoStatus",
                        "Video uploaden..."
                    );


                    const url =
                        await uploadFile(
                            "videos",
                            file,
                            path
                        );


                    const {
                        error
                    } =
                        await db
                            .from("videos")
                            .insert(
                                {
                                    title:
                                        title,

                                    video_url:
                                        url
                                }
                            );


                    if (error)
                        throw error;


                    $("videoTitle").value =
                        "";

                    $("videoFile").value =
                        "";


                    showStatus(
                        "videoStatus",
                        "Video succesvol gepubliceerd.",
                        true
                    );


                    toast(
                        "Video gepubliceerd"
                    );


                    loadVideos();

                    refreshDashboard();

                } catch (error) {

                    console.error(error);


                    showStatus(
                        "videoStatus",
                        "Upload mislukt: " +
                        error.message
                    );

                }

            };


        video.onerror =
            () => {

                showStatus(
                    "videoStatus",
                    "De video kan niet worden gelezen."
                );

            };


        video.src =
            URL.createObjectURL(
                file
            );

    }
);


async function loadVideos() {

    const {
        data,
        error
    } =
        await db
            .from("videos")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (error) {

        $("videoList").innerHTML =
            `
            <div class="empty">
                ${escapeHTML(
                    error.message
                )}
            </div>
            `;

        return;

    }


    $("videoTotal").textContent =
        data.length;


    if (!data.length) {

        $("videoList").innerHTML =
            `
            <div class="empty">
                Nog geen video's gepubliceerd.
            </div>
            `;

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
                    class="delete-btn"
                    onclick="deleteItem('videos', ${video.id})">
                    Verwijderen
                </button>

            </div>

        `).join("");

}


/* ================================
   OPTREDENS
================================ */

$("addEvent").addEventListener(
    "click",
    async () => {

        const row = {

            name:
                $("eventName")
                    .value
                    .trim(),

            location:
                $("eventLocation")
                    .value
                    .trim(),

            event_date:
                $("eventDate")
                    .value,

            event_time:
                $("eventTime")
                    .value

        };


        if (
            !row.name ||
            !row.location ||
            !row.event_date
        ) {

            showStatus(
                "eventStatus",
                "Naam, locatie en datum zijn verplicht."
            );

            return;

        }


        try {

            const {
                error
            } =
                await db
                    .from("events")
                    .insert(row);


            if (error)
                throw error;


            [
                "eventName",
                "eventLocation",
                "eventDate",
                "eventTime"
            ].forEach(id => {

                $(id).value =
                    "";

            });


            showStatus(
                "eventStatus",
                "Optreden gepubliceerd.",
                true
            );


            toast(
                "Optreden toegevoegd"
            );


            loadEvents();

            refreshDashboard();


        } catch (error) {

            console.error(error);


            showStatus(
                "eventStatus",
                "Opslaan mislukt: " +
                error.message
            );

        }

    }
);


async function loadEvents() {

    const {
        data,
        error
    } =
        await db
            .from("events")
            .select("*")
            .order(
                "event_date",
                {
                    ascending:
                        true
                }
            );


    if (error) {

        $("eventList").innerHTML =
            `
            <div class="empty">
                ${escapeHTML(error.message)}
            </div>
            `;

        return;

    }


    if (!data.length) {

        $("eventList").innerHTML =
            `
            <div class="empty">
                Nog geen optredens.
            </div>
            `;

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
                        📍
                        ${escapeHTML(event.location)}
                        ·
                        ${escapeHTML(event.event_date)}
                        ${event.event_time
                            ? " · " +
                              escapeHTML(
                                  event.event_time
                              )
                            : ""}
                    </small>

                </div>

                <button
                    class="delete-btn"
                    onclick="deleteItem('events', ${event.id})">
                    Verwijderen
                </button>

            </div>

        `).join("");

}


/* ================================
   NIEUWS
================================ */

$("addNews").addEventListener(
    "click",
    async () => {

        const title =
            $("newsTitle")
                .value
                .trim();

        const content =
            $("newsContent")
                .value
                .trim();


        if (!title || !content) {

            showStatus(
                "newsStatus",
                "Titel en bericht zijn verplicht."
            );

            return;

        }


        try {

            const {
                error
            } =
                await db
                    .from("news")
                    .insert(
                        {
                            title,
                            content
                        }
                    );


            if (error)
                throw error;


            $("newsTitle").value =
                "";

            $("newsContent").value =
                "";


            showStatus(
                "newsStatus",
                "Nieuws gepubliceerd.",
                true
            );


            toast(
                "Nieuws gepubliceerd"
            );


            loadNews();

            refreshDashboard();


        } catch (error) {

            console.error(error);


            showStatus(
                "newsStatus",
                "Publiceren mislukt: " +
                error.message
            );

        }

    }
);


async function loadNews() {

    const {
        data,
        error
    } =
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
                    ascending:
                        false
                }
            );


    if (error) {

        $("newsList").innerHTML =
            `
            <div class="empty">
                ${escapeHTML(error.message)}
            </div>
            `;

        return;

    }


    if (!data.length) {

        $("newsList").innerHTML =
            `
            <div class="empty">
                Nog geen nieuws.
            </div>
            `;

        return;

    }


    $("newsList").innerHTML =
        data.map(item => `

            <div class="row">

                <div>

                    <strong>
                        ${escapeHTML(item.title)}
                    </strong>

                    <small>
                        ${escapeHTML(
                            item.content
                        ).slice(0, 180)}
                    </small>

                </div>

                <button
                    class="delete-btn"
                    onclick="deleteItem('news', ${item.id})">
                    Verwijderen
                </button>

            </div>

        `).join("");

}


/* ================================
   FOTO'S
================================ */

$("uploadPhoto").addEventListener(
    "click",
    async () => {

        const file =
            $("photoFile")
                .files[0];

        const title =
            $("photoTitle")
                .value
                .trim();


        if (!file) {

            showStatus(
                "photoStatus",
                "Kies eerst een foto."
            );

            return;

        }


        try {

            const safeName =
                file.name.replace(
                    /[^a-z0-9._-]/gi,
                    "_"
                );


            const path =
                "photos/" +
                Date.now() +
                "-" +
                safeName;


            const url =
                await uploadFile(
                    "photos",
                    file,
                    path
                );


            const {
                error
            } =
                await db
                    .from("photos")
                    .insert(
                        {
                            title,
                            image_url:
                                url
                        }
                    );


            if (error)
                throw error;


            $("photoFile").value =
                "";

            $("photoTitle").value =
                "";


            showStatus(
                "photoStatus",
                "Foto gepubliceerd.",
                true
            );


            toast(
                "Foto gepubliceerd"
            );


            loadPhotos();

        } catch (error) {

            console.error(error);


            showStatus(
                "photoStatus",
                "Upload mislukt: " +
                error.message
            );

        }

    }
);


async function loadPhotos() {

    const {
        data,
        error
    } =
        await db
            .from("photos")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (error) {

        $("photoList").innerHTML =
            `
            <div class="empty">
                ${escapeHTML(error.message)}
            </div>
            `;

        return;

    }


    if (!data.length) {

        $("photoList").innerHTML =
            `
            <div class="empty">
                Nog geen foto's.
            </div>
            `;

        return;

    }


    $("photoList").innerHTML =
        data.map(photo => `

            <div class="media-card">

                <img
                    src="${escapeHTML(photo.image_url)}"
                    alt="${escapeHTML(photo.title || "Foto")}"
                >

                <div class="media-info">

                    <strong>
                        ${escapeHTML(
                            photo.title ||
                            "Foto"
                        )}
                    </strong>

                </div>

                <button
                    class="delete-btn"
                    onclick="deleteItem('photos', ${photo.id})">
                    Verwijderen
                </button>

            </div>

        `).join("");

}


/* ================================
   MERCHANDISE
================================ */

$("addProduct").addEventListener(
    "click",
    async () => {

        const name =
            $("productName")
                .value
                .trim();

        const price =
            $("productPrice")
                .value
                .trim();

        const description =
            $("productDescription")
                .value
                .trim();

        const file =
            $("productImage")
                .files[0];


        if (!name || !price) {

            showStatus(
                "productStatus",
                "Naam en prijs zijn verplicht."
            );

            return;

        }


        try {

            let image_url =
                null;


            if (file) {

                const safeName =
                    file.name.replace(
                        /[^a-z0-9._-]/gi,
                        "_"
                    );


                image_url =
                    await uploadFile(
                        "photos",
                        file,
                        "merch/" +
                        Date.now() +
                        "-" +
                        safeName
                    );

            }


            const {
                error
            } =
                await db
                    .from("products")
                    .insert(
                        {
                            name,
                            price,
                            description,
                            image_url
                        }
                    );


            if (error)
                throw error;


            [
                "productName",
                "productPrice",
                "productDescription",
                "productImage"
            ].forEach(id => {

                $(id).value =
                    "";

            });


            showStatus(
                "productStatus",
                "Product toegevoegd.",
                true
            );


            toast(
                "Product toegevoegd"
            );


            loadProducts();


        } catch (error) {

            console.error(error);


            showStatus(
                "productStatus",
                "Opslaan mislukt: " +
                error.message
            );

        }

    }
);


async function loadProducts() {

    const {
        data,
        error
    } =
        await db
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (error) {

        $("productList").innerHTML =
            `
            <div class="empty">
                ${escapeHTML(error.message)}
            </div>
            `;

        return;

    }


    if (!data.length) {

        $("productList").innerHTML =
            `
            <div class="empty">
                Nog geen producten.
            </div>
            `;

        return;

    }


    $("productList").innerHTML =
        data.map(product => `

            <div class="media-card">

                ${
                    product.image_url
                        ?
                        `
                        <img
                            src="${escapeHTML(product.image_url)}"
                            alt="${escapeHTML(product.name)}"
                        >
                        `
                        :
                        `
                        <div class="empty">
                            Geen foto
                        </div>
                        `
                }

                <div class="media-info">

                    <strong>
                        ${escapeHTML(product.name)}
                    </strong>

                    <small>
                        € ${escapeHTML(product.price)}
                    </small>

                    <p>
                        ${escapeHTML(
                            product.description ||
                            ""
                        )}
                    </p>

                </div>

                <button
                    class="delete-btn"
                    onclick="deleteItem('products', ${product.id})">
                    Verwijderen
                </button>

            </div>

        `).join("");

}


/* ================================
   BOEKINGEN
================================ */

async function loadBookings() {

    const {
        data,
        error
    } =
        await db
            .from("bookings")
            .select("*")
            .order(
                "created_at",
                {
                    ascending:
                        false
                }
            );


    if (error) {

        $("bookingList").innerHTML =
            `
            <div class="empty">
                ${escapeHTML(error.message)}
            </div>
            `;

        return;

    }


    if (!data.length) {

        $("bookingList").innerHTML =
            `
            <div class="empty">
                Nog geen boekingsaanvragen.
            </div>
            `;

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

                <div class="booking-meta">

                    ${escapeHTML(
                        booking.email ||
                        ""
                    )}

                    ${
                        booking.event_date
                        ? " · " +
                          escapeHTML(
                              booking.event_date
                          )
                        : ""
                    }

                    ${
                        booking.location
                        ? " · " +
                          escapeHTML(
                              booking.location
                          )
                        : ""
                    }

                </div>

                <p>
                    ${escapeHTML(
                        booking.message ||
                        ""
                    )}
                </p>

                <button
                    class="delete-btn"
                    onclick="deleteItem('bookings', ${booking.id})">
                    Aanvraag verwijderen
                </button>

            </div>

        `).join("");

}


/* ================================
   VERWIJDEREN
================================ */

async function deleteItem(
    table,
    id
) {

    const confirmed =
        confirm(
            "Weet je zeker dat je dit wilt verwijderen?"
        );


    if (!confirmed)
        return;


    try {

        const {
            error
        } =
            await db
                .from(table)
                .delete()
                .eq(
                    "id",
                    id
                );


        if (error)
            throw error;


        toast(
            "Item verwijderd"
        );


        if (
            table === "videos"
        )
            loadVideos();


        if (
            table === "events"
        )
            loadEvents();


        if (
            table === "news"
        )
            loadNews();


        if (
            table === "photos"
        )
            loadPhotos();


        if (
            table === "products"
        )
            loadProducts();


        if (
            table === "bookings"
        )
            loadBookings();


        refreshDashboard();


    } catch (error) {

        console.error(error);


        alert(
            "Verwijderen mislukt:\n\n" +
            error.message
        );

    }

}


window.deleteItem =
    deleteItem;


/* ================================
   START
================================ */

async function start() {

    applyLogo();

    await testConnection();

    await Promise.all([

        refreshDashboard(),

        loadLive(),

        loadVideos(),

        loadEvents(),

        loadNews(),

        loadPhotos(),

        loadProducts(),

        loadBookings()

    ]);

}


start();
