import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
    getFirestore,
    doc,
    getDoc,
    collection,
    getDocs,
    addDoc,
    query,
    orderBy
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


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

const db =
    getFirestore(app);


/* VEILIG TEKST IN HTML ZETTEN */

function escapeHtml(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* INSTELLINGEN */

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


        document.getElementById(
            "heroTitle"
        ).textContent =
            data.heroTitle ||
            "Mistery Duo";


        document.getElementById(
            "heroText"
        ).textContent =
            data.heroText ||
            "";


        document.getElementById(
            "aboutText"
        ).textContent =
            data.aboutText ||
            "";


        document.getElementById(
            "footerText"
        ).textContent =
            data.footerText ||
            "Muziek voor elk moment.";


        if (data.logoUrl) {

            document.getElementById(
                "siteLogo"
            ).src =
                data.logoUrl;

        }


        const frame =
            document.getElementById(
                "livestreamFrame"
            );

        const placeholder =
            document.getElementById(
                "streamPlaceholder"
            );

        const status =
            document.getElementById(
                "streamStatus"
            );


        if (
            data.livestreamActive === true &&
            data.livestreamUrl
        ) {

            frame.src =
                data.livestreamUrl;

            frame.style.display =
                "block";

            placeholder.style.display =
                "none";

            status.classList.add(
                "live"
            );

            status.innerHTML =
                "<span></span> LIVE";

        } else {

            frame.src = "";

            frame.style.display =
                "none";

            placeholder.style.display =
                "flex";

            status.classList.remove(
                "live"
            );

            status.innerHTML =
                "<span></span> Offline";
        }

    } catch (error) {

        console.error(
            "Settings fout:",
            error
        );

    }
}


/* AGENDA */

async function loadAgenda() {

    const container =
        document.getElementById(
            "agendaList"
        );


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


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML =
                `<div class="loading">
                    Er staan momenteel geen optredens gepland.
                </div>`;

            return;
        }


        snapshot.forEach(item => {

            const data =
                item.data();


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "agenda-card";


            card.innerHTML = `

                <div class="date">
                    ${escapeHtml(
                        data.date
                    )}
                </div>

                <h3>
                    ${escapeHtml(
                        data.title ||
                        "Optreden"
                    )}
                </h3>

                <p>
                    ${escapeHtml(
                        data.location ||
                        ""
                    )}
                </p>

                ${
                    data.description
                    ?
                    `<p>
                        ${escapeHtml(
                            data.description
                        )}
                    </p>`
                    :
                    ""
                }

            `;


            container.appendChild(
                card
            );

        });

    } catch (error) {

        console.error(
            "Agenda fout:",
            error
        );


        container.innerHTML =
            `<div class="loading">
                Agenda kon niet worden geladen.
            </div>`;
    }
}


/* MEDIA */

async function loadMedia() {

    const container =
        document.getElementById(
            "mediaGrid"
        );


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


        container.innerHTML = "";


        if (snapshot.empty) {

            container.innerHTML =
                `<div class="loading">
                    Er is nog geen media toegevoegd.
                </div>`;

            return;
        }


        snapshot.forEach(item => {

            const data =
                item.data();


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "media-card";


            let mediaHtml;


            if (
                data.type ===
                "video"
            ) {

                mediaHtml = `

                    <video
                        src="${escapeHtml(
                            data.url
                        )}"
                        controls
                        preload="metadata">
                    </video>

                `;

            } else {

                mediaHtml = `

                    <img
                        src="${escapeHtml(
                            data.url
                        )}"
                        alt="${escapeHtml(
                            data.title ||
                            "Mistery Duo"
                        )}"
                        loading="lazy">

                `;
            }


            card.innerHTML = `

                ${mediaHtml}

                <div class="media-info">

                    <h3>
                        ${escapeHtml(
                            data.title ||
                            ""
                        )}
                    </h3>

                    ${
                        data.description
                        ?
                        `<p>
                            ${escapeHtml(
                                data.description
                            )}
                        </p>`
                        :
                        ""
                    }

                </div>

            `;


            container.appendChild(
                card
            );

        });

    } catch (error) {

        console.error(
            "Media fout:",
            error
        );


        container.innerHTML =
            `<div class="loading">
                Media kon niet worden geladen.
            </div>`;
    }
}


/* AANVRAAG VERSTUREN */

async function submitRequest(event) {

    event.preventDefault();


    const form =
        event.target;

    const button =
        document.getElementById(
            "requestButton"
        );

    const status =
        document.getElementById(
            "requestStatus"
        );


    button.disabled = true;

    status.textContent =
        "Aanvraag wordt verstuurd...";


    try {

        await addDoc(
            collection(
                db,
                "requests"
            ),
            {

                name:
                    document
                        .getElementById(
                            "requestName"
                        )
                        .value
                        .trim(),

                email:
                    document
                        .getElementById(
                            "requestEmail"
                        )
                        .value
                        .trim(),

                phone:
                    document
                        .getElementById(
                            "requestPhone"
                        )
                        .value
                        .trim(),

                date:
                    document
                        .getElementById(
                            "requestDate"
                        )
                        .value,

                location:
                    document
                        .getElementById(
                            "requestLocation"
                        )
                        .value
                        .trim(),

                message:
                    document
                        .getElementById(
                            "requestMessage"
                        )
                        .value
                        .trim(),

                status:
                    "nieuw",

                createdAt:
                    Date.now()
            }
        );


        form.reset();


        status.textContent =
            "✓ Je aanvraag is succesvol verstuurd!";


    } catch (error) {

        console.error(
            "Aanvraag fout:",
            error
        );


        status.textContent =
            "Er ging iets mis. Probeer opnieuw.";

    }


    button.disabled = false;
}


/* START */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        document
            .getElementById(
                "requestForm"
            )
            .addEventListener(
                "submit",
                submitRequest
            );


        await Promise.all([
            loadSettings(),
            loadAgenda(),
            loadMedia()
        ]);

    }
);
