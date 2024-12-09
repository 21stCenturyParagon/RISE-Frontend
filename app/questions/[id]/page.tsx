import { Suspense } from 'react'
import QuestionPageClient from '@/components/QuestionPageClient'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

// Use the specific Next.js 15 typing
type PageProps = {
  params: Promise<{ id: string }>
}

export default async function QuestionPage({ params }: PageProps) {
  // Await the params since they're now a Promise
  const resolvedParams = await params

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen">
        <div className="w-1/3 max-w-md">
          <DotLottieReact
            src="https://lottie.host/9290c9bb-b2b7-4460-8f64-c99423ae2ce8/Zs8Aq8WC9P.lottie"
            loop
            autoplay
          />
        </div>
      </div>
    }>
      <QuestionPageClient id={resolvedParams.id} />
    </Suspense>
  )
}