import { HEALTH_PATH, HealthResponseSchema, type HealthResponse } from '@leave/shared';

/** Fetches the health status; rejects on network errors, non-2xx responses and contract breaks. */
export async function fetchHealth(): Promise<HealthResponse> {
  const response = await fetch(HEALTH_PATH);
  if (!response.ok) throw new Error(`Health request failed with ${response.status}`);
  return HealthResponseSchema.parse(await response.json());
}
