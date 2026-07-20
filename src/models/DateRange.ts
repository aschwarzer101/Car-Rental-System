/** Represents a half-open date interval [start, end).
 * assuming 'end'exclusive: a 3-day rental starting Monday occupies
 * Mon/Tues/Wed and frees up Thursday morning  
 */

export class DateRange {
    readonly start: Date; 
    readonly end: Date; 

    constructor(start: Date, numDays: number) {
        if (numDays <= 0) {
            throw new Error(`numDays must be positive, got ${numDays}`);
        }
        this.start = new Date(start);
        this.end = new Date(start);
        this.end.setDate(this.end.getDate() + numDays);
    }


/** 
 * Two half-open durations [s1, e1) and [s2, e2) overlap iff
 * s1 < e2 AND s2 < e1. Ranges that merely touch at a boundary
   * (one ends exactly when the other starts) do NOT overlap (not factoring in
   * if custoemr later specifies a turnover-period) -- back-to-back same-day
   * rentals possible here
 */

    overlaps(other: DateRange): boolean {
        return this.start < other.end && other.start < this.end;
    }

    toString(): string {
        return `${this.start.toDateString()} - ${this.end.toDateString()}`;
    } 
}