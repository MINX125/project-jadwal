let daftarGuru = {};
let jadwalKelas = {};
let jamConfig = {};

async function loadData() {
    try {
        const guruRes = await fetch('./file/guru.json');
        const jadwalRes = await fetch('./file/jadwal.json');
        
        if (!guruRes.ok || !jadwalRes.ok) throw new Error("File tidak ditemukan");

        daftarGuru = await guruRes.json();
        jadwalKelas = await jadwalRes.json();
        
        // --- INI PENTING ---
        // Mengisi dropdown kelas secara otomatis berdasarkan data di jadwal.json
        isiOpsiKelas();
        
        jamConfig = {
            "Senin": [
                {w:"07.00-08.00", s:"UPACARA"},
                {w:"08.00-08.40", i:0}, {w:"08.40-09.20", i:1},
                {w:"09.20-09.40", s:"ISTIRAHAT 1"},
                {w:"09.40-10.20", i:2}, {w:"10.20-11.00", i:3},
                {w:"11.00-11.40", i:4}, {w:"11.40-12.40", s:"ISTIRAHAT 2 / DHUHUR"},
                {w:"12.40-13.20", i:5}, {w:"13.20-14.00", i:6}, {w:"14.00-14.40", i:7}
            ],
            "Selasa": [
                {w:"06.45-07.25", s:"PEMBIASAAN / DHUHA"},
                {w:"07.25-08.05", i:0}, {w:"08.05-08.45", i:1}, {w:"08.45-09.25", i:2},
                {w:"09.25-09.45", s:"ISTIRAHAT 1"},
                {w:"09.45-10.25", i:3}, {w:"10.25-11.05", i:4}, {w:"11.05-11.45", i:5},
                {w:"11.45-12.45", s:"ISTIRAHAT 2 / DHUHUR"},
                {w:"12.45-13.25", i:6}, {w:"13.25-14.05", i:7}, {w:"14.05-14.45", i:8}
            ],
            "Rabu": [
                {w:"06.45-07.25", s:"PEMBIASAAN / DHUHA"},
                {w:"07.25-08.05", i:0}, {w:"08.05-08.45", i:1}, {w:"08.45-09.25", i:2},
                {w:"09.25-09.45", s:"ISTIRAHAT 1"},
                {w:"09.45-10.25", i:3}, {w:"10.25-11.05", i:4}, {w:"11.05-11.45", i:5},
                {w:"11.45-12.45", s:"ISTIRAHAT 2 / DHUHUR"},
                {w:"12.45-13.25", i:6}, {w:"13.25-14.05", i:7}, {w:"14.05-14.45", i:8}
            ],
            "Kamis": [
                {w:"06.45-07.25", s:"PEMBIASAAN / DHUHA"},
                {w:"07.25-08.05", i:0}, {w:"08.05-08.45", i:1}, {w:"08.45-09.25", i:2},
                {w:"09.25-09.45", s:"ISTIRAHAT 1"},
                {w:"09.45-10.25", i:3}, {w:"10.25-11.05", i:4}, {w:"11.05-11.45", i:5},
                {w:"11.45-12.45", s:"ISTIRAHAT 2 / DHUHUR"},
                {w:"12.45-13.25", i:6}, {w:"13.25-14.05", i:7}, {w:"14.05-14.45", i:8}
            ],
            "Jumat": [
                {w:"07.00-07.40", s:"DHUHA / SENAM"},
                {w:"07.40-08.20", i:0}, {w:"08.20-09.00", i:1}, {w:"09.00-09.40", i:2},
                {w:"09.40-10.00", s:"ISTIRAHAT"},
                {w:"10.00-10.40", i:3}, {w:"10.40-11.20", i:4},
                {w:"11.20-12.30", s:"JUMATAN / DHUHUR"},
                {w:"12.30-13.10", i:5}, {w:"13.10-13.50", i:6}
            ]
        };
    } catch (e) { console.error("Gagal load data"); }
}

function isiOpsiKelas() {
    const pilihKelas = document.getElementById('kelas');
    if (!pilihKelas) return;
    
    pilihKelas.innerHTML = ""; 
    const daftarKelas = Object.keys(jadwalKelas).sort();

    daftarKelas.forEach(namaKelas => {
        const opt = document.createElement('option');
        opt.value = namaKelas;
        opt.innerHTML = "Kelas " + namaKelas;
        pilihKelas.appendChild(opt);
    });
}

function tampilkanJadwal() {
    const k = document.getElementById('kelas').value;
    const h = document.getElementById('hari').value;
    const out = document.getElementById('output');
    out.innerHTML = "";

    if(!jadwalKelas[k] || !jadwalKelas[k][h]) return;

    const sekarang = new Date();
    const jamMenitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();
    const daftarHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const namaHariSekarang = daftarHari[sekarang.getDay()];

        jamConfig[h].forEach((p, index) => {
        let kodeGuru = jadwalKelas[k][h][p.i];
        let info = "";

        // 1. Cek dulu apakah ini jam Spesial (Istirahat/Dhuha)
        if (p.s) {
            info = p.s;
        } 
        // 2. Logika OTOMATIS KOKURIKULER (Rabu, Kamis, Jumat)
        else if ((h === "Rabu" || h === "Kamis" || h === "Jumat") && index >= jamConfig[h].length - 2) {
            info = "KOKURIKULER";
        }
        // 3. Kalau bukan spesial & bukan kokurikuler, baru ambil nama guru
        else {
            info = daftarGuru[kodeGuru] || "Kode " + (kodeGuru || "-");
        }

        // --- Sisanya ke bawah (isActive, cls, innerHTML) tetap sama ---
        let isActive = false;
        if (h.toLowerCase() === namaHariSekarang.toLowerCase()) {
            const range = p.w.split('-');
            const mulai = range[0].split('.');
            const selesai = range[1].split('.');
            const m = parseInt(mulai[0]) * 60 + parseInt(mulai[1]);
            const s = parseInt(selesai[0]) * 60 + parseInt(selesai[1]);
            if (jamMenitSekarang >= m && jamMenitSekarang < s) isActive = true;
        }

        let cls = (p.s || info === "KOKURIKULER") ? "card special" : "card";
        if (isActive) cls += " active-now";

        out.innerHTML += `
            <div class="${cls}">
                <div class="time">${isActive ? "<b>● SEKARANG</b>" : p.w}</div>
                <div class="desc">${info} ${isActive ? "<br><small style='color:#00ff00'>Sedang Berlangsung</small>" : ""}</div>
            </div>`;
    });
}
function modeGuruLive() {
    const out = document.getElementById('output');
    out.innerHTML = "<h3 style='text-align:center; color:var(--accent); margin-bottom:20px;'>🕵️ Live Tracking Semua Kelas</h3>";
    
    const sekarang = new Date();
    const jamMenitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();
    const daftarHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const namaHariSekarang = daftarHari[sekarang.getDay()];

    // Cek apakah ini hari sekolah
    if (namaHariSekarang === "Minggu" || namaHariSekarang === "Sabtu") {
        out.innerHTML += "<p style='text-align:center;'>Sekarang hari libur, tidak ada KBM.</p>";
        return;
    }

    // Ambil daftar semua kelas dan urutkan
    const semuaKelas = Object.keys(jadwalKelas).sort();

    semuaKelas.forEach(namaKelas => {
        let pelajaranSekarang = "Selesai / Pulang";
        let jamAktif = "";

        // Cari pelajaran yang jamnya cocok sekarang di kelas ini
        jamConfig[namaHariSekarang].forEach((p, index) => {
            const range = p.w.split('-');
            const mulai = range[0].split('.');
            const selesai = range[1].split('.');
            const m = parseInt(mulai[0]) * 60 + parseInt(mulai[1]);
            const s = parseInt(selesai[0]) * 60 + parseInt(selesai[1]);

            if (jamMenitSekarang >= m && jamMenitSekarang < s) {
                jamAktif = p.w;
                if (p.s) {
                    pelajaranSekarang = p.s;
                } else if ((namaHariSekarang === "Rabu" || namaHariSekarang === "Kamis" || namaHariSekarang === "Jumat") && index >= jamConfig[namaHariSekarang].length - 2) {
                    pelajaranSekarang = "KOKURIKULER";
                } else {
                    let kode = jadwalKelas[namaKelas][namaHariSekarang][p.i];
                    pelajaranSekarang = daftarGuru[kode] || "Kode " + kode;
                }
            }
        });

        // Tampilkan hasil scanning per kelas
        out.innerHTML += `
            <div class="card" style="margin-bottom: 8px; border-left: 5px solid var(--accent);">
                <div class="time" style="min-width: 60px;">${namaKelas}</div>
                <div class="desc">
                    <small style="color:var(--text-dim)">${jamAktif || "Luar Jam KBM"}</small><br>
                    <b>${pelajaranSekarang}</b>
                </div>
            </div>`;
    });
}


function toggleTheme() {
    const isChecked = document.getElementById('checkbox').checked;
    if (isChecked) document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
}

window.onload = loadData;
