# Old Product Screens

This folder exists as the destination for screens that no longer belong to
the current User/Partner product direction — obsolete, duplicate, or
unreachable experiments from an earlier version of Houzeify.

## Status as of the User/Partner reorganization (this pass)

At that time: **empty.** Every one of the 151 files in the old
`src/screens/` folder was cross-checked against `App.tsx`'s imports and
render blocks — all 151 are imported, all 151 are rendered by a real
`{screen === '...'}` block, and spot-checks of every ambiguous-sounding name
(`PrimeScreen`, `PersonalProfileScreen`, `ReviewsRatingsScreen`,
`AccountTypeScreen`, `OrganizationSubmittedScreen`, etc.) turned up a real,
current, non-duplicate purpose for each one — most commonly a deliberate
dual-role screen serving both Homeowner and Professional contexts from one
file (see the implementation report for the full list).

No screen was moved here on a guess. If a genuinely obsolete or superseded
screen turns up in later work, move it here rather than deleting it, and
update this file with what it was and why it was retired.

## Update — Flow 05 (Partner Authentication & Entry)

### `ChooseRoleScreen.tsx`

Moved here after a deeper reachability audit for the Partner-auth task found
it genuinely obsolete, not merely disconnected:

- Its own dev-switcher entry in `App.tsx`'s `SCREEN_GROUPS` was already
  labeled `'Choose Role (legacy)'` by a previous author — the codebase
  already knew.
- `grep`-confirmed zero live `onNavigate('role')` calls anywhere in the
  app — only reachable via the dev jump-menu, never from a real screen.
- Its own header comment claims to be "Screen 007 — Choose Your Role", the
  exact same slot `PrimaryIntentScreen.tsx` (still in
  `user/onboarding/`) occupies and actually is wired for — two screens
  claiming the same canonical step is the literal definition of superseded.
- Three of its five role cards navigate to screen ids that don't exist in
  `AppScreen` at all (`onboarding-business`, `onboarding-professional`,
  `onboarding-supplier`) — it was broken as well as unreachable.
- `PrimaryIntentScreen` is the real, working replacement: it already
  supports the homeowner/professional split via the canonical
  `role`/`professionalType` model (`roleForIntent()`/`nextScreenForIntent()`
  in `src/data/primaryIntent.ts`), and correctly routes into
  `professional-type` for the professional case.

Removed from `App.tsx`: its import, the `'role'` `AppScreen` member, its
`SCREEN_GROUPS` entry, and its render block.

## Update — TABLE B legacy cleanup

### `UpdateProgressScreen.tsx` (moved from `src/partner/jobs/`)

Moved here (not deleted) after a dependency trace showed it is superseded and
unreachable:

- Its `'update-progress'` id was in the `AppScreen` union and had a render
  block, but was in no `SCREEN_GROUPS` entry and had no `onNavigate('update-progress')`
  caller anywhere (the dashboard "Update Progress" action already points at
  `create-daily-progress`).
- It wrote to the in-memory `src/data/projectProgress.ts` store, which
  `ProjectProgressScreen` no longer reads (Module 04 moved daily progress to
  the database). `projectProgress.ts` is imported only by this screen, so it
  stays in `src/data/` untouched next to it, also unreferenced from any
  active screen.
- Replaced by `CreateDailyProgressScreen` (`create-daily-progress`) and the
  `daily_progress` backend.

Removed from `App.tsx`: its import, the `'update-progress'` `AppScreen` member
and its render block. Safe to delete together with `projectProgress.ts` in a
later cleanup once nothing outside this folder references either.

