const { app, BrowserWindow } = require('electron');
const path = require('path');

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    show: false, width: 1400, height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  const logs = [];
  win.webContents.on('console-message', (e, level, msg) => logs.push(level + ': ' + msg));
  win.webContents.on('did-fail-load', (e, code, desc) => logs.push('FAIL_LOAD ' + code + ' ' + desc));

  win.webContents.on('preload-error', (e, p, err) => logs.push('PRELOAD ' + err));

  await win.loadFile(path.join(__dirname, 'src', 'index.html'));

  let result = null;
  try {
    result = await win.webContents.executeJavaScript(`(async () => {
      const out = {};
      const sleep = ms => new Promise(r => setTimeout(r, ms));
      out.cards = document.querySelectorAll('.card').length;
      out.isDesktopMode = document.body.classList.contains('is-desktop');

      const card = Array.from(document.querySelectorAll('.card')).find(c => c.dataset.id === 'win10');
      out.foundWin10Card = !!card;
      card.click();
      await sleep(1400);

      out.stageVisible = !document.getElementById('stage').hidden;
      out.deviceChildren = document.getElementById('device').children.length;
      out.hasDesk = !!document.querySelector('.desk');
      out.hasWallpaperImg = !!(document.querySelector('.desk') || {}).style?.backgroundImage;
      out.hasBar = !!document.querySelector('.bar');
      out.desktopIcons = document.querySelectorAll('.desk-icon').length;

      const sb = document.querySelector('.bar .startbtn');
      out.hasStartBtn = !!sb;
      if (sb) { sb.click(); }
      await sleep(250);
      out.hasStartMenu = !!document.querySelector('.menu');
      out.startMenuClass = (document.querySelector('.menu') || {}).className || '';

      const di = document.querySelector('.desk-icon');
      if (di) { di.click(); }
      await sleep(250);
      out.hasWindow = !!document.querySelector('.win');
      out.hasCloseBtn = !!document.querySelector('.win .wbtn.x');

      if (out.hasCloseBtn) {
        document.querySelector('.win .wbtn.x').click();
        await sleep(150);
        out.closedAfterClick = !document.querySelector('.win');
      }

      // 再看一眼手机壳
      document.getElementById('btnBack').click();
      await sleep(200);
      const phoneCard = Array.from(document.querySelectorAll('.card')).find(c => c.dataset.id === 'ios17');
      out.foundPhoneCard = !!phoneCard;
      if (phoneCard) {
        phoneCard.click();
        await sleep(1300);
        out.phoneShell = !!document.querySelector('.device.phone');
        out.phoneGrid = document.querySelectorAll('.ph-app').length;
      }

      return out;
    })()`, true);
  } catch (err) {
    result = { error: String(err) };
  }

  console.log('=== RESULT ===');
  console.log(JSON.stringify(result, null, 2));
  console.log('=== CONSOLE ===');
  console.log(logs.join('\n') || '(none)');
  app.quit();
});
