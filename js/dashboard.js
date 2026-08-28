let currentUser = null;
let currentRole = "user";
let allItems = []; // cache seluruh item dari Firestore untuk difilter di client
let currentQrCode = "QR_Code";

const STATUS_LABEL = {
  ACTIVE: "ACTIVE",
  MAINTENANCE: "MAINTENANCE",
  DAMAGED: "DAMAGED",
  LOST: "LOST",
  RETIRED: "RETIRED",
};
const STATUS_BADGE = {
  ACTIVE: "badge-active",
  MAINTENANCE: "badge-maintenance",
  DAMAGED: "badge-damaged",
  LOST: "badge-lost",
  RETIRED: "badge-retired",
};
const COND_LABEL = {
  GOOD: "GOOD",
  FAIR: "FAIR",
  POOR: "POOR",
  DAMAGED: "DAMAGED",
};
const COND_BADGE = {
  GOOD: "badge-good",
  FAIR: "badge-fair",
  POOR: "badge-poor",
  DAMAGED: "badge-poor",
};

// ---------- AUTH GUARD ----------
auth.onAuthStateChanged(async (user) => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }
  currentUser = user;

  // Ambil profil & role dari Firestore
  let profile = { name: user.displayName || user.email, role: "user" };
  try {
    const doc = await db.collection("users").doc(user.uid).get();
    if (doc.exists) profile = { ...profile, ...doc.data() };
  } catch (e) {
    console.error("Gagal ambil profil user", e);
  }

  currentRole = profile.role || "user";
  document.getElementById("user-name").textContent = profile.name || user.email;
  document.getElementById("user-role").textContent = currentRole;
  document.getElementById("user-avatar").textContent = (
    profile.name ||
    user.email ||
    "?"
  )
    .charAt(0)
    .toUpperCase();

  if (currentRole === "admin") {
    document.getElementById("btn-open-add").style.display = "inline-flex";
  }

  subscribeInventory();
});

document
  .getElementById("btn-logout")
  .addEventListener("click", () => auth.signOut());

// ---------- REALTIME INVENTORY ----------
function subscribeInventory() {
  db.collection("inventory")
    .orderBy("createdAt", "desc")
    .onSnapshot(
      (snap) => {
        allItems = [];
        snap.forEach((doc) => allItems.push({ id: doc.id, ...doc.data() }));
        populateFilterOptions();
        renderTable();
      },
      (err) => {
        console.error(err);
        document.getElementById("table-body").innerHTML =
          `<tr><td colspan="10"><div class="empty"><h3>Gagal memuat data</h3><p>${err.message}</p></div></td></tr>`;
      },
    );
}

function populateFilterOptions() {
  const placements = [
    ...new Set(allItems.map((i) => i.placement).filter(Boolean)),
  ];
  const locations = [
    ...new Set(allItems.map((i) => i.location).filter(Boolean)),
  ];
  fillSelect("f-placement", placements);
  fillSelect("f-location", locations);
}

function fillSelect(id, values) {
  const el = document.getElementById(id);
  const current = el.value;
  el.innerHTML =
    `<option value="">${el.id === "f-placement" ? "Semua Penempatan" : "Semua Lokasi"}</option>` +
    values
      .map((v) => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`)
      .join("");
  el.value = current;
}

// ---------- FILTER & RENDER ----------
["f-search", "f-status", "f-condition", "f-placement", "f-location"].forEach(
  (id) => {
    document.getElementById(id).addEventListener("input", renderTable);
    document.getElementById(id).addEventListener("change", renderTable);
  },
);
document.getElementById("btn-reset-filter").addEventListener("click", () => {
  document.getElementById("f-search").value = "";
  document.getElementById("f-status").value = "";
  document.getElementById("f-condition").value = "";
  document.getElementById("f-placement").value = "";
  document.getElementById("f-location").value = "";
  renderTable();
});

function renderTable() {
  const q = document.getElementById("f-search").value.trim().toLowerCase();
  const status = document.getElementById("f-status").value;
  const condition = document.getElementById("f-condition").value;
  const placement = document.getElementById("f-placement").value;
  const location = document.getElementById("f-location").value;

  let filtered = allItems.filter((item) => {
    if (status && item.status !== status) return false;
    if (condition && item.condition !== condition) return false;
    if (placement && item.placement !== placement) return false;
    if (location && item.location !== location) return false;
    if (q) {
      const hay = [item.code, item.name, item.brand, item.user, item.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const tbody = document.getElementById("table-body");
  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10"><div class="empty"><h3>Belum ada data</h3><p>Tidak ada inventaris yang cocok dengan filter ini.</p></div></td></tr>`;
    return;
  }

  const canEdit = currentRole === "admin";
  tbody.innerHTML = filtered
    .map(
      (item, idx) => `
        <tr>
            <td style="color:#94a3b8; font-size:13px;">${idx + 1}</td>
            <td><span class="asset-code">${escapeHtml(item.code || "-")}</span></td>
            <td>
                <span class="asset-name">${escapeHtml(item.name || "-")}</span>
                ${item.user ? `<div style="font-size:11px; color:#64748b;">🏷️ Pengguna: ${escapeHtml(item.user)}</div>` : ""}
            </td>
            <td>${escapeHtml(item.placement || "-")}</td>
            <td>${escapeHtml(item.location || "-")}</td>
            <td>${escapeHtml(item.category || "-")}</td>
            <td>${escapeHtml(item.brand || "-")}</td>
            <td><span class="badge ${COND_BADGE[item.condition] || "badge-good"}">${COND_LABEL[item.condition] || item.condition || "-"}</span></td>
            <td><span class="badge ${STATUS_BADGE[item.status] || "badge-active"}">${STATUS_LABEL[item.status] || item.status || "-"}</span></td>
            <td style="text-align:center;">
                <div class="actions-wrap">
                    <button class="btn-act btn-act-qr" onclick="openQrModal('${item.id}', '${escapeAttr(item.code)}', '${escapeAttr(item.name)}')" title="Lihat QR Code">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect><path d="M14 14h.01M14 17h.01M17 14h.01M17 17h.01M17 20h.01M20 14h.01M20 17h.01M20 20h.01"></path></svg>
                    </button>
                    ${
                      canEdit
                        ? `
                    <button class="btn-act btn-act-edit" onclick="openEditModal('${item.id}')" title="Edit Data Aset">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                    <button class="btn-act btn-act-delete" onclick="deleteItem('${item.id}', '${escapeAttr(item.code)}')" title="Hapus Aset">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>`
                        : ""
                    }
                </div>
            </td>
        </tr>
    `,
    )
    .join("");
}

// ---------- ADD / EDIT MODAL ----------
document
  .getElementById("btn-open-add")
  .addEventListener("click", () => openAddModal());

function openAddModal() {
  document.getElementById("item-modal-title").textContent = "Tambah Inventaris";
  document.getElementById("item-form").reset();
  document.getElementById("item-id").value = "";
  document.getElementById("item-modal").style.display = "flex";
}

function openEditModal(id) {
  const item = allItems.find((i) => i.id === id);
  if (!item) return;
  document.getElementById("item-modal-title").textContent = "Edit Inventaris";
  document.getElementById("item-id").value = id;
  document.getElementById("i-code").value = item.code || "";
  document.getElementById("i-name").value = item.name || "";
  document.getElementById("i-placement").value = item.placement || "";
  document.getElementById("i-location").value = item.location || "";
  document.getElementById("i-category").value = item.category || "";
  document.getElementById("i-brand").value = item.brand || "";
  document.getElementById("i-condition").value = item.condition || "GOOD";
  document.getElementById("i-status").value = item.status || "ACTIVE";
  document.getElementById("i-user").value = item.user || "";
  document.getElementById("item-modal").style.display = "flex";
}

function closeItemModal() {
  document.getElementById("item-modal").style.display = "none";
}

document.getElementById("item-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("item-id").value;
  const data = {
    code: document.getElementById("i-code").value.trim(),
    name: document.getElementById("i-name").value.trim(),
    placement: document.getElementById("i-placement").value.trim(),
    location: document.getElementById("i-location").value.trim(),
    category: document.getElementById("i-category").value.trim(),
    brand: document.getElementById("i-brand").value.trim(),
    condition: document.getElementById("i-condition").value,
    status: document.getElementById("i-status").value,
    user: document.getElementById("i-user").value.trim(),
    registeredBy: currentUser.displayName || currentUser.email,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  };

  const btn = document.getElementById("btn-save-item");
  btn.disabled = true;
  btn.textContent = "Menyimpan...";

  try {
    if (id) {
      await db.collection("inventory").doc(id).update(data);
      showFlash("Data inventaris berhasil diperbarui.");
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection("inventory").add(data);
      showFlash("Inventaris baru berhasil ditambahkan.");
    }
    closeItemModal();
  } catch (err) {
    alert("Gagal menyimpan data: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Simpan";
  }
});

async function deleteItem(id, code) {
  if (!confirm(`Apakah Anda yakin ingin menghapus inventaris ${code}?`)) return;
  try {
    await db.collection("inventory").doc(id).delete();
    showFlash("Inventaris berhasil dihapus.");
  } catch (err) {
    alert("Gagal menghapus data: " + err.message);
  }
}

function showFlash(msg) {
  const box = document.getElementById("flash-success");
  document.getElementById("flash-text").textContent = msg;
  box.style.display = "flex";
  setTimeout(() => {
    box.style.display = "none";
  }, 3500);
}

// ---------- QR MODAL ----------
function openQrModal(id, code, name) {
  currentQrCode = code || "QR_Code";
  document.getElementById("qr-code-text").textContent = code || "-";
  document.getElementById("qr-name-text").textContent = name || "-";
  // QR berisi kode aset (bisa diarahkan ke URL lain kalau nanti ada halaman publik per-item)
  document.getElementById("qr-img").src =
    "https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=" +
    encodeURIComponent(code || id);
  document.getElementById("qr-modal").style.display = "flex";
}

function closeQrModal() {
  document.getElementById("qr-modal").style.display = "none";
}

function downloadQrPng() {
  const qrImg = document.getElementById("qr-img");
  if (!qrImg || !qrImg.src) return;
  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = function () {
    const canvas = document.createElement("canvas");
    const size = 1000;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);
    const padding = 60;
    ctx.drawImage(
      img,
      padding,
      padding,
      size - padding * 2,
      size - padding * 2,
    );
    const link = document.createElement("a");
    link.download = "QR_" + currentQrCode + ".png";
    link.href = canvas.toDataURL("image/png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  img.src = qrImg.src;
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeQrModal();
    closeItemModal();
  }
});

// ---------- UTIL ----------
function escapeHtml(str) {
  if (str === undefined || str === null) return "";
  return String(str).replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        m
      ],
  );
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/'/g, "\\'");
}
