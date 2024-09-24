'use client'

import { useFormStatus } from "react-dom"

export function SubmitButton(props: { label: string }) {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {props.label}
    </button>
  )
}
