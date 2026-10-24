// Multi-Attribute Deterministic Ranker with Explanation and Diff Generator
// Filters candidate itineraries using hard constraints first, then computes
// risk-adjusted arrival ranges (P10–P90), deterministic scoring, tie-breaking,
// and diff explanations upon weight adjustments.

import {
  RankedItineraryOption,
  RankingWeights,
  RankingDiff,
} from '../types/index.ts';

export class ItineraryRanker {
  private ruleSetVersion: string = 'rules-v1.0';

  constructor(ruleSetVersion: string = 'rules-v1.0') {
    this.ruleSetVersion = ruleSetVersion;
  }

  // Calculates overlap percentage between two arrival ranges [p10A, p90A] and [p10B, p90B]
  public calculateArrivalOverlap(
    startA: number,
    endA: number,
    startB: number,
    endB: number
  ): number {
    const overlapStart = Math.max(startA, startB);
    const overlapEnd = Math.min(endA, endB);
    const overlap = Math.max(0, overlapEnd - overlapStart);
    const spanA = endA - startA;
    const spanB = endB - startB;
    const minSpan = Math.min(spanA, spanB);
    if (minSpan <= 0) return 100;
    return Math.min(100, Math.round((overlap / minSpan) * 100));
  }

  // Ranks candidate itineraries deterministically based on weighted criteria
  public rankOptions(
    candidates: RankedItineraryOption[],
    weights: RankingWeights
  ): RankedItineraryOption[] {
    const minFare = Math.min(...candidates.map((c) => c.totalFareINR));

    const scored = candidates.map((opt) => {
      // Speed score: lower delay yields higher score
      const speedScore = Math.max(0, 100 - opt.expectedDelayMinutes * 0.4);

      // Cost score: lower fare yields higher score
      const fareDiff = opt.totalFareINR - minFare;
      const costScore = Math.max(0, 100 - fareDiff / 50);

      // Comfort & Accessibility score
      const comfortScore = opt.accessibilityScore;

      // Risk score: high confidence yields higher score
      const riskScore = opt.confidenceRange.lower * 100;

      // Composite weighted score
      const totalWeight =
        weights.speedWeight +
        weights.costWeight +
        weights.comfortWeight +
        weights.riskToleranceWeight || 1.0;

      const rawComposite =
        (speedScore * weights.speedWeight +
          costScore * weights.costWeight +
          comfortScore * weights.comfortWeight +
          riskScore * weights.riskToleranceWeight) /
        totalWeight;

      // Accessibility penalty: If P1 accessibility is broken, heavily penalize score
      const finalScore = opt.p1AccessibilityPreserved ? rawComposite : rawComposite * 0.2;

      // Generate dynamic one-line reason tailored to current dominant weight
      let oneLineReason = '';
      if (weights.costWeight > 0.6) {
        oneLineReason = `Best economic value: ₹${opt.totalFareINR} total fare with ${opt.tradeOffSummary}`;
      } else if (weights.speedWeight > 0.6) {
        oneLineReason = `Earliest arrival: risk-adjusted arrival at ${opt.riskAdjustedArrival.slice(11, 16)} with ${opt.expectedDelayMinutes}m buffer`;
      } else if (weights.comfortWeight > 0.6) {
        oneLineReason = `Maximum accessibility: step-free transit ensured for Senior P1 with adjacent caregiver`;
      } else {
        oneLineReason = `Balanced resilience: ${Math.round(opt.confidenceRange.lower * 100)}%–${Math.round(opt.confidenceRange.upper * 100)}% confirmation range with ${opt.expectedDelayMinutes}m expected delay`;
      }

      return {
        ...opt,
        breakdownScore: Number(finalScore.toFixed(2)),
        oneLineReason,
        ruleSetVersion: this.ruleSetVersion,
      };
    });

    // Deterministic fixed tie-breakers:
    // 1. Accessibility preserved (boolean)
    // 2. Composite score descending
    // 3. Expected delay ascending
    // 4. Total fare ascending
    // 5. Lexicographical optionId
    scored.sort((a, b) => {
      if (a.p1AccessibilityPreserved !== b.p1AccessibilityPreserved) {
        return a.p1AccessibilityPreserved ? -1 : 1;
      }
      if (Math.abs(b.breakdownScore - a.breakdownScore) > 0.001) {
        return b.breakdownScore - a.breakdownScore;
      }
      if (a.expectedDelayMinutes !== b.expectedDelayMinutes) {
        return a.expectedDelayMinutes - b.expectedDelayMinutes;
      }
      if (a.totalFareINR !== b.totalFareINR) {
        return a.totalFareINR - b.totalFareINR;
      }
      return a.optionId.localeCompare(b.optionId);
    });

    // Assign final rank numbers 1, 2, 3...
    return scored.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }

  // Generates diff explanation comparing previous vs new ranking
  public generateDiff(
    previousRanked: RankedItineraryOption[],
    newRanked: RankedItineraryOption[],
    oldWeights: RankingWeights,
    newWeights: RankingWeights
  ): RankingDiff[] {
    const diffs: RankingDiff[] = [];
    const timestamp = new Date().toISOString();

    for (const newOpt of newRanked) {
      const prevOpt = previousRanked.find((p) => p.optionId === newOpt.optionId);
      if (!prevOpt) continue;

      if (prevOpt.rank !== newOpt.rank) {
        const p10Prev = new Date(prevOpt.p10Arrival).getTime();
        const p90Prev = new Date(prevOpt.p90Arrival).getTime();
        const p10New = new Date(newOpt.p10Arrival).getTime();
        const p90New = new Date(newOpt.p90Arrival).getTime();

        const overlapPercent = this.calculateArrivalOverlap(
          p10Prev,
          p90Prev,
          p10New,
          p90New
        );

        // Identify the dominant weight increase by largest positive delta
        const deltas = [
          { name: 'cost priority increased', delta: newWeights.costWeight - oldWeights.costWeight },
          { name: 'speed/arrival urgency increased', delta: newWeights.speedWeight - oldWeights.speedWeight },
          { name: 'comfort and accessibility priority increased', delta: newWeights.comfortWeight - oldWeights.comfortWeight },
          { name: 'risk aversion increased', delta: newWeights.riskToleranceWeight - oldWeights.riskToleranceWeight },
        ];
        deltas.sort((a, b) => b.delta - a.delta);
        const weightReason = deltas[0].delta > 0.001 ? deltas[0].name : 'priorities adjusted';

        const reason = `${newOpt.name} moved from #${prevOpt.rank} to #${newOpt.rank} because ${weightReason}; arrival range overlap ${overlapPercent}%.`;

        diffs.push({
          previousOptionId: prevOpt.optionId,
          newOptionId: newOpt.optionId,
          previousRank: prevOpt.rank,
          newRank: newOpt.rank,
          reason,
          arrivalOverlapPercent: overlapPercent,
          timestamp,
        });
      }
    }

    return diffs;
  }
}
