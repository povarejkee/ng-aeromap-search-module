import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class MapApi {
  execute(moduleName: string, api: string, ...args) {
    const argsStrings: string[] = args.map((arg: any, idx: number) => {
      return idx === args.length - 1 && args.length > 1
        ? JSON.stringify(arg)
        : JSON.stringify(arg) + ', '
    })

    console.log(`window.mapApi.execute("${moduleName}", "${api}", ${argsStrings.join('')})`)
  }
}
