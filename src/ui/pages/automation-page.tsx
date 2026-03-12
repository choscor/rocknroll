export const AutomationPage = () => {
  return (
    <div style={{ padding: '24px', display: 'grid', gap: '16px', alignContent: 'start' }}>
      <h2 style={{ margin: 0, color: '#e0e0e8', fontSize: '1.4rem' }}>Automation Queue</h2>
      <p style={{ margin: 0, color: '#a0a0b8' }}>
        This v1 scaffold reserves the automation surface for scheduled agent tasks.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '14px',
      }}>
        <article style={{
          background: '#1e1e38',
          border: '1px solid #2a2a45',
          borderRadius: '12px',
          padding: '14px',
          display: 'grid',
          gap: '8px',
        }}>
          <h3 style={{ margin: 0, color: '#e0e0e8' }}>Planned</h3>
          <small style={{ color: '#a0a0b8' }}>Daily dependency check</small>
          <small style={{ color: '#a0a0b8' }}>Branch health status digest</small>
          <small style={{ color: '#a0a0b8' }}>PR review reminders</small>
        </article>

        <article style={{
          background: '#1e1e38',
          border: '1px solid #2a2a45',
          borderRadius: '12px',
          padding: '14px',
          display: 'grid',
          gap: '8px',
        }}>
          <h3 style={{ margin: 0, color: '#e0e0e8' }}>Current behavior</h3>
          <small style={{ color: '#a0a0b8' }}>UI-only placeholder in this scaffold.</small>
          <small style={{ color: '#a0a0b8' }}>No background cron job or queue runner yet.</small>
        </article>
      </div>
    </div>
  )
}
