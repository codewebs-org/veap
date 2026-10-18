import { faker } from "@faker-js/faker";
import { Factory } from "@veap/database";
import { Tag } from "../models/Tag.js";

export class TagFactory extends Factory<Tag> {
  constructor() {
    super(Tag);
  }

  definition() {
    return {};
  }

  async createOne(override: Record<string, any> = {}): Promise<Tag> {
    const tag = await super.createOne(override);
    const idSuffix = tag.id.split("-")[0];
    const namePl = faker.lorem.word();
    const nameEn = faker.lorem.word();

    tag.fillTranslations({
      pl: {
        name: namePl,
        slug: `${faker.helpers.slugify(namePl).toLowerCase()}-${idSuffix}`,
      },
      en: {
        name: nameEn,
        slug: `${faker.helpers.slugify(nameEn).toLowerCase()}-${idSuffix}`,
      },
    });
    await tag.save();

    return tag;
  }
}

export const createTagFactory = () => new TagFactory();

Factory.register(Tag, TagFactory);
