(function (root) {
  'use strict';
  var HakHero = root.HakHero = root.HakHero || {};

  HakHero.POINTS_PER_CORRECT = 10;
  HakHero.STORAGE_KEY = 'hakhero.progress.v1';

  /* ---------- Data Level & Misi ---------- */
  HakHero.LEVELS = [
    { id: 1, name: 'Kenali Hakmu', icon: '🛡️', goal: 'Mengenali pengertian dan contoh hak warga negara dasar.' },
    { id: 2, name: 'Detektif Hak', icon: '🔍', goal: 'Menebak hak yang tepat dari situasi kehidupan sehari-hari.' },
    { id: 3, name: 'Pahlawan Keadilan', icon: '🤝', goal: 'Memilih sikap yang menghormati dan menghargai hak orang lain.' },
    { id: 4, name: 'Ahli Konstitusi', icon: '📜', goal: 'Menghubungkan hak warga negara dengan Pasal UUD NRI 1945.' }
  ];

  /* ---------- Data Lencana Pencapaian ---------- */
  HakHero.BADGES = [
    { id: 'pendidikan', name: 'Pahlawan Pendidikan', icon: '📚', criteria: 'Selesaikan Level 1 dengan minimal 4 jawaban benar.' },
    { id: 'detektif', name: 'Detektif Hak SD', icon: '🔍', criteria: 'Selesaikan Level 2 dengan minimal 4 jawaban benar.' },
    { id: 'kerukunan', name: 'Penjaga Kerukunan', icon: '🤝', criteria: 'Selesaikan Level 3 dengan minimal 4 jawaban benar.' },
    { id: 'konstitusi', name: 'Ahli Konstitusi Muda', icon: '📜', criteria: 'Selesaikan Level 4 dengan minimal 4 jawaban benar.' },
    { id: 'sempurna', name: 'Bintang Sempurna', icon: '⭐', criteria: 'Raih nilai 100% pada salah satu level.' }
  ];

  /* ---------- Bank Soal Kuis (20 Soal) ---------- */
  HakHero.QUESTIONS = [
    // Level 1: Kenali Hakmu
    {
      id: 'l1_1', level: 1, topic: 'Pendidikan',
      question: 'Setiap anak di Indonesia berhak mendapatkan pendidikan yang layak. Contoh pelaksanaan hak ini di sekolah adalah...',
      options: [
        'Mendapatkan bimbingan dan pengajaran dari guru',
        'Bebas tidak mengerjakan tugas sekolah',
        'Mendapatkan nilai bagus tanpa perlu belajar',
        'Menggunakan fasilitas sekolah tanpa menjaga kebersihannya'
      ],
      answer: 0,
      law: 'Pasal 31 Ayat (1) UUD 1945',
      explanation: 'Mendapatkan pengajaran dari guru adalah hak setiap siswa di sekolah untuk mendukung tumbuh kembangnya.'
    },
    {
      id: 'l1_2', level: 1, topic: 'Perlindungan',
      question: 'Apa yang dimaksud dengan hak warga negara?',
      options: [
        'Segala sesuatu yang harus dilakukan dengan penuh rasa tanggung jawab',
        'Sesuatu yang mutlak menjadi milik seseorang dan penggunaannya tergantung pada orang tersebut',
        'Aturan hukum yang berlaku di lingkungan masyarakat',
        'Hadiah yang diberikan pemerintah hanya kepada warga yang berprestasi'
      ],
      answer: 1,
      law: 'Konsep Dasar Hak Warga Negara',
      explanation: 'Hak adalah hal yang patut atau layak diterima oleh seseorang sesuai dengan kedudukannya sebagai warga negara.'
    },
    {
      id: 'l1_3', level: 1, topic: 'Kesehatan',
      question: 'Saat merasa sakit, kamu berhak mendapatkan pelayanan medis dari Puskesmas atau Rumah Sakit. Hak ini termasuk dalam...',
      options: [
        'Hak atas pelayanan kesehatan',
        'Hak menyampaikan pendapat',
        'Hak kebebasan beragama',
        'Hak memperoleh pekerjaan'
      ],
      answer: 0,
      law: 'Pasal 28H Ayat (1) UUD 1945',
      explanation: 'Setiap warga negara berhak memperoleh pelayanan kesehatan yang layak dari fasilitas kesehatan negara.'
    },
    {
      id: 'l1_4', level: 1, topic: 'Agama',
      question: 'Di Indonesia terdapat enam agama resmi. Hak warga negara dalam hal keagamaan adalah...',
      options: [
        'Memaksa teman mengikuti agama yang kita peluk',
        'Bebas memeluk agama dan beribadah sesuai keyakinan masing-masing',
        'Melarang orang lain merayakan hari besar keagamaannya',
        'Hanya menghormati teman yang seagama saja'
      ],
      answer: 1,
      law: 'Pasal 29 Ayat (2) UUD 1945',
      explanation: 'Negara menjamin kemerdekaan tiap-tiap penduduk untuk memeluk agamanya masing-masing dan beribadah.'
    },
    {
      id: 'l1_5', level: 1, topic: 'Bicara',
      question: 'Saat diskusi kelompok di kelas, kamu berhak...',
      options: [
        'Memotong pembicaraan teman secara kasar',
        'Menyampaikan pendapat atau gagasan secara santun',
        'Memaksa semua anggota menerima usul kita',
        'Diam saja dan tidak mau mendengarkan orang lain'
      ],
      answer: 1,
      law: 'Pasal 28E Ayat (3) UUD 1945',
      explanation: 'Menyampaikan pendapat adalah hak setiap orang, tetapi harus disampaikan dengan sopan dan menghargai orang lain.'
    },

    // Level 2: Detektif Hak
    {
      id: 'l2_1', level: 2, topic: 'Situasi Sekolah',
      question: 'Budi melihat perpustakaan sekolah menyediakan buku-buku cerita yang lengkap. Budi berhak menggunakan perpustakaan tersebut untuk...',
      options: [
        'Membaca dan menambah pengetahuan dengan tertib',
        'Coret-coret halaman buku cerita',
        'Membawa pulang buku tanpa izin petugas',
        'Makan dan minum sambil membuat kegaduhan'
      ],
      answer: 0,
      law: 'Fasilitas Pendidikan',
      explanation: 'Memanfaatkan sarana belajar adalah hak siswa, diikuti kewajiban menjaga fasilitas tersebut.'
    },
    {
      id: 'l2_2', level: 2, topic: 'Situasi Masyarakat',
      question: 'Pak RT mengadakan musyawarah warga untuk kerja bakti. Ayah Siti berhak...',
      options: [
        'Hadir dan memberikan saran untuk kebaikan lingkungan',
        'Melarang tetangga lain berbicara',
        'Menuntut agar keputusannya harus diterima',
        'Merusak tempat musyawarah jika usulnya ditolak'
      ],
      answer: 0,
      law: 'Musyawarah Warga',
      explanation: 'Setiap warga berhak berpartisipasi dalam musyawarah lingkungan secara demokratis.'
    },
    {
      id: 'l2_3', level: 2, topic: 'Situasi Keluarga',
      question: 'Anak-anak di rumah berhak mendapatkan kasih sayang dan perlindungan dari orang tua. Contohnya adalah...',
      options: [
        'Dibiarkan bermain tanpa perhatian saat sakit',
        'Diberi makanan bergizi, pakaian, dan tempat tinggal yang aman',
        'Disuruh bekerja keras mencari uang seharian',
        'Dilarang belajar dan bermain bersama teman'
      ],
      answer: 1,
      law: 'Hak Anak',
      explanation: 'Orang tua berkewajiban memenuhi kebutuhan dasar anak agar tumbuh sehat dan bahagia.'
    },
    {
      id: 'l2_4', level: 2, topic: 'Hukum',
      question: 'Jika seseorang menjadi korban kejahatan, dia berhak mendapatkan...',
      options: [
        'Hukuman dari polisi',
        'Perlindungan hukum dan keadilan dari aparat',
        'Ganti rugi berupa hadiah dari sekolah',
        'Teguran dari ketua RT'
      ],
      answer: 1,
      law: 'Pasal 28D Ayat (1) UUD 1945',
      explanation: 'Setiap orang berhak atas pengakuan, jaminan, perlindungan, dan kepastian hukum yang adil.'
    },
    {
      id: 'l2_5', level: 2, topic: 'Lingkungan',
      question: 'Warga desa Sukamaju berhak menikmati lingkungan yang bersih dan sehat. Usaha untuk mendukung hak tersebut adalah...',
      options: [
        'Membuang sampah ke sungai bersama-sama',
        'Menjaga kebersihan lingkungan sekitar secara gotong royong',
        'Menebang semua pohon di taman desa',
        'Membakar sampah di depan rumah tetangga'
      ],
      answer: 1,
      law: 'Pasal 28H Ayat (1) UUD 1945',
      explanation: 'Lingkungan hidup yang baik dan sehat adalah hak setiap warga negara Indonesia.'
    },

    // Level 3: Pahlawan Keadilan
    {
      id: 'l3_1', level: 3, topic: 'Toleransi',
      question: 'Ahmad sedang beribadah di rumahnya, sementara Edo ingin bermain musik dengan keras di samping rumah Ahmad. Sikap Edo yang bijak adalah...',
      options: [
        'Mengecilkan atau mematikan musik agar tidak mengganggu Ahmad',
        'Meningkatkan volume musik agar makin seru',
        'Ejek Ahmad karena beribadah',
        'Pindah bermain ke dalam kamar Ahmad'
      ],
      answer: 0,
      law: 'Toleransi Beragama',
      explanation: 'Menghormati hak ibadah orang lain adalah bentuk pengamalan Pancasila dan penghormatan hak sesama.'
    },
    {
      id: 'l3_2', level: 3, topic: 'Pendapat',
      question: 'Dalam pemilihan ketua kelas, usulanmu tidak terpilih. Sikap pahlawan keadilan yang tepat adalah...',
      options: [
        'Marah dan tidak mau berteman lagi dengan pemenang',
        'Menerima hasil keputusan bersama dengan lapang dada',
        'Mengganggu ketua kelas yang baru terpilih',
        'Keluar dari kelas dan mogok belajar'
      ],
      answer: 1,
      law: 'Demokrasi Pancasila',
      explanation: 'Menghormati hasil keputusan bersama merupakan wujud sikap menghargai hak demokrasi orang lain.'
    },
    {
      id: 'l3_3', level: 3, topic: 'Keberagaman',
      question: 'Siti berasal dari Jawa dan Dayu berasal dari Bali. Saat bermain bersama, Siti berhak memperkenalkan kebudayaannya, dan Dayu juga berhak...',
      options: [
        'Memaksa Siti menyukai tarian Bali saja',
        'Menampilkan kebudayaannya dengan saling menghargai',
        'Melarang Siti menggunakan bahasa daerahnya',
        'Menjauhi Siti karena berbeda asal daerah'
      ],
      answer: 1,
      law: 'Pasal 32 Ayat (1) UUD 1945',
      explanation: 'Negara memajukan kebudayaan nasional serta menghormati keberagaman budaya daerah.'
    },
    {
      id: 'l3_4', level: 3, topic: 'Keadilan',
      question: 'Doni menjatuhkan pensil milik Lani hingga patah. Sikap Doni yang bertanggung jawab terhadap hak Lani adalah...',
      options: [
        'Pura-pura tidak tahu dan menyalahkan teman lain',
        'Minta maaf dan mengganti pensil Lani dengan jujur',
        'Ejek Lani karena pensilnya patah',
        'Sembunyi di bawah meja kelas'
      ],
      answer: 1,
      law: 'Tanggung Jawab Moral',
      explanation: 'Meminta maaf dan mengganti barang yang dirusak adalah tindakan menghormati hak milik orang lain.'
    },
    {
      id: 'l3_5', level: 3, topic: 'Fasilitas Umum',
      question: 'Bagas ingin menggunakan lapangan basket sekolah, tetapi kelompok Rani sedang menggunakannya sesuai jadwal. Tindakan Bagas sebaiknya...',
      options: [
        'Mengusir Rani dan temannya dari lapangan secara paksa',
        'Menunggu giliran bermain setelah jadwal kelompok Rani selesai',
        'Melempar bola ke tengah lapangan agar permainan terhenti',
        'Lapor ke kepala sekolah agar kelompok Rani dihukum'
      ],
      answer: 1,
      law: 'Penggunaan Fasilitas Bersama',
      explanation: 'Menghormati antrean dan jadwal adalah bentuk menghargai hak orang lain dalam menggunakan sarana umum.'
    },

    // Level 4: Ahli Konstitusi
    {
      id: 'l4_1', level: 4, topic: 'UUD 1945',
      question: 'Pasal 31 Ayat (1) UUD NRI Tahun 1945 menjamin bahwa...',
      options: [
        'Setiap warga negara berhak mendapat pendidikan',
        'Setiap warga negara wajib menjadi tentara',
        'Setiap warga negara bebas tidak membayar pajak',
        'Setiap warga negara berhak memiliki senjata api'
      ],
      answer: 0,
      law: 'Pasal 31 Ayat (1)',
      explanation: 'Pasal 31 Ayat (1) menegaskan bahwa setiap warga negara berhak memperoleh pendidikan.'
    },
    {
      id: 'l4_2', level: 4, topic: 'UUD 1945',
      question: 'Jaminan kemerdekaan tiap-tiap penduduk untuk memeluk agamanya masing-masing diatur dalam UUD 1945 pada...',
      options: [
        'Pasal 27 Ayat (1)',
        'Pasal 29 Ayat (2)',
        'Pasal 30 Ayat (1)',
        'Pasal 34 Ayat (1)'
      ],
      answer: 1,
      law: 'Pasal 29 Ayat (2)',
      explanation: 'Pasal 29 Ayat (2) memuat jaminan kebebasan beragama dan beribadah bagi seluruh penduduk Indonesia.'
    },
    {
      id: 'l4_3', level: 4, topic: 'UUD 1945',
      question: 'Persamaan kedudukan warga negara di dalam hukum dan pemerintahan tertuang dalam UUD 1945...',
      options: [
        'Pasal 27 Ayat (1)',
        'Pasal 28E Ayat (1)',
        'Pasal 33 Ayat (3)',
        'Pasal 31 Ayat (2)'
      ],
      answer: 0,
      law: 'Pasal 27 Ayat (1)',
      explanation: 'Pasal 27 Ayat (1) menyatakan bahwa segala warga negara bersamaan kedudukannya di dalam hukum dan pemerintahan.'
    },
    {
      id: 'l4_4', level: 4, topic: 'UUD 1945',
      question: 'Hak atas pekerjaan dan penghidupan yang layak bagi kemanusiaan diatur dalam...',
      options: [
        'Pasal 27 Ayat (2)',
        'Pasal 28A',
        'Pasal 29 Ayat (1)',
        'Pasal 30 Ayat (2)'
      ],
      answer: 0,
      law: 'Pasal 27 Ayat (2)',
      explanation: 'Pasal 27 Ayat (2) berbunyi: Tiap-tiap warga negara berhak atas pekerjaan dan penghidupan yang layak bagi kemanusiaan.'
    },
    {
      id: 'l4_5', level: 4, topic: 'UUD 1945',
      question: 'Fakir miskin dan anak-anak terlantari dipelihara oleh negara. Pernyataan ini tertuang pada...',
      options: [
        'Pasal 34 Ayat (1)',
        'Pasal 31 Ayat (3)',
        'Pasal 28B Ayat (2)',
        'Pasal 27 Ayat (3)'
      ],
      answer: 0,
      law: 'Pasal 34 Ayat (1)',
      explanation: 'Pasal 34 Ayat (1) UUD 1945 mengamanatkan perlindungan sosial bagi fakir miskin dan anak terlantar.'
    }
  ];
})(this);