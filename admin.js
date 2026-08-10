/* =========================================
   MISTERY DUO - BEHEER
   ========================================= */

const SUPABASE_URL =
    "https://msvesugylaeffjqiizzm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable__cDajfEACOoUZ9xOUZtY_Q5XFtp5B";

const ADMIN_PASSWORD = "misteryduo";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );

const $ = id => document.getElementById(id);

function esc(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function msg(id, text, success = false) {
    const el = $(id);

    if (!el) return;

    el.textContent = text;
    el.className = success ? "msg ok" : "msg";
}

function toast(text) {
    const el = $("toast");

    if (!el) return;

    el.textContent = text;
    el.classList.add("show");

    setTimeout(() => {
        el.classList.remove("show");
    }, 2500);
}


/* =========================================
   LOGIN
   ========================================= */

function login() {

    const password =
        $("adminPassword").value;

    if (password !== ADMIN_PASSWORD) {

        $("loginMsg").textContent =
            "Verkeerde beheerderscode.";

        return;
    }

    sessionStorage.setItem(
        "misteryDuoAdmin",
        "1"
    );

    $("login").classList.add("hidden");
    $("app").classList.remove("hidden");

    start();
}

$("loginBtn").onclick = login;

$("adminPassword").addEventListener(
    "keydown",
    e => {
        if (e.key === "Enter") {
            login();
        }
    }
);

$("logout").onclick = () => {

    sessionStorage.removeItem(
        "misteryDuoAdmin"
    );

    location.reload();
};


/* =========================================
   NAVIGATIE
   ========================================= */

const titles = {
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
    .querySelectorAll("#nav button")
    .forEach(button => {

        button.onclick = () => {
            openPage(
                button.dataset.page
            );
        };

    });


function openPage(page) {

    document
        .querySelectorAll(".page")
        .forEach(section => {
            section.classList.remove(
                "active"
            );
        });

    const section = $(page);

    if (!section) return;

    section.classList.add("active");

    document
        .querySelectorAll("#nav button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === page
            );

        });

    $("title").textContent =
        titles[page] || "Dashboard";


    if (page === "dashboard")
        loadCounts();

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

    if (page === "shop")
        loadProducts();

    if (page === "bookings")
        loadBookings();
}


/* =========================================
   VERBINDING TESTEN
   ========================================= */

async function testConnection() {

    const { error } =
        await supabaseClient
            .from("events")
            .select("id")
            .limit(1);

    const connection =
        $("connection");

    if (!connection) return;

    if (error) {

        connection.classList.remove("ok");

        connection.innerHTML =
            "<i></i> Database niet bereikbaar";

        console.error(
            "Supabase:",
            error
        );

    } else {

        connection.classList.add("ok");

        connection.innerHTML =
            "<i></i> Online verbonden";

    }
}


/* =========================================
   DASHBOARD
   ========================================= */

async function count(table) {

    const { count, error } =
        await supabaseClient
            .from(table)
            .select("*", {
                count: "exact",
                head: true
            });

    if (error) {

        console.error(
            table,
            error
        );

        return 0;
    }

    return count || 0;
}


async function loadCounts() {

    $("sVideos").textContent =
        await count("videos");

    $("sEvents").textContent =
        await count("events");

    $("sNews").textContent =
        await count("news");

    $("sBookings").textContent =
        await count("bookings");
}


/* =========================================
   STORAGE
   ========================================= */

async function uploadFile(
    bucket,
    file,
    path
) {

    const { error } =
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

    if (error)
        throw error;


    const { data } =
        supabaseClient
            .storage
            .from(bucket)
            .getPublicUrl(path);


    return data.publicUrl;
}


/* =========================================
   LOGO
   ========================================= */

function defaultLogo() {
    return "assets/mistery-duo-logo.jpg";
}


function getLogo() {

    return localStorage.getItem(
        "misteryDuoLogo"
    ) || defaultLogo();

}


function applyLogo() {

    const logo =
        getLogo();

    [
        "loginLogo",
        "sideLogo",
        "dashLogo",
        "logoPreview"
    ].forEach(id => {

        const image = $(id);

        if (image)
            image.src = logo;

    });
}


function loadLogo() {

    applyLogo();

}


$("logoFile").onchange = event => {

    const file =
        event.target.files[0];

    if (!file) return;

    $("logoPreview").src =
        URL.createObjectURL(file);
};


$("saveLogo").onclick = async () => {

    const file =
        $("logoFile").files[0];

    if (!file) {

        msg(
            "logoMsg",
            "Kies eerst een logo."
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
            "site/logo-" +
            Date.now() +
            "-" +
            filename;


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


        applyLogo();


        msg(
            "logoMsg",
            "Logo succesvol opgeslagen.",
            true
        );

        toast(
            "Logo opgeslagen"
        );


    } catch (error) {

        console.error(error);

        msg(
            "logoMsg",
            "Logo upload mislukt: " +
            error.message
        );

    }
};


$("resetLogo").onclick = () => {

    localStorage.removeItem(
        "misteryDuoLogo"
    );

    applyLogo();

    msg(
        "logoMsg",
        "Standaardlogo ingesteld.",
        true
    );

};


/* =========================================
   LIVESTREAM
   ========================================= */

function youtubeId(url) {

    const match =
        String(url).match(
            /(?:v=|youtu\.be\/|youtube\.com\/live\/|youtube\.com\/embed\/)([^&?\/\s]+)/
        );

    return match
        ? match[1]
        : null;
}


async function loadLive() {

    const { data, error } =
        await supabaseClient
            .from("settings")
            .select("*")
            .eq(
                "key",
                "livestream"
            )
            .maybeSingle();


    if (error) {

        msg(
            "liveMsg",
            "Livestream laden mislukt: " +
            error.message
        );

        return;
    }


    if (!data) {

        $("liveUrl").value = "";

        $("liveFrame").innerHTML =
            "<p>Geen livestream ingesteld.</p>";

        return;
    }


    $("liveUrl").value =
        data.value || "";


    if (
        data.active &&
        youtubeId(data.value)
    ) {

        showLive(
            data.value
        );

    } else {

        $("liveFrame").innerHTML =
            "<p>Livestream staat uit.</p>";

    }
}


function showLive(url) {

    const id =
        youtubeId(url);

    if (!id) return;

    $("liveFrame").innerHTML = `
        <iframe
            src="https://www.youtube.com/embed/${esc(id)}"
            title="Mistery Duo livestream"
            allow="autoplay; encrypted-media"
            allowfullscreen>
        </iframe>
    `;
}


async function saveLive(active) {

    const url =
        $("liveUrl").value.trim();


    if (
        active &&
        !youtubeId(url)
    ) {

        msg(
            "liveMsg",
            "Gebruik een geldige YouTube-link."
        );

        return;
    }


    const { error } =
        await supabaseClient
            .from("settings")
            .upsert(
                {
                    key: "livestream",
                    value: url,
                    active: active
                },
                {
                    onConflict: "key"
                }
            );


    if (error) {

        msg(
            "liveMsg",
            "Opslaan mislukt: " +
            error.message
        );

        return;
    }


    if (active)
        showLive(url);
    else
        $("liveFrame").innerHTML =
            "<p>Livestream staat uit.</p>";


    msg(
        "liveMsg",
        active
            ? "Livestream geactiveerd."
            : "Livestream uitgezet.",
        true
    );

    toast(
        "Livestream bijgewerkt"
    );
}


$("liveSave").onclick =
    () => saveLive(true);

$("liveOff").onclick =
    () => saveLive(false);


/* =========================================
   VIDEO'S
   ========================================= */

$("videoSave").onclick =
    async () => {

        const file =
            $("videoFile").files[0];

        const title =
            $("videoTitle")
                .value
                .trim();


        if (!file || !title) {

            msg(
                "videoMsg",
                "Titel en video zijn verplicht."
            );

            return;
        }


        const video =
            document.createElement(
                "video"
            );

        video.preload = "metadata";


        video.onloadedmetadata =
            async () => {

                URL.revokeObjectURL(
                    video.src
                );


                if (
                    video.duration > 60
                ) {

                    msg(
                        "videoMsg",
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
                        "videos/" +
                        Date.now() +
                        "-" +
                        filename;


                    const url =
                        await uploadFile(
                            "videos",
                            file,
                            path
                        );


                    const { error } =
                        await supabaseClient
                            .from("videos")
                            .insert({
                                title: title,
                                video_url: url
                            });


                    if (error)
                        throw error;


                    $("videoTitle").value =
                        "";

                    $("videoFile").value =
                        "";


                    msg(
                        "videoMsg",
                        "Video succesvol gepubliceerd.",
                        true
                    );

                    toast(
                        "Video gepubliceerd"
                    );


                    loadVideos();
                    loadCounts();


                } catch (error) {

                    console.error(error);

                    msg(
                        "videoMsg",
                        "Upload mislukt: " +
                        error.message
                    );

                }

            };


        video.onerror = () => {

            msg(
                "videoMsg",
                "Deze video kan niet worden gelezen."
            );

        };


        video.src =
            URL.createObjectURL(
                file
            );

    };


async function loadVideos() {

    const { data, error } =
        await supabaseClient
            .from("videos")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        $("videosList").innerHTML =
            `<div class="empty">${esc(error.message)}</div>`;

        return;
    }


    if (!data.length) {

        $("videosList").innerHTML =
            "<div class='empty'>Nog geen video's.</div>";

        return;
    }


    $("videosList").innerHTML =
        data.map(video => `

            <div class="media">

                <video
                    controls
                    src="${esc(video.video_url)}">
                </video>

                <div class="media-body">
                    <b>
                        ${esc(video.title)}
                    </b>
                </div>

                <button
                    class="btn danger"
                    onclick="deleteItem('videos', ${video.id})">

                    Verwijderen

                </button>

            </div>

        `).join("");
}


/* =========================================
   OPTREDENS
   ========================================= */

$("eventSave").onclick =
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

            msg(
                "eventMsg",
                "Naam, locatie en datum zijn verplicht."
            );

            return;
        }


        const { error } =
            await supabaseClient
                .from("events")
                .insert(row);


        if (error) {

            msg(
                "eventMsg",
                error.message
            );

            return;
        }


        [
            "eventName",
            "eventLocation",
            "eventDate",
            "eventTime"
        ].forEach(id => {
            $(id).value = "";
        });


        msg(
            "eventMsg",
            "Optreden gepubliceerd.",
            true
        );

        toast(
            "Optreden toegevoegd"
        );


        loadEvents();
        loadCounts();
    };


async function loadEvents() {

    const { data, error } =
        await supabaseClient
            .from("events")
            .select("*")
            .order(
                "event_date",
                {
                    ascending: true
                }
            );


    if (error) {

        $("eventsList").innerHTML =
            `<div class="empty">${esc(error.message)}</div>`;

        return;
    }


    if (!data.length) {

        $("eventsList").innerHTML =
            "<div class='empty'>Nog geen optredens.</div>";

        return;
    }


    $("eventsList").innerHTML =
        data.map(event => `

            <div class="item">

                <div>

                    <b>
                        ${esc(event.name)}
                    </b>

                    <small>
                        📍 ${esc(event.location)}
                        ·
                        ${esc(event.event_date)}
                        ·
                        ${esc(event.event_time || "")}
                    </small>

                </div>

                <button
                    class="btn danger"
                    onclick="deleteItem('events', ${event.id})">

                    Verwijderen

                </button>

            </div>

        `).join("");
}


/* =========================================
   NIEUWS
   ========================================= */

$("newsSave").onclick =
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

            msg(
                "newsMsg",
                "Titel en bericht zijn verplicht."
            );

            return;
        }


        const { error } =
            await supabaseClient
                .from("news")
                .insert({
                    title,
                    content
                });


        if (error) {

            msg(
                "newsMsg",
                error.message
            );

            return;
        }


        $("newsTitle").value =
            "";

        $("newsContent").value =
            "";


        msg(
            "newsMsg",
            "Nieuws gepubliceerd.",
            true
        );

        toast(
            "Nieuws gepubliceerd"
        );


        loadNews();
        loadCounts();
    };


async function loadNews() {

    const { data, error } =
        await supabaseClient
            .from("news")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        $("newsList").innerHTML =
            `<div class="empty">${esc(error.message)}</div>`;

        return;
    }


    if (!data.length) {

        $("newsList").innerHTML =
            "<div class='empty'>Nog geen nieuws.</div>";

        return;
    }


    $("newsList").innerHTML =
        data.map(item => `

            <div class="item">

                <div>

                    <b>
                        ${esc(item.title)}
                    </b>

                    <small>
                        ${esc(
                            item.content
                        ).slice(0, 250)}
                    </small>

                </div>

                <button
                    class="btn danger"
                    onclick="deleteItem('news', ${item.id})">

                    Verwijderen

                </button>

            </div>

        `).join("");
}


/* =========================================
   FOTO'S
   ========================================= */

$("photoSave").onclick =
    async () => {

        const file =
            $("photoFile").files[0];

        const title =
            $("photoTitle")
                .value
                .trim();


        if (!file) {

            msg(
                "photoMsg",
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
                "photos/" +
                Date.now() +
                "-" +
                filename;


            const url =
                await uploadFile(
                    "photos",
                    file,
                    path
                );


            const { error } =
                await supabaseClient
                    .from("photos")
                    .insert({
                        title,
                        image_url: url
                    });


            if (error)
                throw error;


            $("photoFile").value =
                "";

            $("photoTitle").value =
                "";


            msg(
                "photoMsg",
                "Foto gepubliceerd.",
                true
            );

            toast(
                "Foto gepubliceerd"
            );


            loadPhotos();


        } catch (error) {

            msg(
                "photoMsg",
                "Upload mislukt: " +
                error.message
            );

        }

    };


async function loadPhotos() {

    const { data, error } =
        await supabaseClient
            .from("photos")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        $("photosList").innerHTML =
            `<div class="empty">${esc(error.message)}</div>`;

        return;
    }


    if (!data.length) {

        $("photosList").innerHTML =
            "<div class='empty'>Nog geen foto's.</div>";

        return;
    }


    $("photosList").innerHTML =
        data.map(photo => `

            <div class="media">

                <img
                    src="${esc(photo.image_url)}"
                    alt="${esc(photo.title || "")}"
                >

                <div class="media-body">

                    <b>
                        ${esc(
                            photo.title ||
                            "Foto"
                        )}
                    </b>

                </div>

                <button
                    class="btn danger"
                    onclick="deleteItem('photos', ${photo.id})">

                    Verwijderen

                </button>

            </div>

        `).join("");
}


/* =========================================
   MERCHANDISE
   ========================================= */

$("productSave").onclick =
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
            $("productFile")
                .files[0];


        if (!name || !price) {

            msg(
                "productMsg",
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
                        "merch/" +
                        Date.now() +
                        "-" +
                        filename
                    );

            }


            const { error } =
                await supabaseClient
                    .from("products")
                    .insert({
                        name,
                        price,
                        description,
                        image_url
                    });


            if (error)
                throw error;


            [
                "productName",
                "productPrice",
                "productDescription",
                "productFile"
            ].forEach(id => {
                $(id).value = "";
            });


            msg(
                "productMsg",
                "Product toegevoegd.",
                true
            );

            toast(
                "Product toegevoegd"
            );


            loadProducts();


        } catch (error) {

            msg(
                "productMsg",
                "Opslaan mislukt: " +
                error.message
            );

        }

    };


async function loadProducts() {

    const { data, error } =
        await supabaseClient
            .from("products")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        $("productsList").innerHTML =
            `<div class="empty">${esc(error.message)}</div>`;

        return;
    }


    if (!data.length) {

        $("productsList").innerHTML =
            "<div class='empty'>Nog geen producten.</div>";

        return;
    }


    $("productsList").innerHTML =
        data.map(product => `

            <div class="media">

                ${
                    product.image_url
                    ?
                    `<img
                        src="${esc(product.image_url)}"
                        alt="">`
                    :
                    ""
                }

                <div class="media-body">

                    <b>
                        ${esc(product.name)}
                    </b>

                    <small>
                        € ${esc(product.price)}
                    </small>

                    <p>
                        ${esc(
                            product.description ||
                            ""
                        )}
                    </p>

                </div>

                <button
                    class="btn danger"
                    onclick="deleteItem('products', ${product.id})">

                    Verwijderen

                </button>

            </div>

        `).join("");
}


/* =========================================
   BOEKINGEN
   ========================================= */

async function loadBookings() {

    const { data, error } =
        await supabaseClient
            .from("bookings")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        $("bookingsList").innerHTML =
            `<div class="empty">${esc(error.message)}</div>`;

        return;
    }


    if (!data.length) {

        $("bookingsList").innerHTML =
            "<div class='empty'>Nog geen boekingsaanvragen.</div>";

        return;
    }


    $("bookingsList").innerHTML =
        data.map(booking => `

            <div class="booking">

                <h3>
                    ${esc(booking.name)}
                </h3>

                <div class="meta">

                    ${esc(booking.email || "")}

                    ·

                    ${esc(
                        booking.event_date ||
                        ""
                    )}

                    ·

                    ${esc(
                        booking.location ||
                        ""
                    )}

                </div>

                <p>
                    ${esc(
                        booking.message ||
                        ""
                    )}
                </p>

                <button
                    class="btn danger"
                    onclick="deleteItem('bookings', ${booking.id})">

                    Verwijderen

                </button>

            </div>

        `).join("");
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
    ) return;


    const { error } =
        await supabaseClient
            .from(table)
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        alert(
            "Verwijderen mislukt:\n" +
            error.message
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
   START
   ========================================= */

async function start() {

    applyLogo();

    await testConnection();

    await loadCounts();

}


applyLogo();


if (
    sessionStorage.getItem(
        "misteryDuoAdmin"
    ) === "1"
) {

    $("login")
        .classList
        .add("hidden");

    $("app")
        .classList
        .remove("hidden");

    start();

}
