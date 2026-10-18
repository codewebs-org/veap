import * as createTagsTables from "./20260906100000_create_tags_tables.js";

export { createTagsTables };
export const migrations = [createTagsTables];
export const taggableMigrations = [createTagsTables];
export default migrations;
