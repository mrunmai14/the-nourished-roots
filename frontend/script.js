// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('show');
    navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close menu when a link is tapped
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('show');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Shrink nav + add shadow after scrolling
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// Gentle scroll-reveal for sections and cards
const revealTargets = document.querySelectorAll(
  '.section, .card, .feature, .making-card, .blog-card, .community-card, .timeline-item, .image-card'
);

if (revealTargets.length && 'IntersectionObserver' in window) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    revealTargets.forEach(el => el.classList.add('is-visible'));
  } else {
    revealTargets.forEach(el => el.classList.add('reveal'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealTargets.forEach(el => observer.observe(el));
  }
}
document.addEventListener("DOMContentLoaded", function () {

  const filterButtons = document.querySelectorAll(".journal-filter");
  const journalCards = document.querySelectorAll(".journal-card");

  filterButtons.forEach(button => {

    button.addEventListener("click", function () {

      // Remove active class from all buttons
      filterButtons.forEach(btn => {
        btn.classList.remove("active");
      });

      // Add active class to clicked button
      this.classList.add("active");

      // Get selected category
      const selectedFilter = this.getAttribute("data-filter");

      // Show / hide cards
      journalCards.forEach(card => {

        const cardCategory = card.getAttribute("data-category");

        if (
          selectedFilter === "all" ||
          cardCategory === selectedFilter
        ) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }

      });

    });

  });

});
