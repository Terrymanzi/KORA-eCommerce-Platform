"use client"

// Adapted from shadcn/ui toast component
import { useState, useCallback } from "react"

type ToastProps = {
  title?: string
  description?: string
  variant?: "default" | "destructive"
  duration?: number
}

type Toast = ToastProps & {
  id: string
  visible: boolean
}

type ToastContextType = {
  toast: (props: ToastProps) => void
  dismiss: (id: string) => void
  toasts: Toast[]
}

// Simple implementation without context for this example
export function useToast(): ToastContextType {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((props: ToastProps) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: Toast = {
      id,
      visible: true,
      duration: 5000,
      variant: "default",
      ...props,
    }

    setToasts((prev) => [...prev, newToast])

    // Auto dismiss after duration
    setTimeout(() => {
      dismiss(id)
    }, newToast.duration)

    return id
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: false } : t)))

    // Remove from array after animation
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 300)
  }, [])

  return { toast, dismiss, toasts }
}

