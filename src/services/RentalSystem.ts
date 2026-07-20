import { Fleet } from "./Fleet";
import { CarType } from "../models/CarType";
import { DateRange } from "../models/DateRange";
import { Reservation } from "../models/Reservation";

export class NoAvailabilityError extends Error {
  constructor(type: CarType, range: DateRange) {
    super(`No ${type} available for ${range.toString()}`);
    this.name = "NoAvailabilityError";
  }
}

export class RentalSystem {
  constructor(private readonly fleet: Fleet) {}

  /**
   * Public entry point: callers deal in plain Dates and numbers,
   * never in our internal DateRange type. RentalSystem is the
   * boundary that translates primitives into the domain model.
   */
  reserveCar(
    type: CarType,
    startDate: Date,
    numDays: number,
    customerName: string
  ): Reservation {
    const range = new DateRange(startDate, numDays);
    const car = this.fleet.findAvailableCar(type, range);
    if (!car) {
      throw new NoAvailabilityError(type, range);
    }
    return car.reserve(range, customerName);
  }

  cancelReservation(reservationId: string): boolean {
    const car = this.fleet.findCarByReservationId(reservationId);
    if (!car) return false;
    return car.cancelReservation(reservationId);
  }
}