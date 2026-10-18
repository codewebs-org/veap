import type { VeapConfig } from "@veap/kernel";

const config: VeapConfig = {
  debug: process.env.NODE_ENV !== "production",
};

export default config;
