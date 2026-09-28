/* ==========================================================================
   main.js — Chức năng dùng chung cho MỌI trang:
   1. Đổi màu nền header khi scroll
   2. Hamburger menu (mobile)
   3. Nút "Copy IP"
   4. Nút "Mở game ngay" (minecraft://)
   5. Hiệu ứng fade-in khi scroll tới (IntersectionObserver)
   6. Tự động điền năm hiện tại ở footer
   ========================================================================== */

// ⚙️ TÙY CHỈNH: đổi IP server ở đây (dùng chung cho copy IP & status.js)
const SERVER_IP = "viegem.net";

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 1. HEADER ĐỔI MÀU KHI SCROLL ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const onScroll = () => {
      header.classList.toggle("scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- 2. HAMBURGER MENU (MOBILE) ---------- */
  const hamburger = document.querySelector(".hamburger");
  const mainNav = document.querySelector(".main-nav");
  if (hamburger && mainNav) {
    hamburger.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
    // Đóng menu khi bấm 1 link (trên mobile)
    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        hamburger.classList.remove("open");
        hamburger.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- 3. NÚT "COPY IP" ---------- */
  const copyBtn = document.querySelector("#copy-ip-btn");
  const toast = document.querySelector("#copy-toast");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(SERVER_IP);
        } else {
          // Fallback cho trình duyệt cũ / không có clipboard API
          const tmp = document.createElement("textarea");
          tmp.value = SERVER_IP;
          tmp.style.position = "fixed";
          tmp.style.opacity = "0";
          document.body.appendChild(tmp);
          tmp.select();
          document.execCommand("copy");
          document.body.removeChild(tmp);
        }
        showToast("Đã copy IP: " + SERVER_IP);
      } catch (err) {
        showToast("Không thể copy — hãy copy thủ công: " + SERVER_IP);
      }
    });
  }

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 2600);
  }

  /* ---------- 4. NÚT "MỞ GAME NGAY" ---------- */
  const launchBtn = document.querySelector("#launch-game-btn");
  if (launchBtn) {
    launchBtn.addEventListener("click", () => {
      // Thử mở Minecraft qua giao thức minecraft://
      window.location.href = "minecraft://" + SERVER_IP;
      // Nếu trình duyệt không hỗ trợ, sau 1.2s hiện hướng dẫn thủ công
      setTimeout(() => {
        showToast("Nếu game không tự mở, hãy vào Minecraft và thêm IP: " + SERVER_IP);
      }, 1200);
    });
  }

  /* ---------- 5. FADE-IN KHI SCROLL TỚI ---------- */
  const fadeEls = document.querySelectorAll(".fade-up");
  if ("IntersectionObserver" in window && fadeEls.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    fadeEls.forEach((el) => observer.observe(el));
  } else {
    // Trình duyệt không hỗ trợ → hiện luôn
    fadeEls.forEach((el) => el.classList.add("visible"));
  }

  /* ---------- 6. NĂM HIỆN TẠI Ở FOOTER ---------- */
  const yearEl = document.querySelector("#current-year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
