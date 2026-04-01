export class MorphError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'MorphError';
  }
}

export class ConfigError extends MorphError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'CONFIG_ERROR', details);
    this.name = 'ConfigError';
  }
}

export class ExtractionError extends MorphError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'EXTRACTION_ERROR', details);
    this.name = 'ExtractionError';
  }
}

export class BrowserError extends MorphError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'BROWSER_ERROR', details);
    this.name = 'BrowserError';
  }
}

export class GenerationError extends MorphError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'GENERATION_ERROR', details);
    this.name = 'GenerationError';
  }
}

export class AuditError extends MorphError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'AUDIT_ERROR', details);
    this.name = 'AuditError';
  }
}

export class FigmaError extends MorphError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'FIGMA_ERROR', details);
    this.name = 'FigmaError';
  }
}
