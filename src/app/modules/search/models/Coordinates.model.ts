import {ICoordinates} from "./Coordinates.interface";
import {ICoordinateChecks} from "./ICoordinateChecks.interface";

export class CoordinatesModel implements ICoordinates {
  readonly str: string

  public strictRegExps: RegExp[] = []
  public partialRegExps: RegExp[] = [
    /[0-9]{1,3}[°]{1}/, // 55°
    /[0-9]{1,7}[NSСЮEWЗВ]{1}/, // 45N
    /[NSСЮEWЗВ]{1}[0-9]{1,3}[°]/, // N55°
    /[0-9]{1,3}[°][NSСЮEWЗВ]{1}/, // 55°N
    /[0-9]{1,3}[°]{0,1}[0-9]{1,2}[′][NSСЮEWЗВ]{1}/, // 55°45′N
    ///[0-9]{1,6}[NSСЮ]{1}[0-9]{1,7}[EWЗВ]{1}/, // 45С55В
    /[0-9]{1,3}[,|.][0-9]{1,10}[°]{1}/, // 55,755831° или 55.755831°
    /[0-9]{1,3}[°]{0,1}[0-9]{1,2}[′]{1}[0-9]{1,2}[″]{1}[NSСЮEWЗВ]{1}/, // 55°45′20″N
    /[NSСЮEWЗВ]{1}[0-9]{1,3}[,|.][0-9]{1,10}[°]/, // N55,755831° или N55.755831°
    /[0-9]{1,3}[°]{0,1}[0-9]{1,2}[′]{1}[0-9]{1,2}[,|.][0-9]{1,10}[″]{1}[NSСЮEWЗВ]{1}/, // 55°45′20,9916″N или 55°45′20.9916″N
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

        if (this.isEvenQuantityOfCoordinates(splittedStr)) {

          // если четны, то валидны ли по строгим регуляркам?
          if (this.isValidByRegExp(splittedStr)) {

            // если валидны, то относятся ли к одному типу?
            if (this.isSameTypeOfCoordinates()) {

              // если относятся к одному типу, то верный ли порядок?
              if (this.isInTheRightOrder(splittedStr)) {

                // если верный порядок, то всё ли ОК с диапазонами?
                // todo сделать проверку диапазонов

              } else {
                console.log('Координаты должны быть переданы в правильном порядке!')
              }
            } else {
              console.error('Координаты должны быть переданы в одинаковом формате!')
            }
          } else {
            console.error('Координаты невалидны')
          }
        } else {
          console.error('Число координат в строке должно быть четным')
        }
      }
    }
  }

  private isEvenQuantityOfCoordinates(parts: string[]): boolean {
    return parts.length % 2 === 0
  }

  private isValidByRegExp(parts: string[]): boolean {
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

    if (this.isIncludeCardinalPoints(parts)) {
      parts.forEach((part: string, idx: number) => {
        (idx + 1) % 2 === 0 ? evens.push(part) : odds.push(part)
      })

      const oddsIsOK
        = odds.every((part: string) => latitudeCardinalPointsRegExp.test(part))
      const evensIsOK
        = evens.every((part: string) => longitudeCardinalPointsForRegExp.test(part))


      if (oddsIsOK && evensIsOK) { // todo не забыть сократить этот код (пока нужны логи)
        console.log('Порядок заебись!')
        return true
      } else {
        console.log('С порядком хуйня!')
        return false
      }
    } else {
      console.log('Сторон свет нет, заебись!')
      return true
      /**
       * todo нужно при трансформации это учесть
       * и добавлять Север (N || С) каждой нечетной координате по умолчанию
       * и каждой четной -- Запад (W || З)
       */
    }
  }
}
