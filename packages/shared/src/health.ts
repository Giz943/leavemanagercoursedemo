import { z } from 'zod';

/** Response of the health query, shared by the API and the web app. */
export const HealthResponseSchema = z
  .object({
    status: z.enum(['ok', 'unavailable']),
    database: z.enum(['connected', 'disconnected']),
  })
  .strict();

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const HEALTH_PATH = '/api/health';
