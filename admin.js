/* ============================================================
   MISTERY DUO - ADMIN PLATFORM
   Firebase + Cloudinary
============================================================ */


/* ============================================================
   FIREBASE IMPORTS
============================================================ */

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* ============================================================
   FIREBASE CONFIG
   VERVANG DIT DOOR JOUW BESTAANDE CONFIG
============================================================ */

const firebaseConfig = {

    apiKey: "JOUW_FIREBASE_API_KEY",

    authDomain: "JOUW_PROJECT.firebaseapp.com",

    projectId: "JOUW_PROJECT_ID",

    storageBucket: "JOUW_PROJECT.firebasestorage.app",

    messagingSenderId: "JOUW_MESSAGING_SENDER_ID",

    appId: "JOUW_APP_ID"

};


/* ============================================================
   FIREBASE STARTEN
============================================================ */

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);


/* ============================================================
   CLOUDINARY
============================================================ */

const CLOUDINARY_CLOUD_NAME = "aorisbce";

const CLOUDINARY_UPLOAD_PRESET = "mistery_duo_upload";


/* ============================================================
   ELEMENTEN
============================================================ */

const navItems = document.querySelectorAll(".nav-item");

const sections = document.querySelectorAll(".admin-section");

const pageTitle = document.getElementById("pageTitle");


/* ============================================================
   PAGINA NAVIGATIE
============================================================ */

const titles = {

    dashboard: "Dashboard",

    shows: "Optredens",

    about: "Over ons",

    news: "Nieuws",

    videos: "Video's",

    photos: "Foto's",

    shop: "Merch",

    logo: "Logo"

};


function openSection(sectionName) {

    sections.forEach(section => {

        section.classList.remove("active-section");

    });

    navItems.forEach(item => {

        item.classList.remove("active");

    });


    const section = document.getElementById(sectionName);

    const nav = document.querySelector(
        `.nav-item[data-section="${sectionName}"]`
    );


    if (section) {

        section.classList.add("active-section");

    }


    if (nav) {

        nav.classList.add("active");

    }


    pageTitle.textContent =
        titles[sectionName] || "Dashboard";


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });


    if (sectionName === "shows") {
        loadShows();
    }

    if (sectionName === "news") {
        loadNews();
    }

    if (sectionName === "photos") {
        loadPhotos();
    }

    if (sectionName === "videos") {
        loadVideos();
    }

    if (sectionName === "shop") {
        loadShop();
    }

    if (sectionName === "about") {
        loadAbout();
    }

    if (sectionName === "logo") {
        loadLogo();
    }

}


navItems.forEach(item => {

    item.addEventListener("click", () => {

        openSection(
            item.dataset.section
        );

    });

});


document.querySelectorAll("[data-open]").forEach(button => {

    button.addEventListener("click", () => {

        openSection(button.dataset.open);

    });

});


/* ============================================================
   FORMULIEREN OPENEN / SLUITEN
============================================================ */

document.querySelectorAll("[data-close]").forEach(button => {

    button.addEventListener("click", () => {

        const element =
            document.getElementById(button.dataset.close);

        if (element) {

            element.classList.add("hidden");

        }

    });

});


/* ============================================================
   TOAST
============================================================ */

function showToast(message, type = "success") {

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");

    const toastIcon =
        document.getElementById("toastIcon");


    toastMessage.textContent = message;

    toastIcon.textContent =
        type === "error" ? "!" : "✓";

    toastIcon.style.color =
        type === "error"
            ? "#e56b6f"
            : "#72d19a";


    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* ============================================================
   FIREBASE STATUS
============================================================ */

function firebaseConnected() {

    const element =
        document.getElementById("firebaseStatus");

    element.textContent = "Verbonden";

    element.classList.add("connected");

}


/* ============================================================
   CLOUDINARY UPLOAD WIDGET
============================================================ */

function openCloudinaryUpload(options = {}) {

    return new Promise((resolve, reject) => {

        if (!window.cloudinary) {

            reject(
                new Error("Cloudinary is niet geladen.")
            );

            return;

        }


        const widget =
            window.cloudinary.createUploadWidget(

                {

                    cloudName:
                        CLOUDINARY_CLOUD_NAME,

                    uploadPreset:
                        CLOUDINARY_UPLOAD_PRESET,

                    multiple:
                        options.multiple ?? false,

                    resourceType:
                        options.resourceType ?? "auto",

                    sources: [
                        "local",
                        "camera"
                    ],

                    showAdvancedOptions: false,

                    cropping:
                        options.cropping ?? false,

                    folder:
                        options.folder ?? "mistery-duo",

                    clientAllowedFormats:
                        options.formats || undefined

                },


                (error, result) => {

                    if (error) {

                        console.error(
                            "Cloudinary error:",
                            error
                        );

                        reject(error);

                        return;

                    }


                    if (
                        result &&
                        result.event === "success"
                    ) {

                        resolve(result.info);

                    }

                }

            );


        widget.open();

    });

}


/* ============================================================
   SHOWS
============================================================ */

const newShowButton =
    document.getElementById("newShowButton");


newShowButton.addEventListener("click", () => {

    document.getElementById("showForm")
        .classList.remove("hidden");

    document.getElementById("showFormTitle")
        .textContent = "Nieuw optreden";

    document.getElementById("showFormElement")
        .reset();

    document.getElementById("showId")
        .value = "";

});


const showForm =
    document.getElementById("showFormElement");


showForm.addEventListener("submit", async event => {

    event.preventDefault();


    const id =
        document.getElementById("showId").value;


    const data = {

        name:
            document.getElementById("showName").value.trim(),

        date:
            document.getElementById("showDate").value,

        time:
            document.getElementById("showTime").value,

        location:
            document.getElementById("showLocation").value.trim(),

        description:
            document.getElementById("showDescription").value.trim(),

        updatedAt:
            new Date().toISOString()

    };


    try {

        if (id) {

            await updateDoc(
                doc(db, "shows", id),
                data
            );

            showToast("Optreden aangepast.");

        } else {

            data.createdAt =
                new Date().toISOString();

            await addDoc(
                collection(db, "shows"),
                data
            );

            showToast("Optreden toegevoegd.");

        }


        document.getElementById("showForm")
            .classList.add("hidden");

        await loadShows();

        updateStats();

    } catch (error) {

        console.error(error);

        showToast(
            "Opslaan van optreden mislukt.",
            "error"
        );

    }

});


async function loadShows() {

    const list =
        document.getElementById("showsList");


    list.innerHTML =
        `<div class="loading">Optredens laden...</div>`;


    try {

        const snapshot =
            await getDocs(
                collection(db, "shows")
            );


        if (snapshot.empty) {

            list.innerHTML =
                `<div class="empty">
                    Nog geen optredens.
                </div>`;

            document.getElementById("statShows")
                .textContent = "0";

            return;

        }


        let shows = [];

        snapshot.forEach(item => {

            shows.push({
                id: item.id,
                ...item.data()
            });

        });


        shows.sort((a, b) =>
            String(a.date || "")
                .localeCompare(String(b.date || ""))
        );


        list.innerHTML = "";


        shows.forEach(show => {

            const row =
                document.createElement("div");

            row.className = "item-row";


            row.innerHTML = `

                <div class="item-info">

                    <strong>
                        ${escapeHTML(show.name || "Zonder naam")}
                    </strong>

                    <span>
                        ${escapeHTML(show.date || "Geen datum")}
                        ${show.time ? " • " + escapeHTML(show.time) : ""}
                        ${show.location ? " • " + escapeHTML(show.location) : ""}
                    </span>

                </div>

                <div class="item-actions">

                    <button class="small-button edit-show">
                        Bewerken
                    </button>

                    <button class="small-button delete delete-show">
                        Verwijderen
                    </button>

                </div>

            `;


            row.querySelector(".edit-show")
                .addEventListener("click", () => {

                    editShow(show);

                });


            row.querySelector(".delete-show")
                .addEventListener("click", () => {

                    deleteShow(show.id);

                });


            list.appendChild(row);

        });


        document.getElementById("statShows")
            .textContent = shows.length;


    } catch (error) {

        console.error(error);

        list.innerHTML =
            `<div class="empty">
                Kon de optredens niet laden.
            </div>`;

    }

}


function editShow(show) {

    openSection("shows");


    document.getElementById("showForm")
        .classList.remove("hidden");


    document.getElementById("showFormTitle")
        .textContent = "Optreden aanpassen";


    document.getElementById("showId")
        .value = show.id;

    document.getElementById("showName")
        .value = show.name || "";

    document.getElementById("showDate")
        .value = show.date || "";

    document.getElementById("showTime")
        .value = show.time || "";

    document.getElementById("showLocation")
        .value = show.location || "";

    document.getElementById("showDescription")
        .value = show.description || "";

}


async function deleteShow(id) {

    if (!confirm(
        "Weet je zeker dat je dit optreden wilt verwijderen?"
    )) {
        return;
    }


    try {

        await deleteDoc(
            doc(db, "shows", id)
        );

        showToast("Optreden verwijderd.");

        loadShows();

        updateStats();

    } catch (error) {

        console.error(error);

        showToast(
            "Verwijderen mislukt.",
            "error"
        );

    }

}


/* ============================================================
   ABOUT
============================================================ */

async function loadAbout() {

    try {

        const snapshot =
            await getDoc(
                doc(db, "settings", "about")
            );


        if (!snapshot.exists()) {
            return;
        }


        const data = snapshot.data();


        document.getElementById("aboutTitle")
            .value = data.title || "";

        document.getElementById("aboutText")
            .value = data.text || "";


    } catch (error) {

        console.error(error);

    }

}


document.getElementById("aboutForm")
    .addEventListener("submit", async event => {

        event.preventDefault();


        try {

            await setDoc(
                doc(db, "settings", "about"),
                {

                    title:
                        document.getElementById("aboutTitle").value,

                    text:
                        document.getElementById("aboutText").value,

                    updatedAt:
                        new Date().toISOString()

                },
                {
                    merge: true
                }
            );


            showToast("Over ons opgeslagen.");

        } catch (error) {

            console.error(error);

            showToast(
                "Opslaan mislukt.",
                "error"
            );

        }

    });


/* ============================================================
   NEWS
============================================================ */

document.getElementById("newNewsButton")
    .addEventListener("click", () => {

        document.getElementById("newsForm")
            .classList.remove("hidden");

        document.getElementById("newsFormElement")
            .reset();

        document.getElementById("newsId")
            .value = "";

    });


document.getElementById("newsFormElement")
    .addEventListener("submit", async event => {

        event.preventDefault();


        const id =
            document.getElementById("newsId").value;


        const data = {

            title:
                document.getElementById("newsTitle").value.trim(),

            text:
                document.getElementById("newsText").value.trim(),

            date:
                document.getElementById("newsDate").value,

            updatedAt:
                new Date().toISOString()

        };


        try {

            if (id) {

                await updateDoc(
                    doc(db, "news", id),
                    data
                );

                showToast("Nieuws aangepast.");

            } else {

                data.createdAt =
                    new Date().toISOString();

                await addDoc(
                    collection(db, "news"),
                    data
                );

                showToast("Nieuws gepubliceerd.");

            }


            document.getElementById("newsForm")
                .classList.add("hidden");

            loadNews();

            updateStats();

        } catch (error) {

            console.error(error);

            showToast(
                "Nieuws kon niet worden opgeslagen.",
                "error"
            );

        }

    });


async function loadNews() {

    const list =
        document.getElementById("newsList");


    list.innerHTML =
        `<div class="loading">Nieuws laden...</div>`;


    try {

        const snapshot =
            await getDocs(
                collection(db, "news")
            );


        if (snapshot.empty) {

            list.innerHTML =
                `<div class="empty">
                    Nog geen nieuws.
                </div>`;

            document.getElementById("statNews")
                .textContent = "0";

            return;

        }


        let news = [];

        snapshot.forEach(item => {

            news.push({
                id: item.id,
                ...item.data()
            });

        });


        news.sort((a, b) =>
            String(b.date || "")
                .localeCompare(String(a.date || ""))
        );


        list.innerHTML = "";


        news.forEach(article => {

            const row =
                document.createElement("div");

            row.className = "item-row";


            row.innerHTML = `

                <div class="item-info">

                    <strong>
                        ${escapeHTML(article.title || "Zonder titel")}
                    </strong>

                    <span>
                        ${escapeHTML(article.date || "")}
                    </span>

                </div>

                <div class="item-actions">

                    <button class="small-button edit-news">
                        Bewerken
                    </button>

                    <button class="small-button delete delete-news">
                        Verwijderen
                    </button>

                </div>

            `;


            row.querySelector(".edit-news")
                .addEventListener("click", () => {

                    document.getElementById("newsForm")
                        .classList.remove("hidden");

                    document.getElementById("newsId")
                        .value = article.id;

                    document.getElementById("newsTitle")
                        .value = article.title || "";

                    document.getElementById("newsText")
                        .value = article.text || "";

                    document.getElementById("newsDate")
                        .value = article.date || "";

                });


            row.querySelector(".delete-news")
                .addEventListener("click", () => {

                    deleteNews(article.id);

                });


            list.appendChild(row);

        });


        document.getElementById("statNews")
            .textContent = news.length;


    } catch (error) {

        console.error(error);

        list.innerHTML =
            `<div class="empty">
                Kon nieuws niet laden.
            </div>`;

    }

}


async function deleteNews(id) {

    if (!confirm(
        "Weet je zeker dat je dit nieuwsbericht wilt verwijderen?"
    )) {
        return;
    }


    try {

        await deleteDoc(
            doc(db, "news", id)
        );

        showToast("Nieuws verwijderd.");

        loadNews();

        updateStats();

    } catch (error) {

        console.error(error);

        showToast(
            "Verwijderen mislukt.",
            "error"
        );

    }

}


/* ============================================================
   FOTO UPLOAD
============================================================ */

document.getElementById("uploadPhotoButton")
    .addEventListener("click", async () => {

        try {

            const result =
                await openCloudinaryUpload({

                    resourceType: "image",

                    folder: "mistery-duo/photos",

                    multiple: true,

                    formats: [
                        "jpg",
                        "jpeg",
                        "png",
                        "webp"
                    ]

                });


            await saveMedia(
                result,
                "photo"
            );


            showToast("Foto geüpload.");

            loadPhotos();

            updateStats();


        } catch (error) {

            console.error(error);

            showToast(
                "Foto upload mislukt.",
                "error"
            );

        }

    });


async function saveMedia(info, type) {

    await addDoc(
        collection(db, "media"),
        {

            type: type,

            url:
                info.secure_url,

            publicId:
                info.public_id || "",

            format:
                info.format || "",

            resourceType:
                info.resource_type || type,

            originalFilename:
                info.original_filename || "",

            createdAt:
                new Date().toISOString()

        }
    );

}


/* ============================================================
   VIDEO UPLOAD
============================================================ */

document.getElementById("uploadVideoButton")
    .addEventListener("click", async () => {

        try {

            const result =
                await openCloudinaryUpload({

                    resourceType: "video",

                    folder: "mistery-duo/videos",

                    multiple: false

                });


            await saveMedia(
                result,
                "video"
            );


            showToast("Video geüpload.");

            loadVideos();

            updateStats();


        } catch (error) {

            console.error(error);

            showToast(
                "Video upload mislukt.",
                "error"
            );

        }

    });


/* ============================================================
   FOTO'S LADEN
============================================================ */

async function loadPhotos() {

    const container =
        document.getElementById("photosList");


    container.innerHTML =
        `<div class="loading">Foto's laden...</div>`;


    try {

        const snapshot =
            await getDocs(
                collection(db, "media")
            );


        const photos = [];


        snapshot.forEach(item => {

            const data = item.data();


            if (data.type === "photo") {

                photos.push({
                    id: item.id,
                    ...data
                });

            }

        });


        if (photos.length === 0) {

            container.innerHTML =
                `<div class="empty">
                    Nog geen foto's.
                </div>`;

            document.getElementById("statPhotos")
                .textContent = "0";

            return;

        }


        container.innerHTML = "";


        photos.forEach(photo => {

            container.appendChild(
                createMediaCard(
                    photo,
                    false
                )
            );

        });


        document.getElementById("statPhotos")
            .textContent = photos.length;


    } catch (error) {

        console.error(error);

        container.innerHTML =
            `<div class="empty">
                Foto's konden niet worden geladen.
            </div>`;

    }

}


/* ============================================================
   VIDEO'S LADEN
============================================================ */

async function loadVideos() {

    const container =
        document.getElementById("videosList");


    container.innerHTML =
        `<div class="loading">Video's laden...</div>`;


    try {

        const snapshot =
            await getDocs(
                collection(db, "media")
            );


        const videos = [];


        snapshot.forEach(item => {

            const data = item.data();


            if (data.type === "video") {

                videos.push({
                    id: item.id,
                    ...data
                });

            }

        });


        if (videos.length === 0) {

            container.innerHTML =
                `<div class="empty">
                    Nog geen video's.
                </div>`;

            document.getElementById("statVideos")
                .textContent = "0";

            return;

        }


        container.innerHTML = "";


        videos.forEach(video => {

            container.appendChild(
                createMediaCard(
                    video,
                    true
                )
            );

        });


        document.getElementById("statVideos")
            .textContent = videos.length;


    } catch (error) {

        console.error(error);

        container.innerHTML =
            `<div class="empty">
                Video's konden niet worden geladen.
            </div>`;

    }

}


/* ============================================================
   MEDIA CARD
============================================================ */

function createMediaCard(media, isVideo) {

    const card =
        document.createElement("div");

    card.className = "media-card";


    const preview =
        document.createElement("div");

    preview.className = "media-preview";


    if (isVideo) {

        const video =
            document.createElement("video");

        video.src = media.url;

        video.controls = true;

        video.preload = "metadata";

        preview.appendChild(video);

    } else {

        const image =
            document.createElement("img");

        image.src = media.url;

        image.alt = "Mistery Duo foto";

        image.loading = "lazy";

        preview.appendChild(image);

    }


    const content =
        document.createElement("div");

    content.className = "media-content";


    const title =
        document.createElement("strong");

    title.textContent =
        media.originalFilename ||
        "Mistery Duo media";


    const deleteButton =
        document.createElement("button");

    deleteButton.className =
        "small-button delete";

    deleteButton.textContent =
        "Verwijderen";


    deleteButton.addEventListener(
        "click",
        async () => {

            if (!confirm(
                "Deze media uit Firebase verwijderen?"
            )) {
                return;
            }


            try {

                await deleteDoc(
                    doc(db, "media", media.id)
                );


                showToast(
                    "Media verwijderd."
                );


                if (isVideo) {

                    loadVideos();

                } else {

                    loadPhotos();

                }


                updateStats();


            } catch (error) {

                console.error(error);

                showToast(
                    "Verwijderen mislukt.",
                    "error"
                );

            }

        }
    );


    content.appendChild(title);

    content.appendChild(deleteButton);


    card.appendChild(preview);

    card.appendChild(content);


    return card;

}


/* ============================================================
   SHOP
============================================================ */

document.getElementById("newShopButton")
    .addEventListener("click", () => {

        document.getElementById("shopForm")
            .classList.remove("hidden");

        document.getElementById("shopFormElement")
            .reset();

        document.getElementById("shopId")
            .value = "";

        document.getElementById("shopImage")
            .value = "";

        document.getElementById("shopImagePreview")
            .innerHTML = "";

    });


document.getElementById("uploadShopImageButton")
    .addEventListener("click", async () => {

        try {

            const result =
                await openCloudinaryUpload({

                    resourceType: "image",

                    folder: "mistery-duo/shop",

                    formats: [
                        "jpg",
                        "jpeg",
                        "png",
                        "webp"
                    ]

                });


            document.getElementById("shopImage")
                .value = result.secure_url;


            document.getElementById("shopImagePreview")
                .innerHTML = `

                    <img
                        src="${result.secure_url}"
                        alt="Productafbeelding"
                    >

                `;


            showToast(
                "Productafbeelding geüpload."
            );


        } catch (error) {

            console.error(error);

            showToast(
                "Afbeelding upload mislukt.",
                "error"
            );

        }

    });


document.getElementById("shopFormElement")
    .addEventListener("submit", async event => {

        event.preventDefault();


        const id =
            document.getElementById("shopId").value;


        const data = {

            name:
                document.getElementById("shopName").value.trim(),

            price:
                document.getElementById("shopPrice").value.trim(),

            description:
                document.getElementById("shopDescription").value.trim(),

            image:
                document.getElementById("shopImage").value.trim(),

            updatedAt:
                new Date().toISOString()

        };


        try {

            if (id) {

                await updateDoc(
                    doc(db, "shop", id),
                    data
                );

                showToast("Product aangepast.");

            } else {

                data.createdAt =
                    new Date().toISOString();

                await addDoc(
                    collection(db, "shop"),
                    data
                );

                showToast("Product toegevoegd.");

            }


            document.getElementById("shopForm")
                .classList.add("hidden");

            loadShop();


        } catch (error) {

            console.error(error);

            showToast(
                "Product kon niet worden opgeslagen.",
                "error"
            );

        }

    });


async function loadShop() {

    const list =
        document.getElementById("shopList");


    list.innerHTML =
        `<div class="loading">Producten laden...</div>`;


    try {

        const snapshot =
            await getDocs(
                collection(db, "shop")
            );


        if (snapshot.empty) {

            list.innerHTML =
                `<div class="empty">
                    Nog geen producten.
                </div>`;

            return;

        }


        list.innerHTML = "";


        snapshot.forEach(item => {

            const product =
                item.data();


            const row =
                document.createElement("div");

            row.className = "item-row";


            row.innerHTML = `

                <div class="item-info">

                    <strong>
                        ${escapeHTML(product.name || "Product")}
                    </strong>

                    <span>
                        ${escapeHTML(product.price || "")}
                    </span>

                </div>

                <div class="item-actions">

                    <button class="small-button edit-product">
                        Bewerken
                    </button>

                    <button class="small-button delete delete-product">
                        Verwijderen
                    </button>

                </div>

            `;


            row.querySelector(".edit-product")
                .addEventListener("click", () => {

                    document.getElementById("shopForm")
                        .classList.remove("hidden");

                    document.getElementById("shopId")
                        .value = item.id;

                    document.getElementById("shopName")
                        .value = product.name || "";

                    document.getElementById("shopPrice")
                        .value = product.price || "";

                    document.getElementById("shopDescription")
                        .value = product.description || "";

                    document.getElementById("shopImage")
                        .value = product.image || "";


                    if (product.image) {

                        document.getElementById(
                            "shopImagePreview"
                        ).innerHTML = `

                            <img
                                src="${product.image}"
                                alt="Product"
                            >

                        `;

                    }

                });


            row.querySelector(".delete-product")
                .addEventListener("click", async () => {

                    if (!confirm(
                        "Product verwijderen?"
                    )) {
                        return;
                    }


                    await deleteDoc(
                        doc(db, "shop", item.id)
                    );


                    showToast(
                        "Product verwijderd."
                    );


                    loadShop();

                });


            list.appendChild(row);

        });


    } catch (error) {

        console.error(error);

        list.innerHTML =
            `<div class="empty">
                Producten konden niet worden geladen.
            </div>`;

    }

}


/* ============================================================
   LOGO
============================================================ */

document.getElementById("uploadLogoButton")
    .addEventListener("click", async () => {

        try {

            const result =
                await openCloudinaryUpload({

                    resourceType: "image",

                    folder: "mistery-duo/logo",

                    multiple: false,

                    cropping: false,

                    formats: [
                        "png",
                        "jpg",
                        "jpeg",
                        "webp",
                        "svg"
                    ]

                });


            const logoURL =
                result.secure_url;


            await setDoc(
                doc(db, "settings", "site"),
                {

                    logo:
                        logoURL,

                    logoPublicId:
                        result.public_id || "",

                    updatedAt:
                        new Date().toISOString()

                },
                {
                    merge: true
                }
            );


            document.getElementById("currentLogo")
                .src = logoURL;


            document.getElementById("sidebarLogo")
                .src = logoURL;


            document.getElementById("newLogoPreview")
                .innerHTML = `

                    <img
                        src="${logoURL}"
                        alt="Nieuw Mistery Duo logo"
                    >

                `;


            showToast(
                "Logo succesvol veranderd."
            );


        } catch (error) {

            console.error(error);

            showToast(
                "Logo upload mislukt.",
                "error"
            );

        }

    });


async function loadLogo() {

    try {

        const snapshot =
            await getDoc(
                doc(db, "settings", "site")
            );


        if (!snapshot.exists()) {
            return;
        }


        const data =
            snapshot.data();


        if (!data.logo) {
            return;
        }


        document.getElementById("currentLogo")
            .src = data.logo;


        document.getElementById("sidebarLogo")
            .src = data.logo;


    } catch (error) {

        console.error(error);

    }

}


/* ============================================================
   DASHBOARD STATS
============================================================ */

async function updateStats() {

    try {

        const [
            shows,
            news,
            media
        ] = await Promise.all([

            getDocs(
                collection(db, "shows")
            ),

            getDocs(
                collection(db, "news")
            ),

            getDocs(
                collection(db, "media")
            )

        ]);


        let photos = 0;

        let videos = 0;


        media.forEach(item => {

            const type =
                item.data().type;


            if (type === "photo") {
                photos++;
            }

            if (type === "video") {
                videos++;
            }

        });


        document.getElementById("statShows")
            .textContent = shows.size;

        document.getElementById("statNews")
            .textContent = news.size;

        document.getElementById("statPhotos")
            .textContent = photos;

        document.getElementById("statVideos")
            .textContent = videos;


    } catch (error) {

        console.error(
            "Stats konden niet geladen worden:",
            error
        );

    }

}


/* ============================================================
   HTML VEILIG MAKEN
============================================================ */

function escapeHTML(value) {

    return String(value)

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


/* ============================================================
   START
============================================================ */

async function startAdmin() {

    try {

        firebaseConnected();

        await Promise.all([

            loadShows(),

            loadNews(),

            loadPhotos(),

            loadVideos(),

            loadShop(),

            loadAbout(),

            loadLogo()

        ]);


        await updateStats();


    } catch (error) {

        console.error(
            "Admin start error:",
            error
        );


        document.getElementById(
            "firebaseStatus"
        ).textContent = "Fout";


        showToast(
            "Er is een probleem met Firebase.",
            "error"
        );

    }

}


startAdmin();
