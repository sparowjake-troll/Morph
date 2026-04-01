import type { GeneratedFile } from '../../core/types.js';
import type { MorphConfig } from '../../config/schema.js';

export interface OutputAdapter {
  name: string;
  description: string;
  transform(files: GeneratedFile[], config: MorphConfig): GeneratedFile[];
  getProjectFiles(config: MorphConfig): GeneratedFile[];
}
