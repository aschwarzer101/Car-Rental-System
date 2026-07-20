import { Fleet } from "./services/Fleet";
import { RentalSystem, NoAvailabilityError } from "./services/RentalSystem";
import { CarType } from "./models/CarType";
import { UnavailableError } from "./models/Car";

/**
 * Small end-to-end demo of the rental system. This is the only place
 * in the codebase that talks to a human via console.log — everything
 * in src/models and src/services stays presentation-agnostic (Model-Controller seperation) and
 * communicates purely through return values and typed errors.
 */
function main() {
  const fleet = new Fleet({
    [CarType.Sedan]: 2,
    [CarType.SUV]: 1,
    [CarType.Van]: 1,
  });
  const system = new RentalSystem(fleet);

  console.log("--- Car Rental System Demo ---\n");
  // Using new Date(year, monthIndex, day) rather than ISO date strings like
  // "2026-06-01" deliberately: bare ISO date strings are parsed as UTC, 
  // can result in shifted time from input depending on machine time zone
  // The (year, month, day) constructor always means "this calendar date,
  // local time" with no parsing ambiguity. Month is 0-indexed (5 = June).

// Happy path: reserve a sedan
const res1 = system.reserveCar(CarType.Sedan, new Date(2026, 5, 1), 3, "Alayna");
console.log(`Reserved sedan for Alayna: ${res1.range.toString()} (id: ${res1.id})`);

// Happy path: reserve the last SUV
const res2 = system.reserveCar(CarType.SUV, new Date(2026, 5, 1), 2, "Isaac");
console.log(`Reserved SUV for Isaac: ${res2.range.toString()} (id: ${res2.id})`);

// Expected failure: no SUVs left for an overlapping window
try {
  system.reserveCar(CarType.SUV, new Date(2026, 5, 2), 1, "Bandit");
} catch (err) {
  if (err instanceof NoAvailabilityError) {
    console.log(`\nExpected failure caught: ${err.message}`);
  } else {
    throw err;
  }
}
 // Cancel Isaac's SUV reservation, freeing it up
 const cancelled = system.cancelReservation(res2.id);
 console.log(`\nCancelled Isaac's reservation: ${cancelled}`);

 // Now the same request that failed above succeeds
 const res3 = system.reserveCar(CarType.SUV, new Date(2026, 5, 2), 1, "Bandit");
 console.log(`Reserved SUV for Bandit after cancellation: ${res3.range.toString()}`);
 
  console.log("\n--- Demo complete ---");
}

main();