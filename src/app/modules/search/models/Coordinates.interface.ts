export interface ICoordinates {
  str: string;
  strictRegExps: RegExp[];
  partialRegExps: RegExp[];
  finalCoordinates: number[][];
  coordinatesPresents: boolean;
  isValid: boolean;
  setChecks(): void;
}
