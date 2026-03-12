import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const AutomationPage = () => {
  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <div className="mx-auto grid w-full max-w-5xl gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">Automation Queue</h2>
          <Badge variant="outline">v1</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          This v1 scaffold reserves the automation surface for scheduled agent tasks.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Planned</CardTitle>
              <CardDescription>Upcoming workflow automations.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              <p>Daily dependency check</p>
              <p>Branch health status digest</p>
              <p>PR review reminders</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl">
            <CardHeader>
              <CardTitle>Current behavior</CardTitle>
              <CardDescription>What is already available in this scaffold.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm text-muted-foreground">
              <p>UI-only placeholder in this scaffold.</p>
              <p>No background cron job or queue runner yet.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
