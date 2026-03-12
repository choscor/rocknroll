import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '../../state/app-store-context'

export const SkillsPage = () => {
  const { state, actions } = useAppStore()

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <div className="mx-auto grid w-full max-w-5xl gap-4">
        <h2 className="text-2xl font-semibold">Skills</h2>
        <p className="text-sm text-muted-foreground">
          Enable or disable skills to customize your agent capabilities.
        </p>

        <div className="grid gap-3">
          {state.skills.map((skill) => (
            <Card key={skill.id} className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {skill.name}
                  <Badge variant={skill.enabled ? 'default' : 'outline'}>
                    {skill.enabled ? 'On' : 'Off'}
                  </Badge>
                </CardTitle>
                <CardDescription>{skill.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button
                  type="button"
                  variant={skill.enabled ? 'secondary' : 'outline'}
                  onClick={() => void actions.toggleSkill(skill.id, !skill.enabled)}
                >
                  Turn {skill.enabled ? 'Off' : 'On'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
