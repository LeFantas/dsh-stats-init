#!/usr/bin/env node
/**
 * stats-init — 建立统计学科研项目的标准骨架。
 *
 *   node init.mjs [项目根目录] [--dry-run]
 *
 * 规则：
 * - 缺什么建什么；已存在的目录和文件原样保留，绝不覆盖。
 * - 只建 4 个目录和 6 个 md，不额外添加文件。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILL_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

const USAGE = `用法: node init.mjs [项目根目录] [--dry-run]

  项目根目录   默认为当前工作目录
  --dry-run    只显示将要做的事，不写磁盘
  -h, --help   显示本帮助`;

const DIRS = ['code', 'result', 'doc', 'materials'];

// 顺序沿用用户给出的顺序：idea, notation, main_log, index, thm_index；command 追加在末尾。
const FILES = [
  ['idea.md', [
    '<!--',
    'idea.md · 未成熟 / 未形式化的想法。',
    '主灵感编号 M-xx，次灵感编号 L-xx；新条目追加到对应段末尾，不插队、不重排。',
    '条目格式：',
    '## YYYY-MM-DD | M-01',
    '- 短灵感：一句话',
    '- 扩展说明：动机；形式化表述；可能的方法 / 定理；验证方式；风险',
    '- 状态：待验证 / 进行中 / 已否证 / 已成文',
    '-->',
    '',
    '# 主灵感（M）',
    '',
    '# 次灵感（L）',
    '',
  ].join('\n')],
  ['notation.md', [
    '<!--',
    'notation.md · 符号的形式化定义与使用约定。',
    '四列固定：符号 | 含义 | 宏键 | 出处。',
    '符号列用 $...$ 包住完整 LaTeX；宏键只写 .tex 简写，无宏填 —。',
    '长定义在表下方用 (N1)、(N2)… 编号公式块展开，单元格写“见式 (N1)”。',
    '新符号追加到对应类型表的末尾；本项目新增宏定义见文末。',
    '与预设约定冲突时以本文件为准，在对应表下加“备注：”。',
    '-->',
    '',
    '# 记号表',
    '',
    '## 一、集合类',
    '',
    '| 符号 | 含义 | 宏键 | 出处 |',
    '| --- | --- | --- | --- |',
    '',
    '## 二、随机变量类',
    '',
    '| 符号 | 含义 | 宏键 | 出处 |',
    '| --- | --- | --- | --- |',
    '',
    '## 三、参数类',
    '',
    '| 符号 | 含义 | 宏键 | 出处 |',
    '| --- | --- | --- | --- |',
    '',
    '## 四、算子类',
    '',
    '| 符号 | 含义 | 宏键 | 出处 |',
    '| --- | --- | --- | --- |',
    '',
    '## 新增宏定义',
    '',
    '<!-- 只列相对于 stats-tex-macros 新增、且仅在本项目使用的宏；未新增时留空。 -->',
    '',
  ].join('\n')],
  ['main_log.md', [
    '<!--',
    'main_log.md · 节点操作日志。',
    '格式：YYYY-MM-DD HH:MM | 操作 | 产出/结果',
    '只记实际执行的操作，不记计划；同一事件的后续修订并入首条，不逐次记录。',
    '按时间升序追加；条目之间空一行。',
    '-->',
    '',
    '# 主日志',
    '',
  ].join('\n')],
  ['index.md', [
    '<!--',
    'index.md · 项目文件索引。',
    '按 code/、result/、doc/、materials/ 分节；每节一张表：路径 | 作用 | 性质。',
    'code/result/doc 内文件用 01_ 前缀；materials 保留原名。',
    '只索引内容文件；根目录六个记录文件、临时文件、编译中间产物不列入。',
    '新建、改名、移动、删除文件时同步更新本表。',
    '-->',
    '',
    '# 文件索引',
    '',
    '## code/',
    '',
    '| 路径 | 作用 | 性质 |',
    '| --- | --- | --- |',
    '',
    '## result/',
    '',
    '| 路径 | 作用 | 性质 |',
    '| --- | --- | --- |',
    '',
    '## doc/',
    '',
    '| 路径 | 作用 | 性质 |',
    '| --- | --- | --- |',
    '',
    '## materials/',
    '',
    '| 路径 | 作用 | 性质 |',
    '| --- | --- | --- |',
    '',
  ].join('\n')],
  ['thm_index.md', [
    '<!--',
    'thm_index.md · 定理与命题索引。',
    '四列：定理 | 定理内容 | 所在位置 | 证明所在位置。',
    '只记陈述与位置，不抄证明；新建或修改定理 / 命题时同步更新。',
    '-->',
    '',
    '# 定理索引',
    '',
    '| 定理 | 定理内容 | 所在位置 | 证明所在位置 |',
    '| --- | --- | --- | --- |',
    '',
  ].join('\n')],
  ['command.md', null],
];

const args = process.argv.slice(2);
let dryRun = false;
let targetArg = null;

for (const arg of args) {
  if (arg === '--dry-run' || arg === '-n') {
    dryRun = true;
  } else if (arg === '--help' || arg === '-h') {
    console.log(USAGE);
    process.exit(0);
  } else if (arg.startsWith('-')) {
    console.error(`未知选项: ${arg}\n\n${USAGE}`);
    process.exit(2);
  } else if (targetArg === null) {
    targetArg = arg;
  } else {
    console.error(`只能指定一个项目根目录，多余参数: ${arg}\n\n${USAGE}`);
    process.exit(2);
  }
}

const target = path.resolve(targetArg ?? process.cwd());
const createdDirs = [];
const keptDirs = [];
const createdFiles = [];
const keptFiles = [];
let createdRoot = false;

function fail(message) {
  console.error(`stats-init: ${message}`);
  process.exit(1);
}

let commandTemplate = null;
function readCommandTemplate() {
  if (commandTemplate !== null) return commandTemplate;
  const templatePath = path.join(SKILL_DIR, 'templates', 'command.md');
  if (!fs.existsSync(templatePath)) {
    fail(`缺少模板: ${templatePath}`);
  }
  commandTemplate = fs.readFileSync(templatePath, 'utf8');
  return commandTemplate;
}

function ensureDir(dir) {
  if (fs.existsSync(dir)) {
    if (!fs.statSync(dir).isDirectory()) {
      fail(`路径已存在但不是目录: ${dir}`);
    }
    return false;
  }
  if (!dryRun) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return true;
}

const targetExists = fs.existsSync(target);
if (targetExists) {
  if (!fs.statSync(target).isDirectory()) {
    fail(`目标路径不是目录: ${target}`);
  }
}

const commandContent = !dryRun && !(targetExists && fs.existsSync(path.join(target, 'command.md')))
  ? readCommandTemplate()
  : null;

if (!targetExists) {
  createdRoot = ensureDir(target);
}

for (const dir of DIRS) {
  const full = path.join(target, dir);
  if (ensureDir(full)) createdDirs.push(dir);
  else keptDirs.push(dir);
}

for (const [name, content] of FILES) {
  const full = path.join(target, name);
  if (fs.existsSync(full)) {
    if (!fs.statSync(full).isFile()) {
      fail(`同名路径已存在但不是普通文件: ${full}`);
    }
    keptFiles.push(name);
  } else {
    if (!dryRun) {
      fs.writeFileSync(full, content ?? commandContent, 'utf8');
    }
    createdFiles.push(name);
  }
}

const newLabel = dryRun ? '将新建' : '新建';
const keptLabel = '保留';
const status = new Map();
for (const dir of createdDirs) status.set(`${dir}/`, newLabel);
for (const dir of keptDirs) status.set(`${dir}/`, keptLabel);
for (const name of createdFiles) status.set(name, newLabel);
for (const name of keptFiles) status.set(name, keptLabel);

const entries = [...DIRS.map((dir) => `${dir}/`), ...FILES.map(([name]) => name)];
const width = Math.max(...entries.map((entry) => entry.length));

console.log(`stats-init → ${target}`);
if (dryRun) console.log('（dry-run：只显示计划，未写入磁盘）');
if (createdRoot) console.log('（项目根目录不存在，将一并创建）');
console.log('');

const lines = [`${path.basename(target)}/`];
entries.forEach((entry, index) => {
  const last = index === entries.length - 1;
  const label = status.get(entry);
  lines.push(`${last ? '└──' : '├──'} ${entry.padEnd(width)}  ${label}`);
});
console.log(lines.join('\n'));
console.log('');

const parts = [`${newLabel} ${createdDirs.length} 个目录、${createdFiles.length} 个文件`];
const keptCount = keptDirs.length + keptFiles.length;
if (keptCount > 0) parts.push(`保留 ${keptCount} 项已有内容`);
console.log(parts.join('；') + '。');

if (createdFiles.length === 0 && keptCount === DIRS.length + FILES.length) {
  console.log('项目骨架已完整，未做任何改动。');
} else if (createdFiles.length > 0) {
  console.log('下一步：先填 idea.md 与 notation.md，其余按研究进展补充。');
}
