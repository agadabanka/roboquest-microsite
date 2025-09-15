# Agent Operating Guide (Microsite Repo)

This document applies to the `astro_bot_microsite` repo. Follow it to keep deploys stable and avoid repeating mistakes.

## Read Before Work
- Open `../DEVELOPMENT_LOG.md` and skim recent attempts and issues.
- Note any recurring console errors or broken flows to verify.

## Make Changes
- Keep edits focused (camera, input, physics, UI).
- Update `../DEVELOPMENT_LOG.md` with learnings using `../update_log.py`:
  - Example: `python ../update_log.py "Camera/input polish" "✅ SUCCESS" "Smoothed turn; fixed texture/FontLoader console errors; ran tuned_movement_test.py."`

## Test Locally (Mandatory Before Push)
- Serve: `python -m http.server 8000`
- Run tests from `docs/testing/`:
  - Quick: `python test_game.py` (captures console logs)
  - Tuned movement: `python tuned_movement_test.py`
- Passing criteria:
  - Game loads, no red console errors.
  - Camera orbits on drag; character turns appropriately.
  - WASD is camera‑relative; jump/hover feel fluid.
- If tests fail or console shows errors: fix first, then retest.

## Push Discipline
- Stage only relevant files (`game/js/*.js`, etc.).
- Use descriptive commit messages (e.g., `fix(world): remove FontLoader; robust ground texture`).
- Push only after Selenium tests pass and console is clean.

## Notes
- Avoid using fonts/examples loaders unless included; prefer simple helpers to keep console clean.
- Texture loads must have safe fallbacks (no references to undeclared objects).
