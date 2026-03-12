import type { SkillService } from '../../repository/interfaces'
import {
  clone,
  err,
  ok,
  persistDatabase,
  type MockDatabase,
} from './mock-database'

export class MockSkillService implements SkillService {
  constructor(private readonly db: MockDatabase) {}

  async list() {
    return ok(clone(this.db.skills))
  }

  async toggle(skillId: string, enabled: boolean) {
    const skill = this.db.skills.find((s) => s.id === skillId)
    if (!skill) {
      return err('SKILL_NOT_FOUND', `Skill ${skillId} does not exist.`)
    }

    skill.enabled = enabled
    persistDatabase(this.db)
    return ok(clone(skill))
  }
}
