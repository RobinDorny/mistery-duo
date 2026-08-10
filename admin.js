const SUPABASE_URL =
    "https://msvesugylaeffjqiizzm.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_DhtWMC4YaXFG6NUiqmiyHg_0ERj8Bgk";

const db = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ======================================
// HELPERS
// ======================================

function toast(message) {

    const el =
        document.getElementById("toast");

    el.textContent = message;

    el.classList.add("show");

    setTimeout(() => {
        el.classList.remove("show");
    }, 3000);
}


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


async function uploadFile(bucket, folder, file) {

    const extension =
        file.name.split(".").pop();

    const filename =
        `${Date.now()}-${Math.random()
            .toString(36)
            .substring(2)}.${extension}`;

    const path =
        `${folder}/${filename}`;

    const { error } =
        await db.storage
            .from(bucket)
            .upload(path, file, {
                upsert: false
            });

    if (error) {
        throw error;
    }

    const { data } =
        db.storage
            .from(bucket)
            .getPublicUrl(path);

    return data.publicUrl;
}


async function deleteStorageFile(bucket, url) {

    try {

        const marker =
            `${bucket}/`;

        const index =
            url.indexOf(marker);

        if (index === -1) return;

        const path =
            url.substring(
                index + marker.length
            );

        await db.storage
            .from(bucket)
            .remove([path]);

    } catch (error) {

        console.error(error);

    }
}


// ======================================
// NAVIGATIE
// ======================================

document.querySelectorAll(".menu")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".menu")
                    .forEach(item =>
                        item.classList.remove(
                            "active"
                        )
                    );

                button.classList.add("active");

                document
                    .querySelectorAll(".panel")
                    .forEach(panel =>
                        panel.classList.remove(
                            "active"
                        )
                    );

                const section =
                    document.getElementById(
                        button.dataset.section
                    );

                section.classList.add("active");

                document.getElementById(
                    "pageTitle"
                ).textContent =
                    button.textContent.trim();

            }
        );

    });


// ======================================
// DASHBOARD
// ======================================

async function updateStats() {

    const tables = [
        ["news", "statNews"],
        ["shows", "statShows"],
        ["bookings", "statBookings"],
        ["photos", "statPhotos"]
    ];

    for (const [table, element] of tables) {

        const { count } =
            await db
                .from(table)
                .select("*", {
                    count: "exact",
                    head: true
                });

        document.getElementById(element)
            .textContent =
            count ?? 0;
    }
}


// ======================================
// NIEUWS TOEVOEGEN
// ======================================

document
    .getElementById("newsForm")
    .addEventListener("submit", async e => {

        e.preventDefault();

        const { error } =
            await db
                .from("news")
                .insert({

                    title:
                        document.getElementById(
                            "newsTitle"
                        ).value,

                    content:
                        document.getElementById(
                            "newsContent"
                        ).value,

                    image_url:
                        document.getElementById(
                            "newsImage"
                        ).value || null

                });

        if (error) {

            console.error(error);

            toast(
                "Nieuws kon niet worden toegevoegd."
            );

            return;
        }

        toast("Nieuws gepubliceerd!");

        e.target.reset();

        loadNewsAdmin();
        updateStats();
    });


// ======================================
// NIEUWS LADEN
// ======================================

async function loadNewsAdmin() {

    const container =
        document.getElementById(
            "newsList"
        );

    const { data, error } =
        await db
            .from("news")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        container.innerHTML =
            "<p>Fout bij laden.</p>";

        return;
    }

    if (!data.length) {

        container.innerHTML =
            "<p>Geen nieuws.</p>";

        return;
    }

    container.innerHTML =
        data.map(item => `

        <div class="admin-item">

            <div>

                <h3>
                    ${escapeHtml(item.title)}
                </h3>

                <p>
                    ${escapeHtml(item.content)}
                </p>

            </div>

            <button
                class="delete"
                onclick="deleteNews(${item.id})"
            >
                Verwijderen
            </button>

        </div>

    `).join("");
}


window.deleteNews = async function(id) {

    if (!confirm(
        "Dit nieuwsbericht verwijderen?"
    )) return;

    const { error } =
        await db
            .from("news")
            .delete()
            .eq("id", id);

    if (error) {

        toast("Verwijderen mislukt.");

        return;
    }

    toast("Nieuws verwijderd.");

    loadNewsAdmin();
    updateStats();
};


// ======================================
// OPTREDEN TOEVOEGEN
// ======================================

document
    .getElementById("showForm")
    .addEventListener("submit", async e => {

        e.preventDefault();

        const { error } =
            await db
                .from("shows")
                .insert({

                    name:
                        document.getElementById(
                            "showName"
                        ).value,

                    date:
                        document.getElementById(
                            "showDate"
                        ).value,

                    time:
                        document.getElementById(
                            "showTime"
                        ).value,

                    location:
                        document.getElementById(
                            "showLocation"
                        ).value,

                    info:
                        document.getElementById(
                            "showInfo"
                        ).value

                });

        if (error) {

            console.error(error);

            toast(
                "Optreden kon niet worden toegevoegd."
            );

            return;
        }

        toast("Optreden toegevoegd!");

        e.target.reset();

        loadShowsAdmin();
        updateStats();
    });


// ======================================
// OPTREDENS LADEN
// ======================================

async function loadShowsAdmin() {

    const container =
        document.getElementById(
            "showsList"
        );

    const { data, error } =
        await db
            .from("shows")
            .select("*")
            .order("date", {
                ascending: true
            });

    if (error) {

        container.innerHTML =
            "<p>Fout bij laden.</p>";

        return;
    }

    container.innerHTML =
        data.map(item => `

        <div class="admin-item">

            <div>

                <h3>
                    ${escapeHtml(item.name)}
                </h3>

                <p>
                    ${escapeHtml(item.date)}
                    •
                    ${escapeHtml(item.location || "")}
                </p>

            </div>

            <button
                class="delete"
                onclick="deleteShow(${item.id})"
            >
                Verwijderen
            </button>

        </div>

    `).join("");
}


window.deleteShow = async function(id) {

    if (!confirm(
        "Dit optreden verwijderen?"
    )) return;

    const { error } =
        await db
            .from("shows")
            .delete()
            .eq("id", id);

    if (error) {

        toast("Verwijderen mislukt.");

        return;
    }

    toast("Optreden verwijderd.");

    loadShowsAdmin();
    updateStats();
};


// ======================================
// BOEKINGEN
// ======================================

async function loadBookings() {

    const container =
        document.getElementById(
            "bookingsList"
        );

    const { data, error } =
        await db
            .from("bookings")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) {

        container.innerHTML =
            "<p>Fout bij laden van aanvragen.</p>";

        return;
    }

    if (!data.length) {

        container.innerHTML =
            "<p>Geen boekingsaanvragen.</p>";

        return;
    }

    container.innerHTML =
        data.map(item => `

        <div class="admin-item">

            <div>

                <h3>
                    ${escapeHtml(item.name)}
                </h3>

                <p>
                    ${escapeHtml(item.email)}
                </p>

                <p>
                    ${escapeHtml(item.phone || "")}
                </p>

                <p>
                    ${escapeHtml(item.date || "")}
                    •
                    ${escapeHtml(item.location || "")}
                </p>

                <p>
                    ${escapeHtml(item.message || "")}
                </p>

            </div>

        </div>

    `).join("");
}


// ======================================
// FOTO UPLOAD
// ======================================

document
    .getElementById("photoForm")
    .addEventListener("submit", async e => {

        e.preventDefault();

        const file =
            document.getElementById(
                "photoFile"
            ).files[0];

        if (!file) {

            toast("Selecteer eerst een foto.");

            return;
        }

        try {

            toast("Foto wordt geüpload...");

            const url =
                await uploadFile(
                    "mistery-images",
                    "photos",
                    file
                );

            const { error } =
                await db
                    .from("photos")
                    .insert({

                        title:
                            document.getElementById(
                                "photoTitle"
                            ).value,

                        image_url: url

                    });

            if (error)
                throw error;

            toast("Foto succesvol toegevoegd!");

            e.target.reset();

            loadPhotosAdmin();

            updateStats();

        } catch (error) {

            console.error(error);

            toast(
                "Upload mislukt: " +
                error.message
            );
        }
    });


// ======================================
// FOTO'S LADEN
// ======================================

async function loadPhotosAdmin() {

    const container =
        document.getElementById(
            "photosList"
        );

    const { data, error } =
        await db
            .from("photos")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) return;

    container.innerHTML =
        data.map(photo => `

        <div class="media-card">

            <img
                src="${escapeHtml(photo.image_url)}"
            >

            <div class="media-card-content">

                <p>
                    ${escapeHtml(photo.title || "")}
                </p>

                <button
                    class="delete"
                    onclick="deletePhoto(
                        ${photo.id},
                        '${escapeHtml(photo.image_url)}'
                    )"
                >
                    Verwijderen
                </button>

            </div>

        </div>

    `).join("");
}


window.deletePhoto = async function(id, url) {

    if (!confirm("Foto verwijderen?"))
        return;

    await deleteStorageFile(
        "mistery-images",
        url
    );

    const { error } =
        await db
            .from("photos")
            .delete()
            .eq("id", id);

    if (error) {

        toast("Verwijderen mislukt.");

        return;
    }

    toast("Foto verwijderd.");

    loadPhotosAdmin();
    updateStats();
};


// ======================================
// VIDEO UPLOAD
// ======================================

document
    .getElementById("videoForm")
    .addEventListener("submit", async e => {

        e.preventDefault();

        const file =
            document.getElementById(
                "videoFile"
            ).files[0];

        if (!file) {

            toast("Selecteer eerst een video.");

            return;
        }

        try {

            toast("Video wordt geüpload...");

            const url =
                await uploadFile(
                    "mistery-videos",
                    "videos",
                    file
                );

            const { error } =
                await db
                    .from("videos")
                    .insert({

                        title:
                            document.getElementById(
                                "videoTitle"
                            ).value,

                        video_url: url

                    });

            if (error)
                throw error;

            toast("Video toegevoegd!");

            e.target.reset();

            loadVideosAdmin();

        } catch (error) {

            console.error(error);

            toast(
                "Video upload mislukt: " +
                error.message
            );
        }
    });


// ======================================
// VIDEO'S LADEN
// ======================================

async function loadVideosAdmin() {

    const container =
        document.getElementById(
            "videosList"
        );

    const { data, error } =
        await db
            .from("videos")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) return;

    container.innerHTML =
        data.map(video => `

        <div class="media-card">

            <video controls>

                <source
                    src="${escapeHtml(video.video_url)}"
                >

            </video>

            <div class="media-card-content">

                <p>
                    ${escapeHtml(video.title || "")}
                </p>

                <button
                    class="delete"
                    onclick="deleteVideo(
                        ${video.id},
                        '${escapeHtml(video.video_url)}'
                    )"
                >
                    Verwijderen
                </button>

            </div>

        </div>

    `).join("");
}


window.deleteVideo = async function(id, url) {

    if (!confirm("Video verwijderen?"))
        return;

    await deleteStorageFile(
        "mistery-videos",
        url
    );

    const { error } =
        await db
            .from("videos")
            .delete()
            .eq("id", id);

    if (error) {

        toast("Verwijderen mislukt.");

        return;
    }

    toast("Video verwijderd.");

    loadVideosAdmin();
};


// ======================================
// MERCHANDISE
// ======================================

document
    .getElementById("merchForm")
    .addEventListener("submit", async e => {

        e.preventDefault();

        const { error } =
            await db
                .from("merchandise")
                .insert({

                    name:
                        document.getElementById(
                            "merchName"
                        ).value,

                    price:
                        Number(
                            document.getElementById(
                                "merchPrice"
                            ).value
                        ) || null,

                    description:
                        document.getElementById(
                            "merchDescription"
                        ).value,

                    image_url:
                        document.getElementById(
                            "merchImage"
                        ).value || null

                });

        if (error) {

            toast(
                "Product kon niet worden toegevoegd."
            );

            return;
        }

        toast("Product toegevoegd!");

        e.target.reset();

        loadMerchAdmin();

    });


// ======================================
// MERCH LADEN
// ======================================

async function loadMerchAdmin() {

    const container =
        document.getElementById(
            "merchList"
        );

    const { data, error } =
        await db
            .from("merchandise")
            .select("*")
            .order("created_at", {
                ascending: false
            });

    if (error) return;

    container.innerHTML =
        data.map(item => `

        <div class="admin-item">

            <div>

                <h3>
                    ${escapeHtml(item.name)}
                </h3>

                <p>
                    € ${Number(
                        item.price || 0
                    ).toFixed(2)}
                </p>

            </div>

            <button
                class="delete"
                onclick="deleteMerch(${item.id})"
            >
                Verwijderen
            </button>

        </div>

    `).join("");
}


window.deleteMerch = async function(id) {

    if (!confirm("Product verwijderen?"))
        return;

    const { error } =
        await db
            .from("merchandise")
            .delete()
            .eq("id", id);

    if (error) {

        toast("Verwijderen mislukt.");

        return;
    }

    toast("Product verwijderd.");

    loadMerchAdmin();
};


// ======================================
// LIVESTREAM
// ======================================

async function loadLiveAdmin() {

    const { data, error } =
        await db
            .from("livestream")
            .select("*")
            .eq("id", 1)
            .single();

    if (error) return;

    document.getElementById(
        "liveActive"
    ).checked = data.active;

    document.getElementById(
        "liveTitle"
    ).value = data.title || "";

    document.getElementById(
        "liveUrl"
    ).value = data.url || "";

    showLivePreview(data);
}


function showLivePreview(data) {

    const container =
        document.getElementById(
            "livePreview"
        );

    if (!data.active || !data.url) {

        container.innerHTML =
            "<p>Livestream staat uit.</p>";

        return;
    }

    container.innerHTML = `

        <iframe
            src="${escapeHtml(data.url)}"
            allowfullscreen>
        </iframe>

    `;
}


document
    .getElementById("liveForm")
    .addEventListener("submit", async e => {

        e.preventDefault();

        const active =
            document.getElementById(
                "liveActive"
            ).checked;

        const url =
            document.getElementById(
                "liveUrl"
            ).value;

        const title =
            document.getElementById(
                "liveTitle"
            ).value;

        const { data, error } =
            await db
                .from("livestream")
                .update({

                    active,
                    url,
                    title,
                    updated_at:
                        new Date().toISOString()

                })
                .eq("id", 1)
                .select()
                .single();

        if (error) {

            console.error(error);

            toast(
                "Livestream kon niet worden opgeslagen."
            );

            return;
        }

        toast("Livestream opgeslagen!");

        showLivePreview(data);

    });


// ======================================
// SETTINGS / LOGO
// ======================================

async function loadSettingsAdmin() {

    const { data, error } =
        await db
            .from("settings")
            .select("*")
            .eq("id", 1)
            .single();

    if (error) return;

    document.getElementById(
        "siteName"
    ).value = data.site_name || "";

    if (data.logo_url) {

        document.getElementById(
            "currentLogo"
        ).src = data.logo_url;

    }
}


document
    .getElementById("settingsForm")
    .addEventListener("submit", async e => {

        e.preventDefault();

        try {

            const siteName =
                document.getElementById(
                    "siteName"
                ).value;

            const file =
                document.getElementById(
                    "logoFile"
                ).files[0];

            let logoUrl = null;

            if (file) {

                toast("Logo wordt geüpload...");

                logoUrl =
                    await uploadFile(
                        "mistery-images",
                        "logo",
                        file
                    );
            }

            const updateData = {

                site_name: siteName,

                updated_at:
                    new Date().toISOString()

            };

            if (logoUrl)
                updateData.logo_url =
                    logoUrl;

            const { error } =
                await db
                    .from("settings")
                    .update(updateData)
                    .eq("id", 1);

            if (error)
                throw error;

            toast(
                "Instellingen opgeslagen!"
            );

            loadSettingsAdmin();

        } catch (error) {

            console.error(error);

            toast(
                "Opslaan mislukt: " +
                error.message
            );
        }
    });


// ======================================
// START
// ======================================

async function startAdmin() {

    await updateStats();

    await loadNewsAdmin();

    await loadShowsAdmin();

    await loadBookings();

    await loadPhotosAdmin();

    await loadVideosAdmin();

    await loadMerchAdmin();

    await loadLiveAdmin();

    await loadSettingsAdmin();

}

startAdmin();
