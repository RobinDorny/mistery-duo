/* =====================================================
   MISTERY DUO — WEBSITE JAVASCRIPT
===================================================== */


/* =====================================================
   LOADER
===================================================== */

window.addEventListener("load", () => {

    const loader = document.getElementById("loader");

    setTimeout(() => {

        loader.classList.add("hidden");

    }, 700);

});


/* =====================================================
   NAVBAR
===================================================== */

const navbar = document.getElementById("navbar");

window.addEventListener("scroll", () => {

    if (window.scrollY > 50) {

        navbar.classList.add("scrolled");

    } else {

        navbar.classList.remove("scrolled");

    }

});


/* =====================================================
   MOBILE MENU
===================================================== */

const menuButton =
    document.getElementById("menuButton");

const mobileMenu =
    document.getElementById("mobileMenu");


menuButton.addEventListener("click", () => {

    mobileMenu.classList.toggle("open");

    document.body.classList.toggle("no-scroll");

});


/* Sluit menu na klikken */

document.querySelectorAll(".mobile-menu a").forEach(link => {

    link.addEventListener("click", () => {

        mobileMenu.classList.remove("open");

        document.body.classList.remove("no-scroll");

    });

});


/* =====================================================
   ACTIVE NAVIGATION
===================================================== */

const sections =
    document.querySelectorAll("section[id]");

const navLinks =
    document.querySelectorAll(".desktop-nav a");


const navObserver = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                navLinks.forEach(link => {

                    link.classList.remove("active");

                    if (
                        link.getAttribute("href") ===
                        "#" + entry.target.id
                    ) {

                        link.classList.add("active");

                    }

                });

            }

        });

    },
    {
        rootMargin: "-40% 0px -55% 0px"
    }
);


sections.forEach(section => {

    navObserver.observe(section);

});


/* =====================================================
   SCROLL REVEAL
===================================================== */

const revealElements =
    document.querySelectorAll(".reveal-on-scroll");


const revealObserver = new IntersectionObserver(
    entries => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                entry.target.classList.add("visible");

                revealObserver.unobserve(entry.target);

            }

        });

    },
    {
        threshold: 0.15
    }
);


revealElements.forEach(element => {

    revealObserver.observe(element);

});


/* =====================================================
   BOOKING FORM
===================================================== */

const bookingForm =
    document.getElementById("bookingForm");

const formMessage =
    document.getElementById("formMessage");


bookingForm.addEventListener("submit", event => {

    event.preventDefault();


    const formData =
        new FormData(bookingForm);


    const name =
        formData.get("name");


    formMessage.innerHTML =
        `
        <strong>Bedankt, ${name}!</strong><br>
        Je aanvraag is ingevuld.
        De echte verzending kunnen we later
        koppelen aan het Mistery Duo-beheersysteem.
        `;


    bookingForm.reset();


    formMessage.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

});


/* =====================================================
   CURRENT YEAR
===================================================== */

const year =
    document.getElementById("year");


if (year) {

    year.textContent =
        new Date().getFullYear();

}


/* =====================================================
   VIDEO PLACEHOLDER INTERACTION
===================================================== */

const videoCards =
    document.querySelectorAll(".video-card");


videoCards.forEach(card => {

    card.addEventListener("click", () => {

        const title =
            card.querySelector("h3")?.textContent
            || "Video";


        console.log(
            "Video geselecteerd:",
            title
        );


        /*
            Hier kunnen we later een echte
            video-player openen.
        */

    });

});


/* =====================================================
   PARALLAX HERO
===================================================== */

const hero =
    document.querySelector(".hero");

const heroLogo =
    document.querySelector(".hero-logo-wrap");


window.addEventListener("scroll", () => {

    if (!hero || !heroLogo) return;

    const scroll =
        window.scrollY;

    if (scroll < window.innerHeight) {

        heroLogo.style.transform =
            `translateY(${scroll * 0.08}px)`;

    }

});


/* =====================================================
   MOUSE LIGHT EFFECT
===================================================== */

const heroLight =
    document.querySelector(".hero-light-one");


if (heroLight) {

    window.addEventListener("mousemove", event => {

        const x =
            event.clientX / window.innerWidth;

        const y =
            event.clientY / window.innerHeight;


        heroLight.style.transform =
            `translate(${x * 40}px, ${y * 40}px)`;

    });

}


/* =====================================================
   SMOOTH BUTTON FEEDBACK
===================================================== */

document.querySelectorAll(
    ".gold-button, .outline-button, .dark-button"
).forEach(button => {

    button.addEventListener("mousedown", () => {

        button.style.transform =
            "scale(.97)";

    });


    button.addEventListener("mouseup", () => {

        button.style.transform =
            "";

    });

});
