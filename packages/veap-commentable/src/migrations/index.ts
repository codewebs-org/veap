import * as createCommentsTable from "./20260906300000_create_comments_table.js";

export { createCommentsTable };
export const migrations = [createCommentsTable];
export const commentableMigrations = [createCommentsTable];
export default migrations;
