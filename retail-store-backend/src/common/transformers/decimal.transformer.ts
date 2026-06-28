import { ValueTransformer } from 'typeorm';

/**
 * MySQL returns DECIMAL columns as strings. This transformer keeps the
 * value as a JavaScript number on the entity so the API returns numbers.
 */
export const DecimalTransformer: ValueTransformer = {
  to: (value?: number) => value,
  from: (value?: string) =>
    value === null || value === undefined ? value : parseFloat(value),
};
