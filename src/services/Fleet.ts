import { Car } from "../models/Car";
import { CarType } from "../models/CarType";
import { DateRange } from "../models/DateRange";

export class Fleet {
  private readonly carsByType: Map<CarType, Car[]> = new Map();

  constructor(inventory: Partial<Record<CarType, number>>) {
    for (const [type, count] of Object.entries(inventory) as [CarType, number][]) {
      const cars: Car[] = [];
      for (let i = 0; i < count; i++) {
        cars.push(new Car(type));
      }
      this.carsByType.set(type, cars);
    }
  }

  private carsOfType(type: CarType): Car[] {
    return this.carsByType.get(type) ?? [];
  }

  /** First-fit: returns the first car of this type that's free for the range, or undefined. */
  findAvailableCar(type: CarType, range: DateRange): Car | undefined {
    return this.carsOfType(type).find((car) => car.isAvailable(range));
  }

  totalCarsOfType(type: CarType): number {
    return this.carsOfType(type).length;
  }

  /** Searches across the whole fleet for the car holding a given reservation. */
  findCarByReservationId(reservationId: string): Car | undefined {
    for (const cars of this.carsByType.values()) {
      const match = cars.find((car) =>
        car.getReservations().some((r) => r.id === reservationId)
      );
      if (match) return match;
    }
    return undefined;
  }
}