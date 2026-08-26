import { uniqueSuffix } from './helpers';

export interface EmployeeData {
  firstName: string;
  middleName?: string;
  lastName: string;
}

/**
 * Generates a unique employee payload.
 * Uses a timestamp suffix so names don't clash on the shared OrangeHRM demo,
 * whose database is periodically refreshed.
 */
export function generateEmployee(): EmployeeData {
  const suffix = uniqueSuffix();
  return {
    firstName: `Test${suffix}`,
    middleName: '',
    lastName: `Auto${suffix}`,
  };
}
