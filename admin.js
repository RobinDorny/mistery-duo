// ============================================
// MISTERY DUO - CLOUDINARY CONFIGURATIE
// ============================================

const CLOUDINARY_CLOUD_NAME = "aorisbce";
const CLOUDINARY_UPLOAD_PRESET = "mistery_duo_upload";


// ============================================
// ELEMENTEN
// ============================================

const uploadBtn = document.getElementById("uploadBtn");
const uploadStatus = document.getElementById("uploadStatus");
const latestUpload = document.getElementById("latestUpload");
const logoutBtn = document.getElementById("logoutBtn");
const year = document.getElementById("year");


// ============================================
// JAAR
// ============================================

year.textContent = new Date().getFullYear();


// ============================================
// STATUS FUNCTIE
// ============================================

function showStatus(message, type) {

    uploadStatus.textContent = message;

    uploadStatus.className = "status " + type;
}


// ============================================
// CLOUDINARY WIDGET
// ============================================

const cloudinaryWidget = cloudinary.createUploadWidget(

    {
        cloudName: CLOUDINARY_CLOUD_NAME,

        uploadPreset: CLOUDINARY_UPLOAD_PRESET,

        sources: [
            "local"
        ],

        multiple: false,

        maxFileSize: 1000000000,

        clientAllowedFormats: [
            "jpg",
            "jpeg",
            "png",
            "webp",
            "gif",
            "mp4",
            "mov",
            "webm"
        ],

        showAdvancedOptions: false,

        showCompletedButton: true,

        showUploadMoreButton: true,

        singleUploadAutoClose: false,

        folder: "mistery-duo",

        language: "nl",

        resourceType: "auto",

        theme: "minimal",

        text: {
            en: {
                or: "of",
                browse: "Bestand kiezen"
            }
        }
    },

    (error, result) => {

        // ----------------------------------------
        // FOUT
        // ----------------------------------------

        if (error) {

            console.error("Cloudinary fout:", error);

            showStatus(
                "❌ Er is iets misgegaan tijdens het uploaden.",
                "error"
            );

            uploadBtn.disabled = false;

            return;
        }


        // ----------------------------------------
        // UPLOAD GESTART
        // ----------------------------------------

        if (
            result &&
            result.event === "upload-added"
        ) {

            showStatus(
                "⏳ Upload wordt voorbereid...",
                "loading"
            );

            uploadBtn.disabled = true;
        }


        // ----------------------------------------
        // UPLOAD GESLAAGD
        // ----------------------------------------

        if (
            result &&
            result.event === "success"
        ) {

            console.log(
                "Cloudinary upload:",
                result.info
            );

            const info = result.info;

            showStatus(
                "✅ Upload succesvol!",
                "success"
            );

            uploadBtn.disabled = false;

            showLatestUpload(info);
        }


        // ----------------------------------------
        // WIDGET GESLOTEN
        // ----------------------------------------

        if (
            result &&
            result.event === "close"
        ) {

            uploadBtn.disabled = false;
        }

    }
);


// ============================================
// UPLOAD KNOP
// ============================================

uploadBtn.addEventListener("click", () => {

    showStatus(
        "📂 Kies een foto of video...",
        "loading"
    );

    cloudinaryWidget.open();

});


// ============================================
// LAATSTE UPLOAD TONEN
// ============================================

function showLatestUpload(info) {

    if (!info) {
        return;
    }


    const secureUrl = info.secure_url;

    const resourceType = info.resource_type;

    const fileName =
        info.original_filename || "Mistery Duo media";


    latestUpload.innerHTML = "";


    // ----------------------------------------
    // FOTO
    // ----------------------------------------

    if (resourceType === "image") {

        const image = document.createElement("img");

        image.src = secureUrl;

        image.alt = fileName;

        latestUpload.appendChild(image);
    }


    // ----------------------------------------
    // VIDEO
    // ----------------------------------------

    else if (resourceType === "video") {

        const video = document.createElement("video");

        video.src = secureUrl;

        video.controls = true;

        video.preload = "metadata";

        latestUpload.appendChild(video);
    }


    // ----------------------------------------
    // BESTANDSNAAM
    // ----------------------------------------

    const name = document.createElement("strong");

    name.textContent = fileName;

    latestUpload.appendChild(name);


    // ----------------------------------------
    // URL
    // ----------------------------------------

    const url = document.createElement("a");

    url.href = secureUrl;

    url.target = "_blank";

    url.rel = "noopener noreferrer";

    url.textContent = secureUrl;

    url.className = "media-url";

    latestUpload.appendChild(url);


    // ----------------------------------------
    // CONSOLE
    // ----------------------------------------

    console.log("Media URL:");

    console.log(secureUrl);

    console.log("Resource type:");

    console.log(resourceType);

}


// ============================================
// UITLOGGEN
// ============================================

logoutBtn.addEventListener("click", () => {

    const confirmed =
        confirm("Wil je uitloggen?");

    if (!confirmed) {
        return;
    }


    // Dit wordt later gekoppeld aan
    // Firebase Authentication.

    window.location.href = "index.html";

});
