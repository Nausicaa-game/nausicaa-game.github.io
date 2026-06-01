import { useEffect, useRef } from 'react'

const TWO_PI = Math.PI * 2
const HALF_PI = Math.PI / 2

function bezierSkin(ctx: CanvasRenderingContext2D, bez: number[], closed = true) {
  const avg: number[] = []
  const len = bez.length
  for (let i = 2; i < len; i++) {
    avg.push((bez[i - 2] + bez[i]) / 2)
  }
  avg.push((bez[0] + bez[len - 2]) / 2, (bez[1] + bez[len - 1]) / 2)

  if (closed) {
    ctx.moveTo(avg[0], avg[1])
    for (let i = 2; i < len; i += 2) {
      ctx.quadraticCurveTo(bez[i], bez[i + 1], avg[i], avg[i + 1])
    }
    ctx.quadraticCurveTo(bez[0], bez[1], avg[0], avg[1])
  } else {
    ctx.moveTo(bez[0], bez[1])
    ctx.lineTo(avg[0], avg[1])
    for (let i = 2; i < len - 2; i += 2) {
      ctx.quadraticCurveTo(bez[i], bez[i + 1], avg[i], avg[i + 1])
    }
    ctx.lineTo(bez[len - 2], bez[len - 1])
  }
}

export default function WobbleCorner() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    const ctx = canvas.getContext('2d')!
    const w = () => window.innerWidth
    const h = () => window.innerHeight
    canvas.width = w()
    canvas.height = h()

    const bumpRadius = 100
    const halfBump = bumpRadius / 2
    const segments = 12
    const step = HALF_PI / segments

    const radii: number[] = []
    const thetaOff: number[] = []
    for (let i = 0; i < segments + 2; i++) {
      radii.push(Math.random() * bumpRadius - halfBump)
      thetaOff.push(Math.random() * TWO_PI)
    }

    let theta = 0
    let thetaRamp = 0
    const thetaRampDest = 12
    const rampDamp = 25

    function update() {
      thetaRamp += (thetaRampDest - thetaRamp) / rampDamp
      theta += 0.03

      const anchors: number[] = [0, 0]
      for (let i = 0; i <= segments + 2; i++) {
        const sine = Math.sin(thetaOff[i] + theta + thetaRamp)
        const rad = radii[i] * sine
        const x = rad * Math.sin(step * i)
        const y = rad * Math.cos(step * i)
        anchors.push(x, y)
      }

      ctx.save()
      ctx.translate(-10, -10)
      ctx.scale(0.5, 0.5)
      ctx.fillStyle = 'rgba(20, 20, 30)'
      ctx.beginPath()
      ctx.moveTo(0, 0)
      bezierSkin(ctx, anchors, false)
      ctx.lineTo(0, 0)
      ctx.fill()
      ctx.restore()
    }

    let animId = 0
    function loop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      update()
      animId = requestAnimationFrame(loop)
    }
    loop()

    function onResize() {
      canvas.width = w()
      canvas.height = h()
    }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 100,
        pointerEvents: 'none',
      }}
    />
  )
}
