import chalk from 'chalk';

export const log = {
  info: (msg: string): void => {
    console.log(chalk.blue('ℹ'), msg);
  },

  success: (msg: string): void => {
    console.log(chalk.green('✓'), msg);
  },

  warn: (msg: string): void => {
    console.log(chalk.yellow('⚠'), msg);
  },

  error: (msg: string): void => {
    console.error(chalk.red('✗'), msg);
  },

  step: (step: number, total: number, msg: string): void => {
    console.log(chalk.dim(`[${step}/${total}]`), msg);
  },

  heading: (msg: string): void => {
    console.log();
    console.log(chalk.bold.underline(msg));
    console.log();
  },

  dim: (msg: string): void => {
    console.log(chalk.dim(msg));
  },

  table: (data: Record<string, string | number>): void => {
    const maxKeyLen = Math.max(...Object.keys(data).map((k) => k.length));
    for (const [key, value] of Object.entries(data)) {
      console.log(`  ${chalk.dim(key.padEnd(maxKeyLen))}  ${value}`);
    }
  },

  divider: (): void => {
    console.log(chalk.dim('─'.repeat(50)));
  },
};
