# Railyug

A resilient journey assistant that sits on top of the existing Indian Railways (IRCTC) booking flow. Railyug treats a rail trip as a living plan, not a one-time booking.

Built for **IMPACTX 2026, Challenge 01: Reimagining Railway Travel (Reference: IRCTC)**.

> **SIMULATED DATA.** All trains, seat availability, delays, waitlist history and refunds in this project are synthetic. The rule set (`rules-v1.0`) is a labelled demo, not IRCTC's. Railyug does not book, cancel or refund anything. Actual transactions always go through authorised railway channels.

## The problem

Separate tickets for separate legs carry no atomic guarantee. One leg can confirm while the other does not, and the traveller is stranded. A plan that looks best at search time can be unsuitable minutes later.

## The scenario

A five-person family travels on two coupled legs:

| Passenger | Role | Key constraint |
|---|---|---|
| P1 | Older passenger | Limited mobility, needs ramp or lift and a lower berth |
| P2 | Caregiver of P1 | Never separated from P1 |
| P3 | Child under five | Needs a guardian adjacent |
| P4 | Screen-reader user | Keyboard and screen-reader-only flow |
| P5 | Adult family member | Flexible, can go ahead or lose connectivity |

Leg 1 is confirmed, Leg 2 is waitlisted, the connection is 40 minutes with a platform change, and Train 1 can run 55 minutes late.

## Three ideas

1. **Plan as a living object.** Every itinerary has versions, a rule-set version and a recorded reason for each change.
2. **Uncertainty everywhere.** Every number carries a range and the sample size or assumptions behind it. Never 0% or 100%.
3. **Hard rules over soft scores.** Caregiver protection and accessibility filter options before ranking.

## What is in this demo

The demo is a single file, `railyug.html`. Open it in any modern browser. No install, no server, no network calls apart from an optional web font.

| Tab | What it shows |
|---|---|
| Journey | Scenario, delay and lift-outage injection, per-passenger connection feasibility, waitlist estimator with range and sample size |
| Re-plan | Plan A/B/C with success ranges, worst cases and consequence preview |
| Family rules | Split assignment with the caregiver rule enforced and a trade-off panel |
| Tatkal hold | One seat, one holder, Processing label, accessible countdown, auto-release, concurrency test |
| Ledger | Per-passenger ledger, four-state refund timeline, reconciliation total |
| Ranking | Hard accessibility filter, priority sliders, ranking diff, price and cancellation comparison |
| Seat exchange | Mutual-consent exchange with compliance notice and a blocked swap |
| Offline & checks | Offline pack with versions, safe sync conflict summary, name-mismatch detector |
| All 46 features | Every feature with status: working, partly built, or roadmap |
| Honesty | What the demo is and is not |

Also included: skip link, keyboard-operable controls, polite screen-reader announcements, light and dark themes, and a low-bandwidth toggle.

## Try the demo path

1. **Journey:** press "Inject: Train 1 runs 55 minutes late". The connection probability drops and the margin goes negative.
2. **Re-plan:** review Plan A/B/C and preview consequences.
3. **Family rules:** put P1 and P2 in different groups. The split is blocked with the reason. Then move only P5 to the other group and see the trade-off panel.
4. **Tatkal hold:** choose the 15-second window, click a seat, press "User B grabs the same seat", then let the hold expire.
5. **Ledger:** cancel a berth and advance it through the four refund states.
6. **Offline & checks:** go offline, add a note, inject the delay, come back online and read the conflict summary.

## Honesty and compliance

- Every screen showing availability, status or refunds is labelled simulated.
- A Processing hold is never presented as a confirmed ticket.
- Railyug never claims an unofficial seat swap or sharing changes a valid ticket or berth. It can only help with discovery and consent.
- Booking and cancellation hand off to the official IRCTC channel.
- Estimates come from seeded synthetic data, so results are reproducible.

## Feature status

Of the 46 planned features, the demo has working or partial versions of most Tier 1 and Tier 2 items. See the **All 46 features** tab for the full list.

**Not built in this demo:**
- The 20 scripted disruptions and evaluation harness
- Replay of a recommendation from the audit log
- Recalculated refunds for other passengers after one cancellation
- Brier score and calibration results page
- Simulated last-minute booking flow

**Roadmap (deferred because of legal and trust risk):** seat marketplace, partial seat sharing, compensation offers, anti-scalping tooling, verified profiles, and the RailCircle community (chat, shared cabs, ratings, privacy-protected contact sharing).

## Planned full build

The full specification (engines, event log, tests, 12 screens, evaluation) is in `SPEC.md` if you add it to the repo. The intended stack is React, TypeScript and Vite, with all engines as pure, UI-free modules, unit-tested with Vitest and checked with axe-core.

Engine build order:

1. Waitlist confirmation estimator
2. Transfer feasibility
3. Group constraint solver
4. Leg dependency evaluator
5. Ranker with explanation and diff
6. Disruption engine and re-planner
7. Ledger and refund state machine
8. Tatkal hold manager

## Repository layout

```
railyug/
├── railyug.html     # single-file working demo
├── README.md        # this file
└── SPEC.md          # full build prompt / specification (optional)
```

## Accessibility

Keyboard-only operation, visible focus, semantic landmarks, polite live regions, no information conveyed by colour alone, and reduced-motion support. The demo has not yet been tested with a real screen reader. Before submitting, test with NVDA, TalkBack or VoiceOver and record task success.

## Pre-submission checklist

- [ ] Product name is "Railyug" everywhere (no "RailSaathi")
- [ ] Every availability, status and refund screen shows the SIMULATED DATA label
- [ ] Demo opened once on a different device
- [ ] Real screen-reader test recorded
- [ ] Demo video plays fully with audio and captions

## Team

| Role | Owns |
|---|---|
| Engine lead | Estimator, ranker, dependency model, transfer engine |
| Disruption and state lead | Disruption engine, event log, offline sync, curveballs |
| Front-end and accessibility lead | Screens, keyboard and screen-reader behaviour, low-bandwidth mode |
| Data and evaluation lead | Synthetic data, rule set, metrics, calibration |
| Story lead | Slides, demo script, video |

## License

Add your preferred license here.
