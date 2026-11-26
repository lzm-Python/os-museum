/* 生成素材清单：wp / icons / logos 三类，按展品逐个列出 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const systems = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'systems.json'), 'utf8'));

const HOME = path.join(ROOT, 'assets');
['wallpapers', 'icons', 'logos'].forEach(d => fs.mkdirSync(path.join(HOME, d), { recursive: true }));

const DESKTOP_ICONS = ['computer', 'recyclebin', 'folder', 'browser', 'settings', 'notepad', 'calculator'];
const PHONE_ICONS = ['phone', 'messages', 'camera', 'browser', 'store', 'settings', 'gallery', 'music'];

const sizeOf = (sys) => {
  if (sys.shell === 'phone') return '1080×2400（9:19.5，竖图）';
  if (sys.shell === 'nokia') return '640×853（3:4，竖图，像素感越强越好）';
  return '1920×1080（16:9，横图）';
};

const manifest = { wallpapers: [], icons: [], logos: [] };

let md = '# 本地素材清单\n\n';
md += '把下面每一张图按「文件名」放进对应目录，路径必须完全一致，代码就是按这个路径找图的。\n';
md += '放不进去之前，展厅里会显示「缺失素材」的提示框，不会假装成真壁纸。\n\n';

md += '## 一、壁纸（' + systems.length + ' 张）\n\n';
md += '目录：`assets/wallpapers/`\n\n';
md += '| 文件名 | 系统 | 建议尺寸 |\n|---|---|---|\n';

for (const s of systems) {
  const file = path.basename(s.wallpaper);
  manifest.wallpapers.push({ id: s.id, path: s.wallpaper, size: sizeOf(s) });
  md += `| ${file} | ${s.name} ${s.version} | ${sizeOf(s)} |\n`;
}

md += '\n## 二、厂商 Logo（' + [...new Set(systems.map(s => s.vendorId))].length + ' 个）\n\n';
md += '目录：`assets/logos/`　建议 512×512 透明 PNG\n\n| 文件名 | 厂商 |\n|---|---|\n';

const vendors = {};
for (const s of systems) {
  if (!vendors[s.vendorId]) {
    vendors[s.vendorId] = s.vendor;
    manifest.logos.push({ id: s.vendorId, path: 'assets/logos/' + s.vendorId + '.png', vendor: s.vendor });
  }
}
for (const k of Object.keys(vendors)) md += `| ${k}.png | ${vendors[k]} |\n`;

md += '\n## 三、系统图标\n\n';
md += '目录：`assets/icons/<系统id>/`　建议 256×256 透明 PNG，图标风格要跟该系统本体的图标一致。\n\n';
md += '每个系统需要哪些图标，见下表；同名文件放进该系统的文件夹即可。\n\n';
md += '| 系统 id | 系统 | 需要的图标 |\n|---|---|---|\n';

for (const s of systems) {
  const keys = s.screenType === 'desktop' ? DESKTOP_ICONS
    : (s.screenType === 'terminal' ? [] : PHONE_ICONS);
  const dir = path.join(HOME, 'icons', s.id);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, '_需要放入.txt');
  fs.writeFileSync(file,
    `系统：${s.name} ${s.version}（${s.vendor}，${s.year}）\n需要以下图标，全部 256×256 透明 PNG：\n\n` +
    keys.map(k => `  ${k}.png`).join('\n') + '\n', 'utf8');

  keys.forEach(k => {
    manifest.icons.push({ system: s.id, name: s.name + ' ' + s.version, path: `assets/icons/${s.id}/${k}.png`, key: k });
  });
  md += `| ${s.id} | ${s.name} ${s.version} | ${keys.length ? keys.map(k => k + '.png').join(' ') : '（终端系统，不需要图标）'} |\n`;
}

md += '\n## 四、说明\n\n';
md += '- 壁纸必须是该系统**真实的**默认壁纸或官方截图，不要用纯色或渐变顶替。\n';
md += '- 手机系统的壁纸请用竖图，桌面系统用横图，比例不对会被裁切。\n';
md += '- 图标缺失时窗口和桌面会显示「缺图」占位，不影响运行。\n';
md += '- 全部放好之后，直接双击根目录的 `打包.bat` 重新出 exe 即可。\n';

fs.writeFileSync(path.join(ROOT, '素材清单.md'), md, 'utf8');
fs.writeFileSync(path.join(ROOT, 'assets', 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');

console.log('壁纸', manifest.wallpapers.length, '图标', manifest.icons.length, 'Logo', manifest.logos.length);
