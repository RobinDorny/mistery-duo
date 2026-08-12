import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";


// ======================================
// FIREBASE
// ======================================

const firebaseConfig = {

    apiKey: "VUL_HIER_JE_API_KEY_IN",

    authDomain:
        "VUL_HIER_JE_PROJECT.firebaseapp.com",

    projectId:
        "VUL_HIER_JE_PROJECT_ID",

    storageBucket:
        "VUL_HIER_JE_PROJECT.firebasestorage.app",

    messagingSenderId:
        "VUL_HIER_JE_SENDER_ID",

    appId:
        "VUL_HIER_JE_APP_ID"
};


const app =
    initializeApp(firebaseConfig);

const db =
    getFirestore(app);


// ======================================
// CLOUDINARY
// ======================================

const CLOUDINARY_CLOUD_NAME =
    "aorisbce";

const CLOUDINARY_UPLOAD_PRESET =
    "mistery_duo_upload";


// ======================================
// ELEMENTEN
// ======================================

const newsForm =
    document.getElementById("newsForm");

const eventForm =
    document.getElementById("eventForm");

const mediaForm =
    document.getElementById("mediaForm");

const message =
    document.getElementById("message");

const uploadProgress =
    document.getElementById("uploadProgress");


// ======================================
// MELDING
// ======================================

function showMessage(text) {

    message.textContent = text;

    message.style.display = "block";
}


// ======================================
// NIEUWS TOEVOEGEN
// ======================================

newsForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const title =
            document.getElementById("newsTitle").value;

        const text =
            document.getElementById("newsText").value;


        try {

            await addDoc(
                collection(db, "news"),
                {

                    title: title,

                    text: text,

                    date: serverTimestamp()

                }
            );


            newsForm.reset();

            showMessage(
                "Nieuws succesvol gepubliceerd!"
            );


        } catch (error) {

            console.error(error);

            showMessage(
                "Er ging iets fout bij het publiceren."
            );
        }
    }
);


// ======================================
// OPTREDEN TOEVOEGEN
// ======================================

eventForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const title =
            document.getElementById("eventTitle").value;

        const date =
            document.getElementById("eventDate").value;

        const location =
            document.getElementById("eventLocation").value;


        try {

            await addDoc(
                collection(db, "events"),
                {

                    title: title,

                    date: date,

                    location: location,

                    createdAt: serverTimestamp()

                }
            );


            eventForm.reset();

            showMessage(
                "Optreden succesvol toegevoegd!"
            );


        } catch (error) {

            console.error(error);

            showMessage(
                "Er ging iets fout bij het toevoegen."
            );
        }
    }
);


// ======================================
// CLOUDINARY UPLOAD
// ======================================

mediaForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const file =
            document.getElementById("mediaFile").files[0];

        const title =
            document.getElementById("mediaTitle").value;

        const selectedType =
            document.getElementById("mediaType").value;


        if (!file) {

            showMessage(
                "Selecteer eerst een foto of video."
            );

            return;
        }


        try {

            uploadProgress.textContent =
                "Uploaden naar Cloudinary...";


            // ==================================
            // CLOUDINARY UPLOAD
            // ==================================

            const formData =
                new FormData();


            formData.append(
                "file",
                file
            );


            formData.append(
                "upload_preset",
                CLOUDINARY_UPLOAD_PRESET
            );


            const resourceType =
                selectedType === "video"
                    ? "video"
                    : "image";


            const cloudinaryURL =
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;


            const response =
                await fetch(
                    cloudinaryURL,
                    {

                        method: "POST",

                        body: formData

                    }
                );


            if (!response.ok) {

                throw new Error(
                    "Cloudinary upload mislukt."
                );
            }


            const result =
                await response.json();


            // URL van Cloudinary
            const fileURL =
                result.secure_url;


            uploadProgress.textContent =
                "Upload gelukt! Gegevens opslaan...";


            // ==================================
            // FIREBASE
            // ==================================

            await addDoc(
                collection(db, "media"),
                {

                    title: title,

                    url: fileURL,

                    type: selectedType,

                    publicId:
                        result.public_id,

                    createdAt:
                        serverTimestamp()

                }
            );


            mediaForm.reset();

            uploadProgress.textContent = "";

            showMessage(
                "Media succesvol geüpload!"
            );


        } catch (error) {

            console.error(error);

            uploadProgress.textContent = "";

            showMessage(
                "Upload mislukt. Controleer Cloudinary en Firebase."
            );
        }
    }
);
