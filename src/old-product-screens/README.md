# Old Product Screens

This folder exists as the destination for screens that no longer belong to
the current User/Partner product direction — obsolete, duplicate, or
unreachable experiments from an earlier version of Houzeify.

## C12 update

The last two retired screens in this folder were deleted as confirmed dead
code (zero imports, unwired from App):

- `ChooseRoleScreen.tsx` — superseded by `PrimaryIntentScreen`
- `UpdateProgressScreen.tsx` — superseded by `CreateDailyProgressScreen` +
  `daily_progress` backend; companion store `src/data/projectProgress.ts`
  was deleted with it

This folder may be empty aside from this README. New obsolete screens should
still be moved here first (with a note below) before deletion in a later pass.

## History

### `ChooseRoleScreen.tsx` (deleted in C12)

Moved here after a deeper reachability audit found it genuinely obsolete.
Removed from `App.tsx` in an earlier pass. C12 deleted the file.

### `UpdateProgressScreen.tsx` (deleted in C12)

Moved from `src/partner/jobs/`. Wrote only to in-memory `projectProgress.ts`.
Replaced by `CreateDailyProgressScreen` (`create-daily-progress`). C12 deleted
both the screen and `projectProgress.ts`.
