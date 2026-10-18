# Seeders and model factories (`@veap/database`)

`@veap/database` includes a fluent model factory engine and database seeder runner. These tools let you populate development databases with realistic fake data, generate fixtures for automated tests, and execute reproducible initial data seeds.

## Defining model factories (`defineFactory`)

Model factories generate mock records with default attributes, state modifications, and sequential values. Use `defineFactory(ModelClass, definitionFn)` to declare a factory:

```ts
// lib/database/factories/user.factory.ts
import { defineFactory } from "@veap/database";
import { User } from "../../models/user";

export const UserFactory = defineFactory(User, () => ({
  username: `user_${Math.random().toString(36).slice(2, 8)}`,
  email: `user_${Math.random().toString(36).slice(2, 8)}@example.com`,
  role: "member",
  isActive: true,
}));
```

You can also use libraries such as `@faker-js/faker` inside the definition function for realistic names, addresses, and timestamps.

### Making and creating instances

Factories support both in-memory generation (`make`, `makeOne`) and database persistence (`create`, `createOne`):

```ts
// Instantiate in memory without persisting to the database
const unsavedUser = await UserFactory.makeOne();
const unsavedBatch = await UserFactory(5).make();

// Create and persist directly to the database
const savedUser = await UserFactory.createOne({ role: "admin" });
const savedUsers = await UserFactory.count(10).create();
```

### Factory states and sequences

Use `.state()` to apply attribute transformations for specific scenarios, and `.sequence()` to cycle through a list of values:

```ts
// Apply state overrides
const adminUsers = await UserFactory.count(3)
  .state({ role: "admin" })
  .create();

// Apply dynamic attribute states
const verifiedUsers = await UserFactory.count(5)
  .state((attributes) => ({
    emailVerifiedAt: new Date(),
    email: `verified_${attributes.username}@example.com`,
  }))
  .create();

// Cycle through alternating values
const mixedRoleUsers = await UserFactory.count(4)
  .sequence({ role: "member" }, { role: "editor" }, { role: "admin" })
  .create();
```

## Writing database seeders (`Seeder`)

Seeders populate your tables with initial system records (such as default roles, permissions, or administrative accounts) and test fixtures. Extend the `Seeder` base class and implement `run()`:

```ts
// lib/database/seeders/roles.seeder.ts
import { Seeder } from "@veap/database";
import { Role } from "../../models/role";

export class RolesSeeder extends Seeder {
  async run(): Promise<void> {
    const roles = ["admin", "editor", "member"];

    for (const name of roles) {
      await Role.query().insert({
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }
}
```

### Composing seeders (`this.call`)

In larger applications, create a master `DatabaseSeeder` that invokes other seeders sequentially using `this.call()`:

```ts
// lib/database/seeders/database.seeder.ts
import { Seeder } from "@veap/database";
import { UserFactory } from "../factories/user.factory";
import { PermissionsSeeder } from "./permissions.seeder";
import { RolesSeeder } from "./roles.seeder";

export class DatabaseSeeder extends Seeder {
  async run(): Promise<void> {
    // 1. Run role and permission seeders in order
    await this.call([RolesSeeder, PermissionsSeeder]);

    // 2. Seed test users with factories
    await UserFactory.count(20).create();
  }
}
```

### Executing seeders programmatically (`runSeeders`)

Call `runSeeders` to execute one or more seeder classes. Pass `inTransaction: true` to wrap all seeders in a single rollbackable database transaction:

```ts
import { runSeeders } from "@veap/database";
import { DatabaseSeeder } from "./database/seeders/database.seeder";

await runSeeders(DatabaseSeeder, {
  inTransaction: true,
});
```

## Running seeds with custom CLI commands

To run seeders from your terminal via `bun veap seed`, create a custom console command extending `Command` from `@veap/kernel/cli`:

```ts
// lib/commands/seed.command.ts
import { runSeeders } from "@veap/database";
import { Command, type CommandInput, type Output } from "@veap/kernel/cli";
import { DatabaseSeeder } from "../database/seeders/database.seeder";

export class SeedCommand extends Command {
  static override signature =
    "db:seed {--f|force : Run without confirmation prompt}";
  static override description = "Seed the database with records";

  async handle(input: CommandInput, output: Output): Promise<number> {
    if (!input.flag("force") && !this.context.flags.force) {
      const confirmed = await output.confirm(
        `Seed database in ${this.context.env} environment?`,
      );
      if (!confirmed) {
        output.warn("Seeding aborted.");
        return 0;
      }
    }

    output.info("Seeding database records...");
    await runSeeders(DatabaseSeeder, { inTransaction: true });
    output.success("Database seeded successfully.");
    return 0;
  }
}
```

Register `SeedCommand` in `lib/veap.ts` with `.withCommands([SeedCommand])`. You can then run `bun veap db:seed` or `bun veap db:seed --force` during automated testing or container initialization.
