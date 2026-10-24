// Deterministic Pseudo-Random Number Generator (Mulberry32)

export class SeededPRNG {
  private state: number;

  constructor(seed: number = 42891) {
    this.state = seed | 0;
  }

  // Returns pseudo-random float in [0, 1)
  nextFloat(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns pseudo-random integer in [min, max] inclusive
  nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat() * (max - min + 1)) + min;
  }

  // Pick random element from array deterministically
  pick<T>(arr: T[]): T {
    return arr[Math.floor(this.nextFloat() * arr.length)];
  }

  // Reseed generator
  reseed(seed: number): void {
    this.state = seed | 0;
  }
}
