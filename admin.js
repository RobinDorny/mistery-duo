document.addEventListener("DOMContentLoaded", () => {

    // =========================
    // NAVIGATIE
    // =========================

    const menuButtons = document.querySelectorAll(".menu-btn");
    const pages = document.querySelectorAll(".page");

    function openPage(name) {

        pages.forEach(page => {
            page.classList.remove("active");
        });

        const page = document.getElementById(name);

        if (page) {
            page.classList.add("active");
        }

        menuButtons.forEach(button => {
            button.classList.remove("active");

            if (button.dataset.page === name) {
                button.classList.add("active");
            }
        });
    }

    menuButtons.forEach(button => {
        button.addEventListener("click", () => {
            openPage(button.dataset.page);
        });
    });

    document.querySelectorAll("[data-goto]").forEach(button => {
        button.addEventListener("click", () => {
            openPage(button.dataset.goto);
        });
    });


    // =========================
    // OPSLAG
    // =========================

    function get(key, fallback = []) {

        try {
            return JSON.parse(
                localStorage.getItem("mysteryDuo_" + key)
            ) ?? fallback;
        } catch {
            return fallback;
        }
    }

    function set(key, value) {

        localStorage.setItem(
            "mysteryDuo_" + key,
            JSON.stringify(value)
        );

    }


    // =========================
    // DASHBOARD
    // =========================

    function updateDashboard() {

        document.getElementById("videoCount").textContent =
            get("videos").length;

        document.getElementById("eventCount").textContent =
            get("events").length;

        document.getElementById("newsCount").textContent =
            get("news").length;

        document.getElementById("photoCount").textContent =
            get("photos").length;
    }


    // =========================
    // LIVESTREAM
    // =========================

    let live =
        localStorage.getItem("mysteryDuo_live") === "true";

    const youtubeInput =
        document.getElementById("youtubeUrl");

    const player =
        document.getElementById("player");

    const liveMessage =
        document.getElementById("liveMessage");

    const liveBadge =
        document.getElementById("liveBadge");

    const dashboardLive =
        document.getElementById("dashboardLive");

    const dashboardLiveText =
        document.getElementById("dashboardLiveText");


    function youtubeID(url) {

        const match = url.match(
            /(?:youtube\.com\/(?:watch\?v=|live\/|embed\/)|youtu\.be\/)([^&?\/\s]+)/
        );

        return match ? match[1] : null;
    }


    function updateLiveStatus() {

        if (live) {

            liveBadge.textContent = "● LIVE";
            liveBadge.className = "badge live";

            dashboardLive.textContent = "LIVE";
            dashboardLive.className = "badge live";

            dashboardLiveText.textContent =
                "🔴 Mystery Duo is momenteel LIVE";

        } else {

            liveBadge.textContent = "● OFFLINE";
            liveBadge.className = "badge offline";

            dashboardLive.textContent = "OFFLINE";
            dashboardLive.className = "badge offline";

            dashboardLiveText.textContent =
                "Geen livestream actief";
        }
    }


    document.getElementById("loadLive")
        ?.addEventListener("click", () => {

            const url = youtubeInput.value.trim();
            const id = youtubeID(url);

            if (!id) {

                liveMessage.textContent =
                    "❌ Dit is geen geldige YouTube-link.";

                liveMessage.className =
                    "message error";

                return;
            }

            player.innerHTML = `
                <iframe
                    src="https://www.youtube.com/embed/${id}"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen>
                </iframe>
            `;

            localStorage.setItem(
                "mysteryDuo_live_url",
                url
            );

            liveMessage.textContent =
                "✓ Livestream geladen.";

            liveMessage.className =
                "message success";
        });


    document.getElementById("toggleLive")
        ?.addEventListener("click", () => {

            live = !live;

            localStorage.setItem(
                "mysteryDuo_live",
                live
            );

            updateLiveStatus();
        });


    const savedLive =
        localStorage.getItem("mysteryDuo_live_url");

    if (savedLive && youtubeInput) {
        youtubeInput.value = savedLive;
    }

    updateLiveStatus();


    // =========================
    // VIDEO'S
    // =========================

    const videoInput =
        document.getElementById("videoFile");

    const videoPreview =
        document.getElementById("videoPreview");

    const videoMessage =
        document.getElementById("videoMessage");


    videoInput?.addEventListener("change", () => {

        const file = videoInput.files[0];

        if (!file) return;

        const url =
            URL.createObjectURL(file);

        videoPreview.innerHTML = `
            <video
                src="${url}"
                controls
                style="width:100%;border-radius:12px">
            </video>
        `;
    });


    document.getElementById("checkVideo")
        ?.addEventListener("click", () => {

            const title =
                document.getElementById("videoTitle").value.trim();

            const file =
                videoInput.files[0];

            if (!title) {

                videoMessage.textContent =
                    "❌ Geef de video een titel.";

                videoMessage.className =
                    "message error";

                return;
            }

            if (!file) {

                videoMessage.textContent =
                    "❌ Kies eerst een video.";

                videoMessage.className =
                    "message error";

                return;
            }


            const video =
                document.createElement("video");

            video.preload = "metadata";

            video.onloadedmetadata = () => {

                URL.revokeObjectURL(video.src);

                if (video.duration > 60) {

                    videoMessage.textContent =
                        "❌ Video's mogen maximaal 1 minuut zijn.";

                    videoMessage.className =
                        "message error";

                    return;
                }


                const videos =
                    get("videos");

                videos.push({
                    title: title,
                    fileName: file.name,
                    duration: Math.round(video.duration),
                    date: new Date().toLocaleDateString("nl-BE")
                });

                set("videos", videos);

                videoMessage.textContent =
                    "✓ Video toegevoegd.";

                videoMessage.className =
                    "message success";

                document.getElementById(
                    "videoTitle"
                ).value = "";

                videoInput.value = "";

                videoPreview.innerHTML = "";

                updateDashboard();

            };

            video.src =
                URL.createObjectURL(file);
        });


    // =========================
    // OPTREDENS
    // =========================

    document.getElementById("addEvent")
        ?.addEventListener("click", () => {

            const name =
                document.getElementById("eventName").value.trim();

            const location =
                document.getElementById("eventLocation").value.trim();

            const date =
                document.getElementById("eventDate").value;

            const time =
                document.getElementById("eventTime").value;


            if (!name || !location || !date || !time) {

                alert("Vul alle gegevens in.");

                return;
            }


            const events =
                get("events");

            events.push({
                name,
                location,
                date,
                time
            });

            set("events", events);

            document.getElementById("eventName").value = "";
            document.getElementById("eventLocation").value = "";
            document.getElementById("eventDate").value = "";
            document.getElementById("eventTime").value = "";

            renderEvents();
            updateDashboard();

        });


    function renderEvents() {

        const list =
            document.getElementById("eventList");

        if (!list) return;

        const events =
            get("events");

        list.innerHTML = "";

        events.forEach((event, index) => {

            list.innerHTML += `
                <div class="saved-item">

                    <div>
                        <strong>${escapeHTML(event.name)}</strong>

                        <small>
                            📍 ${escapeHTML(event.location)}
                            · ${event.date}
                            · ${event.time}
                        </small>
                    </div>

                    <button
                        class="delete-button"
                        data-delete="events"
                        data-index="${index}">
                        Verwijder
                    </button>

                </div>
            `;
        });

        attachDeleteButtons();
    }


    // =========================
    // NIEUWS
    // =========================

    document.getElementById("addNews")
        ?.addEventListener("click", () => {

            const title =
                document.getElementById("newsTitle").value.trim();

            const text =
                document.getElementById("newsText").value.trim();


            if (!title || !text) {

                alert("Vul de titel en tekst in.");

                return;
            }


            const news =
                get("news");

            news.push({
                title,
                text,
                date: new Date().toLocaleDateString("nl-BE")
            });

            set("news", news);

            document.getElementById("newsTitle").value = "";
            document.getElementById("newsText").value = "";

            renderNews();
            updateDashboard();

            alert("✓ Nieuwsbericht gepubliceerd.");

        });


    function renderNews() {

        const list =
            document.getElementById("newsList");

        if (!list) return;

        const news =
            get("news");

        list.innerHTML = "";

        news.forEach((item, index) => {

            list.innerHTML += `
                <div class="saved-item">

                    <div>
                        <strong>
                            ${escapeHTML(item.title)}
                        </strong>

                        <small>
                            ${escapeHTML(item.date)}
                        </small>
                    </div>

                    <button
                        class="delete-button"
                        data-delete="news"
                        data-index="${index}">
                        Verwijder
                    </button>

                </div>
            `;

        });

        attachDeleteButtons();
    }


    // =========================
    // FOTO'S
    // =========================

    document.getElementById("photoFile")
        ?.addEventListener("change", function () {

            const file = this.files[0];

            if (!file) return;

            const url =
                URL.createObjectURL(file);

            document.getElementById(
                "photoPreview"
            ).innerHTML = `
                <img
                    src="${url}"
                    style="max-width:250px;border-radius:12px">
            `;
        });


    document.getElementById("addPhoto")
        ?.addEventListener("click", () => {

            const input =
                document.getElementById("photoFile");

            const message =
                document.getElementById("photoMessage");

            if (!input.files[0]) {

                message.textContent =
                    "❌ Kies eerst een foto.";

                message.className =
                    "message error";

                return;
            }

            const photos =
                get("photos");

            photos.push({
                name: input.files[0].name,
                date: new Date().toLocaleDateString("nl-BE")
            });

            set("photos", photos);

            input.value = "";

            document.getElementById(
                "photoPreview"
            ).innerHTML = "";

            message.textContent =
                "✓ Foto toegevoegd.";

            message.className =
                "message success";

            updateDashboard();

        });


    // =========================
    // MERCHANDISE
    // =========================

    document.getElementById("addProduct")
        ?.addEventListener("click", () => {

            const name =
                document.getElementById("productName").value.trim();

            const price =
                document.getElementById("productPrice").value.trim();

            const description =
                document.getElementById("productDescription").value.trim();


            if (!name || !price || !description) {

                alert("Vul alle gegevens in.");

                return;
            }


            const products =
                get("products");

            products.push({
                name,
                price,
                description
            });

            set("products", products);

            document.getElementById("productName").value = "";
            document.getElementById("productPrice").value = "";
            document.getElementById("productDescription").value = "";

            renderProducts();

        });


    function renderProducts() {

        const list =
            document.getElementById("productList");

        if (!list) return;

        const products =
            get("products");

        list.innerHTML = "";

        products.forEach((product, index) => {

            list.innerHTML += `
                <div class="saved-item">

                    <div>
                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>

                        <small>
                            € ${escapeHTML(product.price)}
                        </small>
                    </div>

                    <button
                        class="delete-button"
                        data-delete="products"
                        data-index="${index}">
                        Verwijder
                    </button>

                </div>
            `;

        });

        attachDeleteButtons();
    }


    // =========================
    // VERWIJDEREN
    // =========================

    function attachDeleteButtons() {

        document
            .querySelectorAll(".delete-button")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const key =
                        button.dataset.delete;

                    const index =
                        Number(button.dataset.index);

                    const data =
                        get(key);

                    data.splice(index, 1);

                    set(key, data);

                    renderEvents();
                    renderNews();
                    renderProducts();
                    updateDashboard();

                });

            });

    }


    // =========================
    // INSTELLINGEN
    // =========================

    document.getElementById("saveSettings")
        ?.addEventListener("click", () => {

            const name =
                document.getElementById("siteName").value.trim();

            const message =
                document.getElementById("settingsMessage");

            if (!name) {

                message.textContent =
                    "❌ Geef je website een naam.";

                message.className =
                    "message error";

                return;
            }

            localStorage.setItem(
                "mysteryDuo_siteName",
                name
            );

            message.textContent =
                "✓ Instellingen opgeslagen.";

            message.className =
                "message success";

        });


    // =========================
    // HELPERS
    // =========================

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;
    }


    // =========================
    // START
    // =========================

    renderEvents();
    renderNews();
    renderProducts();
    updateDashboard();

});
