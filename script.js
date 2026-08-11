// Notice Board filter: clicking a tab shows only the matching
  // card and hides the rest; "All" restores the full grid.
  (function () {
    var tabs = document.querySelectorAll('#noticeTabs .notice-tab');
    var cards = document.querySelectorAll('#noticeGrid .notice-card');
    var grid = document.getElementById('noticeGrid');
 
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var target = tab.getAttribute('data-target');
 
        tabs.forEach(function (t) { t.classList.remove('is-active'); });
        tab.classList.add('is-active');
 
        if (target === 'all') {
          grid.classList.remove('is-filtered');
          cards.forEach(function (card) { card.classList.remove('is-hidden'); });
          return;
        }
 
        grid.classList.add('is-filtered');
        cards.forEach(function (card) {
          card.classList.toggle('is-hidden', card.getAttribute('data-category') !== target);
        });
      });
    });
  })();

// Journal filter: clicking a category button shows only articles
  // tagged with that category and hides the rest; "All" restores
  // the full grid. Mirrors the Notice Board filter above.
  (function () {
    var filters = document.querySelectorAll('.journal-filters .journal-filter');
    var cards = document.querySelectorAll('.journal-grid .journal-card');

    filters.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-filter');

        filters.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');

        cards.forEach(function (card) {
          var show = target === 'all' || card.getAttribute('data-category') === target;
          card.classList.toggle('is-hidden', !show);
        });
      });
    });
  })();

/* ============================================================
   Nourished Roots — site script
   Handles: mobile nav toggle (all pages) + contact form -> Google Sheet
   ============================================================ */
 document.querySelectorAll('.update-copy').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var email = btn.getAttribute('data-email');
      navigator.clipboard.writeText(email).then(function () {
        var original = btn.textContent;
        btn.textContent = 'Copied ' + email;
        btn.classList.add('copied');
        setTimeout(function () {
          btn.textContent = original;
          btn.classList.remove('copied');
        }, 2000);
      });
    });
  });

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

  // ---- Newsletter signup (only runs on journal.html) ----
  var newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    var newsletterStatusEl = document.getElementById("newsletterStatus");
    var newsletterBtn = newsletterForm.querySelector("button[type='submit']");

    // Google Apps Script Web App URL — deploy a script bound to the sheet
    // you want newsletter signups to land in, then paste its /exec URL here.
    // See the setup notes shared alongside this file for the ready-to-paste
    // Apps Script code.
    var NEWSLETTER_WEBHOOK_URL = "PASTE_YOUR_NEWSLETTER_APPS_SCRIPT_URL_HERE";

    newsletterForm.addEventListener("submit", function (event) {
      event.preventDefault();

      // Honeypot check — same pattern as the contact form.
      if (newsletterForm.website && newsletterForm.website.value.trim() !== "") {
        showNewsletterStatus("Thanks for subscribing!", false);
        newsletterForm.reset();
        return;
      }

      var email = newsletterForm.journalEmail.value.trim();

      if (!email) {
        showNewsletterStatus("Please enter your email address.", true);
        return;
      }

      var data = {
        formType: "newsletter",
        email: email,
        submittedAt: new Date().toISOString()
      };

      setNewsletterSubmitting(true);

      sendNewsletterToSheet(data)
        .then(function () {
          showNewsletterStatus("Thanks for subscribing!", false);
          newsletterForm.reset();
        })
        .catch(function () {
          downloadNewsletterAsJSON(data);
          showNewsletterStatus("We couldn't reach our server, so your email downloaded to your device instead — please send it to us at thenourishedroots.in@gmail.com.", true);
          newsletterForm.reset();
        })
        .finally(function () {
          setNewsletterSubmitting(false);
        });
    });

    function sendNewsletterToSheet(data) {
      return fetch(NEWSLETTER_WEBHOOK_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      });
    }

    function downloadNewsletterAsJSON(data) {
      var json = JSON.stringify(data, null, 2);
      var blob = new Blob([json], { type: "application/json" });
      var url = URL.createObjectURL(blob);

      var stamp = data.submittedAt.replace(/[:.]/g, "-");
      var filename = "nourished-roots-newsletter-" + stamp + ".json";

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

    function setNewsletterSubmitting(isSubmitting) {
      if (!newsletterBtn) return;
      newsletterBtn.disabled = isSubmitting;
      newsletterBtn.style.opacity = isSubmitting ? "0.6" : "";
      newsletterBtn.style.pointerEvents = isSubmitting ? "none" : "";
    }

    function showNewsletterStatus(message, isError) {
      if (!newsletterStatusEl) return;
      newsletterStatusEl.textContent = message;
      newsletterStatusEl.classList.toggle("form-status--error", !!isError);
      newsletterStatusEl.classList.toggle("form-status--success", !isError);
    }
  }

  // ---- Contact form (only runs on contact.html) ----
  var form = document.getElementById("contactForm");
  if (!form) return;

  var statusEl = document.getElementById("cfStatus");
  var submitBtn = form.querySelector(".root-send-btn");

  // Google Apps Script Web App URL (deployed from the linked Google Sheet)
  var SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzuEW-HgU-A5zKEyemZ3knEZQ3Vd9TmR9WT4c61PoCXUTQf9NIIobIc81EhypHsrzcikg/exec";

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
    // Apps Script web apps issue a redirect on POST, and fetch() silently
    // downgrades a redirected POST to a GET, which skips doPost entirely.
    // mode:"no-cors" sends the POST as a fire-and-forget request instead,
    // sidestepping the redirect/CORS issue. We can't read the response
    // body this way, so we treat "the request didn't throw" as success.
    return fetch(SHEET_WEBHOOK_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
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