export interface ICoordinates {
  str: string
  strictRegExps: RegExp[]
  partialRegExps: RegExp[]
  coordinatesPresents: boolean
  isValid: boolean
  setChecks(): void
  result: number[][]
}
