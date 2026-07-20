import { randomUUID } from "node:crypto";
import { CarType } from "./CarType";
import { DateRange } from "./DateRange.ts";
import { Reservation } from "./Reservation";

export class UnavailableError extends Error {
  constructor(carId: string, range: DateRange) {
    super(`Car ${carId} is not available for ${range.toString()}`);
    this.name = "UnavailableError";
  }
}

export class Car {
  readonly id: string;
  readonly type: CarType;
  private readonly reservations: Reservation[] = [];

  constructor(type: CarType) {
    this.id = randomUUID();
    this.type = type;
  }

  isAvailable(range: DateRange): boolean {
    return !this.reservations.some((r) => r.range.overlaps(range));
  }

  reserve(range: DateRange, customerName: string): Reservation {
    if (!this.isAvailable(range)) {
      throw new UnavailableError(this.id, range);
    }
    const reservation = new Reservation(range, customerName);
    this.reservations.push(reservation);
    return reservation;
  }

  cancelReservation(reservationId: string): boolean {
    const index = this.reservations.findIndex((r) => r.id === reservationId);
    if (index === -1) return false;
    this.reservations.splice(index, 1);
    return true;
  }

  getReservations(): readonly Reservation[] {
    return this.reservations;
  }
}