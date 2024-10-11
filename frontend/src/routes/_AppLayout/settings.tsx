import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_AppLayout/settings')({
  component: () => <div>Hello /_AppLayout/settings!</div>,
})
