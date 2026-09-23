/** Screen 06 — evidence capture path helpers (Camera vs gallery). */

/** Camera inputs may use capture=environment; gallery Add Photos / Add Video must not. */
export function evidenceInputUsesForcedCapture(kind: 'camera' | 'gallery'): boolean {
  return kind === 'camera'
}
