import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const packageMeta = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
const skillDir = process.env.STATS_INIT_SKILL_DIR
  ? path.resolve(process.env.STATS_INIT_SKILL_DIR)
  : path.join(packageRoot, 'skill');
const skillFile = path.join(skillDir, 'SKILL.md');

function loadSkill() {
  const raw = fs.readFileSync(skillFile, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta = {};
  let content = raw;

  if (match) {
    content = raw.slice(match[0].length);
    for (const line of match[1].split(/\r?\n/)) {
      const field = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
      if (field) meta[field[1]] = field[2].trim();
    }
  }

  return {
    name: meta.name || 'stats-init',
    description: meta.description || '初始化统计学科研项目骨架。',
    whenToUse: meta.whenToUse,
    content: content.replace(/^\n+/, ''),
    path: skillFile,
    source: 'bundled',
    resourceBase: { kind: 'directory', path: skillDir },
    invocation: { modelInvocable: true, userInvocable: true },
    metadata: { package: packageMeta.name, version: packageMeta.version },
  };
}

export const name = 'dsh-stats-init';
export const inject = ['skills'];

export function apply(ctx) {
  // 服务注册本身就是 effect，插件卸载时会自动撤销。
  ctx.skills.register(loadSkill());
}
