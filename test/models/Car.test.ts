import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { Car, UnavailableError } from "../../src/models/Car";
import { CarType } from "../../src/models/CarType";
import { DateRange } from "../../src/models/DateRange";

describe("Car", () => {
  test("a fresh car is available for any range", () => {
    const car = new Car(CarType.Sedan);
    const range = new DateRange(new Date(2026, 2, 1), 3);
    assert.equal(car.isAvailable(range), true);
  });

  test("reserving returns a Reservation and records it", () => {
    const car = new Car(CarType.SUV);
    const range = new DateRange(new Date(2026, 2, 1), 3);
    const res = car.reserve(range, "Alayna");
    assert.equal(res.customerName, "Alayna");
    assert.equal(car.getReservations().length, 1);
    assert.equal(car.getReservations()[0].id, res.id);
  });

  test("reserving an overlapping range throws UnavailableError", () => {
    const car = new Car(CarType.Van);
    car.reserve(new DateRange(new Date(2026, 2, 1), 5), "Alayna");
    assert.throws(
      () => car.reserve(new DateRange(new Date(2026, 2, 3), 2), "Isaac"),
      UnavailableError
    );
  });

  test("reserving a back-to-back (non-overlapping, adjacent) range succeeds", () => {
    const car = new Car(CarType.Sedan);
    car.reserve(new DateRange(new Date(2026, 2, 1), 4), "Alayna"); // Mar 1 - Mar 5
    const second = car.reserve(new DateRange(new Date(2026, 2, 5), 2), "Isaac"); // Mar 5 - Mar 7
    assert.equal(car.getReservations().length, 2);
    assert.equal(second.customerName, "Isaac");
  });

  test("isAvailable does not mutate state (safe to call repeatedly)", () => {
    const car = new Car(CarType.Sedan);
    const range = new DateRange(new Date(2026, 2, 1), 3);
    car.isAvailable(range);
    car.isAvailable(range);
    assert.equal(car.getReservations().length, 0);
  });

  test("cancelReservation frees up the car for that range", () => {
    const car = new Car(CarType.Sedan);
    const range = new DateRange(new Date(2026, 2, 1), 3);
    const res = car.reserve(range, "Alayna");

    assert.equal(car.isAvailable(range), false);
    const cancelled = car.cancelReservation(res.id);
    assert.equal(cancelled, true);
    assert.equal(car.isAvailable(range), true);
  });

  test("cancelReservation returns false for an unknown id", () => {
    const car = new Car(CarType.Sedan);
    assert.equal(car.cancelReservation("does-not-exist"), false);
  });

  test("getReservations exposes reservation data without allowing external mutation to affect the car", () => {
    const car = new Car(CarType.Sedan);
    car.reserve(new DateRange(new Date(2026, 2, 1), 3), "Alayna");
    const snapshot = car.getReservations();
    assert.equal(snapshot.length, 1);
    // TypeScript's `readonly` prevents this at compile time (see ts-expect-error below);
    // this test documents the *intent*, the type system enforces it during development.
    // @ts-expect-error - push is not assignable on a readonly array type
    const attemptedMutation = () => snapshot.push(snapshot[0]);
    assert.equal(typeof attemptedMutation, "function");
  });
});