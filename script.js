
// Countdown to June 26, 2027 at 12:00 PM in Seoul (KST).
const weddingDate = new Date("2027-06-26T12:00:00+09:00");

function updateCountdown() {
  const now = new Date();
  const diff = weddingDate - now;

  if (diff <= 0) {
    document.getElementById("days").textContent = "0";
    document.getElementById("hours").textContent = "00";
    document.getElementById("minutes").textContent = "00";
    return;
  }

  const totalMinutes = Math.floor(diff / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  document.getElementById("days").textContent = String(days);
  document.getElementById("hours").textContent = String(hours).padStart(2, "0");
  document.getElementById("minutes").textContent = String(minutes).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 60000);

// Gallery
(() => {
  const gallery = document.getElementById("gallery");
  if (!gallery) return;

  const slides = Array.from(gallery.querySelectorAll(".gallery-slide"));
  const prev = document.getElementById("galleryPrev");
  const next = document.getElementById("galleryNext");
  const current = document.getElementById("galleryCurrent");
  const total = document.getElementById("galleryTotal");
  const progress = document.getElementById("galleryProgress");

  let index = 0;
  let touchStartX = null;

  total.textContent = String(slides.length);

  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach((slide, n) => slide.classList.toggle("active", n === index));
    current.textContent = String(index + 1);
    progress.style.width = `${((index + 1) / slides.length) * 100}%`;
  }

  prev.addEventListener("click", () => show(index - 1));
  next.addEventListener("click", () => show(index + 1));

  gallery.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
  });

  gallery.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  gallery.addEventListener("touchend", (event) => {
    if (touchStartX === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(delta) > 50) {
      show(delta < 0 ? index + 1 : index - 1);
    }
    touchStartX = null;
  }, { passive: true });

  show(0);
})();

// Share / copy link
(() => {
  const button = document.getElementById("shareButton");
  const toast = document.getElementById("toast");

  function showToast() {
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
  }

  button.addEventListener("click", async () => {
    const shareData = {
      title: "형주 & Jenna 모바일 청첩장",
      text: "2027년 6월 26일, 저희 결혼합니다.",
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast();
      }
    } catch (error) {
      // User may simply close the share sheet.
    }
  });
})();
