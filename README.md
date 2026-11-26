# 世界操作系统全史博物馆

一个可以点进去「开机」的系统博物馆。原生 HTML/CSS/JS + Electron，100 件展品，鼠标点开任意一台，就进到那台机器的桌面里。

## 直接运行（开发预览）

```
npm install
npm start
```

## 打包成 exe

双击根目录的 `打包.bat`，成品输出到 `dist\`。只想把现成的安装包搬到桌面，双击 `发送到桌面.bat` 即可。

## 进去之后怎么玩

- 大厅：100 台机器按展厅分类，顶部可搜索系统名、厂商、年份。
- 点任意卡片 → 开机动画 → 进入该系统的硬件外壳。
- 桌面系统（Windows / macOS / Linux / 各类桌面发行版）：单击桌面图标弹出资源管理器窗口，窗口可拖动、可最大化、可点右上角关闭；左下角开始按钮弹出该系统的开始菜单（Win10 是三栏毛玻璃、XP 是 Luna 双栏、95 是经典灰菜单）。
- 手机系统：刘海屏外壳，桌面图标网格 + 底部 Dock，点图标进入应用页，左上角返回。
- 诺基亚：直板机外壳 + 实体键盘，屏幕内是九宫格菜单与软键。
- 终端系统（MS-DOS、CP/M 等）：屏幕就是命令行，可直接敲 `dir`、`cls`、`ver`、`help`。

## 目录结构

```
os-museum/
├─ main.js                 Electron 主进程
├─ preload.js              把 data/systems.json 安全地送进渲染进程，并注入 isElectron 标记
├─ data/systems.json       100 件展品的数据（唯一数据源）
├─ src/
│  ├─ index.html
│  ├─ app.js               大厅、筛选、进入展品、开机动画
│  ├─ desktop.js           外壳 / 窗口管理器 / 任务栏 / 开始菜单 / 手机 / 诺基亚 / 终端
│  └─ styles/
│     ├─ base.css          博物馆建筑自身 UI
│     ├─ shells.css        显示器、手机、直板机三种硬件外壳
│     └─ skins.css         59 种系统外观变量
├─ assets/
│  ├─ wallpapers/          真实壁纸，100 张，命名见 素材清单.md
│  ├─ icons/<系统id>/      该系统自己的图标
│  ├─ logos/               厂商 Logo
│  └─ manifest.json        机器可读的素材索引
├─ tools/gen-manifest.js   改了 systems.json 之后重新生成素材清单
└─ 素材清单.md             你要准备的全部图片
```

## 素材规则

- 壁纸一律用该系统**真实的**默认壁纸或官方截图，代码里不提供纯色 / 渐变当替身。
- 缺少图片时，界面会显示「缺失素材」并写出期望路径，不会伪装成真实壁纸。
- 所有引用都是相对路径（`assets/wallpapers/winxp_bliss.jpg`），没有任何外部链接。

## 双端差异

- 网页端：不显示厂商 Logo（避免商标素材在浏览器里直接暴露）。
- exe 里：卡片、开机画面、任务栏开始按钮都会加载真实厂商 Logo。

判断依据是 `window.museumHost.isElectron`，由 preload 注入。

## 验收截图

`shots/` 里是脚本自动跑出来的运行画面（无 GIF、无手绘）：大厅、Win10 开始菜单、Win10 资源管理器窗口、XP、Win95、macOS、iOS、诺基亚 S60、MS-DOS。改完代码想复查，跑 `npx electron snap.js` 会覆盖重拍。

## 加一件新展品

1. 在 `data/systems.json` 里追加一条，字段照抄现有条目。
2. `node tools/gen-manifest.js` 重新生成素材清单。
3. 把壁纸和图标放进清单里写的路径。

`skin.chrome` 决定窗口长什么样，可用的值：`terminal win1 win31 win2000 win95 winxp aero win8 win10 win11 wp7 wp macclassic platinum aqua aqua-flat macos ios1 ios3 ios6 ios7 ios17 android-old android-holo android-kk android-material android10 android14 chromeos miui hyperos oneui coloros harmony deepin yunos kde gnome unity tiled gnome-dark mint steam symbian symbian3 maemo meego asha alto amiga riscos wps next beos irix cde photon rio`。
