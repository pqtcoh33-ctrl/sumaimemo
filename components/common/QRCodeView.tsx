'use client'

import { useEffect, useRef } from 'react'
import QRCode from 'qrcode'

export default function QRCodeView({
  value,
  size = 200,
}: {
  value: string
  size?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current) return

    QRCode.toCanvas(canvasRef.current, value, {
      width: size,
      margin: 2,
    })
  }, [value, size])

  return <canvas ref={canvasRef} />
}
