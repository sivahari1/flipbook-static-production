import { DRMProtectionDemo } from '@/components/examples/DRMProtectionDemo'

export default function DRMProtectionDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <DRMProtectionDemo />
    </div>
  )
}

export const metadata = {
  title: 'DRM Protection Demo - FlipBook',
  description: 'Test and demonstrate the DRM protection features of FlipBook',
}