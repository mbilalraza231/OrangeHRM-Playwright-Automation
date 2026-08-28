import { uniqueSuffix } from './helpers';

export interface EmployeeData {
  firstName: string;
  middleName: string;
  lastName: string;
  nationality: string;
  maritalStatus: string;
  gender: 'Male' | 'Female';
  otherId?: string;
  driverLicenseNumber?: string;
  dateOfBirth?: string;
}

/** Generates a unique employee payload for E2E tests using timestamp-based names. */
export function generateEmployee(): EmployeeData {
  const suffix = uniqueSuffix();

  const firstNames  = ['Ahmad', 'Basit', 'Faisal', 'Zain', 'Hamza', 'Usman', 'Bilal'];
  const middleNames = ['Ali', 'Raza', 'Hassan', 'Iqbal'];
  const lastNames   = ['Khan', 'Ahmed', 'Siddiqui', 'Shah', 'Malik', 'Butt'];

  const randSelect = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  return {
    firstName:           `${randSelect(firstNames)}${suffix}`,
    middleName:          `${randSelect(middleNames)}${suffix}`,
    lastName:            `${randSelect(lastNames)}${suffix}`,
    nationality:         'Pakistani',
    maritalStatus:       'Single',
    gender:              'Male',
    otherId:             `OID${suffix}`,
    driverLicenseNumber: `DL${suffix}`,
    dateOfBirth:         '1998-01-15',
  };
}