---
{"dg-publish":true,"dg-path":"记账 App 全删了，我用 AI 自己写了一个.md","permalink":"/记账 App 全删了，我用 AI 自己写了一个/","dg-note-properties":{"slug":"ai-bill-tracker","author":"吉人","created":"2026-06-01","source":null}}
---

> 从一张信用卡到家庭财务分析器，我花了三年才搞明白一件事：记账的目的不是记下每一笔，而是看见自己的选择。

有一次月底想查查这个月花了多少钱，打开支付宝、微信、银行 App 切了三个来回，还是没拼出来。那一刻我意识到：钱散落在太多地方，没有一个能告诉我全部真相。

三年前不是这样的。那时候只用招商银行信用卡，工资卡是招行借记卡，日常消费全走信用卡，月底打开银行 App 看一眼账单，支出结构清清楚楚。不需要记账 App，不需要手动分类，甚至不需要做预算。

这个策略有一个隐含前提：所有支出都走信用卡。但现实没那么理想。停车场扫微信付款、物业费从借记卡代扣、给家人的转账走支付宝——这些消费像掉在沙发缝里的硬币，不在账单里，但确实在流失。单身的时候可以假装它们不存在，结婚之后就不行了。

## 数据在哪儿，钱就在哪儿

结婚之前，90% 的支出都在一张卡上，剩下的就当没花过。结婚之后，支出渠道瞬间翻倍——两个人的信用卡、两个支付宝、两个微信支付，加上车贷的银行自动扣款和两口子之间的互相转账。我第一次坐在电脑前试图拼出一个月的家庭总支出，半小时后放弃了。

不是懒，是数据根本拼不上。支付宝导出 CSV，微信导出 Excel，字段名不一样，分类标准不一样，连「收/支」的标记逻辑都不一样。更麻烦的是夫妻互转：我用支付宝给老婆转了一笔钱，她在微信上买了东西。这笔消费在支付宝里记为「转账」，在微信里记为「购物」，不特殊处理就会重复计算或者直接漏掉。

这已经不是记账的问题了，**这是数据清洗的问题**。

后来我想明白了：记账最难的从来不是分析，而是采集。你的钱分散在银行卡、支付宝、微信、信用卡里，这些产品之间完全不互通，没有一份统一的账单。所有记账软件都在这个问题上卡住了——不管 UI 做得多好看，数据采集这一步总得用户自己参与，手动补充、手动对账、手动分类。只要需要人参与，这件事就注定失败。

## 两个出口，一个技能

所以我的思路不是找一个更好的记账 App，而是从源头解决问题：**把消费通道收窄**。把所有日常消费集中到支付宝和微信支付两个出口，能刷卡的地方改扫码，现金支付全部停掉，除了车贷这种必须从银行卡自动扣款的固定支出，其他一切走这两个平台。不是为了省手续费或攒积分，纯粹是为了让数据出口统一。当所有消费记录只从两个地方导出时，分析才有可靠的数据源。这个方案适用于大部分人——不需要任何技术门槛，只需要改变支付习惯。

一开始我寄希望于招商银行自己的账单导出，毕竟工资卡和信用卡都是招行的，数据应该最全。但导出之后大失所望：账单上严重缺失消费信息，很多记录只有金额和日期，没有商家名称，没有消费类别，根本无法做二次分析。银行的账单是给人看的，不是给程序看的。

数据源的问题解决了，下一个问题是：用什么来分析。市面上不缺记账 App，随手记、挖财、MoneyPro，试了一圈都不满意。不是它们做得不好，而是每一个都 **把呈现方式锁死了**。我想按自己的逻辑给消费分类，想自由调整图表样式，想在家庭总览和个人分析之间随时切换——在别人的 App 里做不到这些。

所以我打开 Claude Code，用 AI 给自己写了一个分析技能。整个开发过程是对话式的：我先告诉它「我要分析支付宝和微信的家庭账单，两个人，需要处理互转的重复记账」，然后丢了一个月的账单文件过去。它自动识别了编码和字段，写出了第一版解析逻辑。

跑出来的结果有问题——夫妻互转的金额被重复计算了。我把数据贴回去，告诉它哪里算重了，它修好了。接着我说「加一个月度消费趋势图」，它就加上了堆叠柱状图。说「加一个商家消费排名」，它又补上了商家分析模块。就这样一轮一轮对话，从一个简单的 CSV 解析器，长成了一个两千行的家庭财务分析工具。

它不是一个跑完就扔的一次性脚本，而是一个可复用的技能：解析两个平台的账单、处理夫妻互转的重复记账、按类别按月份按商家做聚合，最终生成一份交互式的 HTML 可视化报告。所有逻辑都是自己的——分类规则自己定，图表样式自己选，想加什么功能随时加。

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1019.465 241.8" width="650" height="241.8" style="--bg:#f8f6f3;--fg:#1a1a1a;--line:#4a4a4a;--accent:#d97757;--muted:#6a6a6a;--surface:#e8e6e3;--border:#4a4a4a;background:var(--bg)"><style>  @import url('https://fonts.googleapis.com/css2?family=Noto%20Sans%20SC:wght@400;500;600;700&amp;display=swap');  text { font-family: 'Noto Sans SC', system-ui, sans-serif; }  svg {    /* Derived from --bg and --fg (overridable via --line, --accent, etc.) */    --_text:          var(--fg);    --_text-sec:      var(--muted, color-mix(in srgb, var(--fg) 60%, var(--bg)));    --_text-muted:    var(--muted, color-mix(in srgb, var(--fg) 40%, var(--bg)));    --_text-faint:    color-mix(in srgb, var(--fg) 25%, var(--bg));    --_line:          var(--line, color-mix(in srgb, var(--fg) 50%, var(--bg)));    --_arrow:         var(--accent, color-mix(in srgb, var(--fg) 85%, var(--bg)));    --_node-fill:     var(--surface, color-mix(in srgb, var(--fg) 3%, var(--bg)));    --_node-stroke:   var(--border, color-mix(in srgb, var(--fg) 20%, var(--bg)));    --_group-fill:    var(--bg);    --_group-hdr:     color-mix(in srgb, var(--fg) 5%, var(--bg));    --_inner-stroke:  color-mix(in srgb, var(--fg) 12%, var(--bg));    --_key-badge:     color-mix(in srgb, var(--fg) 10%, var(--bg));  }</style><defs>  <marker id="arrowhead" markerWidth="8" markerHeight="5" refX="7" refY="2.5" orient="auto">    <polygon points="0 0, 8 2.5, 0 5" fill="var(--_arrow)" stroke="var(--_arrow)" stroke-width="0.75" stroke-linejoin="round"/>  </marker>  <marker id="arrowhead-start" markerWidth="8" markerHeight="5" refX="1" refY="2.5" orient="auto-start-reverse">    <polygon points="8 0, 0 2.5, 8 5" fill="var(--_arrow)" stroke="var(--_arrow)" stroke-width="0.75" stroke-linejoin="round"/>  </marker></defs><g class="subgraph" data-id="" data-label="数据源">  <rect x="40" y="40" width="147.30899999999997" height="161.8" rx="0" ry="0" fill="var(--_group-fill)" stroke="var(--_node-stroke)" stroke-width="1"/>  <rect x="40" y="40" width="147.30899999999997" height="28" rx="0" ry="0" fill="var(--_group-hdr)" stroke="var(--_node-stroke)" stroke-width="1"/>  <text x="52" y="54" font-size="12" font-weight="600" fill="var(--_text-sec)" dy="4.199999999999999">数据源</text></g><g class="subgraph" data-id="" data-label="数据源">  <rect x="247.30899999999997" y="72.45" width="519.869" height="96.9" rx="0" ry="0" fill="var(--_group-fill)" stroke="var(--_node-stroke)" stroke-width="1"/>  <rect x="247.30899999999997" y="72.45" width="519.869" height="28" rx="0" ry="0" fill="var(--_group-hdr)" stroke="var(--_node-stroke)" stroke-width="1"/>  <text x="259.30899999999997" y="86.45" font-size="12" font-weight="600" fill="var(--_text-sec)" dy="4.199999999999999">数据源</text></g><polyline class="edge" data-from="A" data-to="C" data-style="solid" data-arrow-start="false" data-arrow-end="true" points="175.01399999999998,102.45 219.1615,102.45 219.1615,134.9 263.30899999999997,134.9" fill="none" stroke="var(--_line)" stroke-width="1" marker-end="url(#arrowhead)"/><polyline class="edge" data-from="B" data-to="C" data-style="solid" data-arrow-start="false" data-arrow-end="true" points="167.60399999999998,167.35000000000002 219.1615,167.35000000000002 219.1615,134.9 263.30899999999997,134.9" fill="none" stroke="var(--_line)" stroke-width="1" marker-end="url(#arrowhead)"/><polyline class="edge" data-from="C" data-to="D" data-style="solid" data-arrow-start="false" data-arrow-end="true" points="160.94899999999998,62.45 208.94899999999998,62.45" fill="none" stroke="var(--_line)" stroke-width="1" marker-end="url(#arrowhead)"/><polyline class="edge" data-from="D" data-to="E" data-style="solid" data-arrow-start="false" data-arrow-end="true" points="354.639,62.45 402.639,62.45" fill="none" stroke="var(--_line)" stroke-width="1" marker-end="url(#arrowhead)"/><polyline class="edge" data-from="E" data-to="F" data-style="solid" data-arrow-start="false" data-arrow-end="true" points="751.178,134.9 821.178,134.9" fill="none" stroke="var(--_line)" stroke-width="1" marker-end="url(#arrowhead)"/><g class="node" data-id="F" data-label="交互式 HTML 报告" data-shape="rectangle">  <rect x="821.178" y="116.45" width="158.28699999999998" height="36.900000000000006" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75"/>  <text x="900.3215" y="134.9" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)" dy="4.55">交互式 HTML 报告</text></g><g class="node" data-id="A" data-label="支付宝 CSV" data-shape="rectangle">  <rect x="59.70499999999999" y="84" width="115.30899999999998" height="36.900000000000006" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75"/>  <text x="117.35949999999998" y="102.45" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)" dy="4.55">支付宝 CSV</text></g><g class="node" data-id="B" data-label="微信 Excel" data-shape="rectangle">  <rect x="59.70499999999999" y="148.9" width="107.899" height="36.900000000000006" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75"/>  <text x="113.65449999999998" y="167.35000000000002" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)" dy="4.55">微信 Excel</text></g><g class="node" data-id="C" data-label="Python 解析去重" data-shape="rectangle">  <rect x="263.30899999999997" y="116.45" width="144.94899999999998" height="36.900000000000006" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75"/>  <text x="335.78349999999995" y="134.9" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)" dy="4.55">Python 解析去重</text></g><g class="node" data-id="D" data-label="标准化消费记录" data-shape="rectangle">  <rect x="456.2579999999999" y="116.45" width="145.69" height="36.900000000000006" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75"/>  <text x="529.103" y="134.9" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)" dy="4.55">标准化消费记录</text></g><g class="node" data-id="E" data-label="分类聚合" data-shape="rectangle">  <rect x="649.948" y="116.45" width="101.22999999999999" height="36.900000000000006" rx="0" ry="0" fill="var(--_node-fill)" stroke="var(--_node-stroke)" stroke-width="0.75"/>  <text x="700.563" y="134.9" text-anchor="middle" font-size="13" font-weight="500" fill="var(--_text)" dy="4.55">分类聚合</text></g></svg>

## 报告是活的

第一次跑出完整报告时，我盯着屏幕看了半小时。不是被数字震惊，而是看到了以前从未注意到的模式。某些消费类别的月度波动像心电图一样规律，某些商家的出现频率远超预期，两个平台的消费比例随着季节在悄悄变化。好的工具不是让人做得更多，而是让人看见原本看不见的东西。

理财数据的分析不是把所有交易加在一起除以月份数就行。原始账单里混杂着收入、转账、退款、已关闭的交易，如果直接加总，数字没有任何意义。所以报告对数据做了层层剥离：先过滤掉「不计收支」和「交易关闭」的记录，再剥离退款，然后把转账分成三类——夫妻互转不是消费，转给父母的是亲情支出，转给其他人的才是人际转账。经过这几层过滤后剩下的数字，才是真实的家庭消费。

![bill-management-tracker-fig02.png\|650](/img/user/0.asset/media/bill-management-tracker-fig02.png)

![bill-management-tracker-fig03.png\|650](/img/user/0.asset/media/bill-management-tracker-fig03.png)

报告分两个视角：家庭总览看两个人的合并数据，个人分析看各自的消费结构，就像给家庭财务做了一次 CT 扫描。这些视角背后是灵活的配置体系——每个家庭成员的税后收入、固定支出、商家分类规则都可以写在配置文件里，脚本会据此计算储蓄率、可支配收入，甚至给出 FIRE 距离估算。

更重要的是，这份报告不是固定的。上个月觉得按商家排名的维度不够细，加了一个按平台的消费时间分布图，十分钟搞定。这个月想看储蓄率的趋势线，又改了一版。用别人的 App 做不到这一点——你只能等开发者下次更新。用自己的技能，想改随时动手。

## 账单不是终点

记账这件事，大多数人要么从不开始，要么坚持一周就放弃。我对记账有一个底线要求：**必须全自动**。任何需要我手动输入的事情，我都清楚自己坚持不下来——不是意志力的问题，是这个过程实在太无聊了。

传统记账把注意力放在「记」上，每一笔都要分类、打标签、选账户，这就像让一个从不运动的人每天跑十公里，门槛高到注定失败。真正有用的不是记录每一笔支出，而是定期看到全局。不需要每天记账，只需要每月花五分钟导出账单，跑一次分析。数据会自己说话，你只需要听。

> 你上一次完整看过自己一个月的钱花在哪儿，是什么时候？