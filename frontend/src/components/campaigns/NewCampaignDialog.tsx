import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { useCreateCampaign } from '@/hooks/useCampaigns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  body: z.string().min(1, 'Body is required'),
  audience_id: z.string().min(1, 'Audience is required'),
})

type CampaignFormValues = z.infer<typeof campaignSchema>

export function NewCampaignDialog() {
  const [open, setOpen] = useState(false)
  const createMutation = useCreateCampaign()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
  })

  const onSubmit = handleSubmit(async (values) => {
    await createMutation.mutateAsync(values)
    reset()
    setOpen(false)
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          New Campaign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Campaign</DialogTitle>
          <DialogDescription>Create a draft campaign. You can send it once it's ready.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Spring Launch" {...register('name')} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Welcome to the family" {...register('subject')} />
            {errors.subject && <p className="text-sm text-destructive">{errors.subject.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="audience_id">Audience ID</Label>
            <Input id="audience_id" placeholder="aud_123" {...register('audience_id')} />
            {errors.audience_id && <p className="text-sm text-destructive">{errors.audience_id.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea id="body" placeholder="Write your email..." rows={4} {...register('body')} />
            {errors.body && <p className="text-sm text-destructive">{errors.body.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
