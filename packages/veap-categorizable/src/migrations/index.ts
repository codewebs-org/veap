import * as createCategoriesTables from "./20260906200000_create_categories_tables.js";

export { createCategoriesTables };
export const migrations = [createCategoriesTables];
export const categorizableMigrations = [createCategoriesTables];
export default migrations;
