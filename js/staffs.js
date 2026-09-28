/* ==========================================================================
   staffs.js — CHỈ "TÔ ĐIỂM" THÊM cho các card staff đã có sẵn trong HTML
   (không tự tạo card nữa — xem /staffs/index.html để thêm/sửa staff)

   File này tìm mọi .staff-card có thuộc tính data-discord-id, gọi Lanyard
   API để lấy trạng thái Discord real-time + avatar thật, rồi cập nhật:
     - Chấm trạng thái  → [data-discord-dot]
     - Chữ trạng thái   → [data-discord-text]
     - Avatar Discord   → [data-discord-avatar]

   Nếu file này KHÔNG chạy được (404, lỗi mạng, bị chặn...), card vẫn hiện
   đầy đủ với trạng thái tĩnh đã viết sẵn trong HTML — không ảnh hưởng gì.

   Lưu ý: Lanyard chỉ trả dữ liệu nếu người dùng đó đã tham gia server
   Discord "Lanyard" (https://discord.gg/lanyard) — nếu không, request sẽ
   lỗi và card giữ nguyên trạng thái tĩnh có sẵn (coi như JS "im lặng" bỏ qua).
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".staff-card[data-discord-id]");
  cards.forEach((card) => updateDiscordStatus(card, card.dataset.discordId));
});

async function updateDiscordStatus(card, discordId) {
  const dot = card.querySelector("[data-discord-dot]");
  const text = card.querySelector("[data-discord-text]");
  const avatarImg = card.querySelector("[data-discord-avatar]");

  try {
    const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
    if (!res.ok) throw new Error("Lanyard API lỗi: " + res.status);
    const json = await res.json();
    if (!json.success) throw new Error("Không tìm thấy dữ liệu Discord");

    const user = json.data.discord_user;
    const status = json.data.discord_status || "offline";

    if (user && user.avatar && avatarImg) {
      avatarImg.src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`;
    }

    const statusMap = {
      online: { cls: "online", label: "Online" },
      idle: { cls: "idle", label: "Idle" },
      dnd: { cls: "dnd", label: "Không làm phiền" },
      offline: { cls: "", label: "Offline" },
    };
    const info = statusMap[status] || statusMap.offline;

    if (dot) {
      dot.classList.remove("online", "idle", "dnd");
      if (info.cls) dot.classList.add(info.cls);
    }
    if (text) text.textContent = info.label;
  } catch (err) {
    // Lấy trạng thái real-time thất bại → im lặng giữ nguyên trạng thái
    // tĩnh đã viết sẵn trong HTML, không báo lỗi ra giao diện.
    console.warn(`Không lấy được trạng thái Discord cho ID ${discordId}:`, err);
  }
}
