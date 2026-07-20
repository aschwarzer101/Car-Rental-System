import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { Fleet } from "../../src/services/Fleet";
import { CarType } from "../../src/models/CarType";
import { DateRange } from "../../src/models/DateRange";

describe("Fleet", () => {
  test("constructs the requested number of cars per type", () => {
    const fleet = new Fleet({ [CarType.Sedan]: 3, [CarType.Van]: 1 });
    assert.equal(fleet.totalCarsOfType(CarType.Sedan), 3);
    assert.equal(fleet.totalCarsOfType(CarType.Van), 1);
    assert.equal(fleet.totalCarsOfType(CarType.SUV), 0); // never specified
  });

  test("findAvailableCar returns undefined when a type has zero inventory", () => {
    const fleet = new Fleet({ [CarType.Sedan]: 2 });
    const range = new DateRange(new Date(2026, 3, 1), 2);
    assert.equal(fleet.findAvailableCar(CarType.SUV, range), undefined);
  });

  test("findAvailableCar returns a car when one is free", () => {
    const fleet = new Fleet({ [CarType.Sedan]: 1 });
    const range = new DateRange(new Date(2026, 3, 1), 2);
    const car = fleet.findAvailableCar(CarType.Sedan, range);
    assert.notEqual(car, undefined);
    assert.equal(car!.type, CarType.Sedan);
  });

  test("findAvailableCar skips booked cars and returns the next free one", () => {
    const fleet = new Fleet({ [CarType.Sedan]: 2 });
    const range = new DateRange(new Date(2026, 3, 1), 2);

    const first = fleet.findAvailableCar(CarType.Sedan, range)!;
    first.reserve(range, "Alayna");

    const second = fleet.findAvailableCar(CarType.Sedan, range);
    assert.notEqual(second, undefined);
    assert.notEqual(second!.id, first.id); // got a *different* car
  });

  test("findAvailableCar returns undefined once every car of that type is booked for the range", () => {
    const fleet = new Fleet({ [CarType.Van]: 2 });
    const range = new DateRange(new Date(2026, 3, 1), 2);

    fleet.findAvailableCar(CarType.Van, range)!.reserve(range, "Alayna");
    fleet.findAvailableCar(CarType.Van, range)!.reserve(range, "Isaac");

    assert.equal(fleet.findAvailableCar(CarType.Van, range), undefined);
  });

  test("car types with separate inventory don't interfere with each other", () => {
    const fleet = new Fleet({ [CarType.Sedan]: 1, [CarType.SUV]: 1 });
    const range = new DateRange(new Date(2026, 3, 1), 2);

    fleet.findAvailableCar(CarType.Sedan, range)!.reserve(range, "Alayna");

    // Sedan pool is now exhausted, but SUV pool is untouched
    assert.equal(fleet.findAvailableCar(CarType.Sedan, range), undefined);
    assert.notEqual(fleet.findAvailableCar(CarType.SUV, range), undefined);
  });

  test("findCarByReservationId locates the owning car", () => {
    const fleet = new Fleet({ [CarType.Sedan]: 2 });
    const range = new DateRange(new Date(2026, 3, 1), 2);
    const car = fleet.findAvailableCar(CarType.Sedan, range)!;
    const reservation = car.reserve(range, "Alayna");

    const found = fleet.findCarByReservationId(reservation.id);
    assert.equal(found?.id, car.id);
  });

  test("findCarByReservationId returns undefined for an unknown id", () => {
    const fleet = new Fleet({ [CarType.Sedan]: 1 });
    assert.equal(fleet.findCarByReservationId("does-not-exist"), undefined);
  });
});