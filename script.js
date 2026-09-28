const hamburgerBtn = document.getElementById('hamburgerBtn');
  const drawer = document.getElementById('drawer');
  const overlay = document.getElementById('drawerOverlay');

  function openDrawer(){
    drawer.classList.add('open');
    overlay.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    hamburgerBtn.setAttribute('aria-label', 'Close menu');
  }
  function closeDrawer(){
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', 'Open menu');
  }
  hamburgerBtn.addEventListener('click', () => {
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
  });
  overlay.addEventListener('click', closeDrawer);
  drawer.querySelectorAll('[data-close]').forEach(a => a.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeDrawer(); });

  // staggered reveal for skill tags as each group scrolls into view
  const skillGroups = document.querySelectorAll('.skill-group');
  const groupObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const tags = entry.target.querySelectorAll('.tag');
        tags.forEach((tag, i) => {
          tag.style.transitionDelay = (i * 45) + 'ms';
          tag.classList.add('in');
        });
        groupObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  skillGroups.forEach(g => groupObserver.observe(g));

  // ---------- radar chart: hover/tap a point for a skill breakdown ----------
  const RADAR_DATA = [
    { title:'Routing & Switching', score:5, color:'#5fb88a', desc:'Core to the current role — daily VLAN, OSPF/BGP, and MPLS/VPLS work at Multinet.', skills:['Cisco','MikroTik','Alcatel‑Lucent','VLAN','OSPF / OSPFv3','BGP (iBGP/eBGP)','MPLS / VPLS'] },
    { title:'Wireless & RF', score:4, color:'#e8a33d', desc:'Bookends the journey — from the 2020 radio internship to today\u2019s pre‑sales wireless design.', skills:['Ubiquiti','UISP Design Center','PtP / PtMP','Line of Sight Analysis','Coverage Mapping'] },
    { title:'Data Center Ops', score:4, color:'#e8a33d', desc:'Nationwide spine‑leaf infrastructure supporting 21 NeuCentrIX sites at Telkom.', skills:['Spine‑Leaf Topology','Arista','EdgeCore','Capacity Reporting','Config Backup & Audit'] },
    { title:'Linux & Systems', score:4, color:'#e8a33d', desc:'Backbone of the System Administrator role — CLI, scripting, and self‑hosted services.', skills:['Linux CLI','Shell Scripting','iptables','Postfix / Dovecot','MariaDB Galera','FreeRADIUS','BIND9','Apache2','VyOS / Vyatta','Docker','Open vSwitch','Linux Bridge'] },
    { title:'Monitoring & Security', score:4, color:'#e8a33d', desc:'Config audits, hardening, and SLA‑driven monitoring across data center operations.', skills:['NOC Monitoring','Security Hardening','SLA Compliance','Access & Config Audits'] },
    { title:'Leadership & Comms', score:3, color:'#e5686b', desc:'Cross‑team coordination with field engineers, vendors, and stakeholders.', skills:['Leadership','Team Communication'] }
  ];

  // shared helper: position a fixed-position tooltip near an anchor element,
  // flipping above/below and clamping horizontally so it never gets clipped
  function positionTooltip(tooltipEl, anchorRect){
    const ttWidth = tooltipEl.offsetWidth || 200;
    const ttHeight = tooltipEl.offsetHeight || 100;
    let left = anchorRect.left + anchorRect.width / 2;
    left = Math.max(ttWidth / 2 + 10, Math.min(left, window.innerWidth - ttWidth / 2 - 10));
    let top;
    if(anchorRect.top - ttHeight - 14 > 8){
      top = anchorRect.top - 14;
      tooltipEl.style.transform = 'translate(-50%, -100%)';
    } else {
      top = anchorRect.bottom + 14;
      tooltipEl.style.transform = 'translate(-50%, 0)';
    }
    tooltipEl.style.left = left + 'px';
    tooltipEl.style.top = top + 'px';
  }

  const radarWrap = document.querySelector('.radar-wrap');
  if(radarWrap){
    const tooltip = document.getElementById('radarTooltip');
    const rtTitle = document.getElementById('rtTitle');
    const rtScore = document.getElementById('rtScore');
    const rtDesc = document.getElementById('rtDesc');
    const rtList = document.getElementById('rtList');

    function showRadarPoint(idx, anchorEl){
      const d = RADAR_DATA[idx];
      if(!d) return;
      rtTitle.textContent = d.title;
      rtDesc.textContent = d.desc;
      rtScore.innerHTML = Array.from({length:5}, (_, i) =>
        `<i class="${i < d.score ? 'on' : ''}" style="--dot-color:${d.color}"></i>`
      ).join('') + `<span style="margin-left:5px;font-family:var(--font-mono);font-size:10px;color:${d.color}">${d.score}/5</span>`;
      rtList.innerHTML = d.skills.map(s => `<li>${s}</li>`).join('');
      tooltip.classList.add('show');
      positionTooltip(tooltip, anchorEl.getBoundingClientRect());
    }
    function hideRadarPoint(){
      tooltip.classList.remove('show');
      document.querySelectorAll('.radar-marker').forEach(m => m.classList.remove('active'));
    }

    document.querySelectorAll('.radar-hit').forEach(el => {
      const idx = el.dataset.idx;
      el.setAttribute('tabindex', '0');
      const marker = document.querySelector(`.radar-marker[data-idx="${idx}"]`);
      const anchor = () => (marker || el);
      el.addEventListener('mouseenter', () => {
        document.querySelectorAll('.radar-marker').forEach(m => m.classList.remove('active'));
        if(marker) marker.classList.add('active');
        showRadarPoint(idx, anchor());
      });
      el.addEventListener('mouseleave', hideRadarPoint);
      el.addEventListener('focus', () => {
        if(marker) marker.classList.add('active');
        showRadarPoint(idx, anchor());
      });
      el.addEventListener('blur', hideRadarPoint);
      el.addEventListener('click', (e) => { e.stopPropagation(); if(marker) marker.classList.add('active'); showRadarPoint(idx, anchor()); });
    });
    document.addEventListener('click', hideRadarPoint);
  }

  // ---------- career timeline: hover/tap a row for a quick summary ----------
  const GANTT_DATA = [
    { role:'Radio Network Engineer — Internship', company:'Comtelindo', period:'Jan 2020 – Mar 2020', desc:'A 3‑month internship installing and maintaining Ubiquiti radio links — the starting point of the journey.' },
    { role:'Engineer On Site', company:'ICONPLUS (PLN Icon Plus)', period:'Sep 2022 – Mar 2025', desc:'2.5 years keeping 130+ regional government network points online across Balikpapan.' },
    { role:'Data Center Engineer', company:'Telkom Indonesia', period:'May 2025 – May 2026', desc:'One year supporting 21 NeuCentrIX data center sites nationwide — monitoring, audits, and spine‑leaf ops.' },
    { role:'NOC Engineer / SysAdmin / Pre‑Sales', company:'Multinet Perkasa Indonesia', period:'Jul 2026 – Present', desc:'Current role spanning routing, Linux systems administration, and wireless network design.' }
  ];

  const ganttWrap = document.querySelector('.gantt-wrap');
  if(ganttWrap){
    const gTooltip = document.getElementById('ganttTooltip');
    const gtRole = document.getElementById('gtRole');
    const gtPeriod = document.getElementById('gtPeriod');
    const gtCompany = document.getElementById('gtCompany');
    const gtDesc = document.getElementById('gtDesc');

    function showGanttRow(idx, anchorEl){
      const d = GANTT_DATA[idx];
      if(!d) return;
      gtRole.textContent = d.role;
      gtPeriod.textContent = d.period;
      gtCompany.textContent = d.company;
      gtDesc.textContent = d.desc;
      gTooltip.classList.add('show');
      positionTooltip(gTooltip, anchorEl.getBoundingClientRect());

      document.querySelectorAll('.gantt-bar').forEach(b => b.classList.remove('active'));
      const bar = document.getElementById(`bar-${idx}`);
      if(bar) bar.classList.add('active');
    }
    function hideGanttRow(){
      gTooltip.classList.remove('show');
      document.querySelectorAll('.gantt-bar').forEach(b => b.classList.remove('active'));
    }

    document.querySelectorAll('.gantt-hit').forEach(el => {
      const idx = el.dataset.idx;
      el.setAttribute('tabindex', '0');
      const bar = document.getElementById(`bar-${idx}`);
      const anchor = () => (bar || el);
      el.addEventListener('mouseenter', () => showGanttRow(idx, anchor()));
      el.addEventListener('mouseleave', hideGanttRow);
      el.addEventListener('focus', () => showGanttRow(idx, anchor()));
      el.addEventListener('blur', hideGanttRow);
      el.addEventListener('click', (e) => { e.stopPropagation(); showGanttRow(idx, anchor()); });
    });
    document.addEventListener('click', hideGanttRow);
  }

  // ---------- contact: copy-to-clipboard on port cards ----------
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const url = btn.dataset.copy;
      const done = () => {
        const original = btn.textContent;
        btn.textContent = '✓';
        btn.classList.add('copied');
        setTimeout(() => { btn.textContent = original; btn.classList.remove('copied'); }, 1400);
      };
      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(url).then(done).catch(done);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch(err) {}
        document.body.removeChild(ta);
        done();
      }
    });
  });

  // ---------- contact: live ping jitter on each port card ----------
  const pingEls = document.querySelectorAll('.ping-val');
  function jitterPings(){
    pingEls.forEach(el => {
      const base = parseInt(el.dataset.base, 10) || 20;
      const val = Math.max(6, base + Math.round((Math.random() - 0.5) * 10));
      el.textContent = val + ' ms';
      el.classList.remove('ping-good', 'ping-warn', 'ping-bad');
      if(val < 18) el.classList.add('ping-good');
      else if(val < 30) el.classList.add('ping-warn');
      else el.classList.add('ping-bad');
    });
  }
  if(pingEls.length){ jitterPings(); setInterval(jitterPings, 2200); }

  // ---------- footer: live WITA clock (Asia/Makassar, GMT+8) ----------
  const footerClock = document.getElementById('footerClock');
  const sceneClock = document.getElementById('sceneClock');
  const witaFormat = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false, timeZone: 'Asia/Makassar'
  });
  function updateClock(){
    const time = witaFormat.format(new Date());          // e.g. 18:00:00
    if(footerClock) footerClock.textContent = time + ' WITA';
    if(sceneClock) sceneClock.textContent = time;
  }
  if(footerClock || sceneClock){ updateClock(); setInterval(updateClock, 1000); }

// ---------- footer: full-width pixel-art dusk scene (two chibis watching the city) ----------
(function(){
  const canvas = document.getElementById('pixelScene');
  if(!canvas) return;
  const scene = canvas.parentElement;
  const ctx = canvas.getContext('2d');
  const SCALE = 2;          // each logical pixel = 2 CSS px
  const H = 80;
  const GROUND_Y = 62;
  let W = 160;              // logical width — recalculated to fill the footer

  const px = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); };
  function disc(cx, cy, r, c){
    for(let y = -r; y <= r; y++) for(let x = -r; x <= r; x++) if(x*x + y*y <= r*r) px(cx + x, cy + y, 1, 1, c);
  }
  function sprite(rows, pal, ox, oy){
    for(let ry = 0; ry < rows.length; ry++){
      const row = rows[ry];
      for(let rx = 0; rx < row.length; rx++){
        const ch = row[rx];
        if(ch !== '.') px(ox + rx, oy + ry, 1, 1, pal[ch]);
      }
    }
  }

  // stable pseudo-random so the city looks the same on every load
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // ----- layout state (rebuilt whenever the width changes) -----
  let FAR = [], NEAR = [], ANT = [], farWin = [], nearWin = [], STARS = [], CLOUDS = [];
  let chibiX = 60, sunX = 112, lampX = 146;

  function build(){
    seed = 7;
    chibiX = Math.round(W * 0.4);
    sunX   = Math.round(W * 0.72);
    lampX  = Math.min(W - 8, chibiX + 46);

    // far skyline (lighter, taller) — kept low around the sun so it stays visible
    FAR = [];
    for(let x = 0; x < W; ){
      const w = 8 + Math.floor(rnd() * 5);
      let h = 15 + Math.floor(rnd() * 14);
      if(Math.abs(x + w / 2 - sunX) < 16) h = Math.min(h, 17);
      FAR.push([x, w, h]);
      x += w;
    }
    // near skyline (darker, lower) — kept very low behind the chibis
    NEAR = [];
    for(let x = 0; x < W; ){
      const w = 9 + Math.floor(rnd() * 6);
      let h = 8 + Math.floor(rnd() * 11);
      if(x + w > chibiX - 4 && x < chibiX + 30) h = 7 + Math.floor(rnd() * 3);
      NEAR.push([x, w, h]);
      x += w;
    }
    ANT = FAR.filter(b => b[2] >= 26);

    farWin = []; nearWin = [];
    FAR.forEach(b => {
      const x = b[0], w = b[1], h = b[2], top = GROUND_Y - h;
      for(let wx = x + 2; wx <= x + w - 3; wx += 3)
        for(let wy = top + 2; wy <= top + h - 8; wy += 3) farWin.push({ x: wx, y: wy, on: rnd() < 0.2 });
    });
    NEAR.forEach(b => {
      const x = b[0], w = b[1], h = b[2], top = GROUND_Y - h;
      for(let wx = x + 2; wx <= x + w - 3; wx += 3)
        for(let wy = top + 2; wy <= GROUND_Y - 4; wy += 3) nearWin.push({ x: wx, y: wy, on: rnd() < 0.35 });
    });

    STARS = [];
    const ns = Math.round(W / 16);
    for(let i = 0; i < ns; i++) STARS.push([Math.floor(rnd() * W), 2 + Math.floor(rnd() * 15)]);

    CLOUDS = [];
    const nc = Math.max(2, Math.round(W / 90));
    for(let i = 0; i < nc; i++){
      CLOUDS.push({
        off: Math.floor(rnd() * (W + 24)),
        y: 16 + Math.floor(rnd() * 14),
        sp: 0.05 + rnd() * 0.06,
        c1: i % 2 ? '#e58aa0' : '#f0a0a0',
        c2: i % 2 ? '#c45f86' : '#d47f8f'
      });
    }
  }
  function toggleWindows(){
    for(let i = 0; i < 4 + Math.round(W / 120); i++){ const w = nearWin[(Math.random() * nearWin.length) | 0]; if(w) w.on = !w.on; }
    for(let i = 0; i < 1 + Math.round(W / 200); i++){ const f = farWin[(Math.random() * farWin.length) | 0]; if(f) f.on = !f.on; }
  }

  // ----- sky -----
  const SKY = [
    [0,'#1f1740'],[8,'#2e2059'],[14,'#4a2a6e'],[20,'#6d3577'],[26,'#94407a'],
    [31,'#c2537a'],[36,'#e8706b'],[41,'#f59462'],[46,'#fbb36a'],[51,'#ffd08a']
  ];
  function drawSky(){
    for(let i = 0; i < SKY.length; i++){
      const y0 = SKY[i][0];
      const y1 = i + 1 < SKY.length ? SKY[i + 1][0] : GROUND_Y;
      px(0, y0, W, y1 - y0, SKY[i][1]);
    }
    for(let i = 1; i < SKY.length; i++){          // checkerboard dithering on each band edge
      const y = SKY[i][0] - 1;
      for(let x = i % 2; x < W; x += 2) px(x, y, 1, 1, SKY[i][1]);
    }
  }
  function drawStars(t){
    STARS.forEach((s, i) => {
      const on = (((t >> 2) + i * 3) % 5) !== 0;
      px(s[0], s[1], 1, 1, on ? '#fff6d5' : '#8a7bb5');
    });
  }
  function drawSun(t){
    const glow = ((t >> 3) % 2) ? 13 : 12;
    ctx.globalAlpha = 0.25; disc(sunX, 41, glow, '#ffe6a8'); ctx.globalAlpha = 1;
    disc(sunX, 41, 9, '#ffd27a');
    disc(sunX, 41, 7, '#fff0c4');
  }
  const CLOUD = ['....####....', '..########..', '.##########.', '############'];
  function drawCloud(cx, cy, c1, c2){
    CLOUD.forEach((row, ry) => {
      for(let rx = 0; rx < row.length; rx++) if(row[rx] === '#') px(cx + rx, cy + ry, 1, 1, ry >= 3 ? c2 : c1);
    });
  }
  function drawClouds(t){
    CLOUDS.forEach(c => drawCloud(((t * c.sp + c.off) % (W + 24)) - 12, c.y, c.c1, c.c2));
  }
  const BIRD = [['#...#', '.#.#.', '..#..'], ['..#..', '.###.', '#...#']];
  function drawBird(x, y, f){
    BIRD[f].forEach((row, ry) => {
      for(let rx = 0; rx < 5; rx++) if(row[rx] === '#') px(x + rx, y + ry, 1, 1, '#3a2352');
    });
  }
  function drawBirds(t){
    const f = (t >> 1) % 2;
    const x = ((t * 0.4) % (W + 40)) - 20;
    drawBird(x, 24 + Math.round(Math.sin(t * 0.12) * 2), f);
    drawBird(x - 9, 29 + Math.round(Math.sin(t * 0.12 + 1) * 2), (f + 1) % 2);
    const x2 = ((t * 0.3 + W * 0.55) % (W + 40)) - 20;      // a second pair on wide screens
    if(W > 260){
      drawBird(x2, 20 + Math.round(Math.sin(t * 0.1 + 2) * 2), (f + 1) % 2);
      drawBird(x2 - 8, 25 + Math.round(Math.sin(t * 0.1 + 3) * 2), f);
    }
  }

  // ----- city -----
  function drawBuildings(list, color, rim){
    list.forEach(b => {
      px(b[0], GROUND_Y - b[2], b[1], b[2], color);
      px(b[0] + b[1] - 1, GROUND_Y - b[2], 1, b[2], rim);   // sunset-lit edge
    });
  }
  function drawAntennas(t){
    ANT.forEach((a, i) => {
      const cx = a[0] + (a[1] >> 1), top = GROUND_Y - a[2];
      px(cx, top - 4, 1, 4, '#74508f');
      px(cx, top - 5, 1, 1, (((t >> 2) + i) % 2) ? '#ff5a5a' : '#7a3a4a');
    });
  }
  function drawGround(){
    px(0, GROUND_Y, W, H - GROUND_Y, '#150f22');
    for(let x = 0; x < W; x += 8){
      px(x, GROUND_Y, 7, 1, '#5a4275');
      px(x, GROUND_Y + 1, 7, 1, '#3a2a52');
    }
  }
  function drawLamp(t){
    const flick = (t % 53) < 2;
    px(lampX, 44, 1, 18, '#2a1d40');
    px(lampX - 2, 43, 5, 1, '#2a1d40');
    px(lampX - 2, 44, 5, 2, flick ? '#b08a4a' : '#ffe08a');
    ctx.globalAlpha = 0.18; disc(lampX, 45, 7, '#ffc85a'); ctx.globalAlpha = 1;
  }

  // ----- the two chibis (seen from behind) -----
  const HEAD = [
    '...HHHHHH...',
    '..HHHHHHHH..',
    '.HHHHHHHHHh.',
    '.HHHHHHHHHh.',
    '.HHHHHHHHHh.',
    'SHHHHHHHHHhS',
    '.HHHHHHHHHh.',
    '..HHHHHHHh..',
    '...HHHHHH...'
  ];
  const BODY = [
    '....SSSS....',
    '..TTTTTTTT..',
    '.TTTTTTTTTt.',
    '.TTTTTTTTTt.',
    '.TTTuuTTTTt.',
    '.TTTTTTTTTt.',
    '.TTTTTTTTTt.',
    '.TTTTTTTTTt.'
  ];
  const PAL_A = { H:'#2c1d33', h:'#ff9d5c', S:'#f2c9a0', T:'#f07a3a', t:'#ffb56b', u:'#c85a26' };
  const PAL_B = { H:'#e9b872', h:'#fff0c4', S:'#f2c9a0', T:'#3fa7a0', t:'#8fe0d0', u:'#2c7f7a' };

  function chibi(x, pal, headDx, bob, ponytail, t){
    const top = GROUND_Y - (HEAD.length + BODY.length);
    sprite(BODY, pal, x, top + HEAD.length);
    sprite(HEAD, pal, x + headDx, top - bob);
    if(ponytail){
      const sway = [0, 1, 0, -1][(t >> 2) % 4];
      const hx = x + headDx + 5, hy = top - bob;
      px(hx, hy + 5, 2, 1, '#ff5c8a');                                   // ribbon
      for(let i = 0; i < 8; i++){
        const ox = Math.round(sway * i / 7);
        px(hx + ox, hy + 6 + i, i >= 6 ? 1 : 2, 1, i === 7 ? pal.h : pal.H);
      }
    }
  }
  const HEART = ['.H.H.', 'HHHHH', 'HHHHH', '.HHH.', '..H..'];
  function drawHeart(cx, y, alpha){
    ctx.globalAlpha = Math.max(0, alpha);
    HEART.forEach((row, ry) => {
      for(let rx = 0; rx < 5; rx++) if(row[rx] === 'H') px(cx + rx, y + ry, 1, 1, '#ff6b8a');
    });
    ctx.globalAlpha = 1;
  }

  function frame(t){
    drawSky();
    drawStars(t);
    drawSun(t);
    drawClouds(t);
    drawBuildings(FAR, '#74508f', '#a0608a');
    farWin.forEach(w => { if(w.on) px(w.x, w.y, 1, 1, '#c9a0dc'); });
    drawBirds(t);
    drawAntennas(t);
    drawBuildings(NEAR, '#34204f', '#6a3a70');
    nearWin.forEach(w => { if(w.on) px(w.x, w.y, 1, 2, '#ffd66b'); });
    drawGround();
    drawLamp(t);

    // every ~7s the two lean their heads together and a little heart floats up
    const cyc = t % 70;
    let dx = 0;
    if((cyc >= 34 && cyc < 38) || (cyc >= 52 && cyc < 56)) dx = 1;
    else if(cyc >= 38 && cyc < 52) dx = 2;
    chibi(chibiX,      PAL_A,  dx, (t >> 3) % 2,       false, t);
    chibi(chibiX + 15, PAL_B, -dx, ((t >> 3) + 1) % 2, true,  t);
    if(cyc >= 38 && cyc < 56){
      const p = (cyc - 38) / 18;
      drawHeart(chibiX + 10, 36 - Math.round(p * 8), 1 - p);
    }
  }

  // ----- sizing: stretch the scene across the whole footer width -----
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t = reduced ? 40 : 0;

  function resize(){
    const cssW = scene.clientWidth || window.innerWidth || 320;
    const nw = Math.max(120, Math.ceil(cssW / SCALE));
    if(nw === W && canvas.width === W) return;
    W = nw;
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = (W * SCALE) + 'px';
    canvas.style.height = (H * SCALE) + 'px';
    ctx.imageSmoothingEnabled = false;
    build();
    frame(t);
  }
  canvas.width = 0;       // force the first resize() to run
  resize();
  if('ResizeObserver' in window) new ResizeObserver(resize).observe(scene);
  else window.addEventListener('resize', resize);

  if(reduced) return;     // reduced motion: keep a single still frame

  let last = 0, visible = true;
  const STEP = 100;       // ms per pixel-frame (~10 fps keeps it feeling like pixel art)
  function loop(ts){
    requestAnimationFrame(loop);
    if(!visible || ts - last < STEP) return;
    last = ts;
    t++;
    if(t % 8 === 0) toggleWindows();
    frame(t);
  }
  requestAnimationFrame(loop);

  if('IntersectionObserver' in window){
    new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }).observe(scene);
  }
})();