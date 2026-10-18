import { Seeder } from "@veap/database";
import { Tag } from "../models/Tag.js";
import "../factories/TagFactory.js";

export class TagSeeder extends Seeder {
  async run(): Promise<void> {
    const count = await Tag.count();
    if (count === 0) {
      await Tag.factory(10).create();
    }
  }
}
