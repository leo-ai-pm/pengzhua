# 碰爪 · 现状清单与证据台账

更新：2026-09-05。先建立清单后完成各文档；实现事实以本表为入口，需求定义以[PRD](03-prd.md)为准。

## 核查口径

已先读[QA_HANDOFF.md](../../QA_HANDOFF.md)，再读源码、原results.json及工作簿（只读）。核查了页面入口、处理函数、数据模型、地图代理、二维码清理和测试文件。本轮没有重跑构建或测试套件，没有新增产品交互通过记录。

O-01 本轮只读观察：隔离ego-browser打开[线上演示](https://qunaliu-pet-community.ljhsmart1.chatgpt.site/)，出现“只差一步即可登录 / 使用 ChatGPT 继续”。未进入产品，不能判断线上地图成功或故障。

`PRODUCT-DIRECTION.md`早期手绘地图、待配置Key、外跳导航、朋友近况等是历史描述。以当前源码、QA最新补充及本次方向为准，不抹去历史。

## 十项方向核验

| 方向 | 当前事实与程度 | 差异/建议 | 证据 |
| --- | --- | --- | --- |
| 1 北京、少量有资料地点 | 已实现四处精选，真实POI与携宠来源分开 | 未实勘；跨城区，非望京步行生活圈 | E03、T04、T40未测试 |
| 2 Web、430×932 | 手机画布及桌面缩放；我的页全屏 | 390宽/桌面有历史补测，Safari/安卓真机未验 | E12、T02–03、H02 |
| 3 高德、导航提示 | JS API2.0、搜索、主动定位、代理有代码；导航提示模拟 | 旧Walking/URI帮助代码不代表路线已接通；底图/GPS受限 | E02/E13、T07–10 |
| 4 宠友圈全体用户 | 本机广场混合9条示例，好友圈为筛选 | 无真实公开分发；following不等于好友权限 | E08、T12–14 |
| 5 双方确认再聊/约 | 入口/提交校验；80字可选介绍；接受明确模拟 | 缺接收方、申请箱、拒绝/撤回/解除与服务端约束 | E04、T15–19、T36未测试 |
| 6 每次主动共享公共地点 | 新次默认private，可friends、结束、到期；模型过滤好友 | 自己walk与种子presences分离，无真实投递；好友地点可能为虚构p1/p3 | E05、T27–30、T38未测试 |
| 7 扫码与自己的码 | 相机/相册解码、640px PNG；先名片、不自动加好友 | me是每个浏览器的自己，不是跨账号身份；真机镜头未验 | E10、H02 |
| 8 个人页入口 | 档案、扫一扫、码、约遛、收藏、日历、设置、隐私已接 | 与底部我的宠物为两个入口；我的约遛只展示未来计划 | E11、H01/H02 |
| 9 本机社交模拟 | localStorage，me与固定petId | 同源顺序同步≠同时写入事务≠跨设备；无业务账号后台 | E01/E06、T31–33、T44未测试 |
| 10 商店目标 | 只有Web工程及地图服务路由 | 无签名包、真实后台、治理、注销、正式隐私政策和分发验收 | E13、T45、G01–08 |

## 源码与测试依据

行号对应本次基线；通过范围不得外推。

| ID | 位置 | 可证实内容 |
| --- | --- | --- |
| E01 | [page.tsx:82](../../app/page.tsx#L82)、[page.tsx:299](../../app/page.tsx#L299) | State、默认3好友、恢复、storage事件、15秒时钟 |
| E02 | [mobile-map.tsx:66](../../app/mobile-map.tsx#L66)、[mobile-map.tsx:154](../../app/mobile-map.tsx#L154)、[mobile-map.tsx:196](../../app/mobile-map.tsx#L196) | 地图状态、真实点过滤、北京关键词搜索、主动定位 |
| E03 | [beijing-places.ts:17](../../app/beijing-places.ts#L17)、[beijing-places.ts:154](../../app/beijing-places.ts#L154) | 四点目录、GCJ-02、来源/日期、个人体验合并 |
| E04 | [contact-policy.ts:2](../../app/contact-policy.ts#L2)、[page.tsx:471](../../app/page.tsx#L471)、[page.tsx:547](../../app/page.tsx#L547) | 好友权限、申请/模拟接受、消息提交门禁 |
| E05 | [walk-model.ts:1](../../app/walk-model.ts#L1)、[walk-model.ts:239](../../app/walk-model.ts#L239)、[page.tsx:421](../../app/page.tsx#L421) | Walk/Presence、可见条件、结束函数、活动生命周期 |
| E06 | [demo-data.ts:79](../../app/demo-data.ts#L79)、[demo-data.ts:210](../../app/demo-data.ts#L210) | 帖子、消息、邀请、档案，评论只有字符串 |
| E07 | [page.tsx:499](../../app/page.tsx#L499)、[page.tsx:707](../../app/page.tsx#L707)、[qa-model.ts:3](../../app/qa-model.ts#L3) | 邀请未来时间、模拟回应/取消、到期标签 |
| E08 | [social-details.ts:16](../../app/social-details.ts#L16)、[page.tsx:586](../../app/page.tsx#L586)、[page.tsx:2465](../../app/page.tsx#L2465) | 广场、示例距离、发帖/评论、帖子转联系 |
| E09 | [walk-extras.tsx:78](../../app/walk-extras.tsx#L78)、[walk-extras.tsx:196](../../app/walk-extras.tsx#L196)、[page.tsx:1434](../../app/page.tsx#L1434) | 私人回忆、手选相遇、地点贡献、日历 |
| E10 | [pet-code.ts:1](../../app/pet-code.ts#L1)、[pet-scanner.tsx:15](../../app/pet-scanner.tsx#L15)、[pet-scanner.tsx:99](../../app/pet-scanner.tsx#L99) | 白名单码、PNG、相机/异步清理、相册识码 |
| E11 | [account-menu.tsx:94](../../app/account-menu.tsx#L94)、[account-menu.tsx:289](../../app/account-menu.tsx#L289)、[page.tsx:2310](../../app/page.tsx#L2310) | 我的页、来源返回、关闭跳转、档案编辑 |
| E12 | [device-preview.tsx:19](../../app/device-preview.tsx#L19)、[globals.css](../../app/globals.css) | 430×932、安全区、布局样式 |
| E13 | [map-config/route.ts:1](../../app/api/map-config/route.ts#L1)、[amap-service.ts:2](../../lib/amap-service.ts#L2)、[navigation-preview.tsx:12](../../app/navigation-preview.tsx#L12) | 服务器路由处理地图，非社交后台；密钥留Worker；导航提示 |
| H00 | results.json（原始私人测试材料，未随开源仓库发布）、原工作簿（原始私人测试材料，未随开源仓库发布） | 原45项、8个已修问题、8类能力缺口 |
| H01 | [QA交接个人中心补充](../../QA_HANDOFF.md) | 抽屉版本焦点、时长/共享补测；布局后来已替换 |
| H02 | [QA交接我的与扫码补充](../../QA_HANDOFF.md) | 最新全屏、码、合成相机、异常清理；历史20项逻辑测试声明 |

## 测试口径

H00为 **34通过、1环境受限、10未测试**。19项逻辑测试是T34底层证据，不加在45项上。H02的20项是后续套件，不与19累加。H01/H02仅交接文字记录，无新增编号工作簿；不合并宣称新总通过数。

只读核对原工作簿“用例与真人复测”第6–50行：T01–T45，H列虚拟结论；K列真人结果仍为未测试。不可通过整表搜索“未测试”计数，将真人列与虚拟列混在一起。

## 差异清单

| ID | 当前缺口/风险 | 关联需求和处理建议 |
| --- | --- | --- |
| GAP-01 | 无独立用户与接收端，localStorage可改全部状态 | PZ-SYS-01、PZ-REL-02、PZ-MSG-02、PZ-WLK-03：服务端身份授权 |
| GAP-02 | 好友拒绝/撤回/解除、防骚扰未完成 | PZ-REL-02、PZ-REL-03：对象状态、申请限频、拉黑 |
| GAP-03 | 精选跨城区，定位仅改地图中心，无附近重排 | PZ-MAP-05：补选区/附近排序，不称步行可达 |
| GAP-04 | filterPlaces有安静筛选，但真实地图无入口，四精选quiet均false | PZ-MAP-05：有字段证据再开放筛选 |
| GAP-05 | 好友presence引用虚构p1/p3，未叠加真实图 | PZ-WLK-03：多人版先绑定真实公共地点 |
| GAP-06 | 邀请到时仅标签推导，无完成/爽约/提前失效字段 | PZ-INV-03、D-03：不自动认定相遇 |
| GAP-07 | 单一modal替换帖子/名片，扫码成功关闭我的，无来源栈 | PZ-NAV-01：补返回来源契约 |
| GAP-08 | 档案仅姓名/品种/年龄/简介，新帖固定汪星人，无主人ID和多宠 | PZ-PET-02、D-01/02：先定身份与首批宠种 |
| GAP-09 | 评论无作者/时间，消息无时间/回执，帖子无删除审核 | PZ-FED-03、PZ-MSG-02：重建内容归属和投递 |
| GAP-10 | 码中me非全球身份，跨设备无绑定 | PZ-QR-03：真实名片令牌 |
| GAP-11 | 来源存在模型，详情无外部来源链接，T06以此为通过 | D-09：建议内置来源页 |
| GAP-12 | POI不是实勘入口，我已到达无到场验证 | PZ-MAP-01、PZ-MAP-04、D-07：区分资料/实勘/声明 |

## 地点资料抽查

本次重新打开[首都文明网狼垡报道](https://www.bjwmb.gov.cn/wmdt/dxq/10110050.html)（2025-10-09），支持独立宠物专区及证件要求，只证明当时报道。北京旅游网[合集](https://www.visitbeijing.com.cn/article/4OhGr6pqBtk)本轮返回503，不能重新确认老山/CKC全部规则。石景山区[携犬问答](https://www.bjsjs.gov.cn/gongkai/zwgkpd/ztzl/2025/wmyqyjs/cjwd/202603/t20260302_759176.shtml)正文日期为2026-06-22，与源码publishedAt一致；路径中的202603不应被误判为发布日期冲突。其余保留源码来源为历史依据，不宣称四点全部重新核实。查阅日期2026-09-05。


## 本轮文档检查记录

2026-09-05首轮：10份Markdown齐备；31个唯一需求编号，5项已实现、14项演示模拟、10项待开发、2项待确认；31项均有新增测试映射。原T01–T45逐项保留，AT-01–25全为待执行，D-01–11待确认。检查本地文件链接、表格列数、代码围栏及需求引用；5张Mermaid图完成文本结构检查，未进行图形渲染。本轮没有产品测试新增通过记录。Git跟踪文件差异为空，仅docs/product新增文档。

同日补充：增加[产品演示与页面说明](09-product-demo.md)，共11份Markdown（含README）；为各页面补充目的、入口、操作、状态和演示边界。正文整理阶段按用户当时要求暂停截图与图片填充，保留IMG-01–10等待用户材料。项目总览追加子文档索引；飞书正文采用完整基线，章节使用一级标题，子章节使用二级标题，保留表格和Mermaid图源。文档排版核查不计入产品测试通过数。

同日配图补充：收到用户提供的37张高清透明底PNG后，已按IMG-01–10编入产品演示与页面说明，补充页面状态、操作和演示边界图注，项目总览同步更新入口。原始文件保持不变，未重新采集产品截图；本次仅验证素材及文档保存，不增加产品测试通过数。
