export interface FormPatternConfig {
  name: string;
  fields: Array<{ name: string; type: string; label: string; required: boolean; validation?: string }>;
  submitLabel?: string;
}

export function generateFormPattern(config: FormPatternConfig): string {
  const { name, fields, submitLabel = 'Submit' } = config;

  const zodSchema = fields.map((f) => {
    let validator = 'z.string()';
    if (f.required) validator += '.min(1, "Required")';
    if (f.type === 'email') validator += '.email("Invalid email")';
    if (f.type === 'url') validator += '.url("Invalid URL")';
    if (f.type === 'number') validator = 'z.coerce.number()';
    return `  ${f.name}: ${validator},`;
  }).join('\n');

  const fieldInputs = fields.map((f) => `
      <div>
        <label htmlFor="${f.name}" className="block text-sm font-medium mb-1">
          ${f.label}${f.required ? ' *' : ''}
        </label>
        <input
          id="${f.name}"
          type="${f.type}"
          {...register('${f.name}')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          aria-invalid={errors.${f.name} ? 'true' : undefined}
        />
        {errors.${f.name} && (
          <p className="mt-1 text-sm text-destructive">{errors.${f.name}?.message}</p>
        )}
      </div>`).join('\n');

  return `'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { cn } from '@/lib/utils';

const ${name}Schema = z.object({
${zodSchema}
});

type ${name}Data = z.infer<typeof ${name}Schema>;

export interface ${name}Props {
  className?: string;
  onSubmit?: (data: ${name}Data) => void;
}

export function ${name}({ className, onSubmit }: ${name}Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<${name}Data>();

  const handleFormSubmit = handleSubmit((data) => {
    onSubmit?.(data);
  });

  return (
    <form onSubmit={handleFormSubmit} className={cn('space-y-4', className)}>
${fieldInputs}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting...' : '${submitLabel}'}
      </button>
    </form>
  );
}
`;
}
