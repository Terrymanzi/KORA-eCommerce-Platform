"use client"
import { X } from "lucide-react"
import { useToast } from "./use-toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col items-end gap-2 p-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${
            toast.visible ? "animate-enter" : "animate-leave"
          } flex w-full max-w-md items-center justify-between rounded-lg border ${
            toast.variant === "destructive" ? "border-red-200 bg-red-50" : "border-gray-200 bg-white"
          } p-4 shadow-md`}
        >
          <div className="flex-1">
            {toast.title && (
              <h3 className={`font-medium ${toast.variant === "destructive" ? "text-red-900" : "text-gray-900"}`}>
                {toast.title}
              </h3>
            )}
            {toast.description && (
              <p className={`mt-1 text-sm ${toast.variant === "destructive" ? "text-red-700" : "text-gray-700"}`}>
                {toast.description}
              </p>
            )}
          </div>
          <button
            onClick={() => dismiss(toast.id)}
            className={`ml-4 inline-flex h-6 w-6 items-center justify-center rounded-md ${
              toast.variant === "destructive"
                ? "text-red-500 hover:bg-red-100 hover:text-red-700"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      ))}
    </div>
  )
}

