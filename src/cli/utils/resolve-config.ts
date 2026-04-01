import { cosmiconfig } from 'cosmiconfig';
import { MorphConfigSchema, type MorphConfig } from '../../config/schema.js';
import { ConfigError } from '../../core/errors.js';

const explorer = cosmiconfig('morph', {
  searchPlaces: [
    'morph.config.ts',
    'morph.config.js',
    'morph.config.mjs',
    'morph.config.json',
    '.morphrc',
    '.morphrc.json',
    'package.json',
  ],
});

export async function resolveConfig(explicitPath?: string): Promise<MorphConfig> {
  try {
    const result = explicitPath
      ? await explorer.load(explicitPath)
      : await explorer.search();

    const rawConfig = result?.config ?? {};
    return MorphConfigSchema.parse(rawConfig);
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      throw new ConfigError('Invalid morph configuration', {
        errors: (error as unknown as { errors: unknown[] }).errors,
      });
    }
    throw new ConfigError(
      `Failed to load configuration: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
