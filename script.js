const SUPABASE_URL =
    "https://msvesugylaeffjqiizzm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_DhtWMC4YaXFG6NUiqmiyHg_0ERj8Bgk";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// -------------------------
// BASIS
// -------------------------

document.getElementById("year").textContent =
    new Date().getFullYear();


// -------------------------
// SETTINGS / LOGO
// -------------------------

async function loadSettings() {

    const { data, error } = await db
        .from("settings")
        .select("*")
        .eq("id", 1)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    if (data.logo_url) {
        document.getElementById("siteLogo").src =
            data.logo_url;
    }
}


// -------------------------
// NIEUWS
// -------------------------

async function loadNews() {

    const container =
        document.getElementById("newsContainer");

    const { data, error } = await db
        .from("news")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {
        container.innerHTML =
            "<p>Nieuws kon niet worden geladen.</p>";
        console.error(error);
        return;
    }

    if (!data.length) {
        container.innerHTML =
            '<p class="empty">Er is momenteel geen nieuws.</p>';
        return;
    }

    container.innerHTML = data.map(item => `

        <article class="card">

            ${item.image_url ? `
                <img src="${escapeHtml(item.image_url)}">
            ` : ""}

            <div class="card-content">

                <h3>
                    ${escapeHtml(item.title)}
                </h3>

                <p>
                    ${escapeHtml(item.content)}
                </p>

            </div>

        </article>

    `).join("");
}


// -------------------------
// OPTREDENS
// -------------------------

async function loadShows() {

    const container =
        document.getElementById("showsContainer");

    const { data, error } = await db
        .from("shows")
        .select("*")
        .order("date", {
            ascending: true
        });

    if (error) {
        console.error(error);
        return;
    }

    if (!data.length) {
        container.innerHTML =
            '<p class="empty">Er zijn momenteel geen optredens gepland.</p>';
        return;
    }

    container.innerHTML = data.map(show => {

        const date =
            new Date(show.date).toLocaleDateString(
                "nl-BE",
                {
                    day: "2-digit",
                    month: "short"
                }
            );

        return `

        <article class="show">

            <div class="show-date">
                ${date}
            </div>

            <div class="show-info">

                <h3>
                    ${escapeHtml(show.name)}
                </h3>

                <p>
                    ${escapeHtml(show.location || "")}
                    ${show.time ? " • " + escapeHtml(show.time) : ""}
                </p>

                ${
                    show.info
                    ? `<p>${escapeHtml(show.info)}</p>`
                    : ""
                }

            </div>

        </article>

        `;

    }).join("");
}


// -------------------------
// LIVESTREAM
// -------------------------

async function loadLive() {

    const container =
        document.getElementById("liveContainer");

    const { data, error } = await db
        .from("livestream")
        .select("*")
        .eq("id", 1)
        .single();

    if (error) {
        console.error(error);
        return;
    }

    if (!data.active || !data.url) {

        container.innerHTML = `
            <div>
                <h3>Momenteel niet live</h3>
                <p>Kom later terug voor de volgende livestream.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = `

        <iframe
            src="${escapeHtml(data.url)}"
            allowfullscreen>
        </iframe>

    `;
}


// -------------------------
// FOTO'S
// -------------------------

async function loadPhotos() {

    const container =
        document.getElementById("photosContainer");

    const { data, error } = await db
        .from("photos")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error(error);
        return;
    }

    if (!data.length) {
        container.innerHTML =
            '<p class="empty">Nog geen foto's.</p>';
        return;
    }

    container.innerHTML = data.map(photo => `

        <img
            src="${escapeHtml(photo.image_url)}"
            alt="${escapeHtml(photo.title || "Mistery Duo")}"
            loading="lazy"
        >

    `).join("");
}


// -------------------------
// VIDEO'S
// -------------------------

async function loadVideos() {

    const container =
        document.getElementById("videosContainer");

    const { data, error } = await db
        .from("videos")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error(error);
        return;
    }

    if (!data.length) {
        container.innerHTML =
            '<p class="empty">Nog geen video's.</p>';
        return;
    }

    container.innerHTML = data.map(video => `

        <article class="video-card">

            <video controls preload="metadata">

                <source
                    src="${escapeHtml(video.video_url)}"
                >

            </video>

            <h3>
                ${escapeHtml(video.title || "Mistery Duo")}
            </h3>

        </article>

    `).join("");
}


// -------------------------
// MERCHANDISE
// -------------------------

async function loadMerchandise() {

    const container =
        document.getElementById("merchContainer");

    const { data, error } = await db
        .from("merchandise")
        .select("*")
        .order("created_at", {
            ascending: false
        });

    if (error) {
        console.error(error);
        return;
    }

    if (!data.length) {
        container.innerHTML =
            '<p class="empty">Merchandise komt binnenkort.</p>';
        return;
    }

    container.innerHTML = data.map(item => `

        <article class="card">

            ${
                item.image_url
                ? `<img src="${escapeHtml(item.image_url)}">`
                : ""
            }

            <div class="card-content">

                <h3>
                    ${escapeHtml(item.name)}
                </h3>

                <p>
                    ${escapeHtml(item.description || "")}
                </p>

                ${
                    item.price !== null
                    ? `<strong>€ ${Number(item.price).toFixed(2)}</strong>`
                    : ""
                }

            </div>

        </article>

    `).join("");
}


// -------------------------
// BOEKING
// -------------------------

document
    .getElementById("bookingForm")
    .addEventListener("submit", async function(e) {

        e.preventDefault();

        const result =
            document.getElementById(
                "bookingMessageResult"
            );

        result.textContent =
            "Aanvraag wordt verstuurd...";

        const { error } = await db
            .from("bookings")
            .insert({

                name:
                    document.getElementById(
                        "bookingName"
                    ).value,

                email:
                    document.getElementById(
                        "bookingEmail"
                    ).value,

                phone:
                    document.getElementById(
                        "bookingPhone"
                    ).value,

                date:
                    document.getElementById(
                        "bookingDate"
                    ).value,

                location:
                    document.getElementById(
                        "bookingLocation"
                    ).value,

                message:
                    document.getElementById(
                        "bookingMessage"
                    ).value

            });

        if (error) {

            console.error(error);

            result.textContent =
                "Er ging iets mis. Probeer opnieuw.";

            return;
        }

        result.textContent =
            "Je aanvraag is succesvol verstuurd!";

        this.reset();

    });


// -------------------------
// VEILIGER TEKST
// -------------------------

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// -------------------------
// START
// -------------------------

loadSettings();
loadNews();
loadShows();
loadLive();
loadPhotos();
loadVideos();
loadMerchandise();
