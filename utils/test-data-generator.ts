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

  const firstNames = ['Ahmad', 'Basit', 'Faisal', 'Zain', 'Hamza', 'Usman', 'Bilal'];
  const middleNames = ['Ali', 'Raza', 'Hassan', 'Iqbal'];
  const lastNames = ['Khan', 'Ahmed', 'Siddiqui', 'Shah', 'Malik', 'Butt'];

  const randSelect = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  // We append the unique suffix to the names to ensure zero collisions in shared demo environments
  return {
    // Basic employee information
    firstName: `${randSelect(firstNames)}${suffix}`,
    middleName: `${randSelect(middleNames)}${suffix}`,
    lastName: `${randSelect(lastNames)}${suffix}`,

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