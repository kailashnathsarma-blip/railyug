# Railyug — Resilient Rail Journey Decision Assistant

> **Railyug** sits on top of the Indian Railways (IRCTC) booking flow. It does not replace IRCTC. It treats a rail trip as a living plan: ranking itineraries by risk, estimating waitlist confirmation as a range, modelling dependency between coupled legs, protecting dependent passengers, re-planning during disruption, and keeping an honest per-passenger, per-leg ledger.

---

## 1. Non-Negotiable Core Principles

1. **HONESTY**: All train schedules, availability, live status, waitlist history, and refunds are **SIMULATED**. A persistent `SIMULATED DATA` badge is displayed on every screen showing availability, status, or refunds. We never claim a Processing hold is a confirmed ticket, nor that an unofficial seat swap alters a railway reservation chart. Every booking/cancellation flow concludes with a *"Hand off to official IRCTC channel"* step showing a prepared copyable summary (zero unauthorized scraping or fake bot integration).
2. **UNCERTAINTY EVERYWHERE**: Every number (arrival, confirmation probability, connection success) is presented as a range with sample sizes or underlying assumptions (Wilson 95% confidence intervals). We strictly never display false certainty ($0\%$ or $100\%$) and surface explicit *"Low Data Warnings"* for small samples.
3. **HARD RULES OVER SOFT SCORES**: Caregiver protection and accessibility are non-negotiable hard constraints that **FILTER** options before multi-attribute ranking, not soft additive weights.
4. **DETERMINISM**: Identical inputs yield identical outputs. All pseudorandom generators are seeded (`Mulberry32` PRNG). Fixed tie-breakers are enforced. Every recommendation is stamped with a rule-set version (`rules-v1.0`).
5. **ACCESSIBILITY FIRST**: Fully keyboard-operable, screen-reader friendly (polite `aria-live` milestones), skip links, WCAG 2.2 AA compliant contrast, no colour-only indicators, respecting `prefers-reduced-motion`. Includes a high-efficiency **Low-Bandwidth Mode** toggle (text-first, minimal graphical overhead, identical functionality).
6. **ENGINES ARE PURE**: All mathematical, transit, constraint, and ledger logic lives in UI-free TypeScript modules with 100% unit test coverage.

---

## 2. The Scenario (`/data/scenario.json`)

Five passengers traveling on a multi-leg coupled journey:
* **P1 (Rameshwar Sharma, 72)**: Senior Citizen with limited mobility (osteoarthritis). Requires ramp/lift (cannot take stairs), short walks ($\le 150\text{m}$), and lower berth. Hard-linked to P2.
* **P2 (Sunita Sharma, 44)**: Primary adult caregiver of P1. Hard-linked to P1; can never be separated under any split.
* **P3 (Aarav Sharma, 4)**: Dependent toddler under five. Requires an adjacent guardian (P2 or P5); adds stroller and childcare overhead ($+8$ minutes).
* **P4 (Priya Sharma, 28)**: Screen-reader user; navigates non-visually via keyboard and assistive technology.
* **P5 (Vikram Sharma, 26)**: Flexible adult; handles heavy baggage; candidate for splitting; vulnerable to cellular dead-zones.

**Journey Topology**:
* **Leg 1 (Train 1: 12951 Mumbai Rajdhani)**: **CONFIRMED** (Coach B3, Berths 11, 12, 15, 16).
* **Leg 2 (Train 2: 12059 Kota Jan Shatabdi)**: **WAITLISTED** (WL 7–10, CC).
* **Interchange Junction**: Kota Junction (`KOTA`) with a 40-minute scheduled transfer window across Platform 2 to Platform 4 (stairs, 1 operational lift, 1 ramp; lift outage is an injectable scenario).

---

## 3. Pure TypeScript Engine Architecture (`src/engines/`)

1. **Waitlist Confirmation Estimator (`wlEstimator.ts`)**:
   * Synthetic historical booking dataset (4,200 records, seeded PRNG).
   * Bucketed empirical rates and logistic regression with Wilson 95% confidence intervals.
   * Held-out calibration evaluation: Brier score $\le 0.18$ across 10 decile probability bins.
2. **Transfer Feasibility Engine (`transferFeasibility.ts`)**:
   * Physical transit model: group moves at bottleneck speed ($0.55\text{ m/s}$ for senior P1).
   * Overheads: luggage ($4 \times 1.5\text{m} = 6\text{m}$), childcare ($+8\text{m}$), crowd reports ($+0.5\text{m}$ each), regrouping buffer ($5\text{m}$).
   * Platform shift and lift outage scenarios.
   * Honestly detects missed connections when Train 1 runs 55 minutes late (window shrinks to $-15\text{m}$).
3. **Group Constraint Solver (`groupConstraintSolver.ts`)**:
   * Enforces hard constraints: (a) P1 never separated from P2; (b) P3 accompanied by guardian; (c) P1 step-free access preserved.
   * Evaluates split partitions; visibly **BLOCKS** illegal splits with specific violation codes.
   * Generates honest trade-off panels (gained, lost, contingency plans).
4. **Leg Dependency Evaluator (`legDependencyEvaluator.ts`)**:
   * Evaluates strategic dilemma: **Keep Leg 1** vs **Cancel Leg 1** vs **Proactive Re-route**.
   * Computes expected costs, destination arrival probability, worst-case risks, and decision cut-off deadlines.
5. **Deterministic Multi-Attribute Ranker (`ranker.ts`)**:
   * Risk-adjusted arrival estimation (P10–P90).
   * Interactive priority sliders (Speed, Cost, Comfort, Risk).
   * Generates dynamic diff explanations on priority changes (e.g. *"Option moved from #2 to #1 because cost priority increased; arrival range overlap 80%"*).
6. **Disruption Engine & Multi-Plan Re-Planner (`disruptionEngine.ts`)**:
   * Segregates information into **Official** (authoritative), **Crowd** (advisory), and **Predicted** (forecast) streams.
   * Generates **Plan A** (Guaranteed Express), **Plan B** (Senior Day-Room Rest), and **Plan C** (Multi-modal Split) within a 2000 ms compute budget.
7. **Ledger & Refund State Machine (`ledgerStateMachine.ts`)**:
   * Per-passenger, per-leg row tracking across 4 strictly ordered states:
     $$\text{Cancellation} \rightarrow \text{Refund Initiated} \rightarrow \text{Refund Processing} \rightarrow \text{Final Credit}$$
   * Cancelling one berth recalculates fares and refunds for remaining travelers.
   * Mathematical reconciliation: $\text{Refunds} + \text{Deductions} \equiv \text{Original Fare Paid}$ (zero double-counting).
8. **Tatkal Fair-Booking Hold Manager (`tatkalHoldManager.ts`)**:
   * Atomic check-and-set locks (`AVAILABLE` $\rightarrow$ `PROCESSING` $\rightarrow$ `CONFIRMED`).
   * Authoritative simulated server clock (3-minute checkout window).
   * No timer resets on refresh or re-click.
   * All-or-nothing group locks (P1 & P2 claimed together).
   * Accessible $+2\text{ minute}$ timer extension for assistive technology users.
   * Rejects late payments after expiry and routes funds to the 4-state refund pipeline.

---

## 4. Application Modules & Screens

| # | Screen | Key Capabilities |
|---|---|---|
| **1** | **Family Setup** | Inspect 5 passenger mobility profiles, caregiver link ($P1 \leftrightarrow P2$), child guardianship, and interactive split validation playground. |
| **2** | **Ranked Options** | Multi-attribute rankings with Wilson ranges (P10–P90), sample sizes, dynamic priority sliders with diff explanation banners, and IRCTC hand-off summary. |
| **3** | **Leg Dependency** | 3-way comparative decision matrix (Keep / Cancel / Re-route) with countdown timers and financial refund impacts. |
| **4** | **Plans A / B / C** | Re-planned alternatives with compute budget telemetry ($< 2000\text{ ms}$), layover details, and split contingencies. |
| **5** | **Journey Status** | Per-passenger coach/berth status (Coach B3), live delay telemetry, and platform transfer feasibility margin at Kota Junction. |
| **6** | **Override Modal** | Pre-flight consequence preview showing before/after arrival shifts, fare differences, and caregiver compliance before committing. |
| **7** | **Ledger & Refunds** | 4-state refund lifecycle progression table, berth cancellation recalculation, and mathematical reconciliation balance sheet. |
| **8** | **Tatkal Seat Hold** | Interactive coach B2 seat map, 3-minute authoritative timer, accessible speech milestones, 2-user simultaneous click simulation, and late payment rejection. |
| **9** | **Disruption Panel** | Scripted control panel with all 20 disruptions, 3-stream source segregation (Official / Crowd / Predicted), and 4-step sequence flow. |
| **10** | **Offline Pocket Pack** | Offline pocket pack JSON export, 3-way sync conflict resolver, Tier 2 Name Mismatch detector, and mutual consent seat exchange. |
| **11** | **Results & Evaluation** | Live test harness: 20-disruption budget compliance ($100\%$), Brier score ($\le 0.18$), calibration table, Tatkal concurrency locks ($0$ overlaps), and screen-reader success. |
| **12** | **Roadmap & Compliance** | Legal compliance statements, DPDP Act notices, and Tier 3 deferred roadmap (secondary marketplace, peer chat). |
| **—** | **Audit Trail** | Append-only event stream with one-click deterministic replay of past recommendations. |

---

## 5. Scripted Demo Walkthrough Guide

Follow this sequence to inspect all core engines and acceptance criteria:

1. **Family Setup (`Screen 1`)**:
   * Review P1's mobility constraints ($0.55\text{ m/s}$ walking speed, step-free required) and P2 hard-link.
   * Click *"Simulate Illegal Split"* $\rightarrow$ Observe immediate rejection: *"ILLEGAL SPLIT BLOCKED: P1 and P2 are hard-linked"*.
   * Click *"Simulate Legal Split"* $\rightarrow$ Observe P5 solo road transit approval with clear gained/lost trade-offs.
2. **Ranked Options & Diff Tuning (`Screen 2`)**:
   * Observe Option #1 with Wilson confidence range ($88\%–96\%$, $n = 312$) and arrival window.
   * Slide **Cost Priority** to $90\%$ $\rightarrow$ Notice ranking shift and polite diff announcement: *"Option moved because cost priority increased; arrival range overlap 80%"*.
   * Click *"IRCTC Hand-Off"* $\rightarrow$ Inspect copyable prepared text summary with disclaimer.
3. **Leg Dependency (`Screen 3`)**:
   * Review the dilemma: Leg 1 confirmed, Leg 2 waitlisted.
   * Compare Keep vs Cancel vs Re-route with active countdown timers before chart preparation.
4. **Disruption Injection (`Screen 9`)**:
   * Select **#1 Train 1 runs 55 minutes late** $\rightarrow$ Click *"Inject This Disruption"*.
   * Jump to **Journey Status (`Screen 5`)**: Transfer window at Kota drops to $-15\text{ minutes}$ (Connection physically missed).
   * Jump to **Plans A/B/C (`Screen 4`)**: Observe re-planning completed in $\sim 14\text{ ms}$ (Met budget: YES).
5. **Ledger & Berth Cancellation (`Screen 7`)**:
   * Click *"Simulate P5 Berth Cancellation & Recalculate"*.
   * Verify Leg 1 fare drops from ₹14,250 to ₹11,400.
   * Progress P5's refund through the 4 states: Cancellation Requested $\rightarrow$ Refund Initiated $\rightarrow$ Refund Processing $\rightarrow$ Final Credit.
   * Verify the Mathematical Reconciliation Audit displays **MATCHED: ZERO DOUBLE-COUNTING**.
6. **Tatkal Hold & Concurrency Test (`Screen 8`)**:
   * Click *"Fire Simultaneous Clicks on B2-1"*.
   * Inspect output: Exactly User Alice succeeds; User Bob receives *"ALREADY_HELD"* and is offered next best seats ($0$ overlapping holds).
   * Click *"Extend Timer (+2m for AT)"* $\rightarrow$ Verify $+120\text{s}$ granted and button disables.
   * Advance clock by $+185\text{s}$ $\rightarrow$ Observe hold expiry and automatic seat release.
7. **Offline Pack & Tier 2 Utilities (`Screen 10`)**:
   * Inspect sync conflict: Official platform change (PF 6) takes precedence over local porter note without silent overwrite.
   * Test Name Mismatch Detector with *"Vikram Sharma"* vs *"Vikram K Sharma"*.
8. **Quantitative Evaluation Results (`Screen 11`)**:
   * Click *"Re-Run Live Evaluation Harness"*.
   * Verify all 20 disruptions pass within budget, Brier score $\le 0.18$, and Tatkal overlaps equal $0$.
9. **Deterministic Audit Replay (`Audit Trail`)**:
   * Select any historical disruption or weight update event and click *"Replay Snapshot"*.
   * Verify deterministic engine re-executes with matching state hash.

---

## 6. Installation, Testing & Running Locally

### Prerequisites
* Node.js LTS (v20+ or v24+)
* npm (v10+ or v11+)

### Setup
```bash
# Clone or navigate to the repository
cd C:\Users\kaila\.gemini\antigravity\scratch\railyug

# Install dependencies
npm install
```

### Running Unit & Curveball Tests
```bash
# Run all Vitest engine and acceptance criteria tests
npm test
```

### Starting the Development Server
```bash
# Start local Vite dev server
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Building for Production
```bash
# TypeScript check and Vite production build
npm run build
```

---

## 7. Compliance & Legal Notice
**SIMULATED DATA ONLY**: Railyug is an academic and architectural demonstration of resilient, accessibility-first rail travel software. It does not interface with or bypass Indian Railways / CRIS production systems. No real commercial bookings or payments take place.
