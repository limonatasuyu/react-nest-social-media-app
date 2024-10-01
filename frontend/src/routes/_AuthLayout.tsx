import { Outlet, createFileRoute } from '@tanstack/react-router'
import background from '/background.jpg'

export const Route = createFileRoute('/_AuthLayout')({
  component: LayoutComponent,
})

function LayoutComponent() {
  return (
    <div className="w-screen h-screen flex justify-center items-center" style={{ background: `url(${background})`, backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>
      <Outlet />
    </div>
  )
}
