import { IResults } from "./Results.interface";

export class ResultsModel implements IResults {
  public objects: any = []
  public settlements: any = []
  public restrictedAreas: any = []
  public highways: any = []
  public locations: any = []
  public summaryLength: number = null
}
