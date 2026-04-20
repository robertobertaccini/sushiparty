/**
 * Application-wide constants
 */

export const LOCATIONS = [
  'Roma',
  'Milano'
] as const;

export type Location = typeof LOCATIONS[number];

export const isValidLocation = (value: string): value is Location => {
  return LOCATIONS.includes(value as Location);
};

export const ADDITIONAL_SERVICES = [
  { id: '1', name: 'Premium Fish Upgrade', price: 20 },
  { id: '2', name: 'Waiter Service', price: 100 },
  { id: '3', name: 'Extra Wasabi/Ginger', price: 5 },
] as const;
