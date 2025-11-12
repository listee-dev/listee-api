import { createJiti } from "jiti";
import type { NextConfig } from "next";

type EnvModule = typeof import("./src/app/env");

const jiti = createJiti(import.meta.url);

const loadEnvModule = async (): Promise<void> => {
  const envModule = await jiti.import<EnvModule>("./src/app/env");
  envModule.getEnv();
};

const nextConfig: NextConfig = {
  /* config options here */
};

export default async (): Promise<NextConfig> => {
  await loadEnvModule();
  return nextConfig;
};
