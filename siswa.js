// File: siswa.js

// DATA AWAL (DEFAULT)
// Ini adalah data yang akan digunakan jika browser belum pernah menyimpan data siswa sebelumnya.
// Anda bisa mengisi beberapa data awal di sini.
const DAFTAR_SISWA_DEFAULT = [
    { nisn: "1234567890", nama: "Budi Santoso", kelas: "XII IPA 1" },
    { nisn: "0987654321", nama: "Citra Lestari", kelas: "XI IPS 2" }
];

// FUNGSI UNTUK MENGAMBIL DATA SISWA
// Fungsi ini akan menjadi sumber data utama untuk kedua halaman (index.html dan generator.html)
function getDaftarSiswa() {
    // 1. Cek apakah ada data siswa yang sudah disimpan di LocalStorage browser
    const dataTersimpan = localStorage.getItem('daftarSiswa');
    
    // 2. Jika ADA, gunakan data dari LocalStorage
    if (dataTersimpan) {
        return JSON.parse(dataTersimpan);
    } 
    // 3. Jika TIDAK ADA, gunakan data default dari atas
    else {
        return DAFTAR_SISWA_DEFAULT;
    }
}
