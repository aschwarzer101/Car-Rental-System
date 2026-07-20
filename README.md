# Car Rental System

A simulated car rental reservation system built with TypeScript, using object-oriented
principles. Built for the Charles River Development / Alpha Platform technical assessment.

## What it does

- Reserves a car of a given type (Sedan, SUV, Van) for a start date and number of days
- Enforces a fixed, limited inventory per car type
- Prevents double-booking via date-range overlap detection
- Supports cancellation, which frees the car back up for that range
- Fully covered by unit tests, plus a runnable end-to-end demo script

## Running it

\`\`\`bash
npm install
npm test      # runs the full unit test suite (29 tests, 4 suites)
npm run demo  # runs a scripted end-to-end walkthrough of the system
\`\`\`

No external testing framework is used — tests run on Node's built-in `node:test` runner
via `tsx`. 

## Project structure

\`\`\`
src/
  models/
    CarType.ts        # enum: Sedan / SUV / Van
    DateRange.ts       # half-open [start, end) interval + overlap detection
    Reservation.ts      # id, date range, customer name
    Car.ts              # owns its own reservations; enforces no-double-booking
  services/
    Fleet.ts             # the finite per-type inventory of Car objects
    RentalSystem.ts        # public-facing API: reserve / cancel
  main.ts                    # runnable demo, the only place that talks to a console
test/
  models/    (mirrors src/models,   one test file per class)
  services/  (mirrors src/services, one test file per class)
\`\`\`

`test/` mirrors `src/` 1:1 so any file's tests are trivial to locate.

## Design decisions

**Half-open date intervals `[start, end)`.** A reservation's `end` date is the exclusive
boundary, not the last occupied day. This makes two things fall out cleanly with no
special-casing: (1) a rental starting the same day another one ends is *not* a conflict,
matching how a real rental counter works, and (2) `numDays` maps exactly onto the count of
calendar days in the range, with no off-by-one adjustment needed in either direction.

**Overlap detection lives on `DateRange`, not on `Car`.** The formula
(`s1 < e2 && s2 < e1`) is the single piece of logic the whole system's correctness depends
on, so it's isolated into its own small, independently-tested value object rather than
buried inside a larger class.

**`Car` owns its own list of `Reservation`s** (`private`, exposed only via a read-only
accessor). The only way to create a reservation is through `Car.reserve()`, which
re-checks availability itself even though callers are expected to check first — the class
never trusts a caller to have done the right thing before calling it.

**`Fleet` partitions cars by type up front** (`Map<CarType, Car[]>`) rather than filtering
one flat list on every lookup, since the requirement of "a limited number of cars per
type" is naturally a set of independent pools. Car selection within a pool is **first-fit**
— a deliberate, simple allocation policy fully contained in one method, easy to swap later.

**Two distinct error types**, not one generic error: `UnavailableError` (thrown by `Car`)
means *this specific car* is booked; `NoAvailabilityError` (thrown by `RentalSystem`) means
*no car of this type* exists that's free. They represent different layers reporting
different things, and callers can catch exactly the one they care about.

**No check-then-act race condition, and here's why:** `RentalSystem.reserveCar` finds an
available car, then reserves it, as two separate steps. In a multi-threaded runtime that
would be a classic TOCTOU (time-of-check to time-of-use) bug — another thread could grab
the same car in the gap between the two steps. It's safe here specifically because
JavaScript is single-threaded and there's no `await`/yield point between the check and the
act. Worth calling out explicitly, since the same code ported naively to a multi-threaded
language wouldn't have this guarantee for free.

## Future Design Considerations 

- **Pricing** — a `dailyRate` on `CarType` would slot in without restructuring anything
- **Persistence** — the `Car`-owns-`Reservation`s model maps directly onto a relational
  schema: `Car.reservations` becomes a reverse foreign-key query
  (`SELECT * FROM reservations WHERE car_id = ?`) rather than an in-memory array, and the
  overlap check becomes a `WHERE` clause suited to an index on `(car_id, start_date, end_date)`
- **True concurrency safety** — if this became a distributed system (multiple servers, a
  real database), the single-threaded safety argument above no longer holds, and the
  check-then-reserve sequence would need either a DB-level unique constraint/lock or an
  optimistic-concurrency retry
\`\`\`