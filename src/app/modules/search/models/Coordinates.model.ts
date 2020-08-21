import { ICoordinates } from "./Coordinates.interface";
import { ICoordinateChecks } from "./CoordinateChecks.interface";

export class CoordinatesModel implements ICoordinates {
  readonly str: string

  public finalCoordinates: string[] = []
  public strictRegExps: RegExp[] = []
  public partialRegExps: RegExp[] = [
    /[0-9]{1,3}[°]{1}/, // [0] 55°
    /[0-9]{1,7}[NSСЮEWЗВ]{1}/, // [1] 45N
    /[NSСЮEWЗВ]{1}[0-9]{1,3}[°]/, // [2] N55°
    /[0-9]{1,3}[°][NSСЮEWЗВ]{1}/, // [3] 55°N
    /[0-9]{1,3}[°]{0,1}[0-9]{1,2}[′][NSСЮEWЗВ]{1}/, // [4] 55°45′N // todo требуется перевод в десятичную систему
    /[0-9]{1,3}[,|.][0-9]{1,10}[°]{1}/, // [5] 55,755831° или 55.755831°
    /[0-9]{1,3}[°]{0,1}[0-9]{1,2}[′]{1}[0-9]{1,2}[″]{1}[NSСЮEWЗВ]{1}/, // [6] 55°45′20″N // todo требуется перевод в десятичную систему
    /[NSСЮEWЗВ]{1}[0-9]{1,3}[,|.][0-9]{1,10}[°]/, // [7] N55,755831° или N55.755831°
    /[0-9]{1,3}[°]{0,1}[0-9]{1,2}[′]{1}[0-9]{1,2}[,|.][0-9]{1,10}[″]{1}[NSСЮEWЗВ]{1}/ // [8] 55°45′20,9916″N или 55°45′20.9916″N // todo требуется перевод в десятичную систему
  ]
  public checks: ICoordinateChecks = {
    coordinatePresents: false,
    coordinateIsCorrect: false
  }

  private calledRegExpsIndexes: number[] = []

  constructor(str: string) {
    this.str = str

    for (let i = 0; i < this.partialRegExps.length; i++) {
      this.strictRegExps.push(
        new RegExp('^' + String(this.partialRegExps[i]).slice(1, -1) + '$')
      )
    }
  }

  setChecks(): void {
    if (this.str.length > 2) {
      this.checks.coordinatePresents
        = this.partialRegExps.some((exp: RegExp) => exp.test(this.str))

      if (this.checks.coordinatePresents) {
        let splittedStr = this.str.split(' ').map(item => item.trim()) // todo возможно, придётся пересмотреть подобные решения

        if (this.str.includes('/')) {
          splittedStr = this.str.split('/').map(item => item.trim())
        } else if (this.str.includes(', ')) {
          splittedStr = this.str.split(', ').map(item => item.trim())
        } else if (this.str.includes(' ,')) {
          splittedStr = this.str.split(' ,').map(item => item.trim())
        }

        if (
          this.isEvenQuantityOfCoordinates(splittedStr) && this.isValidByStrictRegExp(splittedStr)
          && this.isSameTypeOfCoordinates() && this.isInTheRightOrder(splittedStr)
          && this.isTheRangesCorrect(splittedStr)
        ) {
          if (this.isIncludeCardinalPoints(splittedStr)) {
            this.finalCoordinates = splittedStr
          } else {
            this.finalCoordinates = splittedStr.map((part: string, idx: number) => {
              return (idx + 1) % 2 === 0 ? 'В' + part : 'C' + part
            })
          }
          console.log('before transform', this.finalCoordinates)
          this.finalCoordinates = this.transformCoordinatesToDecimalFormat(this.finalCoordinates)
          console.log('after transform', this.finalCoordinates)
        } else {
          console.error('Координаты невалидны!')
        }
      }
    }
  }

  private isEvenQuantityOfCoordinates(parts: string[]): boolean {
    return parts.length % 2 === 0
  }

  private isValidByStrictRegExp(parts: string[]): boolean {
    return parts.every((part: string) => {
      return this.strictRegExps.some((exp: RegExp, idx: number) => {
        const isValid = exp.test(part)
        if (isValid) {
          this.calledRegExpsIndexes.push(idx)
          return exp.test(part)
        }
      })
    })
  }

  private isSameTypeOfCoordinates(): boolean {
    return [...new Set(this.calledRegExpsIndexes)].length === 1
  }

  private isIncludeCardinalPoints(parts: string[]): boolean {
    const cardinalPointsRegExp = /[NSСЮEWЗВ]{1}/
    return parts.every((part: string) => cardinalPointsRegExp.test(part))
  }

  private isInTheRightOrder(parts: string[]): boolean {
    const latitudeCardinalPointsRegExp = /[NSСЮ]{1}/
    const longitudeCardinalPointsForRegExp = /[EWЗВ]{1}/
    const odds: string[] = []
    const evens: string[] = []

    parts.forEach((part: string, idx: number) => {
      (idx + 1) % 2 === 0 ? evens.push(part) : odds.push(part)
    })

    if (this.isIncludeCardinalPoints(parts)) {
      const oddsIsOK
        = odds.every((part: string) => latitudeCardinalPointsRegExp.test(part))
      const evensIsOK
        = evens.every((part: string) => longitudeCardinalPointsForRegExp.test(part))


      return oddsIsOK && evensIsOK
    } else {
        return true
        /**
         * todo перед трансформацией добавлять 'Север' каждой нечетной координате
         * и каждой четной -- 'Восток'
         */
    }
  }

  private isTheRangesCorrect(parts: string[]): boolean {
    const odds: string[] = []
    const evens: string[] = []

    parts.forEach((part: string, idx: number) => {
      (idx + 1) % 2 === 0 ? evens.push(part) : odds.push(part)
    })

    if (
      odds.every((part: string) => this.strictRegExps[0].test(part))
      && evens.every((part: string) => this.strictRegExps[0].test(part))
    ) {
      return this.check0Type(odds, evens)
    }

    if (
      odds.every((part: string) => this.strictRegExps[1].test(part))
      && evens.every((part: string) => this.strictRegExps[1].test(part))
    ) {
      return this.check1Type(odds, evens)
    }

    if (
      odds.every((part: string) => this.strictRegExps[2].test(part))
      && evens.every((part: string) => this.strictRegExps[2].test(part))
    ) {
      return this.check2Type(odds, evens)
    }

    if (
      odds.every((part: string) => this.strictRegExps[3].test(part))
      && evens.every((part: string) => this.strictRegExps[3].test(part))
    ) {
      return this.check3Type(odds, evens)
    }


    if (
      odds.every((part: string) => this.strictRegExps[4].test(part))
      && evens.every((part: string) => this.strictRegExps[4].test(part))
    ) {
      return this.check4Type(odds, evens)
    }

    if (
      odds.every((part: string) => this.strictRegExps[5].test(part))
      && evens.every((part: string) => this.strictRegExps[5].test(part))
    ) {
      return this.check5Type(odds, evens)
    }

    if (
      odds.every((part: string) => this.strictRegExps[6].test(part))
      && evens.every((part: string) => this.strictRegExps[6].test(part))
    ) {
      return this.check6Type(odds, evens)
    }

    if (
      odds.every((part: string) => this.strictRegExps[7].test(part))
      && evens.every((part: string) => this.strictRegExps[7].test(part))
    ) {
      return this.check7Type(odds, evens)
    }

    if (
      odds.every((part: string) => this.strictRegExps[8].test(part))
      && evens.every((part: string) => this.strictRegExps[8].test(part))
    ) {
      return this.check8Type(odds, evens)
    }
  }

  private check0Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const latitude = Number(part.match(/-{0,1}[0-9]{0,}[^°]/)[0]) // 55°
      return latitude <= 90 && latitude >= -90
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const longitude = Number(part.match(/-{0,1}[0-9]{0,}[^°]/)[0])
      return longitude <= 180 && longitude >= -180
    })

    console.log(oddsCorrect, evensCorrect, odds, evens)
    return oddsCorrect && evensCorrect
  }

  private check1Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const latitude = Number(part.match(/-{0,1}[0-9]{0,}[^NSСЮEWЗВ]/)[0]) // 45N
      return latitude <= 90 && latitude >= -90
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const longitude = Number(part.match(/-{0,1}[0-9]{0,}[^NSСЮEWЗВ]/)[0])
      return longitude <= 180 && longitude >= -180
    })

    console.log(oddsCorrect, evensCorrect, odds, evens)
    return oddsCorrect && evensCorrect
  }

  private check2Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const latitude = Number(part.match(/[^NSСЮEWЗВ]-{0,1}[0-9]{0,}[^°]/)[0]) // N55°
      return latitude <= 90 && latitude >= -90
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const longitude = Number(part.match(/[^NSСЮEWЗВ]-{0,1}[0-9]{0,}[^°]/)[0])
      return longitude <= 180 && longitude >= -180
    })

    console.log(oddsCorrect, evensCorrect, odds, evens)
    return oddsCorrect && evensCorrect
  }

  private check3Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const latitude = Number(part.match(/-{0,1}[0-9]{0,}[^°NSСЮEWЗВ]/)[0]) // 55°N
      return latitude <= 90 && latitude >= -90
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const longitude = Number(part.match(/-{0,1}[0-9]{0,}[^°NSСЮEWЗВ]/)[0])
      return longitude <= 180 && longitude >= -180
    })

    console.log(oddsCorrect, evensCorrect, odds, evens)
    return oddsCorrect && evensCorrect
  }

  private check4Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const [latitude, minutes] = part.match(/-{0,1}[0-9]{1,}/g) // 55°45′N 55°45′E 55°45′S 55°45′W
      return +latitude <= 89 && +latitude >= -89 && +minutes <= 59 && +minutes >= 1
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const [longitude, minutes] = part.match(/-{0,1}[0-9]{1,}/g)
      return +longitude <= 179 && +longitude >= -179 && +minutes <= 59 && +minutes >= 1
    })

    console.log(oddsCorrect, evensCorrect, odds, evens)
    return oddsCorrect && evensCorrect
  }

  private check5Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const [latitude, decimal] = part.match(/-{0,1}[0-9]{1,}/g) // 55,755831°
      return +latitude <= 89 && +latitude >= -89 && +decimal <= 999999 && +decimal >= 1
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const [longitude, decimal] = part.match(/-{0,1}[0-9]{1,}/g)
      return +longitude <= 179 && +longitude >= -179 && +decimal <= 999999 && +decimal >= 1
    })

    console.log(oddsCorrect, evensCorrect, odds, evens)
    return oddsCorrect && evensCorrect
  }

  private check6Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const [latitude, minutes, seconds] = part.match(/-{0,1}[0-9]{1,}/g) // 55°45′20″N
      return +latitude <= 89 && +latitude >= -89
        && +minutes <= 59 && +minutes >= 1
        && +seconds <= 59 && +seconds >= 1
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const [longitude, minutes, seconds] = part.match(/-{0,1}[0-9]{1,}/g)
      return +longitude <= 179 && +longitude >= -179
        && +minutes <= 59 && +minutes >= 1
        && +seconds <= 59 && +seconds >= 1
    })

    console.log(oddsCorrect, evensCorrect, odds, evens)
    return oddsCorrect && evensCorrect
  }

  private check7Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const [latitude, decimal] = part.match(/-{0,1}[0-9]{1,}/g) // N55,755831°
      return +latitude <= 89 && +latitude >= -89 && +decimal <= 999999 && +decimal >= 1
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const [longitude, decimal] = part.match(/-{0,1}[0-9]{1,}/g)
      return +longitude <= 179 && +longitude >= -179 && +decimal <= 999999 && +decimal >= 1
    })

    console.log(oddsCorrect, evensCorrect, odds, evens)
    return oddsCorrect && evensCorrect
  }

  private check8Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const [latitude, minutes, seconds, milliseconds] = part.match(/-{0,1}[0-9]{1,}/g) // 55°45′20,9916″N
      return +latitude <= 89 && +latitude >= -89
        && +minutes <= 59 && +minutes >= 1
        && +seconds <= 59 && +seconds >= 1
        && +milliseconds <= 9999 && +milliseconds >= 1
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const [longitude, minutes, seconds, milliseconds] = part.match(/-{0,1}[0-9]{1,}/g)
      return +longitude <= 179 && +longitude >= -179
        && +minutes <= 59 && +minutes >= 1
        && +seconds <= 59 && +seconds >= 1
        && +milliseconds <= 9999 && +milliseconds >= 1
    })

    console.log(oddsCorrect, evensCorrect, odds, evens)
    return oddsCorrect && evensCorrect
  }

  private transformCoordinatesToDecimalFormat(coordinates: string[]): string[] {
    const is4Type = coordinates.every((part: string) => this.strictRegExps[4].test(part))
    const is6Type = coordinates.every((part: string) => this.strictRegExps[6].test(part))
    const is8Type = coordinates.every((part: string) => this.strictRegExps[8].test(part))

    const result: string[] = []

    if (is4Type) {
      coordinates.forEach((part: string) => {
        const [degrees, minutes] = part.match(/-{0,1}[0-9]{1,}/g)
        const transformedPart = Number(degrees) + Number(minutes) / 60

        result.push(String(+transformedPart.toFixed(6)))
      })

      return result
    }

    if (is6Type) {
      coordinates.forEach((part: string) => {
        const [degrees, minutes, seconds] = part.match(/-{0,1}[0-9]{1,}/g)
        const transformedPart = Number(degrees) + Number(minutes) / 60 + Number(seconds) / 3600

        result.push(String(+transformedPart.toFixed(6)))
      })

      return result
    }

    if (is8Type) {
      coordinates.forEach((part: string) => {
        const [degrees, minutes, seconds, milliseconds] = part.match(/-{0,1}[0-9]{1,}/g)
        const transformedPart = Number(degrees) + Number(minutes) / 60 + Number(seconds) / 3600 + Number(milliseconds) / 3600000

        result.push(String(+transformedPart.toFixed(6)))
      })

      return result
    }

    return coordinates
  }
}



