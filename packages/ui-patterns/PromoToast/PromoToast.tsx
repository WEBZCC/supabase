'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { cn } from 'ui/src/lib/utils/cn'
import { Button } from 'ui/src/components/Button/Button'
import { LOCAL_STORAGE_KEYS } from 'common'
// import CountdownComponent from 'ui/src/layout/banners/LW12CountdownBanner/Countdown'
// import announcement from 'ui/src/layout/banners/data/Announcement.json'
import { useTheme } from 'next-themes'

const LW12BGDark =
  'https://xguihxuzqibwxjnimxev.supabase.co/storage/v1/object/public/images/launch-week/lw12/assets/bg-dark.svg?t=2024-07-26T09%3A59%3A25.373Z'
const LW12BGLight =
  'https://xguihxuzqibwxjnimxev.supabase.co/storage/v1/object/public/images/launch-week/lw12/assets/bg-light.svg?t=2024-07-26T09%3A59%3A25.373Z'

const PromoToast = () => {
  const [visible, setVisible] = useState(false)
  const { resolvedTheme } = useTheme()
  const bgImage = resolvedTheme?.includes('dark') ? LW12BGDark : LW12BGLight

  useEffect(() => {
    const shouldHide =
      !localStorage?.getItem(LOCAL_STORAGE_KEYS.TELEMETRY_CONSENT) ||
      localStorage?.getItem(LOCAL_STORAGE_KEYS.HIDE_PROMO_TOAST) === 'true'

    if (!shouldHide) {
      setVisible(true)
    }
  }, [])

  const handleHide = () => {
    setVisible(false)
    localStorage?.setItem(LOCAL_STORAGE_KEYS.HIDE_PROMO_TOAST, 'true')
  }

  if (!visible) return null

  return (
    <div
      className={cn(
        'opacity-0 translate-y-3 transition-all grid gap-2 fixed z-50 bottom-4 right-4 sm:bottom-8 sm:right-8 w-[calc(100vw-2rem)] sm:w-[320px] bg-alternative hover:bg-alternative border border-default rounded p-6 shadow-lg overflow-hidden',
        visible && 'opacity-100 translate-y-0'
      )}
    >
      <p className="relative z-10 text-foreground flex flex-col text-xl w-full leading-7">
        Launch Week 12: Day 2
      </p>
      <div className="relative z-10 text-foreground-lighter flex flex-col text-sm w-full mb-2">
        Realtime Broadcast and Presence Authorization
        {/* <CountdownComponent date={new Date(announcement.launchDate)} showCard={false} /> */}
      </div>

      <div className="relative z-10 flex items-center space-x-2">
        <Button asChild type="secondary">
          <Link target="_blank" rel="noreferrer" href="https://supabase.com/launch-week#day-2">
            Learn more
          </Link>
        </Button>
        <Button type="default" onClick={handleHide}>
          Dismiss
        </Button>
      </div>
      <Image
        src={bgImage}
        alt=""
        fill
        sizes="100%"
        aria-hidden
        className="absolute not-sr-only object-cover z-0 inset-0 w-full h-auto"
      />
    </div>
  )
}

export default PromoToast
