let daftarGuru = {};
let jadwalKelas = {};
let clickCount = 0;
const KUNCI = "1021";

const jamConfig = {
    "Senin": [{w:"07.00-08.00",s:1},{w:"08.00-08.40",i:0},{w:"08.40-09.20",i:1},{w:"09.20-09.40",s:2},{w:"09.40-10.20",i:2},{w:"10.20-11.00",i:3},{w:"11.00-11.40",i:4},{w:"11.40-12.40",s:3},{w:"12.40-13.20",i:5},{w:"13.20-14.00",i:6},{w:"14.00-14.40",i:7}],
    "Selasa": [{w:"06.45-07.25",s:4},{w:"07.25-08.05",i:0},{w:"08.05-08.45",i:1},{w:"08.45-09.25",i:2},{w:"09.25-09.45",s:2},{w:"09.45-10.25",i:3},{w:"10.25-11.05",i:4},{w:"11.05-11.45",i:5},{w:"11.45-12.45",s:3},{w:"12.45-13.25",i:6},{w:"13.25-14.05",i:7},{w:"14.05-14.45",i:8}],
    "Rabu": [{w:"06.45-07.25",s:4},{w:"07.25-08.05",i:0},{w:"08.05-08.45",i:1},{w:"08.45-09.25",i:2},{w:"09.25-09.45",s:2},{w:"09.45-10.25",i:3},{w:"10.25-11.05",i:4},{w:"11.05-11.45",i:5},{w:"11.45-12.45",s:5},{w:"12.45-13.25",i:6},{w:"13.25-14.45",s:6}],
    "Kamis": [{w:"06.45-07.25",s:7},{w:"07.25-08.05",i:0},{w:"08.05-08.45",i:1},{w:"08.45-09.25",i:2},{w:"09.25-09.45",s:2},{w:"09.45-10.25",i:3},{w:"10.25-11.05",i:4},{w:"11.05-11.45",i:5},{w:"11.45-12.45",s:5},{w:"12.45-13.25",i:6},{w:"13.25-14.45",s:6}],
    "Jumat": [{w:"07.00-07.40",s:4},{w:"07.40-08.20",i:0},{w:"08.20-09.00",i:1},{w:"09.00-09.40",i:2},{w:"09.40-10.00",s:2},{w:"10.00-10.40",i:3},{w:"10.40-11.20",i:4},{w:"12.30-13.50",s:6}]
};

const ketPelajaran = { 1:"UPACARA", 2:"ISTIRAHAT", 3:"SHOLAT/ISTIRAHAT", 4:"PEMBIASAAN/DHUHA", 5:"KOKURIKULER/ISTIRAHAT", 6:"KOKURIKULER", 7:"OLAHRAGA/PEMBIASAAN" };

// Fungsi memuat data dari folder file-file
async function loadData() {
    try {
        // Alamat file sekarang ditambah 'file-file/' di depannya
        const guruRes = await fetch('file/guru.json');
        daftarGuru = await guruRes.json();
        
        const localJadwal = localStorage.getItem('jadwal_editan');
        if (localJadwal) {
            jadwalKelas = JSON.parse(localJadwal);
        } else {
            const jadwalRes = await fetch('file/jadwal.json');
            jadwalKelas = await jadwalRes.json();
        }
        
        initDropdown();
    } catch (e) {
        console.error("Gagal load data. Pastikan folder 'file' sudah benar!");
    }
}

function initDropdown() {
    const selKelas = document.getElementById('kelas');
    selKelas.innerHTML = "";
    Object.keys(jadwalKelas).sort().forEach(k => { 
        let o = document.createElement('option'); o.value=k; o.innerText="Kelas "+k; selKelas.appendChild(o); 
    });
}

function tampilkanJadwal() {
    const k = document.getElementById('kelas').value; 
    const h = document.getElementById('hari').value; // Ini hari yang dipilih di dropdown
    const out = document.getElementById('output');
    out.innerHTML = "";
    
    // Validasi data: Kalau data jadwal atau jamConfig hari tersebut tidak ada, berhenti
    if(!jadwalKelas[k] || !jadwalKelas[k][h] || !jamConfig[h]) {
        out.innerHTML = "<p style='text-align:center;'>Jadwal tidak ditemukan.</p>";
        return;
    }

    // --- LOGIKA FILTER HARI ---
    const sekarang = new Date();
    const jamMenitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes();
    
    // Nama hari di daftarHari harus SAMA PERSIS dengan value di HTML kamu (Senin, Selasa, dst)
    const daftarHari = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    const namaHariSekarang = daftarHari[sekarang.getDay()];
    // ---------------------------

    jamConfig[h].forEach(p => {
        let kodeGuru = jadwalKelas[k][h][p.i];
        let info = p.s ? p.s : (daftarGuru[kodeGuru] || "Kode " + (kodeGuru || "-"));
        
        let isActive = false;
        
        // Cek apakah hari di HP sama dengan hari yang dipilih di dropdown
        if (namaHariSekarang === h) { 
            const range = p.w.split('-');
            const mulai = range[0].split('.');
            const selesai = range[1].split('.');
            
            const menitMulai = parseInt(mulai[0]) * 60 + parseInt(mulai[1]);
            const menitSelesai = parseInt(selesai[0]) * 60 + parseInt(selesai[1]);

            if (jamMenitSekarang >= menitMulai && jamMenitSekarang < menitSelesai) {
                isActive = true;
            }
        }

        // Tentukan Class Card
        let cls = p.s ? "card special" : "card";
        if (isActive) cls += " active-now";

        out.innerHTML += `
            <div class="${cls}">
                <div class="time">
                    ${isActive ? "<b>● SEKARANG</b>" : p.w}
                </div>
                <div class="desc">
                    ${info}
                    ${isActive ? "<br><small style='color: #00ff00;'>Sedang Berlangsung</small>" : ""}
                </div>
            </div>`;
    });
}

// Fitur Rahasia
function rahasia() {
    clickCount++;
    if (clickCount >= 3) {
        const pw = prompt("Masukkan Kunci Admin:");
        if (pw === KUNCI) {
            const k = document.getElementById('kelas').value;
            const h = document.getElementById('hari').value;
            const input = prompt(`Edit Jadwal ${k} - ${h}\nMasukkan kode angka (pisah koma):`, jadwalKelas[k][h].join(','));
            
            if (input) {
                jadwalKelas[k][h] = input.split(',').map(s => s.trim());
                localStorage.setItem('jadwal_editan', JSON.stringify(jadwalKelas));
                alert("Jadwal Berhasil Diubah!");
                tampilkanJadwal();
            }
        } else {
            alert("Kunci Salah!");
        }
        clickCount = 0;
    }
}

function toggleTheme() {
    const isChecked = document.getElementById('checkbox').checked;
    if (isChecked) {
        document.documentElement.setAttribute('data-theme', 'light');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}


window.onload = loadData;
