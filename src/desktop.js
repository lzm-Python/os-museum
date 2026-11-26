/* =====================================================================
   渲染引擎：设备外壳 → 桌面 / 手机 / 诺基亚 / 终端
   所有图片路径统一前缀 BASE（index.html 在 src/ 下）
   ===================================================================== */

(function () {
  'use strict';

  const BASE = '../';
  let zTop = 20;

  const HALL_LABELS = {
    microsoft: { computer: '此电脑', recyclebin: '回收站', folder: '我的文档', browser: 'Internet Explorer' },
    apple:     { computer: 'Macintosh HD', recyclebin: '废纸篓', folder: '文档', browser: 'Safari' },
    google:    { computer: '此电脑', recyclebin: '回收站', folder: '文件', browser: 'Chrome' },
    custom:    { computer: '此电脑', recyclebin: '回收站', folder: '文件', browser: '浏览器' },
    china:     { computer: '此电脑', recyclebin: '回收站', folder: '文件', browser: '浏览器' },
    linux:     { computer: '计算机', recyclebin: '回收站', folder: '主目录', browser: 'Firefox' },
    nokia:     { phone: '信息', messages: '收件箱', camera: '相机', browser: '网络', store: '应用', settings: '设置' },
    vintage:   { computer: '硬盘', recyclebin: '垃圾桶', folder: '文件', browser: '浏览器' }
  };

  const PHONE_APPS = [
    { id: 'phone', name: '电话' },
    { id: 'messages', name: '信息' },
    { id: 'camera', name: '相机' },
    { id: 'browser', name: '浏览器' },
    { id: 'store', name: '商店' },
    { id: 'settings', name: '设置' },
    { id: 'gallery', name: '相册' },
    { id: 'music', name: '音乐' }
  ];

  function labels(hall) { return HALL_LABELS[hall] || HALL_LABELS.microsoft; }

  function iconUrl(sys, key) { return BASE + 'assets/icons/' + sys.id + '/' + key + '.png'; }
  function logoUrl(sys) { return BASE + 'assets/logos/' + sys.vendorId + '.png'; }

  /* ---------------- 素材缺失的显式提示 ---------------- */
  function addMissing(host, path, small) {
    const box = document.createElement('div');
    box.className = 'asset-missing';
    if (small) { box.style.position = 'relative'; box.style.inset = 'auto'; }
    box.innerHTML = '<div class="miss-card"><b>缺失素材</b><code>' + path + '</code><span>请按清单放入对应文件</span></div>';
    host.appendChild(box);
    return box;
  }

  function setBackground(el, path) {
    if (!path) { addMissing(el, '未配置壁纸路径'); return; }
    const full = BASE + path;
    const probe = new Image();
    probe.onload = function () { el.style.backgroundImage = 'url("' + full + '")'; };
    probe.onerror = function () { addMissing(el, path); };
    probe.src = full;
  }

  function makeIcon(sys, key, size) {
    const box = document.createElement('div');
    box.className = 'ic';
    if (size) box.style.width = size + 'px';
    if (size) box.style.height = size + 'px';
    const img = new Image();
    img.onerror = function () {
      box.classList.add('miss');
      box.title = '缺图：assets/icons/' + sys.id + '/' + key + '.png';
      if (size && size < 30) {
        box.classList.add('tiny');
        box.textContent = '×';
      } else {
        box.textContent = '缺图';
      }
    };
    img.src = iconUrl(sys, key);
    box.appendChild(img);
    return box;
  }

  /* ---------------- 外壳 ---------------- */

  function buildShell(sys, device) {
    device.className = 'device ' + sys.shell;
    device.innerHTML = '';

    if (sys.shell === 'monitor') {
      const bezel = document.createElement('div');
      bezel.className = 'bezel';
      const screen = document.createElement('div');
      screen.className = 'screen';
      bezel.appendChild(screen);
      const brand = document.createElement('div');
      brand.className = 'bezel-brand';
      brand.textContent = sys.vendor;
      bezel.appendChild(brand);
      const stand = document.createElement('div');
      stand.className = 'stand';
      device.appendChild(bezel);
      device.appendChild(stand);
      return screen;
    }

    if (sys.shell === 'phone') {
      const body = document.createElement('div');
      body.className = 'body';
      const screen = document.createElement('div');
      screen.className = 'screen';
      body.appendChild(screen);

      const notchType = sys.skin && sys.skin.dynamicIsland ? 'island'
        : (sys.hall === 'apple' ? 'notch' : 'punch');
      const n = document.createElement('div');
      n.className = notchType;
      body.appendChild(n);

      ['pw', 'v1', 'v2', 'v3'].forEach(function (c) {
        const b = document.createElement('i');
        b.className = 'side-btn ' + c;
        body.appendChild(b);
      });

      device.appendChild(body);
      return screen;
    }

    // 诺基亚直板
    const body = document.createElement('div');
    body.className = 'body';
    const slot = document.createElement('div');
    slot.className = 'brand-slot';
    slot.textContent = sys.vendor;
    body.appendChild(slot);

    const frame = document.createElement('div');
    frame.className = 'screen-frame';
    const screen = document.createElement('div');
    screen.className = 'screen';
    frame.appendChild(screen);
    body.appendChild(frame);

    const softrow = document.createElement('div');
    softrow.className = 'softrow';
    const lk = document.createElement('button');
    lk.className = 'softkey'; lk.textContent = '左软键';
    const mid = document.createElement('div');
    mid.className = 'soft-mid'; mid.textContent = '◆';
    const rk = document.createElement('button');
    rk.className = 'softkey'; rk.textContent = '右软键';
    softrow.appendChild(lk); softrow.appendChild(mid); softrow.appendChild(rk);
    body.appendChild(softrow);

    const keypad = document.createElement('div');
    keypad.className = 'keypad';
    const keys = [
      ['1', ''], ['2', 'ABC'], ['3', 'DEF'],
      ['4', 'GHI'], ['5', 'JKL'], ['6', 'MNO'],
      ['7', 'PQRS'], ['8', 'TUV'], ['9', 'WXYZ'],
      ['*', ''], ['0', '+'], ['#', '']
    ];
    keys.forEach(function (k) {
      const b = document.createElement('button');
      b.className = 'key';
      b.innerHTML = k[0] + (k[1] ? '<small>' + k[1] + '</small>' : '');
      keypad.appendChild(b);
    });
    body.appendChild(keypad);

    device.appendChild(body);
    return screen;
  }

  /* ---------------- 窗口 ---------------- */

  function makeWindow(desk, sys, opt) {
    const win = document.createElement('div');
    win.className = 'win';
    win.style.left = (opt.x || 60) + 'px';
    win.style.top = (opt.y || 50) + 'px';
    win.style.width = (opt.w || 460) + 'px';
    win.style.height = (opt.h || 300) + 'px';
    win.style.zIndex = ++zTop;

    const chrome = sys.skin.chrome;
    if (chrome === 'aqua' || chrome === 'aqua-flat' || chrome === 'macos') win.classList.add('mac');

    const tbar = document.createElement('div');
    tbar.className = 'tbar';

    if (win.classList.contains('mac')) {
      const lights = document.createElement('div');
      lights.className = 'lights';
      lights.style.display = 'flex';
      ['#ff5f57', '#febc2e', '#28c840'].forEach(function (c) {
        const d = document.createElement('span');
        d.style.cssText = 'width:11px;height:11px;border-radius:50%;background:' + c + ';display:inline-block';
        lights.appendChild(d);
      });
      tbar.appendChild(lights);
    }

    const ticon = document.createElement('div');
    ticon.className = 'ticon';
    const ti = new Image();
    ti.onerror = function () { ticon.style.display = 'none'; };
    ti.src = iconUrl(sys, opt.iconKey || 'computer');
    ticon.appendChild(ti);
    tbar.appendChild(ticon);

    const tname = document.createElement('div');
    tname.className = 'tname';
    tname.textContent = opt.title || '窗口';
    tbar.appendChild(tname);

    const btns = document.createElement('div');
    btns.className = 'wbtns';
    const bmin = document.createElement('button');
    bmin.className = 'wbtn'; bmin.textContent = '—';
    const bmax = document.createElement('button');
    bmax.className = 'wbtn'; bmax.textContent = '□';
    const bclose = document.createElement('button');
    bclose.className = 'wbtn x'; bclose.textContent = '×';
    btns.appendChild(bmin); btns.appendChild(bmax); btns.appendChild(bclose);
    tbar.appendChild(btns);

    const body = document.createElement('div');
    body.className = 'tbody';
    if (opt.content) body.appendChild(opt.content);

    win.appendChild(tbar);
    win.appendChild(body);
    desk.appendChild(win);

    // 激活层级
    win.addEventListener('pointerdown', function () { win.style.zIndex = ++zTop; }, true);

    // 关闭
    bclose.addEventListener('click', function (e) {
      e.stopPropagation();
      win.remove();
      if (opt.onClose) opt.onClose();
    });
    bmin.addEventListener('click', function (e) {
      e.stopPropagation();
      win.style.display = 'none';
    });

    // 拖动
    let dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
    tbar.addEventListener('pointerdown', function (e) {
      if (e.target.closest('.wbtn')) return;
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      ox = parseInt(win.style.left, 10); oy = parseInt(win.style.top, 10);
      tbar.setPointerCapture(e.pointerId);
      win.style.zIndex = ++zTop;
    });
    tbar.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      const deskBox = desk.getBoundingClientRect();
      let nx = ox + (e.clientX - sx);
      let ny = oy + (e.clientY - sy);
      nx = Math.max(-40, Math.min(deskBox.width - 60, nx));
      ny = Math.max(0, Math.min(deskBox.height - 40, ny));
      win.style.left = nx + 'px';
      win.style.top = ny + 'px';
    });
    tbar.addEventListener('pointerup', function (e) {
      dragging = false;
      try { tbar.releasePointerCapture(e.pointerId); } catch (err) {}
    });

    return win;
  }

  /* ---------------- 窗口内容 ---------------- */

  function contentExplorer(sys, path) {
    const wrap = document.createElement('div');
    wrap.className = 'exp';

    const addr = document.createElement('div');
    addr.className = 'addr';
    const back = document.createElement('span');
    back.textContent = '←';
    back.style.opacity = '.55';
    const p = document.createElement('div');
    p.className = 'path';
    p.textContent = path || 'C:\\';
    addr.appendChild(back); addr.appendChild(p);
    wrap.appendChild(addr);

    const files = document.createElement('div');
    files.className = 'files';
    const items = [
      { k: 'folder', n: 'Program Files' },
      { k: 'folder', n: 'Windows' },
      { k: 'folder', n: 'Documents' },
      { k: 'folder', n: 'Users' },
      { k: 'folder', n: 'Temp' },
      { k: 'computer', n: 'Local Disk (C:)' }
    ];
    items.forEach(function (it) {
      const f = document.createElement('div');
      f.className = 'file';
      f.appendChild(makeIcon(sys, it.k, 32));
      const s = document.createElement('span');
      s.textContent = it.n;
      f.appendChild(s);
      files.appendChild(f);
    });
    wrap.appendChild(files);
    return wrap;
  }

  function contentNotepad(sys) {
    const wrap = document.createElement('div');
    wrap.className = 'txtpad';
    wrap.style.height = '100%';
    const ta = document.createElement('textarea');
    ta.placeholder = '在这里输入文字…';
    ta.spellcheck = false;
    wrap.appendChild(ta);
    return wrap;
  }

  function contentAbout(sys) {
    const wrap = document.createElement('div');
    wrap.className = 'about-card';
    wrap.innerHTML =
      '<h4>' + sys.name + ' ' + sys.version + '</h4>' +
      '<div class="row"><span class="k">厂商</span><span>' + sys.vendor + '</span></div>' +
      '<div class="row"><span class="k">发布年</span><span>' + sys.year + '</span></div>' +
      '<div class="row"><span class="k">外观</span><span>' + sys.skin.chrome + '</span></div>' +
      '<p style="margin-top:12px;color:#666">本展品为界面复刻，用于系统史陈列。</p>';
    return wrap;
  }

  function contentCalculator(sys) {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'padding:8px;display:flex;flex-direction:column;gap:6px;height:100%';
    const out = document.createElement('input');
    out.readOnly = true;
    out.value = '0';
    out.style.cssText = 'height:34px;text-align:right;font-size:16px;padding:0 8px;border:1px solid #999;font-family:inherit';
    const pad = document.createElement('div');
    pad.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:5px;flex:1';
    const keys = ['7','8','9','/','4','5','6','*','1','2','3','-','0','.','=','+'];
    let expr = '';
    keys.forEach(function (k) {
      const b = document.createElement('button');
      b.textContent = k;
      b.style.cssText = 'font-size:13px;border:1px solid #999;background:#f2f2f2;cursor:pointer;font-family:inherit';
      b.addEventListener('click', function () {
        if (k === '=') {
          try { expr = String(Function('"use strict";return (' + (expr || '0') + ')')()); }
          catch (err) { expr = 'ERR'; }
          out.value = expr;
        } else {
          expr += k;
          out.value = expr;
        }
      });
      pad.appendChild(b);
    });
    wrap.appendChild(out);
    wrap.appendChild(pad);
    return wrap;
  }

  function contentTerminal(sys) {
    const t = document.createElement('div');
    t.style.cssText = 'background:#000;color:#c8c8c8;font-family:Consolas,monospace;font-size:12px;padding:10px;height:100%;overflow:auto';
    ['Microsoft Windows [Version 10.0]', '(c) Microsoft Corporation.', '', 'C:\\Users\\Museum> _'].forEach(function (l) {
      const d = document.createElement('div');
      d.textContent = l;
      t.appendChild(d);
    });
    return t;
  }

  function buildContent(sys, appId) {
    switch (appId) {
      case 'explorer': return contentExplorer(sys, 'C:\\');
      case 'notepad': return contentNotepad(sys);
      case 'calculator': return contentCalculator(sys);
      case 'terminal': return contentTerminal(sys);
      default: return contentAbout(sys);
    }
  }

  /* ---------------- 菜单 ---------------- */

  function menuItems(sys) {
    const lab = labels(sys.hall);
    if (sys.screenType === 'phone') {
      return PHONE_APPS.slice(0, 8).map(function (a) {
        return { id: a.id, name: (lab[a.id] || a.name), icon: a.id };
      });
    }
    return [
      { id: 'explorer', name: lab.computer || '此电脑', icon: 'computer' },
      { id: 'notepad', name: '记事本', icon: 'notepad' },
      { id: 'calculator', name: '计算器', icon: 'calculator' },
      { id: 'about', name: '关于本机', icon: 'settings' }
    ];
  }

  function buildMenu(sys, desk, anchorBottom) {
    const type = sys.skin.menu;
    const items = menuItems(sys);
    const lab = labels(sys.hall);
    const pcName = lab.computer || '此电脑';
    const panel = document.createElement('div');
    panel.className = 'menu ' + (type || 'classic');

    function openApp(id, name) {
      panel.remove();
      makeWindow(desk, sys, {
        title: name || id,
        iconKey: id === 'explorer' ? 'computer' : (id === 'calculator' ? 'calculator' : id),
        content: buildContent(sys, id),
        x: 70 + Math.random() * 40,
        y: 60 + Math.random() * 30,
        w: 520, h: 360
      });
    }

    if (type === 'win10' || type === 'win11') {
      const is11 = type === 'win11';

      if (is11) {
        const sb = document.createElement('div');
        sb.className = 'searchbox';
        sb.textContent = '搜索应用、设置和文档';
        panel.appendChild(sb);

        const grid = document.createElement('div');
        grid.className = 'grid6';
        const tiles11 = items.concat(items).slice(0, 9);
        tiles11.forEach(function (it, idx) {
          const a = document.createElement('div');
          a.className = 'app';
          a.appendChild(makeIcon(sys, idx % 4 === 0 ? 'computer' : it.icon, 28));
          const s = document.createElement('span');
          s.textContent = it.name;
          a.appendChild(s);
          a.addEventListener('click', function () { openApp(it.id, it.name); });
          grid.appendChild(a);
        });
        panel.appendChild(grid);

        const foot11 = document.createElement('div');
        foot11.className = 'mfoot';
        ['电源', '设置', '账户'].forEach(function (t) {
          const b = document.createElement('div');
          b.className = 'mfootb';
          b.textContent = t;
          foot11.appendChild(b);
        });
        panel.appendChild(foot11);
      } else {
        const rail = document.createElement('div');
        rail.className = 'rail';
        ['settings', 'computer', 'folder'].forEach(function (k) {
          const r = document.createElement('div');
          r.className = 'railbtn';
          r.appendChild(makeIcon(sys, k, 20));
          rail.appendChild(r);
        });
        const av = document.createElement('div');
        av.className = 'railav';
        rail.appendChild(av);
        panel.appendChild(rail);

        const col = document.createElement('div');
        col.className = 'appcol';

        const gh1 = document.createElement('div');
        gh1.className = 'ghead';
        gh1.textContent = '最近添加';
        col.appendChild(gh1);
        items.forEach(function (it, idx) {
          const row = document.createElement('div');
          row.className = 'arow';
          row.appendChild(makeIcon(sys, it.icon, 18));
          const s = document.createElement('span');
          s.textContent = it.name;
          row.appendChild(s);
          if (idx === 0) {
            const nw = document.createElement('i');
            nw.className = 'new';
            nw.textContent = '新';
            row.appendChild(nw);
          }
          row.addEventListener('click', function () { openApp(it.id, it.name); });
          col.appendChild(row);
        });

        const gh2 = document.createElement('div');
        gh2.className = 'ghead';
        gh2.textContent = '所有应用';
        col.appendChild(gh2);
        const all = ['计算器', '记事本', pcName, '资源管理器'].slice(0, 4);
        all.forEach(function (nm, i) {
          const row = document.createElement('div');
          row.className = 'arow';
          row.appendChild(makeIcon(sys, i === 2 ? 'browser' : (i === 3 ? 'computer' : (i === 1 ? 'notepad' : 'calculator')), 18));
          const s = document.createElement('span');
          s.textContent = nm;
          row.appendChild(s);
          row.addEventListener('click', function () { openApp(i === 3 ? 'explorer' : 'notepad', nm); });
          col.appendChild(row);
        });
        panel.appendChild(col);

        const tiles = document.createElement('div');
        tiles.className = 'tilecol';
        const gh3 = document.createElement('div');
        gh3.className = 'ghead';
        gh3.textContent = '效率';
        tiles.appendChild(gh3);
        const box = document.createElement('div');
        box.className = 'tilebox';
        const defs = [
          { k: 'computer', n: pcName, s: 'big', app: 'explorer' },
          { k: 'folder', n: '文件', s: 'wide', app: 'explorer' },
          { k: 'browser', n: '浏览器', s: '', app: 'about' },
          { k: 'notepad', n: '记事本', s: '', app: 'notepad' },
          { k: 'calculator', n: '计算器', s: '', app: 'calculator' },
          { k: 'settings', n: '设置', s: '', app: 'about' }
        ];
        defs.forEach(function (d) {
          const t = document.createElement('div');
          t.className = 'tile ' + d.s;
          t.appendChild(makeIcon(sys, d.k, d.s === 'big' ? 40 : 22));
          const s = document.createElement('span');
          s.textContent = d.n;
          t.appendChild(s);
          t.addEventListener('click', function () { openApp(d.app, d.n); });
          box.appendChild(t);
        });
        tiles.appendChild(box);

        const gh4 = document.createElement('div');
        gh4.className = 'ghead ghead2';
        gh4.textContent = '娱乐';
        tiles.appendChild(gh4);
        const box2 = document.createElement('div');
        box2.className = 'tilebox';
        [
          { k: 'browser', n: '照片', s: 'wide', app: 'about' },
          { k: 'folder', n: '音乐', s: '', app: 'explorer' },
          { k: 'settings', n: '天气', s: '', app: 'about' },
          { k: 'computer', n: '邮件', s: 'wide', app: 'about' },
          { k: 'notepad', n: '地图', s: '', app: 'notepad' },
          { k: 'calculator', n: '商店', s: '', app: 'calculator' }
        ].forEach(function (d) {
          const t = document.createElement('div');
          t.className = 'tile ' + d.s;
          t.appendChild(makeIcon(sys, d.k, 22));
          const s = document.createElement('span');
          s.textContent = d.n;
          t.appendChild(s);
          t.addEventListener('click', function () { openApp(d.app, d.n); });
          box2.appendChild(t);
        });
        tiles.appendChild(box2);
        panel.appendChild(tiles);

        const foot = document.createElement('div');
        foot.className = 'foot';
        const usr = document.createElement('div');
        usr.className = 'fuser';
        const av2 = document.createElement('div');
        av2.className = 'fav';
        usr.appendChild(av2);
        const nm2 = document.createElement('span');
        nm2.textContent = 'Museum';
        usr.appendChild(nm2);
        foot.appendChild(usr);
        const acts = document.createElement('div');
        acts.className = 'facts';
        ['电源', '设置'].forEach(function (t) {
          const b = document.createElement('div');
          b.className = 'fbtn';
          b.textContent = t;
          acts.appendChild(b);
        });
        foot.appendChild(acts);
        panel.appendChild(foot);
      }
    } else if (type === 'xp') {
      const head = document.createElement('div');
      head.style.cssText = 'display:flex;align-items:center;gap:10px;padding:8px 10px;background:#3f8cf3;color:#fff';
      const av = document.createElement('div');
      av.style.cssText = 'width:34px;height:34px;border-radius:3px;background:rgba(255,255,255,.35)';
      head.appendChild(av);
      const nm = document.createElement('div');
      nm.textContent = 'Museum';
      nm.style.fontSize = '13px';
      head.appendChild(nm);
      panel.appendChild(head);
      panel.style.width = '420px';
      const cols = document.createElement('div');
      cols.style.cssText = 'display:flex';
      const c1 = document.createElement('div');
      c1.style.cssText = 'flex:1;background:#fff;padding:8px 4px';
      const c2 = document.createElement('div');
      c2.style.cssText = 'width:170px;background:#d3e5fa;padding:8px 4px';
      items.forEach(function (it, i) {
        const mi = document.createElement('div');
        mi.className = 'mi';
        mi.appendChild(makeIcon(sys, it.icon, 18));
        const s = document.createElement('span'); s.textContent = it.name;
        mi.appendChild(s);
        mi.addEventListener('click', function () { openApp(it.id, it.name); });
        (i < 2 ? c1 : c2).appendChild(mi);
      });
      cols.appendChild(c1); cols.appendChild(c2);
      panel.appendChild(cols);
    } else if (type === 'vista') {
      panel.style.width = '340px';
      const head = document.createElement('div');
      head.className = 'head';
      head.textContent = '搜索';
      panel.appendChild(head);
      items.forEach(function (it) {
        const mi = document.createElement('div');
        mi.className = 'mi';
        mi.appendChild(makeIcon(sys, it.icon, 18));
        const s = document.createElement('span'); s.textContent = it.name;
        mi.appendChild(s);
        mi.addEventListener('click', function () { openApp(it.id, it.name); });
        panel.appendChild(mi);
      });
    } else if (type === 'apple' || type === 'vertical' || type === 'rio') {
      items.concat([
        { id: 'about', name: '关于本机', icon: 'settings' }
      ]).forEach(function (it) {
        const mi = document.createElement('div');
        mi.className = 'mi';
        const s = document.createElement('span'); s.textContent = it.name;
        mi.appendChild(s);
        mi.addEventListener('click', function () { openApp(it.id, it.name); });
        panel.appendChild(mi);
      });
      if (type === 'apple') {
        const head = document.createElement('div');
        head.className = 'head';
        head.textContent = sys.name + ' ' + sys.version;
        panel.insertBefore(head, panel.firstChild);
      }
    } else {
      // classic / kde / cde / irix / photon / riscos / amiga …
      items.forEach(function (it) {
        const mi = document.createElement('div');
        mi.className = 'mi';
        mi.appendChild(makeIcon(sys, it.icon, 18));
        const s = document.createElement('span'); s.textContent = it.name;
        mi.appendChild(s);
        mi.addEventListener('click', function () { openApp(it.id, it.name); });
        panel.appendChild(mi);
      });
      const sep = document.createElement('div');
      sep.className = 'sep';
      panel.appendChild(sep);
      const sd = document.createElement('div');
      sd.className = 'mi';
      sd.innerHTML = '<span>关机</span>';
      panel.appendChild(sd);
    }

    if (anchorBottom) {
      panel.style.bottom = 'calc(var(--bar-h) + 4px)';
      panel.style.left = '4px';
    }
    desk.appendChild(panel);

    const closer = function (e) {
      if (!panel.contains(e.target)) {
        panel.remove();
        document.removeEventListener('pointerdown', closer, true);
      }
    };
    setTimeout(function () { document.addEventListener('pointerdown', closer, true); }, 0);
    return panel;
  }

  /* ---------------- 任务栏 / 菜单栏 ---------------- */

  function buildBar(sys, desk) {
    const skin = sys.skin;
    const lab = labels(sys.hall);

    if (skin.menu === 'win10' || skin.menu === 'win11') {
      // 玻璃开始菜单：整个任务栏也要是深色
    }

    if (skin.bar === 'top') {
      const mb = document.createElement('div');
      mb.className = 'menubar';
      const apple = document.createElement('div');
      apple.className = 'apple';
      const li = new Image();
      li.onerror = function () { apple.textContent = sys.vendorId === 'apple' ? '' : '☰'; };
      li.src = logoUrl(sys);
      apple.appendChild(li);
      apple.addEventListener('click', function () {
        const old = desk.querySelector('.menu');
        if (old) { old.remove(); return; }
        buildMenu(sys, desk, false);
      });
      mb.appendChild(apple);

      const apps = ['文件', '编辑', '显示', '前往', '窗口', '帮助'];
      apps.forEach(function (a, i) {
        const t = document.createElement('div');
        t.className = 'mt' + (i === 1 ? ' bold' : '');
        t.textContent = a;
        mb.appendChild(t);
      });

      const clock = document.createElement('div');
      clock.className = 'mt clock';
      clock.dataset.clock = '1';
      clock.textContent = '00:00';
      mb.appendChild(clock);
      desk.appendChild(mb);

      if (skin.dock) buildDock(sys, desk);
      return;
    }

    if (skin.bar === 'leftdock') {
      const dock = document.createElement('div');
      dock.className = 'dock left';
      ['computer', 'folder', 'settings', 'browser'].forEach(function (k) {
        const d = document.createElement('div');
        d.className = 'ditem';
        d.appendChild(makeIcon(sys, k, 40));
        d.addEventListener('click', function () {
          makeWindow(desk, sys, { title: lab.computer, content: buildContent(sys, 'explorer'), x: 110, y: 80, w: 520, h: 340 });
        });
        dock.appendChild(d);
      });
      desk.appendChild(dock);
      return;
    }

    if (skin.bar === 'shelf') {
      const bar = document.createElement('div');
      bar.className = 'bar';
      const st = document.createElement('button');
      st.className = 'startbtn';
      const ci = new Image();
      ci.onerror = function () { st.textContent = '○'; };
      ci.src = logoUrl(sys);
      st.appendChild(ci);
      st.style.minWidth = '34px';
      st.addEventListener('click', function () {
        openLauncher(sys, desk);
      });
      bar.appendChild(st);
      const tasks = document.createElement('div');
      tasks.className = 'tasks';
      bar.appendChild(tasks);
      const tray = document.createElement('div');
      tray.className = 'tray';
      tray.innerHTML = '<span data-clock="1">00:00</span>';
      bar.appendChild(tray);
      desk.appendChild(bar);
      return;
    }

    if (skin.bar === 'bottom') {
      const bar = document.createElement('div');
      bar.className = 'bar';

      const st = document.createElement('button');
      st.className = 'startbtn';
      const sl = document.createElement('div');
      sl.className = 'slogo';
      const li = new Image();
      li.onerror = function () {
        sl.classList.add('miss');
        sl.classList.add('fallback');
        if (skin.menu === 'classic') {
          const fb = document.createElement('span');
          fb.textContent = '⊞';
          fb.style.fontSize = '15px';
          st.insertBefore(fb, sl);
        }
      };
      li.src = logoUrl(sys);
      sl.appendChild(li);
      st.appendChild(sl);
      const stxt = document.createElement('span');
      stxt.className = 'stxt';
      const sName = (sys.hall === 'microsoft') ? '开始' : (sys.hall === 'linux' || sys.hall === 'china' ? '应用程序' : '菜单');
      stxt.textContent = sName;
      st.appendChild(stxt);
      if (skin.menu === 'win10' || skin.menu === 'win11' || skin.menu === 'win8' || skin.menu === 'win81') {
        st.classList.add('icononly');
      }
      st.addEventListener('click', function (e) {
        e.stopPropagation();
        const old = desk.querySelector('.menu, .startfull, .launcher');
        if (old) { old.remove(); return; }
        if (skin.menu === 'win8' || skin.menu === 'win81') openStartScreen(sys, desk, skin.menu);
        else buildMenu(sys, desk, true);
      });
      bar.appendChild(st);

      const tasks = document.createElement('div');
      tasks.className = 'tasks';
      bar.appendChild(tasks);

      const tray = document.createElement('div');
      tray.className = 'tray';
      const vol = document.createElement('span');
      vol.className = 'vol';
      const clk = document.createElement('span');
      clk.dataset.clock = '1';
      clk.textContent = '00:00';
      tray.appendChild(vol);
      tray.appendChild(clk);
      bar.appendChild(tray);

      desk.appendChild(bar);
      return;
    }

    // bar: none → 只有需要时才有悬浮控件
  }

  function buildDock(sys, desk) {
    const dock = document.createElement('div');
    dock.className = 'dock bottom';
    ['computer', 'folder', 'browser', 'notepad', 'settings'].forEach(function (k) {
      const d = document.createElement('div');
      d.className = 'ditem';
      d.appendChild(makeIcon(sys, k, 40));
      d.addEventListener('click', function () {
        makeWindow(desk, sys, {
          title: k === 'computer' ? labels(sys.hall).computer : k,
          iconKey: k, content: buildContent(sys, k === 'browser' ? 'about' : (k === 'notepad' ? 'notepad' : 'explorer')),
          x: 120, y: 90, w: 480, h: 320
        });
      });
      dock.appendChild(d);
    });
    desk.appendChild(dock);
  }

  function openLauncher(sys, desk) {
    const old = desk.querySelector('.launcher, .menu');
    if (old) { old.remove(); return; }
    const l = document.createElement('div');
    l.className = 'launcher';
    const grid = document.createElement('div');
    grid.className = 'lgrid';
    const all = [
      { n: labels(sys.hall).computer || '此电脑', k: 'computer', a: 'explorer' },
      { n: '文件', k: 'folder', a: 'explorer' },
      { n: '浏览器', k: 'browser', a: 'about' },
      { n: '文本编辑器', k: 'notepad', a: 'notepad' },
      { n: '计算器', k: 'calculator', a: 'calculator' },
      { n: '设置', k: 'settings', a: 'about' },
      { n: '终端', k: 'settings', a: 'terminal' },
      { n: '关于本机', k: 'computer', a: 'about' }
    ];
    all.forEach(function (a) {
      const el = document.createElement('div');
      el.className = 'lapp';
      el.appendChild(makeIcon(sys, a.k, 46));
      const s = document.createElement('span');
      s.textContent = a.n;
      el.appendChild(s);
      el.addEventListener('click', function () {
        l.remove();
        makeWindow(desk, sys, { title: a.n, iconKey: a.k, content: buildContent(sys, a.a), x: 90, y: 70, w: 520, h: 350 });
      });
      grid.appendChild(el);
    });
    l.appendChild(grid);
    desk.appendChild(l);
    l.addEventListener('pointerdown', function (e) {
      if (e.target === l) l.remove();
    });
  }

  function openStartScreen(sys, desk, kind) {
    const old = desk.querySelector('.startfull');
    if (old) { old.remove(); return; }
    const s = document.createElement('div');
    s.className = 'startfull';
    const tiles = document.createElement('div');
    tiles.className = 'tiles';
    const items = menuItems(sys).concat(menuItems(sys));
    items.forEach(function (it) {
      const t = document.createElement('div');
      t.className = 'tile';
      t.appendChild(makeIcon(sys, it.icon, 34));
      const sp = document.createElement('span');
      sp.textContent = it.name;
      t.appendChild(sp);
      t.addEventListener('click', function () {
        s.remove();
        makeWindow(desk, sys, { title: it.name, iconKey: it.icon, content: buildContent(sys, it.id), x: 80, y: 60, w: 520, h: 360 });
      });
      tiles.appendChild(t);
    });
    s.appendChild(tiles);
    desk.appendChild(s);
    s.addEventListener('pointerdown', function (e) { if (e.target === s) s.remove(); });
  }

  /* ---------------- 桌面 ---------------- */

  function renderDesktop(sys, screen) {
    const desk = document.createElement('div');
    desk.className = 'desk chrome-' + sys.skin.chrome;
    desk.style.setProperty('--ui-font', sys.skin.font || 'sans-serif');
    if (sys.skin.dark) desk.classList.add('dark');
    setBackground(desk, sys.wallpaper);
    screen.appendChild(desk);

    const lab = labels(sys.hall);

    // 桌面图标
    const icons = document.createElement('div');
    icons.className = 'desk-icons';
    if (sys.skin.bar === 'top' || sys.skin.chrome === 'macclassic' || sys.skin.chrome === 'platinum') icons.classList.add('right');
    if (sys.skin.bar === 'none' && sys.skin.primaryWindow) icons.classList.add('none');

    const iconDefs = [
      { k: 'computer', n: lab.computer || '此电脑', app: 'explorer' },
      { k: 'recyclebin', n: lab.recyclebin || '回收站', app: 'about' },
      { k: 'folder', n: lab.folder || '文档', app: 'explorer' },
      { k: 'browser', n: lab.browser || '浏览器', app: 'about' }
    ];
    iconDefs.forEach(function (d) {
      const el = document.createElement('div');
      el.className = 'desk-icon';
      el.appendChild(makeIcon(sys, d.k, 40));
      const s = document.createElement('div');
      s.className = 'lbl';
      s.textContent = d.n;
      el.appendChild(s);
      el.addEventListener('pointerdown', function (e) {
        e.stopPropagation();
        desk.querySelectorAll('.desk-icon.sel').forEach(function (x) { x.classList.remove('sel'); });
        el.classList.add('sel');
      });
      el.addEventListener('click', function () {
        makeWindow(desk, sys, {
          title: d.n, iconKey: d.k, content: buildContent(sys, d.app),
          x: 64 + Math.random() * 50, y: 54 + Math.random() * 40,
          w: 540, h: 360
        });
      });
      icons.appendChild(el);
    });
    desk.appendChild(icons);

    // 桌面空白处取消选中
    desk.addEventListener('pointerdown', function (e) {
      if (e.target === desk) {
        desk.querySelectorAll('.desk-icon.sel').forEach(function (x) { x.classList.remove('sel'); });
        const m = desk.querySelector('.menu, .launcher, .startfull');
        if (m) m.remove();
      }
    });

    // 任务栏 / 菜单栏
    buildBar(sys, desk);

    // 主窗口
    if (sys.skin.primaryWindow) {
      buildPrimaryWindow(sys, desk, sys.skin.primaryWindow);
    }

    // 手机状态栏等
    return desk;
  }

  function buildPrimaryWindow(sys, desk, kind) {
    const w = desk.getBoundingClientRect();
    const width = w.width || 960;
    const height = w.height || 540;

    if (kind === 'program-manager') {
      const box = document.createElement('div');
      box.style.cssText = 'display:flex;flex-wrap:wrap;gap:18px;padding:16px;align-content:flex-start;background:#c0c0c0;height:100%';
      ['主群组', '附件', '游戏', '启动'].forEach(function (n) {
        const g = document.createElement('div');
        g.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:4px;width:74px';
        g.appendChild(makeIcon(sys, 'folder', 32));
        const s = document.createElement('div');
        s.textContent = n;
        s.style.cssText = 'font-size:11px;color:#000';
        g.appendChild(s);
        g.addEventListener('dblclick', function () {
          makeWindow(desk, sys, { title: n, iconKey: 'folder', content: contentExplorer(sys, n), x: 90, y: 70, w: 460, h: 300 });
        });
        box.appendChild(g);
      });
      makeWindow(desk, sys, {
        title: '程序管理器', iconKey: 'computer', content: box,
        x: 26, y: 26, w: Math.max(360, width - 90), h: Math.max(260, height - 110)
      });
      return;
    }

    if (kind === 'msdos-exec') {
      makeWindow(desk, sys, {
        title: 'MS-DOS Executive', iconKey: 'computer',
        content: contentExplorer(sys, 'C:\\'),
        x: 30, y: 24, w: Math.max(340, width - 80), h: Math.max(240, height - 90)
      });
      return;
    }

    if (kind === 'tiled-shell') {
      const mk = function (left, top, w, h, title, lines) {
        const body = document.createElement('div');
        body.style.cssText = 'background:#111114;color:#c9d1d9;font-family:Consolas,monospace;font-size:11.5px;padding:8px;height:100%;white-space:pre';
        body.textContent = lines.join('\n');
        const win = document.createElement('div');
        win.className = 'win';
        win.style.cssText = 'left:' + left + 'px;top:' + top + 'px;width:' + w + 'px;height:' + h + 'px;z-index:' + (++zTop);
        const tb = document.createElement('div');
        tb.className = 'tbar';
        const tn = document.createElement('div');
        tn.className = 'tname'; tn.textContent = title;
        tb.appendChild(tn);
        const bd = document.createElement('div');
        bd.className = 'tbody';
        bd.appendChild(body);
        win.appendChild(tb); win.appendChild(bd);
        desk.appendChild(win);
      };
      const W = width, H = height;
      mk(0, 0, W * 0.52, H * 0.56, 'term 1 — ~/', ['$ pacman -Syu', ':: Synchronizing package databases...', ' core is up to date', ' extra is up to date', '$ uname -a', 'Linux museum 6.9.1-arch1 x86_64 GNU/Linux']);
      mk(W * 0.52, 0, W * 0.48, H * 0.56, 'nvim ~/notes.md', ['# 今日', '', '- 整理展厅', '- 修复窗口管理器', '- 更新皮肤']);
      mk(0, H * 0.56, W, H * 0.44, 'htop', ['  CPU[||||||     32%]', '  Mem[||||||||  1.2G/15.6G]', '  Tasks: 210, 1207 thr; 2 running']);
      return;
    }

    if (kind === 'alto-star') {
      makeWindow(desk, sys, { title: 'Directory', iconKey: 'folder', content: contentExplorer(sys, '<Alto>'), x: 20, y: 20, w: 400, h: 300 });
      makeWindow(desk, sys, { title: 'Bravo Document', iconKey: 'notepad', content: contentNotepad(sys), x: 440, y: 40, w: 460, h: 380 });
      return;
    }
  }

  /* ---------------- 手机 ---------------- */

  function renderPhone(sys, screen) {
    const desk = document.createElement('div');
    desk.className = 'desk chrome-' + sys.skin.chrome;
    desk.style.setProperty('--ui-font', sys.skin.font || 'sans-serif');
    setBackground(desk, sys.wallpaper);
    screen.appendChild(desk);

    const ui = document.createElement('div');
    ui.className = 'phoneui';
    ui.style.position = 'absolute';
    ui.style.inset = '0';
    desk.appendChild(ui);

    const sb = document.createElement('div');
    sb.className = 'statusbar';
    const left = document.createElement('span');
    left.dataset.clock = '1';
    left.textContent = '00:00';
    const right = document.createElement('div');
    right.className = 'sright';
    const sig = document.createElement('span');
    sig.className = 'sig'; sig.textContent = '▮▮▮';
    const wt = document.createElement('span');
    wt.textContent = '5G';
    const bat = document.createElement('span');
    bat.className = 'bat';
    right.appendChild(sig); right.appendChild(wt); right.appendChild(bat);
    sb.appendChild(left); sb.appendChild(right);
    ui.appendChild(sb);

    const main = document.createElement('div');
    main.className = 'ph-main';
    ui.appendChild(main);

    const grid = document.createElement('div');
    grid.className = 'ph-grid';
    main.appendChild(grid);

    PHONE_APPS.forEach(function (a) {
      const el = document.createElement('div');
      el.className = 'ph-app';
      el.appendChild(makeIcon(sys, a.id, 50));
      const nm = document.createElement('div');
      nm.className = 'nm';
      nm.textContent = a.name;
      el.appendChild(nm);
      el.addEventListener('click', function () { openPhoneApp(sys, desk, a); });
      grid.appendChild(el);
    });

    const dock = document.createElement('div');
    dock.className = 'ph-dock';
    ['phone', 'messages', 'browser', 'camera'].forEach(function (k) {
      const d = document.createElement('div');
      d.className = 'ditem';
      d.appendChild(makeIcon(sys, k, 40));
      d.addEventListener('click', function () {
        openPhoneApp(sys, desk, PHONE_APPS.filter(function (x) { return x.id === k; })[0] || { id: k, name: k });
      });
      dock.appendChild(d);
    });
    ui.appendChild(dock);

    return desk;
  }

  function openPhoneApp(sys, desk, app) {
    const old = desk.querySelector('.appview');
    if (old) old.remove();

    const v = document.createElement('div');
    v.className = 'appview';
    const bar = document.createElement('div');
    bar.className = 'avbar';
    const back = document.createElement('button');
    back.textContent = '‹ 返回';
    back.addEventListener('click', function () { v.remove(); });
    const title = document.createElement('div');
    title.textContent = app.name;
    const right = document.createElement('div');
    right.style.width = '44px';
    bar.appendChild(back); bar.appendChild(title); bar.appendChild(right);

    const body = document.createElement('div');
    body.className = 'avbody';

    const ic = document.createElement('div');
    ic.style.cssText = 'width:64px;height:64px;margin:0 auto 14px';
    ic.appendChild(makeIcon(sys, app.id, 64));
    body.appendChild(ic);

    const desc = document.createElement('p');
    desc.style.textAlign = 'center';
    desc.style.color = '#b9b9c2';
    desc.style.fontSize = '12px';
    desc.textContent = sys.name + ' ' + sys.version + ' · ' + app.name;
    body.appendChild(desc);

    const card = document.createElement('div');
    card.style.cssText = 'margin-top:18px;padding:14px;border-radius:12px;background:rgba(255,255,255,.06);font-size:12.5px;line-height:1.9;color:#dcdce2';
    card.textContent = sys.note;
    body.appendChild(card);

    v.appendChild(bar); v.appendChild(body);
    desk.appendChild(v);
  }

  /* ---------------- 诺基亚 ---------------- */

  function renderNokia(sys, screen) {
    const desk = document.createElement('div');
    desk.className = 'desk chrome-' + sys.skin.chrome;
    desk.style.setProperty('--ui-font', sys.skin.font || 'sans-serif');
    setBackground(desk, sys.wallpaper);
    screen.appendChild(desk);

    const ui = document.createElement('div');
    ui.className = 'nokiaui';
    desk.appendChild(ui);

    const st = document.createElement('div');
    st.className = 'nstatus';
    st.innerHTML = '<span class="sig">▮▮▮</span><span data-clock="1">00:00</span><span>▮</span>';
    ui.appendChild(st);

    const main = document.createElement('div');
    main.className = 'nmain';
    ui.appendChild(main);

    const title = document.createElement('div');
    title.className = 'ntitle';
    title.textContent = '菜单';
    main.appendChild(title);

    const grid = document.createElement('div');
    grid.className = 'ngrid';
    main.appendChild(grid);

    let sel = 0;
    const cells = [];
    const apps = ['phone', 'messages', 'camera', 'browser', 'store', 'settings', 'gallery', 'music', 'about'];
    apps.forEach(function (k, i) {
      const c = document.createElement('div');
      c.className = 'ncell' + (i === 0 ? ' on' : '');
      c.appendChild(makeIcon(sys, k, 30));
      const s = document.createElement('span');
      const lab = labels(sys.hall);
      const nm = lab[k] || (PHONE_APPS.filter(function (x) { return x.id === k; })[0] || {}).name || '关于本机';
      s.textContent = (k === 'about' ? '关于' : nm);
      c.appendChild(s);
      c.addEventListener('click', function () { sel = i; highlight(); });
      c.addEventListener('dblclick', function () { openNokiaDetail(sys, desk, k); });
      grid.appendChild(c);
      cells.push(c);
    });

    function highlight() {
      cells.forEach(function (c, i) { c.classList.toggle('on', i === sel); });
    }

    const soft = document.createElement('div');
    soft.className = 'nsoft';
    soft.innerHTML = '<span>选项</span><span>返回</span>';
    ui.appendChild(soft);

    // 键盘导航
    const onKey = function (e) {
      if (e.key === 'ArrowRight') { sel = (sel + 1) % cells.length; highlight(); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { sel = (sel - 1 + cells.length) % cells.length; highlight(); e.preventDefault(); }
      if (e.key === 'ArrowDown') { sel = (sel + 3) % cells.length; highlight(); e.preventDefault(); }
      if (e.key === 'ArrowUp') { sel = (sel - 3 + cells.length) % cells.length; highlight(); e.preventDefault(); }
      if (e.key === 'Enter') { openNokiaDetail(sys, desk, apps[sel]); }
    };
    desk._nokiaKey = onKey;
    return desk;
  }

  function openNokiaDetail(sys, desk, key) {
    const ui = desk.querySelector('.nokiaui');
    if (!ui) return;
    const old = ui.querySelector('.ncover');
    if (old) old.remove();
    const cover = document.createElement('div');
    cover.className = 'ncover';
    cover.style.cssText = 'position:absolute;inset:0;background:#c8d0b8;display:flex;flex-direction:column;z-index:30';
    const t = document.createElement('div');
    t.className = 'ntitle';
    t.textContent = (labels(sys.hall)[key] || key);
    const d = document.createElement('div');
    d.className = 'ndetail';
    d.textContent = sys.note;
    const b = document.createElement('div');
    b.className = 'nsoft';
    b.style.marginTop = 'auto';
    b.innerHTML = '<span>确定</span><span>返回</span>';
    cover.appendChild(t); cover.appendChild(d); cover.appendChild(b);
    cover.addEventListener('click', function () { cover.remove(); });
    ui.appendChild(cover);
  }

  /* ---------------- 终端 ---------------- */

  function renderTerminal(sys, screen) {
    const desk = document.createElement('div');
    desk.className = 'desk chrome-' + sys.skin.chrome;
    desk.style.setProperty('--ui-font', sys.skin.font || 'monospace');
    desk.style.setProperty('--accent', sys.skin.accent || '#c0c0c0');
    desk.style.background = '#000';
    screen.appendChild(desk);

    const term = document.createElement('div');
    term.className = 'term';
    desk.appendChild(term);

    const cfg = sys.term || { prompt: 'C:\\>' };
    let lines = (cfg.intro || []).slice();
    let buffer = '';
    let tty = 1;

    function draw() {
      const body = lines.concat([cfg.prompt + ' ' + buffer]).join('\n');
      term.innerHTML = '';
      const txt = document.createElement('span');
      txt.textContent = body;
      term.appendChild(txt);
      const cur = document.createElement('span');
      cur.className = 'cur';
      term.appendChild(cur);
      if (cfg.tty) {
        const h = document.createElement('div');
        h.className = 'ttyhint';
        h.textContent = 'ttys00' + tty + '   Alt+F1–F8 切换';
        term.appendChild(h);
        if (!term.querySelector('.ttylabel')) {
          const lb = document.createElement('div');
          lb.className = 'ttylabel';
          lb.style.cssText = 'position:absolute;left:0;right:0;top:0;background:#000;color:' + (sys.skin.accent || '#ccc') + ';font-size:10.5px;padding:2px 8px;border-bottom:1px solid #222';
          lb.textContent = 'MINIX 3 · console tty' + tty;
          term.appendChild(lb);
        }
      }
    }

    function run(cmd) {
      const c = cmd.trim();
      const head = cfg.prompt + ' ' + c;
      lines.push(head);
      if (!c) { return; }
      const low = c.toLowerCase();
      if (low === 'cls' || low === 'clear') { lines = []; return; }
      if (low === 'help') { lines.push('可用命令: dir  ls  ver  date  echo  cls  tty'); return; }
      if (low === 'ver') { lines.push(sys.name + ' ' + sys.version + '  [' + sys.year + ']'); return; }
      if (low === 'date') { lines.push(new Date().toString()); return; }
      if (low === 'dir' || low === 'ls') { lines.push('COMMAND  COM     54,619   AUTOEXEC BAT        0'); lines.push('CONFIG   SYS        0   EDIT     EXE   71,342'); return; }
      if (low.startsWith('echo ')) { lines.push(c.slice(5)); return; }
      if (low.startsWith('tty')) { lines.push('tty00' + tty); return; }
      lines.push('Bad command or file name');
    }

    draw();

    const onKey = function (e) {
      if (e.key === 'Enter') { run(buffer); buffer = ''; draw(); e.preventDefault(); }
      else if (e.key === 'Backspace') { buffer = buffer.slice(0, -1); draw(); e.preventDefault(); }
      else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) { buffer += e.key; draw(); e.preventDefault(); }
    };
    desk._termKey = onKey;
    return desk;
  }

  /* ---------------- 入口 ---------------- */

  function render(sys, device) {
    zTop = 20;
    const screen = buildShell(sys, device);
    screen.appendChild(makeGlass());

    let desk;
    if (sys.screenType === 'terminal') desk = renderTerminal(sys, screen);
    else if (sys.screenType === 'phone') desk = renderPhone(sys, screen);
    else if (sys.screenType === 'nokia') desk = renderNokia(sys, screen);
    else desk = renderDesktop(sys, screen);

    return desk;
  }

  function makeGlass() {
    const g = document.createElement('div');
    g.className = 'screen-glass';
    return g;
  }

  window.MUSEUM = {
    render: render,
    labels: labels,
    iconUrl: iconUrl,
    logoUrl: logoUrl
  };
})();
