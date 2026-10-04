# fat-fish-link · 肥鱼LINK

DeepSeek Harness Web GUI 的肥鱼LINK皮肤：蓝色大肥鱼版的机能界面——暖白亮色配深海蓝点缀、全直角、官方图标库在运行时重绘为直线图形，侧栏整列铺满。纯展示层客户端插件——`apply()` 设置 `data-dsh-fat-fish-link` 作用域并管理可回收装饰层、动效监听、图标重绘层、场景层、页面图标（favicon 与 Web App manifest 图标）与标题；effect 销毁器还原全部 CSS/DOM 写入；不注入服务、不发出 Cordis 事件、不触达模型请求。

## 特性

- **两组 16:9 场景**：亮色为白色机械舱、暗色为夜间书房；各自区分空态与工作态，任务开始后以 640ms 交叉淡化切换
- **侧栏整列铺满**：不再为角色舞台预留高度，工作区与会话列表从词标下方直接铺开
- **深海蓝配色**：暖奶白底 + 深海蓝强调色；暗色为深海夜色 + 亮蓝强调；两套主题的正文对比度均在 WCAG AA 以上
- **全局直角契约**：按钮、输入框、卡片、菜单、弹窗、提示、标签、头像、滚动条及伪元素统一归零圆角，跨主题生效，并保留第三方插件席位的原始圆角
- **直线重绘图标**：官方图标库的图形在运行时重绘为仅由水平线、垂直线、45 度折线与实心方块构成的图形；宿主 SVG 节点不销毁，卸载即还原
- **机能标注层**：缝线标尺、刻度带、切角面板、终端光标、`ORCA` 式扫描词标、`STANDBY` 遥测行、`LINK ACTIVE` 方形信号点与峰谷定价红绿灯（北京时间）
- **输入框动效**：上滚收起、只在底部显示、拖拽手柄三种行为，各自独立开关
- **启动失败页**：内核启动失败时以皮肤自己的双栏版式装饰原生错误报告；皮肤自身未加载时保留原生页面
- **图片随包分发**：由皮肤自己的同源路由 `/skin-assets/fat-fish-link/<sha256>.webp` 提供，激活不依赖任何远程 URL 或 CDN

## 与其它皮肤的关系

本皮肤是仓库里的第三套皮肤，与 `maid-atelier`（深海女仆工坊）、`orca-link`（虎鲸链路）并列。三套皮肤**互斥**：同时安装时由皮肤管理器保证只有一套生效，在「设置 → 皮肤管理」里切换，切换后刷新页面即生效。界面外壳、图标重绘与整套交互派生自同作者的 `orca-link`。

## 安装

推荐连同皮肤管理器一起安装（`<路径>` 用绝对路径）：

```sh
dsh plugin --profile web add '@smalltailqwq/dsh-client-ui-skin-deep-whale-manager'
dsh plugin --profile web add <本目录的绝对路径>
```

首次安装后重启一次 DSH，然后在「设置 → 皮肤管理」中选择「肥鱼LINK」。装了多套皮肤时，首次重启仍显示官方界面属于正常现象：管理器会先把互斥的皮肤全部关掉，等你选择。加载即生效、卸载即复原（`wiring.id` 为 `ui-skin-fat-fish-link`）。

从别的机器拷过来的副本同样按上面的方式安装：把本目录放在一个不会被移动或删除的位置（宿主以引用方式记录该目录），先在前一台机器上跑过 `npm run build`（`lib/` 是提交型产物，拷走时需一并带上）。

## 开发与构建

```sh
npm install            # 或 pnpm install
npm run build          # prepare-skin-assets → tsdown → write-skin-build
npm test               # vitest
```

`npm run build` 依次：扫描 `src/client/*.ts` 里的 `skinAssetUrl('<hash>.<ext>')` 生成并校验 `assets/runtime/manifest.json`；用 `tsdown` 构建 node 半边与浏览器半边；生成覆盖 `lib/`、`cordis.patch.yml`、`skin.json` 与全部运行时图片的 `skin.build.json` 指纹。替换素材的方式见 `docs/asset-delivery.md`：把新图片写入 `assets/runtime/<sha256>.<png|webp>`（文件名必须是内容的 SHA-256），改掉 `art.ts` 里的引用，再跑一次构建。

## 素材来源与许可

本皮肤代码采用 **MIT**；美术资源保留原作者版权与既有 **CC BY-NC-SA 4.0** 授权（署名、非商业、相同方式共享），禁止商业性使用。署名链见 `NOTICE`，许可正文见 `LICENSE` 与 `LICENSE-ARTWORK`。
