import QuestionPageClient from '@/components/QuestionPageClient'

interface PageProps {
  params: { id: string }
}

export default function QuestionPage({ params }: PageProps) {
  return <QuestionPageClient id={params.id} />
}

