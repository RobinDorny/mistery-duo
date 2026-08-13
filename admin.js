import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


/* FIREBASE */

const firebaseConfig = {

    apiKey:
        "AIzaSyDf15-6xqLR32Hq4xXeW5hvfUTqPzi52Vs",

    authDomain:
        "mistery-duo.firebaseapp.com",

    databaseURL:
        "https://mistery-duo-default-rtdb.europe-west1.firebasedatabase.app",

    projectId:
        "mistery-duo",

    storageBucket:
        "mistery-duo.firebasestorage.app",

    messagingSenderId:
        "36695107825",

    appId:
        "1:36695107825:web:d92d202a3dd50c1f932150",

    measurementId:
        "G-P37CVN099B"
};


const app =
    initializeApp(firebaseConfig);


const auth =
    getAuth(app);


const db =
    getFirestore(app);


/* CLOUDINARY */

const CLOUDINARY_CLOUD_NAME =
    "aorisbce";

const CLOUDINARY_UPLOAD_PRESET =
    "mistery_duo_upload";


/* HELPERS */

function get(id) {
    return document.getElementById(id);
}


function status(id, text) {

    const element =
        get(id);

    if (element) {
        element.textContent = text;
    }
}


function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* CLOUDINARY UPLOAD */

async function uploadToCloudinary(file) {

    if (!file) {
        throw new Error(
            "Geen bestand geselecteerd."
        );
    }


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


    const response =
        await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
            {
                method: "POST",
                body: formData
            }
        );


    if (!response.ok) {

        const error =
            await response.text();

        console.error(
            "Cloudinary fout:",
            error
        );

        throw new Error(
            "Cloudinary upload mislukt."
        );
    }


    return await response.json();
}


/* SETTINGS LADEN */

async function loadSettings() {

    try {

        const snapshot =
            await getDoc(
                doc(
                    db,
                    "settings",
                    "main"
                )
            );


        if (!snapshot.exists()) {
            return;
        }


        const data =
            snapshot.data();


        get("heroTitle").value =
            data.heroTitle || "";


        get("heroText").value =
            data.heroText || "";


        get("aboutText").value =
            data.aboutText || "";


        get("footerText").value =
            data.footerText || "";


        get("logoUrl").value =
            data.logoUrl || "";


        get("livestreamUrl").value =
            data.livestreamUrl || "";


        get("livestreamActive").checked =
            data.livestreamActive === true;

    } catch (error) {

        console.error(
            "Settings laden:",
            error
        );

    }
}


/* SETTINGS OPSLAAN */

async function saveSettings(event) {

    event.preventDefault();


    status(
        "settingsStatus",
        "Opslaan..."
    );


    try {

        await setDoc(
            doc(
                db,
                "settings",
                "main"
            ),
            {

                heroTitle:
                    get("heroTitle")
                        .value
                        .trim(),

                heroText:
                    get("heroText")
                        .value
                        .trim(),

                aboutText:
                    get("aboutText")
                        .value
                        .trim(),

                footerText:
                    get("footerText")
                        .value
                        .trim(),

                logoUrl:
                    get("logoUrl")
                        .value
                        .trim()

            },
            {
                merge: true
            }
        );


        status(
            "settingsStatus",
            "✓ Instellingen opgeslagen."
        );

    } catch (error) {

        console.error(error);

        status(
            "settingsStatus",
            "❌ Opslaan mislukt."
        );
    }
}


/* LOGO UPLOADEN */

async function uploadLogo() {

    const file =
        get("logoInput")
            .files[0];


    if (!file) {

        alert(
            "Selecteer eerst een logo."
        );

        return;
    }


    const button =
        get("uploadLogoBtn");


    button.disabled = true;


    status(
        "logoStatus",
        "Logo uploaden..."
    );


    try {

        const result =
            await uploadToCloudinary(
                file
            );


        await setDoc(
            doc(
                db,
                "settings",
                "main"
            ),
            {

                logoUrl:
                    result.secure_url,

                logoPublicId:
                    result.public_id

            },
            {
                merge: true
            }
        );


        get("logoUrl").value =
            result.secure_url;


        get("logoInput").value =
            "";


        status(
            "logoStatus",
            "✓ Logo gewijzigd."
        );

    } catch (error) {

        console.error(error);

        status(
            "logoStatus",
            "❌ Logo upload mislukt."
        );

    }


    button.disabled = false;
}


/* FOTO UPLOAD */

async function uploadPhoto() {

    const file =
        get("photoInput")
            .files[0];


    if (!file) {

        alert(
            "Selecteer eerst een foto."
        );

        return;
    }


    const button =
        get("uploadPhotoBtn");


    button.disabled = true;


    status(
        "photoStatus",
        "Foto uploaden..."
    );


    try {

        const result =
            await uploadToCloudinary(
                file
            );


        await addDoc(
            collection(
                db,
                "media"
            ),
            {

                type:
                    "image",

                url:
                    result.secure_url,

                publicId:
                    result.public_id,

                title:
                    get("photoTitle")
                        .value
                        .trim(),

                description:
                    get("photoDescription")
                        .value
                        .trim(),

                createdAt:
                    Date.now()

            }
        );


        get("photoInput").value =
            "";

        get("photoTitle").value =
            "";

        get("photoDescription").value =
            "";


        status(
            "photoStatus",
            "✓ Foto toegevoegd aan de website."
        );


        await loadMedia();

    } catch (error) {

        console.error(error);

        status(
            "photoStatus",
            "❌ Foto upload mislukt."
        );
    }


    button.disabled = false;
}


/* VIDEO UPLOAD */

async function uploadVideo() {

    const file =
        get("videoInput")
            .files[0];


    if (!file) {

        alert(
            "Selecteer eerst een video."
        );

        return;
    }


    const button =
        get("uploadVideoBtn");


    button.disabled = true;


    status(
        "videoStatus",
        "Video uploaden..."
    );


    try {

        const result =
            await uploadToCloudinary(
                file
            );


        await addDoc(
            collection(
                db,
                "media"
            ),
            {

                type:
                    "video",

                url:
                    result.secure_url,

                publicId:
                    result.public_id,

                title:
                    get("videoTitle")
                        .value
                        .trim(),

                description:
                    get("videoDescription")
                        .value
                        .trim(),

                createdAt:
                    Date.now()

            }
        );


        get("videoInput").value =
            "";

        get("videoTitle").value =
            "";

        get("videoDescription").value =
            "";


        status(
            "videoStatus",
            "✓ Video toegevoegd aan de website."
        );


        await loadMedia();

    } catch (error) {

        console.error(error);

        status(
            "videoStatus",
            "❌ Video upload mislukt."
        );
    }


    button.disabled = false;
}


/* LIVESTREAM */

async function saveStream(event) {

    event.preventDefault();


    status(
        "streamStatus",
        "Opslaan..."
    );


    try {

        await setDoc(
            doc(
                db,
                "settings",
                "main"
            ),
            {

                livestreamUrl:
                    get("livestreamUrl")
                        .value
                        .trim(),

                livestreamActive:
                    get("livestreamActive")
                        .checked

            },
            {
                merge: true
            }
        );


        status(
            "streamStatus",
            "✓ Livestream opgeslagen."
        );

    } catch (error) {

        console.error(error);

        status(
            "streamStatus",
            "❌ Opslaan mislukt."
        );
    }
}


/* AGENDA TOEVOEGEN */

async function addAgenda(event) {

    event.preventDefault();


    status(
        "agendaStatus",
        "Optreden toevoegen..."
    );


    try {

        await addDoc(
            collection(
                db,
                "agenda"
            ),
            {

                date:
                    get("agendaDate")
                        .value,

                title:
                    get("agendaTitle")
                        .value
                        .trim(),

                location:
                    get("agendaLocation")
                        .value
                        .trim(),

                description:
                    get("agendaDescription")
                        .value
                        .trim(),

                createdAt:
                    Date.now()

            }
        );


        event.target.reset();


        status(
            "agendaStatus",
            "✓ Optreden toegevoegd."
        );


        await loadAgenda();

    } catch (error) {

        console.error(error);

        status(
            "agendaStatus",
            "❌ Optreden toevoegen mislukt."
        );
    }
}


/* AGENDA LADEN */

async function loadAgenda() {

    const container =
        get("adminAgendaList");


    container.innerHTML =
        "Agenda laden...";


    try {

        const q =
            query(
                collection(
                    db,
                    "agenda"
                ),
                orderBy(
                    "date",
                    "asc"
                )
            );


        const snapshot =
            await getDocs(q);


        container.innerHTML =
            "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>Geen optredens.</p>";

            return;
        }


        snapshot.forEach(item => {

            const data =
                item.data();


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "admin-agenda-item";


            row.innerHTML = `

                <div>

                    <strong>
                        ${escapeHtml(
                            data.title
                        )}
                    </strong>

                    <p>
                        ${escapeHtml(
                            data.date
                        )}
                        —
                        ${escapeHtml(
                            data.location
                        )}
                    </p>

                </div>

                <button
                    class="delete-button">

                    Verwijderen

                </button>

            `;


            row.querySelector(
                ".delete-button"
            ).addEventListener(
                "click",
                () => deleteAgenda(
                    item.id
                )
            );


            container.appendChild(
                row
            );

        });

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Agenda laden mislukt.</p>";
    }
}


/* AGENDA VERWIJDEREN */

async function deleteAgenda(id) {

    if (
        !confirm(
            "Dit optreden verwijderen?"
        )
    ) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "agenda",
                id
            )
        );


        await loadAgenda();

    } catch (error) {

        console.error(error);

        alert(
            "Verwijderen mislukt."
        );
    }
}


/* AANVRAGEN LADEN */

async function loadRequests() {

    const container =
        get("requestsList");


    container.innerHTML =
        "Aanvragen laden...";


    try {

        const q =
            query(
                collection(
                    db,
                    "requests"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(q);


        container.innerHTML =
            "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>Geen aanvragen.</p>";

            return;
        }


        snapshot.forEach(item => {

            const data =
                item.data();


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "request-card";


            card.innerHTML = `

                <h3>
                    ${escapeHtml(
                        data.name
                    )}
                </h3>

                <p>
                    <strong>E-mail:</strong>
                    ${escapeHtml(
                        data.email
                    )}
                </p>

                <p>
                    <strong>Telefoon:</strong>
                    ${escapeHtml(
                        data.phone
                    )}
                </p>

                <p>
                    <strong>Datum:</strong>
                    ${escapeHtml(
                        data.date
                    )}
                </p>

                <p>
                    <strong>Locatie:</strong>
                    ${escapeHtml(
                        data.location
                    )}
                </p>

                <p>
                    <strong>Bericht:</strong>
                    ${escapeHtml(
                        data.message
                    )}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${escapeHtml(
                        data.status ||
                        "nieuw"
                    )}
                </p>

                <div class="request-actions">

                    <button
                        class="status-button"
                        data-status="bekeken">

                        Bekeken

                    </button>

                    <button
                        class="status-button"
                        data-status="beantwoord">

                        Beantwoord

                    </button>

                    <button
                        class="delete-button">

                        Verwijderen

                    </button>

                </div>

            `;


            card
                .querySelectorAll(
                    ".status-button"
                )
                .forEach(button => {

                    button.addEventListener(
                        "click",
                        () =>
                            updateRequestStatus(
                                item.id,
                                button.dataset.status
                            )
                    );

                });


            card.querySelector(
                ".delete-button"
            ).addEventListener(
                "click",
                () =>
                    deleteRequest(
                        item.id
                    )
            );


            container.appendChild(
                card
            );

        });

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Aanvragen laden mislukt.</p>";
    }
}


/* AANVRAAG STATUS */

async function updateRequestStatus(
    id,
    newStatus
) {

    try {

        await updateDoc(
            doc(
                db,
                "requests",
                id
            ),
            {
                status:
                    newStatus
            }
        );


        await loadRequests();

    } catch (error) {

        console.error(error);

        alert(
            "Status wijzigen mislukt."
        );
    }
}


/* AANVRAAG VERWIJDEREN */

async function deleteRequest(id) {

    if (
        !confirm(
            "Deze aanvraag verwijderen?"
        )
    ) {
        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "requests",
                id
            )
        );


        await loadRequests();

    } catch (error) {

        console.error(error);

        alert(
            "Aanvraag verwijderen mislukt."
        );
    }
}


/* MEDIA LADEN */

async function loadMedia() {

    const container =
        get("adminMediaList");


    container.innerHTML =
        "Media laden...";


    try {

        const q =
            query(
                collection(
                    db,
                    "media"
                ),
                orderBy(
                    "createdAt",
                    "desc"
                )
            );


        const snapshot =
            await getDocs(q);


        container.innerHTML =
            "";


        if (snapshot.empty) {

            container.innerHTML =
                "<p>Geen media.</p>";

            return;
        }


        snapshot.forEach(item => {

            const data =
                item.data();


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "admin-media-card";


            let media;


            if (
                data.type ===
                "video"
            ) {

                media = `

                    <video
                        src="${escapeHtml(
                            data.url
                        )}"
                        controls>
                    </video>

                `;

            } else {

                media = `

                    <img
                        src="${escapeHtml(
                            data.url
                        )}"
                        alt="">

                `;
            }


            card.innerHTML = `

                ${media}

                <div
                    class="admin-media-info">

                    <strong>
                        ${escapeHtml(
                            data.title
                        )}
                    </strong>

                    <p>
                        ${escapeHtml(
                            data.description
                        )}
                    </p>

                    <button
                        class="delete-button">

                        Verwijderen

                    </button>

                </div>

            `;


            card.querySelector(
                ".delete-button"
            ).addEventListener(
                "click",
                () =>
                    deleteMedia(
                        item.id
                    )
            );


            container.appendChild(
                card
            );

        });

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Media laden mislukt.</p>";
    }
}


/* MEDIA VERWIJDEREN */

async function deleteMedia(id) {

    if (
        !confirm(
            "Deze media uit de website verwijderen?"
        )
    ) {
        return;
    }


    try {

        /*
         * We verwijderen de verwijzing uit Firestore.
         *
         * Het bestand op Cloudinary blijft bestaan.
         * Dat is expres: een Cloudinary API Secret mag
         * nooit in browser-JavaScript worden geplaatst.
         */

        await deleteDoc(
            doc(
                db,
                "media",
                id
            )
        );


        await loadMedia();

    } catch (error) {

        console.error(error);

        alert(
            "Media verwijderen mislukt."
        );
    }
}


/* UITLOGGEN */

async function logout() {

    try {

        await signOut(auth);

        location.reload();

    } catch (error) {

        console.error(error);

        alert(
            "Uitloggen mislukt."
        );
    }
}


/* AUTHENTICATION */

onAuthStateChanged(
    auth,
    async user => {

        if (!user) {

            document.body.innerHTML = `

                <div style="
                    min-height:100vh;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    background:#070707;
                    color:white;
                    font-family:Arial;
                    text-align:center;
                    padding:30px;
                ">

                    <div>

                        <h1>
                            Geen toegang
                        </h1>

                        <p style="
                            color:#aaa;
                            margin-top:10px;
                        ">
                            Je moet ingelogd zijn
                            om het beheerplatform
                            te gebruiken.
                        </p>

                    </div>

                </div>

            `;

            return;
        }


        await Promise.all([
            loadSettings(),
            loadAgenda(),
            loadRequests(),
            loadMedia()
        ]);

    }
);


/* KNOPPEN */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        get(
            "settingsForm"
        ).addEventListener(
            "submit",
            saveSettings
        );


        get(
            "streamForm"
        ).addEventListener(
            "submit",
            saveStream
        );


        get(
            "agendaForm"
        ).addEventListener(
            "submit",
            addAgenda
        );


        get(
            "uploadPhotoBtn"
        ).addEventListener(
            "click",
            uploadPhoto
        );


        get(
            "uploadVideoBtn"
        ).addEventListener(
            "click",
            uploadVideo
        );


        get(
            "uploadLogoBtn"
        ).addEventListener(
            "click",
            uploadLogo
        );


        get(
            "refreshRequestsBtn"
        ).addEventListener(
            "click",
            loadRequests
        );


        get(
            "refreshMediaBtn"
        ).addEventListener(
            "click",
            loadMedia
        );


        get(
            "logoutBtn"
        ).addEventListener(
            "click",
            logout
        );

    }
);
