type CalendarSystem = 'buddhist' | 'coptic' | 'ethioaa' | 'ethiopic' | 'gregory' | 'hebrew' | 'indian' | 'islamic' | 'islamicc' | 'japanese' | 'persian' | 'roc';
type NumericSystemType = 'arab' | 'arabext' | 'bali' | 'beng' | 'deva' | 'fullwide' | 'gujr' | 'guru' | 'hanidec' | 'khmr' | 'knda' | 'laoo' | 'latn' | 'limb' | 'mlym' | 'mong' | 'mymr' | 'orya' | 'tamldec' | 'telu' | 'thai' | 'tibt';
type CountryISOCode = 'AC' | 'AD' | 'AE' | 'AF' | 'AG' | 'AI' | 'AL' | 'AM' | 'AO' | 'AR' | 'AS' | 'AT' | 'AU' | 'AW' | 'AX' | 'AZ' | 'BA' | 'BB' | 'BD' | 'BE' | 'BF' | 'BG' | 'BH' | 'BI' | 'BJ' | 'BL' | 'BM' | 'BN' | 'BO' | 'BQ' | 'BR' | 'BS' | 'BT' | 'BW' | 'BY' | 'BZ' | 'CA' | 'CC' | 'CD' | 'CF' | 'CG' | 'CH' | 'CI' | 'CK' | 'CL' | 'CM' | 'CN' | 'CO' | 'CR' | 'CU' | 'CV' | 'CW' | 'CX' | 'CY' | 'CZ' | 'DE' | 'DG' | 'DJ' | 'DK' | 'DM' | 'DO' | 'DZ' | 'EA' | 'EC' | 'EE' | 'EG' | 'EH' | 'ER' | 'ES' | 'ET' | 'FI' | 'FJ' | 'FK' | 'FM' | 'FO' | 'FR' | 'GA' | 'GB' | 'GD' | 'GE' | 'GF' | 'GG' | 'GH' | 'GI' | 'GL' | 'GM' | 'GN' | 'GP' | 'GQ' | 'GR' | 'GT' | 'GU' | 'GW' | 'GY' | 'HK' | 'HN' | 'HR' | 'HT' | 'HU' | 'IC' | 'ID' | 'IE' | 'IL' | 'IM' | 'IN' | 'IO' | 'IQ' | 'IR' | 'IS' | 'IT' | 'JE' | 'JM' | 'JO' | 'JP' | 'KE' | 'KG' | 'KH' | 'KI' | 'KM' | 'KN' | 'KP' | 'KR' | 'KW' | 'KY' | 'KZ' | 'LA' | 'LB' | 'LC' | 'LI' | 'LK' | 'LR' | 'LS' | 'LT' | 'LU' | 'LV' | 'LY' | 'MA' | 'MC' | 'MD' | 'ME' | 'MF' | 'MG' | 'MH' | 'MK' | 'ML' | 'MM' | 'MN' | 'MO' | 'MP' | 'MQ' | 'MR' | 'MS' | 'MT' | 'MU' | 'MV' | 'MW' | 'MX' | 'MY' | 'MZ' | 'NA' | 'NC' | 'NE' | 'NF' | 'NG' | 'NI' | 'NL' | 'NO' | 'NP' | 'NR' | 'NU' | 'NZ' | 'OM' | 'PA' | 'PE' | 'PF' | 'PG' | 'PH' | 'PK' | 'PL' | 'PM' | 'PN' | 'PR' | 'PS' | 'PT' | 'PW' | 'PY' | 'QA' | 'RE' | 'RO' | 'RS' | 'RU' | 'RW' | 'SA' | 'SB' | 'SC' | 'SD' | 'SE' | 'SG' | 'SH' | 'SI' | 'SJ' | 'SK' | 'SL' | 'SM' | 'SN' | 'SO' | 'SR' | 'SS' | 'ST' | 'SV' | 'SX' | 'SY' | 'SZ' | 'TA' | 'TC' | 'TD' | 'TF' | 'TG' | 'TH' | 'TJ' | 'TK' | 'TL' | 'TM' | 'TN' | 'TO' | 'TR' | 'TT' | 'TV' | 'TW' | 'TZ' | 'UA' | 'UG' | 'UM' | 'US' | 'UY' | 'UZ' | 'VA' | 'VC' | 'VE' | 'VG' | 'VI' | 'VN' | 'VU' | 'WF' | 'WS' | 'XK' | 'YE' | 'YT' | 'ZA' | 'ZM' | 'ZW';
type LanguageISOCode = 'aa' | 'af' | 'ar' | 'az' | 'be' | 'bg' | 'bi' | 'bm' | 'bn' | 'bs' | 'ca' | 'cs' | 'da' | 'de' | 'dv' | 'dz' | 'el' | 'en' | 'es' | 'et' | 'fa' | 'fi' | 'fo' | 'fr' | 'gn' | 'ha' | 'he' | 'hi' | 'hr' | 'ht' | 'hu' | 'hy' | 'id' | 'is' | 'it' | 'ja' | 'ka' | 'kl' | 'km' | 'ko' | 'ky' | 'lo' | 'lt' | 'lv' | 'mg' | 'mk' | 'mn' | 'ms' | 'mt' | 'my' | 'nb' | 'ne' | 'nl' | 'pl' | 'pt' | 'rn' | 'ro' | 'ru' | 'rw' | 'si' | 'sk' | 'sl' | 'sm' | 'sn' | 'so' | 'sq' | 'sr' | 'st' | 'sv' | 'sw' | 'tg' | 'th' | 'ti' | 'tk' | 'to' | 'tr' | 'ur' | 'uz' | 'vi' | 'wo' | 'zh';

interface RelativeTimeFormatOptions {
  localeMatcher?: string;
  numeric?: string;
  style?: string;
}

declare class Environment {
  public static test(): boolean;
}

declare class Locale {
  public static calendarName(formatted: string, ident: string): string;

  constructor(locale: string);

  public toString(): string;

  public getLanguageCode(): LanguageISOCode;

  public getCountryCode(): CountryISOCode;

  public getCountryFlag(): string;

  public getCalendar(): CalendarSystem;

  public isRTL(lang?: string): boolean;

  public getNumberingSystem(): NumericSystemType;

  public numberFormat(
    number: number,
    options?: Intl.NumberFormatOptions,
  ): string

  public relativeTimeString(
    date1: Date,
    date2?: Date,
    options?: RelativeTimeFormatOptions,
  ): string

  public setCountry(country: string): Locale;

  public setCalendar(calendar: CalendarSystem): Locale;

  public getWeekDays(): number[];

  public getWeekEnds(): number[];

  public getCountryList(): {
    id: CountryISOCode,
    selected: boolean,
    defaultLanguage: LanguageISOCode,
    flag: string,
    title: string,
    titleNative: string,
  }[];

  public getLanguageList(): {
    id: LanguageISOCode,
    selected: boolean,
    rtl: boolean,
    title: string,
    titleNative: string,
  }[];

  public getCalendarList(): {
    id: CalendarSystem,
    selected: boolean,
    title: string,
    titleShort: string,
  }[];
}

// import * as luxon from 'luxon';

// // Calendar supported types
// type Calendar = 'gregorian' | 'islamic' | 'islamicc' | 'persian' | 'chinese' | 'coptic' | 'ethiopic' | 'hebrew' | 'indian' | 'japanese' | 'buddhist' | 'roc';

// // ISO 639-1 language code
// type Language = 'ar' | 'az' | 'bn' | 'de' | 'en' | 'es' | 'fa' | 'fr' | 'hi' | 'id' | 'it' | 'ja' | 'ko' | 'ku' | 'nl' | 'pl' | 'ps' | 'pt' | 'ru' | 'sw' | 'tr' | 'ur' | 'zh';

// // ISO 8601 Date time format
// type ISOFormatObject = {
//   c: string,
//   H: string,
//   HH: string,
//   m: string,
//   mm: string,
//   s: string,
//   ss: string,
//   YYYY: string,
//   YY: string,
//   MMMM: string,
//   MM: string,
//   M: string,
//   d: string,
//   dd: string,
//   E: string,
//   EE: string,
//   EEEE: string,
//   e: string,
//   G: string,
//   GGGG: string,
//   zzzz: string,
// };

// type YearItem = {
//   i: number,
//   native: string,
//   locale: string,
//   selected: boolean,
//   date: Date,
// };

// type MonthItem = {
//   i: number,
//   native: string,
//   locale: string,
//   selected: boolean,
//   date: Date,
// };

// type SpecialDay = {
//   calendar: string,
//   dayLocale: string,
//   dayNative: string,
//   monthName: string,
//   monthNumber: number,
//   monthNameNative: string
// };

// type PreferredCalendars = {
//   [key: string]: Calendar[]
// };

// type DateAlternate = {
//   calendar: Calendar,
//   dayNative: string,
//   dayLocale: string,
//   monthName: string,
//   monthNameNative: string,
// };

// type DayEvent = {
//   th: number,
//   thLocale: string,
//   title: string,
// };

// type DayInMonth = {
//   date: Date,
//   dateOnly: Date,
//   dateStart: Date,
//   dateEnd: Date,
//   dayNative: string,
//   dayLocale: string,
//   localeDate: string,
//   alt: DateAlternate[],
//   weekSeq: number,
//   weekend: boolean,
//   selected: boolean,
// };

// type MonthWeekDays = {
//   calendar: string,
//   calendarName: string,
//   calendarNameAbbr: string,
//   days: DayInMonth[],
// };

// type WeekHead = {
//   name: string,
//   narrow: string,
//   weekend: false
// };

// type MonthWeeksTable = {
//   calendar: string,
//   calendarName: string,
//   calendarNameAbbr: string,
//   head: WeekHead[],
//   weeks: DayInMonth[] | boolean[],
// };

// declare class AasaamDateTime {
//   /**
//    * IANA timezone
//    *
//    * @returns {string}
//    */
//   static public getTimeZone(): string

//   /**
//    * Create AasaamDateTime
//    *
//    * @param {Date|Number} date Standard JavaScript Date object or integer unix time
//    * @param {('ar'|'az'|'bn'|'de'|'en'|'es'|'fa'|'fr'|'hi'|'id'|'it'|'ja'|'ko'|'ku'|'nl'|'pl'|'ps'|'pt'|'ru'|'sw'|'tr'|'ur'|'zh')} language ISO 639-1 language code
//    * @param {Language} language ISO 639-1 language code

//    */
//   constructor(date?: Date | number = new Date(), language?: Language = 'fa');

//   /**
//    * @param {Language} language ISO 639-1 language code
//    * @throws {Error}
//    * @return {AasaamDateTime}
//    */
//   public setLanguage(language: Language): AasaamDateTime

//   /**
//    * @param {Date} date Standard JavaScript Date object
//    * @throws {Error}
//    * @return {AasaamDateTime}
//    */
//   public setDate(date: Date): AasaamDateTime

//   /**
//    * @param {number} unixTime Unix time integer in milliseconds
//    * @return {AasaamDateTime}
//    */
//   public setUnixTime(unixTime: number): AasaamDateTime

//   /**
//    * @return {number}
//    */
//   public getUnixTime(): number

//   /**
//    * @returns {Date}
//    */
//   public getDate(): Date

//   /**
//    * @param {number} hours Hour number between 0-23
//    * @return {AasaamDateTime}
//    */
//   public setHours(hours: number): AasaamDateTime

//   /**
//    * @param {number} minutes Minute number between 0-59
//    * @return {AasaamDateTime}
//    */
//   public setMinutes(minutes: number): AasaamDateTime

//   /**
//    * @param {number} seconds Second number between 0-59
//    * @return {AasaamDateTime}
//    */
//   public setSeconds(seconds: number): AasaamDateTime

//   /**
//    * @param {number} country ISO 3166-2 country code
//    * @return {AasaamDateTime}
//    */
//   public changeCountry(country: string): AasaamDateTime

//   /**
//    * @return {string}
//    */
//   public getCountry(): string

//   /**
//    * @param {Calendar} calendar Calendar type
//    * @return {MomentGeorgian|MomentHijri|MomentJalaali}
//    */
//   public getMoment(calendar?: Calendar = undefined): MomentGeorgian | MomentHijri | MomentJalaali;

//   /**
//    * @param {number} offset Could be negative or positive number
//    * @param {Calendar} calendar Calendar type
//    * @return {AasaamDateTime}
//    */
//   public yearOffset(offset: number, calendar?: Calendar = undefined): AasaamDateTime;

//   /**
//    * @param {number} offset Could be negative or positive number
//    * @param {Calendar} calendar Calendar type
//    * @return {AasaamDateTime}
//    */
//   public monthOffset(offset: number, calendar?: Calendar = undefined): AasaamDateTime;

//   /**
//    * @param {number} offset Could be negative or positive number
//    * @param {Calendar} calendar Calendar type
//    * @return {AasaamDateTime}
//    */
//   public dayOffset(offset: number, calendar?: Calendar = undefined): AasaamDateTime;

//   /**
//    * ISO format object
//    *
//    * Return object contains standard ISO 8601 Date
//    * - `H` _Hour, (0-23), one or two digit_ (**۴**)
//    * - `HH` _Hour, (00-23), two digit_ (**۰۴**)
//    * - `m` _Minute, (0-59), one or two digit_ (**۵**)
//    * - `mm` _Minute, (00-59), two digit_ (**۰۵**)
//    * - `s` _Second, (0-59), one or two digit_ (**۶**)
//    * - `ss` _Second, (00-59), two digit_ (**۰۶**)
//    * - `YYYY` _Year according to ISO 8601, at least four digit_ (**۱۳۸۰**)
//    * - `YY` _Year according to ISO 8601, at least two digit_ (**۸۰**)
//    * - `MMMM` _Month, localized, complete_ (**اردیبهشت**)
//    * - `MM` _Month, two digit_ (**۰۲**)
//    * - `M` _Month, one or two digit_ (**۲**)
//    * - `d` _Day of the month, one or two digit_ (**۹**)
//    * - `dd` _Day of the month, two digit_ (**۰۹**)
//    * - `E` _Day of the week, localized, number, one char_ (**۱**)
//    * - `EEEE` _Day of the week, localized, complete_ (**یکشنبه**)
//    * - `EE` _Day of the week, localized, abbreviated, one char_ (**ی**)
//    * - `e` _Day of the week, Sunday 0 to Saturday 6_ (**0**)
//    * - `G` _Epoch, localized, abbreviated_ (**ه‍.ش.**)
//    * - `GGGG` _Epoch, localized, complete_ (**هجری شمسی**)
//    * - `zzzz` _Time zone, NOT localized, complete_ (**Asia/Tehran**)
//    * - `c` _Calendar type_ (**p**)
//    *
//    * @param {Language} language ISO 639-1 language code
//    * @param {Calendar} calendar Calendar type
//    * @return {ISOFormatObject}
//    */
//   public isoFormatObject(language?: Language = undefined, calendar?: Calendar = undefined): ISOFormatObject;

//   /**
//    * Moment format
//    *
//    * @param {string} format Strong contain ISO 8601 formats
//    * @param {Language} language ISO 639-1 language code
//    * @return {string}
//    */
//   public momentFormat(format: string, language?: Language = undefined): string;

//   /**
//    * Moment parse
//    *
//    * @param {string} string String want to parse
//    * @param {string} format String contain ISO 8601 formats
//    * @param {Calendar} calendar Calendar type
//    * @return {AasaamDateTime}
//    */
//   public momentParse(string: string, format: string, calendar?: Calendar = undefined): AasaamDateTime;

//   /**
//    * @param {Calendar} calendar Calendar type
//    * @param {number} offset Offset of before and after
//    * @return {YearItem[]}
//    */
//   public generateYearList(calendar?: Calendar = undefined, offset?: number = 60): YearItem[]

//   /**
//    * @param {Calendar} calendar Calendar type
//    * @return {MonthItem[]}
//    */
//   public generateMonthList(calendar?: Calendar = undefined): MonthItem[]

//   /**
//    * @param {Date} date Standard JavaScript Date object
//    * @param {Calendar} calendar Calendar type
//    * @return {SpecialDay}
//    */
//   public getAlternateCalendarData(date: Date, calendar: Calendar): SpecialDay

//   /**
//    * @param {Calendar[]} calendarList Calendar type
//    * @return {MonthWeekDays}
//    */
//   public generateMonthWeekDays(calendarList: Calendar[] = []): MonthWeekDays

//   /**
//    * @param {Calendar[]} calendarList Calendar type
//    * @return {MonthWeeksTable}
//    */
//   public generateMonthWeekTable(calendarList: Calendar[] = []): MonthWeeksTable
// }

// export const momentG: MomentGeorgian;
// export const momentH: MomentHijri;
// export const momentJ: MomentJalaali;
// export const languages: Language[];
// export const preferredCalendars: PreferredCalendars;
// export const CALENDAR_TYPE_GREGORIAN: string = 'g';
// export const CALENDAR_TYPE_ISLAMIC: string = 'i';
// export const CALENDAR_TYPE_PERSIAN: string = 'p';
// export const AasaamDateTime: AasaamDateTime;
