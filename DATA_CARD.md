# DATA CARD: Railyug Synthetic Datasets & Simulation Models

## 1. Executive Summary & Purpose
**Railyug** is a journey-resilience decision support assistant that operates on top of Indian Railways (IRCTC) booking flows. 
**ALL DATA IN RAILYUG IS SYNTHETIC AND SIMULATED.**
No live connections to IRCTC, CRIS, or Indian Railways production databases are made. This data card documents the synthetic generation methodologies, assumptions, parameter distributions, validation splits, and limitations.

---

## 2. Dataset Descriptions

### 2.1 Waitlist Historical Confirmation Dataset (`wl_confirmation_history.json`)
* **Purpose**: Calibrate the Waitlist Confirmation Estimator using bucketed empirical rates and logistic regression with Wilson-score confidence intervals.
* **Generation Seed**: Deterministic PRNG seed `42891` (`Mulberry32`).
* **Records**: 4,200 synthetic booking records representing 12 high-density Indian Railways routes (e.g., Western Railway MMCT-NDLS corridor, Northern Railway, Central Railway).
* **Feature Schema**:
  * `train_number`: String (e.g. "12951", "12059", "12401").
  * `travel_class`: Categorical (`1A`, `2A`, `3A`, `3E`, `CC`, `SL`).
  * `quota`: Categorical (`GN` - General, `TQ` - Tatkal, `PT` - Premium Tatkal, `LD` - Ladies, `SS` - Senior Citizen).
  * `days_before_departure`: Integer ($[0, 120]$).
  * `booking_wl_position`: Integer ($[1, 150]$).
  * `cancellation_rate_corridor`: Float ($[0.05, 0.28]$ based on historical seasonal trends).
  * `outcome`: Binary ($1 = \text{Confirmed / RAC Berth Allocated}$, $0 = \text{Regret / Cancelled / Chart Dropped}$).
* **Empirical Bucketing**:
  * Grouped by `(train_type, class, quota, days_bucket, wl_bucket)`.
  * For any query with sample size $n$, the point likelihood $\hat{p} = k/n$ is augmented with the 95% Wilson Score Confidence Interval:
    $$w = \frac{\hat{p} + \frac{z^2}{2n} \pm z \sqrt{\frac{\hat{p}(1 - \hat{p})}{n} + \frac{z^2}{4n^2}}}{1 + \frac{z^2}{n}}$$
  * Clamped to strictly non-degenerate ranges $[\max(0.01, w_{low}), \min(0.99, w_{high})]$ ensuring no false certainty ($0\%$ or $100\%$).
  * Any bucket with $n < 30$ triggers a **"Low Sample Size Warning"** with explicit uncertainty flags.
* **Validation & Calibration**:
  * 80/20 train/held-out split (840 held-out cases).
  * Brier Score target: $\le 0.14$.
  * Calibration table evaluated over decile bins $[0.0-0.1, 0.1-0.2, \dots, 0.9-1.0]$.

### 2.2 Station Infrastructure & Junction Topology Dataset
* **Purpose**: Compute per-passenger walking times, platform changes, accessibility feasibility, and lift-outage cascades at interchange stations (Kota Junction `KOTA`, Mathura Junction `MTJ`, New Delhi `NDLS`).
* **Parameters**:
  * Platform distances: Matrix of walking distances between platforms (e.g., PF 2 to PF 4 is 280m via central FOB, 340m via south ramp).
  * Vertical traversal: Stairs (42 steps, 90 seconds base), Lifts (1 operational lift, average wait time 3.5 minutes), Ramps (gradient 7%, distance factor 1.35x).
  * Passenger speed profiles:
    * Standard adult: $1.25\text{ m/s}$
    * P1 Senior mobility-impaired: $0.55\text{ m/s}$ (cannot take stairs)
    * P3 Child (walking / stroller): $0.70\text{ m/s} / 0.90\text{ m/s}$
    * P5 Flexible adult: $1.40\text{ m/s}$
  * Group mechanics: Group speed bounded by $\min(v_i)$ plus a 5.0-minute regrouping and baggage handling buffer.

### 2.3 Refund & Clerkage Calculation Tables
* **Purpose**: Deterministic per-passenger refund state machine simulation.
* **Rule Sets**:
  * Confirmed cancellations: $>48\text{ hrs}$ flat fee; $12-48\text{ hrs}$ 25%; $4-12\text{ hrs}$ 50%; $<4\text{ hrs}$ 0% refund.
  * Waitlisted cancellations: Full refund minus flat ₹60 clerkage fee per passenger.
  * Disrupted / Missed connection: 100% full refund through Ticket Deposit Receipt (TDR) simulation.

---

## 3. Assumptions and Boundary Conditions
1. **No External Live Scrapes**: All live delays, platform allocations, and PNR statuses are emitted by local deterministically seeded simulation generators.
2. **Deterministic Seed**: All stochastic generators use Mulberry32 PRNG keyed with `seed: 42891`. Two runs with identical seeds produce identical output down to floating-point precision.
3. **No Unofficial Seat Modification**: Seat swapping agreements between passengers are marked strictly as informal social agreements that do not alter the railway chart or official ticket validity.
4. **Safety Filter Priority**: Caregiver linkage and step-free accessibility are non-negotiable hard constraints that prune options *prior* to multi-attribute ranking.

---

## 4. Ethical & Fair Usage Considerations
* **Anti-Scalping & Concurrency**: The Tatkal hold manager models single-seat-holder locks with a strict 3-minute authoritative clock, rejecting duplicate attempts and providing accessible extensions for assistive technology users.
* **Accessible Representation**: Every metric includes human-readable ranges, text equivalents for visual badges, and screen-reader polite notifications.
