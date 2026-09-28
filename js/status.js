/* ==========================================================================
   status.js — Lấy trạng thái server real-time từ API mcsrvstat.us
   (chỉ dùng ở trang chủ — /index.html)
   API doc: https://api.mcsrvstat.us/3/{ip}
   Tự động refresh mỗi 45 giây.
   ========================================================================== */

// ⚙️ TÙY CHỈNH: khoảng thời gian tự refresh (mili-giây)
const STATUS_REFRESH_MS = 45000;

(function () {
  const box = document.querySelector("#server-status");
  if (!box) return; // Không phải trang chủ → bỏ qua

  const dot = box.querySelector(".status-dot");
  const label = box.querySelector(".status-label");
  const meta = box.querySelector(".status-meta");
  const playersWrap = box.querySelector(".status-players");

  async function fetchStatus() {
    try {
      const res = await fetch(`https://api.mcsrvstat.us/3/${SERVER_IP}`);
      if (!res.ok) throw new Error("API lỗi: " + res.status);
      const data = await res.json();
      renderStatus(data);
    } catch (err) {
      renderError();
      console.error("Không lấy được trạng thái server:", err);
    }
  }

  function renderStatus(data) {
    const online = !!data.online;

    dot.classList.remove("online", "offline");
    dot.classList.add(online ? "online" : "offline");
    label.textContent = online ? "Server đang ONLINE" : "Server đang OFFLINE";

    meta.innerHTML = "";
    playersWrap.innerHTML = "";

    if (online) {
      const playerCount = data.players ? `${data.players.online ?? 0} / ${data.players.max ?? "?"} người chơi` : "Đang cập nhật số người chơi";
      const version = data.version ? `Phiên bản: ${escapeHTML(String(data.version))}` : "";

      addMeta(playerCount);
      if (version) addMeta(version);

      if (data.players && Array.isArray(data.players.list) && data.players.list.length) {
        data.players.list.slice(0, 20).forEach((name) => {
          const span = document.createElement("span");
          span.textContent = name;
          playersWrap.appendChild(span);
        });
      }

      // Icon server (nếu API trả về base64 icon)
      const iconImg = box.querySelector("#server-icon");
      if (iconImg && data.icon) {
        iconImg.src = data.icon;
        iconImg.style.display = "block";
      }
    } else {
      addMeta("Server hiện không phản hồi — vui lòng thử lại sau.");
    }
  }

  function renderError() {
    dot.classList.remove("online", "offline");
    label.textContent = "Không thể tải trạng thái server";
    meta.innerHTML = "";
    playersWrap.innerHTML = "";
    addMeta("Vui lòng kiểm tra lại kết nối hoặc thử lại sau ít phút.");
  }

  function addMeta(text) {
    const span = document.createElement("span");
    span.textContent = text;
    meta.appendChild(span);
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  fetchStatus();
  setInterval(fetchStatus, STATUS_REFRESH_MS);
})();
