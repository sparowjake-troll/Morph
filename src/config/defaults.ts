import { MorphConfigSchema, type MorphConfig } from './schema.js';

export const DEFAULT_CONFIG: MorphConfig = MorphConfigSchema.parse({});
