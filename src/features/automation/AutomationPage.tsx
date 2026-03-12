export const AutomationPage = () => {
  return (
    <section className="page">
      <h2>Automation Queue</h2>
      <p>
        This v1 scaffold reserves the automation surface for scheduled agent tasks.
      </p>

      <div className="grid grid-two">
        <article className="card">
          <h3>Planned</h3>
          <small>Daily dependency check</small>
          <small>Branch health status digest</small>
          <small>PR review reminders</small>
        </article>

        <article className="card">
          <h3>Current behavior</h3>
          <small>UI-only placeholder in this scaffold.</small>
          <small>No background cron job or queue runner yet.</small>
        </article>
      </div>
    </section>
  )
}
