import { Seeder } from "@veap/database";
import { Category } from "../models/Category.js";
import "../factories/CategoryFactory.js";

export class CategorySeeder extends Seeder {
  async run(): Promise<void> {
    const count = await Category.count();
    if (count === 0) {
      await Category.factory(5).create();
    }
  }
}
