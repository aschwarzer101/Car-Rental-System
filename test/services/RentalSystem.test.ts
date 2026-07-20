import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { RentalSystem, NoAvailabilityError } from "../../src/services/RentalSystem";
import { Fleet } from "../../src/services/Fleet";
import { CarType } from "../../src/models/CarType";

describe("RentalSystem", () => {
  test("reserves a car of the requested type for the requested range", () => {
    const system = new RentalSystem(new Fleet({ [CarType.Sedan]: 2 }));
    const reservation = system.reserveCar(
      CarType.Sedan,
      new Date(2026, 4, 1),
      3,
      "Alayna"
    );
    assert.equal(reservation.customerName, "Alayna");
  });

  test("throws NoAvailabilityError when the type has zero inventory", () => {
    const system = new RentalSystem(new Fleet({ [CarType.Sedan]: 1 }));
    assert.throws(
      () => system.reserveCar(CarType.SUV, new Date(2026, 4, 1), 3, "Alayna"),
      NoAvailabilityError
    );
  });

  test("throws NoAvailabilityError once every car of that type is booked for an overlapping range", () => {
    const system = new RentalSystem(new Fleet({ [CarType.Van]: 1 }));
    system.reserveCar(CarType.Van, new Date(2026, 4, 1), 5, "Alayna");

    assert.throws(
      () => system.reserveCar(CarType.Van, new Date(2026, 4, 3), 2, "Isaac"),
      NoAvailabilityError
    );
  });

  test("succeeds for a non-overlapping range on the same single car", () => {
    const system = new RentalSystem(new Fleet({ [CarType.Van]: 1 }));
    system.reserveCar(CarType.Van, new Date(2026, 4, 1), 4, "Alayna"); // May 1 - May 5
    const second = system.reserveCar(CarType.Van, new Date(2026, 4, 5), 2, "Isaac"); // May 5 - May 7
    assert.equal(second.customerName, "Isaac");
  });

  test("cancelling a reservation frees the car for that range again", () => {
    const system = new RentalSystem(new Fleet({ [CarType.Sedan]: 1 }));
    const range = { start: new Date(2026, 4, 1), days: 3 };
    const reservation = system.reserveCar(
      CarType.Sedan,
      range.start,
      range.days,
      "Alayna"
    );

    // No inventory left for an overlapping request
    assert.throws(() =>
      system.reserveCar(CarType.Sedan, new Date(2026, 4, 2), 1, "Isaac")
    );

    const cancelled = system.cancelReservation(reservation.id);
    assert.equal(cancelled, true);

    // Now it succeeds
    const rebooked = system.reserveCar(CarType.Sedan, new Date(2026, 4, 2), 1, "Isaac");
    assert.equal(rebooked.customerName, "Isaac");
  });

  test("cancelReservation returns false for an unknown reservation id", () => {
    const system = new RentalSystem(new Fleet({ [CarType.Sedan]: 1 }));
    assert.equal(system.cancelReservation("does-not-exist"), false);
  });
});