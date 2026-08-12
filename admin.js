import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* =========================================================
   FIREBASE
   ========================================================= */

const firebaseConfig = {

    // PLAATS HIER JE BESTAANDE FIREBASE CONFIG
    apiKey: "JOUW_API_KEY",
    authDomain: "JOUW_PROJECT.firebaseapp.com",
    projectId: "JOUW_PROJECT_ID",
    storageBucket: "JOUW_PROJECT.firebasestorage.app",
    messagingSenderId: "JOUW_SENDER_ID",
    appId: "JOUW_APP_ID"

};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


/* =========================================================
   CLOUDINARY
   ========================================================= */

const CLOUDINARY_CLOUD_NAME = "aorisbce";
const CLOUDINARY_UPLOAD_PRESET = "mistery_duo_upload";


/* =========================================================
   NAVIGATIE
   ========================================================= */

const titles = {

    dashboard: ["Dashboard", "Overzicht van Mistery Duo"],

    home: ["Home", "Beheer de homepagina"],

    about: ["Over ons", "Beheer de informatie over Mistery Duo"],

    shows: ["Optredens", "Beheer optredens"],

    live: ["Live", "Beheer de livestream"],

    videos: ["Video", "Beheer video's"],

    news: ["Nieuws", "Beheer nieuws"],

    photos: ["Foto's", "Beheer foto's"],

    shop: ["Merch", "Beheer merchandise"],

    settings: ["Instellingen", "Website-instellingen"]

};


document.querySelectorAll(".nav-btn").forEach(button => {

    button.addEventListener("click", () => {

        openSection(button.dataset.section);

    });

});


window.openSection = function(section) {

    document.querySelectorAll(".nav-btn")
        .forEach(btn => btn.classList.remove("active"));

    const nav = document.querySelector(
        `.nav-btn[data-section="${section}"]`
    );

    if (nav) nav.classList.add("active");


    document.querySelectorAll(".admin-section")
        .forEach(sec => sec.classList.remove("active"));

    const target = document.getElementById(section);

    if (target) target.classList.add("active");


    document.getElementById("pageTitle").textContent =
        titles[section]?.[0] || "Dashboard";

    document.getElementById("pageSubtitle").textContent =
        titles[section]?.[1] || "";


    if (section === "shows") loadShows();
    if (section === "videos") loadVideos();
    if (section === "news") loadNews();
    if (section === "photos") loadPhotos();
    if (section === "shop") loadShop();
    if (section === "live") loadLive();

};


/* =========================================================
   TOAST
   ========================================================= */

function toast(message) {

    const el = document.getElementById("toast");

    el.textContent = message;
    el.classList.add("show");

    setTimeout(() => {
        el.classList.remove("show");
    }, 3000);

}


/* =========================================================
   HOME
   ========================================================= */

async function loadHome() {

    const snap = await getDoc(
        doc(db, "settings", "home")
    );

    if (!snap.exists()) return;

    const data = snap.data();

    document.getElementById("homeTitle").value =
        data.title || "";

    document.getElementById("homeSubtitle").value =
        data.subtitle || "";

    document.getElementById("homeText").value =
        data.text || "";

}


window.saveHome = async function() {

    await setDoc(
        doc(db, "settings", "home"),
        {
            title: document.getElementById("homeTitle").value,
            subtitle: document.getElementById("homeSubtitle").value,
            text: document.getElementById("homeText").value,
            updatedAt: serverTimestamp()
        },
        { merge: true }
    );

    toast("Home opgeslagen!");

};


/* =========================================================
   ABOUT
   ========================================================= */

async function loadAbout() {

    const snap = await getDoc(
        doc(db, "settings", "about")
    );

    if (!snap.exists()) return;

    const data = snap.data();

    document.getElementById("aboutTitle").value =
        data.title || "";

    document.getElementById("aboutText").value =
        data.text || "";

}


window.saveAbout = async function() {

    await setDoc(
        doc(db, "settings", "about"),
        {
            title: document.getElementById("aboutTitle").value,
            text: document.getElementById("aboutText").value,
            updatedAt: serverTimestamp()
        },
        { merge: true }
    );

    toast("Over ons opgeslagen!");

};


/* =========================================================
   LIVE
   ========================================================= */

async function loadLive() {

    const snap = await getDoc(
        doc(db, "settings", "live")
    );

    if (!snap.exists()) return;

    const data = snap.data();

    document.getElementById("liveEnabled").checked =
        data.enabled === true;

    document.getElementById("liveTitle").value =
        data.title || "";

    document.getElementById("liveDescription").value =
        data.description || "";

    document.getElementById("liveUrl").value =
        data.url || "";

    document.getElementById("liveYoutube").value =
        data.youtube || "";

    updateLivePreview(data);

}


window.saveLive = async function() {

    const data = {

        enabled:
            document.getElementById("liveEnabled").checked,

        title:
            document.getElementById("liveTitle").value,

        description:
            document.getElementById("liveDescription").value,

        url:
            document.getElementById("liveUrl").value,

        youtube:
            document.getElementById("liveYoutube").value,

        updatedAt: serverTimestamp()

    };


    await setDoc(
        doc(db, "settings", "live"),
        data,
        { merge: true }
    );


    updateLivePreview(data);

    toast(
        data.enabled
            ? "🔴 Live staat AAN!"
            : "Live staat UIT."
    );

};


function updateLivePreview(data) {

    const preview =
        document.getElementById("livePreview");

    const dashboard =
        document.getElementById("dashboardLive");


    if (data?.enabled) {

        preview.innerHTML = `
            <div class="play-icon">🔴</div>
            <h3>${escapeHTML(data.title || "Mistery Duo LIVE")}</h3>
            <p>${escapeHTML(data.description || "Live!")}</p>
        `;

        dashboard.innerHTML = `
            <span style="
                display:inline-block;
                width:9px;
                height:9px;
                border-radius:50%;
                background:#35c878;
                margin-right:7px;">
            </span>
            <strong>LIVE</strong>
            — ${escapeHTML(data.title || "")}
        `;

    } else {

        preview.innerHTML = `
            <div class="play-icon">▶</div>
            <h3>Niet live</h3>
            <p>Er is momenteel geen livestream.</p>
        `;

        dashboard.innerHTML = `
            <span class="offline-dot"></span>
            Niet live
        `;

    }

}


/* =========================================================
   SHOWS
   ========================================================= */

async function loadShows() {

    const snapshot =
        await getDocs(collection(db, "shows"));

    const list =
        document.getElementById("showsList");

    list.innerHTML = "";

    document.getElementById("statShows").textContent =
        snapshot.size;


    snapshot.forEach(item => {

        const data = item.data();

        list.innerHTML += `

            <div class="item-card">

                <h3>${escapeHTML(data.title || "Optreden")}</h3>

                <p>
                    📅 ${escapeHTML(data.date || "")}
                </p>

                <p>
                    📍 ${escapeHTML(data.location || "")}
                </p>

                <div class="item-actions">

                    <button
                        onclick="editShow('${item.id}')">
                        ✏️ Bewerken
                    </button>

                    <button
                        onclick="deleteItem('shows','${item.id}')">
                        🗑️ Verwijderen
                    </button>

                </div>

            </div>
        `;

    });

}


window.openShowModal = function() {

    document.getElementById("modalContent").innerHTML = `

        <h2>Optreden toevoegen</h2>

        <div class="form-panel">

            <label>
                Naam
                <input id="mShowTitle">
            </label>

            <label>
                Datum
                <input id="mShowDate" type="date">
            </label>

            <label>
                Locatie
                <input id="mShowLocation">
            </label>

            <label>
                Beschrijving
                <textarea id="mShowDescription"></textarea>
            </label>

            <button
                class="primary-btn"
                onclick="saveShow()">
                Opslaan
            </button>

        </div>
    `;

    showModal();

};


window.saveShow = async function() {

    await addDoc(
        collection(db, "shows"),
        {
            title: document.getElementById("mShowTitle").value,
            date: document.getElementById("mShowDate").value,
            location: document.getElementById("mShowLocation").value,
            description:
                document.getElementById("mShowDescription").value,
            createdAt: serverTimestamp()
        }
    );

    closeModal();
    toast("Optreden toegevoegd!");
    loadShows();

};


/* =========================================================
   VIDEOS
   ========================================================= */

async function loadVideos() {

    const snapshot =
        await getDocs(collection(db, "videos"));

    const list =
        document.getElementById("videosList");

    list.innerHTML = "";

    document.getElementById("statVideos").textContent =
        snapshot.size;


    snapshot.forEach(item => {

        const data = item.data();

        list.innerHTML += `

            <div class="item-card">

                <h3>
                    ${escapeHTML(data.title || "Video")}
                </h3>

                <p>
                    ${escapeHTML(data.url || "")}
                </p>

                <div class="item-actions">

                    <button
                        onclick="deleteItem('videos','${item.id}')">
                        🗑️ Verwijderen
                    </button>

                </div>

            </div>
        `;

    });

}


window.openVideoModal = function() {

    document.getElementById("modalContent").innerHTML = `

        <h2>Video toevoegen</h2>

        <div class="form-panel">

            <label>
                Titel
                <input id="mVideoTitle">
            </label>

            <label>
                Video URL
                <input id="mVideoUrl"
                       placeholder="YouTube of Cloudinary URL">
            </label>

            <button
                class="primary-btn"
                onclick="saveVideo()">
                Opslaan
            </button>

        </div>
    `;

    showModal();

};


window.saveVideo = async function() {

    await addDoc(
        collection(db, "videos"),
        {
            title: document.getElementById("mVideoTitle").value,
            url: document.getElementById("mVideoUrl").value,
            createdAt: serverTimestamp()
        }
    );

    closeModal();
    toast("Video toegevoegd!");
    loadVideos();

};


/* =========================================================
   NEWS
   ========================================================= */

async function loadNews() {

    const snapshot =
        await getDocs(collection(db, "news"));

    const list =
        document.getElementById("newsList");

    list.innerHTML = "";

    document.getElementById("statNews").textContent =
        snapshot.size;


    snapshot.forEach(item => {

        const data = item.data();

        list.innerHTML += `

            <div class="item-card">

                <h3>
                    ${escapeHTML(data.title || "Nieuws")}
                </h3>

                <p>
                    ${escapeHTML(data.text || "")}
                </p>

                <div class="item-actions">

                    <button
                        onclick="deleteItem('news','${item.id}')">
                        🗑️ Verwijderen
                    </button>

                </div>

            </div>

        `;

    });

}


window.openNewsModal = function() {

    document.getElementById("modalContent").innerHTML = `

        <h2>Nieuws toevoegen</h2>

        <div class="form-panel">

            <label>
                Titel
                <input id="mNewsTitle">
            </label>

            <label>
                Bericht
                <textarea id="mNewsText" rows="8"></textarea>
            </label>

            <button
                class="primary-btn"
                onclick="saveNews()">
                Publiceren
            </button>

        </div>
    `;

    showModal();

};


window.saveNews = async function() {

    await addDoc(
        collection(db, "news"),
        {
            title: document.getElementById("mNewsTitle").value,
            text: document.getElementById("mNewsText").value,
            createdAt: serverTimestamp()
        }
    );

    closeModal();
    toast("Nieuws gepubliceerd!");
    loadNews();

};


/* =========================================================
   FOTO'S + CLOUDINARY
   ========================================================= */

document.getElementById("photoUpload")
.addEventListener("change", async event => {

    const files = [...event.target.files];

    for (const file of files) {

        await uploadToCloudinary(file, "photo");

    }

    event.target.value = "";

    loadPhotos();

});


async function uploadToCloudinary(file, type) {

    const progress =
        document.getElementById("uploadProgress");

    const progressBar =
        document.getElementById("progressBar");

    const progressText =
        document.getElementById("progressText");


    progress.classList.remove("hidden");

    progressText.textContent =
        `Uploaden: ${file.name}`;


    const formData = new FormData();

    formData.append("file", file);

    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    const resourceType =
        file.type.startsWith("video/")
            ? "video"
            : "image";


    const response = await fetch(

        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,

        {
            method: "POST",
            body: formData
        }

    );


    if (!response.ok) {

        progress.classList.add("hidden");

        throw new Error("Cloudinary upload mislukt.");

    }


    const data = await response.json();


    if (type === "photo") {

        await addDoc(
            collection(db, "photos"),
            {
                url: data.secure_url,
                publicId: data.public_id,
                createdAt: serverTimestamp()
            }
        );

    }


    progressBar.style.width = "100%";

    progressText.textContent =
        "Upload voltooid!";

    setTimeout(() => {
        progress.classList.add("hidden");
        progressBar.style.width = "0%";
    }, 1000);

}


async function loadPhotos() {

    const snapshot =
        await getDocs(collection(db, "photos"));

    const list =
        document.getElementById("photosList");

    list.innerHTML = "";

    document.getElementById("statPhotos").textContent =
        snapshot.size;


    snapshot.forEach(item => {

        const data = item.data();

        list.innerHTML += `

            <div class="photo-card">

                <img
                    src="${escapeHTML(data.url)}"
                    loading="lazy">

                <button
                    class="photo-delete"
                    onclick="deleteItem('photos','${item.id}')">
                    🗑️
                </button>

            </div>

        `;

    });

}


/* =========================================================
   LOGO UPLOAD
   ========================================================= */

document.getElementById("logoUpload")
.addEventListener("change", async event => {

    const file = event.target.files[0];

    if (!file) return;


    const formData = new FormData();

    formData.append("file", file);

    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    try {

        toast("Logo wordt geüpload...");


        const response = await fetch(

            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,

            {
                method: "POST",
                body: formData
            }

        );


        if (!response.ok)
            throw new Error("Upload mislukt");


        const data = await response.json();


        await setDoc(
            doc(db, "settings", "logo"),
            {
                url: data.secure_url,
                publicId: data.public_id,
                updatedAt: serverTimestamp()
            }
        );


        setLogo(data.secure_url);

        toast("Logo veranderd!");

    }

    catch(error) {

        console.error(error);

        toast("Logo uploaden mislukt.");

    }

});


async function loadLogo() {

    const snap =
        await getDoc(
            doc(db, "settings", "logo")
        );

    if (!snap.exists()) return;

    setLogo(snap.data().url);

}


function setLogo(url) {

    document.getElementById("logoPreview").innerHTML =
        `<img src="${escapeHTML(url)}">`;

    document.getElementById("adminLogoPreview").innerHTML =
        `<img src="${escapeHTML(url)}">`;

}


/* =========================================================
   MERCH
   ========================================================= */

async function loadShop() {

    const snapshot =
        await getDocs(collection(db, "shop"));

    const list =
        document.getElementById("shopList");

    list.innerHTML = "";


    snapshot.forEach(item => {

        const data = item.data();

        list.innerHTML += `

            <div class="item-card">

                <h3>
                    ${escapeHTML(data.name || "Product")}
                </h3>

                <p>
                    € ${escapeHTML(data.price || "0")}
                </p>

                <div class="item-actions">

                    <button
                        onclick="deleteItem('shop','${item.id}')">
                        🗑️ Verwijderen
                    </button>

                </div>

            </div>

        `;

    });

}


window.openShopModal = function() {

    document.getElementById("modalContent").innerHTML = `

        <h2>Merch toevoegen</h2>

        <div class="form-panel">

            <label>
                Productnaam
                <input id="mShopName">
            </label>

            <label>
                Prijs
                <input id="mShopPrice"
                       type="number"
                       step="0.01">
            </label>

            <label>
                Beschrijving
                <textarea id="mShopDescription"></textarea>
            </label>

            <button
                class="primary-btn"
                onclick="saveShop()">
                Product toevoegen
            </button>

        </div>

    `;

    showModal();

};


window.saveShop = async function() {

    await addDoc(
        collection(db, "shop"),
        {
            name:
                document.getElementById("mShopName").value,

            price:
                document.getElementById("mShopPrice").value,

            description:
                document.getElementById("mShopDescription").value,

            createdAt: serverTimestamp()
        }
    );

    closeModal();

    toast("Product toegevoegd!");

    loadShop();

};


/* =========================================================
   VERWIJDEREN
   ========================================================= */

window.deleteItem = async function(collectionName, id) {

    if (!confirm("Weet je zeker dat je dit wilt verwijderen?"))
        return;


    await deleteDoc(
        doc(db, collectionName, id)
    );


    toast("Verwijderd!");

    if (collectionName === "shows")
        loadShows();

    if (collectionName === "videos")
        loadVideos();

    if (collectionName === "news")
        loadNews();

    if (collectionName === "photos")
        loadPhotos();

    if (collectionName === "shop")
        loadShop();

};


/* =========================================================
   MODAL
   ========================================================= */

function showModal() {

    document
        .getElementById("modal")
        .classList.add("show");

}


window.closeModal = function() {

    document
        .getElementById("modal")
        .classList.remove("show");

};


/* =========================================================
   HELPERS
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   START
   ========================================================= */

async function init() {

    try {

        await Promise.all([
            loadHome(),
            loadAbout(),
            loadLive(),
            loadLogo(),
            loadShows(),
            loadVideos(),
            loadNews(),
            loadPhotos(),
            loadShop()
        ]);

        console.log(
            "Mistery Duo admin volledig geladen."
        );

    }

    catch(error) {

        console.error(
            "Firebase fout:",
            error
        );

        toast(
            "Er ging iets mis met Firebase. Controleer je configuratie."
        );

    }

}


init();
