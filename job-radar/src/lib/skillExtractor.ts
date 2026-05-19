import type { SkillEntry } from '../types'
import { SKILL_DICTIONARY } from '../constants/skillDictionary'

function buildPattern(alias: string, shortAlias: boolean): RegExp {
  // Short aliases or ones that might appear in other words → use word boundaries
  if (shortAlias || alias.length < 4) {
    return new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
  }
  return new RegExp(alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
}

function matchesSkill(text: string, entry: SkillEntry): boolean {
  return entry.aliases.some((alias) => buildPattern(alias, entry.shortAlias).test(text))
}

export function extractSkills(text: string, dictionary: SkillEntry[] = SKILL_DICTIONARY): string[] {
  return dictionary
    .filter((entry) => matchesSkill(text, entry))
    .map((entry) => entry.canonical)
}
