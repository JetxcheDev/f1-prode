"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          background: 'hsl(0 84% 60%)',
          border: '1px solid hsl(0 84% 50%)',
          color: 'white',
        },
        className: 'f1-toast',
      }}
      style={
        {
          "--normal-bg": "hsl(0 84% 60%)",
          "--normal-text": "white",
          "--normal-border": "hsl(0 84% 50%)",
          "--success-bg": "hsl(142 76% 36%)",
          "--success-text": "white",
          "--success-border": "hsl(142 76% 30%)",
          "--error-bg": "hsl(0 84% 60%)",
          "--error-text": "white",
          "--error-border": "hsl(0 84% 50%)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
