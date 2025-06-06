import * as React from "react"
import { toast as sonnerToast } from "sonner"

type Toast = typeof sonnerToast

function useToast() {
  return {
    toast: sonnerToast,
  }
}

export { useToast, type Toast }