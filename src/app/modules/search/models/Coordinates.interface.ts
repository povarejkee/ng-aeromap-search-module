export interface ICoordinates {
  str: string
  strictRegExps: RegExp[]
  partialRegExps: RegExp[]
  coordinatesPresents: boolean
  setChecks(): void
  result: number[][]
}
