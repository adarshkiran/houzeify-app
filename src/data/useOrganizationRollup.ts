import { useCallback, useEffect, useRef, useState } from 'react'

/** Shared fetch lifecycle for company rollup screens — real API only. */
export function useOrganizationRollup<T>(
  organizationId: string | null,
  fetchSummary: (organizationId: string) => Promise<T>,
  describeError: (error: unknown) => string,
) {
  const [summary, setSummary] = useState<T | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchRef = useRef(fetchSummary)
  const describeRef = useRef(describeError)
  const requestIdRef = useRef(0)
  fetchRef.current = fetchSummary
  describeRef.current = describeError

  const reload = useCallback(() => {
    if (!organizationId) {
      requestIdRef.current += 1
      setSummary(null)
      setError(null)
      setLoading(false)
      return
    }
    const requestId = ++requestIdRef.current
    setLoading(true)
    setError(null)
    fetchRef
      .current(organizationId)
      .then(row => {
        if (requestId !== requestIdRef.current) return
        setSummary(row)
        setLoading(false)
      })
      .catch(err => {
        if (requestId !== requestIdRef.current) return
        setSummary(null)
        setError(describeRef.current(err))
        setLoading(false)
      })
  }, [organizationId])

  useEffect(() => {
    reload()
    return () => {
      requestIdRef.current += 1
    }
  }, [reload])

  return { summary, loading, error, reload }
}
