# 肥鱼LINK（fat-fish-link）安装说明

这份说明写给**另一台电脑上的 AI 助手**：把本目录整个拷到那台机器后，按下面的步骤安装即可。这是一个 DeepSeek Harness（DSH）Web 的**展示型客户端皮肤插件**，本地目录安装，不需要 npm 发布，也**不需要在目标机器上构建**（`lib/` 已经是构建产物，随目录一起拷过来）。

## 0. 先确认这是什么

- 本目录就是一个可安装的 DSH 插件包：`package.json` + `skin.json` + `cordis.patch.yml` + `lib/`（构建产物）+ `assets/`（美术资源）+ `locale/`。
- 它只改界面外观，不注入服务、不发出事件、不触达模型请求。
- **不要**在目标机器上执行 `npm install` / `npm run build`：构建脚本引用的是源码仓库里的 `../scripts/*.mjs`，本目录不含它们；`lib/` 已经建好，直接装即可。

## 1. 放置目录

把本目录放在一个**不会被移动或删除**的位置，例如：

- Windows：`C:\dsh-skins\fat-fish-link`
- macOS / Linux：`~/dsh-skins/fat-fish-link`

宿主以**引用**方式记录这个目录（不会复制一份到别处），所以装完之后不要再移动或删除它。

## 2. 前置检查

```sh
dsh --version
dsh plugin --profile web list
```

- DSH 版本要求：`>=0.1.7-rc.1` 且 `<0.3.0-0`。低于 `0.1.7-rc.1` 请先升级 DSH；更高的小版本会被宿主自动停用皮肤，可在装好后用第 6 节的方法手动放行。
- profile 名默认按 `web` 写；如果那台机器用的是别的 profile，替换成实际的 profile 名。
- 如果列表里**没有** `@smalltailqwq/dsh-client-ui-skin-deep-whale-manager`，建议先装皮肤管理器（它负责多套皮肤之间的互斥切换）：

```sh
dsh plugin --profile web add '@smalltailqwq/dsh-client-ui-skin-deep-whale-manager'
```

## 3. 安装

```sh
# 用本目录的绝对路径（Windows 正斜杠反斜杠都行）
dsh plugin --profile web add 'C:\dsh-skins\fat-fish-link'
```

- **必须写路径，不要只写目录名**：`dsh plugin add fat-fish-link` 会被当成 npm 包名去下载，结果 404。
- 相对路径要以 `./` 或 `../` 开头，并且是相对于**运行 dsh 命令时所在的目录**；路径算错时命令不报错，但皮肤不会生效——所以这里统一要求写绝对路径。

## 4. 重启一次 DSH

皮肤是通过宿主启动时的插件清单加载的，安装后需要**重启 DSH 进程**一次（不是刷新页面）。

## 5. 选择皮肤

重启后打开「设置 → 皮肤管理（Skins）」，点「肥鱼LINK」的「切换」。

- 如果这台机器上装了**多套**皮肤（例如同时有深海女仆工坊、虎鲸链路），首次重启后界面仍是**官方默认**，这是正常的：管理器会先把互斥的皮肤全部关掉，等你选一套。之后切换即时生效，只需刷新页面。
- 判断当前生效的是哪一套：在页面控制台执行 `document.body.hasAttribute('data-dsh-fat-fish-link')`，返回 `true` 即为本皮肤。

## 6. 验证清单

装好后应看到（缺哪条就按第 7 节排查）：

1. 侧栏配色是暖白底 + 深海蓝强调；暗色主题下是深海夜色 + 亮蓝强调；
2. 界面**全直角**：按钮、输入框、卡片、菜单、弹窗都没有圆角；
3. 首页/对话区背景是一张 16:9 场景图（亮色＝白色机械舱里的蓝发女仆，暗色＝夜间书房），任务开始后场景交叉淡化成「工作态」；
4. 侧栏顶部**没有**状态小人窗口，工作区与会话列表从词标下方**整列铺满**；
5. 侧栏词标旁有方形信号点（`LINK ACTIVE`）与峰谷定价红绿灯；
6. 官方图标被重绘成直线图形；
7. 「设置 → 皮肤管理」里，`肥鱼LINK`、`深海女仆工坊`、`虎鲸链路`三套并列，且只有一套处于启用状态。

## 7. 故障排查

| 现象 | 原因与处理 |
|---|---|
| 装完什么都没变 | 没重启 DSH；或插件没真的装进当前 profile（`dsh plugin --profile web list` 确认）；或路径写错 |
| 「设置 → 皮肤管理」里看不到本皮肤 | 目录里缺 `skin.json`，或 `skin.json` 与 `package.json` 的名字对不上；确认拷目录时没漏文件 |
| 皮肤显示为「已停用 / 版本不兼容」 | 目标机器的 DSH 版本在 `>=0.1.7-rc.1 <0.3.0-0` 之外。在皮肤管理器里按精确版本手动放行，或命令行：`dsh plugin --profile web allow-version @smalltailqwq/dsh-client-ui-skin-fat-fish-link@<皮肤版本> --dsh-version <DSH 版本> --accept-risk` |
| 界面错乱、几套皮肤样式叠在一起 | 多套皮肤同时启用。打开皮肤管理选一套（或点「官方默认」）后刷新；管理器在启动时会兜底把并存的皮肤全部关掉 |
| 图片不显示（背景是纯色） | `assets/runtime/` 或 `assets/runtime/manifest.json` 缺失，或只拷贝了 `lib/client.js` 而漏了 `lib/index.js` 与 `assets/`。发布/拷贝时必须整目录一起搬 |
| 桌面/任务栏图标还是旧图标 | 桌面快捷方式图标由皮肤管理器按皮肤切换时写入，切换一次皮肤或重新固定快捷方式即可 |

## 8. 卸载

```sh
dsh plugin --profile web remove '@smalltailqwq/dsh-client-ui-skin-fat-fish-link'
```

卸载后刷新页面即恢复官方界面；如果之前用皮肤管理器切换过，建议在皮肤管理里点一次「官方默认」再卸载。

## 9. 许可与来源

代码 MIT；美术资源 CC BY-NC-SA 4.0（署名、非商业、相同方式共享）。署名链与来源见同目录的 `NOTICE`、`LICENSE`、`LICENSE-ARTWORK`。
