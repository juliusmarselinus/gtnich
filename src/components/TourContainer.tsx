'use client'

import { useTour } from '@/context/TourContext'
import FeatureHighlightTour from '@/components/FeatureHighlightTour'

export default function TourContainer() {
  const { isTourOpen } = useTour()
  if (!isTourOpen) return null
  return <FeatureHighlightTour />
}
