# IRGT Inventory System (HTML + Firebase)

Website inventaris IT statis: HTML/CSS/JS biasa, hosting di GitHub Pages, database & login pakai Firebase.

## Struktur file

```
irgt-inventory/
├── index.html          # halaman login
├── register.html       # halaman daftar akun
├── dashboard.html       # halaman utama (perlu login)
├── css/style.css
└── js/
    ├── firebase-config.js   # <-- isi dengan config Firebase kamu
    └── dashboard.js
```

## 1. Buat project Firebase

1. Buka https://console.firebase.google.com → **Add project** → beri nama (mis. `irgt-inventory`).
2. Setelah project jadi, klik ikon **</> (Web)** untuk mendaftarkan web app. Beri nama app, lalu **jangan** centang Firebase Hosting (kita pakai GitHub Pages).
3. Firebase akan menampilkan objek `firebaseConfig`. Salin semua isinya.
4. Buka file `js/firebase-config.js`, ganti isi `firebaseConfig` dengan yang kamu salin tadi.

## 2. Aktifkan Authentication

1. Di sidebar Firebase Console → **Build > Authentication > Get started**.
2. Pilih provider **Email/Password** → aktifkan (toggle **Enable**) → Save.

## 3. Buat Firestore Database

1. Sidebar → **Build > Firestore Database > Create database**.
2. Pilih lokasi server terdekat (mis. `asia-southeast2` untuk Indonesia), mode **Production**.
3. Setelah dibuat, buka tab **Rules** dan ganti isinya dengan ini (wajib login untuk baca/tulis, hanya admin yang boleh ubah data inventaris):

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isLoggedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return isLoggedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /users/{userId} {
      allow read: if isLoggedIn();
      allow create: if isLoggedIn() && request.auth.uid == userId;
      allow update: if isAdmin();
    }

    match /inventory/{itemId} {
      allow read: if isLoggedIn();
      allow write: if isAdmin();
    }
  }
}
```

4. Klik **Publish**.

## 4. Jadikan akun pertama sebagai admin

Secara default, akun yang mendaftar lewat `register.html` otomatis berstatus `role: "user"` (read-only) — sesuai catatan di halaman daftar.

Untuk membuat akun **admin** pertama:

1. Daftar dulu lewat `register.html` seperti biasa.
2. Buka Firebase Console → **Firestore Database** → koleksi `users` → cari dokumen dengan UID akunmu.
3. Edit field `role` dari `"user"` menjadi `"admin"`.
4. Refresh dashboard — tombol Tambah/Edit/Hapus akan muncul.

## 5. Publish ke GitHub Pages

1. Buat repo baru di GitHub, upload seluruh isi folder `irgt-inventory/` ke repo tersebut (lewat web upload, GitHub Desktop, atau `git push`).
2. Di repo → **Settings > Pages**.
3. Source: **Deploy from a branch** → Branch: `main` → folder `/ (root)` → **Save**.
4. Tunggu 1-2 menit, GitHub akan kasih URL seperti `https://username.github.io/nama-repo/`.
5. Buka URL itu → akan langsung ke halaman login (`index.html`).

### Penting: whitelist domain di Firebase

Firebase Authentication hanya mengizinkan login dari domain yang terdaftar.

1. Firebase Console → **Authentication > Settings > Authorized domains**.
2. Klik **Add domain**, masukkan domain GitHub Pages kamu, mis. `username.github.io`.

## Cara pakai

- **Daftar** akun baru → otomatis role `user` (hanya bisa lihat & cari data).
- **Admin** (diatur manual lewat Firestore) bisa tambah, edit, hapus inventaris, dan lihat/download QR code tiap aset.
- Semua perubahan data ter-update **real-time** ke semua yang sedang membuka dashboard (Firestore `onSnapshot`).

## Catatan keamanan

Config Firebase (`apiKey`, dll) memang terlihat di source code — ini **normal** untuk aplikasi web Firebase. Keamanan sebenarnya diatur lewat **Firestore Security Rules** di atas, bukan dengan menyembunyikan config tersebut.
