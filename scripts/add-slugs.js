const fs = require("fs");
const path = require("path");

const slugMap = {
  "AUTOSAR 入门教程（1）基础篇一": "autosar-tutorial-1-basics-1",
  "AUTOSAR 入门教程（10）BSWM": "autosar-tutorial-10-bswm",
  "AUTOSAR 入门教程（11）ECUM": "autosar-tutorial-11-ecum",
  "AUTOSAR 入门教程（12）Diagnostic": "autosar-tutorial-12-diagnostic",
  "AUTOSAR 入门教程（13）DCM": "autosar-tutorial-13-dcm",
  "AUTOSAR 入门教程（14）DEM": "autosar-tutorial-14-dem",
  "AUTOSAR 入门教程（15）Gateway": "autosar-tutorial-15-gateway",
  "AUTOSAR 入门教程（16）RamTst": "autosar-tutorial-16-ramtst",
  "AUTOSAR 入门教程（17）CorTst": "autosar-tutorial-17-cortst",
  "AUTOSAR 入门教程（18）Crypto": "autosar-tutorial-18-crypto",
  "AUTOSAR 入门教程（2）基础篇二": "autosar-tutorial-2-basics-2",
  "AUTOSAR 入门教程（3）Watchdog Services": "autosar-tutorial-3-watchdog",
  "AUTOSAR 入门教程（4）MemStack（一）": "autosar-tutorial-4-memstack-1",
  "AUTOSAR 入门教程（5）MemStack（二）": "autosar-tutorial-5-memstack-2",
  "AUTOSAR 入门教程（6）ComStack（一）": "autosar-tutorial-6-comstack-1",
  "AUTOSAR 入门教程（7）ComStack CAN（二）": "autosar-tutorial-7-comstack-can-2",
  "AUTOSAR 入门教程（8）ComStack CANTP（三）": "autosar-tutorial-8-comstack-cantp-3",
  "AUTOSAR 入门教程（9）CanNm": "autosar-tutorial-9-cannm",
  "CANoe 工程实战：目录规范与踩坑指南": "canoe-project-best-practices",
  "Classic AUTOSAR CAN 通信栈源码解析": "classic-autosar-can-stack-source",
  "Digital Garden 接入 AdSense": "digital-garden-adsense",
  "ETAS Adaptive AUTOSAR 技术细节剖析": "etas-adaptive-autosar-deep-dive",
  "Google AdSense 博客接入指南": "google-adsense-blog-guide",
  "Linux 上使用 Androidstudio 时启动模拟器报错": "android-emulator-linux-fix",
  "Linux 安装的本质：三层结构与两条原则": "linux-install-essentials",
  "NvM 存储栈：分层架构、Block 模型与 Fee 仿真": "nvm-storage-stack",
  "UDS 入门指南": "uds-getting-started",
  "UNRAID 如何部署 DNSPod": "unraid-dnspod-deploy",
  "Windowser or Linuxer": "windowser-or-linuxer",
  "XCP 协议入门：从 A2L 文件到 ECU 标定实践": "xcp-protocol-a2l-ecu-calibration",
  "一文读懂 AUTOSAR OS": "autosar-os-explained",
  "三张图看懂视频链路，像素格式、压缩编码与传输接口": "video-pipeline-explained",
  "从 All In One 到极简，我的家庭服务器终局方案": "minimal-home-server",
  "公众号新手涨粉指南——算法、时机与推送": "wechat-growth-guide",
  "剖析 UDS 诊断帧": "uds-diagnostic-frame-analysis",
  "单片机软件架构：轮询、前后台、RTOS 怎么选": "mcu-software-architecture",
  "基本算法实现之递归": "algorithm-recursion",
  "基本算法实现之递推": "algorithm-recurrence",
  "基本算法思想之分治": "algorithm-divide-and-conquer",
  "基本算法思想之概率": "algorithm-probability",
  "基本算法思想之穷举法": "algorithm-exhaustion",
  "如何利用 DaVinciConfigurator 插件集成 EB": "davinci-eb-integration",
  "如何开启 Ubuntu RDP 远程桌面": "ubuntu-rdp-remote-desktop",
  "如何理解 UML 类图": "uml-class-diagram",
  "如何用 Obsidian 优雅地写博客": "obsidian-blog-writing",
  "定制 OS-X 风格的 Gnome": "osx-gnome-customization",
  "我在 UNRAID 上跑的那些服务": "unraid-self-hosted-services",
  "我把和老婆的微信聊天记录喂给 AI，它给我们写了一首歌": "ai-love-song",
  "我的 Obsidian 设置和使用教程": "obsidian-setup-tutorial",
  "拖了三年的事，三小时就搞定了": "three-hours-vs-three-years",
  "插入排序之直接插入排序": "insertion-sort",
  "搭建 RTSP 视频推拉流": "rtsp-video-streaming",
  "新手露营装备指南,11 件核心装备科学入坑": "camping-gear-guide",
  "特斯拉焕新款 Model 3 配件攻略": "tesla-model3-refresh-accessories",
  "电机控制的本质是磁场控制": "motor-control-magnetic-field",
  "自动驾驶通信，SOMEIP 和 DDS 部署指南": "someip-dds-deployment-guide",
  "计算的本质：从符号到机器的思维框架": "computation-symbols-to-machines",
  "让知识复利：用 LLM 建一个会生长的个人 wiki": "llm-personal-wiki",
  "配置你的专属 Deepin": "deepin-customization",
  "配置你的专属 Manjaro-i3wm": "manjaro-i3wm-config",
  "面试挂了才知道，基础题不考你会不会": "interview-basics-matter",
  // Special pages
  "关于": "about",
  "付费": "premium",
  "简历": "resume",
};

const notesDir = path.join(__dirname, "..", "src", "site", "notes", "2.raw");
const specialDir = path.join(__dirname, "..", "src", "site", "notes");

function addSlug(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return;

  const fm = JSON.parse(match[1]);
  const fileName = path.basename(filePath, ".md");
  const slug = slugMap[fileName];
  if (!slug) {
    console.log("SKIP (no slug):", fileName);
    return;
  }

  if (fm["dg-note-properties"] && fm["dg-note-properties"].slug === slug) {
    return; // already has correct slug
  }

  if (!fm["dg-note-properties"]) fm["dg-note-properties"] = {};
  fm["dg-note-properties"].slug = slug;

  const newFm = JSON.stringify(fm);
  const rest = content.slice(match[0].length);
  fs.writeFileSync(filePath, `---\n${newFm}\n---${rest}`, "utf8");
  console.log("OK:", fileName, "->", slug);
}

// Process articles
fs.readdirSync(notesDir)
  .filter((f) => f.endsWith(".md"))
  .forEach((f) => addSlug(path.join(notesDir, f)));

// Process special pages
["关于.md", "付费.md", "简历.md"].forEach((f) => {
  const p = path.join(specialDir, f);
  if (fs.existsSync(p)) addSlug(p);
});
