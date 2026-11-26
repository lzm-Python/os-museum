/* =====================================================================
   大厅与展台逻辑：卡阵、筛选、进入展品、开机动画
   ===================================================================== */

(function () {
  'use strict';

  const BASE = '../';

  const HALLS = [
    { id: 'all', name: '全部展厅' },
    { id: 'microsoft', name: '微软' },
    { id: 'apple', name: '苹果' },
    { id: 'google', name: '谷歌与安卓' },
    { id: 'custom', name: '安卓定制' },
    { id: 'china', name: '鸿蒙与国产' },
    { id: 'linux', name: 'Linux' },
    { id: 'nokia', name: '诺基亚' },
    { id: 'vintage', name: '上古与极客' }
  ];

  const isDesktop = !!(window.museumHost && window.museumHost.isElectron);
  let SYSTEMS = [];
  let currentHall = 'all';
  let keyword = '';
  let currentSystem = null;
  let currentDesk = null;

  const $ = function (id) { return document.getElementById(id); };

  /* ---------------- 数据 ---------------- */

  async function loadData() {
    if (window.museumHost && window.museumHost.systems && window.museumHost.systems.length) {
      SYSTEMS = window.museumHost.systems;
      return true;
    }
    const hallIds = HALLS.filter(function (h) { return h.id !== 'all'; }).map(function (h) { return h.id; });
    try {
      const parts = await Promise.all(hallIds.map(async function (h) {
        try {
          const res = await fetch('../data/systems/' + h + '.json');
          if (!res.ok) return [];
          return await res.json();
        } catch (e) {
          return [];
        }
      }));
      SYSTEMS = parts.reduce(function (a, b) { return a.concat(b); }, []);
      return SYSTEMS.length > 0;
    } catch (err) {
      console.error('数据加载失败', err);
      return false;
    }
  }

  /* ---------------- 大厅 ---------------- */

  function buildHallNav() {
    const nav = $('hallNav');
    nav.innerHTML = '';
    HALLS.forEach(function (h) {
      const b = document.createElement('button');
      b.className = 'hall-tab' + (h.id === currentHall ? ' on' : '');
      const n = h.id === 'all' ? SYSTEMS.length : SYSTEMS.filter(function (s) { return s.hall === h.id; }).length;
      b.textContent = h.name + (h.id === 'all' ? '' : '  ' + n);
      b.addEventListener('click', function () {
        currentHall = h.id;
        buildHallNav();
        buildGrid();
      });
      nav.appendChild(b);
    });
  }

  function match(sys) {
    if (currentHall !== 'all' && sys.hall !== currentHall) return false;
    if (!keyword) return true;
    const k = keyword.toLowerCase();
    return (sys.name + ' ' + sys.version + ' ' + sys.vendor + ' ' + sys.year + ' ' + sys.id).toLowerCase().indexOf(k) >= 0;
  }

  function buildGrid() {
    const grid = $('grid');
    grid.innerHTML = '';
    const list = SYSTEMS.filter(match);

    document.getElementById('gridEmpty').hidden = list.length > 0;

    list.forEach(function (sys) {
      const card = document.createElement('article');
      card.className = 'card';
      card.dataset.id = sys.id;

      const shot = document.createElement('div');
      shot.className = 'card-shot';

      const probe = new Image();
      probe.onload = function () { shot.style.backgroundImage = 'url("' + BASE + sys.wallpaper + '")'; };
      probe.onerror = function () {
        shot.classList.add('is-missing');
        const chip = document.createElement('div');
        chip.className = 'missing-chip';
        chip.textContent = '待放壁纸';
        shot.appendChild(chip);
      };
      probe.src = BASE + sys.wallpaper;

      if (isDesktop) {
        const logo = document.createElement('div');
        logo.className = 'card-logo';
        logo.style.backgroundImage = 'url("' + BASE + 'assets/logos/' + sys.vendorId + '.png")';
        shot.appendChild(logo);
      }

      const year = document.createElement('div');
      year.className = 'card-year';
      year.textContent = sys.year;
      shot.appendChild(year);

      const shadow = document.createElement('div');
      shadow.className = 'shot-shadow';
      shot.appendChild(shadow);

      const shellTag = document.createElement('div');
      shellTag.style.cssText = 'position:absolute;left:10px;bottom:8px;font-size:10px;letter-spacing:.14em;color:#cfc7b4';
      shellTag.textContent = sys.shell === 'phone' ? '手机' : (sys.shell === 'nokia' ? '直板机' : '桌面');
      shot.appendChild(shellTag);

      const meta = document.createElement('div');
      meta.className = 'card-meta';
      const left = document.createElement('div');
      const nm = document.createElement('div');
      nm.className = 'card-name';
      nm.textContent = sys.name;
      const vr = document.createElement('div');
      vr.className = 'card-ver';
      vr.textContent = sys.version + ' · ' + sys.vendor;
      left.appendChild(nm); left.appendChild(vr);
      const arrow = document.createElement('div');
      arrow.className = 'card-arrow';
      arrow.textContent = '→';
      meta.appendChild(left); meta.appendChild(arrow);

      card.appendChild(shot);
      card.appendChild(meta);
      card.addEventListener('click', function () { enter(sys); });
      grid.appendChild(card);
    });
  }

  /* ---------------- 进入展品 ---------------- */

  function boot(sys, done) {
    const ov = $('bootOverlay');
    const lg = $('bootLogo');
    $('bootName').textContent = sys.name + '  ' + sys.version;
    $('bootHint').textContent = sys.vendor + ' · ' + sys.year;
    lg.innerHTML = '';
    if (isDesktop) {
      const img = new Image();
      img.onerror = function () { lg.innerHTML = ''; };
      img.src = BASE + 'assets/logos/' + sys.vendorId + '.png';
      lg.appendChild(img);
    }
    ov.hidden = false;
    setTimeout(function () {
      ov.hidden = true;
      done();
    }, 950);
  }

  function enter(sys) {
    currentSystem = sys;
    $('lobby').hidden = true;
    $('stage').hidden = false;
    $('stageName').textContent = sys.name;
    $('stageVer').textContent = sys.version + ' · ' + sys.vendor + ' · ' + sys.year;
    $('notePanel').hidden = true;

    const noteTitle = $('noteTitle');
    noteTitle.textContent = sys.name + ' ' + sys.version;

    const body = $('noteBody');
    body.innerHTML =
      '<dl>' +
      '<dt>厂商</dt><dd>' + sys.vendor + '</dd>' +
      '<dt>发布年</dt><dd>' + sys.year + '</dd>' +
      '<dt>展厅</dt><dd>' + (HALLS.filter(function (h) { return h.id === sys.hall; })[0] || {}).name + '</dd>' +
      '<dt>形态</dt><dd>' + (sys.shell === 'phone' ? '手机' : sys.shell === 'nokia' ? '直板机' : '桌面') + '</dd>' +
      '<dt>外观</dt><dd>' + sys.skin.chrome + '</dd>' +
      '</dl>' +
      '<p class="note-quote">' + sys.note + '</p>';

    const device = $('device');
    device.innerHTML = '';
    boot(sys, function () {
      currentDesk = window.MUSEUM.render(sys, device);
    });
  }

  function backToLobby() {
    $('stage').hidden = true;
    $('lobby').hidden = false;
    $('device').innerHTML = '';
    currentDesk = null;
    currentSystem = null;
  }

  /* ---------------- 键盘 ---------------- */

  function keyRouter(e) {
    if (!currentDesk) return;
    if (e.key === 'Escape') { backToLobby(); return; }
    if (currentDesk._termKey) currentDesk._termKey(e);
    else if (currentDesk._nokiaKey) currentDesk._nokiaKey(e);
  }

  /* ---------------- 时钟 ---------------- */

  function tick() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const txt = hh + ':' + mm;
    document.querySelectorAll('[data-clock]').forEach(function (el) { el.textContent = txt; });
  }

  /* ---------------- 启动 ---------------- */

  async function init() {
    const ok = await loadData();
    if (!ok) {
      document.body.innerHTML = '<div style="padding:40px;font-family:sans-serif;color:#ddd">展品数据读取失败，请检查 data/systems 分厅数据是否完整。</div>';
      return;
    }

    if (isDesktop) document.body.classList.add('is-desktop');

    $('countText').textContent = SYSTEMS.length;

    if (isDesktop) {
      const bl = $('brandLogo');
      bl.style.backgroundImage = 'url("' + BASE + 'assets/logos/museum.png")';
      bl.classList.add('logo-only');
    }

    buildHallNav();
    buildGrid();

    $('searchInput').addEventListener('input', function (e) {
      keyword = e.target.value.trim();
      buildGrid();
    });

    $('btnBack').addEventListener('click', backToLobby);
    $('btnNote').addEventListener('click', function () {
      const p = $('notePanel');
      p.hidden = !p.hidden;
    });
    $('noteClose').addEventListener('click', function () { $('notePanel').hidden = true; });

    document.addEventListener('keydown', keyRouter, true);

    tick();
    setInterval(tick, 20000);

    setTimeout(function () { document.body.classList.remove('booting'); }, 60);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
