import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    push,
    remove,
    update,
    onValue
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";


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
const auth = getAuth(app);


/* =========================================================
   ELEMENTS
========================================================= */

const loginScreen =
    document.getElementById("loginScreen");

const adminApp =
    document.getElementById("adminApp");

const loginForm =
    document.getElementById("loginForm");

const loginError =
    document.getElementById("loginError");

const logoutButton =
    document.getElementById("logoutButton");

const modal =
    document.getElementById("modal");

const modalForm =
    document.getElementById("modalForm");

const modalTitle =
    document.getElementById("modalTitle");

const closeModal =
    document.getElementById("closeModal");


/* =========================================================
   AUTH
========================================================= */

onAuthStateChanged(
    auth,
    user => {

        if (user) {

            loginScreen.classList.add(
                "hidden"
            );

            adminApp.classList.remove(
                "hidden"
            );

            loadEverything();

        } else {

            loginScreen.classList.remove(
                "hidden"
            );

            adminApp.classList.add(
                "hidden"
            );

        }

    }
);


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();

        loginError.textContent = "";

        const email =
            document.getElementById(
                "loginEmail"
            ).value;

        const password =
            document.getElementById(
                "loginPassword"
            ).value;


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        } catch (error) {

            console.error(error);

            loginError.textContent =
                "E-mailadres of wachtwoord is incorrect.";

        }

    }
);


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    async () => {

        await signOut(auth);

    }
);


/* =========================================================
   NAVIGATION
========================================================= */

document
    .querySelectorAll(
        ".sidebar nav button"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const section =
                    button.dataset.section;

                showSection(section);

            }
        );

    });


function showSection(name) {

    document
        .querySelectorAll(".admin-section")
        .forEach(section => {

            section.classList.remove(
                "active"
            );

        });


    const target =
        document.getElementById(name);

    if (target) {
        target.classList.add("active");
    }


    document
        .querySelectorAll(".sidebar nav button")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === name
            );

        });


    const titles = {

        dashboard:
            "Dashboard",

        settings:
            "Website",

        shows:
            "Optredens",

        news:
            "Nieuws",

        videos:
            "Video's",

        photos:
            "Foto's",

        products:
            "Merchandise",

        bookings:
            "Boekingen"

    };


    document.getElementById(
        "pageTitle"
    ).textContent =
        titles[name] || "Dashboard";

}


/* =========================================================
   LOAD EVERYTHING
========================================================= */

function loadEverything() {

    loadSettings();

    loadCollection(
        "shows",
        "showsAdminList",
        "show"
    );

    loadCollection(
        "news",
        "newsAdminList",
        "news"
    );

    loadCollection(
        "videos",
        "videosAdminList",
        "video"
    );

    loadCollection(
        "photos",
        "photosAdminList",
        "photo"
    );

    loadCollection(
        "products",
        "productsAdminList",
        "product"
    );

    loadBookings();

}


/* =========================================================
   SETTINGS
========================================================= */

function loadSettings() {

    onValue(
        ref(db, "settings"),
        snapshot => {

            const data =
                snapshot.val() || {};

            document.getElementById(
                "settingLogo"
            ).value =
                data.logo || "";

            document.getElementById(
                "settingFacebook"
            ).value =
                data.facebook || "";

            document.getElementById(
                "settingInstagram"
            ).value =
                data.instagram || "";

            document.getElementById(
                "settingYoutube"
            ).value =
                data.youtube || "";

            document.getElementById(
                "settingLive"
            ).checked =
                data.live?.enabled || false;

            document.getElementById(
                "settingLiveUrl"
            ).value =
                data.live?.url || "";

        }
    );

}


document
    .getElementById("settingsForm")
    .addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const data = {

                logo:
                    document.getElementById(
                        "settingLogo"
                    ).value.trim(),

                facebook:
                    document.getElementById(
                        "settingFacebook"
                    ).value.trim(),

                instagram:
                    document.getElementById(
                        "settingInstagram"
                    ).value.trim(),

                youtube:
                    document.getElementById(
                        "settingYoutube"
                    ).value.trim(),

                live: {

                    enabled:
                        document.getElementById(
                            "settingLive"
                        ).checked,

                    url:
                        document.getElementById(
                            "settingLiveUrl"
                        ).value.trim()

                }

            };


            try {

                await set(
                    ref(db, "settings"),
                    data
                );


                document.getElementById(
                    "settingsResult"
                ).textContent =
                    "✓ Instellingen opgeslagen.";

            } catch (error) {

                console.error(error);

                document.getElementById(
                    "settingsResult"
                ).textContent =
                    "Opslaan mislukt.";

            }

        }
    );


/* =========================================================
   COLLECTIONS
========================================================= */

function loadCollection(
    path,
    containerId,
    type
) {

    onValue(
        ref(db, path),
        snapshot => {

            const data =
                snapshot.val() || {};

            const entries =
                Object.entries(data);

            renderAdminList(
                entries,
                containerId,
                path,
                type
            );


            updateCount(
                path,
                entries.length
            );

        }
    );

}


/* =========================================================
   RENDER ADMIN LIST
========================================================= */

function renderAdminList(
    entries,
    containerId,
    path,
    type
) {

    const container =
        document.getElementById(
            containerId
        );


    if (!entries.length) {

        container.innerHTML = `
            <div class="admin-item">
                <div class="admin-item-info">
                    <p>Nog niets toegevoegd.</p>
                </div>
            </div>
        `;

        return;
    }


    container.innerHTML =
        entries.map(
            ([id, item]) => {

                let title =
                    item.title ||
                    item.name ||
                    "Item";

                let description =
                    item.date ||
                    item.location ||
                    item.description ||
                    item.price ||
                    "";


                return `

                    <div class="admin-item">

                        <div class="admin-item-info">

                            <h3>
                                ${escapeHTML(title)}
                            </h3>

                            <p>
                                ${escapeHTML(description)}
                            </p>

                        </div>

                        <div class="admin-actions">

                            <button
                                class="action-button"
                                data-edit-path="${path}"
                                data-edit-id="${id}"
                                data-type="${type}"
                            >
                                Bewerken
                            </button>

                            <button
                                class="action-button delete"
                                data-delete-path="${path}"
                                data-delete-id="${id}"
                            >
                                Verwijderen
                            </button>

                        </div>

                    </div>

                `;

            }
        ).join("");


    container
        .querySelectorAll(
            "[data-edit-path]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    editItem(
                        button.dataset.editPath,
                        button.dataset.editId,
                        button.dataset.type
                    );

                }
            );

        });


    container
        .querySelectorAll(
            "[data-delete-path]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const confirmed =
                        confirm(
                            "Weet je zeker dat je dit wilt verwijderen?"
                        );

                    if (!confirmed) {
                        return;
                    }


                    await remove(
                        ref(
                            db,
                            `${button.dataset.deletePath}/${button.dataset.deleteId}`
                        )
                    );

                }
            );

        });

}


/* =========================================================
   ADD BUTTONS
========================================================= */

document
    .querySelectorAll(
        "[data-add]"
    )
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                openAddModal(
                    button.dataset.add
                );

            }
        );

    });


/* =========================================================
   MODAL
========================================================= */

closeModal.addEventListener(
    "click",
    closeModalWindow
);


modal.addEventListener(
    "click",
    event => {

        if (event.target === modal) {
            closeModalWindow();
        }

    }
);


function closeModalWindow() {

    modal.classList.remove(
        "active"
    );

}


/* =========================================================
   ADD MODAL
========================================================= */

function openAddModal(path) {

    const configs = {

        shows: {

            title: "Optreden toevoegen",

            fields: `
                ${field("Titel", "title", "Bijv. Mistery Duo Live")}
                ${field("Datum", "date", "Bijv. 24 augustus 2026")}
                ${field("Uur", "time", "Bijv. 20:00")}
                ${field("Locatie", "location", "Bijv. Blankenberge")}
            `

        },


        news: {

            title: "Nieuws toevoegen",

            fields: `
                ${field("Titel", "title", "Titel van het nieuws")}
                ${field("Datum", "date", "13 augustus 2026")}
                ${textareaField("Tekst", "text")}
                ${field("Afbeelding URL", "image", "https://...")}
            `

        },


        videos: {

            title: "Video toevoegen",

            fields: `
                ${field("Titel", "title", "Videotitel")}
                ${field("Video URL", "url", "https://...")}
                ${field("Thumbnail URL", "image", "https://...")}
                ${textareaField("Beschrijving", "description")}
            `

        },


        photos: {

            title: "Foto toevoegen",

            fields: `
                ${field("Foto URL", "image", "https://...")}
                ${field("Titel", "title", "Optionele titel")}
            `

        },


        products: {

            title: "Product toevoegen",

            fields: `
                ${field("Productnaam", "name", "Bijv. T-shirt")}
                ${field("Prijs", "price", "Bijv. €20")}
                ${field("Afbeelding URL", "image", "https://...")}
                ${field("Bestel URL", "url", "https://...")}
            `

        }

    };


    const config =
        configs[path];

    if (!config) return;


    modalTitle.textContent =
        config.title;


    modalForm.innerHTML = `

        ${config.fields}

        <button
            class="admin-button gold modal-form-submit"
            type="submit"
        >
            Opslaan
        </button>

    `;


    modalForm.onsubmit =
        async event => {

            event.preventDefault();

            const data =
                formToObject(
                    modalForm
                );

            data.createdAt =
                Date.now();


            const newRef =
                push(
                    ref(db, path)
                );


            await set(
                newRef,
                data
            );


            closeModalWindow();

        };


    modal.classList.add(
        "active"
    );

}


/* =========================================================
   EDIT
========================================================= */

async function editItem(
    path,
    id,
    type
) {

    const snapshot =
        await new Promise(resolve => {

            onValue(
                ref(
                    db,
                    `${path}/${id}`
                ),
                resolve,
                {
                    onlyOnce: true
                }
            );

        });


    const item =
        snapshot.val();

    if (!item) return;


    const fields =
        Object.entries(item)
            .filter(
                ([key]) =>
                    key !== "createdAt"
            )
            .map(
                ([key, value]) => {

                    if (
                        key === "text" ||
                        key === "description"
                    ) {

                        return textareaField(
                            labelName(key),
                            key,
                            value
                        );

                    }


                    return field(
                        labelName(key),
                        key,
                        value
                    );

                }
            )
            .join("");


    modalTitle.textContent =
        "Item bewerken";


    modalForm.innerHTML = `

        ${fields}

        <button
            class="admin-button gold modal-form-submit"
            type="submit"
        >
            Wijzigingen opslaan
        </button>

    `;


    modalForm.onsubmit =
        async event => {

            event.preventDefault();

            const data =
                formToObject(
                    modalForm
                );


            await update(
                ref(
                    db,
                    `${path}/${id}`
                ),
                data
            );


            closeModalWindow();

        };


    modal.classList.add(
        "active"
    );

}


/* =========================================================
   FORM HELPERS
========================================================= */

function field(
    label,
    name,
    value = ""
) {

    return `

        <label class="modal-form-label">

            ${escapeHTML(label)}

            <input
                name="${escapeHTML(name)}"
                value="${escapeHTML(value)}"
            >

        </label>

    `;

}


function textareaField(
    label,
    name,
    value = ""
) {

    return `

        <label class="modal-form-label">

            ${escapeHTML(label)}

            <textarea
                name="${escapeHTML(name)}"
                rows="5"
            >${escapeHTML(value)}</textarea>

        </label>

    `;

}


function formToObject(form) {

    const data = {};

    new FormData(form)
        .forEach(
            (value, key) => {

                data[key] =
                    String(value).trim();

            }
        );

    return data;

}


function labelName(key) {

    const names = {

        title: "Titel",

        name: "Naam",

        date: "Datum",

        time: "Uur",

        location: "Locatie",

        url: "URL",

        image: "Afbeelding URL",

        price: "Prijs",

        text: "Tekst",

        description: "Beschrijving"

    };

    return names[key] || key;

}


function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   BOOKINGS
========================================================= */

function loadBookings() {

    onValue(
        ref(db, "bookings"),
        snapshot => {

            const data =
                snapshot.val() || {};

            const entries =
                Object.entries(data);

            document.getElementById(
                "countBookings"
            ).textContent =
                entries.length;


            const container =
                document.getElementById(
                    "bookingsAdminList"
                );


            if (!entries.length) {

                container.innerHTML = `
                    <div class="admin-item">
                        <div class="admin-item-info">
                            <p>Geen boekingsaanvragen.</p>
                        </div>
                    </div>
                `;

                return;

            }


            entries.sort(
                ([,a], [,b]) =>
                    (b.createdAt || 0) -
                    (a.createdAt || 0)
            );


            container.innerHTML =
                entries.map(
                    ([id, booking]) => `

                        <div class="admin-item">

                            <div class="admin-item-info">

                                <h3>
                                    ${escapeHTML(
                                        booking.name
                                    )}
                                </h3>

                                <p>
                                    ${escapeHTML(
                                        booking.email
                                    )}
                                </p>

                                <p>
                                    📅 ${escapeHTML(
                                        booking.date || "Geen datum"
                                    )}
                                </p>

                                <p>
                                    📍 ${escapeHTML(
                                        booking.location || "Geen locatie"
                                    )}
                                </p>

                                <p>
                                    ${escapeHTML(
                                        booking.message || ""
                                    )}
                                </p>

                            </div>

                            <div class="admin-actions">

                                <button
                                    class="action-button delete"
                                    data-booking="${id}"
                                >
                                    Verwijderen
                                </button>

                            </div>

                        </div>

                    `
                ).join("");


            container
                .querySelectorAll(
                    "[data-booking]"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        async () => {

                            if (
                                confirm(
                                    "Deze aanvraag verwijderen?"
                                )
                            ) {

                                await remove(
                                    ref(
                                        db,
                                        `bookings/${button.dataset.booking}`
                                    )
                                );

                            }

                        }
                    );

                });

        }
    );

}


/* =========================================================
   COUNTERS
========================================================= */

function updateCount(
    path,
    amount
) {

    const ids = {

        shows:
            "countShows",

        news:
            "countNews",

        videos:
            "countVideos"

    };


    if (ids[path]) {

        document.getElementById(
            ids[path]
        ).textContent =
            amount;

    }

}
