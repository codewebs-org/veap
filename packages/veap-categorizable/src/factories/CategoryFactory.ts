import { faker } from "@faker-js/faker";
import { Factory } from "@veap/database";
import { Category } from "../models/Category.js";

export class CategoryFactory extends Factory<Category> {
  constructor() {
    super(Category);
  }

  definition() {
    return {};
  }

  async createOne(override: Record<string, any> = {}): Promise<Category> {
    const category = await super.createOne(override);
    const idSuffix = category.id.split("-")[0];
    const namePl = faker.lorem.words(2);
    const nameEn = faker.lorem.words(2);

    category.fillTranslations({
      pl: {
        name: namePl,
        slug: `${faker.helpers.slugify(namePl).toLowerCase()}-${idSuffix}`,
        description: faker.lorem.sentence(),
      },
      en: {
        name: nameEn,
        slug: `${faker.helpers.slugify(nameEn).toLowerCase()}-${idSuffix}`,
        description: faker.lorem.sentence(),
      },
    });
    await category.save();

    return category;
  }
}

export const createCategoryFactory = () => new CategoryFactory();

Factory.register(Category, CategoryFactory);
