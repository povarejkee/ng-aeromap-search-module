import { ICoordinates } from "./Coordinates.interface";

export class CoordinatesModel implements ICoordinates {
  readonly str: string

  public finalCoordinates: number[][] = []
  public strictRegExps: RegExp[] = [
    /^-{0,1}[0-9]{1,3}[°]{1}$/,
    /^[0-9]{1,7}[NSСЮEWЗВ]{1}$/,
    /^[NSСЮEWЗВ]{1}[0-9]{1,3}[°]$/,
    /^[0-9]{1,3}[°][NSСЮEWЗВ]{1}$/,
    /^[0-9]{1,3}[°]{0,1}[0-9]{1,2}[′][NSСЮEWЗВ]{1}$/,
    /^-{0,1}[0-9]{1,3}[,|.][0-9]{1,10}[°]{1}$/,
    /^[0-9]{1,3}[°]{0,1}[0-9]{1,2}[′]{1}[0-9]{1,2}[″]{1}[NSСЮEWЗВ]{1}$/,
    /^[NSСЮEWЗВ]{1}[0-9]{1,3}[,|.][0-9]{1,10}[°]$/,
    /^[0-9]{1,3}[°]{0,1}[0-9]{1,2}[′]{1}[0-9]{1,2}[,|.][0-9]{1,10}[″]{1}[NSСЮEWЗВ]{1}$/
  ]
  public partialRegExps: RegExp[] = [
    /-{0,1}[0-9]{1,3}[°]{1}/g,
    // [0] 55° 55° 55° 55°
    /[0-9]{1,7}[NSСЮEWЗВ]{1}/g,
    // [1] 45N 45W 45N 45E
    /[NSСЮEWЗВ]{1}[0-9]{1,3}[°]/g,
    // [2] N55° E55° N55° W55°
    /[0-9]{1,3}[°][NSСЮEWЗВ]{1}/g,
    // [3] 55°N 55°W 55°N 55°E
    /[0-9]{1,3}[°]{0,1}[0-9]{1,2}[′][NSСЮEWЗВ]{1}/g,
    // [4] 55°45′N 55°45′W 55°45′N 55°45′E
    /-{0,1}[0-9]{1,3}[,|.][0-9]{1,10}[°]{1}/g,
    // [5] 55,755831° 55,755831° 55,755831° 55,755831°
    /[0-9]{1,3}[°]{0,1}[0-9]{1,2}[′]{1}[0-9]{1,2}[″]{1}[NSСЮEWЗВ]{1}/g,
    // [6] 55°45′20″N 55°45′20″W 55°45′20″N 55°45′20″E
    /[NSСЮEWЗВ]{1}[0-9]{1,3}[,|.][0-9]{1,10}[°]/g,
    // [7] N55,755831° W55,755831° N55,755831° E55,755831°
    /[0-9]{1,3}[°]{0,1}[0-9]{1,2}[′]{1}[0-9]{1,2}[,|.][0-9]{1,10}[″]{1}[NSСЮEWЗВ]{1}/g
    // [8] 55°45′20,9916″N 55°45′20,9916″W 55°45′20,9916″N 55°45′20,9916″E
  ]
  public coordinatesPresents: boolean = false
  public isValid: boolean = false

  private activeType: number = null
  private calledRegExpsIndexes: number[] = []

  constructor(str: string) {
    this.str = str
  }

  checkForTrashOnLeftSide(correctArr): boolean {
    if (correctArr) {
      const [ first ] = correctArr
      const isEmptyOnLeft: number = this.str.trim().indexOf(first)

      return isEmptyOnLeft === 0
    }
  }

  checkForTrashOnRightSide(correctArr): boolean {
    if (correctArr) {
      const last: string = correctArr[correctArr.length - 1]
      const pureStr: string = this.str.trim()
      const endOfStr: string[] = []

      for (let i = 1; i <= last.length; i++) {
        endOfStr.push(pureStr[pureStr.length - i])
      }

      return last === endOfStr.reverse().join('')
    }
  }


  setChecks(): void {
    if (this.str.length > 2) {
      this.coordinatesPresents
        = this.partialRegExps.some((exp: RegExp) => exp.test(this.str))

      if (this.coordinatesPresents) {
        const allMatches: string[] = []

        for (let i = 0; i < this.partialRegExps.length; i++) {
          const matches = this.str.match(this.partialRegExps[i])
          if (matches) {
            allMatches.push(...matches)
          }
        }

        const sortedByType: string[][] = this.partialRegExps.reduce((
          accumulator: string[][],
          exp: RegExp,
        ) => {
          const filteredByType: string[] = allMatches.filter((part: string) => {
            const _exp: RegExp = new RegExp(exp) // пиздец какой-то
            return _exp.test(part)
          })

          if (filteredByType.length) {
            accumulator.push(filteredByType)
          }

          return accumulator
        }, [])

        const correctGroup: string[] = this.getCorrectGroup(sortedByType)

        console.group()
          console.log('Все совпадения', allMatches)
          console.log('Сортировка по типам совпадений', sortedByType)
          console.log('Верная группа из сортированных типов', correctGroup)
          console.log('Начало строки', this.checkForTrashOnLeftSide(correctGroup))
          console.log('Конец строки', this.checkForTrashOnRightSide(correctGroup))
        console.groupEnd()

        if (
          this.isOnlyOneCorrectGroup(sortedByType)
          && this.checkForTrashOnLeftSide(correctGroup)
          && this.checkForTrashOnRightSide(correctGroup)
          && this.isTheRangesCorrect(correctGroup)
        ) {
          this.finalCoordinates = this.transformCoordinatesToDecimalFormat(correctGroup)
          this.isValid = true
        } else {
          console.error('Координаты невалидны! (Модель)')
          this.isValid = false
        }
      }
    }
  }

  private getCorrectGroup(groups): string[] {
    return groups.find(group =>
      this.isEvenQuantityOfCoordinates(group)
      && this.isValidByStrictRegExp(group)
      && this.isInTheRightOrder(group)
      && this.isSameTypeOfCoordinates()
    )
  }

  private isOnlyOneCorrectGroup(groups): boolean {
    const correctGroups = groups.filter((group: string[]) =>
      this.isEvenQuantityOfCoordinates(group)
      && this.isValidByStrictRegExp(group)
      && this.isInTheRightOrder(group)
      && this.isSameTypeOfCoordinates()
    )

    return correctGroups.length === 1
  }

  private isEvenQuantityOfCoordinates(parts: string[]): boolean {
    return parts.length % 2 === 0
  }

  // TODO переделать метод тк уже не нужно частично
  private isValidByStrictRegExp(parts: string[]): boolean {
    this.calledRegExpsIndexes = []
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
    const setOfCalledRegExpsIndexes = new Set(this.calledRegExpsIndexes)

    if ([...setOfCalledRegExpsIndexes].length === 1) {
      this.activeType = [...setOfCalledRegExpsIndexes][0]
      return true
    } else {
      return false
    }
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

    return oddsCorrect && evensCorrect
  }

  private check1Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const values = part.match(/[0-9]{0,}[^NSСЮEWЗВ]/)[0].split('') // 45N

      let latitude: number
      let minutes: number
      let seconds: number

      if (values.length === 6) {
        latitude = Number(values[0] + values[1])
        minutes = Number(values[2] + values[3])
        seconds = Number(values[4] + values[5])

        return latitude <= 89 && latitude >= -89
          && minutes <= 59 && minutes >= 1
          && seconds <= 59 && seconds >= 1
      }

      if (values.length === 4) {
        latitude = Number(values[0] + values[1])
        minutes = Number(values[2] + values[3])

        return latitude <= 89 && latitude >= -89
          && minutes <= 59 && minutes >= 1
      }

      if (values.length === 2) {
        latitude = Number(values[0] + values[1])

        return latitude <= 89 && latitude >= -89
      }

      if (values.length === 1) {
        latitude = Number(values[0])

        return latitude <= 89 && latitude >= -89
      }
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const values: string[] = part.match(/[0-9]{0,}[^NSСЮEWЗВ]/)[0].split('') // 45N

      let longitude: number
      let minutes: number
      let seconds: number

      if (values.length === 7) {
        longitude = Number(values[0] + values[1] + values[2])
        minutes = Number(values[3] + values[4])
        seconds = Number(values[5] + values[6])

        return longitude <= 179 && longitude >= -179
          && minutes <= 59 && minutes >= 1
          && seconds <= 59 && seconds >= 1
      }

      if (values.length === 6) {
        longitude = Number(values[0] + values[1])
        minutes = Number(values[2] + values[3])
        seconds = Number(values[4] + values[5])

        return longitude <= 179 && longitude >= -179
          && minutes <= 59 && minutes >= 1
          && seconds <= 59 && seconds >= 1
      }

      if (values.length === 4) {
        longitude = Number(values[0] + values[1])
        minutes = Number(values[2] + values[3])

        return longitude <= 179 && longitude >= -179
          && minutes <= 59 && minutes >= 1
      }

      if (values.length === 3) {
        longitude = Number(values[0] + values[1] + values[2])

        return longitude <= 179 && longitude >= -179
      }

      if (values.length === 2) {
        longitude = Number(values[0] + values[1])

        return longitude <= 179 && longitude >= -179
      }

      if (values.length === 1) {
        longitude = Number(values[0])

        return longitude <= 179 && longitude >= -179
      }
    })

    return oddsCorrect && evensCorrect
  }

  private check2Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const latitude = Number(part.match(/[^NSСЮEWЗВ][0-9]{0,}[^°]/)[0]) // N55°
      return latitude <= 90 && latitude >= -90
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const longitude = Number(part.match(/[^NSСЮEWЗВ][0-9]{0,}[^°]/)[0])
      return longitude <= 180 && longitude >= -180
    })

    return oddsCorrect && evensCorrect
  }

  private check3Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const latitude = Number(part.match(/[0-9]{0,}[^°NSСЮEWЗВ]/)[0]) // 55°N
      return latitude <= 90 && latitude >= -90
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const longitude = Number(part.match(/[0-9]{0,}[^°NSСЮEWЗВ]/)[0])
      return longitude <= 180 && longitude >= -180
    })

    return oddsCorrect && evensCorrect
  }

  private check4Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const [latitude, minutes] = part.match(/[0-9]{1,}/g) // 55°45′N 55°45′E 55°45′S 55°45′W
      return +latitude <= 89 && +latitude >= -89 && +minutes <= 59 && +minutes >= 1
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const [longitude, minutes] = part.match(/[0-9]{1,}/g)
      return +longitude <= 179 && +longitude >= -179 && +minutes <= 59 && +minutes >= 1
    })

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

    return oddsCorrect && evensCorrect
  }

  private check6Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const [latitude, minutes, seconds] = part.match(/[0-9]{1,}/g) // 55°45′20″N
      return +latitude <= 89 && +latitude >= -89
        && +minutes <= 59 && +minutes >= 1
        && +seconds <= 59 && +seconds >= 1
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const [longitude, minutes, seconds] = part.match(/[0-9]{1,}/g)
      return +longitude <= 179 && +longitude >= -179
        && +minutes <= 59 && +minutes >= 1
        && +seconds <= 59 && +seconds >= 1
    })

    return oddsCorrect && evensCorrect
  }

  private check7Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const [latitude, decimal] = part.match(/[0-9]{1,}/g) // N55,755831°
      return +latitude <= 89 && +latitude >= -89 && +decimal <= 999999 && +decimal >= 1
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const [longitude, decimal] = part.match(/[0-9]{1,}/g)
      return +longitude <= 179 && +longitude >= -179 && +decimal <= 999999 && +decimal >= 1
    })

    return oddsCorrect && evensCorrect
  }

  private check8Type(odds: string[], evens: string[]): boolean {
    const oddsCorrect: boolean = odds.every((part: string) => {
      const [latitude, minutes, seconds, milliseconds] = part.match(/[0-9]{1,}/g) // 55°45′20,9916″N
      return +latitude <= 89 && +latitude >= -89
        && +minutes <= 59 && +minutes >= 1
        && +seconds <= 59 && +seconds >= 1
        && +milliseconds <= 9999 && +milliseconds >= 1
    })

    const evensCorrect: boolean = evens.every((part: string) => {
      const [longitude, minutes, seconds, milliseconds] = part.match(/[0-9]{1,}/g)
      return +longitude <= 179 && +longitude >= -179
        && +minutes <= 59 && +minutes >= 1
        && +seconds <= 59 && +seconds >= 1
        && +milliseconds <= 9999 && +milliseconds >= 1
    })

    return oddsCorrect && evensCorrect
  }

  private transformCoordinatesToDecimalFormat(coordinates: string[]): number[][] {
    const subResult: number[] = []
    const pairs: number[][] = []

    switch (this.activeType) {
      case 0:
        coordinates.forEach((part: string) => {
          const transformedPart: string = part.match(/-{0,1}[0-9]{1,}/)[0]
          subResult.push(+transformedPart)
        })
        break

      case 1:
        coordinates.forEach((part: string) => {
          const values: string[] = part.match(/[0-9]{1,}/)[0].split('')

          let degrees: number
          let minutes: number
          let seconds: number
          let transformedPart: number

          switch (values.length) {
            case 7:
              degrees = Number(values[0] + values[1] + values[2])
              minutes = Number(values[3] + values[4])
              seconds = Number(values[5] + values[6])
              transformedPart = Number(degrees) + Number(minutes) / 60 + Number(seconds) / 3600
              break
            case 6:
              degrees = Number(values[0] + values[1])
              minutes = Number(values[2] + values[3])
              seconds = Number(values[4] + values[5])
              transformedPart = Number(degrees) + Number(minutes) / 60 + Number(seconds) / 3600
              break
            case 4:
              degrees = Number(values[0] + values[1])
              minutes = Number(values[2] + values[3])
              transformedPart = Number(degrees) + Number(minutes) / 60
              break
            case 3:
              degrees = Number(values[0] + values[1] + values[2])
              transformedPart = Number(degrees)
              break
            case 2:
              degrees = Number(values[0] + values[1])
              transformedPart = Number(degrees)
              break
            case 1:
              degrees = Number(values[0])
              transformedPart = Number(degrees)
              break
          }

          if (/[SЮWЗ]/.test(part)) {
            transformedPart = Number(`-${transformedPart}`)
          }

          subResult.push(+transformedPart.toFixed(6))
        })
        break

      case 2:
      case 3:
        coordinates.forEach((part: string) => {
          let transformedPart: string = part.match(/[0-9]{1,}/)[0]

          if (/[SЮWЗ]/.test(part)) {
            transformedPart = '-' + transformedPart
          }

          subResult.push(+transformedPart)
        })
        break

      case 4:
        coordinates.forEach((part: string) => {
          const [degrees, minutes] = part.match(/[0-9]{1,}/g)
          let transformedPart: number = Number(degrees) + Number(minutes) / 60

          if (/[SЮWЗ]/.test(part)) {
            transformedPart = Number(`-${transformedPart}`)
          }

          subResult.push(+transformedPart.toFixed(6))
        })
        break

      case 5:
      case 7:
        coordinates.forEach((part: string) => {
          let transformedPart: string = part.match(/-{0,1}[0-9]{1,3}[,|.][0-9]{1,10}/)[0]

          if (/[SЮWЗ]/.test(part)) {
            transformedPart = `-${transformedPart}`
          }

          if (transformedPart.includes('.')) {
            subResult.push(+transformedPart)
          } else {
            const [number, decimal] = transformedPart.split(',')
            subResult.push(+`${number}.${decimal}`)
          }
        })
        break

      case 6:
        coordinates.forEach((part: string) => {
          const [degrees, minutes, seconds] = part.match(/[0-9]{1,}/g)
          let transformedPart: number = Number(degrees) + Number(minutes) / 60 + Number(seconds) / 3600

          if (/[SЮWЗ]/.test(part)) {
            transformedPart = Number(`-${transformedPart}`)
          }

          subResult.push(+transformedPart.toFixed(6))
        })
        break

      case 8:
        coordinates.forEach((part: string) => {
          const [degrees, minutes, seconds, milliseconds] = part.match(/[0-9]{1,}/g)
          let transformedPart: number = Number(degrees) + Number(minutes) / 60 + Number(seconds) / 3600 + Number(milliseconds) / 3600000

          if (/[SЮWЗ]/.test(part)) {
            transformedPart = Number(`-${transformedPart}`)
          }

          subResult.push(+transformedPart.toFixed(6))
        })
        break
    }

    for (let i = 0; i < subResult.length; i += 2) {
      pairs.push([subResult[i], subResult[i + 1]])
    }

    return pairs
  }

  get result() {
    return this.finalCoordinates
  }
}



