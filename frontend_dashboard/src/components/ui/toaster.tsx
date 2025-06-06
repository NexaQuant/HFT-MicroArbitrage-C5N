"use client"

import * as React from "react"
import { Toaster as SonnerToaster } from "sonner"

type ToasterProps = React.ComponentProps<typeof SonnerToaster>

function Toaster({ ...props }: ToasterProps) {
  return <SonnerToaster {...props} />
}

export { Toaster }