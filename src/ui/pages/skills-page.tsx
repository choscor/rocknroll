import { useAppStore } from '../../state/app-store-context'

export const SkillsPage = () => {
  const { state, actions } = useAppStore()

  return (
    <div style={{ padding: '24px', display: 'grid', gap: '16px', alignContent: 'start' }}>
      <h2 style={{ margin: 0, color: '#e0e0e8', fontSize: '1.4rem' }}>Skills</h2>
      <p style={{ margin: 0, color: '#a0a0b8' }}>
        Enable or disable skills to customize your agent capabilities.
      </p>

      <div style={{
        display: 'grid',
        gap: '12px',
      }}>
        {state.skills.map((skill) => (
          <div
            key={skill.id}
            style={{
              background: '#1e1e38',
              border: '1px solid #2a2a45',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ color: '#e0e0e8', fontWeight: 600, fontSize: '0.9rem' }}>
                {skill.name}
              </div>
              <div style={{ color: '#a0a0b8', fontSize: '0.8rem', marginTop: '2px' }}>
                {skill.description}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void actions.toggleSkill(skill.id, !skill.enabled)}
              style={{
                padding: '5px 14px',
                borderRadius: '999px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: skill.enabled ? 'rgba(74, 222, 128, 0.15)' : 'rgba(248, 113, 113, 0.15)',
                color: skill.enabled ? '#4ade80' : '#f87171',
                minWidth: '60px',
              }}
            >
              {skill.enabled ? 'On' : 'Off'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
