import { ICoordinateChecks } from "./ICoordinateChecks.interface";

export interface ICoordinates {
  str: string
  strictRegExps: RegExp[]
  partialRegExps: RegExp[]
  checks: ICoordinateChecks
  setChecks(): void
}
