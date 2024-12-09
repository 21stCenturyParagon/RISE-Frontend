import { Suspense } from 'react'
import QuestionPageClient from '@/components/QuestionPageClient'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

// Update the params type to match Next.js expectations
interface PageProps {
  params: {
    id: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function QuestionPage({ params, searchParams }: PageProps) {
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
      <QuestionPageClient id={params.id} />
    </Suspense>
  )
}