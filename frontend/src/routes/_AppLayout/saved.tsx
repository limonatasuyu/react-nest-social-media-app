import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_AppLayout/saved')({
  component: () => <div>Hello /_AppLayout/saved!</div>,
})
