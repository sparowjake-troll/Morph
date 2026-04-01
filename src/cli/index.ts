#!/usr/bin/env node

import { Command } from 'commander';
import { cloneCommand } from './commands/clone.js';
import { extractCommand } from './commands/extract.js';
import { auditCommand } from './commands/audit.js';
import { optimizeCommand } from './commands/optimize.js';
import { log } from './utils/logger.js';

const program = new Command()
  .name('morph')
  .description('AI website cloner — clone any website into clean Next.js + Tailwind code')
  .version('2.0.0')
  .configureOutput({
    writeErr: (str) => log.error(str.trim()),
  });

program.addCommand(cloneCommand);
program.addCommand(extractCommand);
program.addCommand(auditCommand);
program.addCommand(optimizeCommand);

program.parse();
