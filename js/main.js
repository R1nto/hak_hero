(function () {
  'use strict';

  var HH = window.HakHero;
  if (!HH || !HH.Quiz || !HH.Progress || !HH.QUESTIONS) {
    var app = document.getElementById('app');
    if (app) app.textContent = 'Maaf, file permainan gagal dimuat. Sila muat ulang halaman.';
    return;
  }

  var Progress = HH.Progress;
  var Quiz = HH.Quiz;

  // Efek suara singkat untuk memberi umpan balik saat bermain.
  function playSound(name) {
    if (HH.Sound && typeof HH.Sound[name] === 'function') {
      HH.Sound[name]();
    }
  }

  // Tombol dan tautan navigasi berbunyi lembut; pilihan kuis memakai suara khusus.
  // Audio dipicu oleh interaksi pengguna agar sesuai dengan kebijakan browser.
  document.addEventListener('click', function (event) {
    var target = event.target;
    if (!target || typeof target.closest !== 'function') return;
    var control = target.closest('a[href^="#/"], button');
    if (!control || control.disabled || control.classList.contains('option-btn')) return;
    playSound('playPop');
  });

  var session = null;
  var lastResult = null;

  function $(id) { return document.getElementById(id); }

  var prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Indikator Kotak Kuning Navbar ---------- */
  var navIndicator = null;
  var navActiveEl = null;
  var navIndicatorReady = false;

  function ensureNavIndicator() {
    if (navIndicator) return navIndicator;
    var nav = document.querySelector('.nav');
    if (!nav) return null;
    navIndicator = document.createElement('span');
    navIndicator.className = 'nav-indicator';
    navIndicator.setAttribute('aria-hidden', 'true');
    nav.insertBefore(navIndicator, nav.firstChild);
    return navIndicator;
  }

  function placeNavIndicator(instant) {
    var ind = ensureNavIndicator();
    if (!ind) return;
    if (!navActiveEl) { ind.style.opacity = '0'; return; }

    var el = navActiveEl;
    var nav = el.parentNode;
    if (instant || !navIndicatorReady) ind.style.transition = 'none';

    ind.style.width = el.offsetWidth + 'px';
    ind.style.height = el.offsetHeight + 'px';
    ind.style.transform = 'translate(' + el.offsetLeft + 'px,' + el.offsetTop + 'px)';
    ind.style.opacity = '1';

    if (instant || !navIndicatorReady) {
      void ind.offsetWidth; // paksa reflow supaya posisi awal tidak beranimasi
      ind.style.transition = '';
      navIndicatorReady = true;
    } else if (!prefersReduced) {
      ind.classList.remove('bump');
      void ind.offsetWidth;
      ind.classList.add('bump');
    }

    // Di layar sempit, geser menu agar item aktif terlihat
    if (nav.scrollWidth > nav.clientWidth) {
      nav.scrollTo({
        left: el.offsetLeft - (nav.clientWidth - el.offsetWidth) / 2,
        behavior: (instant || prefersReduced) ? 'auto' : 'smooth'
      });
    }
  }

  function updateActiveNav(pageName) {
    var links = document.querySelectorAll('.nav-btn');
    navActiveEl = null;
    links.forEach(function (el) {
      if (el.getAttribute('data-nav') === pageName) {
        el.classList.add('active');
        el.setAttribute('aria-current', 'page');
        navActiveEl = el;
      } else {
        el.classList.remove('active');
        el.removeAttribute('aria-current');
      }
    });
    placeNavIndicator(false);
  }

  window.addEventListener('resize', function () { placeNavIndicator(true); });
  window.addEventListener('load', function () { placeNavIndicator(true); });
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { placeNavIndicator(true); });
  }

  function navigateTo(hash) {
    window.location.hash = hash;
  }

  /* ---------- Router Berbasis Hash + Transisi Halaman ---------- */
  var navToken = 0;
  var firstRender = true;
  var EXIT_MS = 220;

  function getNavName(hash) {
    if (hash === '#/beranda') return 'beranda';
    if (hash === '#/materi' || hash.indexOf('#/materi/') === 0) return 'materi';
    if (hash === '#/level') return 'level';
    if (hash === '#/cara-bermain') return 'cara-bermain';
    if (hash.indexOf('#/game/') === 0) return 'level';
    if (hash === '#/hasil') return 'level';
    return null;
  }

  function renderRoute(hash, app) {
    app.innerHTML = '';
    if (hash === '#/beranda') renderBeranda(app);
    else if (hash === '#/materi') renderMateri(app);
    else if (hash.indexOf('#/materi/') === 0) renderMateriDetail(app, hash.slice('#/materi/'.length));
    else if (hash === '#/level') renderLevel(app);
    else if (hash === '#/cara-bermain') renderCaraBermain(app);
    else if (hash.indexOf('#/game/') === 0) renderGame(app, parseInt(hash.replace('#/game/', ''), 10));
    else if (hash === '#/hasil') renderHasil(app);
    window.scrollTo(0, 0);
  }

  function runRouteBar() {
    var bar = $('route-bar');
    if (!bar || prefersReduced) return;
    bar.classList.remove('run');
    void bar.offsetWidth;
    bar.classList.add('run');
  }

  function handleRoute() {
    var hash = window.location.hash || '#/beranda';
    var app = $('app');
    if (!app) return;

    var navName = getNavName(hash);
    if (!navName) { navigateTo('#/beranda'); return; }

    var token = ++navToken;
    updateActiveNav(navName); // kotak kuning langsung berpindah

    // Render pertama / mode kurangi gerakan: tanpa transisi keluar
    if (firstRender || prefersReduced) {
      firstRender = false;
      renderRoute(hash, app);
      app.classList.remove('page-exit');
      if (!prefersReduced) {
        void app.offsetWidth;
        app.classList.add('page-enter');
      }
      return;
    }

    runRouteBar();
    app.classList.remove('page-enter');
    app.classList.add('page-exit');

    setTimeout(function () {
      if (token !== navToken) return; // navigasi baru sudah menggantikan
      renderRoute(hash, app);
      app.classList.remove('page-exit');
      void app.offsetWidth;
      app.classList.add('page-enter');
    }, EXIT_MS);
  }

  /* ---------- 1. Beranda ---------- */
  function renderBeranda(container) {
    var state = Progress.load();
    var completedCount = Object.keys(state.completed).length;

    var section = document.createElement('section');
    section.className = 'hero-section';
    section.innerHTML = 
      '<div>' +
        '<span class="hero-badge">⚡ GAME EDUKASI PPKn SD</span>' +
        '<h1 class="hero-title">Kenali Hakmu, Hormati Hak Sesama!</h1>' +
        '<p class="hero-subtitle">Jadilah pahlawan keadilan muda! Jelajahi 4 misi seru, selesaikan kuis interaktif, dan kumpulkan lencana superhero!</p>' +
        '<div class="hero-actions">' +
          '<a href="#/level" class="btn btn-cta"> Mulai Petualangan!</a>' +
          '<a href="#/materi" class="btn btn-secondary"> Pelajari Materi</a>' +
        '</div>' +
      '</div>' +
      '<div class="hero-mascot-wrapper">' +
        '<div class="hero-mascot-bg">' +
          '<svg width="180" height="180" viewBox="0 0 200 240"><use href="#mascot"/></svg>' +
        '</div>' +
      '</div>';

    container.appendChild(section);

    // Kartu Progres
    if (completedCount > 0) {
      var progressCard = document.createElement('div');
      progressCard.className = 'progress-summary-card';
      progressCard.innerHTML = 
        '<div class="summary-header">' +
          '<h2> Ringkasan Petualanganmu</h2>' +
          '<a href="#/level" class="btn btn-hero" style="padding: 8px 16px; font-size: 0.9rem;">Lanjut Misi</a>' +
        '</div>' +
        '<div class="summary-grid">' +
          '<div class="summary-box"><div class="summary-val">' + completedCount + '/4</div><div class="summary-lbl">Misi Selesai</div></div>' +
          '<div class="summary-box"><div class="summary-val">' + state.badges.length + '</div><div class="summary-lbl">Lencana Didapat</div></div>' +
        '</div>';
      container.appendChild(progressCard);
    }
  }

  /* ---------- 2. Peta Level ---------- */
  function renderLevel(container) {
    var state = Progress.load();

    var titleBox = document.createElement('div');
    titleBox.className = 'map-title-box';
    titleBox.innerHTML = 
      '<h1> Peta Petualangan Superhero</h1>' +
      '<p>Pilih misi dan kumpulkan seluruh bintang pencapaianmu!</p>';
    container.appendChild(titleBox);

    var mapPath = document.createElement('div');
    mapPath.className = 'map-path';

    var levelIllustrations = {
      1: 'assets/missions/misi-1-kenali-hakmu.png',
      2: 'assets/missions/misi-2-detektif-hak.png',
      3: 'assets/missions/misi-3-pahlawan-keadilan.png',
      4: 'assets/missions/misi-4-ahli-konstitusi.png'
    };

    HH.LEVELS.forEach(function (lvl) {
      var unlocked = Progress.isUnlocked(lvl.id, state);
      var completed = state.completed[lvl.id] === true;
      var bestScore = state.best[lvl.id] || 0;

      var card = document.createElement('div');
      card.className = 'level-card' + (unlocked ? '' : ' locked');

      var statusText = completed ? ' Selesai (' + bestScore + ' Poin)' : (unlocked ? ' Tersedia' : ' Terkunci');
      var statusClass = completed ? 'status-completed' : (unlocked ? 'status-available' : 'status-locked');

      card.innerHTML =
        '<span class="level-badge-num">MISI ' + lvl.id + '</span>' +
        '<div class="level-icon">' +
          '<img src="' + levelIllustrations[lvl.id] + '" ' +
          'alt="Ilustrasi ' + lvl.name + '" loading="lazy">' +
        '</div>' +
        '<h2 class="level-title">' + lvl.name + '</h2>' +
        '<p class="level-desc">' + lvl.goal + '</p>' +
        '<div><span class="level-status-tag ' + statusClass + '">' + statusText + '</span></div>';

      var btn = document.createElement('button');
      btn.className = 'btn ' + (unlocked ? 'btn-cta' : 'btn-secondary');
      btn.style.width = '100%';
      btn.textContent = unlocked ? (completed ? ' Main Ulang' : ' Mulai Misi') : ' Terkunci';
      btn.disabled = !unlocked;

      if (unlocked) {
        btn.addEventListener('click', function () {
          navigateTo('#/game/' + lvl.id);
        });
      }

      card.appendChild(btn);
      mapPath.appendChild(card);
    });

    container.appendChild(mapPath);
  }

  /* ---------- 3. Data Materi & Halaman Detail ---------- */
  var MATERI_DATA = [
    {
      id: 'pendidikan', icon: '📚', title: 'Hak Pendidikan',
      desc: 'Setiap anak berhak mendapat kesempatan belajar yang layak tanpa dibeda-bedakan karena latar belakangnya.',
      detail: 'Hak pendidikan meliputi kesempatan mengikuti pembelajaran, memperoleh bimbingan guru, menggunakan bahan belajar, dan belajar di lingkungan yang aman. Pendidikan membantu kita mengembangkan pengetahuan, keterampilan, serta cita-cita.',
      examples: [
        'Mengikuti pelajaran dan bertanya ketika belum memahami materi.',
        'Memanfaatkan perpustakaan serta fasilitas belajar sesuai aturan.'
      ],
      duty: 'Belajar dengan sungguh-sungguh, mengerjakan tugas, menghargai guru dan teman, serta menjaga buku dan fasilitas sekolah.',
      fact: 'Pasal 31 ayat (1) UUD NRI Tahun 1945 menyatakan bahwa setiap warga negara berhak mendapat pendidikan.',
      law: 'Pasal 31 ayat (1) UUD NRI 1945'
    },
    {
      id: 'agama', icon: '🕊️', title: 'Kebebasan Beragama',
      desc: 'Setiap penduduk berhak memeluk agama dan beribadah sesuai keyakinannya dengan aman dan tenang.',
      detail: 'Kita hidup bersama orang-orang yang mungkin memiliki agama, keyakinan, kebiasaan, dan cara beribadah yang berbeda. Perbedaan bukan alasan untuk mengejek, menjauhi, atau memaksa orang lain mengikuti keyakinan kita.',
      examples: [
        'Tidak membuat gaduh ketika teman atau tetangga sedang beribadah.',
        'Berteman dengan siapa pun tanpa membeda-bedakan agama.'
      ],
      duty: 'Menghormati keyakinan orang lain, tidak memaksakan agama atau kepercayaan, dan menjaga kerukunan.',
      fact: 'Menghormati waktu dan tempat ibadah orang lain merupakan contoh toleransi dalam kehidupan sehari-hari.',
      law: 'Pasal 29 ayat (2) UUD NRI 1945'
    },
    {
      id: 'berpendapat', icon: '🗣️', title: 'Hak Berpendapat',
      desc: 'Kamu boleh menyampaikan ide, pertanyaan, kritik, atau saran dengan cara yang sopan dan bertanggung jawab.',
      detail: 'Setiap orang berhak menyampaikan pendapat. Namun, kebebasan berpendapat perlu digunakan dengan bijak: sampaikan alasan yang jelas, gunakan bahasa santun, dan jangan menghina atau merendahkan orang lain.',
      examples: [
        'Mengusulkan pembagian tugas saat diskusi kelompok.',
        'Menyampaikan ketidaksetujuan dengan alasan yang baik dan tetap mendengarkan teman.'
      ],
      duty: 'Memberi kesempatan orang lain berbicara, mendengarkan dengan baik, dan menerima perbedaan pendapat.',
      fact: 'Diskusi akan berjalan lebih baik ketika semua anggota mendapat kesempatan berbicara dan saling mendengarkan.',
      law: 'Pasal 28E ayat (3) UUD NRI 1945'
    },
    {
      id: 'perlindungan', icon: '🛡️', title: 'Perlindungan & Hukum',
      desc: 'Setiap warga negara memiliki kedudukan yang sama di hadapan hukum dan berhak memperoleh perlindungan yang adil.',
      detail: 'Tidak seorang pun boleh diperlakukan tidak adil atau mengalami kekerasan dan diskriminasi. Anak juga berhak mendapat perlindungan. Jika kamu mengalami atau melihat perundungan, kekerasan, atau perlakuan yang tidak aman, ceritakan kepada guru, orang tua, atau orang dewasa tepercaya.',
      examples: [
        'Melapor kepada guru saat melihat teman dirundung.',
        'Memperlakukan semua teman secara adil dan tidak mengambil barang milik orang lain.'
      ],
      duty: 'Menaati aturan yang berlaku, tidak melakukan kekerasan atau perundungan, serta menghormati hak dan keselamatan orang lain.',
      fact: 'Meminta bantuan orang dewasa tepercaya adalah langkah yang tepat ketika kamu merasa tidak aman.',
      law: 'Pasal 27 ayat (1), Pasal 28D ayat (1), dan Pasal 28B ayat (2) UUD NRI 1945'
    },
    {
      id: 'kesehatan', icon: '🌿', title: 'Hak Kesehatan & Lingkungan Sehat',
      desc: 'Setiap orang berhak memperoleh pelayanan kesehatan dan menikmati lingkungan yang baik serta sehat.',
      detail: 'Tubuh yang sehat membantu kita belajar dan bermain dengan baik. Saat sakit, kita dapat meminta bantuan orang tua dan mendapatkan pelayanan kesehatan. Lingkungan yang bersih, air yang layak, serta udara yang sehat juga penting bagi kehidupan.',
      examples: [
        'Meminta bantuan orang tua ketika sakit dan memeriksakan diri ke fasilitas kesehatan.',
        'Menggunakan toilet sekolah dengan bersih dan membuang sampah pada tempatnya.'
      ],
      duty: 'Menjaga kebersihan diri dan lingkungan, membiasakan hidup sehat, serta menggunakan fasilitas umum dengan bertanggung jawab.',
      fact: 'Kebersihan lingkungan merupakan usaha bersama; setiap orang dapat berperan mulai dari kebiasaan sederhana.',
      law: 'Pasal 28H ayat (1) UUD NRI 1945'
    },
    {
      id: 'budaya', icon: '🎭', title: 'Hak Budaya & Keberagaman',
      desc: 'Masyarakat dapat menjaga dan mengembangkan budaya daerah sambil menghargai keragaman budaya Indonesia.',
      detail: 'Indonesia memiliki banyak bahasa daerah, tarian, lagu, pakaian adat, makanan, dan tradisi. Mengenal budaya sendiri membuat kita lebih menghargai identitas bangsa. Budaya daerah lain juga perlu diperlakukan dengan hormat.',
      examples: [
        'Belajar lagu daerah atau mengenal tarian dan pakaian adat.',
        'Mendengarkan teman bercerita tentang tradisi daerahnya tanpa mengejek.'
      ],
      duty: 'Menghormati perbedaan budaya, tidak menghina bahasa atau adat daerah lain, serta ikut menjaga warisan budaya.',
      fact: 'Keberagaman budaya dapat memperkaya persahabatan dan memperkuat persatuan jika saling dihormati.',
      law: 'Pasal 32 ayat (1) UUD NRI 1945'
    }
  ];

  // Ilustrasi kartun khusus untuk setiap topik materi.
  // File gambar disimpan lokal agar tetap tampil tanpa koneksi internet.
  var MATERI_IMAGES = {
    pendidikan: 'assets/materi-pendidikan.png',
    agama: 'assets/materi-agama.png',
    berpendapat: 'assets/materi-berpendapat.png',
    perlindungan: 'assets/materi-perlindungan.png',
    kesehatan: 'assets/materi-kesehatan.png',
    budaya: 'assets/materi-budaya.png'
  };

  function materiIllustration(materi) {
    var src = MATERI_IMAGES[materi.id] || '';
    return '<div class="materi-icon-box">' +
      '<img class="materi-illustration" src="' + src + '" alt="Ilustrasi ' + materi.title + '" loading="lazy">' +
    '</div>';
  }

  // Halaman daftar materi: hanya ringkasan agar tidak terlalu panjang.
  function renderMateri(container) {
    var titleBox = document.createElement('div');
    titleBox.style.textAlign = 'center';
    titleBox.style.marginBottom = '32px';
    titleBox.innerHTML =
      '<h1>Buku Komik Hak Warga Negara</h1>' +
      '<p>Pilih topik untuk membaca penjelasan lengkap, contoh sehari-hari, tanggung jawab, dan dasar hukumnya.</p>';
    container.appendChild(titleBox);

    var grid = document.createElement('div');
    grid.className = 'materi-grid';

    MATERI_DATA.forEach(function (m) {
      var card = document.createElement('article');
      card.className = 'materi-card';
      card.innerHTML =
        '<div class="materi-header">' +
          materiIllustration(m) +
          '<h2>' + m.title + '</h2>' +
        '</div>' +
        '<p>' + m.desc + '</p>' +
        '<div class="materi-fact">📖 <b>Di dalam materi:</b> penjelasan, contoh penerapan, tanggung jawab, dan dasar hukum.</div>' +
        '<a href="#/materi/' + m.id + '" class="btn btn-cta">Pelajari Materi</a>';
      grid.appendChild(card);
    });

    container.appendChild(grid);
  }

  // Halaman detail khusus untuk satu topik materi.
  function renderMateriDetail(container, materiId) {
    var materi = null;
    for (var i = 0; i < MATERI_DATA.length; i++) {
      if (MATERI_DATA[i].id === materiId) {
        materi = MATERI_DATA[i];
        break;
      }
    }

    if (!materi) {
      var notFound = document.createElement('section');
      notFound.className = 'materi-card';
      notFound.innerHTML =
        '<h1>Materi tidak ditemukan</h1>' +
        '<p>Pilih salah satu topik dari daftar materi.</p>' +
        '<a href="#/materi" class="btn btn-cta">Kembali ke Materi</a>'; 
      container.appendChild(notFound);
      return;
    }

    var back = document.createElement('div');
    back.style.marginBottom = '20px';
    back.innerHTML = '<a href="#/materi" class="btn btn-secondary">Semua Materi</a>'; 
    container.appendChild(back);

    var detail = document.createElement('article');
    detail.className = 'materi-card materi-detail-card';
    detail.style.maxWidth = '900px';
    detail.style.margin = '0 auto';
    detail.innerHTML =
      '<div class="materi-header">' +
        materiIllustration(materi) +
        '<div><h1 style="margin:0 0 8px;">' + materi.title + '</h1>' +
        '<p style="margin:0;">' + materi.desc + '</p></div>' +
      '</div>' +
      '<section style="margin-top:20px;">' +
        '<h2>📘 Penjelasan Materi</h2>' +
        '<p style="line-height:1.8;">' + materi.detail + '</p>' +
      '</section>' +
      '<section style="margin-top:24px;">' +
        '<h2>🌟 Contoh dalam Kehidupan Sehari-hari</h2>' +
        '<ul style="line-height:1.9; padding-left:24px;">' +
          materi.examples.map(function (example) { return '<li>' + example + '</li>'; }).join('') +
        '</ul>' +
      '</section>' +
      '<section style="margin-top:24px;">' +
        '<h2>🤝 Tanggung Jawab Kita</h2>' +
        '<p style="line-height:1.8;">' + materi.duty + '</p>' +
      '</section>' +
      '<div class="materi-fact" style="margin-top:24px;">💡 <b>Tahukah Kamu?</b> ' + materi.fact + '</div>' +
      '<div style="margin-top:18px;"><span class="materi-law">📜 Dasar Hukum: ' + materi.law + '</span></div>' +
      '<div style="display:flex; flex-wrap:wrap; gap:12px; margin-top:28px;">' +
        '<a href="#/materi" class="btn btn-secondary">Kembali ke Daftar Materi</a>' +
        '<a href="#/level" class="btn btn-cta">Coba Kuis</a>' +
      '</div>';

    container.appendChild(detail);
  }

  /* ---------- 4. Game Kuis ---------- */
  function renderGame(container, levelId) {
    try {
      session = Quiz.createSession(levelId);
    } catch (e) {
      navigateTo('#/level');
      return;
    }

    var quizWrap = document.createElement('div');
    quizWrap.className = 'quiz-container';
    var lastPct = 0;

    function renderQuestion() {
      quizWrap.innerHTML = '';

      var item = session.getCurrentItem();
      var currIdx = session.getCurrentIndex();
      var total = session.getTotal();
      var progressPct = Math.round(((currIdx + 1) / total) * 100);

      // HUD Header
      var hud = document.createElement('div');
      hud.className = 'quiz-hud';
      hud.innerHTML = 
        '<b>MISI ' + levelId + ' • SOAL ' + (currIdx + 1) + '/' + total + '</b>' +
        '<div class="quiz-progress-bar-wrap"><div class="quiz-progress-fill" style="width:' + lastPct + '%"></div></div>' +
        '<b>⭐ ' + session.level.name + '</b>';
      quizWrap.appendChild(hud);

      // Isi progress bar dengan animasi dari posisi soal sebelumnya
      var fillEl = hud.querySelector('.quiz-progress-fill');
      var fromPct = lastPct;
      lastPct = progressPct;
      setTimeout(function () { fillEl.style.width = progressPct + '%'; }, 40);

      // Kartu Soal
      var card = document.createElement('div');
      card.className = 'quiz-card' + (currIdx > 0 ? ' q-enter' : '');

      var qText = document.createElement('div');
      qText.className = 'quiz-question';
      qText.textContent = item.question;
      card.appendChild(qText);

      var optionsGrid = document.createElement('div');
      optionsGrid.className = 'options-grid';

      var letters = ['A', 'B', 'C', 'D'];
      var feedbackBox = null;

      item.options.forEach(function (optText, idx) {
        var optBtn = document.createElement('button');
        optBtn.className = 'option-btn';
        optBtn.style.setProperty('--d', (0.08 + idx * 0.07) + 's');
        optBtn.innerHTML = '<span class="option-label">' + letters[idx] + '</span> <span>' + optText + '</span>';

        optBtn.addEventListener('click', function () {
          var result = session.submitAnswer(idx);
          if (result.alreadyAnswered) return;
          playSound(result.isCorrect ? 'playCorrect' : 'playWrong');

          // Nonaktifkan semua tombol
          var allBtns = optionsGrid.querySelectorAll('.option-btn');
          allBtns.forEach(function (b, bIdx) {
            b.disabled = true;
            if (bIdx === result.correctAnswerIndex) b.classList.add('correct');
            else if (bIdx === idx) b.classList.add('wrong');
          });

          // Tampilkan Feedback
          feedbackBox = document.createElement('div');
          feedbackBox.className = 'feedback-box ' + (result.isCorrect ? 'correct' : 'wrong');
          feedbackBox.innerHTML = 
            '<h3>' + (result.isCorrect ? '🎉 Hebat! Jawabanmu Benar!' : '💪 Belum Tepat, Yuk Pelajari!') + '</h3>' +
            '<p>' + result.explanation + '</p>' +
            (result.law ? '<p><small><b>Dasar Hukum:</b> ' + result.law + '</small></p>' : '');

          card.appendChild(feedbackBox);

          // Tombol Lanjut
          var nextBtn = document.createElement('button');
          nextBtn.className = 'btn btn-cta pop-in';
          nextBtn.style.marginTop = '20px';
          nextBtn.textContent = (currIdx < total - 1) ? 'Soal Berikutnya ➔' : 'Lihat Hasil Misi 🏆';

          nextBtn.addEventListener('click', function () {
            if (session.nextQuestion()) {
              renderQuestion();
            } else {
              lastResult = session.getResults();
              Progress.recordResult(lastResult.levelId, lastResult.score);
              navigateTo('#/hasil');
            }
          });

          card.appendChild(nextBtn);
        });

        optionsGrid.appendChild(optBtn);
      });

      card.appendChild(optionsGrid);
      quizWrap.appendChild(card);
    }

    renderQuestion();
    container.appendChild(quizWrap);
  }

  /* ---------- 5. Hasil Kuis ---------- */
  function renderHasil(container) {
    if (!lastResult) {
      navigateTo('#/level');
      return;
    }

    var card = document.createElement('div');
    card.className = 'result-card';
    card.innerHTML = 
      '<div class="result-trophy">' +
        '<svg viewBox="0 0 100 100"><use href="#trophy-icon"/></svg>' +
      '</div>' +
      '<h1>Misi Selesai!</h1>' +
      '<p class="hero-subtitle">Kamu memperoleh nilai <b>' + lastResult.score + ' Poin</b> (' + lastResult.percentage + '%)</p>' +
      '<p>Jawaban Benar: <b>' + lastResult.correct + '</b> dari ' + lastResult.total + ' Soal</p>' +
      '<div class="hero-actions" style="justify-content:center; margin-top: 28px;">' +
        '<a href="#/game/' + lastResult.levelId + '" class="btn btn-secondary"> Main Lagi</a>' +
        '<a href="#/level" class="btn btn-cta"> Pilih Misi Lain</a>' +
      '</div>';

    container.appendChild(card);
    playSound('playFanfare');
    launchConfetti();
  }

  function launchConfetti() {
    if (prefersReduced) return;
    var colors = ['#FFD84D', '#FF8177', '#8CE0BD', '#C8B8FF', '#2367B1', '#BFE7FF'];
    var layer = document.createElement('div');
    layer.className = 'confetti-layer';
    layer.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < 28; i++) {
      var piece = document.createElement('span');
      piece.className = 'confetti' + (i % 4 === 0 ? ' confetti-star' : '');
      piece.style.left = (Math.random() * 100) + '%';
      piece.style.background = piece.className.indexOf('star') > -1 ? 'transparent' : colors[i % colors.length];
      piece.style.animationDelay = (Math.random() * 0.5) + 's';
      piece.style.animationDuration = (1.8 + Math.random() * 1.4) + 's';
      piece.style.setProperty('--drift', ((Math.random() - 0.5) * 160) + 'px');
      piece.style.setProperty('--spin', ((Math.random() - 0.5) * 900) + 'deg');
      if (piece.className.indexOf('star') > -1) piece.textContent = '⭐';
      layer.appendChild(piece);
    }
    document.body.appendChild(layer);
    setTimeout(function () { if (layer.parentNode) layer.parentNode.removeChild(layer); }, 3600);
  }

  /* ---------- 6. Cara Bermain ---------- */
  function renderCaraBermain(container) {
    var box = document.createElement('div');
    box.className = 'quiz-card';
    box.innerHTML = 
      '<h1> Panduan Bermain HAK HERO</h1>' +
      '<ol style="line-height: 2; font-size: 1.1rem; padding-left: 24px;">' +
        '<li><b>Pilih Misi:</b> Mulai dari Misi 1 untuk membuka misi-misi berikutnya.</li>' +
        '<li><b>Jawab Kuis:</b> Pilih jawaban A, B, C, atau D yang paling tepat.</li>' +
        '<li><b>Dapatkan Skor:</b> Setiap jawaban benar bernilai +10 poin.</li>' +
        '<li><b>Kumpulkan Lencana:</b> Selesaikan misi dengan nilai tinggi untuk meraih gelar Superhero Hak Warga Negara!</li>' +
      '</ol>' +
      '<div style="margin-top: 24px;"><a href="#/level" class="btn btn-cta">Mulai Sekarang!</a></div>';

    container.appendChild(box);
  }

  /* ---------- Modal & Reset Progres ---------- */
  function initResetModal() {
    var resetBtn = $('reset-btn');
    var modal = $('reset-modal');
    var cancelBtn = $('cancel-reset');
    var confirmBtn = $('confirm-reset');
    var backdrop = $('modal-backdrop');

    if (!resetBtn || !modal) return;

    resetBtn.addEventListener('click', function () { modal.hidden = false; });
    cancelBtn.addEventListener('click', function () { modal.hidden = true; });
    backdrop.addEventListener('click', function () { modal.hidden = true; });

    confirmBtn.addEventListener('click', function () {
      Progress.reset();
      modal.hidden = true;
      navigateTo('#/beranda');
      handleRoute();
    });
  }

  // Event Listeners Navigasi
  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('DOMContentLoaded', function () {
    handleRoute();
    initResetModal();
  });
})();