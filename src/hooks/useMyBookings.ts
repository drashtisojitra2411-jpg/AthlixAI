import { useCallback, useEffect, useState } from 'react'
import * as bookingsApi from '@/lib/api/bookings'
import type { AppBooking, CreateBookingInput } from '@/lib/api/bookings'
import { ApiRequestError } from '@/lib/api/client'

interface UseMyBookingsResult {
  bookings: AppBooking[]
  loading: boolean
  error: string | null
  booking: boolean
  bookingError: string | null
  createBooking: (input: CreateBookingInput) => Promise<void>
  refetch: () => void
}

export function useMyBookings(): UseMyBookingsResult {
  const [bookings, setBookings] = useState<AppBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [booking, setBooking] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    bookingsApi
      .listMyBookings()
      .then((result) => {
        if (cancelled) return
        setBookings(result.items)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiRequestError ? err.message : 'Failed to load your tickets')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [reloadToken])

  const refetch = useCallback(() => setReloadToken((token) => token + 1), [])

  const createBooking = useCallback(
    async (input: CreateBookingInput) => {
      setBooking(true)
      setBookingError(null)
      try {
        await bookingsApi.createBooking(input)
        refetch()
      } catch (err) {
        setBookingError(err instanceof ApiRequestError ? err.message : 'Failed to confirm booking')
        throw err
      } finally {
        setBooking(false)
      }
    },
    [refetch],
  )

  return { bookings, loading, error, booking, bookingError, createBooking, refetch }
}
