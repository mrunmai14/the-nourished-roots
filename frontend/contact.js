// ==========================================
// MOBILE NAV TOGGLE
// ==========================================

const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

if (navToggle && navLinks) {

    navToggle.addEventListener("click", () => {

        const isOpen =
            navLinks.classList.toggle("show");

        navToggle.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );

    });


    // Close menu when a link is clicked
    navLinks
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener("click", () => {

                navLinks.classList.remove("show");

                navToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

}


// ==========================================
// NAVBAR SCROLL
// ==========================================

const nav = document.querySelector(".nav");

if (nav) {

    const onScroll = () => {

        nav.classList.toggle(
            "scrolled",
            window.scrollY > 40
        );

    };

    document.addEventListener(
        "scroll",
        onScroll,
        { passive: true }
    );

    onScroll();

}


// ==========================================
// SCROLL REVEAL
// ==========================================

const revealTargets =
    document.querySelectorAll(
        ".section, .card, .feature, .making-card, .blog-card, .community-card, .timeline-item, .image-card"
    );


if (
    revealTargets.length &&
    "IntersectionObserver" in window
) {

    const prefersReducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (prefersReducedMotion) {

        revealTargets.forEach(el => {

            el.classList.add(
                "is-visible"
            );

        });

    } else {

        revealTargets.forEach(el => {

            el.classList.add(
                "reveal"
            );

        });


        const observer =
            new IntersectionObserver(
                (entries) => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.classList.add(
                                "is-visible"
                            );

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.12,

                    rootMargin:
                        "0px 0px -60px 0px"
                }
            );


        revealTargets.forEach(el => {

            observer.observe(el);

        });

    }

}


// ==========================================
// JOURNAL FILTER
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const filterButtons =
            document.querySelectorAll(
                ".journal-filter"
            );

        const journalCards =
            document.querySelectorAll(
                ".journal-card"
            );


        filterButtons.forEach(button => {

            button.addEventListener(
                "click",
                function () {

                    // Remove active
                    filterButtons.forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                    // Add active
                    this.classList.add(
                        "active"
                    );


                    // Get category
                    const selectedFilter =
                        this.getAttribute(
                            "data-filter"
                        );


                    // Show/hide cards
                    journalCards.forEach(card => {

                        const cardCategory =
                            card.getAttribute(
                                "data-category"
                            );


                        if (
                            selectedFilter === "all" ||
                            cardCategory === selectedFilter
                        ) {

                            card.style.display =
                                "";

                        } else {

                            card.style.display =
                                "none";

                        }

                    });

                }
            );

        });

    }
);


// ==========================================
// CONTACT FORM
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const contactForm =
            document.getElementById(
                "contactForm"
            );


        const formMessage =
            document.getElementById(
                "formMessage"
            );


        // Stop if contact form doesn't exist
        if (!contactForm) {

            return;

        }


        // ==========================================
        // FORM SUBMIT
        // ==========================================

        contactForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                // Get button
                const submitButton =
                    contactForm.querySelector(
                        ".root-send-btn"
                    );


                const buttonText =
                    submitButton.querySelector(
                        "span"
                    );


                // Get values
                const fullName =
                    document
                        .getElementById(
                            "fullName"
                        )
                        .value
                        .trim();


                const email =
                    document
                        .getElementById(
                            "email"
                        )
                        .value
                        .trim();


                const phone =
                    document
                        .getElementById(
                            "phone"
                        )
                        .value
                        .trim();


                const subject =
                    document
                        .getElementById(
                            "subject"
                        )
                        .value;


                const message =
                    document
                        .getElementById(
                            "message"
                        )
                        .value
                        .trim();


                // ==========================================
                // VALIDATION
                // ==========================================

                if (
                    !fullName ||
                    !email ||
                    !subject ||
                    !message
                ) {

                    formMessage.textContent =
                        "Please fill in all required fields.";

                    formMessage.style.color =
                        "#b44b3e";

                    return;

                }


                // ==========================================
                // BUTTON LOADING
                // ==========================================

                submitButton.disabled =
                    true;

                buttonText.textContent =
                    "Sending...";


                // ==========================================
                // FORM DATA
                // ==========================================

                const formData = {

                    fullName: fullName,

                    email: email,

                    phone: phone,

                    subject: subject,

                    message: message

                };


                try {

                    // ==========================================
                    // SEND TO BACKEND
                    // ==========================================

                    const response =
                        await fetch(
                            "http://localhost:5000/api/contact",
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        formData
                                    )

                            }
                        );


                    // Get response
                    const data =
                        await response.json();


                    // ==========================================
                    // SUCCESS
                    // ==========================================

                    if (
                        response.ok &&
                        data.success
                    ) {

                        formMessage.textContent =
                            "Thank you! Your message has been sent successfully.";

                        formMessage.style.color =
                            "#4f5f2f";


                        // Clear form
                        contactForm.reset();

                    }


                    // ==========================================
                    // ERROR
                    // ==========================================

                    else {

                        formMessage.textContent =
                            data.message ||
                            "Unable to send your message.";

                        formMessage.style.color =
                            "#b44b3e";

                    }


                } catch (error) {

                    console.error(
                        "Contact form error:",
                        error
                    );


                    formMessage.textContent =
                        "Unable to connect to the server. Please try again.";

                    formMessage.style.color =
                        "#b44b3e";

                }


                // ==========================================
                // RESET BUTTON
                // ==========================================

                submitButton.disabled =
                    false;

                buttonText.textContent =
                    "Send Message";

            }
        );

    }
);