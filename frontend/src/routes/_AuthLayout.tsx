import { Outlet, createFileRoute } from '@tanstack/react-router'
//import background from '/background.jpg'

export const Route = createFileRoute('/_AuthLayout')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
      <Outlet />
   
  )
}
