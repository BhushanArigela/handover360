import React from 'react'
import { Check } from 'lucide-react'

const STEPS = [
  'Create Template', 'Add Floors', 'Rooms into Floors', 'Manage Rooms',
  'Sections into Room', 'Section Items', 'Custom Item', 'Preview',
]

export default function StepIndicator({ step, maxReached, onJump }) {
  return (
    <div className="stepper">
      {STEPS.map((label, i) => {
        const n = i + 1
        const state = n === step ? 'active' : n < step ? 'done' : ''
        const clickable = n <= maxReached
        return (
          <div
            key={label}
            className={`stepper-item ${state}`}
            style={{ cursor: clickable ? 'pointer' : 'default', opacity: clickable ? 1 : 0.5 }}
            onClick={() => clickable && onJump(n)}
          >
            {state === 'done' ? <Check size={12} /> : n}. {label}
          </div>
        )
      })}
    </div>
  )
}
