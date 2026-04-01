import ora, { type Ora } from 'ora';

export function createSpinner(text: string): Ora {
  return ora({ text, spinner: 'dots' });
}

export async function withSpinner<T>(
  text: string,
  fn: () => Promise<T>,
  successText?: string
): Promise<T> {
  const spinner = createSpinner(text);
  spinner.start();
  try {
    const result = await fn();
    spinner.succeed(successText ?? text);
    return result;
  } catch (error) {
    spinner.fail(text);
    throw error;
  }
}

export class ProgressTracker {
  private current = 0;
  private spinner: Ora;

  constructor(
    private total: number,
    private label: string
  ) {
    this.spinner = ora({ text: this.formatText(), spinner: 'dots' });
  }

  start(): void {
    this.spinner.start();
  }

  increment(detail?: string): void {
    this.current++;
    this.spinner.text = this.formatText(detail);
  }

  succeed(text?: string): void {
    this.spinner.succeed(text ?? `${this.label} (${this.total}/${this.total})`);
  }

  fail(text?: string): void {
    this.spinner.fail(text ?? `${this.label} failed at ${this.current}/${this.total}`);
  }

  private formatText(detail?: string): string {
    const progress = `${this.current}/${this.total}`;
    const base = `${this.label} (${progress})`;
    return detail ? `${base} — ${detail}` : base;
  }
}
