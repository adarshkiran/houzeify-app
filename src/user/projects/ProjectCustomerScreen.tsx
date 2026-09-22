import { useEffect, useState } from 'react'
import Sidebar from '@/shared/components/Sidebar'
import ProjectSubNav from '@/shared/components/ProjectSubNav'
import {
  describeCustomerError,
  getProjectCustomer,
  inviteProjectCustomer,
  removeProjectCustomer,
  type ProjectCustomer,
} from '@/data/projectCustomerApi'
import { useProjects } from '@/data/projectState'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

export default function ProjectCustomerScreen({
  projectId,
  projectName,
  onNavigate,
}: {
  projectId?: string
  projectName?: string
  onNavigate: (screen: string, data?: Record<string, string>) => void
}) {
  const { getProject } = useProjects()
  const project = projectId ? getProject(projectId) : undefined
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [customer, setCustomer] = useState<ProjectCustomer | null>(null)
  const [email, setEmail] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [confirmUnlink, setConfirmUnlink] = useState(false)

  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    setStatus('loading')
    getProjectCustomer(projectId)
      .then(row => {
        if (cancelled) return
        setCustomer(row)
        setStatus('loaded')
      })
      .catch(() => {
        if (cancelled) return
        setStatus('error')
      })
    return () => {
      cancelled = true
    }
  }, [projectId])

  async function onInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!projectId) return
    setBusy(true)
    setFormError(null)
    try {
      const row = await inviteProjectCustomer(projectId, email)
      setCustomer(row)
      setEmail('')
    } catch (err) {
      setFormError(describeCustomerError(err))
    } finally {
      setBusy(false)
    }
  }

  async function onUnlink() {
    if (!projectId) return
    setBusy(true)
    setFormError(null)
    try {
      await removeProjectCustomer(projectId)
      setCustomer(null)
      setConfirmUnlink(false)
    } catch (err) {
      setFormError(describeCustomerError(err))
    } finally {
      setBusy(false)
    }
  }

  const isHomeownerOwned = Boolean(project && !project.organizationId)

  return (
    <div className="flex flex-col relative" style={{ height: '100%', backgroundColor: '#FFFFFF' }}>
      <div className="flex flex-1 min-h-0 relative z-10">
        <Sidebar active="projects" onNavigate={onNavigate} />
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <ProjectSubNav active="customer" projectId={projectId} projectName={projectName} onNavigate={onNavigate} />
          <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-8">
            <div className="max-w-[560px] mx-auto flex flex-col gap-6 min-w-0">
              <div>
                <p className="text-[11px] tracking-[0.08em] uppercase text-[#722ED1] m-0 mb-1.5" style={{ fontFamily: FONT_MONO }}>Customer</p>
                <h1 className="text-[22px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{projectName ?? 'Project'}</h1>
                <p className="text-[13.5px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
                  Link one Houzeify homeowner so they can see published progress and shared documents.
                </p>
              </div>

              {isHomeownerOwned ? (
                <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
                  <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>You are the customer on this project.</p>
                  <p className="text-[13px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>Homeowner-owned projects are not linked to a separate customer account.</p>
                </div>
              ) : status === 'idle' || status === 'loading' ? (
                <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Loading customer…</p>
              ) : status === 'error' ? (
                <div className="rounded-[16px] bg-white p-5" style={{ border: '1px solid #E3DDD7' }}>
                  <p className="text-[14px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>Couldn’t load customer</p>
                  <p className="text-[13px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>Something went wrong fetching this project’s customer link. Try again in a moment.</p>
                  <button
                    type="button"
                    onClick={() => {
                      if (!projectId) return
                      setStatus('loading')
                      getProjectCustomer(projectId)
                        .then(row => {
                          setCustomer(row)
                          setStatus('loaded')
                        })
                        .catch(() => setStatus('error'))
                    }}
                    className="h-11 px-5 mt-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0"
                    style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
                  >
                    Retry
                  </button>
                </div>
              ) : customer ? (
                <div className="rounded-[16px] bg-white p-5 flex flex-col gap-3" style={{ border: '1px solid #E3DDD7' }}>
                  <p className="text-[11px] tracking-[0.06em] uppercase text-[#68636D] m-0" style={{ fontFamily: FONT_MONO }}>
                    {customer.status === 'active' ? 'Linked' : 'Invite pending'}
                  </p>
                  <p className="text-[16px] font-semibold text-[#242326] m-0" style={{ fontFamily: FONT_HEAD }}>{customer.fullName ?? customer.email ?? 'Customer'}</p>
                  {customer.email && <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>{customer.email}</p>}
                  {!confirmUnlink ? (
                    <button type="button" onClick={() => setConfirmUnlink(true)} className="h-11 px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 self-start" style={{ backgroundColor: '#F4F0EC', color: '#242326', fontFamily: FONT_BODY }}>
                      Unlink
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-2">
                      <button type="button" disabled={busy} onClick={() => void onUnlink()} className="h-11 px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0" style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
                        Confirm unlink
                      </button>
                      <button type="button" onClick={() => setConfirmUnlink(false)} className="h-11 px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer bg-white" style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}>
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={e => void onInvite(e)} className="rounded-[16px] bg-white p-5 flex flex-col gap-3" style={{ border: '1px solid #E3DDD7' }}>
                  <label className="text-[12.5px] font-semibold text-[#242326]" style={{ fontFamily: FONT_BODY }} htmlFor="customer-email">
                    Homeowner email
                  </label>
                  <input
                    id="customer-email"
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-11 px-3 rounded-[10px] text-[13.5px] min-w-0"
                    style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY }}
                    placeholder="name@example.com"
                  />
                  {formError && <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{formError}</p>}
                  <button type="submit" disabled={busy} className="h-11 px-5 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 self-start" style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}>
                    {busy ? 'Sending…' : 'Send invite'}
                  </button>
                </form>
              )}
              {formError && customer && <p className="text-[13px] text-[#B91C1C] m-0" style={{ fontFamily: FONT_BODY }}>{formError}</p>}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
