import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './authState'
import { listCustomerProjects, type CustomerProjectListItem } from './projectCustomerApi'
import { useProjects } from './projectState'

export type CustomerProjectsStatus = 'idle' | 'loading' | 'loaded' | 'error'

interface CustomerProjectsContextValue {
  status: CustomerProjectsStatus
  projects: CustomerProjectListItem[]
  errorMessage: string | null
  refresh: () => Promise<void>
}

const CustomerProjectsContext = createContext<CustomerProjectsContextValue | null>(null)

export function CustomerProjectsProvider({ children }: { children: ReactNode }) {
  const { status: authStatus, user } = useAuth()
  const [status, setStatus] = useState<CustomerProjectsStatus>('idle')
  const [projects, setProjects] = useState<CustomerProjectListItem[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (authStatus !== 'authenticated' || !user) {
      setProjects([])
      setStatus('idle')
      return
    }
    setStatus('loading')
    setErrorMessage(null)
    try {
      const result = await listCustomerProjects()
      setProjects(result)
      setStatus('loaded')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unable to load shared projects right now.')
    }
  }, [authStatus, user])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const value = useMemo(() => ({ status, projects, errorMessage, refresh }), [status, projects, errorMessage, refresh])
  return createElement(CustomerProjectsContext.Provider, { value }, children)
}

export function useCustomerProjects(): CustomerProjectsContextValue {
  const ctx = useContext(CustomerProjectsContext)
  if (!ctx) throw new Error('useCustomerProjects must be used within CustomerProjectsProvider')
  return ctx
}

export function useProjectAudience(projectId: string | undefined): 'company' | 'customer' | 'invited' | 'unknown' {
  const { getProject } = useProjects()
  const customer = useCustomerProjects()
  if (!projectId) return 'unknown'
  if (getProject(projectId)) return 'company'
  const shared = customer.projects.find(p => p.id === projectId)
  if (shared?.customerStatus === 'active') return 'customer'
  if (shared?.customerStatus === 'invited') return 'invited'
  return 'unknown'
}

export function useSoleActiveCustomerProjectId(): string | undefined {
  const { projects } = useCustomerProjects()
  const active = projects.filter(p => p.customerStatus === 'active')
  return active.length === 1 ? active[0].id : undefined
}
