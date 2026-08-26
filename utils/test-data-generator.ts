import { uniqueSuffix } from './helpers';

export interface EmployeeData {
  firstName: string;
  middleName: string;
  lastName: string;

  // Personal Details
  nationality: string;
  maritalStatus: string;
  gender: 'Male' | 'Female';

  // Optional additional details
  otherId?: string;
  driverLicenseNumber?: string;
  dateOfBirth?: string;
}

/**
 * Generates a unique employee payload for E2E tests.
 *
 * Names are timestamp-based to reduce collisions on the
 * shared OrangeHRM demo environment.
 */
export function generateEmployee(): EmployeeData {
  const suffix = uniqueSuffix();

  return {
    // Basic employee information
    firstName: `Test${suffix}`,
    middleName: `Middle${suffix}`,
    lastName: `Auto${suffix}`,

    // Personal Details
    nationality: 'Pakistani',
    maritalStatus: 'Single',
    gender: 'Male',

    // Additional details
    otherId: `OID${suffix}`,
    driverLicenseNumber: `DL${suffix}`,
    dateOfBirth: '1998-01-15',
  };
}