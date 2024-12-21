import { Suspense } from 'react'
import QuestionPageClient from '@/components/QuestionPageClient'
import LoadingAnimation from '@/components/LoadingAnimation'

// Use the specific Next.js 15 typing
type PageProps = {
  params: Promise<{ id: string }>
}

export default async function QuestionPage({ params }: PageProps) {
  const resolvedParams = await params

  return (
    <Suspense fallback={<LoadingAnimation />}>
      <QuestionPageClient id={resolvedParams.id} />
    </Suspense>
  )
}