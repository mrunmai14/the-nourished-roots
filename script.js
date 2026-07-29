/* ============================================================
   Nourished Roots — site script
   Handles: mobile nav toggle (all pages) + contact form -> Google Sheet
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

  // ---- Mobile nav toggle (runs on every page) ----
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.classList.toggle("show");
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Close the menu when a link is tapped
    navLinks.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navLinks.classList.remove("show");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });

    // Close the menu if the window is resized back to desktop width
    window.addEventListener("resize", function () {
      if (window.innerWidth > 900) {
        navLinks.classList.remove("show");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  // ---- Contact form (only runs on contact.html) ----
  var form = document.getElementById("contactForm");
  if (!form) return;

  var statusEl = document.getElementById("cfStatus");
  var submitBtn = form.querySelector(".root-send-btn");

  // Google Apps Script Web App URL (deployed from the linked Google Sheet)
  var SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbz6WBNJdFvfZw02-HgAm1an-E-SioWgu5RBTsf_Yu59ueMh4KMGCN_4EHiPA6Qgt8Lu/exec";

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Honeypot check: real visitors never fill this hidden field.
    // If it has a value, silently pretend success and stop — don't
    // let the bot know it was caught.
    if (form.website && form.website.value.trim() !== "") {
      showStatus("Thank you! Your message has been sent.", false);
      form.reset();
      return;
    }

    var data = {
      fullName: form.fullName.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      reason: form.reason.value,
      message: form.message.value.trim(),
      submittedAt: new Date().toISOString()
    };

    var missing = [];
    if (!data.fullName) missing.push("Full Name");
    if (!data.email) missing.push("Email Address");
    if (!data.reason) missing.push("I'm reaching out about");
    if (!data.message) missing.push("Message");

    if (missing.length) {
      showStatus("Please fill in: " + missing.join(", "), true);
      return;
    }

    setSubmitting(true);

    sendToSheet(data)
      .then(function () {
        showStatus("Thank you! Your message has been sent.", false);
        form.reset();
      })
      .catch(function () {
        downloadAsJSON(data);
        showStatus("We couldn't reach our server, so a copy of your message downloaded to your device — please email it to us at thenourishedroots.in@gmail.com.", true);
        form.reset();
      })
      .finally(function () {
        setSubmitting(false);
      });
  });

  function sendToSheet(data) {
    return fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    }).then(function (response) {
      if (!response.ok) {
        throw new Error("Webhook responded with status " + response.status);
      }
      return response.json().catch(function () {
        return { status: "success" };
      });
    });
  }

  function downloadAsJSON(data) {
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);

    var stamp = data.submittedAt.replace(/[:.]/g, "-");
    var filename = "nourished-roots-contact-" + stamp + ".json";

    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.style.opacity = isSubmitting ? "0.6" : "";
    submitBtn.style.pointerEvents = isSubmitting ? "none" : "";
  }

  function showStatus(message, isError) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.classList.toggle("form-status--error", !!isError);
    statusEl.classList.toggle("form-status--success", !isError);
  }
});
