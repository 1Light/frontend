document.addEventListener('DOMContentLoaded', function () {
  const $inner = $("#facultyCarousel .carousel-inner");
  if (!$inner.length) return;

  const visible = 3; // cards visible at once (>=768px)
  let cardWidth, totalItems, scrollPosition;

  // 1) Clone for infinite loop
  const $items = $inner.children(".carousel-item");
  if ($items.length <= visible) return; // nothing to loop

  // Clone last N to the beginning, and first N to the end
  const $firstClones = $items.slice(0, visible).clone(true).addClass('is-clone');
  const $lastClones  = $items.slice(-visible).clone(true).addClass('is-clone');

  $inner.prepend($lastClones);
  $inner.append($firstClones);

  // Re-cache after cloning
  function recalc() {
    cardWidth = $("#facultyCarousel .carousel-item").outerWidth(true);
    totalItems = $("#facultyCarousel .carousel-item").length; // includes clones
  }
  recalc();

  // 2) Layout: on md+ show 3; on smaller we let Bootstrap slide normally
  const useScrollMode = () => window.matchMedia("(min-width: 768px)").matches;

  // Ensure correct classes per mode
  function setMode() {
    if (useScrollMode()) {
      $("#facultyCarousel").removeClass("slide");
      // Start at the first real item (skip prepended clones)
      scrollPosition = visible * cardWidth;
      $inner.scrollLeft(scrollPosition);
      // Stop Bootstrap auto-cycling/wrapping in scroll mode
      new bootstrap.Carousel(document.querySelector("#facultyCarousel"), {
        interval: false,
        wrap: false
      });
    } else {
      // Mobile: native bootstrap slide
      $("#facultyCarousel").addClass("slide");
      new bootstrap.Carousel(document.querySelector("#facultyCarousel"), {
        interval: 4000,
        wrap: true
      });
    }
  }
  setMode();

  // 3) Controls: move by one card, with wrap handling
  $("#facultyCarousel .carousel-control-next").on("click", function () {
    if (!useScrollMode()) return; // mobile uses native slide
    recalc();
    scrollPosition += cardWidth;
    $inner.animate({ scrollLeft: scrollPosition }, 400, function () {
      // If we slid into the trailing clones, jump back to real items
      const maxRealRight = (totalItems - visible) * cardWidth - (visible * cardWidth);
      const rightEdgeOfReal = (totalItems - 2*visible) * cardWidth; // last real index * width
      if (scrollPosition >= rightEdgeOfReal + visible*cardWidth) {
        // Jump to the same visual item in real list
        scrollPosition = visible * cardWidth + (scrollPosition - (rightEdgeOfReal + visible*cardWidth));
        $inner.scrollLeft(scrollPosition);
      }
    });
  });

  $("#facultyCarousel .carousel-control-prev").on("click", function () {
    if (!useScrollMode()) return;
    recalc();
    scrollPosition -= cardWidth;
    $inner.animate({ scrollLeft: scrollPosition }, 400, function () {
      // If we slid into the leading clones, jump to the end of real items
      if (scrollPosition < visible * cardWidth) {
        // distance into clones:
        const offset = (visible * cardWidth) - scrollPosition;
        const rightEdgeOfReal = (totalItems - 2*visible) * cardWidth; // last real start position
        scrollPosition = rightEdgeOfReal + (visible * cardWidth) - offset;
        $inner.scrollLeft(scrollPosition);
      }
    });
  });

  // Recalculate on resize and keep the view aligned
  $(window).on('resize', function () {
    const wasScrollMode = useScrollMode();
    recalc();
    setMode();
    // keep scroll alignment if still in scroll mode
    if (useScrollMode() && wasScrollMode) {
      $inner.scrollLeft(scrollPosition);
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const reveals = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -10% 0px" // start a bit earlier; tweak as you like
    }
  );

  reveals.forEach((el) => observer.observe(el));
});

// static/js/backToTop.js
document.addEventListener("DOMContentLoaded", () => {
  const backToTop = document.getElementById("backToTop");
  if (!backToTop) return;

  // Show or hide button on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 300) {
      backToTop.style.display = "flex";
      backToTop.style.opacity = "1";
    } else {
      backToTop.style.opacity = "0";
      setTimeout(() => {
        if (window.scrollY <= 300) backToTop.style.display = "none";
      }, 300);
    }
  });

  // Smooth scroll to top
  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

window.addEventListener("load", function() {
  const splash = document.getElementById("introSplash");

  if (!splash) return;

  setTimeout(() => {
    splash.classList.add("is-hidden");
  }, 750); // 1 seconds
});

(function () {
  const TOTAL_MS = 750;   // total splash duration
  const ANIM_MS  = 280;   // animation per character
  const BUFFER   = 80;    // so last letter finishes before hide

  const splash = document.getElementById('introSplash');
  const title  = document.getElementById('introText');
  if (!splash || !title) return;

  // Split headline into per-character spans
  const text = title.textContent;
  title.textContent = '';
  const frag = document.createDocumentFragment();
  let i = 0;
  for (const ch of text) {
    const span = document.createElement('span');
    span.className = 'char';
    span.style.setProperty('--i', i);
    span.textContent = ch;
    frag.appendChild(span);
    i++;
  }
  title.appendChild(frag);

  // compute delay per char so the last one finishes before splash ends
  const count = Math.max(1, i);
  const available = Math.max(0, TOTAL_MS - ANIM_MS - BUFFER);
  const perDelay = count > 1 ? available / (count - 1) : 0;

  // push timing vars into CSS
  title.style.setProperty('--char-dur', ANIM_MS + 'ms');
  title.style.setProperty('--delay-step', perDelay + 'ms');

  document.body.classList.add('is-intro-open');

  // Hide splash after TOTAL_MS
  window.addEventListener('load', function () {
    setTimeout(() => {
      splash.classList.add('is-hidden');
      document.body.classList.remove('is-intro-open');
    }, TOTAL_MS);
  });
})();
