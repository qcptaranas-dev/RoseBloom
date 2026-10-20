import { CoupleData, calculateDaysBetween } from '../types';

/**
 * Converts an image URL (e.g. /src/assets/images/... or external) to a base64 Data URL
 * to guarantee that the downloaded standalone HTML file never has broken image links!
 */
async function imageToDataUrl(url: string): Promise<string> {
  if (url.startsWith('data:image')) return url;
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch {
    return url;
  }
}

export async function exportStandaloneHtml(data: CoupleData): Promise<void> {
  // Convert all 4 photos to base64 data URLs so they are fully embedded in the offline file
  const embeddedPhotos = await Promise.all(
    data.photos.map(async (p) => ({
      ...p,
      url: await imageToDataUrl(p.url),
    }))
  );

  const cleanData: CoupleData = {
    ...data,
    photos: embeddedPhotos as [typeof data.photos[0], typeof data.photos[1], typeof data.photos[2], typeof data.photos[3]],
  };

  const payloadJson = JSON.stringify(cleanData).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${cleanData.monthsaryGreeting} - ${cleanData.girlfriendName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Great+Vibes&family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #FAF7F5;
      color: #334155;
      overflow-x: hidden;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
    }
    .font-cormorant { font-family: 'Cormorant Garamond', Georgia, serif; }
    .font-script { font-family: 'Great Vibes', cursive; }
    .hero-container {
      min-height: 90vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 3rem 1.5rem;
    }
    .names-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.35rem 1rem;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.85);
      border: 1px solid rgba(244, 169, 184, 0.6);
      font-size: 0.8rem;
      color: #9F1239;
      margin-bottom: 1.5rem;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .main-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 600;
      color: #4C0519;
      line-height: 1.15;
      margin-bottom: 1rem;
    }
    .date-tag {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-style: italic;
      color: #BE123C;
      font-size: 1.1rem;
      margin-bottom: 1.5rem;
    }
    .subtitle {
      max-width: 32rem;
      color: #57534E;
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 2.5rem;
    }
    .btn-open {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2.25rem;
      border-radius: 9999px;
      background: linear-gradient(135deg, #F43F5E, #E11D48);
      color: #FFFFFF;
      font-size: 1.05rem;
      font-weight: 500;
      border: none;
      cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(225, 29, 72, 0.4);
      transition: all 0.3s ease;
    }
    .btn-open:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 15px 30px -5px rgba(225, 29, 72, 0.5);
    }
    #animation-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
      background: #FAF6F6;
      display: none;
    }
    #bloom-canvas {
      width: 100%;
      height: 100%;
      display: block;
    }
    .status-caption {
      position: absolute;
      bottom: 2.5rem;
      left: 0;
      right: 0;
      text-align: center;
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-style: italic;
      font-size: 1.6rem;
      color: #881337;
      pointer-events: none;
    }
    .content-area {
      max-width: 68rem;
      margin: 0 auto;
      padding: 2rem 1rem 7rem;
      display: none;
      animation: fadeIn 1.2s ease forwards;
    }
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .letter-card {
      background: #FFFDF9;
      border: 1px solid rgba(244, 169, 184, 0.5);
      border-radius: 1.5rem;
      padding: 2.5rem;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.06);
      margin-bottom: 3.5rem;
    }
    .letter-inner {
      border: 1px solid rgba(244, 169, 184, 0.35);
      border-radius: 1rem;
      padding: 2rem;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .photo-card {
      background: #FFFFFF;
      padding: 0.75rem;
      border-radius: 1rem;
      border: 1px solid rgba(244, 169, 184, 0.3);
      box-shadow: 0 4px 12px rgba(0,0,0,0.04);
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .photo-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.08);
    }
    .photo-thumb {
      width: 100%;
      aspect-ratio: 4/3;
      object-fit: cover;
      border-radius: 0.75rem;
    }
    .music-bar {
      position: fixed;
      bottom: 1rem;
      left: 50%;
      transform: translateX(-50%);
      width: 90%;
      max-width: 28rem;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(244, 169, 184, 0.6);
      border-radius: 1rem;
      padding: 0.75rem 1.25rem;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      z-index: 50;
    }
    .play-btn {
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 9999px;
      background: #E11D48;
      color: #FFFFFF;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    /* Modal Lightbox */
    #lightbox {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.88);
      backdrop-filter: blur(8px);
      z-index: 200;
      display: none;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    #lightbox-img {
      max-height: 65vh;
      max-width: 100%;
      object-fit: contain;
      border-radius: 0.75rem;
    }
  </style>
</head>
<body>
  <div id="hero-view" class="hero-container">
    <div class="names-badge">
      <span>❤️</span>
      <span>${cleanData.senderName}</span>
      <span>&amp;</span>
      <span>${cleanData.girlfriendName}</span>
      <span>❤️</span>
    </div>
    <div style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.35rem 1rem; border-radius: 9999px; background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(244, 169, 184, 0.6); font-size: 0.85rem; color: #881337; margin-bottom: 1.25rem;">
      <span>✨</span>
      <strong style="color: #4C0519; font-family: monospace; font-size: 1rem;">${calculateDaysBetween(cleanData.relationshipStartDate || cleanData.startMonth, cleanData.currentCelebrationDate || cleanData.currentMonth, cleanData.customDaysCount).days}</strong>
      <span>Days Being With You</span>
      <span>✨</span>
    </div>
    <h1 class="main-title">${cleanData.monthsaryGreeting}</h1>
    <div class="date-tag">✨ ${cleanData.monthsaryDate} ✨</div>
    <p class="subtitle">${cleanData.anniversarySubtitle}</p>
    <button id="open-btn" class="btn-open">
      <span>🌸</span>
      <span>Open Your Letter</span>
      <span>➔</span>
    </button>
  </div>

  <div id="passcode-overlay" style="display: none; position: fixed; inset: 0; z-index: 200; background: rgba(0,0,0,0.65); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); align-items: center; justify-content: center; padding: 1rem;">
    <div style="background: #FFFDF9; border: 1px solid rgba(244,169,184,0.8); border-radius: 1.5rem; max-width: 22rem; width: 100%; padding: 2rem 1.5rem; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
      <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">🔒</div>
      <h3 style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.8rem; color: #4C0519; margin-bottom: 0.25rem;">A Secret Surprise</h3>
      <p style="font-size: 0.8rem; color: #881337; margin-bottom: 1.25rem;">For ${cleanData.girlfriendName}, enter your secret passcode to unlock:</p>
      <input id="pc-input" type="text" placeholder="Passcode" style="width: 100%; padding: 0.6rem 1rem; border-radius: 0.75rem; border: 1px solid #F4A9B8; font-size: 1.1rem; text-align: center; font-family: monospace; font-weight: bold; margin-bottom: 0.75rem; outline: none; background: white;" />
      <div id="pc-error" style="display: none; color: #E11D48; font-size: 0.75rem; margin-bottom: 0.75rem;">Not quite, my sweetheart! Try again or check the hint.</div>
      <div id="pc-hint" style="display: none; background: #FFF5F7; border: 1px solid #FCE7F3; padding: 0.5rem; border-radius: 0.5rem; font-size: 0.75rem; color: #881337; font-style: italic; margin-bottom: 0.75rem;">Hint: "${cleanData.passcode?.hint || 'Our special date'}"</div>
      <button onclick="checkPasscode()" style="width: 100%; padding: 0.75rem; border-radius: 0.75rem; background: linear-gradient(135deg, #E11D48, #BE123C); color: white; border: none; font-size: 0.9rem; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(225,29,72,0.3);">Unlock with Love 💕</button>
      <button onclick="toggleHint()" style="background: none; border: none; color: #9F1239; font-size: 0.75rem; margin-top: 0.75rem; cursor: pointer; text-decoration: underline;">Need a hint? 🌸</button>
    </div>
  </div>

  <div id="animation-overlay">
    <canvas id="bloom-canvas"></canvas>
    <div id="status-caption" class="status-caption">A flower is blooming for you...</div>
  </div>

  <main id="letter-view" class="content-area">
    <div class="letter-card">
      <div class="letter-inner">
        <h2 class="font-cormorant" style="font-size: 2.25rem; text-align: center; color: #4C0519; margin-bottom: 1.5rem;">
          ${cleanData.letter.title}
        </h2>
        <div class="font-cormorant" style="font-size: 1.4rem; color: #881337; font-style: italic; margin-bottom: 1.25rem;">
          ${cleanData.letter.greeting}
        </div>
        <div style="font-size: 0.95rem; line-height: 1.8; color: #44403C; white-space: pre-line; margin-bottom: 2rem;">
          ${cleanData.letter.body}
        </div>
        <div style="text-align: right; border-top: 1px solid rgba(244,169,184,0.3); padding-top: 1.25rem;">
          <div class="font-cormorant" style="font-style: italic; font-size: 1.1rem; color: #57534E;">
            ${cleanData.letter.closing}
          </div>
          <div class="font-script" style="font-size: 2.5rem; color: #BE123C; margin-top: 0.25rem;">
            ${cleanData.letter.signature}
          </div>
        </div>
      </div>
    </div>

    <div style="text-align: center; margin-bottom: 2rem;">
      <div style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.15em; color: #E11D48; font-weight: 600;">Our Cherished Moments</div>
      <h3 class="font-cormorant" style="font-size: 2.25rem; color: #4C0519;">Four Chapters of Us</h3>
    </div>

    <div class="gallery-grid">
      ${cleanData.photos
        .map(
          (p, i) => `
        <div class="photo-card" onclick="openPhoto(${i})">
          <img src="${p.url}" alt="${p.title}" class="photo-thumb" />
          <div style="padding-top: 0.75rem;">
            <div style="font-size: 0.7rem; color: #E11D48; font-weight: 600;">MEMORY 0${i + 1}</div>
            <div class="font-cormorant" style="font-size: 1.15rem; font-weight: 600; color: #4C0519; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.title}</div>
            <div style="font-size: 0.8rem; color: #57534E; margin-top: 0.25rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.caption}</div>
          </div>
        </div>
      `
        )
        .join('')}
    </div>
  </main>

  <div class="music-bar">
    <div style="min-width: 0; flex: 1;">
      <div style="font-size: 0.8rem; font-weight: 600; color: #4C0519; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
        ${cleanData.music.title}
      </div>
      <div style="font-size: 0.7rem; color: #9F1239; opacity: 0.8;">
        ${cleanData.music.artist}
      </div>
    </div>
    ${cleanData.music.externalPlaylistUrl ? `
    <a href="${cleanData.music.externalPlaylistUrl}" target="_blank" style="padding: 0.35rem 0.75rem; border-radius: 9999px; background: rgba(244, 169, 184, 0.25); border: 1px solid rgba(244, 169, 184, 0.6); color: #881337; font-size: 0.7rem; text-decoration: none; font-weight: 600; white-space: nowrap;">
      🎵 Stream Link
    </a>` : ''}
    <button id="music-btn" class="play-btn" onclick="toggleAudio()">▶</button>
  </div>

  <div id="lightbox" onclick="closePhoto()">
    <div style="max-width: 48rem; width: 100%; text-align: center;" onclick="event.stopPropagation()">
      <div style="display: flex; justify-content: space-between; color: #FFFFFF; font-size: 0.85rem; margin-bottom: 0.75rem;">
        <span id="lb-counter">1 of 4</span>
        <button onclick="closePhoto()" style="background: none; border: none; color: #FFFFFF; font-size: 1.25rem; cursor: pointer;">✕</button>
      </div>
      <img id="lightbox-img" src="" alt="Enlarged photo" />
      <div style="background: rgba(255,255,255,0.96); padding: 1rem 1.5rem; border-radius: 0.75rem; margin-top: 1rem; text-align: left; max-height: 8rem; overflow-y: auto;">
        <div id="lb-title" class="font-cormorant" style="font-size: 1.25rem; font-weight: 600; color: #4C0519; margin-bottom: 0.25rem;"></div>
        <div id="lb-caption" style="font-size: 0.85rem; color: #44403C; line-height: 1.6;"></div>
      </div>
    </div>
  </div>

  <script>
    const APP_DATA = ${payloadJson};
    let currentPhotoIdx = 0;

    function openPhoto(idx) {
      currentPhotoIdx = idx;
      const photo = APP_DATA.photos[idx];
      document.getElementById('lightbox-img').src = photo.url;
      document.getElementById('lb-title').innerText = photo.title;
      document.getElementById('lb-caption').innerText = photo.caption;
      document.getElementById('lb-counter').innerText = (idx + 1) + ' of 4';
      document.getElementById('lightbox').style.display = 'flex';
    }

    function closePhoto() {
      document.getElementById('lightbox').style.display = 'none';
    }

    // Built-in Web Audio romantic acoustic synthesizer
    let audioCtx = null;
    let isPlaying = false;
    let audioTimer = null;

    function initAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playNote(freq, dur, vol, type) {
      if (!audioCtx || !isPlaying) return;
      try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type || 'sine';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
        gain.gain.linearRampToValueAtTime(vol * 0.15, audioCtx.currentTime + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + dur);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + dur + 0.1);
      } catch (e) {}
    }

    function startMusic() {
      initAudio();
      isPlaying = true;
      document.getElementById('music-btn').innerText = '❚❚';
      const notes = [
        {f: 349.23, d: 2.2, v: 0.8}, {f: 440.0, d: 1.8, v: 0.6}, {f: 523.25, d: 2.5, v: 0.9},
        {f: 293.66, d: 2.0, v: 0.7}, {f: 392.0, d: 1.8, v: 0.6}, {f: 440.0, d: 2.2, v: 0.8}
      ];
      let step = 0;
      if (audioTimer) clearInterval(audioTimer);
      audioTimer = setInterval(() => {
        if (!isPlaying) return;
        const n = notes[step % notes.length];
        playNote(n.f, n.d, n.v, 'triangle');
        playNote(n.f * 0.5, n.d * 1.5, n.v * 0.5, 'sine');
        step++;
      }, 700);
    }

    function toggleAudio() {
      if (isPlaying) {
        isPlaying = false;
        document.getElementById('music-btn').innerText = '▶';
        if (audioTimer) clearInterval(audioTimer);
      } else {
        startMusic();
      }
    }

    // Rose Canvas Bloom & Rush Animation
    const canvas = document.getElementById('bloom-canvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const passcodeData = ${JSON.stringify(cleanData.passcode || { enabled: false, code: '1024', hint: '' })};

    document.getElementById('open-btn').addEventListener('click', () => {
      if (passcodeData && passcodeData.enabled) {
        document.getElementById('passcode-overlay').style.display = 'flex';
        const inp = document.getElementById('pc-input');
        if (inp) {
          inp.value = '';
          inp.focus();
        }
      } else {
        unlockAndStart();
      }
    });

    const pcInputEl = document.getElementById('pc-input');
    if (pcInputEl) {
      pcInputEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') checkPasscode();
      });
    }

    window.checkPasscode = function() {
      const inp = document.getElementById('pc-input');
      const val = inp ? inp.value.trim() : '';
      const target = (passcodeData.code || '1024').trim().toLowerCase();
      if (val.toLowerCase() === target) {
        document.getElementById('passcode-overlay').style.display = 'none';
        unlockAndStart();
      } else {
        const err = document.getElementById('pc-error');
        if (err) err.style.display = 'block';
      }
    };

    window.toggleHint = function() {
      const h = document.getElementById('pc-hint');
      if (h) h.style.display = h.style.display === 'none' ? 'block' : 'none';
    };

    function unlockAndStart() {
      startMusic();
      document.getElementById('hero-view').style.display = 'none';
      document.getElementById('animation-overlay').style.display = 'block';
      startBloomSequence();
    }

    function startBloomSequence() {
      const startTime = performance.now();
      const petals3D = [];
      for (let i = 0; i < 160; i++) {
        const a = Math.random() * Math.PI * 2;
        petals3D.push({
          x: Math.cos(a) * Math.random() * 80,
          y: Math.sin(a) * Math.random() * 60,
          z: 700 + Math.random() * 1100,
          vx: Math.cos(a) * 1.6,
          vy: Math.sin(a) * 1.3 - 0.4,
          vz: -(4.8 + Math.random() * 7.5),
          rotX: Math.random() * Math.PI * 2,
          rotY: Math.random() * Math.PI * 2,
          rotZ: Math.random() * Math.PI * 2,
          vRotX: (Math.random() - 0.5) * 0.04,
          vRotY: (Math.random() - 0.5) * 0.05,
          vRotZ: (Math.random() - 0.5) * 0.03,
          size: 40 + Math.random() * 45
        });
      }

      function loop(now) {
        const t = (now - startTime) / 1000;
        const cap = document.getElementById('status-caption');
        if (t < 2.5) cap.innerText = "A garden rose arrives for you...";
        else if (t < 6.0) cap.innerText = "Blooming with every beat of my heart...";
        else if (t < 8.5) cap.innerText = "In full, radiant bloom for you, ${cleanData.girlfriendName}...";
        else if (t < 11.5) cap.innerText = "A shower of rose petals rushing toward you...";
        else cap.innerText = "Revealing your love letter...";

        ctx.clearRect(0, 0, width, height);

        // Background
        const grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, '#FFF5F7');
        grad.addColorStop(1, '#FCE8ED');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Center rosebud / bloom
        let bloom = Math.max(0, Math.min(1, (t - 2.0) / 4.0));
        let roseAlpha = t > 8.5 ? Math.max(0, 1 - (t - 8.5) / 2.5) : 1;

        if (roseAlpha > 0.01) {
          ctx.save();
          ctx.globalAlpha = roseAlpha;
          const cx = width / 2;
          const cy = height / 2;
          ctx.translate(cx, cy);

          // Calyx & Stem
          ctx.beginPath();
          ctx.moveTo(0, 20);
          ctx.quadraticCurveTo(-10, 140, 5, 260);
          ctx.strokeStyle = '#47684C';
          ctx.lineWidth = 7;
          ctx.stroke();

          // Rose petals
          for (let r = 0; r < 5; r++) {
            const numP = 5;
            const dist = 10 + bloom * (40 - r * 6);
            for (let i = 0; i < numP; i++) {
              const ang = (i / numP) * Math.PI * 2 + (r * 0.4);
              ctx.save();
              ctx.rotate(ang);
              ctx.translate(0, -dist);
              ctx.beginPath();
              ctx.arc(0, 0, 20 + bloom * (25 - r * 3), 0, Math.PI * 2);
              ctx.fillStyle = r % 2 === 0 ? '#E15B7C' : '#F48BA2';
              ctx.shadowColor = 'rgba(160, 40, 70, 0.3)';
              ctx.shadowBlur = 6;
              ctx.fill();
              ctx.restore();
            }
          }
          ctx.restore();
        }

        // 3D Petal Rush
        if (t > 7.5) {
          petals3D.sort((a,b) => b.z - a.z);
          petals3D.forEach(p => {
            p.z += p.vz;
            p.x += p.vx;
            p.y += p.vy;
            p.rotZ += p.vRotZ;
            p.rotX += p.vRotX;

            if (p.z < 20) {
              if (t < 12.0) {
                p.z = 700 + Math.random() * 400;
              } else {
                return;
              }
            }

            const scale = 450 / p.z;
            const sx = width / 2 + p.x * scale;
            const sy = height / 2 + p.y * scale;

            ctx.save();
            ctx.translate(sx, sy);
            ctx.rotate(p.rotZ);
            ctx.scale(scale * Math.cos(p.rotX), scale);
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fillStyle = '#E86687';
            ctx.shadowColor = 'rgba(120, 20, 50, 0.3)';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
          });
        }

        if (t >= 11.5) {
          const overlay = document.getElementById('animation-overlay');
          const fade = Math.max(0, 1 - (t - 11.5) / 1.5);
          overlay.style.opacity = fade;
          document.getElementById('letter-view').style.display = 'block';
        }

        if (t < 13.5) {
          requestAnimationFrame(loop);
        } else {
          document.getElementById('animation-overlay').style.display = 'none';
        }
      }
      requestAnimationFrame(loop);
    }
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Our-Monthsary-Love-Letter-${data.girlfriendName}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
