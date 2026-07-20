import { randomUUID } from "node:crypto";
import { DateRange } from "./DateRange";

export class Reservation {
  readonly id: string;
  readonly range: DateRange;
  readonly customerName: string;

  constructor(range: DateRange, customerName: string) {
    this.id = randomUUID();
    this.range = range;
    this.customerName = customerName;
  }
}