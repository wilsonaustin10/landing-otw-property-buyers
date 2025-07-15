import React from 'react'
import { CheckCircle } from 'lucide-react'

interface BenefitsProps {
  className?: string;
}

export function Benefits({ className }: BenefitsProps) {
  const benefits = [
    "We buy houses in any condition",
    "No obligation offer",
    "No fees",
    "Confidential",
    "No repairs necessary",
    "We pay closing costs"
  ]

  return (
    <div className={`max-w-3xl mx-auto my-8 sm:my-12 md:my-16 px-4 text-center ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {benefits.map((benefit, index) => (
          <div key={index} className="flex flex-col items-center justify-center space-y-2 text-base sm:text-lg md:text-xl font-bold">
            <div className="relative">
              <CheckCircle className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-secondary stroke-[3] drop-shadow-[0_0_6px_rgba(255,107,107,0.6)]" />
            </div>
            <span className="text-white text-lg sm:text-xl md:text-2xl font-bold px-2">{benefit}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

