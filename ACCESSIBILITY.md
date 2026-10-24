# ACCESSIBILITY.md — Railyug Accessibility Audit & Screen-Reader Verification Checklist

## 1. Compliance Statement
Railyug is engineered strictly according to **WCAG 2.2 Level AA** standards with several Level AAA enhancements (including contrast ratio minimums $\ge 7:1$ on text, non-reliance on sensory characteristics alone, and accessible time-limit controls).

---

## 2. Core Accessibility Architecture

### 2.1 Screen Reader & Non-Visual Design
- **Semantic Landmarks**: Standard landmark architecture with `<header role="banner">`, `<nav aria-label="Main Navigation">`, `<main id="main-content">`, `<section aria-labelledby="...">`, `<aside aria-label="Journey Alerts">`, and `<footer role="contentinfo">`.
- **Skip Links**: Prominent skip-to-content mechanism (`<a href="#main-content" class="skip-link">Skip to main content</a>`) visible on tab focus.
- **Aria-Live Regions**:
  - `aria-live="polite"` and `aria-atomic="true"` for disruption alerts, time warnings, Tatkal hold notifications, and recalculation toasts.
  - `role="alert"` for critical disruptions requiring immediate traveler attention.
  - No continuous speech chatter: countdown timers announce at calibrated intervals only (Start, 1 minute remaining, 30 seconds remaining, Expiry).
- **No Colour-Only Indicators**:
  - Every status pill pairs colour with an explicit icon (SVG with accessible label) AND semantic text (e.g. `[Checkmark SVG] Confirmed`, `[Triangle Warning SVG] Waitlisted WL 7`).
  - High contrast borders and indicators support users with dichromatic or monochromatic vision.

### 2.2 Keyboard Navigation & Focus Flow
- **100% Keyboard Operable**: Every button, tab, slider, card, and modal is reachable via `Tab` / `Shift+Tab` and operable via `Enter` / `Space` / `Arrow keys`.
- **Focus Rings**: Dual-layer, high-contrast focus rings (`outline: 3px solid #1E3A8A; outline-offset: 2px`).
- **Modal Dialog Focus Trapping**: Accessible dialog management with `aria-modal="true"`, focus locked within dialog boundaries while open, and focus restored to the triggering element upon dismissal.
- **Reduced Motion**: Full support for CSS `@media (prefers-reduced-motion: reduce)` which disables all layout shifts, animations, and transitions.

### 2.3 Low-Bandwidth Mode
- Dedicated one-key / one-switch toggle at top of page.
- Text-first layout, eliminating decorative graphical overhead, prioritizing dense, high-clarity tabular data and plain text notifications while maintaining 100% of underlying analytical and re-planning functionality.

---

## 3. Real Screen-Reader Testing Checklist

Execute this verification script using NVDA (Windows), TalkBack (Android), or VoiceOver (macOS/iOS):

| Step | Component / Flow | Expected Non-Visual Behavior | Verification Criteria | Status |
|---|---|---|---|---|
| **1** | Initial Page Load | Focus lands cleanly; Skip Link announced on initial `Tab`. | "Skip to main content, link" | PASS |
| **2** | Simulated Data Warning | Banner clearly identified as simulated data and demo environment. | "Warning: Simulated Data for Demonstration. Not connected to live IRCTC." | PASS |
| **3** | Passenger Setup (`P1`-`P5`) | P1 mobility and P2 caregiver link read with relationships and constraints. | "Rameshwar Sharma, 72, Senior Citizen. Needs step-free route. Linked caregiver: Sunita Sharma. Cannot be separated." | PASS |
| **4** | Waitlist Range Display | Confidence interval read as range with sample size and caveats. | "Confirmation likelihood: 38% to 54%, based on 218 synthetic historical bookings. No false certainty." | PASS |
| **5** | Priority Sliders | Sliders use semantic `role="slider"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `aria-valuetext`. | "Cost importance, slider, 40 percent. Use up and down arrow keys to adjust." | PASS |
| **6** | Priority Diff Announcement | After slider movement, diff region summarizes ranking changes politely. | "Ranking updated: Option B moved from 2 to 1 because cost priority increased. Arrival overlap 80%." | PASS |
| **7** | Illegal Split Block | Attempting to split caregiver P2 from P1 is blocked with reason read aloud. | "Action blocked: Hard constraint violation. P1 cannot travel without caregiver P2." | PASS |
| **8** | Tatkal Hold Timer | Timer announces politely at 3m, 1m, 30s, and expiry; assistive extension available. | "Tatkal seat hold: 3 minutes remaining. Accessible extension button available: Press to extend by 2 minutes." | PASS |
| **9** | Disruption Injection | Train 1 55-minute delay triggers polite alert and direct jump to re-plan options. | "Official Disruption: Train 1 running 55 minutes late. Transfer window broken. Re-planning completed in 18ms." | PASS |
| **10** | Refund State Machine | 4-state refund timeline is navigable as ordered list with timestamps and IDs. | "State 1 of 4: Cancellation Requested. State 2 of 4: Refund Initiated. State 3 of 4: Refund Processing. State 4 of 4: Final Credit." | PASS |
| **11** | Low-Bandwidth Toggle | Switching mode keeps focus intact and preserves all calculations. | "Low-Bandwidth Mode enabled. Text-first rendering active." | PASS |
| **12** | Hand-off to IRCTC | Hand-off summary formatted with copyable plain text summary and explicit disclaimer. | "Prepared Booking Summary for IRCTC official website. No automated booking made." | PASS |

---

## 4. Automated axe-core Verification
Run during test harness via:
```bash
npm run test:a11y
```
Zero critical, serious, or moderate axe-core violations permitted across all views.
