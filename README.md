# dsh-stats-init

给 DeepSeek Harness（DSH）用的统计学科研项目初始化插件：把 `stats-init` skill 注册进 Harness，让**同一 profile 下的所有项目和会话**都能用 `/stats-init`，不依赖某个项目目录。

版本：1.0.0

## 它做什么

`/stats-init` 在项目根目录建立：

```text
<项目根>/
├── code/          # 分析代码、模拟、可复现脚本（文件用 01_ 前缀）
├── result/        # 图表、表格、数值结果（文件用 01_ 前缀）
├── doc/           # 论文、笔记、推导、审稿材料（文件用 01_ 前缀）
├── materials/     # 外部获取的文献、数据（保留原名，不编号）
├── idea.md        # 主灵感（M）/ 次灵感（L）
├── notation.md    # 符号表：四类分节，四列
├── main_log.md    # 节点操作日志
├── index.md       # 文件索引
├── thm_index.md   # 定理 / 命题索引
└── command.md     # 给 agent 的项目使用指南
```

- `idea.md`：主灵感 M / 次灵感 L 两段，条目追加到段尾。
- `notation.md`：集合 / 随机变量 / 参数 / 算子四节，四列 `符号 | 含义 | 宏键 | 出处`。
- `main_log.md`：`YYYY-MM-DD HH:MM | 操作 | 产出/结果`，只记实际执行的节点操作。
- `index.md`：按四个目录分节的文件索引。
- `thm_index.md`：定理 / 命题的陈述与证明位置，不抄证明。
- `command.md`：给 agent 的项目手册，初始化时直接写入完整内容。

## 使用

```text
/stats-init
/stats-init D:\research\my-project
/stats-init D:\research\my-project --dry-run
```

- 不写目录：使用当前工作目录。
- `--dry-run`：只列出将新建的项，不写磁盘。
- 已存在的目录和文件保留，不覆盖；重复执行只补缺失项。

## 安装

需要 DSH 的 profile 机制（`dsh` 0.2.x 或更高）。

1. 在 DSH 会话里用插件管理器安装，`target` 指向本目录：

   ```text
   plugin_manager action=install_bundle target="<本目录的绝对路径>"
   ```

   返回 `application: applied` 即安装并启用。

2. 安装会把本包链接进当前 profile 的 `dsh.profile.bundles`，重启 DSH 后仍在。

3. 如果返回 `application: failed` 且诊断为热启用路径问题，重启 DSH；启动时 profile 会重新加载 bundle。

4. 验证：新建一个不在本包目录下的项目，开新会话输入 `/stats-init`，或让模型列出 skill 目录。

## 卸载

```text
plugin_manager action=remove_bundle target="dsh-stats-init"
```

## 组成

```text
dsh-stats-init/
├─ package.json        # dsh.bundle.patch 指向 patch
├─ cordis.patch.yml    # 往 Loader 树插入一行插件
├─ lib/index.js        # apply 时读 skill/SKILL.md 并注册到 ctx.skills
├─ README.md
└─ skill/              # 运行时 skill
   ├─ SKILL.md
   ├─ scripts/init.mjs
   └─ templates/command.md
```

`lib/index.js` 在插件加载时读取 `skill/SKILL.md`，拆 frontmatter 与正文，把 `resourceBase` 指向 `skill/`，然后调用 `ctx.skills.register`。SKILL.md 里引用的 `scripts/`、`templates/` 相对路径都落在 `skill/` 下。

**插件不含示例与冒烟测试。** 示例项目 `examples/demo/` 和 `scripts/smoke-test.sh` 只在源码 `skills/stats-init/` 里，用于开发与文档，不随插件分发。

## 开发

`skill/` 是源码 `skills/stats-init/` 的运行时拷贝：只保留 `SKILL.md`、`scripts/init.mjs`、`templates/command.md`，不含示例与冒烟测试。改源码后同步这三项，再重载插件或重启 DSH。

## 依赖

- DSH，且启用了 `skills` 服务（默认启用）。
- 运行 `skill/scripts/init.mjs` 需要 Node.js 18+。

## 常见问题

**装了但看不到 `/stats-init`？**
- 确认当前项目里没有同名 skill 覆盖它：项目级 `.dsh/skills/stats-init` 优先级更高。
- 确认已重启 DSH。
- 确认 profile 的 `package.json` 里有 `dsh-stats-init`。

**改 skill 内容要重启吗？**
插件的 skill 正文在 `apply` 时读取一次；改 `skill/` 后需要重载插件或重启 DSH。

**会覆盖已有项目文件吗？**
不会。`init.mjs` 只补缺失项，已有文件原样保留。

**插件里有示例吗？**
没有。示例与冒烟测试在源码目录，不随插件分发。
