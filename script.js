
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


// =========================
// VERSION 2 — FORMS
// =========================

// To centrally collect RSVP and guestbook submissions, paste the Google Apps Script
// Web App URL here after following SETUP-GOOGLE-SHEETS.md.
// Leave blank while previewing the invitation.
const WEDDING_FORM_ENDPOINT = "";

// Account number copying
document.querySelectorAll("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;

    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      const temp = document.createElement("textarea");
      temp.value = value;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      temp.remove();
    }

    const original = button.querySelector("small").textContent;
    button.querySelector("small").textContent = "복사되었습니다 ✓";
    setTimeout(() => {
      button.querySelector("small").textContent = original;
    }, 1600);
  });
});

// Attendance selection + expandable RSVP form
(() => {
  const buttons = Array.from(document.querySelectorAll(".attendance-choice"));
  const form = document.getElementById("rsvpForm");
  const valueField = document.getElementById("attendanceValue");
  const selectedLabel = document.getElementById("selectedAttendance");
  const status = document.getElementById("rsvpStatus");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const attendance = button.dataset.attendance;

      buttons.forEach((b) => b.classList.toggle("selected", b === button));
      valueField.value = attendance;
      selectedLabel.textContent = `선택: ${attendance}`;
      form.hidden = false;
      status.textContent = "";

      setTimeout(() => {
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 80);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      type: "rsvp",
      attendance: formData.get("attendance"),
      name: formData.get("name"),
      phone: formData.get("phone"),
      note: formData.get("note"),
      submittedAt: new Date().toISOString()
    };

    if (!WEDDING_FORM_ENDPOINT) {
      status.textContent = "제출 기능 연결 준비 중입니다. Google Sheets 연결 후 실제 응답이 저장됩니다.";
      return;
    }

    const submitButton = form.querySelector(".form-submit");
    submitButton.disabled = true;
    status.textContent = "전달 중...";

    try {
      await fetch(WEDDING_FORM_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      status.textContent = "감사합니다. 참석 여부가 전달되었습니다.";
      form.reset();
      valueField.value = payload.attendance;
      selectedLabel.textContent = `선택: ${payload.attendance}`;
    } catch (error) {
      status.textContent = "전송 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    } finally {
      submitButton.disabled = false;
    }
  });
})();

// Guestbook
(() => {
  const form = document.getElementById("guestbookForm");
  const status = document.getElementById("guestbookStatus");
  const messageList = document.getElementById("messageList");

  function showLocalPreview(name, message) {
    const card = document.createElement("article");
    card.className = "message-card";

    const author = document.createElement("strong");
    author.textContent = name;

    const text = document.createElement("p");
    text.textContent = message;

    card.append(author, text);
    messageList.prepend(card);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      type: "message",
      name: formData.get("name"),
      message: formData.get("message"),
      submittedAt: new Date().toISOString()
    };

    if (!WEDDING_FORM_ENDPOINT) {
      status.textContent = "메시지 저장 기능 연결 준비 중입니다. Google Sheets 연결 후 실제 메시지가 저장됩니다.";
      showLocalPreview(payload.name, payload.message);
      form.reset();
      return;
    }

    const submitButton = form.querySelector(".form-submit");
    submitButton.disabled = true;
    status.textContent = "등록 중...";

    try {
      await fetch(WEDDING_FORM_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      status.textContent = "축하 메시지가 등록되었습니다. 감사합니다.";
      showLocalPreview(payload.name, payload.message);
      form.reset();
    } catch (error) {
      status.textContent = "등록 중 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.";
    } finally {
      submitButton.disabled = false;
    }
  });
})();
