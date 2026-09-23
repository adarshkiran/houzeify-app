// ─── C17 — Construction stage set / advance / move-back controls ───────────
// Company-only. Persists via PATCH /api/v1/projects/:id (projects.stage).
// Customer Timeline stays read-only; do not mount this for audience=customer.
//
// projects.stage (this control) is the project's overall construction journey
// stage shown on Timeline. It is intentionally separate from
// DailyProgress.stage, which only tags an individual progress entry.

import { useEffect, useState } from 'react'
import { constructionStages, stageById } from '@/data/constructionStages'
import { listOrganizationMembers } from '@/data/organizationApi'
import { describeProjectError } from '@/data/projectApi'
import { useAuth } from '@/data/authState'
import { useProjects } from '@/data/projectState'

const FONT_MONO = '"Sometype Mono:SemiBold", monospace'
const FONT_BODY = '"Open Sans:Regular", sans-serif'
const FONT_HEAD = '"Google Sans Flex:SemiBold", sans-serif'

const BTN =
  'inline-flex items-center justify-center min-h-[44px] px-4 rounded-[12px] text-[13.5px] font-semibold cursor-pointer border-0 disabled:opacity-50 disabled:cursor-not-allowed'

/** Matches server project.service update ACL: creator, or org owner/admin. */
const PROJECT_MUTATION_ROLES = new Set(['owner', 'admin'])

function useCanMutateProjectStage(projectId: string): { ready: boolean; canMutate: boolean } {
  const { user } = useAuth()
  const { getProject } = useProjects()
  const project = getProject(projectId)
  const [orgRole, setOrgRole] = useState<string | null>(null)
  const [roleReady, setRoleReady] = useState(!project?.organizationId)

  useEffect(() => {
    if (!project?.organizationId || !user?.id) {
      setOrgRole(null)
      setRoleReady(true)
      return
    }
    let cancelled = false
    setRoleReady(false)
    listOrganizationMembers(project.organizationId)
      .then(members => {
        if (cancelled) return
        const me = members.find(m => m.userId === user.id && m.status === 'active')
        setOrgRole(me?.role ?? null)
        setRoleReady(true)
      })
      .catch(() => {
        if (cancelled) return
        setOrgRole(null)
        setRoleReady(true)
      })
    return () => { cancelled = true }
  }, [project?.organizationId, user?.id])

  if (!user || !project) return { ready: Boolean(roleReady && project !== undefined), canMutate: false }

  const isCreator = project.ownerId === user.id
  const isOrgMutator = Boolean(orgRole && PROJECT_MUTATION_ROLES.has(orgRole))
  return { ready: roleReady, canMutate: isCreator || isOrgMutator }
}

export default function ConstructionStageProgression({
  projectId,
  currentStage,
  onStageChanged,
}: {
  projectId: string
  currentStage: string | null | undefined
  /** Called after a successful PATCH so parents can refresh timeline views. */
  onStageChanged?: (stage: string | null) => void
}) {
  const { updateProject } = useProjects()
  const { ready, canMutate } = useCanMutateProjectStage(projectId)
  const [selected, setSelected] = useState(currentStage && stageById(currentStage) ? currentStage : constructionStages[0]?.id ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  useEffect(() => {
    if (currentStage && stageById(currentStage)) setSelected(currentStage)
  }, [currentStage])

  const currentIndex = currentStage ? constructionStages.findIndex(s => s.id === currentStage) : -1
  const canMoveBack = currentIndex > 0
  const canAdvance = currentIndex >= 0 && currentIndex < constructionStages.length - 1
  const currentLabel = currentStage ? (stageById(currentStage)?.name ?? currentStage) : 'Not set'

  async function applyStage(next: string) {
    if (!next || busy || !canMutate) return
    setBusy(true)
    setError(null)
    setNotice(null)
    try {
      const updated = await updateProject(projectId, { stage: next })
      setSelected(updated.stage && stageById(updated.stage) ? updated.stage : next)
      setNotice(`Project stage updated to ${stageById(updated.stage ?? next)?.name ?? updated.stage ?? next}.`)
      onStageChanged?.(updated.stage)
    } catch (err) {
      setError(describeProjectError(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mt-4 pt-4 min-w-0" style={{ borderTop: '1px solid #F4F0EC' }} aria-labelledby="stage-progression-heading">
      <h3 id="stage-progression-heading" className="text-[12px] tracking-[0.06em] uppercase text-[#68636D] m-0 mb-2" style={{ fontFamily: FONT_MONO }}>
        Project construction stage
      </h3>
      <p className="text-[13px] text-[#68636D] m-0 mb-2" style={{ fontFamily: FONT_BODY }}>
        This is the project’s overall stage on Timeline — not the stage tag on a daily progress entry.
      </p>
      <p className="text-[13px] text-[#68636D] m-0 mb-3" style={{ fontFamily: FONT_BODY }}>
        Current: <span className="font-semibold text-[#242326]" style={{ fontFamily: FONT_HEAD }}>{currentLabel}</span>
        {currentIndex >= 0 ? ` · Stage ${currentIndex + 1} of ${constructionStages.length}` : ''}
      </p>

      {!ready ? (
        <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>Checking permissions…</p>
      ) : !canMutate ? (
        <p className="text-[13px] text-[#68636D] m-0" style={{ fontFamily: FONT_BODY }}>
          Only organization owners and admins can change the project construction stage.
        </p>
      ) : (
        <>
          <label htmlFor="stage-progression-select" className="block text-[12px] text-[#68636D] m-0 mb-1.5" style={{ fontFamily: FONT_BODY }}>
            Set project stage
          </label>
          <div className="flex flex-col sm:flex-row gap-2 min-w-0">
            <select
              id="stage-progression-select"
              value={selected}
              disabled={busy}
              onChange={e => setSelected(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-[10px] text-[13.5px] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#722ED1] min-w-0"
              style={{ border: '1px solid #E3DDD7', fontFamily: FONT_BODY, backgroundColor: '#FFFFFF' }}
            >
              {constructionStages.map((s, i) => (
                <option key={s.id} value={s.id}>
                  {i + 1}. {s.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={busy || !selected || selected === currentStage}
              onClick={() => applyStage(selected)}
              className={BTN}
              style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
            >
              {busy ? 'Saving…' : 'Set stage'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-3">
            <button
              type="button"
              disabled={busy || !canMoveBack}
              onClick={() => applyStage(constructionStages[currentIndex - 1]!.id)}
              className={BTN}
              style={{ backgroundColor: '#F4F0EC', color: '#242326', fontFamily: FONT_BODY }}
              aria-label="Move to previous construction stage"
            >
              Move back
            </button>
            <button
              type="button"
              disabled={busy || !canAdvance}
              onClick={() => applyStage(constructionStages[currentIndex + 1]!.id)}
              className={BTN}
              style={{ backgroundColor: '#722ED1', color: 'white', fontFamily: FONT_BODY }}
              aria-label="Advance to next construction stage"
            >
              Advance stage
            </button>
          </div>

          {currentIndex < 0 && (
            <p className="text-[12.5px] text-[#68636D] m-0 mt-2" style={{ fontFamily: FONT_BODY }}>
              Choose a stage above and tap Set stage to begin the construction sequence.
            </p>
          )}
          {error && (
            <p className="text-[13px] text-[#B91C1C] m-0 mt-2" role="alert" style={{ fontFamily: FONT_BODY }}>{error}</p>
          )}
          {notice && !error && (
            <p className="text-[13px] text-[#15803D] m-0 mt-2" role="status" style={{ fontFamily: FONT_BODY }}>{notice}</p>
          )}
        </>
      )}
    </div>
  )
}
