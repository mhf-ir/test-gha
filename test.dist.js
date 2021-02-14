(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/* eslint-disable import/no-extraneous-dependencies */

const { Locale } = require('../lib/Locale');
const { Environment } = require('../lib/Environment');
const { Calendar } = require('../lib/Calendar');

const TEST_ENV = Environment.test();

require('@formatjs/intl-locale/polyfill');
require('@formatjs/intl-displaynames/polyfill');
require('@formatjs/intl-displaynames/locale-data/en');
require('@formatjs/intl-getcanonicallocales');

const YEAR_OFFSET = 100;

const START_DATE = new Date();

const FORMAT_TOKENS = [
  'a',
  'c',
  'ccc',
  'cccc',
  'ccccc',
  'd',
  'D',
  'dd',
  'DD',
  'DDD',
  'DDDD',
  'E',
  'EEE',
  'EEEE',
  'EEEEE',
  'f',
  'F',
  'ff',
  'FF',
  'fff',
  'FFF',
  'ffff',
  'FFFF',
  'G',
  'GG',
  'GGGGG',
  'h',
  'H',
  'hh',
  'HH',
  'kk',
  'kkkk',
  'L',
  'LL',
  'LLL',
  'LLLL',
  'LLLLL',
  'm',
  'M',
  'mm',
  'MM',
  'MMM',
  'MMMM',
  'MMMMM',
  'o',
  'ooo',
  'q',
  'qq',
  'S',
  's',
  'ss',
  'SSS',
  't',
  'T',
  'tt',
  'TT',
  'ttt',
  'TTT',
  'tttt',
  'TTTT',
  'u',
  'W',
  'WW',
  'X',
  'x',
  'y',
  'yy',
  'yyyy',
  'Z',
  'z',
  'ZZ',
  'ZZZ',
  'ZZZZ',
  'ZZZZZ',
];

// eslint-disable-next-line no-new, no-undef
new Vue({
  el: '#app',
  data: {
    locale: new Locale('en-US'),
    supportable: TEST_ENV,
    formats: [],
    lang: '',
    country: '',
    calendar: '',
    year: 0,
    month: START_DATE,
    heads: [],
    weeks: [],
    years: [],
    monthList: [],
  },
  mounted() {
    this.date = START_DATE;

    this.locale = new Locale('en-US');
    this.lang = this.locale.getLanguageCode();
    this.country = this.locale.getCountryCode();
    this.calendar = this.locale.getCalendar();

    this.calendarObject = new Calendar(this.date, this.locale);
    this.heads = this.calendarObject.dayWeekList().heads;
    this.weeks = this.calendarObject.dayWeekList().weeks;
    this.years = this.calendarObject.yearList(YEAR_OFFSET);
    this.year = this.years.find((y) => y.selected).id;
    this.monthList = this.calendarObject.monthList();
    this.month = this.monthList.find((m) => m.selected).id;
  },
  computed: {},
  methods: {
    setInputDate() {
      this.drawCalendar();
    },
    drawCalendar() {
      this.calendarObject = new Calendar(this.date, this.locale);
      this.heads = this.calendarObject.dayWeekList().heads;
      this.weeks = this.calendarObject.dayWeekList().weeks;
      this.years = this.calendarObject.yearList(YEAR_OFFSET);
      this.year = this.years.find((y) => y.selected).id;
      this.monthList = this.calendarObject.monthList();
      this.month = this.monthList.find((m) => m.selected).id;
      const formats = [];
      FORMAT_TOKENS.forEach((token) => {
        formats.push({
          token,
          string: this.calendarObject.format(token, this.date),
        });
      });
      this.formats = formats;
    },

    changeLang() {
      this.locale = new Locale(this.lang);
      this.lang = this.locale.getLanguageCode();
      this.country = this.locale.getCountryCode();
      this.calendar = this.locale.getCalendar();

      if (this.locale.isRTL()) {
        // eslint-disable-next-line no-undef
        document.querySelector('html').setAttribute('dir', 'rtl');
      } else {
        // eslint-disable-next-line no-undef
        document.querySelector('html').setAttribute('dir', 'ltr');
      }

      this.drawCalendar();
    },
    changeCountry() {
      this.locale.setCountry(this.country);
      this.drawCalendar();
    },
    changeCalendar() {
      this.locale.setCalendar(this.calendar);
      this.drawCalendar();
    },
    yearChange() {
      this.calendarObject.yearJump(this.year);
      this.date = this.calendarObject.getDate();
      this.drawCalendar();
    },
    monthChange() {
      this.date = this.month;
      this.drawCalendar();
    },
    yearShift(next = true) {
      this.date = this.calendarObject.yearShift(next).getDate();
      this.drawCalendar();
    },
    monthShift(next = true) {
      this.date = this.calendarObject.monthShift(next).getDate();
      this.drawCalendar();
    },
    dayShift(next = true) {
      this.date = this.calendarObject.dayShift(next).getDate();
      this.drawCalendar();
    },
  },
});

},{"../lib/Calendar":2,"../lib/Environment":3,"../lib/Locale":4,"@formatjs/intl-displaynames/locale-data/en":73,"@formatjs/intl-displaynames/polyfill":74,"@formatjs/intl-getcanonicallocales":76,"@formatjs/intl-locale/polyfill":84}],2:[function(require,module,exports){
const luxon = require('luxon');

const { Locale } = require('./Locale');

const groupBy = (items, key) =>
  items.reduce(
    (result, item) => ({
      ...result,
      [item[key]]: [...(result[item[key]] || []), item],
    }),
    {},
  );

class Calendar {
  constructor(date = new Date(), locale = new Locale('en')) {
    this.setLocale(locale);
    this.setDate(date);
  }

  /**
   * @returns {import('./Locale').Locale}
   */
  getLocale() {
    return this.locale;
  }

  /**
   * @param {import('./Locale').Locale} locale
   * @returns {Calendar}
   */
  setLocale(locale) {
    this.locale = locale;
    return this;
  }

  /**
   * @returns {Date}
   */
  getDate() {
    return this.date;
  }

  /**
   * @param {Date} date
   * @returns {Calendar}
   */
  setDate(date) {
    this.date = date;
    return this;
  }

  /**
   * @param {String} format
   * @param {Date} date
   * @return {String}
   */
  format(format, date = this.date) {
    return luxon.DateTime.fromJSDate(date)
      .reconfigure({
        locale: this.locale.toString(),
        outputCalendar: this.locale.getCalendar(),
      })
      .toFormat(format);
  }

  /**
   * @param {String[]} tokens
   * @param {Date} date
   * @returns {Number[]}
   */
  tokenize(tokens, date = this.date) {
    return luxon.DateTime.fromJSDate(date)
      .reconfigure({
        outputCalendar: this.locale.getCalendar(),
        locale: 'en-US',
        numberingSystem: 'latn',
      })
      .toFormat(tokens.join(' '))
      .split(' ')
      .map((p) => parseInt(p, 10));
  }

  /**
   * @param {Number} length
   * @returns {{id: Number, selected: Boolean, title: String}[]}
   */
  yearList(length = 10) {
    const [currentYear] = this.tokenize(['yyyy'], this.date);
    const result = [];
    for (let i = -length; i <= length; i += 1) {
      const id = currentYear + i;
      if (id >= 0) {
        result.push({
          id,
          selected: id === currentYear,
          title: this.locale.numberFormat(id),
        });
      }
    }
    return result;
  }

  /**
   * @param {Number} dayOffset
   * @param {Number} wantedYear
   * @param {Number} currentMonth
   * @param {Number} currentDay
   * @returns {Date|null}
   */
  yearOffsetSeek(dayOffset, wantedYear, currentMonth, currentDay) {
    const dt = luxon.DateTime.fromJSDate(this.date).plus({ day: dayOffset });
    const [iterateYear, iterateMonth, iterateDay] = this.tokenize(
      ['yyyy', 'M', 'd'],
      dt.toJSDate(),
    );
    if (
      iterateYear === wantedYear &&
      iterateMonth === currentMonth &&
      iterateDay === currentDay
    ) {
      return dt.toJSDate();
    }
    return null;
  }

  /**
   * @param {Number} wantedYear
   * @returns {Calendar}
   */
  yearJump(wantedYear) {
    const [currentYear, currentMonth, currentDay] = this.tokenize(
      ['yyyy', 'M', 'd'],
      this.date,
    );

    if (wantedYear === currentYear) {
      return this.date;
    }

    const offset = Math.abs(currentYear - wantedYear) * 373;

    if (wantedYear > currentYear) {
      for (let i = 0; i <= offset; i += 1) {
        const date = this.yearOffsetSeek(
          i,
          wantedYear,
          currentMonth,
          currentDay,
        );
        if (date) {
          return this.setDate(date);
        }
      }
    } else {
      for (let i = offset; i >= 0; i -= 1) {
        const date = this.yearOffsetSeek(
          -i,
          wantedYear,
          currentMonth,
          currentDay,
        );
        if (date) {
          return this.setDate(date);
        }
      }
    }

    /* istanbul ignore next */
    return this;
  }

  /**
   * @param {Boolean} next
   * @return {Locale}
   */
  yearShift(next = true) {
    const [currentYear] = this.tokenize(['yyyy'], this.date);
    return this.yearJump(next ? currentYear + 1 : currentYear - 1);
  }

  /**
   * @returns {{id: Date, selected: Boolean, title: String, titleNumber: String, titleInt: Number}[]}
   */
  monthList() {
    const [currentYear, currentMonth, currentDay] = this.tokenize(
      ['yyyy', 'M', 'd'],
      this.date,
    );
    const result = [];
    for (let i = -397; i <= 397; i += 1) {
      const dt = luxon.DateTime.fromJSDate(this.date).plus({ day: i });
      const [iterateYear, , iterateDay] = this.tokenize(
        ['yyyy', 'M', 'd'],
        dt.toJSDate(),
      );
      if (iterateYear === currentYear && currentDay === iterateDay) {
        const [titleInt] = this.tokenize(['M'], dt.toJSDate());

        const date = dt.toJSDate();

        result.push({
          id: date,
          selected: titleInt === currentMonth,
          title: this.format('MMMM', dt.toJSDate()),
          titleNumber: this.format('M', dt.toJSDate()),
          titleInt,
        });
      }
    }
    return result;
  }

  /**
   * @param {Boolean} next
   * @return {Locale}
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  monthShift(next = true) {
    const [currentYear, currentMonth, currentDay] = this.tokenize(
      ['yyyy', 'M', 'd'],
      this.date,
    );
    // const desireMonth = up ? currentYear
    for (let i = -38; i <= 38; i += 1) {
      const dt = luxon.DateTime.fromJSDate(this.date).plus({ day: i });
      const date = dt.toJSDate();
      const [iterateYear, iterateMonth, iterateDay] = this.tokenize(
        ['yyyy', 'M', 'd'],
        date,
      );
      if (iterateDay !== currentDay) {
        // eslint-disable-next-line no-continue
        continue;
      }
      if (next) {
        if (iterateYear > currentYear) {
          return this.setDate(date);
        }
        if (iterateMonth > currentMonth) {
          return this.setDate(date);
        }
      } else {
        if (iterateYear < currentYear) {
          return this.setDate(date);
        }
        if (iterateMonth < currentMonth) {
          return this.setDate(date);
        }
      }
    }
    return this;
  }

  /**
   * @param {Boolean} next
   * @return {Locale}
   */
  dayShift(next = true) {
    const dt = luxon.DateTime.fromJSDate(this.date).plus({
      day: next ? 1 : -1,
    });
    return this.setDate(dt.toJSDate());
  }

  /**
   * @returns {{id: Date, weekDay: Number, selected: Boolean, title: String, titleInt: Number}[]}
   */
  dayList() {
    const [currentYear, currentMonth, currentDay] = this.tokenize(
      ['yyyy', 'M', 'd'],
      this.date,
    );
    const result = [];
    for (let i = -38; i <= 38; i += 1) {
      const dt = luxon.DateTime.fromJSDate(this.date).plus({ day: i });
      const [iterateYear, iterateMonth, iterateDay] = this.tokenize(
        ['yyyy', 'M', 'd'],
        dt.toJSDate(),
      );
      if (iterateYear === currentYear && currentMonth === iterateMonth) {
        const [titleInt] = this.tokenize(['d'], dt.toJSDate());

        const date = dt.toJSDate();

        const utcDay = new Date(date.getTime());
        utcDay.setUTCHours(12, 0, 0, 0);

        const localeDate = [
          iterateYear,
          iterateMonth.toString().padStart(2, '0'),
          iterateDay.toString().padStart(2, '0'),
        ].join('-');
        const localeTime = [
          date.getHours().toString().padStart(2, '0'),
          date.getMinutes().toString().padStart(2, '0'),
          date.getSeconds().toString().padStart(2, '0'),
        ].join('-');

        result.push({
          id: date,
          utcDay,
          localeDateTime: `${localeDate} ${localeTime}`,
          weekDay: date.getDay(),
          weekEnd: this.locale.getWeekEnds().includes(date.getDay()),
          selected: titleInt === currentDay,
          title: this.format('d', dt.toJSDate()),
          titleInt,
        });
      }
    }
    return result;
  }

  dayWeekList() {
    const dayList = this.dayList();
    const days = [];
    const weekDays = this.locale.getWeekDays();
    const [weekStartDay] = weekDays;
    const weekNames = {};
    let weekNumber = 0;
    dayList.forEach((day) => {
      if (!weekNames[day.weekDay]) {
        weekNames[day.weekDay] = {
          long: this.format('EEE', day.id),
          narrow: this.format('EEEEE', day.id),
        };
      }

      if (day.weekDay === weekStartDay) {
        weekNumber += 1;
      }

      days.push({
        id: day.id,
        utcDay: day.utcDay,
        localeDateTime: day.localeDateTime,
        weekDay: day.weekDay,
        weekEnd: day.weekEnd,
        selected: day.selected,
        title: day.title,
        titleInt: day.titleInt,
        weekNumber,
      });
    });

    const result = {
      heads: [],
      weeks: [],
    };

    weekDays.forEach((n) => {
      result.heads.push(weekNames[n]);
    });

    const weeksDayList = groupBy(days, 'weekNumber');

    Object.values(weeksDayList).forEach((weeks) => {
      const week = [false, false, false, false, false, false, false];
      weeks.forEach((day) => {
        const weekDayIndex = weekDays.indexOf(day.id.getDay());
        week.splice(weekDayIndex, 1, {
          id: day.id,
          utcDay: day.utcDay,
          localeDateTime: day.localeDateTime,
          weekDay: day.weekDay,
          weekEnd: day.weekEnd,
          selected: day.selected,
          title: day.title,
          titleInt: day.titleInt,
          weekNumber,
        });
      });
      result.weeks.push(week);
    });

    return result;
  }
}

module.exports = { Calendar };

},{"./Locale":4,"luxon":87}],3:[function(require,module,exports){
class Environment {
  /**
   * @static
   * @returns {Boolean}
   */
  static test() {
    return (
      typeof Intl !== 'undefined' &&
      typeof Intl.Collator !== 'undefined' &&
      typeof Intl.DateTimeFormat !== 'undefined' &&
      typeof Intl.DateTimeFormat.prototype.formatToParts !== 'undefined' &&
      typeof Intl.DateTimeFormat.prototype.resolvedOptions !== 'undefined' &&
      typeof Intl.NumberFormat !== 'undefined' &&
      typeof Intl.PluralRules !== 'undefined' &&
      typeof Intl.DisplayNames !== 'undefined' &&
      typeof Intl.ListFormat !== 'undefined' &&
      typeof Intl.Locale !== 'undefined' &&
      typeof Intl.getCanonicalLocales !== 'undefined' &&
      typeof Intl.RelativeTimeFormat !== 'undefined' &&
      new Intl.DisplayNames('en-US', { type: 'region' }).of('IR') === 'Iran' &&
      new Intl.DisplayNames('en-US', { type: 'language' }).of('fa') ===
        'Persian'
    );
  }
}

module.exports = { Environment };

},{}],4:[function(require,module,exports){
const luxon = require('luxon');

const countries = require('./countries');
const languages = require('./languages');

/** @type {CalendarSystem[]} */
const SupportedCalendars = [
  'gregory',
  'persian',
  'islamicc',
  'islamic',
  'buddhist',
  'coptic',
  'ethioaa',
  'ethiopic',
  'hebrew',
  'indian',
  'japanese',
  'roc',
];

/**
 * @typedef {'buddhist'|'coptic'|'ethioaa'|'ethiopic'|'gregory'|'hebrew'|'indian'|'islamic'|'islamicc'|'japanese'|'persian'|'roc'} CalendarSystem
 * @typedef {'arab'|'arabext'|'bali'|'beng'|'deva'|'fullwide'|'gujr'|'guru'|'hanidec'|'khmr'|'knda'|'laoo'|'latn'|'limb'|'mlym'|'mong'|'mymr'|'orya'|'tamldec'|'telu'|'thai'|'tibt'} NumericSystemType
 * @typedef {'AC'|'AD'|'AE'|'AF'|'AG'|'AI'|'AL'|'AM'|'AO'|'AR'|'AS'|'AT'|'AU'|'AW'|'AX'|'AZ'|'BA'|'BB'|'BD'|'BE'|'BF'|'BG'|'BH'|'BI'|'BJ'|'BL'|'BM'|'BN'|'BO'|'BQ'|'BR'|'BS'|'BT'|'BW'|'BY'|'BZ'|'CA'|'CC'|'CD'|'CF'|'CG'|'CH'|'CI'|'CK'|'CL'|'CM'|'CN'|'CO'|'CR'|'CU'|'CV'|'CW'|'CX'|'CY'|'CZ'|'DE'|'DG'|'DJ'|'DK'|'DM'|'DO'|'DZ'|'EA'|'EC'|'EE'|'EG'|'EH'|'ER'|'ES'|'ET'|'FI'|'FJ'|'FK'|'FM'|'FO'|'FR'|'GA'|'GB'|'GD'|'GE'|'GF'|'GG'|'GH'|'GI'|'GL'|'GM'|'GN'|'GP'|'GQ'|'GR'|'GT'|'GU'|'GW'|'GY'|'HK'|'HN'|'HR'|'HT'|'HU'|'IC'|'ID'|'IE'|'IL'|'IM'|'IN'|'IO'|'IQ'|'IR'|'IS'|'IT'|'JE'|'JM'|'JO'|'JP'|'KE'|'KG'|'KH'|'KI'|'KM'|'KN'|'KP'|'KR'|'KW'|'KY'|'KZ'|'LA'|'LB'|'LC'|'LI'|'LK'|'LR'|'LS'|'LT'|'LU'|'LV'|'LY'|'MA'|'MC'|'MD'|'ME'|'MF'|'MG'|'MH'|'MK'|'ML'|'MM'|'MN'|'MO'|'MP'|'MQ'|'MR'|'MS'|'MT'|'MU'|'MV'|'MW'|'MX'|'MY'|'MZ'|'NA'|'NC'|'NE'|'NF'|'NG'|'NI'|'NL'|'NO'|'NP'|'NR'|'NU'|'NZ'|'OM'|'PA'|'PE'|'PF'|'PG'|'PH'|'PK'|'PL'|'PM'|'PN'|'PR'|'PS'|'PT'|'PW'|'PY'|'QA'|'RE'|'RO'|'RS'|'RU'|'RW'|'SA'|'SB'|'SC'|'SD'|'SE'|'SG'|'SH'|'SI'|'SJ'|'SK'|'SL'|'SM'|'SN'|'SO'|'SR'|'SS'|'ST'|'SV'|'SX'|'SY'|'SZ'|'TA'|'TC'|'TD'|'TF'|'TG'|'TH'|'TJ'|'TK'|'TL'|'TM'|'TN'|'TO'|'TR'|'TT'|'TV'|'TW'|'TZ'|'UA'|'UG'|'UM'|'US'|'UY'|'UZ'|'VA'|'VC'|'VE'|'VG'|'VI'|'VN'|'VU'|'WF'|'WS'|'XK'|'YE'|'YT'|'ZA'|'ZM'|'ZW'} CountryISOCode
 * @typedef {'aa'|'af'|'ar'|'az'|'be'|'bg'|'bi'|'bm'|'bn'|'bs'|'ca'|'cs'|'da'|'de'|'dv'|'dz'|'el'|'en'|'es'|'et'|'fa'|'fi'|'fo'|'fr'|'gn'|'ha'|'he'|'hi'|'hr'|'ht'|'hu'|'hy'|'id'|'is'|'it'|'ja'|'ka'|'kl'|'km'|'ko'|'ky'|'lo'|'lt'|'lv'|'mg'|'mk'|'mn'|'ms'|'mt'|'my'|'nb'|'ne'|'nl'|'pl'|'pt'|'rn'|'ro'|'ru'|'rw'|'si'|'sk'|'sl'|'sm'|'sn'|'so'|'sq'|'sr'|'st'|'sv'|'sw'|'tg'|'th'|'ti'|'tk'|'to'|'tr'|'ur'|'uz'|'vi'|'wo'|'zh'} LanguageISOCode
 */

class Locale {
  /**
   * @param {String} formatted
   * @param {String} ident
   * @returns {String}
   */
  static calendarName(formatted, ident) {
    const camelCase = ident.charAt(0).toUpperCase() + ident.slice(1);
    if (formatted.match(/^ERA/) || formatted === 'null') {
      return camelCase;
    }
    if (ident === 'islamicc') {
      return `${formatted}(c)`;
    }
    return formatted;
  }

  /**
   * @param {String} locale
   */
  constructor(locale) {
    const iLocale = new Intl.Locale(Intl.getCanonicalLocales(locale));
    const country = iLocale.maximize().region;
    this.language = iLocale.maximize().language;
    this.setCountry(country);
    this.numberingSystem = new Intl.NumberFormat(
      this.toString(),
    ).resolvedOptions().numberingSystem;
  }

  /**
   * @returns {String}
   */
  toString() {
    return `${this.language}-${this.country}`;
  }

  /**
   * @returns {LanguageISOCode}
   */
  getLanguageCode() {
    return this.language;
  }

  /**
   * @returns {CountryISOCode}
   */
  getCountryCode() {
    return this.country;
  }

  /**
   * @returns {String}
   */
  getCountryFlag() {
    return this.flag;
  }

  /**
   * @returns {Calendar}
   */
  getCalendar() {
    return this.calendar;
  }

  /**
   * @returns {Boolean}
   */
  isRTL(lang = this.language) {
    return ['ar', 'dv', 'fa', 'he', 'ps', 'ur', 'yi'].includes(lang);
  }

  /**
   * @returns {NumericSystem}
   */
  getNumberingSystem() {
    return this.numberingSystem;
  }

  /**
   * @param {Number} number
   * @param {Intl.NumberFormatOptions} options
   * @returns {String}
   */
  numberFormat(
    number,
    options = {
      useGrouping: false,
    },
  ) {
    const formatter = new Intl.NumberFormat(this.toString(), options);
    return formatter.format(number);
  }

  /**
   * @param {Date} date1
   * @param {Date} date2
   * @param {Intl.RelativeTimeFormatOptions} options
   * @returns {String}
   */
  relativeTimeString(
    date1,
    date2 = new Date(),
    options = {
      style: 'narrow',
    },
  ) {
    const formatter = new Intl.RelativeTimeFormat(this.language, options);
    const diff = date1 - date2;
    const diffAbs = Math.abs(diff);
    const x = diff > 0 ? 1 : -1;

    const matrix = {
      year: 31536000000,
      month: 2592000000,
      day: 86400000,
      hour: 3600000,
      minute: 60000,
      second: 1000,
    };

    let output = '';

    Object.keys(matrix).forEach((unit) => {
      const interval = matrix[unit];
      if (output === '' && diffAbs > interval) {
        output = formatter.format(x * Math.round(diffAbs / interval), unit);
      }
    });

    return output;
  }

  /**
   * @param {CountryISOCode} country
   * @returns {Locale}
   */
  setCountry(country) {
    this.weekdays = [1, 2, 3, 4, 5, 6, 0];
    this.weekends = [6, 0];
    this.flag = '🇿🇿';
    this.calendar = 'gregory';

    if (countries[country]) {
      this.flag = countries[country].f;

      if (countries[country].wd) {
        this.weekdays = countries[country].wd;
      }

      if (countries[country].we) {
        this.weekends = countries[country].we;
      }

      if (countries[country].c) {
        this.calendar = countries[country].c;
      }
    }

    this.country = country;

    return this;
  }

  /**
   * @param {CalendarSystem} calendar
   * @returns {Locale}
   */
  setCalendar(calendar) {
    this.calendar = calendar;
    return this;
  }

  /**
   * @returns {Number[]}
   */
  getWeekDays() {
    return this.weekdays;
  }

  /**
   * @returns {Number[]}
   */
  getWeekEnds() {
    return this.weekends;
  }

  /**
   * @return {{ id: CountryISOCode, selected: Boolean, defaultLanguage: LanguageISOCode, flag: String, title: String, titleNative: String }[]}
   */
  getCountryList() {
    const result = [];
    Object.keys(countries).forEach((code) => {
      const data = countries[code];
      const title = new Intl.DisplayNames([this.language], {
        type: 'region',
      });
      const titleNative = new Intl.DisplayNames([data.l], { type: 'region' });

      result.push({
        id: code,
        selected: this.country === code,
        defaultLanguage: code.l,
        flag: data.f,
        title: title.of(code),
        titleNative: titleNative.of(code),
      });
    });
    return result;
  }

  /**
   * @return {{id: LanguageISOCode, selected: Boolean, rtl: Boolean, title: String, titleNative: String}[]}
   */
  getLanguageList() {
    const result = [];
    languages.forEach((code) => {
      const title = new Intl.DisplayNames([this.language], {
        type: 'language',
      });
      const titleNative = new Intl.DisplayNames([code], { type: 'language' });

      result.push({
        id: code,
        selected: this.language === code,
        rtl: this.isRTL(code),
        title: title.of(code),
        titleNative: titleNative.of(code),
      });
    });
    return result;
  }

  /**
   * @return {{id: Calendar, selected: Boolean, long: String, short: String}[]}
   */
  getCalendarList() {
    return SupportedCalendars.map((ident) => {
      const d = luxon.DateTime.local().reconfigure({
        locale: this.language,
        outputCalendar: ident,
      });
      return {
        id: ident,
        selected: this.calendar === ident,
        title: this.constructor.calendarName(d.toFormat('GG'), ident),
        titleShort: this.constructor.calendarName(d.toFormat('G'), ident),
      };
    });
  }
}

module.exports = { Locale, SupportedCalendars };

},{"./countries":5,"./languages":6,"luxon":87}],5:[function(require,module,exports){
module.exports = {
  AC: { f: '🇦🇨', l: 'en' },
  AD: { f: '🇦🇩', l: 'ca' },
  AE: { f: '🇦🇪', l: 'ar', wd: [6, 0, 1, 2, 3, 4, 5], we: [5, 6] },
  AF: { f: '🇦🇫', l: 'fa', c: 'persian', wd: [6, 0, 1, 2, 3, 4, 5], we: [4, 5] },
  AG: { f: '🇦🇬', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  AI: { f: '🇦🇮', l: 'en' },
  AL: { f: '🇦🇱', l: 'sq' },
  AM: { f: '🇦🇲', l: 'hy' },
  AO: { f: '🇦🇴', l: 'pt' },
  AR: { f: '🇦🇷', l: 'es' },
  AS: { f: '🇦🇸', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  AT: { f: '🇦🇹', l: 'de' },
  AU: { f: '🇦🇺', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  AW: { f: '🇦🇼', l: 'nl' },
  AX: { f: '🇦🇽', l: 'sv' },
  AZ: { f: '🇦🇿', l: 'az' },
  BA: { f: '🇧🇦', l: 'bs' },
  BB: { f: '🇧🇧', l: 'en' },
  BD: { f: '🇧🇩', l: 'bn', wd: [0, 1, 2, 3, 4, 5, 6] },
  BE: { f: '🇧🇪', l: 'en' },
  BF: { f: '🇧🇫', l: 'fr' },
  BG: { f: '🇧🇬', l: 'bg' },
  BH: { f: '🇧🇭', l: 'ar', wd: [6, 0, 1, 2, 3, 4, 5], we: [5, 6] },
  BI: { f: '🇧🇮', l: 'rn' },
  BJ: { f: '🇧🇯', l: 'fr' },
  BL: { f: '🇧🇱', l: 'fr' },
  BM: { f: '🇧🇲', l: 'en' },
  BN: { f: '🇧🇳', l: 'ms' },
  BO: { f: '🇧🇴', l: 'es' },
  BQ: { f: '🇧🇶', l: 'nl' },
  BR: { f: '🇧🇷', l: 'pt', wd: [0, 1, 2, 3, 4, 5, 6] },
  BS: { f: '🇧🇸', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  BT: { f: '🇧🇹', l: 'dz', wd: [0, 1, 2, 3, 4, 5, 6] },
  BW: { f: '🇧🇼', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  BY: { f: '🇧🇾', l: 'be' },
  BZ: { f: '🇧🇿', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  CA: { f: '🇨🇦', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  CC: { f: '🇨🇨', l: 'en' },
  CD: { f: '🇨🇩', l: 'fr' },
  CF: { f: '🇨🇫', l: 'fr' },
  CG: { f: '🇨🇬', l: 'fr' },
  CH: { f: '🇨🇭', l: 'de' },
  CI: { f: '🇨🇮', l: 'fr' },
  CK: { f: '🇨🇰', l: 'en' },
  CL: { f: '🇨🇱', l: 'es' },
  CM: { f: '🇨🇲', l: 'fr' },
  CN: { f: '🇨🇳', l: 'zh', wd: [0, 1, 2, 3, 4, 5, 6] },
  CO: { f: '🇨🇴', l: 'es', wd: [0, 1, 2, 3, 4, 5, 6] },
  CR: { f: '🇨🇷', l: 'es' },
  CU: { f: '🇨🇺', l: 'es' },
  CV: { f: '🇨🇻', l: 'pt' },
  CW: { f: '🇨🇼', l: 'nl' },
  CX: { f: '🇨🇽', l: 'en' },
  CY: { f: '🇨🇾', l: 'el' },
  CZ: { f: '🇨🇿', l: 'cs' },
  DE: { f: '🇩🇪', l: 'de' },
  DG: { f: '🇩🇬', l: 'en' },
  DJ: { f: '🇩🇯', l: 'aa', wd: [6, 0, 1, 2, 3, 4, 5] },
  DK: { f: '🇩🇰', l: 'da' },
  DM: { f: '🇩🇲', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  DO: { f: '🇩🇴', l: 'es', wd: [0, 1, 2, 3, 4, 5, 6] },
  DZ: { f: '🇩🇿', l: 'ar', wd: [6, 0, 1, 2, 3, 4, 5], we: [5, 6] },
  EA: { f: '🇪🇦', l: 'es' },
  EC: { f: '🇪🇨', l: 'es' },
  EE: { f: '🇪🇪', l: 'et' },
  EG: { f: '🇪🇬', l: 'ar', wd: [6, 0, 1, 2, 3, 4, 5], we: [5, 6] },
  EH: { f: '🇪🇭', l: 'ar' },
  ER: { f: '🇪🇷', l: 'ti' },
  ES: { f: '🇪🇸', l: 'es' },
  ET: { f: '🇪🇹', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  FI: { f: '🇫🇮', l: 'fi' },
  FJ: { f: '🇫🇯', l: 'en' },
  FK: { f: '🇫🇰', l: 'en' },
  FM: { f: '🇫🇲', l: 'en' },
  FO: { f: '🇫🇴', l: 'fo' },
  FR: { f: '🇫🇷', l: 'fr' },
  GA: { f: '🇬🇦', l: 'fr' },
  GB: { f: '🇬🇧', l: 'en' },
  GD: { f: '🇬🇩', l: 'en' },
  GE: { f: '🇬🇪', l: 'ka' },
  GF: { f: '🇬🇫', l: 'fr' },
  GG: { f: '🇬🇬', l: 'en' },
  GH: { f: '🇬🇭', l: 'en' },
  GI: { f: '🇬🇮', l: 'en' },
  GL: { f: '🇬🇱', l: 'kl' },
  GM: { f: '🇬🇲', l: 'en' },
  GN: { f: '🇬🇳', l: 'fr' },
  GP: { f: '🇬🇵', l: 'fr' },
  GQ: { f: '🇬🇶', l: 'es' },
  GR: { f: '🇬🇷', l: 'el' },
  GT: { f: '🇬🇹', l: 'es', wd: [0, 1, 2, 3, 4, 5, 6] },
  GU: { f: '🇬🇺', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  GW: { f: '🇬🇼', l: 'pt' },
  GY: { f: '🇬🇾', l: 'en' },
  HK: { f: '🇭🇰', l: 'zh', wd: [0, 1, 2, 3, 4, 5, 6] },
  HN: { f: '🇭🇳', l: 'es', wd: [0, 1, 2, 3, 4, 5, 6] },
  HR: { f: '🇭🇷', l: 'hr' },
  HT: { f: '🇭🇹', l: 'ht' },
  HU: { f: '🇭🇺', l: 'hu' },
  IC: { f: '🇮🇨', l: 'es' },
  ID: { f: '🇮🇩', l: 'id', wd: [0, 1, 2, 3, 4, 5, 6] },
  IE: { f: '🇮🇪', l: 'en' },
  IL: { f: '🇮🇱', l: 'he', wd: [0, 1, 2, 3, 4, 5, 6], we: [5, 6] },
  IM: { f: '🇮🇲', l: 'en' },
  IN: { f: '🇮🇳', l: 'hi', wd: [0, 1, 2, 3, 4, 5, 6], we: [0] },
  IO: { f: '🇮🇴', l: 'en' },
  IQ: { f: '🇮🇶', l: 'ar', wd: [6, 0, 1, 2, 3, 4, 5], we: [5, 6] },
  IR: { f: '🇮🇷', l: 'fa', c: 'persian', wd: [6, 0, 1, 2, 3, 4, 5], we: [5] },
  IS: { f: '🇮🇸', l: 'is' },
  IT: { f: '🇮🇹', l: 'it' },
  JE: { f: '🇯🇪', l: 'en' },
  JM: { f: '🇯🇲', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  JO: { f: '🇯🇴', l: 'ar', wd: [6, 0, 1, 2, 3, 4, 5], we: [5, 6] },
  JP: { f: '🇯🇵', l: 'ja', wd: [0, 1, 2, 3, 4, 5, 6] },
  KE: { f: '🇰🇪', l: 'sw', wd: [0, 1, 2, 3, 4, 5, 6] },
  KG: { f: '🇰🇬', l: 'ky' },
  KH: { f: '🇰🇭', l: 'km', wd: [0, 1, 2, 3, 4, 5, 6] },
  KI: { f: '🇰🇮', l: 'en' },
  KM: { f: '🇰🇲', l: 'ar' },
  KN: { f: '🇰🇳', l: 'en' },
  KP: { f: '🇰🇵', l: 'ko' },
  KR: { f: '🇰🇷', l: 'ko', wd: [0, 1, 2, 3, 4, 5, 6] },
  KW: { f: '🇰🇼', l: 'ar', wd: [6, 0, 1, 2, 3, 4, 5], we: [5, 6] },
  KY: { f: '🇰🇾', l: 'en' },
  KZ: { f: '🇰🇿', l: 'ru' },
  LA: { f: '🇱🇦', l: 'lo', wd: [0, 1, 2, 3, 4, 5, 6] },
  LB: { f: '🇱🇧', l: 'ar' },
  LC: { f: '🇱🇨', l: 'en' },
  LI: { f: '🇱🇮', l: 'de' },
  LK: { f: '🇱🇰', l: 'si' },
  LR: { f: '🇱🇷', l: 'en' },
  LS: { f: '🇱🇸', l: 'st' },
  LT: { f: '🇱🇹', l: 'lt' },
  LU: { f: '🇱🇺', l: 'fr' },
  LV: { f: '🇱🇻', l: 'lv' },
  LY: { f: '🇱🇾', l: 'ar', wd: [6, 0, 1, 2, 3, 4, 5], we: [5, 6] },
  MA: { f: '🇲🇦', l: 'fr' },
  MC: { f: '🇲🇨', l: 'fr' },
  MD: { f: '🇲🇩', l: 'ro' },
  ME: { f: '🇲🇪', l: 'sq' },
  MF: { f: '🇲🇫', l: 'fr' },
  MG: { f: '🇲🇬', l: 'mg' },
  MH: { f: '🇲🇭', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  MK: { f: '🇲🇰', l: 'mk' },
  ML: { f: '🇲🇱', l: 'bm' },
  MM: { f: '🇲🇲', l: 'my', wd: [0, 1, 2, 3, 4, 5, 6] },
  MN: { f: '🇲🇳', l: 'mn' },
  MO: { f: '🇲🇴', l: 'zh', wd: [0, 1, 2, 3, 4, 5, 6] },
  MP: { f: '🇲🇵', l: 'en' },
  MQ: { f: '🇲🇶', l: 'fr' },
  MR: { f: '🇲🇷', l: 'ar' },
  MS: { f: '🇲🇸', l: 'en' },
  MT: { f: '🇲🇹', l: 'mt', wd: [0, 1, 2, 3, 4, 5, 6] },
  MU: { f: '🇲🇺', l: 'en' },
  MV: { f: '🇲🇻', l: 'dv', wd: [5, 6, 0, 1, 2, 3, 4] },
  MW: { f: '🇲🇼', l: 'en' },
  MX: { f: '🇲🇽', l: 'es', wd: [0, 1, 2, 3, 4, 5, 6] },
  MY: { f: '🇲🇾', l: 'ms' },
  MZ: { f: '🇲🇿', l: 'pt', wd: [0, 1, 2, 3, 4, 5, 6] },
  NA: { f: '🇳🇦', l: 'af' },
  NC: { f: '🇳🇨', l: 'fr' },
  NE: { f: '🇳🇪', l: 'ha' },
  NF: { f: '🇳🇫', l: 'en' },
  NG: { f: '🇳🇬', l: 'en' },
  NI: { f: '🇳🇮', l: 'es', wd: [0, 1, 2, 3, 4, 5, 6] },
  NL: { f: '🇳🇱', l: 'nl' },
  NO: { f: '🇳🇴', l: 'nb' },
  NP: { f: '🇳🇵', l: 'ne', wd: [0, 1, 2, 3, 4, 5, 6] },
  NR: { f: '🇳🇷', l: 'en' },
  NU: { f: '🇳🇺', l: 'en' },
  NZ: { f: '🇳🇿', l: 'en' },
  OM: { f: '🇴🇲', l: 'ar', wd: [6, 0, 1, 2, 3, 4, 5], we: [5, 6] },
  PA: { f: '🇵🇦', l: 'es', wd: [0, 1, 2, 3, 4, 5, 6] },
  PE: { f: '🇵🇪', l: 'es', wd: [0, 1, 2, 3, 4, 5, 6] },
  PF: { f: '🇵🇫', l: 'fr' },
  PG: { f: '🇵🇬', l: 'en' },
  PH: { f: '🇵🇭', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  PK: { f: '🇵🇰', l: 'ur', wd: [0, 1, 2, 3, 4, 5, 6] },
  PL: { f: '🇵🇱', l: 'pl' },
  PM: { f: '🇵🇲', l: 'fr' },
  PN: { f: '🇵🇳', l: 'en' },
  PR: { f: '🇵🇷', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  PS: { f: '🇵🇸', l: 'ar' },
  PT: { f: '🇵🇹', l: 'pt', wd: [0, 1, 2, 3, 4, 5, 6] },
  PW: { f: '🇵🇼', l: 'en' },
  PY: { f: '🇵🇾', l: 'gn', wd: [0, 1, 2, 3, 4, 5, 6] },
  QA: { f: '🇶🇦', l: 'ar', wd: [6, 0, 1, 2, 3, 4, 5], we: [5, 6] },
  RE: { f: '🇷🇪', l: 'fr' },
  RO: { f: '🇷🇴', l: 'ro' },
  RS: { f: '🇷🇸', l: 'sr' },
  RU: { f: '🇷🇺', l: 'ru' },
  RW: { f: '🇷🇼', l: 'rw' },
  SA: { f: '🇸🇦', l: 'ar', c: 'islamic', wd: [0, 1, 2, 3, 4, 5, 6], we: [5, 6] },
  SB: { f: '🇸🇧', l: 'en' },
  SC: { f: '🇸🇨', l: 'fr' },
  SD: { f: '🇸🇩', l: 'ar', wd: [6, 0, 1, 2, 3, 4, 5], we: [5, 6] },
  SE: { f: '🇸🇪', l: 'sv' },
  SG: { f: '🇸🇬', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  SH: { f: '🇸🇭', l: 'en' },
  SI: { f: '🇸🇮', l: 'sl' },
  SJ: { f: '🇸🇯', l: 'nb' },
  SK: { f: '🇸🇰', l: 'sk' },
  SL: { f: '🇸🇱', l: 'en' },
  SM: { f: '🇸🇲', l: 'it' },
  SN: { f: '🇸🇳', l: 'wo' },
  SO: { f: '🇸🇴', l: 'so' },
  SR: { f: '🇸🇷', l: 'nl' },
  SS: { f: '🇸🇸', l: 'ar' },
  ST: { f: '🇸🇹', l: 'pt' },
  SV: { f: '🇸🇻', l: 'es', wd: [0, 1, 2, 3, 4, 5, 6] },
  SX: { f: '🇸🇽', l: 'en' },
  SY: { f: '🇸🇾', l: 'ar', wd: [6, 0, 1, 2, 3, 4, 5], we: [5, 6] },
  SZ: { f: '🇸🇿', l: 'en' },
  TA: { f: '🇹🇦', l: 'en' },
  TC: { f: '🇹🇨', l: 'en' },
  TD: { f: '🇹🇩', l: 'fr' },
  TF: { f: '🇹🇫', l: 'fr' },
  TG: { f: '🇹🇬', l: 'fr' },
  TH: { f: '🇹🇭', l: 'th', c: 'buddhist', wd: [0, 1, 2, 3, 4, 5, 6] },
  TJ: { f: '🇹🇯', l: 'tg' },
  TK: { f: '🇹🇰', l: 'en' },
  TL: { f: '🇹🇱', l: 'pt' },
  TM: { f: '🇹🇲', l: 'tk' },
  TN: { f: '🇹🇳', l: 'ar' },
  TO: { f: '🇹🇴', l: 'to' },
  TR: { f: '🇹🇷', l: 'tr' },
  TT: { f: '🇹🇹', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  TV: { f: '🇹🇻', l: 'en' },
  TW: { f: '🇹🇼', l: 'zh', wd: [0, 1, 2, 3, 4, 5, 6] },
  TZ: { f: '🇹🇿', l: 'sw' },
  UA: { f: '🇺🇦', l: 'ru' },
  UG: { f: '🇺🇬', l: 'sw', we: [0] },
  UM: { f: '🇺🇲', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  US: { f: '🇺🇸', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  UY: { f: '🇺🇾', l: 'es' },
  UZ: { f: '🇺🇿', l: 'uz' },
  VA: { f: '🇻🇦', l: 'it' },
  VC: { f: '🇻🇨', l: 'en' },
  VE: { f: '🇻🇪', l: 'es', wd: [0, 1, 2, 3, 4, 5, 6] },
  VG: { f: '🇻🇬', l: 'en' },
  VI: { f: '🇻🇮', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  VN: { f: '🇻🇳', l: 'vi' },
  VU: { f: '🇻🇺', l: 'bi' },
  WF: { f: '🇼🇫', l: 'fr' },
  WS: { f: '🇼🇸', l: 'sm', wd: [0, 1, 2, 3, 4, 5, 6] },
  XK: { f: '🇽🇰', l: 'sq' },
  YE: { f: '🇾🇪', l: 'ar', wd: [0, 1, 2, 3, 4, 5, 6], we: [5, 6] },
  YT: { f: '🇾🇹', l: 'fr' },
  ZA: { f: '🇿🇦', l: 'en', wd: [0, 1, 2, 3, 4, 5, 6] },
  ZM: { f: '🇿🇲', l: 'en' },
  ZW: { f: '🇿🇼', l: 'sn', wd: [0, 1, 2, 3, 4, 5, 6] },
};

},{}],6:[function(require,module,exports){
module.exports = [
  'aa',
  'af',
  'ar',
  'az',
  'be',
  'bg',
  'bi',
  'bm',
  'bn',
  'bs',
  'ca',
  'cs',
  'da',
  'de',
  'dv',
  'dz',
  'el',
  'en',
  'es',
  'et',
  'fa',
  'fi',
  'fo',
  'fr',
  'gn',
  'ha',
  'he',
  'hi',
  'hr',
  'ht',
  'hu',
  'hy',
  'id',
  'is',
  'it',
  'ja',
  'ka',
  'kl',
  'km',
  'ko',
  'ky',
  'lo',
  'lt',
  'lv',
  'mg',
  'mk',
  'mn',
  'ms',
  'mt',
  'my',
  'nb',
  'ne',
  'nl',
  'pl',
  'pt',
  'rn',
  'ro',
  'ru',
  'rw',
  'si',
  'sk',
  'sl',
  'sm',
  'sn',
  'so',
  'sq',
  'sr',
  'st',
  'sv',
  'sw',
  'tg',
  'th',
  'ti',
  'tk',
  'to',
  'tr',
  'ur',
  'uz',
  'vi',
  'wo',
  'zh',
];

},{}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecFromTime = exports.MinFromTime = exports.HourFromTime = exports.DateFromTime = exports.MonthFromTime = exports.InLeapYear = exports.DayWithinYear = exports.DaysInYear = exports.YearFromTime = exports.TimeFromYear = exports.DayFromYear = exports.WeekDay = exports.Day = exports.Type = exports.HasOwnProperty = exports.ArrayCreate = exports.SameValue = exports.ToObject = exports.TimeClip = exports.ToNumber = exports.ToString = void 0;
/**
 * https://tc39.es/ecma262/#sec-tostring
 */
function ToString(o) {
    // Only symbol is irregular...
    if (typeof o === 'symbol') {
        throw TypeError('Cannot convert a Symbol value to a string');
    }
    return String(o);
}
exports.ToString = ToString;
/**
 * https://tc39.es/ecma262/#sec-tonumber
 * @param val
 */
function ToNumber(val) {
    if (val === undefined) {
        return NaN;
    }
    if (val === null) {
        return +0;
    }
    if (typeof val === 'boolean') {
        return val ? 1 : +0;
    }
    if (typeof val === 'number') {
        return val;
    }
    if (typeof val === 'symbol' || typeof val === 'bigint') {
        throw new TypeError('Cannot convert symbol/bigint to number');
    }
    return Number(val);
}
exports.ToNumber = ToNumber;
/**
 * https://tc39.es/ecma262/#sec-tointeger
 * @param n
 */
function ToInteger(n) {
    var number = ToNumber(n);
    if (isNaN(number) || SameValue(number, -0)) {
        return 0;
    }
    if (isFinite(number)) {
        return number;
    }
    var integer = Math.floor(Math.abs(number));
    if (number < 0) {
        integer = -integer;
    }
    if (SameValue(integer, -0)) {
        return 0;
    }
    return integer;
}
/**
 * https://tc39.es/ecma262/#sec-timeclip
 * @param time
 */
function TimeClip(time) {
    if (!isFinite(time)) {
        return NaN;
    }
    if (Math.abs(time) > 8.64 * 1e16) {
        return NaN;
    }
    return ToInteger(time);
}
exports.TimeClip = TimeClip;
/**
 * https://tc39.es/ecma262/#sec-toobject
 * @param arg
 */
function ToObject(arg) {
    if (arg == null) {
        throw new TypeError('undefined/null cannot be converted to object');
    }
    return Object(arg);
}
exports.ToObject = ToObject;
/**
 * https://www.ecma-international.org/ecma-262/11.0/index.html#sec-samevalue
 * @param x
 * @param y
 */
function SameValue(x, y) {
    if (Object.is) {
        return Object.is(x, y);
    }
    // SameValue algorithm
    if (x === y) {
        // Steps 1-5, 7-10
        // Steps 6.b-6.e: +0 != -0
        return x !== 0 || 1 / x === 1 / y;
    }
    // Step 6.a: NaN == NaN
    return x !== x && y !== y;
}
exports.SameValue = SameValue;
/**
 * https://www.ecma-international.org/ecma-262/11.0/index.html#sec-arraycreate
 * @param len
 */
function ArrayCreate(len) {
    return new Array(len);
}
exports.ArrayCreate = ArrayCreate;
/**
 * https://www.ecma-international.org/ecma-262/11.0/index.html#sec-hasownproperty
 * @param o
 * @param prop
 */
function HasOwnProperty(o, prop) {
    return Object.prototype.hasOwnProperty.call(o, prop);
}
exports.HasOwnProperty = HasOwnProperty;
/**
 * https://www.ecma-international.org/ecma-262/11.0/index.html#sec-type
 * @param x
 */
function Type(x) {
    if (x === null) {
        return 'Null';
    }
    if (typeof x === 'undefined') {
        return 'Undefined';
    }
    if (typeof x === 'function' || typeof x === 'object') {
        return 'Object';
    }
    if (typeof x === 'number') {
        return 'Number';
    }
    if (typeof x === 'boolean') {
        return 'Boolean';
    }
    if (typeof x === 'string') {
        return 'String';
    }
    if (typeof x === 'symbol') {
        return 'Symbol';
    }
    if (typeof x === 'bigint') {
        return 'BigInt';
    }
}
exports.Type = Type;
var MS_PER_DAY = 86400000;
/**
 * https://www.ecma-international.org/ecma-262/11.0/index.html#eqn-modulo
 * @param x
 * @param y
 * @return k of the same sign as y
 */
function mod(x, y) {
    return x - Math.floor(x / y) * y;
}
/**
 * https://tc39.es/ecma262/#eqn-Day
 * @param t
 */
function Day(t) {
    return Math.floor(t / MS_PER_DAY);
}
exports.Day = Day;
/**
 * https://tc39.es/ecma262/#sec-week-day
 * @param t
 */
function WeekDay(t) {
    return mod(Day(t) + 4, 7);
}
exports.WeekDay = WeekDay;
/**
 * https://tc39.es/ecma262/#sec-year-number
 * @param y
 */
function DayFromYear(y) {
    return (365 * (y - 1970) +
        Math.floor((y - 1969) / 4) -
        Math.floor((y - 1901) / 100) +
        Math.floor((y - 1601) / 400));
}
exports.DayFromYear = DayFromYear;
/**
 * https://tc39.es/ecma262/#sec-year-number
 * @param y
 */
function TimeFromYear(y) {
    return MS_PER_DAY * DayFromYear(y);
}
exports.TimeFromYear = TimeFromYear;
/**
 * https://tc39.es/ecma262/#sec-year-number
 * @param t
 */
function YearFromTime(t) {
    var min = Math.ceil(t / MS_PER_DAY / 366);
    var y = min;
    while (TimeFromYear(y) <= t) {
        y++;
    }
    return y - 1;
}
exports.YearFromTime = YearFromTime;
function DaysInYear(y) {
    if (y % 4 !== 0) {
        return 365;
    }
    if (y % 100 !== 0) {
        return 366;
    }
    if (y % 400 !== 0) {
        return 365;
    }
    return 366;
}
exports.DaysInYear = DaysInYear;
function DayWithinYear(t) {
    return Day(t) - DayFromYear(YearFromTime(t));
}
exports.DayWithinYear = DayWithinYear;
function InLeapYear(t) {
    return DaysInYear(YearFromTime(t)) === 365 ? 0 : 1;
}
exports.InLeapYear = InLeapYear;
/**
 * https://tc39.es/ecma262/#sec-month-number
 * @param t
 */
function MonthFromTime(t) {
    var dwy = DayWithinYear(t);
    var leap = InLeapYear(t);
    if (dwy >= 0 && dwy < 31) {
        return 0;
    }
    if (dwy < 59 + leap) {
        return 1;
    }
    if (dwy < 90 + leap) {
        return 2;
    }
    if (dwy < 120 + leap) {
        return 3;
    }
    if (dwy < 151 + leap) {
        return 4;
    }
    if (dwy < 181 + leap) {
        return 5;
    }
    if (dwy < 212 + leap) {
        return 6;
    }
    if (dwy < 243 + leap) {
        return 7;
    }
    if (dwy < 273 + leap) {
        return 8;
    }
    if (dwy < 304 + leap) {
        return 9;
    }
    if (dwy < 334 + leap) {
        return 10;
    }
    if (dwy < 365 + leap) {
        return 11;
    }
    throw new Error('Invalid time');
}
exports.MonthFromTime = MonthFromTime;
function DateFromTime(t) {
    var dwy = DayWithinYear(t);
    var mft = MonthFromTime(t);
    var leap = InLeapYear(t);
    if (mft === 0) {
        return dwy + 1;
    }
    if (mft === 1) {
        return dwy - 30;
    }
    if (mft === 2) {
        return dwy - 58 - leap;
    }
    if (mft === 3) {
        return dwy - 89 - leap;
    }
    if (mft === 4) {
        return dwy - 119 - leap;
    }
    if (mft === 5) {
        return dwy - 150 - leap;
    }
    if (mft === 6) {
        return dwy - 180 - leap;
    }
    if (mft === 7) {
        return dwy - 211 - leap;
    }
    if (mft === 8) {
        return dwy - 242 - leap;
    }
    if (mft === 9) {
        return dwy - 272 - leap;
    }
    if (mft === 10) {
        return dwy - 303 - leap;
    }
    if (mft === 11) {
        return dwy - 333 - leap;
    }
    throw new Error('Invalid time');
}
exports.DateFromTime = DateFromTime;
var HOURS_PER_DAY = 24;
var MINUTES_PER_HOUR = 60;
var SECONDS_PER_MINUTE = 60;
var MS_PER_SECOND = 1e3;
var MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;
var MS_PER_HOUR = MS_PER_MINUTE * MINUTES_PER_HOUR;
function HourFromTime(t) {
    return mod(Math.floor(t / MS_PER_HOUR), HOURS_PER_DAY);
}
exports.HourFromTime = HourFromTime;
function MinFromTime(t) {
    return mod(Math.floor(t / MS_PER_MINUTE), MINUTES_PER_HOUR);
}
exports.MinFromTime = MinFromTime;
function SecFromTime(t) {
    return mod(Math.floor(t / MS_PER_SECOND), SECONDS_PER_MINUTE);
}
exports.SecFromTime = SecFromTime;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestAvailableLocale = void 0;
/**
 * https://tc39.es/ecma402/#sec-bestavailablelocale
 * @param availableLocales
 * @param locale
 */
function BestAvailableLocale(availableLocales, locale) {
    var candidate = locale;
    while (true) {
        if (availableLocales.has(candidate)) {
            return candidate;
        }
        var pos = candidate.lastIndexOf('-');
        if (!~pos) {
            return undefined;
        }
        if (pos >= 2 && candidate[pos - 2] === '-') {
            pos -= 2;
        }
        candidate = candidate.slice(0, pos);
    }
}
exports.BestAvailableLocale = BestAvailableLocale;

},{}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestFitMatcher = void 0;
var BestAvailableLocale_1 = require("./BestAvailableLocale");
var utils_1 = require("./utils");
/**
 * https://tc39.es/ecma402/#sec-bestfitmatcher
 * @param availableLocales
 * @param requestedLocales
 * @param getDefaultLocale
 */
function BestFitMatcher(availableLocales, requestedLocales, getDefaultLocale) {
    var minimizedAvailableLocaleMap = {};
    var minimizedAvailableLocales = new Set();
    availableLocales.forEach(function (locale) {
        var minimizedLocale = new Intl.Locale(locale)
            .minimize()
            .toString();
        minimizedAvailableLocaleMap[minimizedLocale] = locale;
        minimizedAvailableLocales.add(minimizedLocale);
    });
    var foundLocale;
    for (var _i = 0, requestedLocales_1 = requestedLocales; _i < requestedLocales_1.length; _i++) {
        var l = requestedLocales_1[_i];
        if (foundLocale) {
            break;
        }
        var noExtensionLocale = l.replace(utils_1.UNICODE_EXTENSION_SEQUENCE_REGEX, '');
        if (availableLocales.has(noExtensionLocale)) {
            foundLocale = noExtensionLocale;
            break;
        }
        if (minimizedAvailableLocales.has(noExtensionLocale)) {
            foundLocale = minimizedAvailableLocaleMap[noExtensionLocale];
            break;
        }
        var locale = new Intl.Locale(noExtensionLocale);
        var maximizedRequestedLocale = locale.maximize().toString();
        var minimizedRequestedLocale = locale.minimize().toString();
        // Check minimized locale
        if (minimizedAvailableLocales.has(minimizedRequestedLocale)) {
            foundLocale = minimizedAvailableLocaleMap[minimizedRequestedLocale];
            break;
        }
        // Lookup algo on maximized locale
        foundLocale = BestAvailableLocale_1.BestAvailableLocale(minimizedAvailableLocales, maximizedRequestedLocale);
    }
    return {
        locale: foundLocale || getDefaultLocale(),
    };
}
exports.BestFitMatcher = BestFitMatcher;

},{"./BestAvailableLocale":8,"./utils":71}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalizeLocaleList = void 0;
/**
 * http://ecma-international.org/ecma-402/7.0/index.html#sec-canonicalizelocalelist
 * @param locales
 */
function CanonicalizeLocaleList(locales) {
    // TODO
    return Intl.getCanonicalLocales(locales);
}
exports.CanonicalizeLocaleList = CanonicalizeLocaleList;

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalizeTimeZoneName = void 0;
/**
 * https://tc39.es/ecma402/#sec-canonicalizetimezonename
 * @param tz
 */
function CanonicalizeTimeZoneName(tz, _a) {
    var tzData = _a.tzData, uppercaseLinks = _a.uppercaseLinks;
    var uppercasedTz = tz.toUpperCase();
    var uppercasedZones = Object.keys(tzData).reduce(function (all, z) {
        all[z.toUpperCase()] = z;
        return all;
    }, {});
    var ianaTimeZone = uppercaseLinks[uppercasedTz] || uppercasedZones[uppercasedTz];
    if (ianaTimeZone === 'Etc/UTC' || ianaTimeZone === 'Etc/GMT') {
        return 'UTC';
    }
    return ianaTimeZone;
}
exports.CanonicalizeTimeZoneName = CanonicalizeTimeZoneName;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasicFormatMatcher = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("../utils");
var utils_2 = require("./utils");
/**
 * https://tc39.es/ecma402/#sec-basicformatmatcher
 * @param options
 * @param formats
 */
function BasicFormatMatcher(options, formats) {
    var bestScore = -Infinity;
    var bestFormat = formats[0];
    utils_1.invariant(Array.isArray(formats), 'formats should be a list of things');
    for (var _i = 0, formats_1 = formats; _i < formats_1.length; _i++) {
        var format = formats_1[_i];
        var score = 0;
        for (var _a = 0, DATE_TIME_PROPS_1 = utils_2.DATE_TIME_PROPS; _a < DATE_TIME_PROPS_1.length; _a++) {
            var prop = DATE_TIME_PROPS_1[_a];
            var optionsProp = options[prop];
            var formatProp = format[prop];
            if (optionsProp === undefined && formatProp !== undefined) {
                score -= utils_2.additionPenalty;
            }
            else if (optionsProp !== undefined && formatProp === undefined) {
                score -= utils_2.removalPenalty;
            }
            else if (optionsProp !== formatProp) {
                var values = ['2-digit', 'numeric', 'narrow', 'short', 'long'];
                var optionsPropIndex = values.indexOf(optionsProp);
                var formatPropIndex = values.indexOf(formatProp);
                var delta = Math.max(-2, Math.min(formatPropIndex - optionsPropIndex, 2));
                if (delta === 2) {
                    score -= utils_2.longMorePenalty;
                }
                else if (delta === 1) {
                    score -= utils_2.shortMorePenalty;
                }
                else if (delta === -1) {
                    score -= utils_2.shortLessPenalty;
                }
                else if (delta === -2) {
                    score -= utils_2.longLessPenalty;
                }
            }
        }
        if (score > bestScore) {
            bestScore = score;
            bestFormat = format;
        }
    }
    return tslib_1.__assign({}, bestFormat);
}
exports.BasicFormatMatcher = BasicFormatMatcher;

},{"../utils":71,"./utils":26,"tslib":88}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BestFitFormatMatcher = exports.bestFitFormatMatcherScore = void 0;
var tslib_1 = require("tslib");
var utils_1 = require("../utils");
var utils_2 = require("./utils");
var skeleton_1 = require("./skeleton");
function isNumericType(t) {
    return t === 'numeric' || t === '2-digit';
}
/**
 * Credit: https://github.com/andyearnshaw/Intl.js/blob/0958dc1ad8153f1056653ea22b8208f0df289a4e/src/12.datetimeformat.js#L611
 * with some modifications
 * @param options
 * @param format
 */
function bestFitFormatMatcherScore(options, format) {
    var score = 0;
    if (options.hour12 && !format.hour12) {
        score -= utils_2.removalPenalty;
    }
    else if (!options.hour12 && format.hour12) {
        score -= utils_2.additionPenalty;
    }
    for (var _i = 0, DATE_TIME_PROPS_1 = utils_2.DATE_TIME_PROPS; _i < DATE_TIME_PROPS_1.length; _i++) {
        var prop = DATE_TIME_PROPS_1[_i];
        var optionsProp = options[prop];
        var formatProp = format[prop];
        if (optionsProp === undefined && formatProp !== undefined) {
            score -= utils_2.additionPenalty;
        }
        else if (optionsProp !== undefined && formatProp === undefined) {
            score -= utils_2.removalPenalty;
        }
        else if (optionsProp !== formatProp) {
            // extra penalty for numeric vs non-numeric
            if (isNumericType(optionsProp) !==
                isNumericType(formatProp)) {
                score -= utils_2.differentNumericTypePenalty;
            }
            else {
                var values = ['2-digit', 'numeric', 'narrow', 'short', 'long'];
                var optionsPropIndex = values.indexOf(optionsProp);
                var formatPropIndex = values.indexOf(formatProp);
                var delta = Math.max(-2, Math.min(formatPropIndex - optionsPropIndex, 2));
                if (delta === 2) {
                    score -= utils_2.longMorePenalty;
                }
                else if (delta === 1) {
                    score -= utils_2.shortMorePenalty;
                }
                else if (delta === -1) {
                    score -= utils_2.shortLessPenalty;
                }
                else if (delta === -2) {
                    score -= utils_2.longLessPenalty;
                }
            }
        }
    }
    return score;
}
exports.bestFitFormatMatcherScore = bestFitFormatMatcherScore;
/**
 * https://tc39.es/ecma402/#sec-bestfitformatmatcher
 * Just alias to basic for now
 * @param options
 * @param formats
 * @param implDetails Implementation details
 */
function BestFitFormatMatcher(options, formats) {
    var bestScore = -Infinity;
    var bestFormat = formats[0];
    utils_1.invariant(Array.isArray(formats), 'formats should be a list of things');
    for (var _i = 0, formats_1 = formats; _i < formats_1.length; _i++) {
        var format = formats_1[_i];
        var score = bestFitFormatMatcherScore(options, format);
        if (score > bestScore) {
            bestScore = score;
            bestFormat = format;
        }
    }
    var skeletonFormat = tslib_1.__assign({}, bestFormat);
    var patternFormat = { rawPattern: bestFormat.rawPattern };
    skeleton_1.processDateTimePattern(bestFormat.rawPattern, patternFormat);
    // Kinda following https://github.com/unicode-org/icu/blob/dd50e38f459d84e9bf1b0c618be8483d318458ad/icu4j/main/classes/core/src/com/ibm/icu/text/DateTimePatternGenerator.java
    // Method adjustFieldTypes
    for (var prop in skeletonFormat) {
        var skeletonValue = skeletonFormat[prop];
        var patternValue = patternFormat[prop];
        var requestedValue = options[prop];
        // Don't mess with minute/second or we can get in the situation of
        // 7:0:0 which is weird
        if (prop === 'minute' || prop === 'second') {
            continue;
        }
        // Nothing to do here
        if (!requestedValue) {
            continue;
        }
        // https://unicode.org/reports/tr35/tr35-dates.html#Matching_Skeletons
        // Looks like we should not convert numeric to alphabetic but the other way
        // around is ok
        if (isNumericType(patternValue) &&
            !isNumericType(requestedValue)) {
            continue;
        }
        if (skeletonValue === requestedValue) {
            continue;
        }
        patternFormat[prop] = requestedValue;
    }
    // Copy those over
    patternFormat.pattern = skeletonFormat.pattern;
    patternFormat.pattern12 = skeletonFormat.pattern12;
    patternFormat.skeleton = skeletonFormat.skeleton;
    patternFormat.rangePatterns = skeletonFormat.rangePatterns;
    patternFormat.rangePatterns12 = skeletonFormat.rangePatterns12;
    return patternFormat;
}
exports.BestFitFormatMatcher = BestFitFormatMatcher;

},{"../utils":71,"./skeleton":25,"./utils":26,"tslib":88}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DateTimeStyleFormat = void 0;
var utils_1 = require("../utils");
function DateTimeStyleFormat(dateStyle, timeStyle, dataLocaleData) {
    var dateFormat, timeFormat;
    if (timeStyle !== undefined) {
        utils_1.invariant(timeStyle === 'full' ||
            timeStyle === 'long' ||
            timeStyle === 'medium' ||
            timeStyle === 'short', 'invalid timeStyle');
        timeFormat = dataLocaleData.timeFormat[timeStyle];
    }
    if (dateStyle !== undefined) {
        utils_1.invariant(dateStyle === 'full' ||
            dateStyle === 'long' ||
            dateStyle === 'medium' ||
            dateStyle === 'short', 'invalid dateStyle');
        dateFormat = dataLocaleData.dateFormat[dateStyle];
    }
    if (dateStyle !== undefined && timeStyle !== undefined) {
        var format = {};
        for (var field in dateFormat) {
            if (field !== 'pattern') {
                // @ts-ignore
                format[field] = dateFormat[field];
            }
        }
        for (var field in timeFormat) {
            if (field !== 'pattern' && field !== 'pattern12') {
                // @ts-ignore
                format[field] = timeFormat[field];
            }
        }
        var connector = dataLocaleData.dateTimeFormat[dateStyle];
        var pattern = connector
            .replace('{0}', timeFormat.pattern)
            .replace('{1}', dateFormat.pattern);
        format.pattern = pattern;
        if ('pattern12' in timeFormat) {
            var pattern12 = connector
                .replace('{0}', timeFormat.pattern12)
                .replace('{1}', dateFormat.pattern);
            format.pattern12 = pattern12;
        }
        return format;
    }
    if (timeStyle !== undefined) {
        return timeFormat;
    }
    utils_1.invariant(dateStyle !== undefined, 'dateStyle should not be undefined');
    return dateFormat;
}
exports.DateTimeStyleFormat = DateTimeStyleFormat;

},{"../utils":71}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDateTime = void 0;
var PartitionDateTimePattern_1 = require("./PartitionDateTimePattern");
/**
 * https://tc39.es/ecma402/#sec-formatdatetime
 * @param dtf DateTimeFormat
 * @param x
 */
function FormatDateTime(dtf, x, implDetails) {
    var parts = PartitionDateTimePattern_1.PartitionDateTimePattern(dtf, x, implDetails);
    var result = '';
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        result += part.value;
    }
    return result;
}
exports.FormatDateTime = FormatDateTime;

},{"./PartitionDateTimePattern":21}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDateTimePattern = void 0;
var utils_1 = require("./utils");
var ToLocalTime_1 = require("./ToLocalTime");
var _262_1 = require("../262");
function pad(n) {
    if (n < 10) {
        return "0" + n;
    }
    return String(n);
}
function offsetToGmtString(gmtFormat, hourFormat, offsetInMs, style) {
    var offsetInMinutes = Math.floor(offsetInMs / 60000);
    var mins = Math.abs(offsetInMinutes) % 60;
    var hours = Math.floor(Math.abs(offsetInMinutes) / 60);
    var _a = hourFormat.split(';'), positivePattern = _a[0], negativePattern = _a[1];
    var offsetStr = '';
    var pattern = offsetInMs < 0 ? negativePattern : positivePattern;
    if (style === 'long') {
        offsetStr = pattern
            .replace('HH', pad(hours))
            .replace('H', String(hours))
            .replace('mm', pad(mins))
            .replace('m', String(mins));
    }
    else if (mins || hours) {
        if (!mins) {
            pattern = pattern.replace(/:?m+/, '');
        }
        offsetStr = pattern
            .replace(/H+/, String(hours))
            .replace(/m+/, String(mins));
    }
    return gmtFormat.replace('{0}', offsetStr);
}
/**
 * https://tc39.es/ecma402/#sec-partitiondatetimepattern
 * @param dtf
 * @param x
 */
function FormatDateTimePattern(dtf, patternParts, x, _a) {
    var getInternalSlots = _a.getInternalSlots, localeData = _a.localeData, getDefaultTimeZone = _a.getDefaultTimeZone, tzData = _a.tzData;
    x = _262_1.TimeClip(x);
    /** IMPL START */
    var internalSlots = getInternalSlots(dtf);
    var dataLocale = internalSlots.dataLocale;
    var dataLocaleData = localeData[dataLocale];
    /** IMPL END */
    var locale = internalSlots.locale;
    var nfOptions = Object.create(null);
    nfOptions.useGrouping = false;
    var nf = new Intl.NumberFormat(locale, nfOptions);
    var nf2Options = Object.create(null);
    nf2Options.minimumIntegerDigits = 2;
    nf2Options.useGrouping = false;
    var nf2 = new Intl.NumberFormat(locale, nf2Options);
    var tm = ToLocalTime_1.ToLocalTime(x, 
    // @ts-ignore
    internalSlots.calendar, internalSlots.timeZone, { tzData: tzData });
    var result = [];
    for (var _i = 0, patternParts_1 = patternParts; _i < patternParts_1.length; _i++) {
        var patternPart = patternParts_1[_i];
        var p = patternPart.type;
        if (p === 'literal') {
            result.push({
                type: 'literal',
                value: patternPart.value,
            });
        }
        else if (utils_1.DATE_TIME_PROPS.indexOf(p) > -1) {
            var fv = '';
            var f = internalSlots[p];
            // @ts-ignore
            var v = tm[p];
            if (p === 'year' && v <= 0) {
                v = 1 - v;
            }
            if (p === 'month') {
                v++;
            }
            var hourCycle = internalSlots.hourCycle;
            if (p === 'hour' && (hourCycle === 'h11' || hourCycle === 'h12')) {
                v = v % 12;
                if (v === 0 && hourCycle === 'h12') {
                    v = 12;
                }
            }
            if (p === 'hour' && hourCycle === 'h24') {
                if (v === 0) {
                    v = 24;
                }
            }
            if (f === 'numeric') {
                fv = nf.format(v);
            }
            else if (f === '2-digit') {
                fv = nf2.format(v);
                if (fv.length > 2) {
                    fv = fv.slice(fv.length - 2, fv.length);
                }
            }
            else if (f === 'narrow' || f === 'short' || f === 'long') {
                if (p === 'era') {
                    fv = dataLocaleData[p][f][v];
                }
                else if (p === 'timeZoneName') {
                    var timeZoneName = dataLocaleData.timeZoneName, gmtFormat = dataLocaleData.gmtFormat, hourFormat = dataLocaleData.hourFormat;
                    var timeZone = internalSlots.timeZone || getDefaultTimeZone();
                    var timeZoneData = timeZoneName[timeZone];
                    if (timeZoneData && timeZoneData[f]) {
                        fv = timeZoneData[f][+tm.inDST];
                    }
                    else {
                        // Fallback to gmtFormat
                        fv = offsetToGmtString(gmtFormat, hourFormat, tm.timeZoneOffset, f);
                    }
                }
                else if (p === 'month') {
                    fv = dataLocaleData.month[f][v - 1];
                }
                else {
                    fv = dataLocaleData[p][f][v];
                }
            }
            result.push({
                type: p,
                value: fv,
            });
        }
        else if (p === 'ampm') {
            var v = tm.hour;
            var fv = void 0;
            if (v > 11) {
                fv = dataLocaleData.pm;
            }
            else {
                fv = dataLocaleData.am;
            }
            result.push({
                type: 'dayPeriod',
                value: fv,
            });
        }
        else if (p === 'relatedYear') {
            var v = tm.relatedYear;
            // @ts-ignore
            var fv = nf.format(v);
            result.push({
                // @ts-ignore TODO: Fix TS type
                type: 'relatedYear',
                value: fv,
            });
        }
        else if (p === 'yearName') {
            var v = tm.yearName;
            // @ts-ignore
            var fv = nf.format(v);
            result.push({
                // @ts-ignore TODO: Fix TS type
                type: 'yearName',
                value: fv,
            });
        }
    }
    return result;
}
exports.FormatDateTimePattern = FormatDateTimePattern;

},{"../262":7,"./ToLocalTime":24,"./utils":26}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDateTimeRange = void 0;
var PartitionDateTimeRangePattern_1 = require("./PartitionDateTimeRangePattern");
function FormatDateTimeRange(dtf, x, y, implDetails) {
    var parts = PartitionDateTimeRangePattern_1.PartitionDateTimeRangePattern(dtf, x, y, implDetails);
    var result = '';
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        result += part.value;
    }
    return result;
}
exports.FormatDateTimeRange = FormatDateTimeRange;

},{"./PartitionDateTimeRangePattern":22}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDateTimeRangeToParts = void 0;
var PartitionDateTimeRangePattern_1 = require("./PartitionDateTimeRangePattern");
function FormatDateTimeRangeToParts(dtf, x, y, implDetails) {
    var parts = PartitionDateTimeRangePattern_1.PartitionDateTimeRangePattern(dtf, x, y, implDetails);
    var result = new Array(0);
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        result.push({
            type: part.type,
            value: part.value,
            source: part.source,
        });
    }
    return result;
}
exports.FormatDateTimeRangeToParts = FormatDateTimeRangeToParts;

},{"./PartitionDateTimeRangePattern":22}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatDateTimeToParts = void 0;
var PartitionDateTimePattern_1 = require("./PartitionDateTimePattern");
var _262_1 = require("../262");
/**
 * https://tc39.es/ecma402/#sec-formatdatetimetoparts
 *
 * @param dtf
 * @param x
 * @param implDetails
 */
function FormatDateTimeToParts(dtf, x, implDetails) {
    var parts = PartitionDateTimePattern_1.PartitionDateTimePattern(dtf, x, implDetails);
    var result = _262_1.ArrayCreate(0);
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        result.push({
            type: part.type,
            value: part.value,
        });
    }
    return result;
}
exports.FormatDateTimeToParts = FormatDateTimeToParts;

},{"../262":7,"./PartitionDateTimePattern":21}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializeDateTimeFormat = void 0;
var CanonicalizeLocaleList_1 = require("../CanonicalizeLocaleList");
var ToDateTimeOptions_1 = require("./ToDateTimeOptions");
var GetOption_1 = require("../GetOption");
var ResolveLocale_1 = require("../ResolveLocale");
var IsValidTimeZoneName_1 = require("../IsValidTimeZoneName");
var CanonicalizeTimeZoneName_1 = require("../CanonicalizeTimeZoneName");
var BasicFormatMatcher_1 = require("./BasicFormatMatcher");
var BestFitFormatMatcher_1 = require("./BestFitFormatMatcher");
var utils_1 = require("../utils");
var utils_2 = require("./utils");
var DateTimeStyleFormat_1 = require("./DateTimeStyleFormat");
function isTimeRelated(opt) {
    for (var _i = 0, _a = ['hour', 'minute', 'second']; _i < _a.length; _i++) {
        var prop = _a[_i];
        var value = opt[prop];
        if (value !== undefined) {
            return true;
        }
    }
    return false;
}
function resolveHourCycle(hc, hcDefault, hour12) {
    if (hc == null) {
        hc = hcDefault;
    }
    if (hour12 !== undefined) {
        if (hour12) {
            if (hcDefault === 'h11' || hcDefault === 'h23') {
                hc = 'h11';
            }
            else {
                hc = 'h12';
            }
        }
        else {
            utils_1.invariant(!hour12, 'hour12 must not be set');
            if (hcDefault === 'h11' || hcDefault === 'h23') {
                hc = 'h23';
            }
            else {
                hc = 'h24';
            }
        }
    }
    return hc;
}
var TYPE_REGEX = /^[a-z0-9]{3,8}$/i;
/**
 * https://tc39.es/ecma402/#sec-initializedatetimeformat
 * @param dtf DateTimeFormat
 * @param locales locales
 * @param opts options
 */
function InitializeDateTimeFormat(dtf, locales, opts, _a) {
    var getInternalSlots = _a.getInternalSlots, availableLocales = _a.availableLocales, localeData = _a.localeData, getDefaultLocale = _a.getDefaultLocale, getDefaultTimeZone = _a.getDefaultTimeZone, relevantExtensionKeys = _a.relevantExtensionKeys, tzData = _a.tzData, uppercaseLinks = _a.uppercaseLinks;
    // @ts-ignore
    var requestedLocales = CanonicalizeLocaleList_1.CanonicalizeLocaleList(locales);
    var options = ToDateTimeOptions_1.ToDateTimeOptions(opts, 'any', 'date');
    var opt = Object.create(null);
    var matcher = GetOption_1.GetOption(options, 'localeMatcher', 'string', ['lookup', 'best fit'], 'best fit');
    opt.localeMatcher = matcher;
    var calendar = GetOption_1.GetOption(options, 'calendar', 'string', undefined, undefined);
    if (calendar !== undefined && !TYPE_REGEX.test(calendar)) {
        throw new RangeError('Malformed calendar');
    }
    var internalSlots = getInternalSlots(dtf);
    opt.ca = calendar;
    var numberingSystem = GetOption_1.GetOption(options, 'numberingSystem', 'string', undefined, undefined);
    if (numberingSystem !== undefined && !TYPE_REGEX.test(numberingSystem)) {
        throw new RangeError('Malformed numbering system');
    }
    opt.nu = numberingSystem;
    var hour12 = GetOption_1.GetOption(options, 'hour12', 'boolean', undefined, undefined);
    var hourCycle = GetOption_1.GetOption(options, 'hourCycle', 'string', ['h11', 'h12', 'h23', 'h24'], undefined);
    if (hour12 !== undefined) {
        // @ts-ignore
        hourCycle = null;
    }
    opt.hc = hourCycle;
    var r = ResolveLocale_1.ResolveLocale(availableLocales, requestedLocales, opt, relevantExtensionKeys, localeData, getDefaultLocale);
    internalSlots.locale = r.locale;
    calendar = r.ca;
    internalSlots.calendar = calendar;
    internalSlots.hourCycle = r.hc;
    internalSlots.numberingSystem = r.nu;
    var dataLocale = r.dataLocale;
    internalSlots.dataLocale = dataLocale;
    var timeZone = options.timeZone;
    if (timeZone !== undefined) {
        timeZone = String(timeZone);
        if (!IsValidTimeZoneName_1.IsValidTimeZoneName(timeZone, { tzData: tzData, uppercaseLinks: uppercaseLinks })) {
            throw new RangeError('Invalid timeZoneName');
        }
        timeZone = CanonicalizeTimeZoneName_1.CanonicalizeTimeZoneName(timeZone, { tzData: tzData, uppercaseLinks: uppercaseLinks });
    }
    else {
        timeZone = getDefaultTimeZone();
    }
    internalSlots.timeZone = timeZone;
    opt = Object.create(null);
    opt.weekday = GetOption_1.GetOption(options, 'weekday', 'string', ['narrow', 'short', 'long'], undefined);
    opt.era = GetOption_1.GetOption(options, 'era', 'string', ['narrow', 'short', 'long'], undefined);
    opt.year = GetOption_1.GetOption(options, 'year', 'string', ['2-digit', 'numeric'], undefined);
    opt.month = GetOption_1.GetOption(options, 'month', 'string', ['2-digit', 'numeric', 'narrow', 'short', 'long'], undefined);
    opt.day = GetOption_1.GetOption(options, 'day', 'string', ['2-digit', 'numeric'], undefined);
    opt.hour = GetOption_1.GetOption(options, 'hour', 'string', ['2-digit', 'numeric'], undefined);
    opt.minute = GetOption_1.GetOption(options, 'minute', 'string', ['2-digit', 'numeric'], undefined);
    opt.second = GetOption_1.GetOption(options, 'second', 'string', ['2-digit', 'numeric'], undefined);
    opt.timeZoneName = GetOption_1.GetOption(options, 'timeZoneName', 'string', ['short', 'long'], undefined);
    var dataLocaleData = localeData[dataLocale];
    utils_1.invariant(!!dataLocaleData, "Missing locale data for " + dataLocale);
    var formats = dataLocaleData.formats[calendar];
    // UNSPECCED: IMPLEMENTATION DETAILS
    if (!formats) {
        throw new RangeError("Calendar \"" + calendar + "\" is not supported. Try setting \"calendar\" to 1 of the following: " + Object.keys(dataLocaleData.formats).join(', '));
    }
    matcher = GetOption_1.GetOption(options, 'formatMatcher', 'string', ['basic', 'best fit'], 'best fit');
    var dateStyle = GetOption_1.GetOption(options, 'dateStyle', 'string', ['full', 'long', 'medium', 'short'], undefined);
    internalSlots.dateStyle = dateStyle;
    var timeStyle = GetOption_1.GetOption(options, 'timeStyle', 'string', ['full', 'long', 'medium', 'short'], undefined);
    internalSlots.timeStyle = timeStyle;
    var bestFormat;
    if (dateStyle === undefined && timeStyle === undefined) {
        if (matcher === 'basic') {
            bestFormat = BasicFormatMatcher_1.BasicFormatMatcher(opt, formats);
        }
        else {
            // IMPL DETAILS START
            if (isTimeRelated(opt)) {
                var hc = resolveHourCycle(internalSlots.hourCycle, dataLocaleData.hourCycle, hour12);
                opt.hour12 = hc === 'h11' || hc === 'h12';
            }
            // IMPL DETAILS END
            bestFormat = BestFitFormatMatcher_1.BestFitFormatMatcher(opt, formats);
        }
    }
    else {
        for (var _i = 0, DATE_TIME_PROPS_1 = utils_2.DATE_TIME_PROPS; _i < DATE_TIME_PROPS_1.length; _i++) {
            var prop = DATE_TIME_PROPS_1[_i];
            var p = opt[prop];
            if (p !== undefined) {
                throw new TypeError("Intl.DateTimeFormat can't set option " + prop + " when " + (dateStyle ? 'dateStyle' : 'timeStyle') + " is used");
            }
        }
        bestFormat = DateTimeStyleFormat_1.DateTimeStyleFormat(dateStyle, timeStyle, dataLocaleData);
    }
    // IMPL DETAIL START
    // For debugging
    internalSlots.format = bestFormat;
    // IMPL DETAIL END
    for (var prop in opt) {
        var p = bestFormat[prop];
        if (p !== undefined) {
            internalSlots[prop] = p;
        }
    }
    var pattern;
    var rangePatterns;
    if (internalSlots.hour !== undefined) {
        var hc = resolveHourCycle(internalSlots.hourCycle, dataLocaleData.hourCycle, hour12);
        internalSlots.hourCycle = hc;
        if (hc === 'h11' || hc === 'h12') {
            pattern = bestFormat.pattern12;
            rangePatterns = bestFormat.rangePatterns12;
        }
        else {
            pattern = bestFormat.pattern;
            rangePatterns = bestFormat.rangePatterns;
        }
    }
    else {
        // @ts-ignore
        internalSlots.hourCycle = undefined;
        pattern = bestFormat.pattern;
        rangePatterns = bestFormat.rangePatterns;
    }
    internalSlots.pattern = pattern;
    internalSlots.rangePatterns = rangePatterns;
    return dtf;
}
exports.InitializeDateTimeFormat = InitializeDateTimeFormat;

},{"../CanonicalizeLocaleList":10,"../CanonicalizeTimeZoneName":11,"../GetOption":30,"../IsValidTimeZoneName":32,"../ResolveLocale":60,"../utils":71,"./BasicFormatMatcher":12,"./BestFitFormatMatcher":13,"./DateTimeStyleFormat":14,"./ToDateTimeOptions":23,"./utils":26}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionDateTimePattern = void 0;
var _262_1 = require("../262");
var FormatDateTimePattern_1 = require("./FormatDateTimePattern");
var PartitionPattern_1 = require("../PartitionPattern");
/**
 * https://tc39.es/ecma402/#sec-partitiondatetimepattern
 * @param dtf
 * @param x
 */
function PartitionDateTimePattern(dtf, x, implDetails) {
    x = _262_1.TimeClip(x);
    if (isNaN(x)) {
        throw new RangeError('invalid time');
    }
    /** IMPL START */
    var getInternalSlots = implDetails.getInternalSlots;
    var internalSlots = getInternalSlots(dtf);
    /** IMPL END */
    var pattern = internalSlots.pattern;
    return FormatDateTimePattern_1.FormatDateTimePattern(dtf, PartitionPattern_1.PartitionPattern(pattern), x, implDetails);
}
exports.PartitionDateTimePattern = PartitionDateTimePattern;

},{"../262":7,"../PartitionPattern":50,"./FormatDateTimePattern":16}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionDateTimeRangePattern = void 0;
var _262_1 = require("../262");
var ToLocalTime_1 = require("./ToLocalTime");
var FormatDateTimePattern_1 = require("./FormatDateTimePattern");
var PartitionPattern_1 = require("../PartitionPattern");
var TABLE_2_FIELDS = [
    'era',
    'year',
    'month',
    'day',
    'ampm',
    'hour',
    'minute',
    'second',
];
function PartitionDateTimeRangePattern(dtf, x, y, implDetails) {
    x = _262_1.TimeClip(x);
    if (isNaN(x)) {
        throw new RangeError('Invalid start time');
    }
    y = _262_1.TimeClip(y);
    if (isNaN(y)) {
        throw new RangeError('Invalid end time');
    }
    /** IMPL START */
    var getInternalSlots = implDetails.getInternalSlots, tzData = implDetails.tzData;
    var internalSlots = getInternalSlots(dtf);
    /** IMPL END */
    var tm1 = ToLocalTime_1.ToLocalTime(x, 
    // @ts-ignore
    internalSlots.calendar, internalSlots.timeZone, { tzData: tzData });
    var tm2 = ToLocalTime_1.ToLocalTime(y, 
    // @ts-ignore
    internalSlots.calendar, internalSlots.timeZone, { tzData: tzData });
    var pattern = internalSlots.pattern, rangePatterns = internalSlots.rangePatterns;
    var rangePattern;
    var dateFieldsPracticallyEqual = true;
    var patternContainsLargerDateField = false;
    for (var _i = 0, TABLE_2_FIELDS_1 = TABLE_2_FIELDS; _i < TABLE_2_FIELDS_1.length; _i++) {
        var fieldName = TABLE_2_FIELDS_1[_i];
        if (dateFieldsPracticallyEqual && !patternContainsLargerDateField) {
            if (fieldName === 'ampm') {
                var rp = rangePatterns.ampm;
                if (rangePattern !== undefined && rp === undefined) {
                    patternContainsLargerDateField = true;
                }
                else {
                    var v1 = tm1.hour;
                    var v2 = tm2.hour;
                    if ((v1 > 11 && v2 < 11) || (v1 < 11 && v2 > 11)) {
                        dateFieldsPracticallyEqual = false;
                    }
                    rangePattern = rp;
                }
            }
            else {
                var rp = rangePatterns[fieldName];
                if (rangePattern !== undefined && rp === undefined) {
                    patternContainsLargerDateField = true;
                }
                else {
                    var v1 = tm1[fieldName];
                    var v2 = tm2[fieldName];
                    if (!_262_1.SameValue(v1, v2)) {
                        dateFieldsPracticallyEqual = false;
                    }
                    rangePattern = rp;
                }
            }
        }
    }
    if (dateFieldsPracticallyEqual) {
        var result_2 = FormatDateTimePattern_1.FormatDateTimePattern(dtf, PartitionPattern_1.PartitionPattern(pattern), x, implDetails);
        for (var _a = 0, result_1 = result_2; _a < result_1.length; _a++) {
            var r = result_1[_a];
            r.source = "shared" /* shared */;
        }
        return result_2;
    }
    var result = [];
    if (rangePattern === undefined) {
        rangePattern = rangePatterns.default;
        /** IMPL DETAILS */
        // Now we have to replace {0} & {1} with actual pattern
        for (var _b = 0, _c = rangePattern.patternParts; _b < _c.length; _b++) {
            var patternPart = _c[_b];
            if (patternPart.pattern === '{0}' || patternPart.pattern === '{1}') {
                patternPart.pattern = pattern;
            }
        }
    }
    for (var _d = 0, _e = rangePattern.patternParts; _d < _e.length; _d++) {
        var rangePatternPart = _e[_d];
        var source = rangePatternPart.source, pattern_1 = rangePatternPart.pattern;
        var z = void 0;
        if (source === "startRange" /* startRange */ ||
            source === "shared" /* shared */) {
            z = x;
        }
        else {
            z = y;
        }
        var patternParts = PartitionPattern_1.PartitionPattern(pattern_1);
        var partResult = FormatDateTimePattern_1.FormatDateTimePattern(dtf, patternParts, z, implDetails);
        for (var _f = 0, partResult_1 = partResult; _f < partResult_1.length; _f++) {
            var r = partResult_1[_f];
            r.source = source;
        }
        result = result.concat(partResult);
    }
    return result;
}
exports.PartitionDateTimeRangePattern = PartitionDateTimeRangePattern;

},{"../262":7,"../PartitionPattern":50,"./FormatDateTimePattern":16,"./ToLocalTime":24}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToDateTimeOptions = void 0;
var _262_1 = require("../262");
/**
 * https://tc39.es/ecma402/#sec-todatetimeoptions
 * @param options
 * @param required
 * @param defaults
 */
function ToDateTimeOptions(options, required, defaults) {
    if (options === undefined) {
        options = null;
    }
    else {
        options = _262_1.ToObject(options);
    }
    options = Object.create(options);
    var needDefaults = true;
    if (required === 'date' || required === 'any') {
        for (var _i = 0, _a = ['weekday', 'year', 'month', 'day']; _i < _a.length; _i++) {
            var prop = _a[_i];
            var value = options[prop];
            if (value !== undefined) {
                needDefaults = false;
            }
        }
    }
    if (required === 'time' || required === 'any') {
        for (var _b = 0, _c = ['hour', 'minute', 'second']; _b < _c.length; _b++) {
            var prop = _c[_b];
            var value = options[prop];
            if (value !== undefined) {
                needDefaults = false;
            }
        }
    }
    if (options.dateStyle !== undefined || options.timeStyle !== undefined) {
        needDefaults = false;
    }
    if (required === 'date' && options.timeStyle) {
        throw new TypeError('Intl.DateTimeFormat date was required but timeStyle was included');
    }
    if (required === 'time' && options.dateStyle) {
        throw new TypeError('Intl.DateTimeFormat time was required but dateStyle was included');
    }
    if (needDefaults && (defaults === 'date' || defaults === 'all')) {
        for (var _d = 0, _e = ['year', 'month', 'day']; _d < _e.length; _d++) {
            var prop = _e[_d];
            options[prop] = 'numeric';
        }
    }
    if (needDefaults && (defaults === 'time' || defaults === 'all')) {
        for (var _f = 0, _g = ['hour', 'minute', 'second']; _f < _g.length; _f++) {
            var prop = _g[_f];
            options[prop] = 'numeric';
        }
    }
    return options;
}
exports.ToDateTimeOptions = ToDateTimeOptions;

},{"../262":7}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToLocalTime = void 0;
var utils_1 = require("../utils");
var _262_1 = require("../262");
function getApplicableZoneData(t, timeZone, tzData) {
    var _a;
    var zoneData = tzData[timeZone];
    // We don't have data for this so just say it's UTC
    if (!zoneData) {
        return [0, false];
    }
    var i = 0;
    var offset = 0;
    var dst = false;
    for (; i <= zoneData.length; i++) {
        if (i === zoneData.length || zoneData[i][0] * 1e3 > t) {
            _a = zoneData[i - 1], offset = _a[2], dst = _a[3];
            break;
        }
    }
    return [offset * 1e3, dst];
}
/**
 * https://tc39.es/ecma402/#sec-tolocaltime
 * @param t
 * @param calendar
 * @param timeZone
 */
function ToLocalTime(t, calendar, timeZone, _a) {
    var tzData = _a.tzData;
    utils_1.invariant(_262_1.Type(t) === 'Number', 'invalid time');
    utils_1.invariant(calendar === 'gregory', 'We only support Gregory calendar right now');
    var _b = getApplicableZoneData(t, timeZone, tzData), timeZoneOffset = _b[0], inDST = _b[1];
    var tz = t + timeZoneOffset;
    var year = _262_1.YearFromTime(tz);
    return {
        weekday: _262_1.WeekDay(tz),
        era: year < 0 ? 'BC' : 'AD',
        year: year,
        relatedYear: undefined,
        yearName: undefined,
        month: _262_1.MonthFromTime(tz),
        day: _262_1.DateFromTime(tz),
        hour: _262_1.HourFromTime(tz),
        minute: _262_1.MinFromTime(tz),
        second: _262_1.SecFromTime(tz),
        inDST: inDST,
        // IMPORTANT: Not in spec
        timeZoneOffset: timeZoneOffset,
    };
}
exports.ToLocalTime = ToLocalTime;

},{"../262":7,"../utils":71}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitRangePattern = exports.splitFallbackRangePattern = exports.parseDateTimeSkeleton = exports.processDateTimePattern = void 0;
var tslib_1 = require("tslib");
/**
 * https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * Credit: https://github.com/caridy/intl-datetimeformat-pattern/blob/master/index.js
 * with some tweaks
 */
var DATE_TIME_REGEX = /(?:[Eec]{1,6}|G{1,5}|[Qq]{1,5}|(?:[yYur]+|U{1,5})|[ML]{1,5}|d{1,2}|D{1,3}|F{1}|[abB]{1,5}|[hkHK]{1,2}|w{1,2}|W{1}|m{1,2}|s{1,2}|[zZOvVxX]{1,4})(?=([^']*'[^']*')*[^']*$)/g;
// trim patterns after transformations
var expPatternTrimmer = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
function matchSkeletonPattern(match, result) {
    var len = match.length;
    switch (match[0]) {
        // Era
        case 'G':
            result.era = len === 4 ? 'long' : len === 5 ? 'narrow' : 'short';
            return '{era}';
        // Year
        case 'y':
        case 'Y':
        case 'u':
        case 'U':
        case 'r':
            result.year = len === 2 ? '2-digit' : 'numeric';
            return '{year}';
        // Quarter
        case 'q':
        case 'Q':
            throw new RangeError('`w/Q` (quarter) patterns are not supported');
        // Month
        case 'M':
        case 'L':
            result.month = ['numeric', '2-digit', 'short', 'long', 'narrow'][len - 1];
            return '{month}';
        // Week
        case 'w':
        case 'W':
            throw new RangeError('`w/W` (week of year) patterns are not supported');
        case 'd':
            result.day = ['numeric', '2-digit'][len - 1];
            return '{day}';
        case 'D':
        case 'F':
        case 'g':
            result.day = 'numeric';
            return '{day}';
        // Weekday
        case 'E':
            result.weekday = len === 4 ? 'long' : len === 5 ? 'narrow' : 'short';
            return '{weekday}';
        case 'e':
            result.weekday = [
                'numeric',
                '2-digit',
                'short',
                'long',
                'narrow',
                'short',
            ][len - 1];
            return '{weekday}';
        case 'c':
            result.weekday = [
                'numeric',
                undefined,
                'short',
                'long',
                'narrow',
                'short',
            ][len - 1];
            return '{weekday}';
        // Period
        case 'a': // AM, PM
        case 'b': // am, pm, noon, midnight
        case 'B': // flexible day periods
            result.hour12 = true;
            return '{ampm}';
        // Hour
        case 'h':
            result.hour = ['numeric', '2-digit'][len - 1];
            result.hour12 = true;
            return '{hour}';
        case 'H':
            result.hour = ['numeric', '2-digit'][len - 1];
            return '{hour}';
        case 'K':
            result.hour = ['numeric', '2-digit'][len - 1];
            result.hour12 = true;
            return '{hour}';
        case 'k':
            result.hour = ['numeric', '2-digit'][len - 1];
            return '{hour}';
        case 'j':
        case 'J':
        case 'C':
            throw new RangeError('`j/J/C` (hour) patterns are not supported, use `h/H/K/k` instead');
        // Minute
        case 'm':
            result.minute = ['numeric', '2-digit'][len - 1];
            return '{minute}';
        // Second
        case 's':
            result.second = ['numeric', '2-digit'][len - 1];
            return '{second}';
        case 'S':
        case 'A':
            result.second = 'numeric';
            return '{second}';
        // Zone
        case 'z': // 1..3, 4: specific non-location format
        case 'Z': // 1..3, 4, 5: The ISO8601 varios formats
        case 'O': // 1, 4: miliseconds in day short, long
        case 'v': // 1, 4: generic non-location format
        case 'V': // 1, 2, 3, 4: time zone ID or city
        case 'X': // 1, 2, 3, 4: The ISO8601 varios formats
        case 'x': // 1, 2, 3, 4: The ISO8601 varios formats
            result.timeZoneName = len < 4 ? 'short' : 'long';
            return '{timeZoneName}';
    }
    return '';
}
function skeletonTokenToTable2(c) {
    switch (c) {
        // Era
        case 'G':
            return 'era';
        // Year
        case 'y':
        case 'Y':
        case 'u':
        case 'U':
        case 'r':
            return 'year';
        // Month
        case 'M':
        case 'L':
            return 'month';
        // Day
        case 'd':
        case 'D':
        case 'F':
        case 'g':
            return 'day';
        // Period
        case 'a': // AM, PM
        case 'b': // am, pm, noon, midnight
        case 'B': // flexible day periods
            return 'ampm';
        // Hour
        case 'h':
        case 'H':
        case 'K':
        case 'k':
            return 'hour';
        // Minute
        case 'm':
            return 'minute';
        // Second
        case 's':
        case 'S':
        case 'A':
            return 'second';
        default:
            throw new RangeError('Invalid range pattern token');
    }
}
function processDateTimePattern(pattern, result) {
    var literals = [];
    // Use skeleton to populate result, but use mapped pattern to populate pattern
    var pattern12 = pattern
        // Double apostrophe
        .replace(/'{2}/g, '{apostrophe}')
        // Apostrophe-escaped
        .replace(/'(.*?)'/g, function (_, literal) {
        literals.push(literal);
        return "$$" + (literals.length - 1) + "$$";
    })
        .replace(DATE_TIME_REGEX, function (m) { return matchSkeletonPattern(m, result || {}); });
    //Restore literals
    if (literals.length) {
        pattern12 = pattern12
            .replace(/\$\$(\d+)\$\$/g, function (_, i) {
            return literals[+i];
        })
            .replace(/\{apostrophe\}/g, "'");
    }
    // Handle apostrophe-escaped things
    return [
        pattern12
            .replace(/([\s\uFEFF\xA0])\{ampm\}([\s\uFEFF\xA0])/, '$1')
            .replace('{ampm}', '')
            .replace(expPatternTrimmer, ''),
        pattern12,
    ];
}
exports.processDateTimePattern = processDateTimePattern;
/**
 * Parse Date time skeleton into Intl.DateTimeFormatOptions
 * Ref: https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
 * @public
 * @param skeleton skeleton string
 */
function parseDateTimeSkeleton(skeleton, rawPattern, rangePatterns, intervalFormatFallback) {
    if (rawPattern === void 0) { rawPattern = skeleton; }
    var result = {
        pattern: '',
        pattern12: '',
        skeleton: skeleton,
        rawPattern: rawPattern,
        rangePatterns: {},
        rangePatterns12: {},
    };
    if (rangePatterns) {
        for (var k in rangePatterns) {
            var key = skeletonTokenToTable2(k);
            var rawPattern_1 = rangePatterns[k];
            var intervalResult = {
                patternParts: [],
            };
            var _a = processDateTimePattern(rawPattern_1, intervalResult), pattern_1 = _a[0], pattern12_1 = _a[1];
            result.rangePatterns[key] = tslib_1.__assign(tslib_1.__assign({}, intervalResult), { patternParts: splitRangePattern(pattern_1) });
            result.rangePatterns12[key] = tslib_1.__assign(tslib_1.__assign({}, intervalResult), { patternParts: splitRangePattern(pattern12_1) });
        }
    }
    else if (intervalFormatFallback) {
        var patternParts = splitFallbackRangePattern(intervalFormatFallback);
        result.rangePatterns.default = {
            patternParts: patternParts,
        };
        result.rangePatterns12.default = {
            patternParts: patternParts,
        };
    }
    // Process skeleton
    skeleton.replace(DATE_TIME_REGEX, function (m) { return matchSkeletonPattern(m, result); });
    var _b = processDateTimePattern(rawPattern), pattern = _b[0], pattern12 = _b[1];
    result.pattern = pattern;
    result.pattern12 = pattern12;
    return result;
}
exports.parseDateTimeSkeleton = parseDateTimeSkeleton;
function splitFallbackRangePattern(pattern) {
    var parts = pattern.split(/(\{[0|1]\})/g).filter(Boolean);
    return parts.map(function (pattern) {
        switch (pattern) {
            case '{0}':
                return {
                    source: "startRange" /* startRange */,
                    pattern: pattern,
                };
            case '{1}':
                return {
                    source: "endRange" /* endRange */,
                    pattern: pattern,
                };
            default:
                return {
                    source: "shared" /* shared */,
                    pattern: pattern,
                };
        }
    });
}
exports.splitFallbackRangePattern = splitFallbackRangePattern;
function splitRangePattern(pattern) {
    var PART_REGEX = /\{(.*?)\}/g;
    // Map of part and index within the string
    var parts = {};
    var match;
    var splitIndex = 0;
    while ((match = PART_REGEX.exec(pattern))) {
        if (!(match[0] in parts)) {
            parts[match[0]] = match.index;
        }
        else {
            splitIndex = match.index;
            break;
        }
    }
    if (!splitIndex) {
        return [
            {
                source: "startRange" /* startRange */,
                pattern: pattern,
            },
        ];
    }
    return [
        {
            source: "startRange" /* startRange */,
            pattern: pattern.slice(0, splitIndex),
        },
        {
            source: "endRange" /* endRange */,
            pattern: pattern.slice(splitIndex),
        },
    ];
}
exports.splitRangePattern = splitRangePattern;

},{"tslib":88}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shortMorePenalty = exports.shortLessPenalty = exports.longMorePenalty = exports.longLessPenalty = exports.differentNumericTypePenalty = exports.additionPenalty = exports.removalPenalty = exports.DATE_TIME_PROPS = void 0;
exports.DATE_TIME_PROPS = [
    'weekday',
    'era',
    'year',
    'month',
    'day',
    'hour',
    'minute',
    'second',
    'timeZoneName',
];
exports.removalPenalty = 120;
exports.additionPenalty = 20;
exports.differentNumericTypePenalty = 15;
exports.longLessPenalty = 8;
exports.longMorePenalty = 6;
exports.shortLessPenalty = 6;
exports.shortMorePenalty = 3;

},{}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultNumberOption = void 0;
/**
 * https://tc39.es/ecma402/#sec-defaultnumberoption
 * @param val
 * @param min
 * @param max
 * @param fallback
 */
function DefaultNumberOption(val, min, max, fallback) {
    if (val !== undefined) {
        val = Number(val);
        if (isNaN(val) || val < min || val > max) {
            throw new RangeError(val + " is outside of range [" + min + ", " + max + "]");
        }
        return Math.floor(val);
    }
    return fallback;
}
exports.DefaultNumberOption = DefaultNumberOption;

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanonicalCodeForDisplayNames = void 0;
var CanonicalizeLocaleList_1 = require("../CanonicalizeLocaleList");
var utils_1 = require("../utils");
var IsWellFormedCurrencyCode_1 = require("../IsWellFormedCurrencyCode");
var UNICODE_REGION_SUBTAG_REGEX = /^([a-z]{2}|[0-9]{3})$/i;
var ALPHA_4 = /^[a-z]{4}$/i;
function isUnicodeRegionSubtag(region) {
    return UNICODE_REGION_SUBTAG_REGEX.test(region);
}
function isUnicodeScriptSubtag(script) {
    return ALPHA_4.test(script);
}
function CanonicalCodeForDisplayNames(type, code) {
    if (type === 'language') {
        return CanonicalizeLocaleList_1.CanonicalizeLocaleList([code])[0];
    }
    if (type === 'region') {
        if (!isUnicodeRegionSubtag(code)) {
            throw RangeError('invalid region');
        }
        return code.toUpperCase();
    }
    if (type === 'script') {
        if (!isUnicodeScriptSubtag(code)) {
            throw RangeError('invalid script');
        }
        return "" + code[0].toUpperCase() + code.slice(1);
    }
    utils_1.invariant(type === 'currency', 'invalid type');
    if (!IsWellFormedCurrencyCode_1.IsWellFormedCurrencyCode(code)) {
        throw RangeError('invalid currency');
    }
    return code.toUpperCase();
}
exports.CanonicalCodeForDisplayNames = CanonicalCodeForDisplayNames;

},{"../CanonicalizeLocaleList":10,"../IsWellFormedCurrencyCode":33,"../utils":71}],29:[function(require,module,exports){
"use strict";
/**
 * https://tc39.es/ecma402/#sec-getnumberoption
 * @param options
 * @param property
 * @param min
 * @param max
 * @param fallback
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetNumberOption = void 0;
var DefaultNumberOption_1 = require("./DefaultNumberOption");
function GetNumberOption(options, property, minimum, maximum, fallback) {
    var val = options[property];
    return DefaultNumberOption_1.DefaultNumberOption(val, minimum, maximum, fallback);
}
exports.GetNumberOption = GetNumberOption;

},{"./DefaultNumberOption":27}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOption = void 0;
var _262_1 = require("./262");
/**
 * https://tc39.es/ecma402/#sec-getoption
 * @param opts
 * @param prop
 * @param type
 * @param values
 * @param fallback
 */
function GetOption(opts, prop, type, values, fallback) {
    // const descriptor = Object.getOwnPropertyDescriptor(opts, prop);
    var value = opts[prop];
    if (value !== undefined) {
        if (type !== 'boolean' && type !== 'string') {
            throw new TypeError('invalid type');
        }
        if (type === 'boolean') {
            value = Boolean(value);
        }
        if (type === 'string') {
            value = _262_1.ToString(value);
        }
        if (values !== undefined && !values.filter(function (val) { return val == value; }).length) {
            throw new RangeError(value + " is not within " + values.join(', '));
        }
        return value;
    }
    return fallback;
}
exports.GetOption = GetOption;

},{"./262":7}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsSanctionedSimpleUnitIdentifier = exports.SIMPLE_UNITS = exports.removeUnitNamespace = exports.SANCTIONED_UNITS = void 0;
/**
 * https://tc39.es/ecma402/#table-sanctioned-simple-unit-identifiers
 */
exports.SANCTIONED_UNITS = [
    'angle-degree',
    'area-acre',
    'area-hectare',
    'concentr-percent',
    'digital-bit',
    'digital-byte',
    'digital-gigabit',
    'digital-gigabyte',
    'digital-kilobit',
    'digital-kilobyte',
    'digital-megabit',
    'digital-megabyte',
    'digital-petabyte',
    'digital-terabit',
    'digital-terabyte',
    'duration-day',
    'duration-hour',
    'duration-millisecond',
    'duration-minute',
    'duration-month',
    'duration-second',
    'duration-week',
    'duration-year',
    'length-centimeter',
    'length-foot',
    'length-inch',
    'length-kilometer',
    'length-meter',
    'length-mile-scandinavian',
    'length-mile',
    'length-millimeter',
    'length-yard',
    'mass-gram',
    'mass-kilogram',
    'mass-ounce',
    'mass-pound',
    'mass-stone',
    'temperature-celsius',
    'temperature-fahrenheit',
    'volume-fluid-ounce',
    'volume-gallon',
    'volume-liter',
    'volume-milliliter',
];
// In CLDR, the unit name always follows the form `namespace-unit` pattern.
// For example: `digital-bit` instead of `bit`. This function removes the namespace prefix.
function removeUnitNamespace(unit) {
    return unit.slice(unit.indexOf('-') + 1);
}
exports.removeUnitNamespace = removeUnitNamespace;
/**
 * https://tc39.es/ecma402/#table-sanctioned-simple-unit-identifiers
 */
exports.SIMPLE_UNITS = exports.SANCTIONED_UNITS.map(removeUnitNamespace);
/**
 * https://tc39.es/ecma402/#sec-issanctionedsimpleunitidentifier
 */
function IsSanctionedSimpleUnitIdentifier(unitIdentifier) {
    return exports.SIMPLE_UNITS.indexOf(unitIdentifier) > -1;
}
exports.IsSanctionedSimpleUnitIdentifier = IsSanctionedSimpleUnitIdentifier;

},{}],32:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsValidTimeZoneName = void 0;
/**
 * https://tc39.es/ecma402/#sec-isvalidtimezonename
 * @param tz
 * @param implDetails implementation details
 */
function IsValidTimeZoneName(tz, _a) {
    var tzData = _a.tzData, uppercaseLinks = _a.uppercaseLinks;
    var uppercasedTz = tz.toUpperCase();
    var zoneNames = new Set();
    Object.keys(tzData)
        .map(function (z) { return z.toUpperCase(); })
        .forEach(function (z) { return zoneNames.add(z); });
    return zoneNames.has(uppercasedTz) || uppercasedTz in uppercaseLinks;
}
exports.IsValidTimeZoneName = IsValidTimeZoneName;

},{}],33:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsWellFormedCurrencyCode = void 0;
/**
 * This follows https://tc39.es/ecma402/#sec-case-sensitivity-and-case-mapping
 * @param str string to convert
 */
function toUpperCase(str) {
    return str.replace(/([a-z])/g, function (_, c) { return c.toUpperCase(); });
}
var NOT_A_Z_REGEX = /[^A-Z]/;
/**
 * https://tc39.es/ecma402/#sec-iswellformedcurrencycode
 */
function IsWellFormedCurrencyCode(currency) {
    currency = toUpperCase(currency);
    if (currency.length !== 3) {
        return false;
    }
    if (NOT_A_Z_REGEX.test(currency)) {
        return false;
    }
    return true;
}
exports.IsWellFormedCurrencyCode = IsWellFormedCurrencyCode;

},{}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsWellFormedUnitIdentifier = void 0;
var IsSanctionedSimpleUnitIdentifier_1 = require("./IsSanctionedSimpleUnitIdentifier");
/**
 * This follows https://tc39.es/ecma402/#sec-case-sensitivity-and-case-mapping
 * @param str string to convert
 */
function toLowerCase(str) {
    return str.replace(/([A-Z])/g, function (_, c) { return c.toLowerCase(); });
}
/**
 * https://tc39.es/ecma402/#sec-iswellformedunitidentifier
 * @param unit
 */
function IsWellFormedUnitIdentifier(unit) {
    unit = toLowerCase(unit);
    if (IsSanctionedSimpleUnitIdentifier_1.IsSanctionedSimpleUnitIdentifier(unit)) {
        return true;
    }
    var units = unit.split('-per-');
    if (units.length !== 2) {
        return false;
    }
    var numerator = units[0], denominator = units[1];
    if (!IsSanctionedSimpleUnitIdentifier_1.IsSanctionedSimpleUnitIdentifier(numerator) ||
        !IsSanctionedSimpleUnitIdentifier_1.IsSanctionedSimpleUnitIdentifier(denominator)) {
        return false;
    }
    return true;
}
exports.IsWellFormedUnitIdentifier = IsWellFormedUnitIdentifier;

},{"./IsSanctionedSimpleUnitIdentifier":31}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupMatcher = void 0;
var utils_1 = require("./utils");
var BestAvailableLocale_1 = require("./BestAvailableLocale");
/**
 * https://tc39.es/ecma402/#sec-lookupmatcher
 * @param availableLocales
 * @param requestedLocales
 * @param getDefaultLocale
 */
function LookupMatcher(availableLocales, requestedLocales, getDefaultLocale) {
    var result = { locale: '' };
    for (var _i = 0, requestedLocales_1 = requestedLocales; _i < requestedLocales_1.length; _i++) {
        var locale = requestedLocales_1[_i];
        var noExtensionLocale = locale.replace(utils_1.UNICODE_EXTENSION_SEQUENCE_REGEX, '');
        var availableLocale = BestAvailableLocale_1.BestAvailableLocale(availableLocales, noExtensionLocale);
        if (availableLocale) {
            result.locale = availableLocale;
            if (locale !== noExtensionLocale) {
                result.extension = locale.slice(noExtensionLocale.length + 1, locale.length);
            }
            return result;
        }
    }
    result.locale = getDefaultLocale();
    return result;
}
exports.LookupMatcher = LookupMatcher;

},{"./BestAvailableLocale":8,"./utils":71}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LookupSupportedLocales = void 0;
var utils_1 = require("./utils");
var BestAvailableLocale_1 = require("./BestAvailableLocale");
/**
 * https://tc39.es/ecma402/#sec-lookupsupportedlocales
 * @param availableLocales
 * @param requestedLocales
 */
function LookupSupportedLocales(availableLocales, requestedLocales) {
    var subset = [];
    for (var _i = 0, requestedLocales_1 = requestedLocales; _i < requestedLocales_1.length; _i++) {
        var locale = requestedLocales_1[_i];
        var noExtensionLocale = locale.replace(utils_1.UNICODE_EXTENSION_SEQUENCE_REGEX, '');
        var availableLocale = BestAvailableLocale_1.BestAvailableLocale(availableLocales, noExtensionLocale);
        if (availableLocale) {
            subset.push(availableLocale);
        }
    }
    return subset;
}
exports.LookupSupportedLocales = LookupSupportedLocales;

},{"./BestAvailableLocale":8,"./utils":71}],37:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeExponent = void 0;
var utils_1 = require("../utils");
var ComputeExponentForMagnitude_1 = require("./ComputeExponentForMagnitude");
var FormatNumericToString_1 = require("./FormatNumericToString");
/**
 * The abstract operation ComputeExponent computes an exponent (power of ten) by which to scale x
 * according to the number formatting settings. It handles cases such as 999 rounding up to 1000,
 * requiring a different exponent.
 *
 * NOT IN SPEC: it returns [exponent, magnitude].
 */
function ComputeExponent(numberFormat, x, _a) {
    var getInternalSlots = _a.getInternalSlots;
    if (x === 0) {
        return [0, 0];
    }
    if (x < 0) {
        x = -x;
    }
    var magnitude = utils_1.getMagnitude(x);
    var exponent = ComputeExponentForMagnitude_1.ComputeExponentForMagnitude(numberFormat, magnitude, {
        getInternalSlots: getInternalSlots,
    });
    // Preserve more precision by doing multiplication when exponent is negative.
    x = exponent < 0 ? x * Math.pow(10, -exponent) : x / Math.pow(10, exponent);
    var formatNumberResult = FormatNumericToString_1.FormatNumericToString(getInternalSlots(numberFormat), x);
    if (formatNumberResult.roundedNumber === 0) {
        return [exponent, magnitude];
    }
    var newMagnitude = utils_1.getMagnitude(formatNumberResult.roundedNumber);
    if (newMagnitude === magnitude - exponent) {
        return [exponent, magnitude];
    }
    return [
        ComputeExponentForMagnitude_1.ComputeExponentForMagnitude(numberFormat, magnitude + 1, {
            getInternalSlots: getInternalSlots,
        }),
        magnitude + 1,
    ];
}
exports.ComputeExponent = ComputeExponent;

},{"../utils":71,"./ComputeExponentForMagnitude":38,"./FormatNumericToString":41}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComputeExponentForMagnitude = void 0;
/**
 * The abstract operation ComputeExponentForMagnitude computes an exponent by which to scale a
 * number of the given magnitude (power of ten of the most significant digit) according to the
 * locale and the desired notation (scientific, engineering, or compact).
 */
function ComputeExponentForMagnitude(numberFormat, magnitude, _a) {
    var getInternalSlots = _a.getInternalSlots;
    var internalSlots = getInternalSlots(numberFormat);
    var notation = internalSlots.notation, dataLocaleData = internalSlots.dataLocaleData, numberingSystem = internalSlots.numberingSystem;
    switch (notation) {
        case 'standard':
            return 0;
        case 'scientific':
            return magnitude;
        case 'engineering':
            return Math.floor(magnitude / 3) * 3;
        default: {
            // Let exponent be an implementation- and locale-dependent (ILD) integer by which to scale a
            // number of the given magnitude in compact notation for the current locale.
            var compactDisplay = internalSlots.compactDisplay, style = internalSlots.style, currencyDisplay = internalSlots.currencyDisplay;
            var thresholdMap = void 0;
            if (style === 'currency' && currencyDisplay !== 'name') {
                var currency = dataLocaleData.numbers.currency[numberingSystem] ||
                    dataLocaleData.numbers.currency[dataLocaleData.numbers.nu[0]];
                thresholdMap = currency.short;
            }
            else {
                var decimal = dataLocaleData.numbers.decimal[numberingSystem] ||
                    dataLocaleData.numbers.decimal[dataLocaleData.numbers.nu[0]];
                thresholdMap = compactDisplay === 'long' ? decimal.long : decimal.short;
            }
            if (!thresholdMap) {
                return 0;
            }
            var num = String(Math.pow(10, magnitude));
            var thresholds = Object.keys(thresholdMap); // TODO: this can be pre-processed
            if (num < thresholds[0]) {
                return 0;
            }
            if (num > thresholds[thresholds.length - 1]) {
                return thresholds[thresholds.length - 1].length - 1;
            }
            var i = thresholds.indexOf(num);
            if (i === -1) {
                return 0;
            }
            // See https://unicode.org/reports/tr35/tr35-numbers.html#Compact_Number_Formats
            // Special handling if the pattern is precisely `0`.
            var magnitudeKey = thresholds[i];
            // TODO: do we need to handle plural here?
            var compactPattern = thresholdMap[magnitudeKey].other;
            if (compactPattern === '0') {
                return 0;
            }
            // Example: in zh-TW, `10000000` maps to `0000萬`. So we need to return 8 - 4 = 4 here.
            return (magnitudeKey.length -
                thresholdMap[magnitudeKey].other.match(/0+/)[0].length);
        }
    }
}
exports.ComputeExponentForMagnitude = ComputeExponentForMagnitude;

},{}],39:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrencyDigits = void 0;
var _262_1 = require("../262");
/**
 * https://tc39.es/ecma402/#sec-currencydigits
 */
function CurrencyDigits(c, _a) {
    var currencyDigitsData = _a.currencyDigitsData;
    return _262_1.HasOwnProperty(currencyDigitsData, c)
        ? currencyDigitsData[c]
        : 2;
}
exports.CurrencyDigits = CurrencyDigits;

},{"../262":7}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatNumericToParts = void 0;
var PartitionNumberPattern_1 = require("./PartitionNumberPattern");
var _262_1 = require("../262");
function FormatNumericToParts(nf, x, implDetails) {
    var parts = PartitionNumberPattern_1.PartitionNumberPattern(nf, x, implDetails);
    var result = _262_1.ArrayCreate(0);
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        result.push({
            type: part.type,
            value: part.value,
        });
    }
    return result;
}
exports.FormatNumericToParts = FormatNumericToParts;

},{"../262":7,"./PartitionNumberPattern":43}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatNumericToString = void 0;
var _262_1 = require("../262");
var ToRawPrecision_1 = require("./ToRawPrecision");
var utils_1 = require("../utils");
var ToRawFixed_1 = require("./ToRawFixed");
/**
 * https://tc39.es/ecma402/#sec-formatnumberstring
 */
function FormatNumericToString(intlObject, x) {
    var isNegative = x < 0 || _262_1.SameValue(x, -0);
    if (isNegative) {
        x = -x;
    }
    var result;
    var rourndingType = intlObject.roundingType;
    switch (rourndingType) {
        case 'significantDigits':
            result = ToRawPrecision_1.ToRawPrecision(x, intlObject.minimumSignificantDigits, intlObject.maximumSignificantDigits);
            break;
        case 'fractionDigits':
            result = ToRawFixed_1.ToRawFixed(x, intlObject.minimumFractionDigits, intlObject.maximumFractionDigits);
            break;
        default:
            result = ToRawPrecision_1.ToRawPrecision(x, 1, 2);
            if (result.integerDigitsCount > 1) {
                result = ToRawFixed_1.ToRawFixed(x, 0, 0);
            }
            break;
    }
    x = result.roundedNumber;
    var string = result.formattedString;
    var int = result.integerDigitsCount;
    var minInteger = intlObject.minimumIntegerDigits;
    if (int < minInteger) {
        var forwardZeros = utils_1.repeat('0', minInteger - int);
        string = forwardZeros + string;
    }
    if (isNegative) {
        x = -x;
    }
    return { roundedNumber: x, formattedString: string };
}
exports.FormatNumericToString = FormatNumericToString;

},{"../262":7,"../utils":71,"./ToRawFixed":46,"./ToRawPrecision":47}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializeNumberFormat = void 0;
var CanonicalizeLocaleList_1 = require("../CanonicalizeLocaleList");
var _262_1 = require("../262");
var GetOption_1 = require("../GetOption");
var ResolveLocale_1 = require("../ResolveLocale");
var SetNumberFormatUnitOptions_1 = require("./SetNumberFormatUnitOptions");
var CurrencyDigits_1 = require("./CurrencyDigits");
var SetNumberFormatDigitOptions_1 = require("./SetNumberFormatDigitOptions");
var utils_1 = require("../utils");
/**
 * https://tc39.es/ecma402/#sec-initializenumberformat
 */
function InitializeNumberFormat(nf, locales, opts, _a) {
    var getInternalSlots = _a.getInternalSlots, localeData = _a.localeData, availableLocales = _a.availableLocales, numberingSystemNames = _a.numberingSystemNames, getDefaultLocale = _a.getDefaultLocale, currencyDigitsData = _a.currencyDigitsData;
    // @ts-ignore
    var requestedLocales = CanonicalizeLocaleList_1.CanonicalizeLocaleList(locales);
    var options = opts === undefined ? Object.create(null) : _262_1.ToObject(opts);
    var opt = Object.create(null);
    var matcher = GetOption_1.GetOption(options, 'localeMatcher', 'string', ['lookup', 'best fit'], 'best fit');
    opt.localeMatcher = matcher;
    var numberingSystem = GetOption_1.GetOption(options, 'numberingSystem', 'string', undefined, undefined);
    if (numberingSystem !== undefined &&
        numberingSystemNames.indexOf(numberingSystem) < 0) {
        // 8.a. If numberingSystem does not match the Unicode Locale Identifier type nonterminal,
        // throw a RangeError exception.
        throw RangeError("Invalid numberingSystems: " + numberingSystem);
    }
    opt.nu = numberingSystem;
    var r = ResolveLocale_1.ResolveLocale(availableLocales, requestedLocales, opt, 
    // [[RelevantExtensionKeys]] slot, which is a constant
    ['nu'], localeData, getDefaultLocale);
    var dataLocaleData = localeData[r.dataLocale];
    utils_1.invariant(!!dataLocaleData, "Missing locale data for " + r.dataLocale);
    var internalSlots = getInternalSlots(nf);
    internalSlots.locale = r.locale;
    internalSlots.dataLocale = r.dataLocale;
    internalSlots.numberingSystem = r.nu;
    internalSlots.dataLocaleData = dataLocaleData;
    SetNumberFormatUnitOptions_1.SetNumberFormatUnitOptions(nf, options, { getInternalSlots: getInternalSlots });
    var style = internalSlots.style;
    var mnfdDefault;
    var mxfdDefault;
    if (style === 'currency') {
        var currency = internalSlots.currency;
        var cDigits = CurrencyDigits_1.CurrencyDigits(currency, { currencyDigitsData: currencyDigitsData });
        mnfdDefault = cDigits;
        mxfdDefault = cDigits;
    }
    else {
        mnfdDefault = 0;
        mxfdDefault = style === 'percent' ? 0 : 3;
    }
    var notation = GetOption_1.GetOption(options, 'notation', 'string', ['standard', 'scientific', 'engineering', 'compact'], 'standard');
    internalSlots.notation = notation;
    SetNumberFormatDigitOptions_1.SetNumberFormatDigitOptions(internalSlots, options, mnfdDefault, mxfdDefault, notation);
    var compactDisplay = GetOption_1.GetOption(options, 'compactDisplay', 'string', ['short', 'long'], 'short');
    if (notation === 'compact') {
        internalSlots.compactDisplay = compactDisplay;
    }
    var useGrouping = GetOption_1.GetOption(options, 'useGrouping', 'boolean', undefined, true);
    internalSlots.useGrouping = useGrouping;
    var signDisplay = GetOption_1.GetOption(options, 'signDisplay', 'string', ['auto', 'never', 'always', 'exceptZero'], 'auto');
    internalSlots.signDisplay = signDisplay;
    return nf;
}
exports.InitializeNumberFormat = InitializeNumberFormat;

},{"../262":7,"../CanonicalizeLocaleList":10,"../GetOption":30,"../ResolveLocale":60,"../utils":71,"./CurrencyDigits":39,"./SetNumberFormatDigitOptions":44,"./SetNumberFormatUnitOptions":45}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionNumberPattern = void 0;
var tslib_1 = require("tslib");
var FormatNumericToString_1 = require("./FormatNumericToString");
var _262_1 = require("../262");
var ComputeExponent_1 = require("./ComputeExponent");
var format_to_parts_1 = tslib_1.__importDefault(require("./format_to_parts"));
/**
 * https://tc39.es/ecma402/#sec-formatnumberstring
 */
function PartitionNumberPattern(numberFormat, x, _a) {
    var _b;
    var getInternalSlots = _a.getInternalSlots;
    var internalSlots = getInternalSlots(numberFormat);
    var pl = internalSlots.pl, dataLocaleData = internalSlots.dataLocaleData, numberingSystem = internalSlots.numberingSystem;
    var symbols = dataLocaleData.numbers.symbols[numberingSystem] ||
        dataLocaleData.numbers.symbols[dataLocaleData.numbers.nu[0]];
    var magnitude = 0;
    var exponent = 0;
    var n;
    if (isNaN(x)) {
        n = symbols.nan;
    }
    else if (!isFinite(x)) {
        n = symbols.infinity;
    }
    else {
        if (internalSlots.style === 'percent') {
            x *= 100;
        }
        _b = ComputeExponent_1.ComputeExponent(numberFormat, x, {
            getInternalSlots: getInternalSlots,
        }), exponent = _b[0], magnitude = _b[1];
        // Preserve more precision by doing multiplication when exponent is negative.
        x = exponent < 0 ? x * Math.pow(10, -exponent) : x / Math.pow(10, exponent);
        var formatNumberResult = FormatNumericToString_1.FormatNumericToString(internalSlots, x);
        n = formatNumberResult.formattedString;
        x = formatNumberResult.roundedNumber;
    }
    // Based on https://tc39.es/ecma402/#sec-getnumberformatpattern
    // We need to do this before `x` is rounded.
    var sign;
    var signDisplay = internalSlots.signDisplay;
    switch (signDisplay) {
        case 'never':
            sign = 0;
            break;
        case 'auto':
            if (_262_1.SameValue(x, 0) || x > 0 || isNaN(x)) {
                sign = 0;
            }
            else {
                sign = -1;
            }
            break;
        case 'always':
            if (_262_1.SameValue(x, 0) || x > 0 || isNaN(x)) {
                sign = 1;
            }
            else {
                sign = -1;
            }
            break;
        default:
            // x === 0 -> x is 0 or x is -0
            if (x === 0 || isNaN(x)) {
                sign = 0;
            }
            else if (x > 0) {
                sign = 1;
            }
            else {
                sign = -1;
            }
    }
    return format_to_parts_1.default({ roundedNumber: x, formattedString: n, exponent: exponent, magnitude: magnitude, sign: sign }, internalSlots.dataLocaleData, pl, internalSlots);
}
exports.PartitionNumberPattern = PartitionNumberPattern;

},{"../262":7,"./ComputeExponent":37,"./FormatNumericToString":41,"./format_to_parts":49,"tslib":88}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetNumberFormatDigitOptions = void 0;
var GetNumberOption_1 = require("../GetNumberOption");
var DefaultNumberOption_1 = require("../DefaultNumberOption");
/**
 * https://tc39.es/ecma402/#sec-setnfdigitoptions
 */
function SetNumberFormatDigitOptions(internalSlots, opts, mnfdDefault, mxfdDefault, notation) {
    var mnid = GetNumberOption_1.GetNumberOption(opts, 'minimumIntegerDigits', 1, 21, 1);
    var mnfd = opts.minimumFractionDigits;
    var mxfd = opts.maximumFractionDigits;
    var mnsd = opts.minimumSignificantDigits;
    var mxsd = opts.maximumSignificantDigits;
    internalSlots.minimumIntegerDigits = mnid;
    if (mnsd !== undefined || mxsd !== undefined) {
        internalSlots.roundingType = 'significantDigits';
        mnsd = DefaultNumberOption_1.DefaultNumberOption(mnsd, 1, 21, 1);
        mxsd = DefaultNumberOption_1.DefaultNumberOption(mxsd, mnsd, 21, 21);
        internalSlots.minimumSignificantDigits = mnsd;
        internalSlots.maximumSignificantDigits = mxsd;
    }
    else if (mnfd !== undefined || mxfd !== undefined) {
        internalSlots.roundingType = 'fractionDigits';
        mnfd = DefaultNumberOption_1.DefaultNumberOption(mnfd, 0, 20, mnfdDefault);
        var mxfdActualDefault = Math.max(mnfd, mxfdDefault);
        mxfd = DefaultNumberOption_1.DefaultNumberOption(mxfd, mnfd, 20, mxfdActualDefault);
        internalSlots.minimumFractionDigits = mnfd;
        internalSlots.maximumFractionDigits = mxfd;
    }
    else if (notation === 'compact') {
        internalSlots.roundingType = 'compactRounding';
    }
    else {
        internalSlots.roundingType = 'fractionDigits';
        internalSlots.minimumFractionDigits = mnfdDefault;
        internalSlots.maximumFractionDigits = mxfdDefault;
    }
}
exports.SetNumberFormatDigitOptions = SetNumberFormatDigitOptions;

},{"../DefaultNumberOption":27,"../GetNumberOption":29}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetNumberFormatUnitOptions = void 0;
var GetOption_1 = require("../GetOption");
var IsWellFormedCurrencyCode_1 = require("../IsWellFormedCurrencyCode");
var IsWellFormedUnitIdentifier_1 = require("../IsWellFormedUnitIdentifier");
/**
 * https://tc39.es/ecma402/#sec-setnumberformatunitoptions
 */
function SetNumberFormatUnitOptions(nf, options, _a) {
    if (options === void 0) { options = Object.create(null); }
    var getInternalSlots = _a.getInternalSlots;
    var internalSlots = getInternalSlots(nf);
    var style = GetOption_1.GetOption(options, 'style', 'string', ['decimal', 'percent', 'currency', 'unit'], 'decimal');
    internalSlots.style = style;
    var currency = GetOption_1.GetOption(options, 'currency', 'string', undefined, undefined);
    if (currency !== undefined && !IsWellFormedCurrencyCode_1.IsWellFormedCurrencyCode(currency)) {
        throw RangeError('Malformed currency code');
    }
    if (style === 'currency' && currency === undefined) {
        throw TypeError('currency cannot be undefined');
    }
    var currencyDisplay = GetOption_1.GetOption(options, 'currencyDisplay', 'string', ['code', 'symbol', 'narrowSymbol', 'name'], 'symbol');
    var currencySign = GetOption_1.GetOption(options, 'currencySign', 'string', ['standard', 'accounting'], 'standard');
    var unit = GetOption_1.GetOption(options, 'unit', 'string', undefined, undefined);
    if (unit !== undefined && !IsWellFormedUnitIdentifier_1.IsWellFormedUnitIdentifier(unit)) {
        throw RangeError('Invalid unit argument for Intl.NumberFormat()');
    }
    if (style === 'unit' && unit === undefined) {
        throw TypeError('unit cannot be undefined');
    }
    var unitDisplay = GetOption_1.GetOption(options, 'unitDisplay', 'string', ['short', 'narrow', 'long'], 'short');
    if (style === 'currency') {
        internalSlots.currency = currency.toUpperCase();
        internalSlots.currencyDisplay = currencyDisplay;
        internalSlots.currencySign = currencySign;
    }
    if (style === 'unit') {
        internalSlots.unit = unit;
        internalSlots.unitDisplay = unitDisplay;
    }
}
exports.SetNumberFormatUnitOptions = SetNumberFormatUnitOptions;

},{"../GetOption":30,"../IsWellFormedCurrencyCode":33,"../IsWellFormedUnitIdentifier":34}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToRawFixed = void 0;
var utils_1 = require("../utils");
/**
 * TODO: dedup with intl-pluralrules and support BigInt
 * https://tc39.es/ecma402/#sec-torawfixed
 * @param x a finite non-negative Number or BigInt
 * @param minFraction and integer between 0 and 20
 * @param maxFraction and integer between 0 and 20
 */
function ToRawFixed(x, minFraction, maxFraction) {
    var f = maxFraction;
    var n = Math.round(x * Math.pow(10, f));
    var xFinal = n / Math.pow(10, f);
    // n is a positive integer, but it is possible to be greater than 1e21.
    // In such case we will go the slow path.
    // See also: https://tc39.es/ecma262/#sec-numeric-types-number-tostring
    var m;
    if (n < 1e21) {
        m = n.toString();
    }
    else {
        m = n.toString();
        var _a = m.split('e'), mantissa = _a[0], exponent = _a[1];
        m = mantissa.replace('.', '');
        m = m + utils_1.repeat('0', Math.max(+exponent - m.length + 1, 0));
    }
    var int;
    if (f !== 0) {
        var k = m.length;
        if (k <= f) {
            var z = utils_1.repeat('0', f + 1 - k);
            m = z + m;
            k = f + 1;
        }
        var a = m.slice(0, k - f);
        var b = m.slice(k - f);
        m = a + "." + b;
        int = a.length;
    }
    else {
        int = m.length;
    }
    var cut = maxFraction - minFraction;
    while (cut > 0 && m[m.length - 1] === '0') {
        m = m.slice(0, -1);
        cut--;
    }
    if (m[m.length - 1] === '.') {
        m = m.slice(0, -1);
    }
    return { formattedString: m, roundedNumber: xFinal, integerDigitsCount: int };
}
exports.ToRawFixed = ToRawFixed;

},{"../utils":71}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToRawPrecision = void 0;
var utils_1 = require("../utils");
function ToRawPrecision(x, minPrecision, maxPrecision) {
    var p = maxPrecision;
    var m;
    var e;
    var xFinal;
    if (x === 0) {
        m = utils_1.repeat('0', p);
        e = 0;
        xFinal = 0;
    }
    else {
        var xToString = x.toString();
        // If xToString is formatted as scientific notation, the number is either very small or very
        // large. If the precision of the formatted string is lower that requested max precision, we
        // should still infer them from the formatted string, otherwise the formatted result might have
        // precision loss (e.g. 1e41 will not have 0 in every trailing digits).
        var xToStringExponentIndex = xToString.indexOf('e');
        var _a = xToString.split('e'), xToStringMantissa = _a[0], xToStringExponent = _a[1];
        var xToStringMantissaWithoutDecimalPoint = xToStringMantissa.replace('.', '');
        if (xToStringExponentIndex >= 0 &&
            xToStringMantissaWithoutDecimalPoint.length <= p) {
            e = +xToStringExponent;
            m =
                xToStringMantissaWithoutDecimalPoint +
                    utils_1.repeat('0', p - xToStringMantissaWithoutDecimalPoint.length);
            xFinal = x;
        }
        else {
            e = utils_1.getMagnitude(x);
            var decimalPlaceOffset = e - p + 1;
            // n is the integer containing the required precision digits. To derive the formatted string,
            // we will adjust its decimal place in the logic below.
            var n = Math.round(adjustDecimalPlace(x, decimalPlaceOffset));
            // The rounding caused the change of magnitude, so we should increment `e` by 1.
            if (adjustDecimalPlace(n, p - 1) >= 10) {
                e = e + 1;
                // Divide n by 10 to swallow one precision.
                n = Math.floor(n / 10);
            }
            m = n.toString();
            // Equivalent of n * 10 ** (e - p + 1)
            xFinal = adjustDecimalPlace(n, p - 1 - e);
        }
    }
    var int;
    if (e >= p - 1) {
        m = m + utils_1.repeat('0', e - p + 1);
        int = e + 1;
    }
    else if (e >= 0) {
        m = m.slice(0, e + 1) + "." + m.slice(e + 1);
        int = e + 1;
    }
    else {
        m = "0." + utils_1.repeat('0', -e - 1) + m;
        int = 1;
    }
    if (m.indexOf('.') >= 0 && maxPrecision > minPrecision) {
        var cut = maxPrecision - minPrecision;
        while (cut > 0 && m[m.length - 1] === '0') {
            m = m.slice(0, -1);
            cut--;
        }
        if (m[m.length - 1] === '.') {
            m = m.slice(0, -1);
        }
    }
    return { formattedString: m, roundedNumber: xFinal, integerDigitsCount: int };
    // x / (10 ** magnitude), but try to preserve as much floating point precision as possible.
    function adjustDecimalPlace(x, magnitude) {
        return magnitude < 0 ? x * Math.pow(10, -magnitude) : x / Math.pow(10, magnitude);
    }
}
exports.ToRawPrecision = ToRawPrecision;

},{"../utils":71}],48:[function(require,module,exports){
module.exports={ "adlm": ["𞥐", "𞥑", "𞥒", "𞥓", "𞥔", "𞥕", "𞥖", "𞥗", "𞥘", "𞥙"], "ahom": ["𑜰", "𑜱", "𑜲", "𑜳", "𑜴", "𑜵", "𑜶", "𑜷", "𑜸", "𑜹"], "arab": ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"], "arabext": ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"], "bali": ["᭐", "᭑", "᭒", "᭓", "᭔", "᭕", "᭖", "᭗", "᭘", "᭙"], "beng": ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"], "bhks": ["𑱐", "𑱑", "𑱒", "𑱓", "𑱔", "𑱕", "𑱖", "𑱗", "𑱘", "𑱙"], "brah": ["𑁦", "𑁧", "𑁨", "𑁩", "𑁪", "𑁫", "𑁬", "𑁭", "𑁮", "𑁯"], "cakm": ["𑄶", "𑄷", "𑄸", "𑄹", "𑄺", "𑄻", "𑄼", "𑄽", "𑄾", "𑄿"], "cham": ["꩐", "꩑", "꩒", "꩓", "꩔", "꩕", "꩖", "꩗", "꩘", "꩙"], "deva": ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"], "diak": ["𑥐", "𑥑", "𑥒", "𑥓", "𑥔", "𑥕", "𑥖", "𑥗", "𑥘", "𑥙"], "fullwide": ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"], "gong": ["𑶠", "𑶡", "𑶢", "𑶣", "𑶤", "𑶥", "𑶦", "𑶧", "𑶨", "𑶩"], "gonm": ["𑵐", "𑵑", "𑵒", "𑵓", "𑵔", "𑵕", "𑵖", "𑵗", "𑵘", "𑵙"], "gujr": ["૦", "૧", "૨", "૩", "૪", "૫", "૬", "૭", "૮", "૯"], "guru": ["੦", "੧", "੨", "੩", "੪", "੫", "੬", "੭", "੮", "੯"], "hanidec": ["〇", "一", "二", "三", "四", "五", "六", "七", "八", "九"], "hmng": ["𖭐", "𖭑", "𖭒", "𖭓", "𖭔", "𖭕", "𖭖", "𖭗", "𖭘", "𖭙"], "hmnp": ["𞅀", "𞅁", "𞅂", "𞅃", "𞅄", "𞅅", "𞅆", "𞅇", "𞅈", "𞅉"], "java": ["꧐", "꧑", "꧒", "꧓", "꧔", "꧕", "꧖", "꧗", "꧘", "꧙"], "kali": ["꤀", "꤁", "꤂", "꤃", "꤄", "꤅", "꤆", "꤇", "꤈", "꤉"], "khmr": ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"], "knda": ["೦", "೧", "೨", "೩", "೪", "೫", "೬", "೭", "೮", "೯"], "lana": ["᪀", "᪁", "᪂", "᪃", "᪄", "᪅", "᪆", "᪇", "᪈", "᪉"], "lanatham": ["᪐", "᪑", "᪒", "᪓", "᪔", "᪕", "᪖", "᪗", "᪘", "᪙"], "laoo": ["໐", "໑", "໒", "໓", "໔", "໕", "໖", "໗", "໘", "໙"], "lepc": ["᪐", "᪑", "᪒", "᪓", "᪔", "᪕", "᪖", "᪗", "᪘", "᪙"], "limb": ["᥆", "᥇", "᥈", "᥉", "᥊", "᥋", "᥌", "᥍", "᥎", "᥏"], "mathbold": ["𝟎", "𝟏", "𝟐", "𝟑", "𝟒", "𝟓", "𝟔", "𝟕", "𝟖", "𝟗"], "mathdbl": ["𝟘", "𝟙", "𝟚", "𝟛", "𝟜", "𝟝", "𝟞", "𝟟", "𝟠", "𝟡"], "mathmono": ["𝟶", "𝟷", "𝟸", "𝟹", "𝟺", "𝟻", "𝟼", "𝟽", "𝟾", "𝟿"], "mathsanb": ["𝟬", "𝟭", "𝟮", "𝟯", "𝟰", "𝟱", "𝟲", "𝟳", "𝟴", "𝟵"], "mathsans": ["𝟢", "𝟣", "𝟤", "𝟥", "𝟦", "𝟧", "𝟨", "𝟩", "𝟪", "𝟫"], "mlym": ["൦", "൧", "൨", "൩", "൪", "൫", "൬", "൭", "൮", "൯"], "modi": ["𑙐", "𑙑", "𑙒", "𑙓", "𑙔", "𑙕", "𑙖", "𑙗", "𑙘", "𑙙"], "mong": ["᠐", "᠑", "᠒", "᠓", "᠔", "᠕", "᠖", "᠗", "᠘", "᠙"], "mroo": ["𖩠", "𖩡", "𖩢", "𖩣", "𖩤", "𖩥", "𖩦", "𖩧", "𖩨", "𖩩"], "mtei": ["꯰", "꯱", "꯲", "꯳", "꯴", "꯵", "꯶", "꯷", "꯸", "꯹"], "mymr": ["၀", "၁", "၂", "၃", "၄", "၅", "၆", "၇", "၈", "၉"], "mymrshan": ["႐", "႑", "႒", "႓", "႔", "႕", "႖", "႗", "႘", "႙"], "mymrtlng": ["꧰", "꧱", "꧲", "꧳", "꧴", "꧵", "꧶", "꧷", "꧸", "꧹"], "newa": ["𑑐", "𑑑", "𑑒", "𑑓", "𑑔", "𑑕", "𑑖", "𑑗", "𑑘", "𑑙"], "nkoo": ["߀", "߁", "߂", "߃", "߄", "߅", "߆", "߇", "߈", "߉"], "olck": ["᱐", "᱑", "᱒", "᱓", "᱔", "᱕", "᱖", "᱗", "᱘", "᱙"], "orya": ["୦", "୧", "୨", "୩", "୪", "୫", "୬", "୭", "୮", "୯"], "osma": ["𐒠", "𐒡", "𐒢", "𐒣", "𐒤", "𐒥", "𐒦", "𐒧", "𐒨", "𐒩"], "rohg": ["𐴰", "𐴱", "𐴲", "𐴳", "𐴴", "𐴵", "𐴶", "𐴷", "𐴸", "𐴹"], "saur": ["꣐", "꣑", "꣒", "꣓", "꣔", "꣕", "꣖", "꣗", "꣘", "꣙"], "segment": ["🯰", "🯱", "🯲", "🯳", "🯴", "🯵", "🯶", "🯷", "🯸", "🯹"], "shrd": ["𑇐", "𑇑", "𑇒", "𑇓", "𑇔", "𑇕", "𑇖", "𑇗", "𑇘", "𑇙"], "sind": ["𑋰", "𑋱", "𑋲", "𑋳", "𑋴", "𑋵", "𑋶", "𑋷", "𑋸", "𑋹"], "sinh": ["෦", "෧", "෨", "෩", "෪", "෫", "෬", "෭", "෮", "෯"], "sora": ["𑃰", "𑃱", "𑃲", "𑃳", "𑃴", "𑃵", "𑃶", "𑃷", "𑃸", "𑃹"], "sund": ["᮰", "᮱", "᮲", "᮳", "᮴", "᮵", "᮶", "᮷", "᮸", "᮹"], "takr": ["𑛀", "𑛁", "𑛂", "𑛃", "𑛄", "𑛅", "𑛆", "𑛇", "𑛈", "𑛉"], "talu": ["᧐", "᧑", "᧒", "᧓", "᧔", "᧕", "᧖", "᧗", "᧘", "᧙"], "tamldec": ["௦", "௧", "௨", "௩", "௪", "௫", "௬", "௭", "௮", "௯"], "telu": ["౦", "౧", "౨", "౩", "౪", "౫", "౬", "౭", "౮", "౯"], "thai": ["๐", "๑", "๒", "๓", "๔", "๕", "๖", "๗", "๘", "๙"], "tibt": ["༠", "༡", "༢", "༣", "༤", "༥", "༦", "༧", "༨", "༩"], "tirh": ["𑓐", "𑓑", "𑓒", "𑓓", "𑓔", "𑓕", "𑓖", "𑓗", "𑓘", "𑓙"], "vaii": ["ᘠ", "ᘡ", "ᘢ", "ᘣ", "ᘤ", "ᘥ", "ᘦ", "ᘧ", "ᘨ", "ᘩ"], "wara": ["𑣠", "𑣡", "𑣢", "𑣣", "𑣤", "𑣥", "𑣦", "𑣧", "𑣨", "𑣩"], "wcho": ["𞋰", "𞋱", "𞋲", "𞋳", "𞋴", "𞋵", "𞋶", "𞋷", "𞋸", "𞋹"] }

},{}],49:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var ToRawFixed_1 = require("./ToRawFixed");
var digitMapping = tslib_1.__importStar(require("./digit-mapping.json"));
// This is from: unicode-12.1.0/General_Category/Symbol/regex.js
// IE11 does not support unicode flag, otherwise this is just /\p{S}/u.
var S_UNICODE_REGEX = /[\$\+<->\^`\|~\xA2-\xA6\xA8\xA9\xAC\xAE-\xB1\xB4\xB8\xD7\xF7\u02C2-\u02C5\u02D2-\u02DF\u02E5-\u02EB\u02ED\u02EF-\u02FF\u0375\u0384\u0385\u03F6\u0482\u058D-\u058F\u0606-\u0608\u060B\u060E\u060F\u06DE\u06E9\u06FD\u06FE\u07F6\u07FE\u07FF\u09F2\u09F3\u09FA\u09FB\u0AF1\u0B70\u0BF3-\u0BFA\u0C7F\u0D4F\u0D79\u0E3F\u0F01-\u0F03\u0F13\u0F15-\u0F17\u0F1A-\u0F1F\u0F34\u0F36\u0F38\u0FBE-\u0FC5\u0FC7-\u0FCC\u0FCE\u0FCF\u0FD5-\u0FD8\u109E\u109F\u1390-\u1399\u166D\u17DB\u1940\u19DE-\u19FF\u1B61-\u1B6A\u1B74-\u1B7C\u1FBD\u1FBF-\u1FC1\u1FCD-\u1FCF\u1FDD-\u1FDF\u1FED-\u1FEF\u1FFD\u1FFE\u2044\u2052\u207A-\u207C\u208A-\u208C\u20A0-\u20BF\u2100\u2101\u2103-\u2106\u2108\u2109\u2114\u2116-\u2118\u211E-\u2123\u2125\u2127\u2129\u212E\u213A\u213B\u2140-\u2144\u214A-\u214D\u214F\u218A\u218B\u2190-\u2307\u230C-\u2328\u232B-\u2426\u2440-\u244A\u249C-\u24E9\u2500-\u2767\u2794-\u27C4\u27C7-\u27E5\u27F0-\u2982\u2999-\u29D7\u29DC-\u29FB\u29FE-\u2B73\u2B76-\u2B95\u2B98-\u2BFF\u2CE5-\u2CEA\u2E80-\u2E99\u2E9B-\u2EF3\u2F00-\u2FD5\u2FF0-\u2FFB\u3004\u3012\u3013\u3020\u3036\u3037\u303E\u303F\u309B\u309C\u3190\u3191\u3196-\u319F\u31C0-\u31E3\u3200-\u321E\u322A-\u3247\u3250\u3260-\u327F\u328A-\u32B0\u32C0-\u33FF\u4DC0-\u4DFF\uA490-\uA4C6\uA700-\uA716\uA720\uA721\uA789\uA78A\uA828-\uA82B\uA836-\uA839\uAA77-\uAA79\uAB5B\uFB29\uFBB2-\uFBC1\uFDFC\uFDFD\uFE62\uFE64-\uFE66\uFE69\uFF04\uFF0B\uFF1C-\uFF1E\uFF3E\uFF40\uFF5C\uFF5E\uFFE0-\uFFE6\uFFE8-\uFFEE\uFFFC\uFFFD]|\uD800[\uDD37-\uDD3F\uDD79-\uDD89\uDD8C-\uDD8E\uDD90-\uDD9B\uDDA0\uDDD0-\uDDFC]|\uD802[\uDC77\uDC78\uDEC8]|\uD805\uDF3F|\uD807[\uDFD5-\uDFF1]|\uD81A[\uDF3C-\uDF3F\uDF45]|\uD82F\uDC9C|\uD834[\uDC00-\uDCF5\uDD00-\uDD26\uDD29-\uDD64\uDD6A-\uDD6C\uDD83\uDD84\uDD8C-\uDDA9\uDDAE-\uDDE8\uDE00-\uDE41\uDE45\uDF00-\uDF56]|\uD835[\uDEC1\uDEDB\uDEFB\uDF15\uDF35\uDF4F\uDF6F\uDF89\uDFA9\uDFC3]|\uD836[\uDC00-\uDDFF\uDE37-\uDE3A\uDE6D-\uDE74\uDE76-\uDE83\uDE85\uDE86]|\uD838[\uDD4F\uDEFF]|\uD83B[\uDCAC\uDCB0\uDD2E\uDEF0\uDEF1]|\uD83C[\uDC00-\uDC2B\uDC30-\uDC93\uDCA0-\uDCAE\uDCB1-\uDCBF\uDCC1-\uDCCF\uDCD1-\uDCF5\uDD10-\uDD6C\uDD70-\uDDAC\uDDE6-\uDE02\uDE10-\uDE3B\uDE40-\uDE48\uDE50\uDE51\uDE60-\uDE65\uDF00-\uDFFF]|\uD83D[\uDC00-\uDED5\uDEE0-\uDEEC\uDEF0-\uDEFA\uDF00-\uDF73\uDF80-\uDFD8\uDFE0-\uDFEB]|\uD83E[\uDC00-\uDC0B\uDC10-\uDC47\uDC50-\uDC59\uDC60-\uDC87\uDC90-\uDCAD\uDD00-\uDD0B\uDD0D-\uDD71\uDD73-\uDD76\uDD7A-\uDDA2\uDDA5-\uDDAA\uDDAE-\uDDCA\uDDCD-\uDE53\uDE60-\uDE6D\uDE70-\uDE73\uDE78-\uDE7A\uDE80-\uDE82\uDE90-\uDE95]/;
// /^\p{S}/u
var CARET_S_UNICODE_REGEX = new RegExp("^" + S_UNICODE_REGEX.source);
// /\p{S}$/u
var S_DOLLAR_UNICODE_REGEX = new RegExp(S_UNICODE_REGEX.source + "$");
var CLDR_NUMBER_PATTERN = /[#0](?:[\.,][#0]+)*/g;
function formatToParts(numberResult, data, pl, options) {
    var sign = numberResult.sign, exponent = numberResult.exponent, magnitude = numberResult.magnitude;
    var notation = options.notation, style = options.style, numberingSystem = options.numberingSystem;
    var defaultNumberingSystem = data.numbers.nu[0];
    // #region Part 1: partition and interpolate the CLDR number pattern.
    // ----------------------------------------------------------
    var compactNumberPattern = null;
    if (notation === 'compact' && magnitude) {
        compactNumberPattern = getCompactDisplayPattern(numberResult, pl, data, style, options.compactDisplay, options.currencyDisplay, numberingSystem);
    }
    // This is used multiple times
    var nonNameCurrencyPart;
    if (style === 'currency' && options.currencyDisplay !== 'name') {
        var byCurrencyDisplay = data.currencies[options.currency];
        if (byCurrencyDisplay) {
            switch (options.currencyDisplay) {
                case 'code':
                    nonNameCurrencyPart = options.currency;
                    break;
                case 'symbol':
                    nonNameCurrencyPart = byCurrencyDisplay.symbol;
                    break;
                default:
                    nonNameCurrencyPart = byCurrencyDisplay.narrow;
                    break;
            }
        }
        else {
            // Fallback for unknown currency
            nonNameCurrencyPart = options.currency;
        }
    }
    var numberPattern;
    if (!compactNumberPattern) {
        // Note: if the style is unit, or is currency and the currency display is name,
        // its unit parts will be interpolated in part 2. So here we can fallback to decimal.
        if (style === 'decimal' ||
            style === 'unit' ||
            (style === 'currency' && options.currencyDisplay === 'name')) {
            // Shortcut for decimal
            var decimalData = data.numbers.decimal[numberingSystem] ||
                data.numbers.decimal[defaultNumberingSystem];
            numberPattern = getPatternForSign(decimalData.standard, sign);
        }
        else if (style === 'currency') {
            var currencyData = data.numbers.currency[numberingSystem] ||
                data.numbers.currency[defaultNumberingSystem];
            // We replace number pattern part with `0` for easier postprocessing.
            numberPattern = getPatternForSign(currencyData[options.currencySign], sign);
        }
        else {
            // percent
            var percentPattern = data.numbers.percent[numberingSystem] ||
                data.numbers.percent[defaultNumberingSystem];
            numberPattern = getPatternForSign(percentPattern, sign);
        }
    }
    else {
        numberPattern = compactNumberPattern;
    }
    // Extract the decimal number pattern string. It looks like "#,##0,00", which will later be
    // used to infer decimal group sizes.
    var decimalNumberPattern = CLDR_NUMBER_PATTERN.exec(numberPattern)[0];
    // Now we start to substitute patterns
    // 1. replace strings like `0` and `#,##0.00` with `{0}`
    // 2. unquote characters (invariant: the quoted characters does not contain the special tokens)
    numberPattern = numberPattern
        .replace(CLDR_NUMBER_PATTERN, '{0}')
        .replace(/'(.)'/g, '$1');
    // Handle currency spacing (both compact and non-compact).
    if (style === 'currency' && options.currencyDisplay !== 'name') {
        var currencyData = data.numbers.currency[numberingSystem] ||
            data.numbers.currency[defaultNumberingSystem];
        // See `currencySpacing` substitution rule in TR-35.
        // Here we always assume the currencyMatch is "[:^S:]" and surroundingMatch is "[:digit:]".
        //
        // Example 1: for pattern "#,##0.00¤" with symbol "US$", we replace "¤" with the symbol,
        // but insert an extra non-break space before the symbol, because "[:^S:]" matches "U" in
        // "US$" and "[:digit:]" matches the latn numbering system digits.
        //
        // Example 2: for pattern "¤#,##0.00" with symbol "US$", there is no spacing between symbol
        // and number, because `$` does not match "[:^S:]".
        //
        // Implementation note: here we do the best effort to infer the insertion.
        // We also assume that `beforeInsertBetween` and `afterInsertBetween` will never be `;`.
        var afterCurrency = currencyData.currencySpacing.afterInsertBetween;
        if (afterCurrency && !S_DOLLAR_UNICODE_REGEX.test(nonNameCurrencyPart)) {
            numberPattern = numberPattern.replace('¤{0}', "\u00A4" + afterCurrency + "{0}");
        }
        var beforeCurrency = currencyData.currencySpacing.beforeInsertBetween;
        if (beforeCurrency && !CARET_S_UNICODE_REGEX.test(nonNameCurrencyPart)) {
            numberPattern = numberPattern.replace('{0}¤', "{0}" + beforeCurrency + "\u00A4");
        }
    }
    // The following tokens are special: `{0}`, `¤`, `%`, `-`, `+`, `{c:...}.
    var numberPatternParts = numberPattern.split(/({c:[^}]+}|\{0\}|[¤%\-\+])/g);
    var numberParts = [];
    var symbols = data.numbers.symbols[numberingSystem] ||
        data.numbers.symbols[defaultNumberingSystem];
    for (var _i = 0, numberPatternParts_1 = numberPatternParts; _i < numberPatternParts_1.length; _i++) {
        var part = numberPatternParts_1[_i];
        if (!part) {
            continue;
        }
        switch (part) {
            case '{0}': {
                // We only need to handle scientific and engineering notation here.
                numberParts.push.apply(numberParts, paritionNumberIntoParts(symbols, numberResult, notation, exponent, numberingSystem, 
                // If compact number pattern exists, do not insert group separators.
                !compactNumberPattern && options.useGrouping, decimalNumberPattern));
                break;
            }
            case '-':
                numberParts.push({ type: 'minusSign', value: symbols.minusSign });
                break;
            case '+':
                numberParts.push({ type: 'plusSign', value: symbols.plusSign });
                break;
            case '%':
                numberParts.push({ type: 'percentSign', value: symbols.percentSign });
                break;
            case '¤':
                // Computed above when handling currency spacing.
                numberParts.push({ type: 'currency', value: nonNameCurrencyPart });
                break;
            default:
                if (/^\{c:/.test(part)) {
                    numberParts.push({
                        type: 'compact',
                        value: part.substring(3, part.length - 1),
                    });
                }
                else {
                    // literal
                    numberParts.push({ type: 'literal', value: part });
                }
                break;
        }
    }
    // #endregion
    // #region Part 2: interpolate unit pattern if necessary.
    // ----------------------------------------------
    switch (style) {
        case 'currency': {
            // `currencyDisplay: 'name'` has similar pattern handling as units.
            if (options.currencyDisplay === 'name') {
                var unitPattern = (data.numbers.currency[numberingSystem] ||
                    data.numbers.currency[defaultNumberingSystem]).unitPattern;
                // Select plural
                var unitName = void 0;
                var currencyNameData = data.currencies[options.currency];
                if (currencyNameData) {
                    unitName = selectPlural(pl, numberResult.roundedNumber * Math.pow(10, exponent), currencyNameData.displayName);
                }
                else {
                    // Fallback for unknown currency
                    unitName = options.currency;
                }
                // Do {0} and {1} substitution
                var unitPatternParts = unitPattern.split(/(\{[01]\})/g);
                var result = [];
                for (var _a = 0, unitPatternParts_1 = unitPatternParts; _a < unitPatternParts_1.length; _a++) {
                    var part = unitPatternParts_1[_a];
                    switch (part) {
                        case '{0}':
                            result.push.apply(result, numberParts);
                            break;
                        case '{1}':
                            result.push({ type: 'currency', value: unitName });
                            break;
                        default:
                            if (part) {
                                result.push({ type: 'literal', value: part });
                            }
                            break;
                    }
                }
                return result;
            }
            else {
                return numberParts;
            }
        }
        case 'unit': {
            var unit = options.unit, unitDisplay = options.unitDisplay;
            var unitData = data.units.simple[unit];
            var unitPattern = void 0;
            if (unitData) {
                // Simple unit pattern
                unitPattern = selectPlural(pl, numberResult.roundedNumber * Math.pow(10, exponent), data.units.simple[unit][unitDisplay]);
            }
            else {
                // See: http://unicode.org/reports/tr35/tr35-general.html#perUnitPatterns
                // If cannot find unit in the simple pattern, it must be "per" compound pattern.
                // Implementation note: we are not following TR-35 here because we need to format to parts!
                var _b = unit.split('-per-'), numeratorUnit = _b[0], denominatorUnit = _b[1];
                unitData = data.units.simple[numeratorUnit];
                var numeratorUnitPattern = selectPlural(pl, numberResult.roundedNumber * Math.pow(10, exponent), data.units.simple[numeratorUnit][unitDisplay]);
                var perUnitPattern = data.units.simple[denominatorUnit].perUnit[unitDisplay];
                if (perUnitPattern) {
                    // perUnitPattern exists, combine it with numeratorUnitPattern
                    unitPattern = perUnitPattern.replace('{0}', numeratorUnitPattern);
                }
                else {
                    // get compoundUnit pattern (e.g. "{0} per {1}"), repalce {0} with numerator pattern and {1} with
                    // the denominator pattern in singular form.
                    var perPattern = data.units.compound.per[unitDisplay];
                    var denominatorPattern = selectPlural(pl, 1, data.units.simple[denominatorUnit][unitDisplay]);
                    unitPattern = unitPattern = perPattern
                        .replace('{0}', numeratorUnitPattern)
                        .replace('{1}', denominatorPattern.replace('{0}', ''));
                }
            }
            var result = [];
            // We need spacing around "{0}" because they are not treated as "unit" parts, but "literal".
            for (var _c = 0, _d = unitPattern.split(/(\s*\{0\}\s*)/); _c < _d.length; _c++) {
                var part = _d[_c];
                var interpolateMatch = /^(\s*)\{0\}(\s*)$/.exec(part);
                if (interpolateMatch) {
                    // Space before "{0}"
                    if (interpolateMatch[1]) {
                        result.push({ type: 'literal', value: interpolateMatch[1] });
                    }
                    // "{0}" itself
                    result.push.apply(result, numberParts);
                    // Space after "{0}"
                    if (interpolateMatch[2]) {
                        result.push({ type: 'literal', value: interpolateMatch[2] });
                    }
                }
                else if (part) {
                    result.push({ type: 'unit', value: part });
                }
            }
            return result;
        }
        default:
            return numberParts;
    }
    // #endregion
}
exports.default = formatToParts;
// A subset of https://tc39.es/ecma402/#sec-partitionnotationsubpattern
// Plus the exponent parts handling.
function paritionNumberIntoParts(symbols, numberResult, notation, exponent, numberingSystem, useGrouping, 
/**
 * This is the decimal number pattern without signs or symbols.
 * It is used to infer the group size when `useGrouping` is true.
 *
 * A typical value looks like "#,##0.00" (primary group size is 3).
 * Some locales like Hindi has secondary group size of 2 (e.g. "#,##,##0.00").
 */
decimalNumberPattern) {
    var result = [];
    // eslint-disable-next-line prefer-const
    var n = numberResult.formattedString, x = numberResult.roundedNumber;
    if (isNaN(x)) {
        return [{ type: 'nan', value: n }];
    }
    else if (!isFinite(x)) {
        return [{ type: 'infinity', value: n }];
    }
    var digitReplacementTable = digitMapping[numberingSystem];
    if (digitReplacementTable) {
        n = n.replace(/\d/g, function (digit) { return digitReplacementTable[+digit] || digit; });
    }
    // TODO: Else use an implementation dependent algorithm to map n to the appropriate
    // representation of n in the given numbering system.
    var decimalSepIndex = n.indexOf('.');
    var integer;
    var fraction;
    if (decimalSepIndex > 0) {
        integer = n.slice(0, decimalSepIndex);
        fraction = n.slice(decimalSepIndex + 1);
    }
    else {
        integer = n;
    }
    // #region Grouping integer digits
    // The weird compact and x >= 10000 check is to ensure consistency with Node.js and Chrome.
    // Note that `de` does not have compact form for thousands, but Node.js does not insert grouping separator
    // unless the rounded number is greater than 10000:
    //   NumberFormat('de', {notation: 'compact', compactDisplay: 'short'}).format(1234) //=> "1234"
    //   NumberFormat('de').format(1234) //=> "1.234"
    if (useGrouping && (notation !== 'compact' || x >= 10000)) {
        var groupSepSymbol = symbols.group;
        var groups = [];
        // > There may be two different grouping sizes: The primary grouping size used for the least
        // > significant integer group, and the secondary grouping size used for more significant groups.
        // > If a pattern contains multiple grouping separators, the interval between the last one and the
        // > end of the integer defines the primary grouping size, and the interval between the last two
        // > defines the secondary grouping size. All others are ignored.
        var integerNumberPattern = decimalNumberPattern.split('.')[0];
        var patternGroups = integerNumberPattern.split(',');
        var primaryGroupingSize = 3;
        var secondaryGroupingSize = 3;
        if (patternGroups.length > 1) {
            primaryGroupingSize = patternGroups[patternGroups.length - 1].length;
        }
        if (patternGroups.length > 2) {
            secondaryGroupingSize = patternGroups[patternGroups.length - 2].length;
        }
        var i = integer.length - primaryGroupingSize;
        if (i > 0) {
            // Slice the least significant integer group
            groups.push(integer.slice(i, i + primaryGroupingSize));
            // Then iteratively push the more signicant groups
            // TODO: handle surrogate pairs in some numbering system digits
            for (i -= secondaryGroupingSize; i > 0; i -= secondaryGroupingSize) {
                groups.push(integer.slice(i, i + secondaryGroupingSize));
            }
            groups.push(integer.slice(0, i + secondaryGroupingSize));
        }
        else {
            groups.push(integer);
        }
        while (groups.length > 0) {
            var integerGroup = groups.pop();
            result.push({ type: 'integer', value: integerGroup });
            if (groups.length > 0) {
                result.push({ type: 'group', value: groupSepSymbol });
            }
        }
    }
    else {
        result.push({ type: 'integer', value: integer });
    }
    // #endregion
    if (fraction !== undefined) {
        result.push({ type: 'decimal', value: symbols.decimal }, { type: 'fraction', value: fraction });
    }
    if ((notation === 'scientific' || notation === 'engineering') &&
        isFinite(x)) {
        result.push({ type: 'exponentSeparator', value: symbols.exponential });
        if (exponent < 0) {
            result.push({ type: 'exponentMinusSign', value: symbols.minusSign });
            exponent = -exponent;
        }
        var exponentResult = ToRawFixed_1.ToRawFixed(exponent, 0, 0);
        result.push({
            type: 'exponentInteger',
            value: exponentResult.formattedString,
        });
    }
    return result;
}
function getPatternForSign(pattern, sign) {
    if (pattern.indexOf(';') < 0) {
        pattern = pattern + ";-" + pattern;
    }
    var _a = pattern.split(';'), zeroPattern = _a[0], negativePattern = _a[1];
    switch (sign) {
        case 0:
            return zeroPattern;
        case -1:
            return negativePattern;
        default:
            return negativePattern.indexOf('-') >= 0
                ? negativePattern.replace(/-/g, '+')
                : "+" + zeroPattern;
    }
}
// Find the CLDR pattern for compact notation based on the magnitude of data and style.
//
// Example return value: "¤ {c:laki}000;¤{c:laki} -0" (`sw` locale):
// - Notice the `{c:...}` token that wraps the compact literal.
// - The consecutive zeros are normalized to single zero to match CLDR_NUMBER_PATTERN.
//
// Returning null means the compact display pattern cannot be found.
function getCompactDisplayPattern(numberResult, pl, data, style, compactDisplay, currencyDisplay, numberingSystem) {
    var _a;
    var roundedNumber = numberResult.roundedNumber, sign = numberResult.sign, magnitude = numberResult.magnitude;
    var magnitudeKey = String(Math.pow(10, magnitude));
    var defaultNumberingSystem = data.numbers.nu[0];
    var pattern;
    if (style === 'currency' && currencyDisplay !== 'name') {
        var byNumberingSystem = data.numbers.currency;
        var currencyData = byNumberingSystem[numberingSystem] ||
            byNumberingSystem[defaultNumberingSystem];
        // NOTE: compact notation ignores currencySign!
        var compactPluralRules = (_a = currencyData.short) === null || _a === void 0 ? void 0 : _a[magnitudeKey];
        if (!compactPluralRules) {
            return null;
        }
        pattern = selectPlural(pl, roundedNumber, compactPluralRules);
    }
    else {
        var byNumberingSystem = data.numbers.decimal;
        var byCompactDisplay = byNumberingSystem[numberingSystem] ||
            byNumberingSystem[defaultNumberingSystem];
        var compactPlaralRule = byCompactDisplay[compactDisplay][magnitudeKey];
        if (!compactPlaralRule) {
            return null;
        }
        pattern = selectPlural(pl, roundedNumber, compactPlaralRule);
    }
    // See https://unicode.org/reports/tr35/tr35-numbers.html#Compact_Number_Formats
    // > If the value is precisely “0”, either explicit or defaulted, then the normal number format
    // > pattern for that sort of object is supplied.
    if (pattern === '0') {
        return null;
    }
    pattern = getPatternForSign(pattern, sign)
        // Extract compact literal from the pattern
        .replace(/([^\s;\-\+\d¤]+)/g, '{c:$1}')
        // We replace one or more zeros with a single zero so it matches `CLDR_NUMBER_PATTERN`.
        .replace(/0+/, '0');
    return pattern;
}
function selectPlural(pl, x, rules) {
    return rules[pl.select(x)] || rules.other;
}

},{"./ToRawFixed":46,"./digit-mapping.json":48,"tslib":88}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionPattern = void 0;
var utils_1 = require("./utils");
/**
 * https://tc39.es/ecma402/#sec-partitionpattern
 * @param pattern
 */
function PartitionPattern(pattern) {
    var result = [];
    var beginIndex = pattern.indexOf('{');
    var endIndex = 0;
    var nextIndex = 0;
    var length = pattern.length;
    while (beginIndex < pattern.length && beginIndex > -1) {
        endIndex = pattern.indexOf('}', beginIndex);
        utils_1.invariant(endIndex > beginIndex, "Invalid pattern " + pattern);
        if (beginIndex > nextIndex) {
            result.push({
                type: 'literal',
                value: pattern.substring(nextIndex, beginIndex),
            });
        }
        result.push({
            type: pattern.substring(beginIndex + 1, endIndex),
            value: undefined,
        });
        nextIndex = endIndex + 1;
        beginIndex = pattern.indexOf('{', nextIndex);
    }
    if (nextIndex < length) {
        result.push({
            type: 'literal',
            value: pattern.substring(nextIndex, length),
        });
    }
    return result;
}
exports.PartitionPattern = PartitionPattern;

},{"./utils":71}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetOperands = void 0;
var utils_1 = require("../utils");
var _262_1 = require("../262");
/**
 * http://ecma-international.org/ecma-402/7.0/index.html#sec-getoperands
 * @param s
 */
function GetOperands(s) {
    utils_1.invariant(typeof s === 'string', "GetOperands should have been called with a string");
    var n = _262_1.ToNumber(s);
    utils_1.invariant(isFinite(n), 'n should be finite');
    var dp = s.indexOf('.');
    var iv;
    var f;
    var v;
    var fv = '';
    if (dp === -1) {
        iv = n;
        f = 0;
        v = 0;
    }
    else {
        iv = s.slice(0, dp);
        fv = s.slice(dp, s.length);
        f = _262_1.ToNumber(fv);
        v = fv.length;
    }
    var i = Math.abs(_262_1.ToNumber(iv));
    var w;
    var t;
    if (f !== 0) {
        var ft = fv.replace(/0+$/, '');
        w = ft.length;
        t = _262_1.ToNumber(ft);
    }
    else {
        w = 0;
        t = 0;
    }
    return {
        Number: n,
        IntegerDigits: i,
        NumberOfFractionDigits: v,
        NumberOfFractionDigitsWithoutTrailing: w,
        FractionDigits: f,
        FractionDigitsWithoutTrailing: t,
    };
}
exports.GetOperands = GetOperands;

},{"../262":7,"../utils":71}],52:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializePluralRules = void 0;
var CanonicalizeLocaleList_1 = require("../CanonicalizeLocaleList");
var _262_1 = require("../262");
var GetOption_1 = require("../GetOption");
var SetNumberFormatDigitOptions_1 = require("../NumberFormat/SetNumberFormatDigitOptions");
var ResolveLocale_1 = require("../ResolveLocale");
function InitializePluralRules(pl, locales, options, _a) {
    var availableLocales = _a.availableLocales, relevantExtensionKeys = _a.relevantExtensionKeys, localeData = _a.localeData, getDefaultLocale = _a.getDefaultLocale, getInternalSlots = _a.getInternalSlots;
    var requestedLocales = CanonicalizeLocaleList_1.CanonicalizeLocaleList(locales);
    var opt = Object.create(null);
    var opts = options === undefined ? Object.create(null) : _262_1.ToObject(options);
    var internalSlots = getInternalSlots(pl);
    internalSlots.initializedPluralRules = true;
    var matcher = GetOption_1.GetOption(opts, 'localeMatcher', 'string', ['best fit', 'lookup'], 'best fit');
    opt.localeMatcher = matcher;
    internalSlots.type = GetOption_1.GetOption(opts, 'type', 'string', ['cardinal', 'ordinal'], 'cardinal');
    SetNumberFormatDigitOptions_1.SetNumberFormatDigitOptions(internalSlots, opts, 0, 3, 'standard');
    var r = ResolveLocale_1.ResolveLocale(availableLocales, requestedLocales, opt, relevantExtensionKeys, localeData, getDefaultLocale);
    internalSlots.locale = r.locale;
    return pl;
}
exports.InitializePluralRules = InitializePluralRules;

},{"../262":7,"../CanonicalizeLocaleList":10,"../GetOption":30,"../NumberFormat/SetNumberFormatDigitOptions":44,"../ResolveLocale":60}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolvePlural = void 0;
var utils_1 = require("../utils");
var _262_1 = require("../262");
var FormatNumericToString_1 = require("../NumberFormat/FormatNumericToString");
var GetOperands_1 = require("./GetOperands");
/**
 * http://ecma-international.org/ecma-402/7.0/index.html#sec-resolveplural
 * @param pl
 * @param n
 * @param PluralRuleSelect Has to pass in bc it's implementation-specific
 */
function ResolvePlural(pl, n, _a) {
    var getInternalSlots = _a.getInternalSlots, PluralRuleSelect = _a.PluralRuleSelect;
    var internalSlots = getInternalSlots(pl);
    utils_1.invariant(_262_1.Type(internalSlots) === 'Object', 'pl has to be an object');
    utils_1.invariant('initializedPluralRules' in internalSlots, 'pluralrules must be initialized');
    utils_1.invariant(_262_1.Type(n) === 'Number', 'n must be a number');
    if (!isFinite(n)) {
        return 'other';
    }
    var locale = internalSlots.locale, type = internalSlots.type;
    var res = FormatNumericToString_1.FormatNumericToString(internalSlots, n);
    var s = res.formattedString;
    var operands = GetOperands_1.GetOperands(s);
    return PluralRuleSelect(locale, type, n, operands);
}
exports.ResolvePlural = ResolvePlural;

},{"../262":7,"../NumberFormat/FormatNumericToString":41,"../utils":71,"./GetOperands":51}],54:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatRelativeTime = void 0;
var PartitionRelativeTimePattern_1 = require("./PartitionRelativeTimePattern");
function FormatRelativeTime(rtf, value, unit, implDetails) {
    var parts = PartitionRelativeTimePattern_1.PartitionRelativeTimePattern(rtf, value, unit, implDetails);
    var result = '';
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        result += part.value;
    }
    return result;
}
exports.FormatRelativeTime = FormatRelativeTime;

},{"./PartitionRelativeTimePattern":58}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatRelativeTimeToParts = void 0;
var PartitionRelativeTimePattern_1 = require("./PartitionRelativeTimePattern");
var _262_1 = require("../262");
function FormatRelativeTimeToParts(rtf, value, unit, implDetails) {
    var parts = PartitionRelativeTimePattern_1.PartitionRelativeTimePattern(rtf, value, unit, implDetails);
    var result = _262_1.ArrayCreate(0);
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        var o = {
            type: part.type,
            value: part.value,
        };
        if ('unit' in part) {
            o.unit = part.unit;
        }
        result.push(o);
    }
    return result;
}
exports.FormatRelativeTimeToParts = FormatRelativeTimeToParts;

},{"../262":7,"./PartitionRelativeTimePattern":58}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InitializeRelativeTimeFormat = void 0;
var CanonicalizeLocaleList_1 = require("../CanonicalizeLocaleList");
var _262_1 = require("../262");
var GetOption_1 = require("../GetOption");
var ResolveLocale_1 = require("../ResolveLocale");
var utils_1 = require("../utils");
var NUMBERING_SYSTEM_REGEX = /^[a-z0-9]{3,8}(-[a-z0-9]{3,8})*$/i;
function InitializeRelativeTimeFormat(rtf, locales, options, _a) {
    var getInternalSlots = _a.getInternalSlots, availableLocales = _a.availableLocales, relevantExtensionKeys = _a.relevantExtensionKeys, localeData = _a.localeData, getDefaultLocale = _a.getDefaultLocale;
    var internalSlots = getInternalSlots(rtf);
    internalSlots.initializedRelativeTimeFormat = true;
    var requestedLocales = CanonicalizeLocaleList_1.CanonicalizeLocaleList(locales);
    var opt = Object.create(null);
    var opts = options === undefined ? Object.create(null) : _262_1.ToObject(options);
    var matcher = GetOption_1.GetOption(opts, 'localeMatcher', 'string', ['best fit', 'lookup'], 'best fit');
    opt.localeMatcher = matcher;
    var numberingSystem = GetOption_1.GetOption(opts, 'numberingSystem', 'string', undefined, undefined);
    if (numberingSystem !== undefined) {
        if (!NUMBERING_SYSTEM_REGEX.test(numberingSystem)) {
            throw new RangeError("Invalid numbering system " + numberingSystem);
        }
    }
    opt.nu = numberingSystem;
    var r = ResolveLocale_1.ResolveLocale(availableLocales, requestedLocales, opt, relevantExtensionKeys, localeData, getDefaultLocale);
    var locale = r.locale, nu = r.nu;
    internalSlots.locale = locale;
    internalSlots.style = GetOption_1.GetOption(opts, 'style', 'string', ['long', 'narrow', 'short'], 'long');
    internalSlots.numeric = GetOption_1.GetOption(opts, 'numeric', 'string', ['always', 'auto'], 'always');
    var fields = localeData[r.dataLocale];
    utils_1.invariant(!!fields, "Missing locale data for " + r.dataLocale);
    internalSlots.fields = fields;
    internalSlots.numberFormat = new Intl.NumberFormat(locales);
    internalSlots.pluralRules = new Intl.PluralRules(locales);
    internalSlots.numberingSystem = nu;
    return rtf;
}
exports.InitializeRelativeTimeFormat = InitializeRelativeTimeFormat;

},{"../262":7,"../CanonicalizeLocaleList":10,"../GetOption":30,"../ResolveLocale":60,"../utils":71}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MakePartsList = void 0;
var PartitionPattern_1 = require("../PartitionPattern");
var utils_1 = require("../utils");
function MakePartsList(pattern, unit, parts) {
    var patternParts = PartitionPattern_1.PartitionPattern(pattern);
    var result = [];
    for (var _i = 0, patternParts_1 = patternParts; _i < patternParts_1.length; _i++) {
        var patternPart = patternParts_1[_i];
        if (patternPart.type === 'literal') {
            result.push({
                type: 'literal',
                value: patternPart.value,
            });
        }
        else {
            utils_1.invariant(patternPart.type === '0', "Malformed pattern " + pattern);
            for (var _a = 0, parts_1 = parts; _a < parts_1.length; _a++) {
                var part = parts_1[_a];
                result.push({
                    type: part.type,
                    value: part.value,
                    unit: unit,
                });
            }
        }
    }
    return result;
}
exports.MakePartsList = MakePartsList;

},{"../PartitionPattern":50,"../utils":71}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartitionRelativeTimePattern = void 0;
var utils_1 = require("../utils");
var SingularRelativeTimeUnit_1 = require("./SingularRelativeTimeUnit");
var MakePartsList_1 = require("./MakePartsList");
var _262_1 = require("../262");
function PartitionRelativeTimePattern(rtf, value, unit, _a) {
    var getInternalSlots = _a.getInternalSlots;
    utils_1.invariant(_262_1.Type(value) === 'Number', "value must be number, instead got " + typeof value, TypeError);
    utils_1.invariant(_262_1.Type(unit) === 'String', "unit must be number, instead got " + typeof value, TypeError);
    if (isNaN(value) || !isFinite(value)) {
        throw new RangeError("Invalid value " + value);
    }
    var resolvedUnit = SingularRelativeTimeUnit_1.SingularRelativeTimeUnit(unit);
    var _b = getInternalSlots(rtf), fields = _b.fields, style = _b.style, numeric = _b.numeric, pluralRules = _b.pluralRules, numberFormat = _b.numberFormat;
    var entry = resolvedUnit;
    if (style === 'short') {
        entry = resolvedUnit + "-short";
    }
    else if (style === 'narrow') {
        entry = resolvedUnit + "-narrow";
    }
    if (!(entry in fields)) {
        entry = resolvedUnit;
    }
    var patterns = fields[entry];
    if (numeric === 'auto') {
        if (_262_1.ToString(value) in patterns) {
            return [
                {
                    type: 'literal',
                    value: patterns[_262_1.ToString(value)],
                },
            ];
        }
    }
    var tl = 'future';
    if (_262_1.SameValue(value, -0) || value < 0) {
        tl = 'past';
    }
    var po = patterns[tl];
    var fv = typeof numberFormat.formatToParts === 'function'
        ? numberFormat.formatToParts(Math.abs(value))
        : // TODO: If formatToParts is not supported, we assume the whole formatted
            // number is a part
            [
                {
                    type: 'literal',
                    value: numberFormat.format(Math.abs(value)),
                    unit: unit,
                },
            ];
    var pr = pluralRules.select(value);
    var pattern = po[pr];
    return MakePartsList_1.MakePartsList(pattern, resolvedUnit, fv);
}
exports.PartitionRelativeTimePattern = PartitionRelativeTimePattern;

},{"../262":7,"../utils":71,"./MakePartsList":57,"./SingularRelativeTimeUnit":59}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SingularRelativeTimeUnit = void 0;
var utils_1 = require("../utils");
var _262_1 = require("../262");
/**
 * https://tc39.es/proposal-intl-relative-time/#sec-singularrelativetimeunit
 * @param unit
 */
function SingularRelativeTimeUnit(unit) {
    utils_1.invariant(_262_1.Type(unit) === 'String', 'unit must be a string');
    if (unit === 'seconds')
        return 'second';
    if (unit === 'minutes')
        return 'minute';
    if (unit === 'hours')
        return 'hour';
    if (unit === 'days')
        return 'day';
    if (unit === 'weeks')
        return 'week';
    if (unit === 'months')
        return 'month';
    if (unit === 'quarters')
        return 'quarter';
    if (unit === 'years')
        return 'year';
    if (unit !== 'second' &&
        unit !== 'minute' &&
        unit !== 'hour' &&
        unit !== 'day' &&
        unit !== 'week' &&
        unit !== 'month' &&
        unit !== 'quarter' &&
        unit !== 'year') {
        throw new RangeError('invalid unit');
    }
    return unit;
}
exports.SingularRelativeTimeUnit = SingularRelativeTimeUnit;

},{"../262":7,"../utils":71}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResolveLocale = void 0;
var LookupMatcher_1 = require("./LookupMatcher");
var BestFitMatcher_1 = require("./BestFitMatcher");
var utils_1 = require("./utils");
var UnicodeExtensionValue_1 = require("./UnicodeExtensionValue");
/**
 * https://tc39.es/ecma402/#sec-resolvelocale
 */
function ResolveLocale(availableLocales, requestedLocales, options, relevantExtensionKeys, localeData, getDefaultLocale) {
    var matcher = options.localeMatcher;
    var r;
    if (matcher === 'lookup') {
        r = LookupMatcher_1.LookupMatcher(availableLocales, requestedLocales, getDefaultLocale);
    }
    else {
        r = BestFitMatcher_1.BestFitMatcher(availableLocales, requestedLocales, getDefaultLocale);
    }
    var foundLocale = r.locale;
    var result = { locale: '', dataLocale: foundLocale };
    var supportedExtension = '-u';
    for (var _i = 0, relevantExtensionKeys_1 = relevantExtensionKeys; _i < relevantExtensionKeys_1.length; _i++) {
        var key = relevantExtensionKeys_1[_i];
        utils_1.invariant(foundLocale in localeData, "Missing locale data for " + foundLocale);
        var foundLocaleData = localeData[foundLocale];
        utils_1.invariant(typeof foundLocaleData === 'object' && foundLocaleData !== null, "locale data " + key + " must be an object");
        var keyLocaleData = foundLocaleData[key];
        utils_1.invariant(Array.isArray(keyLocaleData), "keyLocaleData for " + key + " must be an array");
        var value = keyLocaleData[0];
        utils_1.invariant(typeof value === 'string' || value === null, "value must be string or null but got " + typeof value + " in key " + key);
        var supportedExtensionAddition = '';
        if (r.extension) {
            var requestedValue = UnicodeExtensionValue_1.UnicodeExtensionValue(r.extension, key);
            if (requestedValue !== undefined) {
                if (requestedValue !== '') {
                    if (~keyLocaleData.indexOf(requestedValue)) {
                        value = requestedValue;
                        supportedExtensionAddition = "-" + key + "-" + value;
                    }
                }
                else if (~requestedValue.indexOf('true')) {
                    value = 'true';
                    supportedExtensionAddition = "-" + key;
                }
            }
        }
        if (key in options) {
            var optionsValue = options[key];
            utils_1.invariant(typeof optionsValue === 'string' ||
                typeof optionsValue === 'undefined' ||
                optionsValue === null, 'optionsValue must be String, Undefined or Null');
            if (~keyLocaleData.indexOf(optionsValue)) {
                if (optionsValue !== value) {
                    value = optionsValue;
                    supportedExtensionAddition = '';
                }
            }
        }
        result[key] = value;
        supportedExtension += supportedExtensionAddition;
    }
    if (supportedExtension.length > 2) {
        var privateIndex = foundLocale.indexOf('-x-');
        if (privateIndex === -1) {
            foundLocale = foundLocale + supportedExtension;
        }
        else {
            var preExtension = foundLocale.slice(0, privateIndex);
            var postExtension = foundLocale.slice(privateIndex, foundLocale.length);
            foundLocale = preExtension + supportedExtension + postExtension;
        }
        foundLocale = Intl.getCanonicalLocales(foundLocale)[0];
    }
    result.locale = foundLocale;
    return result;
}
exports.ResolveLocale = ResolveLocale;

},{"./BestFitMatcher":9,"./LookupMatcher":35,"./UnicodeExtensionValue":62,"./utils":71}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportedLocales = void 0;
var _262_1 = require("./262");
var GetOption_1 = require("./GetOption");
var LookupSupportedLocales_1 = require("./LookupSupportedLocales");
/**
 * https://tc39.es/ecma402/#sec-supportedlocales
 * @param availableLocales
 * @param requestedLocales
 * @param options
 */
function SupportedLocales(availableLocales, requestedLocales, options) {
    var matcher = 'best fit';
    if (options !== undefined) {
        options = _262_1.ToObject(options);
        matcher = GetOption_1.GetOption(options, 'localeMatcher', 'string', ['lookup', 'best fit'], 'best fit');
    }
    if (matcher === 'best fit') {
        return LookupSupportedLocales_1.LookupSupportedLocales(availableLocales, requestedLocales);
    }
    return LookupSupportedLocales_1.LookupSupportedLocales(availableLocales, requestedLocales);
}
exports.SupportedLocales = SupportedLocales;

},{"./262":7,"./GetOption":30,"./LookupSupportedLocales":36}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnicodeExtensionValue = void 0;
var utils_1 = require("./utils");
/**
 * https://tc39.es/ecma402/#sec-unicodeextensionvalue
 * @param extension
 * @param key
 */
function UnicodeExtensionValue(extension, key) {
    utils_1.invariant(key.length === 2, 'key must have 2 elements');
    var size = extension.length;
    var searchValue = "-" + key + "-";
    var pos = extension.indexOf(searchValue);
    if (pos !== -1) {
        var start = pos + 4;
        var end = start;
        var k = start;
        var done = false;
        while (!done) {
            var e = extension.indexOf('-', k);
            var len = void 0;
            if (e === -1) {
                len = size - k;
            }
            else {
                len = e - k;
            }
            if (len === 2) {
                done = true;
            }
            else if (e === -1) {
                end = size;
                done = true;
            }
            else {
                end = e;
                k = e + 1;
            }
        }
        return extension.slice(start, end);
    }
    searchValue = "-" + key;
    pos = extension.indexOf(searchValue);
    if (pos !== -1 && pos + 3 === size) {
        return '';
    }
    return undefined;
}
exports.UnicodeExtensionValue = UnicodeExtensionValue;

},{"./utils":71}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMissingLocaleDataError = void 0;
var tslib_1 = require("tslib");
var MissingLocaleDataError = /** @class */ (function (_super) {
    tslib_1.__extends(MissingLocaleDataError, _super);
    function MissingLocaleDataError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type = 'MISSING_LOCALE_DATA';
        return _this;
    }
    return MissingLocaleDataError;
}(Error));
function isMissingLocaleDataError(e) {
    return e.type === 'MISSING_LOCALE_DATA';
}
exports.isMissingLocaleDataError = isMissingLocaleDataError;

},{"tslib":88}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invariant = exports.isMissingLocaleDataError = exports.defineProperty = exports.getMagnitude = exports.setMultiInternalSlots = exports.setInternalSlot = exports.isLiteralPart = exports.getMultiInternalSlots = exports.getInternalSlot = exports.parseDateTimeSkeleton = exports.DATE_TIME_PROPS = exports._formatToParts = exports.BestFitFormatMatcher = void 0;
var tslib_1 = require("tslib");
var BestFitFormatMatcher_1 = require("./DateTimeFormat/BestFitFormatMatcher");
Object.defineProperty(exports, "BestFitFormatMatcher", { enumerable: true, get: function () { return BestFitFormatMatcher_1.BestFitFormatMatcher; } });
tslib_1.__exportStar(require("./CanonicalizeLocaleList"), exports);
tslib_1.__exportStar(require("./CanonicalizeTimeZoneName"), exports);
tslib_1.__exportStar(require("./DateTimeFormat/BasicFormatMatcher"), exports);
tslib_1.__exportStar(require("./DateTimeFormat/DateTimeStyleFormat"), exports);
tslib_1.__exportStar(require("./DateTimeFormat/FormatDateTime"), exports);
tslib_1.__exportStar(require("./DateTimeFormat/FormatDateTimeRange"), exports);
tslib_1.__exportStar(require("./DateTimeFormat/FormatDateTimeRangeToParts"), exports);
tslib_1.__exportStar(require("./DateTimeFormat/FormatDateTimeToParts"), exports);
tslib_1.__exportStar(require("./DateTimeFormat/InitializeDateTimeFormat"), exports);
tslib_1.__exportStar(require("./DateTimeFormat/PartitionDateTimePattern"), exports);
tslib_1.__exportStar(require("./DateTimeFormat/ToDateTimeOptions"), exports);
tslib_1.__exportStar(require("./DisplayNames/CanonicalCodeForDisplayNames"), exports);
tslib_1.__exportStar(require("./GetNumberOption"), exports);
tslib_1.__exportStar(require("./GetOption"), exports);
tslib_1.__exportStar(require("./IsSanctionedSimpleUnitIdentifier"), exports);
tslib_1.__exportStar(require("./IsValidTimeZoneName"), exports);
tslib_1.__exportStar(require("./IsWellFormedCurrencyCode"), exports);
tslib_1.__exportStar(require("./IsWellFormedUnitIdentifier"), exports);
tslib_1.__exportStar(require("./NumberFormat/ComputeExponent"), exports);
tslib_1.__exportStar(require("./NumberFormat/ComputeExponentForMagnitude"), exports);
tslib_1.__exportStar(require("./NumberFormat/CurrencyDigits"), exports);
tslib_1.__exportStar(require("./NumberFormat/FormatNumericToParts"), exports);
tslib_1.__exportStar(require("./NumberFormat/FormatNumericToString"), exports);
tslib_1.__exportStar(require("./NumberFormat/InitializeNumberFormat"), exports);
tslib_1.__exportStar(require("./NumberFormat/PartitionNumberPattern"), exports);
tslib_1.__exportStar(require("./NumberFormat/SetNumberFormatDigitOptions"), exports);
tslib_1.__exportStar(require("./NumberFormat/SetNumberFormatUnitOptions"), exports);
tslib_1.__exportStar(require("./NumberFormat/ToRawFixed"), exports);
tslib_1.__exportStar(require("./NumberFormat/ToRawPrecision"), exports);
tslib_1.__exportStar(require("./PartitionPattern"), exports);
tslib_1.__exportStar(require("./PluralRules/GetOperands"), exports);
tslib_1.__exportStar(require("./PluralRules/InitializePluralRules"), exports);
tslib_1.__exportStar(require("./PluralRules/ResolvePlural"), exports);
tslib_1.__exportStar(require("./RelativeTimeFormat/FormatRelativeTime"), exports);
tslib_1.__exportStar(require("./RelativeTimeFormat/FormatRelativeTimeToParts"), exports);
tslib_1.__exportStar(require("./RelativeTimeFormat/InitializeRelativeTimeFormat"), exports);
tslib_1.__exportStar(require("./RelativeTimeFormat/MakePartsList"), exports);
tslib_1.__exportStar(require("./RelativeTimeFormat/PartitionRelativeTimePattern"), exports);
tslib_1.__exportStar(require("./RelativeTimeFormat/SingularRelativeTimeUnit"), exports);
tslib_1.__exportStar(require("./ResolveLocale"), exports);
tslib_1.__exportStar(require("./SupportedLocales"), exports);
var format_to_parts_1 = require("./NumberFormat/format_to_parts");
Object.defineProperty(exports, "_formatToParts", { enumerable: true, get: function () { return tslib_1.__importDefault(format_to_parts_1).default; } });
var utils_1 = require("./DateTimeFormat/utils");
Object.defineProperty(exports, "DATE_TIME_PROPS", { enumerable: true, get: function () { return utils_1.DATE_TIME_PROPS; } });
var skeleton_1 = require("./DateTimeFormat/skeleton");
Object.defineProperty(exports, "parseDateTimeSkeleton", { enumerable: true, get: function () { return skeleton_1.parseDateTimeSkeleton; } });
var utils_2 = require("./utils");
Object.defineProperty(exports, "getInternalSlot", { enumerable: true, get: function () { return utils_2.getInternalSlot; } });
Object.defineProperty(exports, "getMultiInternalSlots", { enumerable: true, get: function () { return utils_2.getMultiInternalSlots; } });
Object.defineProperty(exports, "isLiteralPart", { enumerable: true, get: function () { return utils_2.isLiteralPart; } });
Object.defineProperty(exports, "setInternalSlot", { enumerable: true, get: function () { return utils_2.setInternalSlot; } });
Object.defineProperty(exports, "setMultiInternalSlots", { enumerable: true, get: function () { return utils_2.setMultiInternalSlots; } });
Object.defineProperty(exports, "getMagnitude", { enumerable: true, get: function () { return utils_2.getMagnitude; } });
Object.defineProperty(exports, "defineProperty", { enumerable: true, get: function () { return utils_2.defineProperty; } });
var data_1 = require("./data");
Object.defineProperty(exports, "isMissingLocaleDataError", { enumerable: true, get: function () { return data_1.isMissingLocaleDataError; } });
tslib_1.__exportStar(require("./types/relative-time"), exports);
tslib_1.__exportStar(require("./types/date-time"), exports);
tslib_1.__exportStar(require("./types/list"), exports);
tslib_1.__exportStar(require("./types/plural-rules"), exports);
tslib_1.__exportStar(require("./types/number"), exports);
tslib_1.__exportStar(require("./types/displaynames"), exports);
var utils_3 = require("./utils");
Object.defineProperty(exports, "invariant", { enumerable: true, get: function () { return utils_3.invariant; } });
tslib_1.__exportStar(require("./262"), exports);

},{"./262":7,"./CanonicalizeLocaleList":10,"./CanonicalizeTimeZoneName":11,"./DateTimeFormat/BasicFormatMatcher":12,"./DateTimeFormat/BestFitFormatMatcher":13,"./DateTimeFormat/DateTimeStyleFormat":14,"./DateTimeFormat/FormatDateTime":15,"./DateTimeFormat/FormatDateTimeRange":17,"./DateTimeFormat/FormatDateTimeRangeToParts":18,"./DateTimeFormat/FormatDateTimeToParts":19,"./DateTimeFormat/InitializeDateTimeFormat":20,"./DateTimeFormat/PartitionDateTimePattern":21,"./DateTimeFormat/ToDateTimeOptions":23,"./DateTimeFormat/skeleton":25,"./DateTimeFormat/utils":26,"./DisplayNames/CanonicalCodeForDisplayNames":28,"./GetNumberOption":29,"./GetOption":30,"./IsSanctionedSimpleUnitIdentifier":31,"./IsValidTimeZoneName":32,"./IsWellFormedCurrencyCode":33,"./IsWellFormedUnitIdentifier":34,"./NumberFormat/ComputeExponent":37,"./NumberFormat/ComputeExponentForMagnitude":38,"./NumberFormat/CurrencyDigits":39,"./NumberFormat/FormatNumericToParts":40,"./NumberFormat/FormatNumericToString":41,"./NumberFormat/InitializeNumberFormat":42,"./NumberFormat/PartitionNumberPattern":43,"./NumberFormat/SetNumberFormatDigitOptions":44,"./NumberFormat/SetNumberFormatUnitOptions":45,"./NumberFormat/ToRawFixed":46,"./NumberFormat/ToRawPrecision":47,"./NumberFormat/format_to_parts":49,"./PartitionPattern":50,"./PluralRules/GetOperands":51,"./PluralRules/InitializePluralRules":52,"./PluralRules/ResolvePlural":53,"./RelativeTimeFormat/FormatRelativeTime":54,"./RelativeTimeFormat/FormatRelativeTimeToParts":55,"./RelativeTimeFormat/InitializeRelativeTimeFormat":56,"./RelativeTimeFormat/MakePartsList":57,"./RelativeTimeFormat/PartitionRelativeTimePattern":58,"./RelativeTimeFormat/SingularRelativeTimeUnit":59,"./ResolveLocale":60,"./SupportedLocales":61,"./data":63,"./types/date-time":65,"./types/displaynames":66,"./types/list":67,"./types/number":68,"./types/plural-rules":69,"./types/relative-time":70,"./utils":71,"tslib":88}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RangePatternType = void 0;
var RangePatternType;
(function (RangePatternType) {
    RangePatternType["startRange"] = "startRange";
    RangePatternType["shared"] = "shared";
    RangePatternType["endRange"] = "endRange";
})(RangePatternType = exports.RangePatternType || (exports.RangePatternType = {}));

},{}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],67:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"dup":66}],68:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"dup":66}],69:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"dup":66}],70:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"dup":66}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invariant = exports.UNICODE_EXTENSION_SEQUENCE_REGEX = exports.defineProperty = exports.isLiteralPart = exports.getMultiInternalSlots = exports.getInternalSlot = exports.setMultiInternalSlots = exports.setInternalSlot = exports.repeat = exports.getMagnitude = void 0;
/**
 * Cannot do Math.log(x) / Math.log(10) bc if IEEE floating point issue
 * @param x number
 */
function getMagnitude(x) {
    // Cannot count string length via Number.toString because it may use scientific notation
    // for very small or very large numbers.
    return Math.floor(Math.log(x) * Math.LOG10E);
}
exports.getMagnitude = getMagnitude;
function repeat(s, times) {
    if (typeof s.repeat === 'function') {
        return s.repeat(times);
    }
    var arr = new Array(times);
    for (var i = 0; i < arr.length; i++) {
        arr[i] = s;
    }
    return arr.join('');
}
exports.repeat = repeat;
function setInternalSlot(map, pl, field, value) {
    if (!map.get(pl)) {
        map.set(pl, Object.create(null));
    }
    var slots = map.get(pl);
    slots[field] = value;
}
exports.setInternalSlot = setInternalSlot;
function setMultiInternalSlots(map, pl, props) {
    for (var _i = 0, _a = Object.keys(props); _i < _a.length; _i++) {
        var k = _a[_i];
        setInternalSlot(map, pl, k, props[k]);
    }
}
exports.setMultiInternalSlots = setMultiInternalSlots;
function getInternalSlot(map, pl, field) {
    return getMultiInternalSlots(map, pl, field)[field];
}
exports.getInternalSlot = getInternalSlot;
function getMultiInternalSlots(map, pl) {
    var fields = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        fields[_i - 2] = arguments[_i];
    }
    var slots = map.get(pl);
    if (!slots) {
        throw new TypeError(pl + " InternalSlot has not been initialized");
    }
    return fields.reduce(function (all, f) {
        all[f] = slots[f];
        return all;
    }, Object.create(null));
}
exports.getMultiInternalSlots = getMultiInternalSlots;
function isLiteralPart(patternPart) {
    return patternPart.type === 'literal';
}
exports.isLiteralPart = isLiteralPart;
/*
  17 ECMAScript Standard Built-in Objects:
    Every built-in Function object, including constructors, that is not
    identified as an anonymous function has a name property whose value
    is a String.

    Unless otherwise specified, the name property of a built-in Function
    object, if it exists, has the attributes { [[Writable]]: false,
    [[Enumerable]]: false, [[Configurable]]: true }.
*/
function defineProperty(target, name, _a) {
    var value = _a.value;
    Object.defineProperty(target, name, {
        configurable: true,
        enumerable: false,
        writable: true,
        value: value,
    });
}
exports.defineProperty = defineProperty;
exports.UNICODE_EXTENSION_SEQUENCE_REGEX = /-u(?:-[0-9a-z]{2,8})+/gi;
function invariant(condition, message, Err) {
    if (Err === void 0) { Err = Error; }
    if (!condition) {
        throw new Err(message);
    }
}
exports.invariant = invariant;

},{}],72:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisplayNames = void 0;
var tslib_1 = require("tslib");
var ecma402_abstract_1 = require("@formatjs/ecma402-abstract");
var DisplayNames = /** @class */ (function () {
    function DisplayNames(locales, options) {
        var _newTarget = this.constructor;
        if (_newTarget === undefined) {
            throw TypeError("Constructor Intl.DisplayNames requires 'new'");
        }
        var requestedLocales = ecma402_abstract_1.CanonicalizeLocaleList(locales);
        options = ecma402_abstract_1.ToObject(options);
        var opt = Object.create(null);
        var localeData = DisplayNames.localeData;
        var matcher = ecma402_abstract_1.GetOption(options, 'localeMatcher', 'string', ['lookup', 'best fit'], 'best fit');
        opt.localeMatcher = matcher;
        var r = ecma402_abstract_1.ResolveLocale(DisplayNames.availableLocales, requestedLocales, opt, [], // there is no relevantExtensionKeys
        DisplayNames.localeData, DisplayNames.getDefaultLocale);
        var style = ecma402_abstract_1.GetOption(options, 'style', 'string', ['narrow', 'short', 'long'], 'long');
        setSlot(this, 'style', style);
        var type = ecma402_abstract_1.GetOption(options, 'type', 'string', ['language', 'currency', 'region', 'script'], undefined);
        if (type === undefined) {
            throw TypeError("Intl.DisplayNames constructor requires \"type\" option");
        }
        setSlot(this, 'type', type);
        var fallback = ecma402_abstract_1.GetOption(options, 'fallback', 'string', ['code', 'none'], 'code');
        setSlot(this, 'fallback', fallback);
        setSlot(this, 'locale', r.locale);
        var dataLocale = r.dataLocale;
        var dataLocaleData = localeData[dataLocale];
        ecma402_abstract_1.invariant(!!dataLocaleData, "Missing locale data for " + dataLocale);
        setSlot(this, 'localeData', dataLocaleData);
        ecma402_abstract_1.invariant(dataLocaleData !== undefined, "locale data for " + r.locale + " does not exist.");
        var types = dataLocaleData.types;
        ecma402_abstract_1.invariant(typeof types === 'object' && types != null, 'invalid types data');
        var typeFields = types[type];
        ecma402_abstract_1.invariant(typeof typeFields === 'object' && typeFields != null, 'invalid typeFields data');
        var styleFields = typeFields[style];
        ecma402_abstract_1.invariant(typeof styleFields === 'object' && styleFields != null, 'invalid styleFields data');
        setSlot(this, 'fields', styleFields);
    }
    DisplayNames.supportedLocalesOf = function (locales, options) {
        return ecma402_abstract_1.SupportedLocales(DisplayNames.availableLocales, ecma402_abstract_1.CanonicalizeLocaleList(locales), options);
    };
    DisplayNames.__addLocaleData = function () {
        var data = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            data[_i] = arguments[_i];
        }
        for (var _a = 0, data_1 = data; _a < data_1.length; _a++) {
            var _b = data_1[_a], d = _b.data, locale = _b.locale;
            var minimizedLocale = new Intl.Locale(locale)
                .minimize()
                .toString();
            DisplayNames.localeData[locale] = DisplayNames.localeData[minimizedLocale] = d;
            DisplayNames.availableLocales.add(minimizedLocale);
            DisplayNames.availableLocales.add(locale);
            if (!DisplayNames.__defaultLocale) {
                DisplayNames.__defaultLocale = minimizedLocale;
            }
        }
    };
    DisplayNames.prototype.of = function (code) {
        checkReceiver(this, 'of');
        var type = getSlot(this, 'type');
        var codeAsString = ecma402_abstract_1.ToString(code);
        if (!isValidCodeForDisplayNames(type, codeAsString)) {
            throw RangeError('invalid code for Intl.DisplayNames.prototype.of');
        }
        var _a = ecma402_abstract_1.getMultiInternalSlots(__INTERNAL_SLOT_MAP__, this, 'localeData', 'style', 'fallback'), localeData = _a.localeData, style = _a.style, fallback = _a.fallback;
        // Canonicalize the case.
        var canonicalCode;
        // This is only used to store extracted language region.
        var regionSubTag;
        switch (type) {
            // Normalize the locale id and remove the region.
            case 'language': {
                canonicalCode = ecma402_abstract_1.CanonicalizeLocaleList(codeAsString)[0];
                var regionMatch = /-([a-z]{2}|\d{3})\b/i.exec(canonicalCode);
                if (regionMatch) {
                    // Remove region subtag
                    canonicalCode =
                        canonicalCode.substring(0, regionMatch.index) +
                            canonicalCode.substring(regionMatch.index + regionMatch[0].length);
                    regionSubTag = regionMatch[1];
                }
                break;
            }
            // currency code should be all upper-case.
            case 'currency':
                canonicalCode = codeAsString.toUpperCase();
                break;
            // script code should be title case
            case 'script':
                canonicalCode =
                    codeAsString[0] + codeAsString.substring(1).toLowerCase();
                break;
            // region shold be all upper-case
            case 'region':
                canonicalCode = codeAsString.toUpperCase();
                break;
        }
        var typesData = localeData.types[type];
        // If the style of choice does not exist, fallback to "long".
        var name = typesData[style][canonicalCode] || typesData.long[canonicalCode];
        if (name !== undefined) {
            // If there is a region subtag in the language id, use locale pattern to interpolate the region
            if (regionSubTag) {
                // Retrieve region display names
                var regionsData = localeData.types.region;
                var regionDisplayName = regionsData[style][regionSubTag] || regionsData.long[regionSubTag];
                if (regionDisplayName || fallback === 'code') {
                    // Interpolate into locale-specific pattern.
                    var pattern = localeData.patterns.locale;
                    return pattern
                        .replace('{0}', name)
                        .replace('{1}', regionDisplayName || regionSubTag);
                }
            }
            else {
                return name;
            }
        }
        if (fallback === 'code') {
            return codeAsString;
        }
    };
    DisplayNames.prototype.resolvedOptions = function () {
        checkReceiver(this, 'resolvedOptions');
        return tslib_1.__assign({}, ecma402_abstract_1.getMultiInternalSlots(__INTERNAL_SLOT_MAP__, this, 'locale', 'style', 'type', 'fallback'));
    };
    DisplayNames.getDefaultLocale = function () {
        return DisplayNames.__defaultLocale;
    };
    DisplayNames.localeData = {};
    DisplayNames.availableLocales = new Set();
    DisplayNames.__defaultLocale = '';
    DisplayNames.polyfilled = true;
    return DisplayNames;
}());
exports.DisplayNames = DisplayNames;
// https://tc39.es/proposal-intl-displaynames/#sec-isvalidcodefordisplaynames
function isValidCodeForDisplayNames(type, code) {
    switch (type) {
        case 'language':
            // subset of unicode_language_id
            // languageCode ["-" scriptCode] ["-" regionCode] *("-" variant)
            // where:
            // - languageCode is either a two letters ISO 639-1 language code or a three letters ISO 639-2 language code.
            // - scriptCode is should be an ISO-15924 four letters script code
            // - regionCode is either an ISO-3166 two letters region code, or a three digits UN M49 Geographic Regions.
            return /^[a-z]{2,3}(-[a-z]{4})?(-([a-z]{2}|\d{3}))?(-([a-z\d]{5,8}|\d[a-z\d]{3}))*$/i.test(code);
        case 'region':
            // unicode_region_subtag
            return /^([a-z]{2}|\d{3})$/i.test(code);
        case 'script':
            // unicode_script_subtag
            return /^[a-z]{4}$/i.test(code);
        case 'currency':
            return ecma402_abstract_1.IsWellFormedCurrencyCode(code);
    }
}
try {
    // IE11 does not have Symbol
    if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
        Object.defineProperty(DisplayNames.prototype, Symbol.toStringTag, {
            value: 'Intl.DisplayNames',
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    Object.defineProperty(DisplayNames, 'length', {
        value: 2,
        writable: false,
        enumerable: false,
        configurable: true,
    });
}
catch (e) {
    // Make test 262 compliant
}
var __INTERNAL_SLOT_MAP__ = new WeakMap();
function getSlot(instance, key) {
    return ecma402_abstract_1.getInternalSlot(__INTERNAL_SLOT_MAP__, instance, key);
}
function setSlot(instance, key, value) {
    ecma402_abstract_1.setInternalSlot(__INTERNAL_SLOT_MAP__, instance, key, value);
}
function checkReceiver(receiver, methodName) {
    if (!(receiver instanceof DisplayNames)) {
        throw TypeError("Method Intl.DisplayNames.prototype." + methodName + " called on incompatible receiver");
    }
}

},{"@formatjs/ecma402-abstract":64,"tslib":88}],73:[function(require,module,exports){
/* @generated */
// prettier-ignore
if (Intl.DisplayNames && typeof Intl.DisplayNames.__addLocaleData === 'function') {
  Intl.DisplayNames.__addLocaleData({"data":{"types":{"language":{"long":{"aa":"Afar","ab":"Abkhazian","ace":"Achinese","ach":"Acoli","ada":"Adangme","ady":"Adyghe","ae":"Avestan","aeb":"Tunisian Arabic","af":"Afrikaans","afh":"Afrihili","agq":"Aghem","ain":"Ainu","ak":"Akan","akk":"Akkadian","akz":"Alabama","ale":"Aleut","aln":"Gheg Albanian","alt":"Southern Altai","am":"Amharic","an":"Aragonese","ang":"Old English","anp":"Angika","ar":"Arabic","ar-001":"Modern Standard Arabic","arc":"Aramaic","arn":"Mapuche","aro":"Araona","arp":"Arapaho","arq":"Algerian Arabic","ars":"Najdi Arabic","arw":"Arawak","ary":"Moroccan Arabic","arz":"Egyptian Arabic","as":"Assamese","asa":"Asu","ase":"American Sign Language","ast":"Asturian","av":"Avaric","avk":"Kotava","awa":"Awadhi","ay":"Aymara","az":"Azerbaijani","ba":"Bashkir","bal":"Baluchi","ban":"Balinese","bar":"Bavarian","bas":"Basaa","bax":"Bamun","bbc":"Batak Toba","bbj":"Ghomala","be":"Belarusian","bej":"Beja","bem":"Bemba","bew":"Betawi","bez":"Bena","bfd":"Bafut","bfq":"Badaga","bg":"Bulgarian","bgn":"Western Balochi","bho":"Bhojpuri","bi":"Bislama","bik":"Bikol","bin":"Bini","bjn":"Banjar","bkm":"Kom","bla":"Siksika","bm":"Bambara","bn":"Bangla","bo":"Tibetan","bpy":"Bishnupriya","bqi":"Bakhtiari","br":"Breton","bra":"Braj","brh":"Brahui","brx":"Bodo","bs":"Bosnian","bss":"Akoose","bua":"Buriat","bug":"Buginese","bum":"Bulu","byn":"Blin","byv":"Medumba","ca":"Catalan","cad":"Caddo","car":"Carib","cay":"Cayuga","cch":"Atsam","ccp":"Chakma","ce":"Chechen","ceb":"Cebuano","cgg":"Chiga","ch":"Chamorro","chb":"Chibcha","chg":"Chagatai","chk":"Chuukese","chm":"Mari","chn":"Chinook Jargon","cho":"Choctaw","chp":"Chipewyan","chr":"Cherokee","chy":"Cheyenne","cic":"Chickasaw","ckb":"Central Kurdish","co":"Corsican","cop":"Coptic","cps":"Capiznon","cr":"Cree","crh":"Crimean Turkish","crs":"Seselwa Creole French","cs":"Czech","csb":"Kashubian","cu":"Church Slavic","cv":"Chuvash","cy":"Welsh","da":"Danish","dak":"Dakota","dar":"Dargwa","dav":"Taita","de":"German","de-AT":"Austrian German","de-CH":"Swiss High German","del":"Delaware","den":"Slave","dgr":"Dogrib","din":"Dinka","dje":"Zarma","doi":"Dogri","dsb":"Lower Sorbian","dtp":"Central Dusun","dua":"Duala","dum":"Middle Dutch","dv":"Divehi","dyo":"Jola-Fonyi","dyu":"Dyula","dz":"Dzongkha","dzg":"Dazaga","ebu":"Embu","ee":"Ewe","efi":"Efik","egl":"Emilian","egy":"Ancient Egyptian","eka":"Ekajuk","el":"Greek","elx":"Elamite","en":"English","en-AU":"Australian English","en-CA":"Canadian English","en-GB":"British English","en-US":"American English","enm":"Middle English","eo":"Esperanto","es":"Spanish","es-419":"Latin American Spanish","es-ES":"European Spanish","es-MX":"Mexican Spanish","esu":"Central Yupik","et":"Estonian","eu":"Basque","ewo":"Ewondo","ext":"Extremaduran","fa":"Persian","fa-AF":"Dari","fan":"Fang","fat":"Fanti","ff":"Fulah","fi":"Finnish","fil":"Filipino","fit":"Tornedalen Finnish","fj":"Fijian","fo":"Faroese","fon":"Fon","fr":"French","fr-CA":"Canadian French","fr-CH":"Swiss French","frc":"Cajun French","frm":"Middle French","fro":"Old French","frp":"Arpitan","frr":"Northern Frisian","frs":"Eastern Frisian","fur":"Friulian","fy":"Western Frisian","ga":"Irish","gaa":"Ga","gag":"Gagauz","gan":"Gan Chinese","gay":"Gayo","gba":"Gbaya","gbz":"Zoroastrian Dari","gd":"Scottish Gaelic","gez":"Geez","gil":"Gilbertese","gl":"Galician","glk":"Gilaki","gmh":"Middle High German","gn":"Guarani","goh":"Old High German","gom":"Goan Konkani","gon":"Gondi","gor":"Gorontalo","got":"Gothic","grb":"Grebo","grc":"Ancient Greek","gsw":"Swiss German","gu":"Gujarati","guc":"Wayuu","gur":"Frafra","guz":"Gusii","gv":"Manx","gwi":"Gwichʼin","ha":"Hausa","hai":"Haida","hak":"Hakka Chinese","haw":"Hawaiian","he":"Hebrew","hi":"Hindi","hif":"Fiji Hindi","hil":"Hiligaynon","hit":"Hittite","hmn":"Hmong","ho":"Hiri Motu","hr":"Croatian","hsb":"Upper Sorbian","hsn":"Xiang Chinese","ht":"Haitian Creole","hu":"Hungarian","hup":"Hupa","hy":"Armenian","hz":"Herero","ia":"Interlingua","iba":"Iban","ibb":"Ibibio","id":"Indonesian","ie":"Interlingue","ig":"Igbo","ii":"Sichuan Yi","ik":"Inupiaq","ilo":"Iloko","inh":"Ingush","io":"Ido","is":"Icelandic","it":"Italian","iu":"Inuktitut","izh":"Ingrian","ja":"Japanese","jam":"Jamaican Creole English","jbo":"Lojban","jgo":"Ngomba","jmc":"Machame","jpr":"Judeo-Persian","jrb":"Judeo-Arabic","jut":"Jutish","jv":"Javanese","ka":"Georgian","kaa":"Kara-Kalpak","kab":"Kabyle","kac":"Kachin","kaj":"Jju","kam":"Kamba","kaw":"Kawi","kbd":"Kabardian","kbl":"Kanembu","kcg":"Tyap","kde":"Makonde","kea":"Kabuverdianu","ken":"Kenyang","kfo":"Koro","kg":"Kongo","kgp":"Kaingang","kha":"Khasi","kho":"Khotanese","khq":"Koyra Chiini","khw":"Khowar","ki":"Kikuyu","kiu":"Kirmanjki","kj":"Kuanyama","kk":"Kazakh","kkj":"Kako","kl":"Kalaallisut","kln":"Kalenjin","km":"Khmer","kmb":"Kimbundu","kn":"Kannada","ko":"Korean","koi":"Komi-Permyak","kok":"Konkani","kos":"Kosraean","kpe":"Kpelle","kr":"Kanuri","krc":"Karachay-Balkar","kri":"Krio","krj":"Kinaray-a","krl":"Karelian","kru":"Kurukh","ks":"Kashmiri","ksb":"Shambala","ksf":"Bafia","ksh":"Colognian","ku":"Kurdish","kum":"Kumyk","kut":"Kutenai","kv":"Komi","kw":"Cornish","ky":"Kyrgyz","la":"Latin","lad":"Ladino","lag":"Langi","lah":"Lahnda","lam":"Lamba","lb":"Luxembourgish","lez":"Lezghian","lfn":"Lingua Franca Nova","lg":"Ganda","li":"Limburgish","lij":"Ligurian","liv":"Livonian","lkt":"Lakota","lmo":"Lombard","ln":"Lingala","lo":"Lao","lol":"Mongo","lou":"Louisiana Creole","loz":"Lozi","lrc":"Northern Luri","lt":"Lithuanian","ltg":"Latgalian","lu":"Luba-Katanga","lua":"Luba-Lulua","lui":"Luiseno","lun":"Lunda","luo":"Luo","lus":"Mizo","luy":"Luyia","lv":"Latvian","lzh":"Literary Chinese","lzz":"Laz","mad":"Madurese","maf":"Mafa","mag":"Magahi","mai":"Maithili","mak":"Makasar","man":"Mandingo","mas":"Masai","mde":"Maba","mdf":"Moksha","mdr":"Mandar","men":"Mende","mer":"Meru","mfe":"Morisyen","mg":"Malagasy","mga":"Middle Irish","mgh":"Makhuwa-Meetto","mgo":"Metaʼ","mh":"Marshallese","mi":"Maori","mic":"Mi'kmaq","min":"Minangkabau","mk":"Macedonian","ml":"Malayalam","mn":"Mongolian","mnc":"Manchu","mni":"Manipuri","moh":"Mohawk","mos":"Mossi","mr":"Marathi","mrj":"Western Mari","ms":"Malay","mt":"Maltese","mua":"Mundang","mul":"Multiple languages","mus":"Muscogee","mwl":"Mirandese","mwr":"Marwari","mwv":"Mentawai","my":"Burmese","mye":"Myene","myv":"Erzya","mzn":"Mazanderani","na":"Nauru","nan":"Min Nan Chinese","nap":"Neapolitan","naq":"Nama","nb":"Norwegian Bokmål","nd":"North Ndebele","nds":"Low German","nds-NL":"Low Saxon","ne":"Nepali","new":"Newari","ng":"Ndonga","nia":"Nias","niu":"Niuean","njo":"Ao Naga","nl":"Dutch","nl-BE":"Flemish","nmg":"Kwasio","nn":"Norwegian Nynorsk","nnh":"Ngiemboon","no":"Norwegian","nog":"Nogai","non":"Old Norse","nov":"Novial","nqo":"N’Ko","nr":"South Ndebele","nso":"Northern Sotho","nus":"Nuer","nv":"Navajo","nwc":"Classical Newari","ny":"Nyanja","nym":"Nyamwezi","nyn":"Nyankole","nyo":"Nyoro","nzi":"Nzima","oc":"Occitan","oj":"Ojibwa","om":"Oromo","or":"Odia","os":"Ossetic","osa":"Osage","ota":"Ottoman Turkish","pa":"Punjabi","pag":"Pangasinan","pal":"Pahlavi","pam":"Pampanga","pap":"Papiamento","pau":"Palauan","pcd":"Picard","pcm":"Nigerian Pidgin","pdc":"Pennsylvania German","pdt":"Plautdietsch","peo":"Old Persian","pfl":"Palatine German","phn":"Phoenician","pi":"Pali","pl":"Polish","pms":"Piedmontese","pnt":"Pontic","pon":"Pohnpeian","prg":"Prussian","pro":"Old Provençal","ps":"Pashto","pt":"Portuguese","pt-BR":"Brazilian Portuguese","pt-PT":"European Portuguese","qu":"Quechua","quc":"Kʼicheʼ","qug":"Chimborazo Highland Quichua","raj":"Rajasthani","rap":"Rapanui","rar":"Rarotongan","rgn":"Romagnol","rif":"Riffian","rm":"Romansh","rn":"Rundi","ro":"Romanian","ro-MD":"Moldavian","rof":"Rombo","rom":"Romany","root":"Root","rtm":"Rotuman","ru":"Russian","rue":"Rusyn","rug":"Roviana","rup":"Aromanian","rw":"Kinyarwanda","rwk":"Rwa","sa":"Sanskrit","sad":"Sandawe","sah":"Sakha","sam":"Samaritan Aramaic","saq":"Samburu","sas":"Sasak","sat":"Santali","saz":"Saurashtra","sba":"Ngambay","sbp":"Sangu","sc":"Sardinian","scn":"Sicilian","sco":"Scots","sd":"Sindhi","sdc":"Sassarese Sardinian","sdh":"Southern Kurdish","se":"Northern Sami","see":"Seneca","seh":"Sena","sei":"Seri","sel":"Selkup","ses":"Koyraboro Senni","sg":"Sango","sga":"Old Irish","sgs":"Samogitian","sh":"Serbo-Croatian","shi":"Tachelhit","shn":"Shan","shu":"Chadian Arabic","si":"Sinhala","sid":"Sidamo","sk":"Slovak","sl":"Slovenian","sli":"Lower Silesian","sly":"Selayar","sm":"Samoan","sma":"Southern Sami","smj":"Lule Sami","smn":"Inari Sami","sms":"Skolt Sami","sn":"Shona","snk":"Soninke","so":"Somali","sog":"Sogdien","sq":"Albanian","sr":"Serbian","sr-ME":"Montenegrin","srn":"Sranan Tongo","srr":"Serer","ss":"Swati","ssy":"Saho","st":"Southern Sotho","stq":"Saterland Frisian","su":"Sundanese","suk":"Sukuma","sus":"Susu","sux":"Sumerian","sv":"Swedish","sw":"Swahili","sw-CD":"Congo Swahili","swb":"Comorian","syc":"Classical Syriac","syr":"Syriac","szl":"Silesian","ta":"Tamil","tcy":"Tulu","te":"Telugu","tem":"Timne","teo":"Teso","ter":"Tereno","tet":"Tetum","tg":"Tajik","th":"Thai","ti":"Tigrinya","tig":"Tigre","tiv":"Tiv","tk":"Turkmen","tkl":"Tokelau","tkr":"Tsakhur","tl":"Tagalog","tlh":"Klingon","tli":"Tlingit","tly":"Talysh","tmh":"Tamashek","tn":"Tswana","to":"Tongan","tog":"Nyasa Tonga","tpi":"Tok Pisin","tr":"Turkish","tru":"Turoyo","trv":"Taroko","ts":"Tsonga","tsd":"Tsakonian","tsi":"Tsimshian","tt":"Tatar","ttt":"Muslim Tat","tum":"Tumbuka","tvl":"Tuvalu","tw":"Twi","twq":"Tasawaq","ty":"Tahitian","tyv":"Tuvinian","tzm":"Central Atlas Tamazight","udm":"Udmurt","ug":"Uyghur","uga":"Ugaritic","uk":"Ukrainian","umb":"Umbundu","und":"Unknown language","ur":"Urdu","uz":"Uzbek","vai":"Vai","ve":"Venda","vec":"Venetian","vep":"Veps","vi":"Vietnamese","vls":"West Flemish","vmf":"Main-Franconian","vo":"Volapük","vot":"Votic","vro":"Võro","vun":"Vunjo","wa":"Walloon","wae":"Walser","wal":"Wolaytta","war":"Waray","was":"Washo","wbp":"Warlpiri","wo":"Wolof","wuu":"Wu Chinese","xal":"Kalmyk","xh":"Xhosa","xmf":"Mingrelian","xog":"Soga","yao":"Yao","yap":"Yapese","yav":"Yangben","ybb":"Yemba","yi":"Yiddish","yo":"Yoruba","yrl":"Nheengatu","yue":"Cantonese","za":"Zhuang","zap":"Zapotec","zbl":"Blissymbols","zea":"Zeelandic","zen":"Zenaga","zgh":"Standard Moroccan Tamazight","zh":"Chinese","zh-Hans":"Simplified Chinese","zh-Hant":"Traditional Chinese","zu":"Zulu","zun":"Zuni","zxx":"No linguistic content","zza":"Zaza"},"short":{"az":"Azeri","en-GB":"UK English","en-US":"US English"},"narrow":{}},"region":{"long":{"142":"Asia","143":"Central Asia","145":"Western Asia","150":"Europe","151":"Eastern Europe","154":"Northern Europe","155":"Western Europe","202":"Sub-Saharan Africa","419":"Latin America","001":"World","002":"Africa","003":"North America","005":"South America","009":"Oceania","011":"Western Africa","013":"Central America","014":"Eastern Africa","015":"Northern Africa","017":"Middle Africa","018":"Southern Africa","019":"Americas","021":"Northern America","029":"Caribbean","030":"Eastern Asia","034":"Southern Asia","035":"Southeast Asia","039":"Southern Europe","053":"Australasia","054":"Melanesia","057":"Micronesian Region","061":"Polynesia","AC":"Ascension Island","AD":"Andorra","AE":"United Arab Emirates","AF":"Afghanistan","AG":"Antigua & Barbuda","AI":"Anguilla","AL":"Albania","AM":"Armenia","AO":"Angola","AQ":"Antarctica","AR":"Argentina","AS":"American Samoa","AT":"Austria","AU":"Australia","AW":"Aruba","AX":"Åland Islands","AZ":"Azerbaijan","BA":"Bosnia & Herzegovina","BB":"Barbados","BD":"Bangladesh","BE":"Belgium","BF":"Burkina Faso","BG":"Bulgaria","BH":"Bahrain","BI":"Burundi","BJ":"Benin","BL":"St. Barthélemy","BM":"Bermuda","BN":"Brunei","BO":"Bolivia","BQ":"Caribbean Netherlands","BR":"Brazil","BS":"Bahamas","BT":"Bhutan","BV":"Bouvet Island","BW":"Botswana","BY":"Belarus","BZ":"Belize","CA":"Canada","CC":"Cocos (Keeling) Islands","CD":"Congo - Kinshasa","CF":"Central African Republic","CG":"Congo - Brazzaville","CH":"Switzerland","CI":"Côte d’Ivoire","CK":"Cook Islands","CL":"Chile","CM":"Cameroon","CN":"China","CO":"Colombia","CP":"Clipperton Island","CR":"Costa Rica","CU":"Cuba","CV":"Cape Verde","CW":"Curaçao","CX":"Christmas Island","CY":"Cyprus","CZ":"Czechia","DE":"Germany","DG":"Diego Garcia","DJ":"Djibouti","DK":"Denmark","DM":"Dominica","DO":"Dominican Republic","DZ":"Algeria","EA":"Ceuta & Melilla","EC":"Ecuador","EE":"Estonia","EG":"Egypt","EH":"Western Sahara","ER":"Eritrea","ES":"Spain","ET":"Ethiopia","EU":"European Union","EZ":"Eurozone","FI":"Finland","FJ":"Fiji","FK":"Falkland Islands","FM":"Micronesia","FO":"Faroe Islands","FR":"France","GA":"Gabon","GB":"United Kingdom","GD":"Grenada","GE":"Georgia","GF":"French Guiana","GG":"Guernsey","GH":"Ghana","GI":"Gibraltar","GL":"Greenland","GM":"Gambia","GN":"Guinea","GP":"Guadeloupe","GQ":"Equatorial Guinea","GR":"Greece","GS":"South Georgia & South Sandwich Islands","GT":"Guatemala","GU":"Guam","GW":"Guinea-Bissau","GY":"Guyana","HK":"Hong Kong SAR China","HM":"Heard & McDonald Islands","HN":"Honduras","HR":"Croatia","HT":"Haiti","HU":"Hungary","IC":"Canary Islands","ID":"Indonesia","IE":"Ireland","IL":"Israel","IM":"Isle of Man","IN":"India","IO":"British Indian Ocean Territory","IQ":"Iraq","IR":"Iran","IS":"Iceland","IT":"Italy","JE":"Jersey","JM":"Jamaica","JO":"Jordan","JP":"Japan","KE":"Kenya","KG":"Kyrgyzstan","KH":"Cambodia","KI":"Kiribati","KM":"Comoros","KN":"St. Kitts & Nevis","KP":"North Korea","KR":"South Korea","KW":"Kuwait","KY":"Cayman Islands","KZ":"Kazakhstan","LA":"Laos","LB":"Lebanon","LC":"St. Lucia","LI":"Liechtenstein","LK":"Sri Lanka","LR":"Liberia","LS":"Lesotho","LT":"Lithuania","LU":"Luxembourg","LV":"Latvia","LY":"Libya","MA":"Morocco","MC":"Monaco","MD":"Moldova","ME":"Montenegro","MF":"St. Martin","MG":"Madagascar","MH":"Marshall Islands","MK":"North Macedonia","ML":"Mali","MM":"Myanmar (Burma)","MN":"Mongolia","MO":"Macao SAR China","MP":"Northern Mariana Islands","MQ":"Martinique","MR":"Mauritania","MS":"Montserrat","MT":"Malta","MU":"Mauritius","MV":"Maldives","MW":"Malawi","MX":"Mexico","MY":"Malaysia","MZ":"Mozambique","NA":"Namibia","NC":"New Caledonia","NE":"Niger","NF":"Norfolk Island","NG":"Nigeria","NI":"Nicaragua","NL":"Netherlands","NO":"Norway","NP":"Nepal","NR":"Nauru","NU":"Niue","NZ":"New Zealand","OM":"Oman","PA":"Panama","PE":"Peru","PF":"French Polynesia","PG":"Papua New Guinea","PH":"Philippines","PK":"Pakistan","PL":"Poland","PM":"St. Pierre & Miquelon","PN":"Pitcairn Islands","PR":"Puerto Rico","PS":"Palestinian Territories","PT":"Portugal","PW":"Palau","PY":"Paraguay","QA":"Qatar","QO":"Outlying Oceania","RE":"Réunion","RO":"Romania","RS":"Serbia","RU":"Russia","RW":"Rwanda","SA":"Saudi Arabia","SB":"Solomon Islands","SC":"Seychelles","SD":"Sudan","SE":"Sweden","SG":"Singapore","SH":"St. Helena","SI":"Slovenia","SJ":"Svalbard & Jan Mayen","SK":"Slovakia","SL":"Sierra Leone","SM":"San Marino","SN":"Senegal","SO":"Somalia","SR":"Suriname","SS":"South Sudan","ST":"São Tomé & Príncipe","SV":"El Salvador","SX":"Sint Maarten","SY":"Syria","SZ":"Eswatini","TA":"Tristan da Cunha","TC":"Turks & Caicos Islands","TD":"Chad","TF":"French Southern Territories","TG":"Togo","TH":"Thailand","TJ":"Tajikistan","TK":"Tokelau","TL":"Timor-Leste","TM":"Turkmenistan","TN":"Tunisia","TO":"Tonga","TR":"Turkey","TT":"Trinidad & Tobago","TV":"Tuvalu","TW":"Taiwan","TZ":"Tanzania","UA":"Ukraine","UG":"Uganda","UM":"U.S. Outlying Islands","UN":"United Nations","US":"United States","UY":"Uruguay","UZ":"Uzbekistan","VA":"Vatican City","VC":"St. Vincent & Grenadines","VE":"Venezuela","VG":"British Virgin Islands","VI":"U.S. Virgin Islands","VN":"Vietnam","VU":"Vanuatu","WF":"Wallis & Futuna","WS":"Samoa","XA":"Pseudo-Accents","XB":"Pseudo-Bidi","XK":"Kosovo","YE":"Yemen","YT":"Mayotte","ZA":"South Africa","ZM":"Zambia","ZW":"Zimbabwe","ZZ":"Unknown Region"},"short":{"BA":"Bosnia","GB":"UK","HK":"Hong Kong","MM":"Myanmar","MO":"Macao","PS":"Palestine","UN":"UN","US":"US"},"narrow":{}},"script":{"long":{"Adlm":"Adlam","Afak":"Afaka","Aghb":"Caucasian Albanian","Ahom":"Ahom","Arab":"Arabic","Aran":"Nastaliq","Armi":"Imperial Aramaic","Armn":"Armenian","Avst":"Avestan","Bali":"Balinese","Bamu":"Bamum","Bass":"Bassa Vah","Batk":"Batak","Beng":"Bangla","Bhks":"Bhaiksuki","Blis":"Blissymbols","Bopo":"Bopomofo","Brah":"Brahmi","Brai":"Braille","Bugi":"Buginese","Buhd":"Buhid","Cakm":"Chakma","Cans":"Unified Canadian Aboriginal Syllabics","Cari":"Carian","Cham":"Cham","Cher":"Cherokee","Chrs":"Chorasmian","Cirt":"Cirth","Copt":"Coptic","Cprt":"Cypriot","Cyrl":"Cyrillic","Cyrs":"Old Church Slavonic Cyrillic","Deva":"Devanagari","Diak":"Dives Akuru","Dogr":"Dogra","Dsrt":"Deseret","Dupl":"Duployan shorthand","Egyd":"Egyptian demotic","Egyh":"Egyptian hieratic","Egyp":"Egyptian hieroglyphs","Elba":"Elbasan","Elym":"Elymaic","Ethi":"Ethiopic","Geok":"Georgian Khutsuri","Geor":"Georgian","Glag":"Glagolitic","Gong":"Gunjala Gondi","Gonm":"Masaram Gondi","Goth":"Gothic","Gran":"Grantha","Grek":"Greek","Gujr":"Gujarati","Guru":"Gurmukhi","Hanb":"Han with Bopomofo","Hang":"Hangul","Hani":"Han","Hano":"Hanunoo","Hans":"Simplified","Hant":"Traditional","Hatr":"Hatran","Hebr":"Hebrew","Hira":"Hiragana","Hluw":"Anatolian Hieroglyphs","Hmng":"Pahawh Hmong","Hmnp":"Nyiakeng Puachue Hmong","Hrkt":"Japanese syllabaries","Hung":"Old Hungarian","Inds":"Indus","Ital":"Old Italic","Jamo":"Jamo","Java":"Javanese","Jpan":"Japanese","Jurc":"Jurchen","Kali":"Kayah Li","Kana":"Katakana","Khar":"Kharoshthi","Khmr":"Khmer","Khoj":"Khojki","Kits":"Khitan small script","Knda":"Kannada","Kore":"Korean","Kpel":"Kpelle","Kthi":"Kaithi","Lana":"Lanna","Laoo":"Lao","Latf":"Fraktur Latin","Latg":"Gaelic Latin","Latn":"Latin","Lepc":"Lepcha","Limb":"Limbu","Lina":"Linear A","Linb":"Linear B","Lisu":"Fraser","Loma":"Loma","Lyci":"Lycian","Lydi":"Lydian","Mahj":"Mahajani","Maka":"Makasar","Mand":"Mandaean","Mani":"Manichaean","Marc":"Marchen","Maya":"Mayan hieroglyphs","Medf":"Medefaidrin","Mend":"Mende","Merc":"Meroitic Cursive","Mero":"Meroitic","Mlym":"Malayalam","Modi":"Modi","Mong":"Mongolian","Moon":"Moon","Mroo":"Mro","Mtei":"Meitei Mayek","Mult":"Multani","Mymr":"Myanmar","Nand":"Nandinagari","Narb":"Old North Arabian","Nbat":"Nabataean","Newa":"Newa","Nkgb":"Naxi Geba","Nkoo":"N’Ko","Nshu":"Nüshu","Ogam":"Ogham","Olck":"Ol Chiki","Orkh":"Orkhon","Orya":"Odia","Osge":"Osage","Osma":"Osmanya","Palm":"Palmyrene","Pauc":"Pau Cin Hau","Perm":"Old Permic","Phag":"Phags-pa","Phli":"Inscriptional Pahlavi","Phlp":"Psalter Pahlavi","Phlv":"Book Pahlavi","Phnx":"Phoenician","Plrd":"Pollard Phonetic","Prti":"Inscriptional Parthian","Qaag":"Zawgyi","Rjng":"Rejang","Rohg":"Hanifi Rohingya","Roro":"Rongorongo","Runr":"Runic","Samr":"Samaritan","Sara":"Sarati","Sarb":"Old South Arabian","Saur":"Saurashtra","Sgnw":"SignWriting","Shaw":"Shavian","Shrd":"Sharada","Sidd":"Siddham","Sind":"Khudawadi","Sinh":"Sinhala","Sogd":"Sogdian","Sogo":"Old Sogdian","Sora":"Sora Sompeng","Soyo":"Soyombo","Sund":"Sundanese","Sylo":"Syloti Nagri","Syrc":"Syriac","Syre":"Estrangelo Syriac","Syrj":"Western Syriac","Syrn":"Eastern Syriac","Tagb":"Tagbanwa","Takr":"Takri","Tale":"Tai Le","Talu":"New Tai Lue","Taml":"Tamil","Tang":"Tangut","Tavt":"Tai Viet","Telu":"Telugu","Teng":"Tengwar","Tfng":"Tifinagh","Tglg":"Tagalog","Thaa":"Thaana","Thai":"Thai","Tibt":"Tibetan","Tirh":"Tirhuta","Ugar":"Ugaritic","Vaii":"Vai","Visp":"Visible Speech","Wara":"Varang Kshiti","Wcho":"Wancho","Wole":"Woleai","Xpeo":"Old Persian","Xsux":"Sumero-Akkadian Cuneiform","Yezi":"Yezidi","Yiii":"Yi","Zanb":"Zanabazar Square","Zinh":"Inherited","Zmth":"Mathematical Notation","Zsye":"Emoji","Zsym":"Symbols","Zxxx":"Unwritten","Zyyy":"Common","Zzzz":"Unknown Script"},"short":{"Cans":"UCAS","Xsux":"S-A Cuneiform"},"narrow":{}},"currency":{"long":{"ADP":"Andorran Peseta","AED":"United Arab Emirates Dirham","AFA":"Afghan Afghani (1927–2002)","AFN":"Afghan Afghani","ALK":"Albanian Lek (1946–1965)","ALL":"Albanian Lek","AMD":"Armenian Dram","ANG":"Netherlands Antillean Guilder","AOA":"Angolan Kwanza","AOK":"Angolan Kwanza (1977–1991)","AON":"Angolan New Kwanza (1990–2000)","AOR":"Angolan Readjusted Kwanza (1995–1999)","ARA":"Argentine Austral","ARL":"Argentine Peso Ley (1970–1983)","ARM":"Argentine Peso (1881–1970)","ARP":"Argentine Peso (1983–1985)","ARS":"Argentine Peso","ATS":"Austrian Schilling","AUD":"Australian Dollar","AWG":"Aruban Florin","AZM":"Azerbaijani Manat (1993–2006)","AZN":"Azerbaijani Manat","BAD":"Bosnia-Herzegovina Dinar (1992–1994)","BAM":"Bosnia-Herzegovina Convertible Mark","BAN":"Bosnia-Herzegovina New Dinar (1994–1997)","BBD":"Barbadian Dollar","BDT":"Bangladeshi Taka","BEC":"Belgian Franc (convertible)","BEF":"Belgian Franc","BEL":"Belgian Franc (financial)","BGL":"Bulgarian Hard Lev","BGM":"Bulgarian Socialist Lev","BGN":"Bulgarian Lev","BGO":"Bulgarian Lev (1879–1952)","BHD":"Bahraini Dinar","BIF":"Burundian Franc","BMD":"Bermudan Dollar","BND":"Brunei Dollar","BOB":"Bolivian Boliviano","BOL":"Bolivian Boliviano (1863–1963)","BOP":"Bolivian Peso","BOV":"Bolivian Mvdol","BRB":"Brazilian New Cruzeiro (1967–1986)","BRC":"Brazilian Cruzado (1986–1989)","BRE":"Brazilian Cruzeiro (1990–1993)","BRL":"Brazilian Real","BRN":"Brazilian New Cruzado (1989–1990)","BRR":"Brazilian Cruzeiro (1993–1994)","BRZ":"Brazilian Cruzeiro (1942–1967)","BSD":"Bahamian Dollar","BTN":"Bhutanese Ngultrum","BUK":"Burmese Kyat","BWP":"Botswanan Pula","BYB":"Belarusian Ruble (1994–1999)","BYN":"Belarusian Ruble","BYR":"Belarusian Ruble (2000–2016)","BZD":"Belize Dollar","CAD":"Canadian Dollar","CDF":"Congolese Franc","CHE":"WIR Euro","CHF":"Swiss Franc","CHW":"WIR Franc","CLE":"Chilean Escudo","CLF":"Chilean Unit of Account (UF)","CLP":"Chilean Peso","CNH":"Chinese Yuan (offshore)","CNX":"Chinese People’s Bank Dollar","CNY":"Chinese Yuan","COP":"Colombian Peso","COU":"Colombian Real Value Unit","CRC":"Costa Rican Colón","CSD":"Serbian Dinar (2002–2006)","CSK":"Czechoslovak Hard Koruna","CUC":"Cuban Convertible Peso","CUP":"Cuban Peso","CVE":"Cape Verdean Escudo","CYP":"Cypriot Pound","CZK":"Czech Koruna","DDM":"East German Mark","DEM":"German Mark","DJF":"Djiboutian Franc","DKK":"Danish Krone","DOP":"Dominican Peso","DZD":"Algerian Dinar","ECS":"Ecuadorian Sucre","ECV":"Ecuadorian Unit of Constant Value","EEK":"Estonian Kroon","EGP":"Egyptian Pound","ERN":"Eritrean Nakfa","ESA":"Spanish Peseta (A account)","ESB":"Spanish Peseta (convertible account)","ESP":"Spanish Peseta","ETB":"Ethiopian Birr","EUR":"Euro","FIM":"Finnish Markka","FJD":"Fijian Dollar","FKP":"Falkland Islands Pound","FRF":"French Franc","GBP":"British Pound","GEK":"Georgian Kupon Larit","GEL":"Georgian Lari","GHC":"Ghanaian Cedi (1979–2007)","GHS":"Ghanaian Cedi","GIP":"Gibraltar Pound","GMD":"Gambian Dalasi","GNF":"Guinean Franc","GNS":"Guinean Syli","GQE":"Equatorial Guinean Ekwele","GRD":"Greek Drachma","GTQ":"Guatemalan Quetzal","GWE":"Portuguese Guinea Escudo","GWP":"Guinea-Bissau Peso","GYD":"Guyanaese Dollar","HKD":"Hong Kong Dollar","HNL":"Honduran Lempira","HRD":"Croatian Dinar","HRK":"Croatian Kuna","HTG":"Haitian Gourde","HUF":"Hungarian Forint","IDR":"Indonesian Rupiah","IEP":"Irish Pound","ILP":"Israeli Pound","ILR":"Israeli Shekel (1980–1985)","ILS":"Israeli New Shekel","INR":"Indian Rupee","IQD":"Iraqi Dinar","IRR":"Iranian Rial","ISJ":"Icelandic Króna (1918–1981)","ISK":"Icelandic Króna","ITL":"Italian Lira","JMD":"Jamaican Dollar","JOD":"Jordanian Dinar","JPY":"Japanese Yen","KES":"Kenyan Shilling","KGS":"Kyrgystani Som","KHR":"Cambodian Riel","KMF":"Comorian Franc","KPW":"North Korean Won","KRH":"South Korean Hwan (1953–1962)","KRO":"South Korean Won (1945–1953)","KRW":"South Korean Won","KWD":"Kuwaiti Dinar","KYD":"Cayman Islands Dollar","KZT":"Kazakhstani Tenge","LAK":"Laotian Kip","LBP":"Lebanese Pound","LKR":"Sri Lankan Rupee","LRD":"Liberian Dollar","LSL":"Lesotho Loti","LTL":"Lithuanian Litas","LTT":"Lithuanian Talonas","LUC":"Luxembourgian Convertible Franc","LUF":"Luxembourgian Franc","LUL":"Luxembourg Financial Franc","LVL":"Latvian Lats","LVR":"Latvian Ruble","LYD":"Libyan Dinar","MAD":"Moroccan Dirham","MAF":"Moroccan Franc","MCF":"Monegasque Franc","MDC":"Moldovan Cupon","MDL":"Moldovan Leu","MGA":"Malagasy Ariary","MGF":"Malagasy Franc","MKD":"Macedonian Denar","MKN":"Macedonian Denar (1992–1993)","MLF":"Malian Franc","MMK":"Myanmar Kyat","MNT":"Mongolian Tugrik","MOP":"Macanese Pataca","MRO":"Mauritanian Ouguiya (1973–2017)","MRU":"Mauritanian Ouguiya","MTL":"Maltese Lira","MTP":"Maltese Pound","MUR":"Mauritian Rupee","MVP":"Maldivian Rupee (1947–1981)","MVR":"Maldivian Rufiyaa","MWK":"Malawian Kwacha","MXN":"Mexican Peso","MXP":"Mexican Silver Peso (1861–1992)","MXV":"Mexican Investment Unit","MYR":"Malaysian Ringgit","MZE":"Mozambican Escudo","MZM":"Mozambican Metical (1980–2006)","MZN":"Mozambican Metical","NAD":"Namibian Dollar","NGN":"Nigerian Naira","NIC":"Nicaraguan Córdoba (1988–1991)","NIO":"Nicaraguan Córdoba","NLG":"Dutch Guilder","NOK":"Norwegian Krone","NPR":"Nepalese Rupee","NZD":"New Zealand Dollar","OMR":"Omani Rial","PAB":"Panamanian Balboa","PEI":"Peruvian Inti","PEN":"Peruvian Sol","PES":"Peruvian Sol (1863–1965)","PGK":"Papua New Guinean Kina","PHP":"Philippine Piso","PKR":"Pakistani Rupee","PLN":"Polish Zloty","PLZ":"Polish Zloty (1950–1995)","PTE":"Portuguese Escudo","PYG":"Paraguayan Guarani","QAR":"Qatari Rial","RHD":"Rhodesian Dollar","ROL":"Romanian Leu (1952–2006)","RON":"Romanian Leu","RSD":"Serbian Dinar","RUB":"Russian Ruble","RUR":"Russian Ruble (1991–1998)","RWF":"Rwandan Franc","SAR":"Saudi Riyal","SBD":"Solomon Islands Dollar","SCR":"Seychellois Rupee","SDD":"Sudanese Dinar (1992–2007)","SDG":"Sudanese Pound","SDP":"Sudanese Pound (1957–1998)","SEK":"Swedish Krona","SGD":"Singapore Dollar","SHP":"St. Helena Pound","SIT":"Slovenian Tolar","SKK":"Slovak Koruna","SLL":"Sierra Leonean Leone","SOS":"Somali Shilling","SRD":"Surinamese Dollar","SRG":"Surinamese Guilder","SSP":"South Sudanese Pound","STD":"São Tomé & Príncipe Dobra (1977–2017)","STN":"São Tomé & Príncipe Dobra","SUR":"Soviet Rouble","SVC":"Salvadoran Colón","SYP":"Syrian Pound","SZL":"Swazi Lilangeni","THB":"Thai Baht","TJR":"Tajikistani Ruble","TJS":"Tajikistani Somoni","TMM":"Turkmenistani Manat (1993–2009)","TMT":"Turkmenistani Manat","TND":"Tunisian Dinar","TOP":"Tongan Paʻanga","TPE":"Timorese Escudo","TRL":"Turkish Lira (1922–2005)","TRY":"Turkish Lira","TTD":"Trinidad & Tobago Dollar","TWD":"New Taiwan Dollar","TZS":"Tanzanian Shilling","UAH":"Ukrainian Hryvnia","UAK":"Ukrainian Karbovanets","UGS":"Ugandan Shilling (1966–1987)","UGX":"Ugandan Shilling","USD":"US Dollar","USN":"US Dollar (Next day)","USS":"US Dollar (Same day)","UYI":"Uruguayan Peso (Indexed Units)","UYP":"Uruguayan Peso (1975–1993)","UYU":"Uruguayan Peso","UYW":"Uruguayan Nominal Wage Index Unit","UZS":"Uzbekistani Som","VEB":"Venezuelan Bolívar (1871–2008)","VEF":"Venezuelan Bolívar (2008–2018)","VES":"Venezuelan Bolívar","VND":"Vietnamese Dong","VNN":"Vietnamese Dong (1978–1985)","VUV":"Vanuatu Vatu","WST":"Samoan Tala","XAF":"Central African CFA Franc","XAG":"Silver","XAU":"Gold","XBA":"European Composite Unit","XBB":"European Monetary Unit","XBC":"European Unit of Account (XBC)","XBD":"European Unit of Account (XBD)","XCD":"East Caribbean Dollar","XDR":"Special Drawing Rights","XEU":"European Currency Unit","XFO":"French Gold Franc","XFU":"French UIC-Franc","XOF":"West African CFA Franc","XPD":"Palladium","XPF":"CFP Franc","XPT":"Platinum","XRE":"RINET Funds","XSU":"Sucre","XTS":"Testing Currency Code","XUA":"ADB Unit of Account","XXX":"Unknown Currency","YDD":"Yemeni Dinar","YER":"Yemeni Rial","YUD":"Yugoslavian Hard Dinar (1966–1990)","YUM":"Yugoslavian New Dinar (1994–2002)","YUN":"Yugoslavian Convertible Dinar (1990–1992)","YUR":"Yugoslavian Reformed Dinar (1992–1993)","ZAL":"South African Rand (financial)","ZAR":"South African Rand","ZMK":"Zambian Kwacha (1968–2012)","ZMW":"Zambian Kwacha","ZRN":"Zairean New Zaire (1993–1998)","ZRZ":"Zairean Zaire (1971–1993)","ZWD":"Zimbabwean Dollar (1980–2008)","ZWL":"Zimbabwean Dollar (2009)","ZWR":"Zimbabwean Dollar (2008)"},"short":{},"narrow":{}}},"patterns":{"locale":"{0} ({1})"}},"locale":"en"}
)
}
},{}],74:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
var should_polyfill_1 = require("./should-polyfill");
if (should_polyfill_1.shouldPolyfill()) {
    Object.defineProperty(Intl, 'DisplayNames', {
        value: _1.DisplayNames,
        enumerable: false,
        writable: true,
        configurable: true,
    });
}

},{"./":72,"./should-polyfill":75}],75:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldPolyfill = void 0;
/**
 * https://bugs.chromium.org/p/chromium/issues/detail?id=1097432
 */
function hasMissingICUBug() {
    if (Intl.DisplayNames) {
        var regionNames = new Intl.DisplayNames(['en'], {
            type: 'region',
        });
        return regionNames.of('CA') === 'CA';
    }
    return false;
}
function shouldPolyfill() {
    return !Intl.DisplayNames || hasMissingICUBug();
}
exports.shouldPolyfill = shouldPolyfill;

},{}],76:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUnicodeLanguageSubtag = exports.isUnicodeScriptSubtag = exports.isUnicodeRegionSubtag = exports.isStructurallyValidLanguageTag = exports.parseUnicodeLanguageId = exports.parseUnicodeLocaleId = exports.getCanonicalLocales = void 0;
var tslib_1 = require("tslib");
var parser_1 = require("./src/parser");
var emitter_1 = require("./src/emitter");
var canonicalizer_1 = require("./src/canonicalizer");
/**
 * https://tc39.es/ecma402/#sec-canonicalizelocalelist
 * @param locales
 */
function CanonicalizeLocaleList(locales) {
    if (locales === undefined) {
        return [];
    }
    var seen = [];
    if (typeof locales === 'string') {
        locales = [locales];
    }
    for (var _i = 0, locales_1 = locales; _i < locales_1.length; _i++) {
        var locale = locales_1[_i];
        var canonicalizedTag = emitter_1.emitUnicodeLocaleId(canonicalizer_1.canonicalizeUnicodeLocaleId(parser_1.parseUnicodeLocaleId(locale)));
        if (seen.indexOf(canonicalizedTag) < 0) {
            seen.push(canonicalizedTag);
        }
    }
    return seen;
}
function getCanonicalLocales(locales) {
    return CanonicalizeLocaleList(locales);
}
exports.getCanonicalLocales = getCanonicalLocales;
var parser_2 = require("./src/parser");
Object.defineProperty(exports, "parseUnicodeLocaleId", { enumerable: true, get: function () { return parser_2.parseUnicodeLocaleId; } });
Object.defineProperty(exports, "parseUnicodeLanguageId", { enumerable: true, get: function () { return parser_2.parseUnicodeLanguageId; } });
Object.defineProperty(exports, "isStructurallyValidLanguageTag", { enumerable: true, get: function () { return parser_2.isStructurallyValidLanguageTag; } });
Object.defineProperty(exports, "isUnicodeRegionSubtag", { enumerable: true, get: function () { return parser_2.isUnicodeRegionSubtag; } });
Object.defineProperty(exports, "isUnicodeScriptSubtag", { enumerable: true, get: function () { return parser_2.isUnicodeScriptSubtag; } });
Object.defineProperty(exports, "isUnicodeLanguageSubtag", { enumerable: true, get: function () { return parser_2.isUnicodeLanguageSubtag; } });
tslib_1.__exportStar(require("./src/types"), exports);
tslib_1.__exportStar(require("./src/emitter"), exports);

},{"./src/canonicalizer":77,"./src/emitter":79,"./src/parser":80,"./src/types":81,"tslib":88}],77:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canonicalizeUnicodeLocaleId = exports.canonicalizeUnicodeLanguageId = void 0;
var tslib_1 = require("tslib");
var aliases_1 = require("./data/aliases");
var parser_1 = require("./parser");
var likelySubtags = tslib_1.__importStar(require("cldr-core/supplemental/likelySubtags.json"));
var emitter_1 = require("./emitter");
function canonicalizeAttrs(strs) {
    return Object.keys(strs.reduce(function (all, str) {
        all[str.toLowerCase()] = 1;
        return all;
    }, {})).sort();
}
function canonicalizeKVs(arr) {
    var all = {};
    var result = [];
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var kv = arr_1[_i];
        if (kv[0] in all) {
            continue;
        }
        all[kv[0]] = 1;
        if (!kv[1] || kv[1] === 'true') {
            result.push([kv[0].toLowerCase()]);
        }
        else {
            result.push([kv[0].toLowerCase(), kv[1].toLowerCase()]);
        }
    }
    return result.sort(compareKV);
}
function compareKV(t1, t2) {
    return t1[0] < t2[0] ? -1 : t1[0] > t2[0] ? 1 : 0;
}
function compareExtension(e1, e2) {
    return e1.type < e2.type ? -1 : e1.type > e2.type ? 1 : 0;
}
function mergeVariants(v1, v2) {
    var result = tslib_1.__spreadArrays(v1);
    for (var _i = 0, v2_1 = v2; _i < v2_1.length; _i++) {
        var v = v2_1[_i];
        if (v1.indexOf(v) < 0) {
            result.push(v);
        }
    }
    return result;
}
/**
 * CAVEAT: We don't do this section in the spec bc they have no JSON data
 * Use the bcp47 data to replace keys, types, tfields, and tvalues by their canonical forms. See Section 3.6.4 U Extension Data Files) and Section 3.7.1 T Extension Data Files. The aliases are in the alias attribute value, while the canonical is in the name attribute value. For example,
Because of the following bcp47 data:
<key name="ms"…>…<type name="uksystem" … alias="imperial" … />…</key>
We get the following transformation:
en-u-ms-imperial ⇒ en-u-ms-uksystem
 * @param lang
 */
function canonicalizeUnicodeLanguageId(unicodeLanguageId) {
    /**
     * If the language subtag matches the type attribute of a languageAlias element in Supplemental Data, replace the language subtag with the replacement value.
     *  1. If there are additional subtags in the replacement value, add them to the result, but only if there is no corresponding subtag already in the tag.
     *  2. Five special deprecated grandfathered codes (such as i-default) are in type attributes, and are also replaced.
     */
    // From https://github.com/unicode-org/icu/blob/master/icu4j/main/classes/core/src/com/ibm/icu/util/ULocale.java#L1246
    // Try language _ variant
    var finalLangAst = unicodeLanguageId;
    if (unicodeLanguageId.variants.length) {
        var replacedLang_1 = '';
        for (var _i = 0, _a = unicodeLanguageId.variants; _i < _a.length; _i++) {
            var variant = _a[_i];
            if ((replacedLang_1 =
                aliases_1.languageAlias[emitter_1.emitUnicodeLanguageId({
                    lang: unicodeLanguageId.lang,
                    variants: [variant],
                })])) {
                var replacedLangAst = parser_1.parseUnicodeLanguageId(replacedLang_1.split(parser_1.SEPARATOR));
                finalLangAst = {
                    lang: replacedLangAst.lang,
                    script: finalLangAst.script || replacedLangAst.script,
                    region: finalLangAst.region || replacedLangAst.region,
                    variants: mergeVariants(finalLangAst.variants, replacedLangAst.variants),
                };
                break;
            }
        }
    }
    // language _ script _ country
    // ug-Arab-CN -> ug-CN
    if (finalLangAst.script && finalLangAst.region) {
        var replacedLang_2 = aliases_1.languageAlias[emitter_1.emitUnicodeLanguageId({
            lang: finalLangAst.lang,
            script: finalLangAst.script,
            region: finalLangAst.region,
            variants: [],
        })];
        if (replacedLang_2) {
            var replacedLangAst = parser_1.parseUnicodeLanguageId(replacedLang_2.split(parser_1.SEPARATOR));
            finalLangAst = {
                lang: replacedLangAst.lang,
                script: replacedLangAst.script,
                region: replacedLangAst.region,
                variants: finalLangAst.variants,
            };
        }
    }
    // language _ country
    // eg. az_AZ -> az_Latn_A
    if (finalLangAst.region) {
        var replacedLang_3 = aliases_1.languageAlias[emitter_1.emitUnicodeLanguageId({
            lang: finalLangAst.lang,
            region: finalLangAst.region,
            variants: [],
        })];
        if (replacedLang_3) {
            var replacedLangAst = parser_1.parseUnicodeLanguageId(replacedLang_3.split(parser_1.SEPARATOR));
            finalLangAst = {
                lang: replacedLangAst.lang,
                script: finalLangAst.script || replacedLangAst.script,
                region: replacedLangAst.region,
                variants: finalLangAst.variants,
            };
        }
    }
    // only language
    // e.g. twi -> ak
    var replacedLang = aliases_1.languageAlias[emitter_1.emitUnicodeLanguageId({
        lang: finalLangAst.lang,
        variants: [],
    })];
    if (replacedLang) {
        var replacedLangAst = parser_1.parseUnicodeLanguageId(replacedLang.split(parser_1.SEPARATOR));
        finalLangAst = {
            lang: replacedLangAst.lang,
            script: finalLangAst.script || replacedLangAst.script,
            region: finalLangAst.region || replacedLangAst.region,
            variants: finalLangAst.variants,
        };
    }
    if (finalLangAst.region) {
        var region = finalLangAst.region.toUpperCase();
        var regionAlias = aliases_1.territoryAlias[region];
        var replacedRegion = void 0;
        if (regionAlias) {
            var regions = regionAlias.split(' ');
            replacedRegion = regions[0];
            var likelySubtag = likelySubtags.supplemental.likelySubtags[emitter_1.emitUnicodeLanguageId({
                lang: finalLangAst.lang,
                script: finalLangAst.script,
                variants: [],
            })];
            if (likelySubtag) {
                var likelyRegion = parser_1.parseUnicodeLanguageId(likelySubtag.split(parser_1.SEPARATOR)).region;
                if (likelyRegion && regions.indexOf(likelyRegion) > -1) {
                    replacedRegion = likelyRegion;
                }
            }
        }
        if (replacedRegion) {
            finalLangAst.region = replacedRegion;
        }
        finalLangAst.region = finalLangAst.region.toUpperCase();
    }
    if (finalLangAst.script) {
        finalLangAst.script =
            finalLangAst.script[0].toUpperCase() +
                finalLangAst.script.slice(1).toLowerCase();
        if (aliases_1.scriptAlias[finalLangAst.script]) {
            finalLangAst.script = aliases_1.scriptAlias[finalLangAst.script];
        }
    }
    if (finalLangAst.variants.length) {
        for (var i = 0; i < finalLangAst.variants.length; i++) {
            var variant = finalLangAst.variants[i].toLowerCase();
            if (aliases_1.variantAlias[variant]) {
                var alias = aliases_1.variantAlias[variant];
                if (parser_1.isUnicodeVariantSubtag(alias)) {
                    finalLangAst.variants[i] = alias;
                }
                else if (parser_1.isUnicodeLanguageSubtag(alias)) {
                    // Yes this can happen per the spec
                    finalLangAst.lang = alias;
                }
            }
        }
        finalLangAst.variants.sort();
    }
    return finalLangAst;
}
exports.canonicalizeUnicodeLanguageId = canonicalizeUnicodeLanguageId;
/**
 * Canonicalize based on
 * https://www.unicode.org/reports/tr35/tr35.html#Canonical_Unicode_Locale_Identifiers
 * https://tc39.es/ecma402/#sec-canonicalizeunicodelocaleid
 * IMPORTANT: This modifies the object inline
 * @param locale
 */
function canonicalizeUnicodeLocaleId(locale) {
    locale.lang = canonicalizeUnicodeLanguageId(locale.lang);
    if (locale.extensions) {
        for (var _i = 0, _a = locale.extensions; _i < _a.length; _i++) {
            var extension = _a[_i];
            switch (extension.type) {
                case 'u':
                    extension.keywords = canonicalizeKVs(extension.keywords);
                    if (extension.attributes) {
                        extension.attributes = canonicalizeAttrs(extension.attributes);
                    }
                    break;
                case 't':
                    if (extension.lang) {
                        extension.lang = canonicalizeUnicodeLanguageId(extension.lang);
                    }
                    extension.fields = canonicalizeKVs(extension.fields);
                    break;
                default:
                    extension.value = extension.value.toLowerCase();
                    break;
            }
        }
        locale.extensions.sort(compareExtension);
    }
    return locale;
}
exports.canonicalizeUnicodeLocaleId = canonicalizeUnicodeLocaleId;

},{"./data/aliases":78,"./emitter":79,"./parser":80,"cldr-core/supplemental/likelySubtags.json":86,"tslib":88}],78:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.variantAlias = exports.scriptAlias = exports.territoryAlias = exports.languageAlias = void 0;
/* @generated */
// prettier-ignore  
exports.languageAlias = {
    "aa-saaho": "ssy",
    "aam": "aas",
    "aar": "aa",
    "abk": "ab",
    "adp": "dz",
    "afr": "af",
    "agp": "apf",
    "ais": "ami",
    "aju": "jrb",
    "aka": "ak",
    "alb": "sq",
    "als": "sq",
    "amh": "am",
    "ara": "ar",
    "arb": "ar",
    "arg": "an",
    "arm": "hy",
    "art-lojban": "jbo",
    "asd": "snz",
    "asm": "as",
    "aue": "ktz",
    "ava": "av",
    "ave": "ae",
    "aym": "ay",
    "ayr": "ay",
    "ayx": "nun",
    "aze": "az",
    "azj": "az",
    "bak": "ba",
    "bam": "bm",
    "baq": "eu",
    "baz": "nvo",
    "bcc": "bal",
    "bcl": "bik",
    "bel": "be",
    "ben": "bn",
    "bgm": "bcg",
    "bh": "bho",
    "bhk": "fbl",
    "bih": "bho",
    "bis": "bi",
    "bjd": "drl",
    "bjq": "bzc",
    "bkb": "ebk",
    "bod": "bo",
    "bos": "bs",
    "bre": "br",
    "btb": "beb",
    "bul": "bg",
    "bur": "my",
    "bxk": "luy",
    "bxr": "bua",
    "cat": "ca",
    "ccq": "rki",
    "cel-gaulish": "xtg",
    "ces": "cs",
    "cha": "ch",
    "che": "ce",
    "chi": "zh",
    "chu": "cu",
    "chv": "cv",
    "cjr": "mom",
    "cka": "cmr",
    "cld": "syr",
    "cmk": "xch",
    "cmn": "zh",
    "cnr": "sr-ME",
    "cor": "kw",
    "cos": "co",
    "coy": "pij",
    "cqu": "quh",
    "cre": "cr",
    "cwd": "cr",
    "cym": "cy",
    "cze": "cs",
    "daf": "dnj",
    "dan": "da",
    "dap": "njz",
    "deu": "de",
    "dgo": "doi",
    "dhd": "mwr",
    "dik": "din",
    "diq": "zza",
    "dit": "dif",
    "div": "dv",
    "djl": "dze",
    "dkl": "aqd",
    "drh": "mn",
    "drr": "kzk",
    "drw": "fa-AF",
    "dud": "uth",
    "duj": "dwu",
    "dut": "nl",
    "dwl": "dbt",
    "dzo": "dz",
    "ekk": "et",
    "ell": "el",
    "elp": "amq",
    "emk": "man",
    "en-GB-oed": "en-GB-oxendict",
    "eng": "en",
    "epo": "eo",
    "esk": "ik",
    "est": "et",
    "eus": "eu",
    "ewe": "ee",
    "fao": "fo",
    "fas": "fa",
    "fat": "ak",
    "fij": "fj",
    "fin": "fi",
    "fra": "fr",
    "fre": "fr",
    "fry": "fy",
    "fuc": "ff",
    "ful": "ff",
    "gav": "dev",
    "gaz": "om",
    "gbc": "wny",
    "gbo": "grb",
    "geo": "ka",
    "ger": "de",
    "gfx": "vaj",
    "ggn": "gvr",
    "ggo": "esg",
    "ggr": "gtu",
    "gio": "aou",
    "gla": "gd",
    "gle": "ga",
    "glg": "gl",
    "gli": "kzk",
    "glv": "gv",
    "gno": "gon",
    "gre": "el",
    "grn": "gn",
    "gti": "nyc",
    "gug": "gn",
    "guj": "gu",
    "guv": "duz",
    "gya": "gba",
    "hat": "ht",
    "hau": "ha",
    "hbs": "sr-Latn",
    "hdn": "hai",
    "hea": "hmn",
    "heb": "he",
    "her": "hz",
    "him": "srx",
    "hin": "hi",
    "hmo": "ho",
    "hrr": "jal",
    "hrv": "hr",
    "hun": "hu",
    "hy-arevmda": "hyw",
    "hye": "hy",
    "i-ami": "ami",
    "i-bnn": "bnn",
    "i-default": "en-x-i-default",
    "i-enochian": "und-x-i-enochian",
    "i-hak": "hak",
    "i-klingon": "tlh",
    "i-lux": "lb",
    "i-mingo": "see-x-i-mingo",
    "i-navajo": "nv",
    "i-pwn": "pwn",
    "i-tao": "tao",
    "i-tay": "tay",
    "i-tsu": "tsu",
    "ibi": "opa",
    "ibo": "ig",
    "ice": "is",
    "ido": "io",
    "iii": "ii",
    "ike": "iu",
    "iku": "iu",
    "ile": "ie",
    "ill": "ilm",
    "ilw": "gal",
    "in": "id",
    "ina": "ia",
    "ind": "id",
    "ipk": "ik",
    "isl": "is",
    "ita": "it",
    "iw": "he",
    "izi": "eza",
    "jar": "jgk",
    "jav": "jv",
    "jeg": "oyb",
    "ji": "yi",
    "jpn": "ja",
    "jw": "jv",
    "kal": "kl",
    "kan": "kn",
    "kas": "ks",
    "kat": "ka",
    "kau": "kr",
    "kaz": "kk",
    "kdv": "zkd",
    "kgc": "tdf",
    "kgd": "ncq",
    "kgh": "kml",
    "khk": "mn",
    "khm": "km",
    "kik": "ki",
    "kin": "rw",
    "kir": "ky",
    "kmr": "ku",
    "knc": "kr",
    "kng": "kg",
    "knn": "kok",
    "koj": "kwv",
    "kom": "kv",
    "kon": "kg",
    "kor": "ko",
    "kpp": "jkm",
    "kpv": "kv",
    "krm": "bmf",
    "ktr": "dtp",
    "kua": "kj",
    "kur": "ku",
    "kvs": "gdj",
    "kwq": "yam",
    "kxe": "tvd",
    "kxl": "kru",
    "kzh": "dgl",
    "kzj": "dtp",
    "kzt": "dtp",
    "lao": "lo",
    "lat": "la",
    "lav": "lv",
    "lbk": "bnc",
    "leg": "enl",
    "lii": "raq",
    "lim": "li",
    "lin": "ln",
    "lit": "lt",
    "llo": "ngt",
    "lmm": "rmx",
    "ltz": "lb",
    "lub": "lu",
    "lug": "lg",
    "lvs": "lv",
    "mac": "mk",
    "mah": "mh",
    "mal": "ml",
    "mao": "mi",
    "mar": "mr",
    "may": "ms",
    "meg": "cir",
    "mgx": "jbk",
    "mhr": "chm",
    "mkd": "mk",
    "mlg": "mg",
    "mlt": "mt",
    "mnk": "man",
    "mnt": "wnn",
    "mo": "ro",
    "mof": "xnt",
    "mol": "ro",
    "mon": "mn",
    "mri": "mi",
    "msa": "ms",
    "mst": "mry",
    "mup": "raj",
    "mwd": "dmw",
    "mwj": "vaj",
    "mya": "my",
    "myd": "aog",
    "myt": "mry",
    "nad": "xny",
    "nau": "na",
    "nav": "nv",
    "nbf": "nru",
    "nbl": "nr",
    "nbx": "ekc",
    "ncp": "kdz",
    "nde": "nd",
    "ndo": "ng",
    "nep": "ne",
    "nld": "nl",
    "nln": "azd",
    "nlr": "nrk",
    "nno": "nn",
    "nns": "nbr",
    "nnx": "ngv",
    "no": "nb",
    "no-bok": "nb",
    "no-bokmal": "nb",
    "no-nyn": "nn",
    "no-nynorsk": "nn",
    "nob": "nb",
    "noo": "dtd",
    "nor": "nb",
    "npi": "ne",
    "nts": "pij",
    "nxu": "bpp",
    "nya": "ny",
    "oci": "oc",
    "ojg": "oj",
    "oji": "oj",
    "ori": "or",
    "orm": "om",
    "ory": "or",
    "oss": "os",
    "oun": "vaj",
    "pan": "pa",
    "pbu": "ps",
    "pcr": "adx",
    "per": "fa",
    "pes": "fa",
    "pli": "pi",
    "plt": "mg",
    "pmc": "huw",
    "pmu": "phr",
    "pnb": "lah",
    "pol": "pl",
    "por": "pt",
    "ppa": "bfy",
    "ppr": "lcq",
    "prs": "fa-AF",
    "pry": "prt",
    "pus": "ps",
    "puz": "pub",
    "que": "qu",
    "quz": "qu",
    "rmr": "emx",
    "rmy": "rom",
    "roh": "rm",
    "ron": "ro",
    "rum": "ro",
    "run": "rn",
    "rus": "ru",
    "sag": "sg",
    "san": "sa",
    "sap": "aqt",
    "sca": "hle",
    "scc": "sr",
    "scr": "hr",
    "sgl": "isk",
    "sgn-BE-FR": "sfb",
    "sgn-BE-NL": "vgt",
    "sgn-BR": "bzs",
    "sgn-CH-DE": "sgg",
    "sgn-CO": "csn",
    "sgn-DE": "gsg",
    "sgn-DK": "dsl",
    "sgn-ES": "ssp",
    "sgn-FR": "fsl",
    "sgn-GB": "bfi",
    "sgn-GR": "gss",
    "sgn-IE": "isg",
    "sgn-IT": "ise",
    "sgn-JP": "jsl",
    "sgn-MX": "mfs",
    "sgn-NI": "ncs",
    "sgn-NL": "dse",
    "sgn-NO": "nsi",
    "sgn-PT": "psr",
    "sgn-SE": "swl",
    "sgn-US": "ase",
    "sgn-ZA": "sfs",
    "sh": "sr-Latn",
    "sin": "si",
    "skk": "oyb",
    "slk": "sk",
    "slo": "sk",
    "slv": "sl",
    "sme": "se",
    "smo": "sm",
    "sna": "sn",
    "snd": "sd",
    "som": "so",
    "sot": "st",
    "spa": "es",
    "spy": "kln",
    "sqi": "sq",
    "src": "sc",
    "srd": "sc",
    "srp": "sr",
    "ssw": "ss",
    "sul": "sgd",
    "sum": "ulw",
    "sun": "su",
    "swa": "sw",
    "swc": "sw-CD",
    "swe": "sv",
    "swh": "sw",
    "tah": "ty",
    "tam": "ta",
    "tat": "tt",
    "tdu": "dtp",
    "tel": "te",
    "tgg": "bjp",
    "tgk": "tg",
    "tgl": "fil",
    "tha": "th",
    "thc": "tpo",
    "thw": "ola",
    "thx": "oyb",
    "tib": "bo",
    "tid": "itd",
    "tie": "ras",
    "tir": "ti",
    "tkk": "twm",
    "tl": "fil",
    "tlw": "weo",
    "tmp": "tyj",
    "tne": "kak",
    "tnf": "fa-AF",
    "ton": "to",
    "tsf": "taj",
    "tsn": "tn",
    "tso": "ts",
    "ttq": "tmh",
    "tuk": "tk",
    "tur": "tr",
    "tw": "ak",
    "twi": "ak",
    "uig": "ug",
    "ukr": "uk",
    "umu": "del",
    "und-aaland": "und-AX",
    "und-arevela": "und",
    "und-arevmda": "und",
    "und-bokmal": "und",
    "und-hakka": "und",
    "und-hepburn-heploc": "und-alalc97",
    "und-lojban": "und",
    "und-nynorsk": "und",
    "und-saaho": "und",
    "und-xiang": "und",
    "unp": "wro",
    "uok": "ema",
    "urd": "ur",
    "uzb": "uz",
    "uzn": "uz",
    "ven": "ve",
    "vie": "vi",
    "vol": "vo",
    "wel": "cy",
    "wgw": "wgb",
    "wit": "nol",
    "wiw": "nwo",
    "wln": "wa",
    "wol": "wo",
    "xba": "cax",
    "xho": "xh",
    "xia": "acn",
    "xkh": "waw",
    "xpe": "kpe",
    "xrq": "dmw",
    "xsj": "suj",
    "xsl": "den",
    "ybd": "rki",
    "ydd": "yi",
    "yen": "ynq",
    "yid": "yi",
    "yiy": "yrm",
    "yma": "lrr",
    "ymt": "mtm",
    "yor": "yo",
    "yos": "zom",
    "yuu": "yug",
    "zai": "zap",
    "zh-cmn": "zh",
    "zh-cmn-Hans": "zh-Hans",
    "zh-cmn-Hant": "zh-Hant",
    "zh-gan": "gan",
    "zh-guoyu": "zh",
    "zh-hakka": "hak",
    "zh-min": "nan-x-zh-min",
    "zh-min-nan": "nan",
    "zh-wuu": "wuu",
    "zh-xiang": "hsn",
    "zh-yue": "yue",
    "zha": "za",
    "zho": "zh",
    "zir": "scv",
    "zsm": "ms",
    "zul": "zu",
    "zyb": "za"
};
exports.territoryAlias = {
    "100": "BG",
    "104": "MM",
    "108": "BI",
    "112": "BY",
    "116": "KH",
    "120": "CM",
    "124": "CA",
    "132": "CV",
    "136": "KY",
    "140": "CF",
    "144": "LK",
    "148": "TD",
    "152": "CL",
    "156": "CN",
    "158": "TW",
    "162": "CX",
    "166": "CC",
    "170": "CO",
    "172": "RU AM AZ BY GE KG KZ MD TJ TM UA UZ",
    "174": "KM",
    "175": "YT",
    "178": "CG",
    "180": "CD",
    "184": "CK",
    "188": "CR",
    "191": "HR",
    "192": "CU",
    "196": "CY",
    "200": "CZ SK",
    "203": "CZ",
    "204": "BJ",
    "208": "DK",
    "212": "DM",
    "214": "DO",
    "218": "EC",
    "222": "SV",
    "226": "GQ",
    "230": "ET",
    "231": "ET",
    "232": "ER",
    "233": "EE",
    "234": "FO",
    "238": "FK",
    "239": "GS",
    "242": "FJ",
    "246": "FI",
    "248": "AX",
    "249": "FR",
    "250": "FR",
    "254": "GF",
    "258": "PF",
    "260": "TF",
    "262": "DJ",
    "266": "GA",
    "268": "GE",
    "270": "GM",
    "275": "PS",
    "276": "DE",
    "278": "DE",
    "280": "DE",
    "288": "GH",
    "292": "GI",
    "296": "KI",
    "300": "GR",
    "304": "GL",
    "308": "GD",
    "312": "GP",
    "316": "GU",
    "320": "GT",
    "324": "GN",
    "328": "GY",
    "332": "HT",
    "334": "HM",
    "336": "VA",
    "340": "HN",
    "344": "HK",
    "348": "HU",
    "352": "IS",
    "356": "IN",
    "360": "ID",
    "364": "IR",
    "368": "IQ",
    "372": "IE",
    "376": "IL",
    "380": "IT",
    "384": "CI",
    "388": "JM",
    "392": "JP",
    "398": "KZ",
    "400": "JO",
    "404": "KE",
    "408": "KP",
    "410": "KR",
    "414": "KW",
    "417": "KG",
    "418": "LA",
    "422": "LB",
    "426": "LS",
    "428": "LV",
    "430": "LR",
    "434": "LY",
    "438": "LI",
    "440": "LT",
    "442": "LU",
    "446": "MO",
    "450": "MG",
    "454": "MW",
    "458": "MY",
    "462": "MV",
    "466": "ML",
    "470": "MT",
    "474": "MQ",
    "478": "MR",
    "480": "MU",
    "484": "MX",
    "492": "MC",
    "496": "MN",
    "498": "MD",
    "499": "ME",
    "500": "MS",
    "504": "MA",
    "508": "MZ",
    "512": "OM",
    "516": "NA",
    "520": "NR",
    "524": "NP",
    "528": "NL",
    "530": "CW SX BQ",
    "531": "CW",
    "532": "CW SX BQ",
    "533": "AW",
    "534": "SX",
    "535": "BQ",
    "536": "SA IQ",
    "540": "NC",
    "548": "VU",
    "554": "NZ",
    "558": "NI",
    "562": "NE",
    "566": "NG",
    "570": "NU",
    "574": "NF",
    "578": "NO",
    "580": "MP",
    "581": "UM",
    "582": "FM MH MP PW",
    "583": "FM",
    "584": "MH",
    "585": "PW",
    "586": "PK",
    "591": "PA",
    "598": "PG",
    "600": "PY",
    "604": "PE",
    "608": "PH",
    "612": "PN",
    "616": "PL",
    "620": "PT",
    "624": "GW",
    "626": "TL",
    "630": "PR",
    "634": "QA",
    "638": "RE",
    "642": "RO",
    "643": "RU",
    "646": "RW",
    "652": "BL",
    "654": "SH",
    "659": "KN",
    "660": "AI",
    "662": "LC",
    "663": "MF",
    "666": "PM",
    "670": "VC",
    "674": "SM",
    "678": "ST",
    "682": "SA",
    "686": "SN",
    "688": "RS",
    "690": "SC",
    "694": "SL",
    "702": "SG",
    "703": "SK",
    "704": "VN",
    "705": "SI",
    "706": "SO",
    "710": "ZA",
    "716": "ZW",
    "720": "YE",
    "724": "ES",
    "728": "SS",
    "729": "SD",
    "732": "EH",
    "736": "SD",
    "740": "SR",
    "744": "SJ",
    "748": "SZ",
    "752": "SE",
    "756": "CH",
    "760": "SY",
    "762": "TJ",
    "764": "TH",
    "768": "TG",
    "772": "TK",
    "776": "TO",
    "780": "TT",
    "784": "AE",
    "788": "TN",
    "792": "TR",
    "795": "TM",
    "796": "TC",
    "798": "TV",
    "800": "UG",
    "804": "UA",
    "807": "MK",
    "810": "RU AM AZ BY EE GE KZ KG LV LT MD TJ TM UA UZ",
    "818": "EG",
    "826": "GB",
    "830": "JE GG",
    "831": "GG",
    "832": "JE",
    "833": "IM",
    "834": "TZ",
    "840": "US",
    "850": "VI",
    "854": "BF",
    "858": "UY",
    "860": "UZ",
    "862": "VE",
    "876": "WF",
    "882": "WS",
    "886": "YE",
    "887": "YE",
    "890": "RS ME SI HR MK BA",
    "891": "RS ME",
    "894": "ZM",
    "958": "AA",
    "959": "QM",
    "960": "QN",
    "962": "QP",
    "963": "QQ",
    "964": "QR",
    "965": "QS",
    "966": "QT",
    "967": "EU",
    "968": "QV",
    "969": "QW",
    "970": "QX",
    "971": "QY",
    "972": "QZ",
    "973": "XA",
    "974": "XB",
    "975": "XC",
    "976": "XD",
    "977": "XE",
    "978": "XF",
    "979": "XG",
    "980": "XH",
    "981": "XI",
    "982": "XJ",
    "983": "XK",
    "984": "XL",
    "985": "XM",
    "986": "XN",
    "987": "XO",
    "988": "XP",
    "989": "XQ",
    "990": "XR",
    "991": "XS",
    "992": "XT",
    "993": "XU",
    "994": "XV",
    "995": "XW",
    "996": "XX",
    "997": "XY",
    "998": "XZ",
    "999": "ZZ",
    "004": "AF",
    "008": "AL",
    "010": "AQ",
    "012": "DZ",
    "016": "AS",
    "020": "AD",
    "024": "AO",
    "028": "AG",
    "031": "AZ",
    "032": "AR",
    "036": "AU",
    "040": "AT",
    "044": "BS",
    "048": "BH",
    "050": "BD",
    "051": "AM",
    "052": "BB",
    "056": "BE",
    "060": "BM",
    "062": "034 143",
    "064": "BT",
    "068": "BO",
    "070": "BA",
    "072": "BW",
    "074": "BV",
    "076": "BR",
    "084": "BZ",
    "086": "IO",
    "090": "SB",
    "092": "VG",
    "096": "BN",
    "AAA": "AA",
    "ABW": "AW",
    "AFG": "AF",
    "AGO": "AO",
    "AIA": "AI",
    "ALA": "AX",
    "ALB": "AL",
    "AN": "CW SX BQ",
    "AND": "AD",
    "ANT": "CW SX BQ",
    "ARE": "AE",
    "ARG": "AR",
    "ARM": "AM",
    "ASC": "AC",
    "ASM": "AS",
    "ATA": "AQ",
    "ATF": "TF",
    "ATG": "AG",
    "AUS": "AU",
    "AUT": "AT",
    "AZE": "AZ",
    "BDI": "BI",
    "BEL": "BE",
    "BEN": "BJ",
    "BES": "BQ",
    "BFA": "BF",
    "BGD": "BD",
    "BGR": "BG",
    "BHR": "BH",
    "BHS": "BS",
    "BIH": "BA",
    "BLM": "BL",
    "BLR": "BY",
    "BLZ": "BZ",
    "BMU": "BM",
    "BOL": "BO",
    "BRA": "BR",
    "BRB": "BB",
    "BRN": "BN",
    "BTN": "BT",
    "BU": "MM",
    "BUR": "MM",
    "BVT": "BV",
    "BWA": "BW",
    "CAF": "CF",
    "CAN": "CA",
    "CCK": "CC",
    "CHE": "CH",
    "CHL": "CL",
    "CHN": "CN",
    "CIV": "CI",
    "CMR": "CM",
    "COD": "CD",
    "COG": "CG",
    "COK": "CK",
    "COL": "CO",
    "COM": "KM",
    "CPT": "CP",
    "CPV": "CV",
    "CRI": "CR",
    "CS": "RS ME",
    "CT": "KI",
    "CUB": "CU",
    "CUW": "CW",
    "CXR": "CX",
    "CYM": "KY",
    "CYP": "CY",
    "CZE": "CZ",
    "DD": "DE",
    "DDR": "DE",
    "DEU": "DE",
    "DGA": "DG",
    "DJI": "DJ",
    "DMA": "DM",
    "DNK": "DK",
    "DOM": "DO",
    "DY": "BJ",
    "DZA": "DZ",
    "ECU": "EC",
    "EGY": "EG",
    "ERI": "ER",
    "ESH": "EH",
    "ESP": "ES",
    "EST": "EE",
    "ETH": "ET",
    "FIN": "FI",
    "FJI": "FJ",
    "FLK": "FK",
    "FQ": "AQ TF",
    "FRA": "FR",
    "FRO": "FO",
    "FSM": "FM",
    "FX": "FR",
    "FXX": "FR",
    "GAB": "GA",
    "GBR": "GB",
    "GEO": "GE",
    "GGY": "GG",
    "GHA": "GH",
    "GIB": "GI",
    "GIN": "GN",
    "GLP": "GP",
    "GMB": "GM",
    "GNB": "GW",
    "GNQ": "GQ",
    "GRC": "GR",
    "GRD": "GD",
    "GRL": "GL",
    "GTM": "GT",
    "GUF": "GF",
    "GUM": "GU",
    "GUY": "GY",
    "HKG": "HK",
    "HMD": "HM",
    "HND": "HN",
    "HRV": "HR",
    "HTI": "HT",
    "HUN": "HU",
    "HV": "BF",
    "IDN": "ID",
    "IMN": "IM",
    "IND": "IN",
    "IOT": "IO",
    "IRL": "IE",
    "IRN": "IR",
    "IRQ": "IQ",
    "ISL": "IS",
    "ISR": "IL",
    "ITA": "IT",
    "JAM": "JM",
    "JEY": "JE",
    "JOR": "JO",
    "JPN": "JP",
    "JT": "UM",
    "KAZ": "KZ",
    "KEN": "KE",
    "KGZ": "KG",
    "KHM": "KH",
    "KIR": "KI",
    "KNA": "KN",
    "KOR": "KR",
    "KWT": "KW",
    "LAO": "LA",
    "LBN": "LB",
    "LBR": "LR",
    "LBY": "LY",
    "LCA": "LC",
    "LIE": "LI",
    "LKA": "LK",
    "LSO": "LS",
    "LTU": "LT",
    "LUX": "LU",
    "LVA": "LV",
    "MAC": "MO",
    "MAF": "MF",
    "MAR": "MA",
    "MCO": "MC",
    "MDA": "MD",
    "MDG": "MG",
    "MDV": "MV",
    "MEX": "MX",
    "MHL": "MH",
    "MI": "UM",
    "MKD": "MK",
    "MLI": "ML",
    "MLT": "MT",
    "MMR": "MM",
    "MNE": "ME",
    "MNG": "MN",
    "MNP": "MP",
    "MOZ": "MZ",
    "MRT": "MR",
    "MSR": "MS",
    "MTQ": "MQ",
    "MUS": "MU",
    "MWI": "MW",
    "MYS": "MY",
    "MYT": "YT",
    "NAM": "NA",
    "NCL": "NC",
    "NER": "NE",
    "NFK": "NF",
    "NGA": "NG",
    "NH": "VU",
    "NIC": "NI",
    "NIU": "NU",
    "NLD": "NL",
    "NOR": "NO",
    "NPL": "NP",
    "NQ": "AQ",
    "NRU": "NR",
    "NT": "SA IQ",
    "NTZ": "SA IQ",
    "NZL": "NZ",
    "OMN": "OM",
    "PAK": "PK",
    "PAN": "PA",
    "PC": "FM MH MP PW",
    "PCN": "PN",
    "PER": "PE",
    "PHL": "PH",
    "PLW": "PW",
    "PNG": "PG",
    "POL": "PL",
    "PRI": "PR",
    "PRK": "KP",
    "PRT": "PT",
    "PRY": "PY",
    "PSE": "PS",
    "PU": "UM",
    "PYF": "PF",
    "PZ": "PA",
    "QAT": "QA",
    "QMM": "QM",
    "QNN": "QN",
    "QPP": "QP",
    "QQQ": "QQ",
    "QRR": "QR",
    "QSS": "QS",
    "QTT": "QT",
    "QU": "EU",
    "QUU": "EU",
    "QVV": "QV",
    "QWW": "QW",
    "QXX": "QX",
    "QYY": "QY",
    "QZZ": "QZ",
    "REU": "RE",
    "RH": "ZW",
    "ROU": "RO",
    "RUS": "RU",
    "RWA": "RW",
    "SAU": "SA",
    "SCG": "RS ME",
    "SDN": "SD",
    "SEN": "SN",
    "SGP": "SG",
    "SGS": "GS",
    "SHN": "SH",
    "SJM": "SJ",
    "SLB": "SB",
    "SLE": "SL",
    "SLV": "SV",
    "SMR": "SM",
    "SOM": "SO",
    "SPM": "PM",
    "SRB": "RS",
    "SSD": "SS",
    "STP": "ST",
    "SU": "RU AM AZ BY EE GE KZ KG LV LT MD TJ TM UA UZ",
    "SUN": "RU AM AZ BY EE GE KZ KG LV LT MD TJ TM UA UZ",
    "SUR": "SR",
    "SVK": "SK",
    "SVN": "SI",
    "SWE": "SE",
    "SWZ": "SZ",
    "SXM": "SX",
    "SYC": "SC",
    "SYR": "SY",
    "TAA": "TA",
    "TCA": "TC",
    "TCD": "TD",
    "TGO": "TG",
    "THA": "TH",
    "TJK": "TJ",
    "TKL": "TK",
    "TKM": "TM",
    "TLS": "TL",
    "TMP": "TL",
    "TON": "TO",
    "TP": "TL",
    "TTO": "TT",
    "TUN": "TN",
    "TUR": "TR",
    "TUV": "TV",
    "TWN": "TW",
    "TZA": "TZ",
    "UGA": "UG",
    "UK": "GB",
    "UKR": "UA",
    "UMI": "UM",
    "URY": "UY",
    "USA": "US",
    "UZB": "UZ",
    "VAT": "VA",
    "VCT": "VC",
    "VD": "VN",
    "VEN": "VE",
    "VGB": "VG",
    "VIR": "VI",
    "VNM": "VN",
    "VUT": "VU",
    "WK": "UM",
    "WLF": "WF",
    "WSM": "WS",
    "XAA": "XA",
    "XBB": "XB",
    "XCC": "XC",
    "XDD": "XD",
    "XEE": "XE",
    "XFF": "XF",
    "XGG": "XG",
    "XHH": "XH",
    "XII": "XI",
    "XJJ": "XJ",
    "XKK": "XK",
    "XLL": "XL",
    "XMM": "XM",
    "XNN": "XN",
    "XOO": "XO",
    "XPP": "XP",
    "XQQ": "XQ",
    "XRR": "XR",
    "XSS": "XS",
    "XTT": "XT",
    "XUU": "XU",
    "XVV": "XV",
    "XWW": "XW",
    "XXX": "XX",
    "XYY": "XY",
    "XZZ": "XZ",
    "YD": "YE",
    "YEM": "YE",
    "YMD": "YE",
    "YU": "RS ME",
    "YUG": "RS ME",
    "ZAF": "ZA",
    "ZAR": "CD",
    "ZMB": "ZM",
    "ZR": "CD",
    "ZWE": "ZW",
    "ZZZ": "ZZ"
};
exports.scriptAlias = {
    "Qaai": "Zinh"
};
exports.variantAlias = {
    "heploc": "alalc97",
    "polytoni": "polyton"
};

},{}],79:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitUnicodeLocaleId = exports.emitUnicodeLanguageId = void 0;
var tslib_1 = require("tslib");
function emitUnicodeLanguageId(lang) {
    if (!lang) {
        return '';
    }
    return tslib_1.__spreadArrays([lang.lang, lang.script, lang.region], (lang.variants || [])).filter(Boolean)
        .join('-');
}
exports.emitUnicodeLanguageId = emitUnicodeLanguageId;
function emitUnicodeLocaleId(_a) {
    var lang = _a.lang, extensions = _a.extensions;
    var chunks = [emitUnicodeLanguageId(lang)];
    for (var _i = 0, extensions_1 = extensions; _i < extensions_1.length; _i++) {
        var ext = extensions_1[_i];
        chunks.push(ext.type);
        switch (ext.type) {
            case 'u':
                chunks.push.apply(chunks, tslib_1.__spreadArrays(ext.attributes, ext.keywords.reduce(function (all, kv) { return all.concat(kv); }, [])));
                break;
            case 't':
                chunks.push.apply(chunks, tslib_1.__spreadArrays([emitUnicodeLanguageId(ext.lang)], ext.fields.reduce(function (all, kv) { return all.concat(kv); }, [])));
                break;
            default:
                chunks.push(ext.value);
                break;
        }
    }
    return chunks.filter(Boolean).join('-');
}
exports.emitUnicodeLocaleId = emitUnicodeLocaleId;

},{"tslib":88}],80:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseUnicodeLocaleId = exports.parseUnicodeLanguageId = exports.isUnicodeVariantSubtag = exports.isUnicodeScriptSubtag = exports.isUnicodeRegionSubtag = exports.isStructurallyValidLanguageTag = exports.isUnicodeLanguageSubtag = exports.SEPARATOR = void 0;
var tslib_1 = require("tslib");
var ALPHANUM_1_8 = /^[a-z0-9]{1,8}$/i;
var ALPHANUM_2_8 = /^[a-z0-9]{2,8}$/i;
var ALPHANUM_3_8 = /^[a-z0-9]{3,8}$/i;
var KEY_REGEX = /^[a-z0-9][a-z]$/i;
var TYPE_REGEX = /^[a-z0-9]{3,8}$/i;
var ALPHA_4 = /^[a-z]{4}$/i;
// alphanum-[tTuUxX]
var OTHER_EXTENSION_TYPE = /^[0-9a-svwyz]$/i;
var UNICODE_REGION_SUBTAG_REGEX = /^([a-z]{2}|[0-9]{3})$/i;
var UNICODE_VARIANT_SUBTAG_REGEX = /^([a-z0-9]{5,8}|[0-9][a-z0-9]{3})$/i;
var UNICODE_LANGUAGE_SUBTAG_REGEX = /^([a-z]{2,3}|[a-z]{5,8})$/i;
var TKEY_REGEX = /^[a-z][0-9]$/i;
exports.SEPARATOR = '-';
function isUnicodeLanguageSubtag(lang) {
    return UNICODE_LANGUAGE_SUBTAG_REGEX.test(lang);
}
exports.isUnicodeLanguageSubtag = isUnicodeLanguageSubtag;
function isStructurallyValidLanguageTag(tag) {
    try {
        parseUnicodeLanguageId(tag.split(exports.SEPARATOR));
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.isStructurallyValidLanguageTag = isStructurallyValidLanguageTag;
function isUnicodeRegionSubtag(region) {
    return UNICODE_REGION_SUBTAG_REGEX.test(region);
}
exports.isUnicodeRegionSubtag = isUnicodeRegionSubtag;
function isUnicodeScriptSubtag(script) {
    return ALPHA_4.test(script);
}
exports.isUnicodeScriptSubtag = isUnicodeScriptSubtag;
function isUnicodeVariantSubtag(variant) {
    return UNICODE_VARIANT_SUBTAG_REGEX.test(variant);
}
exports.isUnicodeVariantSubtag = isUnicodeVariantSubtag;
function parseUnicodeLanguageId(chunks) {
    if (typeof chunks === 'string') {
        chunks = chunks.split(exports.SEPARATOR);
    }
    var lang = chunks.shift();
    if (!lang) {
        throw new RangeError('Missing unicode_language_subtag');
    }
    if (lang === 'root') {
        return { lang: 'root', variants: [] };
    }
    // unicode_language_subtag
    if (!isUnicodeLanguageSubtag(lang)) {
        throw new RangeError('Malformed unicode_language_subtag');
    }
    var script;
    // unicode_script_subtag
    if (isUnicodeScriptSubtag(chunks[0])) {
        script = chunks.shift();
    }
    var region;
    // unicode_region_subtag
    if (isUnicodeRegionSubtag(chunks[0])) {
        region = chunks.shift();
    }
    var variants = {};
    while (chunks.length && isUnicodeVariantSubtag(chunks[0])) {
        var variant = chunks.shift();
        if (variant in variants) {
            throw new RangeError("Duplicate variant \"" + variant + "\"");
        }
        variants[variant] = 1;
    }
    return {
        lang: lang,
        script: script,
        region: region,
        variants: Object.keys(variants),
    };
}
exports.parseUnicodeLanguageId = parseUnicodeLanguageId;
function parseUnicodeExtension(chunks) {
    var keywords = [];
    var keyword;
    while (chunks.length && (keyword = parseKeyword(chunks))) {
        keywords.push(keyword);
    }
    if (keywords.length) {
        return {
            type: 'u',
            keywords: keywords,
            attributes: [],
        };
    }
    // Mix of attributes & keywords
    // Check for attributes first
    var attributes = [];
    while (chunks.length && ALPHANUM_3_8.test(chunks[0])) {
        attributes.push(chunks.shift());
    }
    while (chunks.length && (keyword = parseKeyword(chunks))) {
        keywords.push(keyword);
    }
    if (keywords.length || attributes.length) {
        return {
            type: 'u',
            attributes: attributes,
            keywords: keywords,
        };
    }
    throw new RangeError('Malformed unicode_extension');
}
function parseKeyword(chunks) {
    var key;
    if (!KEY_REGEX.test(chunks[0])) {
        return;
    }
    key = chunks.shift();
    var type = [];
    while (chunks.length && TYPE_REGEX.test(chunks[0])) {
        type.push(chunks.shift());
    }
    var value = '';
    if (type.length) {
        value = type.join(exports.SEPARATOR);
    }
    return [key, value];
}
function parseTransformedExtension(chunks) {
    var lang;
    try {
        lang = parseUnicodeLanguageId(chunks);
    }
    catch (e) {
        // Try just parsing tfield
    }
    var fields = [];
    while (chunks.length && TKEY_REGEX.test(chunks[0])) {
        var key = chunks.shift();
        var value = [];
        while (chunks.length && ALPHANUM_3_8.test(chunks[0])) {
            value.push(chunks.shift());
        }
        if (!value.length) {
            throw new RangeError("Missing tvalue for tkey \"" + key + "\"");
        }
        fields.push([key, value.join(exports.SEPARATOR)]);
    }
    if (fields.length) {
        return {
            type: 't',
            fields: fields,
            lang: lang,
        };
    }
    throw new RangeError('Malformed transformed_extension');
}
function parsePuExtension(chunks) {
    var exts = [];
    while (chunks.length && ALPHANUM_1_8.test(chunks[0])) {
        exts.push(chunks.shift());
    }
    if (exts.length) {
        return {
            type: 'x',
            value: exts.join(exports.SEPARATOR),
        };
    }
    throw new RangeError('Malformed private_use_extension');
}
function parseOtherExtensionValue(chunks) {
    var exts = [];
    while (chunks.length && ALPHANUM_2_8.test(chunks[0])) {
        exts.push(chunks.shift());
    }
    if (exts.length) {
        return exts.join(exports.SEPARATOR);
    }
    return '';
}
function parseExtensions(chunks) {
    if (!chunks.length) {
        return { extensions: [] };
    }
    var extensions = [];
    var unicodeExtension;
    var transformedExtension;
    var puExtension;
    var otherExtensionMap = {};
    do {
        var type = chunks.shift();
        switch (type) {
            case 'u':
            case 'U':
                if (unicodeExtension) {
                    throw new RangeError('There can only be 1 -u- extension');
                }
                unicodeExtension = parseUnicodeExtension(chunks);
                extensions.push(unicodeExtension);
                break;
            case 't':
            case 'T':
                if (transformedExtension) {
                    throw new RangeError('There can only be 1 -t- extension');
                }
                transformedExtension = parseTransformedExtension(chunks);
                extensions.push(transformedExtension);
                break;
            case 'x':
            case 'X':
                if (puExtension) {
                    throw new RangeError('There can only be 1 -x- extension');
                }
                puExtension = parsePuExtension(chunks);
                extensions.push(puExtension);
                break;
            default:
                if (!OTHER_EXTENSION_TYPE.test(type)) {
                    throw new RangeError('Malformed extension type');
                }
                if (type in otherExtensionMap) {
                    throw new RangeError("There can only be 1 -" + type + "- extension");
                }
                var extension = {
                    type: type,
                    value: parseOtherExtensionValue(chunks),
                };
                otherExtensionMap[extension.type] = extension;
                extensions.push(extension);
                break;
        }
    } while (chunks.length);
    return { extensions: extensions };
}
function parseUnicodeLocaleId(locale) {
    var chunks = locale.split(exports.SEPARATOR);
    var lang = parseUnicodeLanguageId(chunks);
    return tslib_1.__assign({ lang: lang }, parseExtensions(chunks));
}
exports.parseUnicodeLocaleId = parseUnicodeLocaleId;

},{"tslib":88}],81:[function(require,module,exports){
arguments[4][66][0].apply(exports,arguments)
},{"dup":66}],82:[function(require,module,exports){
"use strict";
// Type-only circular import
// eslint-disable-next-line import/no-cycle
Object.defineProperty(exports, "__esModule", { value: true });
var internalSlotMap = new WeakMap();
function getInternalSlots(x) {
    var internalSlots = internalSlotMap.get(x);
    if (!internalSlots) {
        internalSlots = Object.create(null);
        internalSlotMap.set(x, internalSlots);
    }
    return internalSlots;
}
exports.default = getInternalSlots;

},{}],83:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Locale = void 0;
var tslib_1 = require("tslib");
var ecma402_abstract_1 = require("@formatjs/ecma402-abstract");
var intl_getcanonicallocales_1 = require("@formatjs/intl-getcanonicallocales");
var likelySubtagsData = tslib_1.__importStar(require("cldr-core/supplemental/likelySubtags.json"));
var get_internal_slots_1 = tslib_1.__importDefault(require("./get_internal_slots"));
var likelySubtags = likelySubtagsData.supplemental.likelySubtags;
var RELEVANT_EXTENSION_KEYS = ['ca', 'co', 'hc', 'kf', 'kn', 'nu'];
var UNICODE_TYPE_REGEX = /^[a-z0-9]{3,8}(-[a-z0-9]{3,8})*$/i;
function applyOptionsToTag(tag, options) {
    ecma402_abstract_1.invariant(typeof tag === 'string', 'language tag must be a string');
    ecma402_abstract_1.invariant(intl_getcanonicallocales_1.isStructurallyValidLanguageTag(tag), 'malformed language tag', RangeError);
    var language = ecma402_abstract_1.GetOption(options, 'language', 'string', undefined, undefined);
    if (language !== undefined) {
        ecma402_abstract_1.invariant(intl_getcanonicallocales_1.isUnicodeLanguageSubtag(language), 'Malformed unicode_language_subtag', RangeError);
    }
    var script = ecma402_abstract_1.GetOption(options, 'script', 'string', undefined, undefined);
    if (script !== undefined) {
        ecma402_abstract_1.invariant(intl_getcanonicallocales_1.isUnicodeScriptSubtag(script), 'Malformed unicode_script_subtag', RangeError);
    }
    var region = ecma402_abstract_1.GetOption(options, 'region', 'string', undefined, undefined);
    if (region !== undefined) {
        ecma402_abstract_1.invariant(intl_getcanonicallocales_1.isUnicodeRegionSubtag(region), 'Malformed unicode_region_subtag', RangeError);
    }
    var languageId = intl_getcanonicallocales_1.parseUnicodeLanguageId(tag);
    if (language !== undefined) {
        languageId.lang = language;
    }
    if (script !== undefined) {
        languageId.script = script;
    }
    if (region !== undefined) {
        languageId.region = region;
    }
    return Intl.getCanonicalLocales(intl_getcanonicallocales_1.emitUnicodeLocaleId(tslib_1.__assign(tslib_1.__assign({}, intl_getcanonicallocales_1.parseUnicodeLocaleId(tag)), { lang: languageId })))[0];
}
function applyUnicodeExtensionToTag(tag, options, relevantExtensionKeys) {
    var unicodeExtension;
    var keywords = [];
    var ast = intl_getcanonicallocales_1.parseUnicodeLocaleId(tag);
    for (var _i = 0, _a = ast.extensions; _i < _a.length; _i++) {
        var ext = _a[_i];
        if (ext.type === 'u') {
            unicodeExtension = ext;
            if (Array.isArray(ext.keywords))
                keywords = ext.keywords;
        }
    }
    var result = Object.create(null);
    for (var _b = 0, relevantExtensionKeys_1 = relevantExtensionKeys; _b < relevantExtensionKeys_1.length; _b++) {
        var key = relevantExtensionKeys_1[_b];
        var value = void 0, entry = void 0;
        for (var _c = 0, keywords_1 = keywords; _c < keywords_1.length; _c++) {
            var keyword = keywords_1[_c];
            if (keyword[0] === key) {
                entry = keyword;
                value = entry[1];
            }
        }
        ecma402_abstract_1.invariant(key in options, key + " must be in options");
        var optionsValue = options[key];
        if (optionsValue !== undefined) {
            ecma402_abstract_1.invariant(typeof optionsValue === 'string', "Value for " + key + " must be a string");
            value = optionsValue;
            if (entry) {
                entry[1] = value;
            }
            else {
                keywords.push([key, value]);
            }
        }
        result[key] = value;
    }
    if (!unicodeExtension) {
        if (keywords.length) {
            ast.extensions.push({
                type: 'u',
                keywords: keywords,
                attributes: [],
            });
        }
    }
    else {
        unicodeExtension.keywords = keywords;
    }
    result.locale = Intl
        .getCanonicalLocales(intl_getcanonicallocales_1.emitUnicodeLocaleId(ast))[0];
    return result;
}
function mergeUnicodeLanguageId(lang, script, region, variants, replacement) {
    if (variants === void 0) { variants = []; }
    if (!replacement) {
        return {
            lang: lang || 'und',
            script: script,
            region: region,
            variants: variants,
        };
    }
    return {
        lang: !lang || lang === 'und' ? replacement.lang : lang,
        script: script || replacement.script,
        region: region || replacement.region,
        variants: tslib_1.__spreadArrays(variants, replacement.variants),
    };
}
function addLikelySubtags(tag) {
    var ast = intl_getcanonicallocales_1.parseUnicodeLocaleId(tag);
    var unicodeLangId = ast.lang;
    var lang = unicodeLangId.lang, script = unicodeLangId.script, region = unicodeLangId.region, variants = unicodeLangId.variants;
    if (script && region) {
        var match_1 = likelySubtags[intl_getcanonicallocales_1.emitUnicodeLanguageId({ lang: lang, script: script, region: region, variants: [] })];
        if (match_1) {
            var parts_1 = intl_getcanonicallocales_1.parseUnicodeLanguageId(match_1);
            ast.lang = mergeUnicodeLanguageId(undefined, undefined, undefined, variants, parts_1);
            return intl_getcanonicallocales_1.emitUnicodeLocaleId(ast);
        }
    }
    if (script) {
        var match_2 = likelySubtags[intl_getcanonicallocales_1.emitUnicodeLanguageId({ lang: lang, script: script, variants: [] })];
        if (match_2) {
            var parts_2 = intl_getcanonicallocales_1.parseUnicodeLanguageId(match_2);
            ast.lang = mergeUnicodeLanguageId(undefined, undefined, region, variants, parts_2);
            return intl_getcanonicallocales_1.emitUnicodeLocaleId(ast);
        }
    }
    if (region) {
        var match_3 = likelySubtags[intl_getcanonicallocales_1.emitUnicodeLanguageId({ lang: lang, region: region, variants: [] })];
        if (match_3) {
            var parts_3 = intl_getcanonicallocales_1.parseUnicodeLanguageId(match_3);
            ast.lang = mergeUnicodeLanguageId(undefined, script, undefined, variants, parts_3);
            return intl_getcanonicallocales_1.emitUnicodeLocaleId(ast);
        }
    }
    var match = likelySubtags[lang] ||
        likelySubtags[intl_getcanonicallocales_1.emitUnicodeLanguageId({ lang: 'und', script: script, variants: [] })];
    if (!match) {
        throw new Error("No match for addLikelySubtags");
    }
    var parts = intl_getcanonicallocales_1.parseUnicodeLanguageId(match);
    ast.lang = mergeUnicodeLanguageId(undefined, script, region, variants, parts);
    return intl_getcanonicallocales_1.emitUnicodeLocaleId(ast);
}
/**
 * From: https://github.com/unicode-org/icu/blob/4231ca5be053a22a1be24eb891817458c97db709/icu4j/main/classes/core/src/com/ibm/icu/util/ULocale.java#L2395
 * @param tag
 */
function removeLikelySubtags(tag) {
    var maxLocale = addLikelySubtags(tag);
    if (!maxLocale) {
        return tag;
    }
    maxLocale = intl_getcanonicallocales_1.emitUnicodeLanguageId(tslib_1.__assign(tslib_1.__assign({}, intl_getcanonicallocales_1.parseUnicodeLanguageId(maxLocale)), { variants: [] }));
    var ast = intl_getcanonicallocales_1.parseUnicodeLocaleId(tag);
    var _a = ast.lang, lang = _a.lang, script = _a.script, region = _a.region, variants = _a.variants;
    var trial = addLikelySubtags(intl_getcanonicallocales_1.emitUnicodeLanguageId({ lang: lang, variants: [] }));
    if (trial === maxLocale) {
        return intl_getcanonicallocales_1.emitUnicodeLocaleId(tslib_1.__assign(tslib_1.__assign({}, ast), { lang: mergeUnicodeLanguageId(lang, undefined, undefined, variants) }));
    }
    if (region) {
        var trial_1 = addLikelySubtags(intl_getcanonicallocales_1.emitUnicodeLanguageId({ lang: lang, region: region, variants: [] }));
        if (trial_1 === maxLocale) {
            return intl_getcanonicallocales_1.emitUnicodeLocaleId(tslib_1.__assign(tslib_1.__assign({}, ast), { lang: mergeUnicodeLanguageId(lang, undefined, region, variants) }));
        }
    }
    if (script) {
        var trial_2 = addLikelySubtags(intl_getcanonicallocales_1.emitUnicodeLanguageId({ lang: lang, script: script, variants: [] }));
        if (trial_2 === maxLocale) {
            return intl_getcanonicallocales_1.emitUnicodeLocaleId(tslib_1.__assign(tslib_1.__assign({}, ast), { lang: mergeUnicodeLanguageId(lang, script, undefined, variants) }));
        }
    }
    return tag;
}
var Locale = /** @class */ (function () {
    function Locale(tag, opts) {
        // test262/test/intl402/RelativeTimeFormat/constructor/constructor/newtarget-undefined.js
        // Cannot use `new.target` bc of IE11 & TS transpiles it to something else
        var newTarget = this && this instanceof Locale ? this.constructor : void 0;
        if (!newTarget) {
            throw new TypeError("Intl.Locale must be called with 'new'");
        }
        var relevantExtensionKeys = Locale.relevantExtensionKeys;
        var internalSlotsList = [
            'initializedLocale',
            'locale',
            'calendar',
            'collation',
            'hourCycle',
            'numberingSystem',
        ];
        if (relevantExtensionKeys.indexOf('kf') > -1) {
            internalSlotsList.push('caseFirst');
        }
        if (relevantExtensionKeys.indexOf('kn') > -1) {
            internalSlotsList.push('numeric');
        }
        if (tag === undefined) {
            throw new TypeError("First argument to Intl.Locale constructor can't be empty or missing");
        }
        if (typeof tag !== 'string' && typeof tag !== 'object') {
            throw new TypeError('tag must be a string or object');
        }
        var internalSlots;
        if (typeof tag === 'object' &&
            (internalSlots = get_internal_slots_1.default(tag)) &&
            internalSlots.initializedLocale) {
            tag = internalSlots.locale;
        }
        else {
            tag = tag.toString();
        }
        internalSlots = get_internal_slots_1.default(this);
        var options;
        if (opts === undefined) {
            options = Object.create(null);
        }
        else {
            options = ecma402_abstract_1.ToObject(opts);
        }
        tag = applyOptionsToTag(tag, options);
        var opt = Object.create(null);
        var calendar = ecma402_abstract_1.GetOption(options, 'calendar', 'string', undefined, undefined);
        if (calendar !== undefined) {
            if (!UNICODE_TYPE_REGEX.test(calendar)) {
                throw new RangeError('invalid calendar');
            }
        }
        opt.ca = calendar;
        var collation = ecma402_abstract_1.GetOption(options, 'collation', 'string', undefined, undefined);
        if (collation !== undefined) {
            if (!UNICODE_TYPE_REGEX.test(collation)) {
                throw new RangeError('invalid collation');
            }
        }
        opt.co = collation;
        var hc = ecma402_abstract_1.GetOption(options, 'hourCycle', 'string', ['h11', 'h12', 'h23', 'h24'], undefined);
        opt.hc = hc;
        var kf = ecma402_abstract_1.GetOption(options, 'caseFirst', 'string', ['upper', 'lower', 'false'], undefined);
        opt.kf = kf;
        var _kn = ecma402_abstract_1.GetOption(options, 'numeric', 'boolean', undefined, undefined);
        var kn;
        if (_kn !== undefined) {
            kn = String(_kn);
        }
        opt.kn = kn;
        var numberingSystem = ecma402_abstract_1.GetOption(options, 'numberingSystem', 'string', undefined, undefined);
        if (numberingSystem !== undefined) {
            if (!UNICODE_TYPE_REGEX.test(numberingSystem)) {
                throw new RangeError('Invalid numberingSystem');
            }
        }
        opt.nu = numberingSystem;
        var r = applyUnicodeExtensionToTag(tag, opt, relevantExtensionKeys);
        internalSlots.locale = r.locale;
        internalSlots.calendar = r.ca;
        internalSlots.collation = r.co;
        internalSlots.hourCycle = r.hc;
        if (relevantExtensionKeys.indexOf('kf') > -1) {
            internalSlots.caseFirst = r.kf;
        }
        if (relevantExtensionKeys.indexOf('kn') > -1) {
            internalSlots.numeric = ecma402_abstract_1.SameValue(r.kn, 'true');
        }
        internalSlots.numberingSystem = r.nu;
    }
    /**
     * https://www.unicode.org/reports/tr35/#Likely_Subtags
     */
    Locale.prototype.maximize = function () {
        var locale = get_internal_slots_1.default(this).locale;
        try {
            var maximizedLocale = addLikelySubtags(locale);
            return new Locale(maximizedLocale);
        }
        catch (e) {
            return new Locale(locale);
        }
    };
    /**
     * https://www.unicode.org/reports/tr35/#Likely_Subtags
     */
    Locale.prototype.minimize = function () {
        var locale = get_internal_slots_1.default(this).locale;
        try {
            var minimizedLocale = removeLikelySubtags(locale);
            return new Locale(minimizedLocale);
        }
        catch (e) {
            return new Locale(locale);
        }
    };
    Locale.prototype.toString = function () {
        return get_internal_slots_1.default(this).locale;
    };
    Object.defineProperty(Locale.prototype, "baseName", {
        get: function () {
            var locale = get_internal_slots_1.default(this).locale;
            return intl_getcanonicallocales_1.emitUnicodeLanguageId(intl_getcanonicallocales_1.parseUnicodeLanguageId(locale));
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Locale.prototype, "calendar", {
        get: function () {
            return get_internal_slots_1.default(this).calendar;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Locale.prototype, "collation", {
        get: function () {
            return get_internal_slots_1.default(this).collation;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Locale.prototype, "hourCycle", {
        get: function () {
            return get_internal_slots_1.default(this).hourCycle;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Locale.prototype, "caseFirst", {
        get: function () {
            return get_internal_slots_1.default(this).caseFirst;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Locale.prototype, "numeric", {
        get: function () {
            return get_internal_slots_1.default(this).numeric;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Locale.prototype, "numberingSystem", {
        get: function () {
            return get_internal_slots_1.default(this).numberingSystem;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Locale.prototype, "language", {
        /**
         * https://tc39.es/proposal-intl-locale/#sec-Intl.Locale.prototype.language
         */
        get: function () {
            var locale = get_internal_slots_1.default(this).locale;
            return intl_getcanonicallocales_1.parseUnicodeLanguageId(locale).lang;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Locale.prototype, "script", {
        /**
         * https://tc39.es/proposal-intl-locale/#sec-Intl.Locale.prototype.script
         */
        get: function () {
            var locale = get_internal_slots_1.default(this).locale;
            return intl_getcanonicallocales_1.parseUnicodeLanguageId(locale).script;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Locale.prototype, "region", {
        /**
         * https://tc39.es/proposal-intl-locale/#sec-Intl.Locale.prototype.region
         */
        get: function () {
            var locale = get_internal_slots_1.default(this).locale;
            return intl_getcanonicallocales_1.parseUnicodeLanguageId(locale).region;
        },
        enumerable: false,
        configurable: true
    });
    Locale.relevantExtensionKeys = RELEVANT_EXTENSION_KEYS;
    return Locale;
}());
exports.Locale = Locale;
try {
    if (typeof Symbol !== 'undefined') {
        Object.defineProperty(Locale.prototype, Symbol.toStringTag, {
            value: 'Intl.Locale',
            writable: false,
            enumerable: false,
            configurable: true,
        });
    }
    Object.defineProperty(Locale.prototype.constructor, 'length', {
        value: 1,
        writable: false,
        enumerable: false,
        configurable: true,
    });
}
catch (e) {
    // Meta fix so we're test262-compliant, not important
}
exports.default = Locale;

},{"./get_internal_slots":82,"@formatjs/ecma402-abstract":64,"@formatjs/intl-getcanonicallocales":76,"cldr-core/supplemental/likelySubtags.json":86,"tslib":88}],84:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require("./");
var should_polyfill_1 = require("./should-polyfill");
if (should_polyfill_1.shouldPolyfill()) {
    Object.defineProperty(Intl, 'Locale', {
        value: _1.Locale,
        writable: true,
        enumerable: false,
        configurable: true,
    });
}

},{"./":83,"./should-polyfill":85}],85:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldPolyfill = void 0;
/**
 * https://bugs.chromium.org/p/v8/issues/detail?id=10682
 */
function hasIntlGetCanonicalLocalesBug() {
    try {
        return new Intl.Locale('und-x-private').toString() === 'x-private';
    }
    catch (e) {
        return true;
    }
}
function shouldPolyfill() {
    return (typeof Intl === 'undefined' ||
        !('Locale' in Intl) ||
        hasIntlGetCanonicalLocalesBug());
}
exports.shouldPolyfill = shouldPolyfill;

},{}],86:[function(require,module,exports){
module.exports={
  "supplemental": {
    "version": {
      "_unicodeVersion": "13.0.0",
      "_cldrVersion": "38"
    },
    "likelySubtags": {
      "aa": "aa-Latn-ET",
      "aai": "aai-Latn-ZZ",
      "aak": "aak-Latn-ZZ",
      "aau": "aau-Latn-ZZ",
      "ab": "ab-Cyrl-GE",
      "abi": "abi-Latn-ZZ",
      "abq": "abq-Cyrl-ZZ",
      "abr": "abr-Latn-GH",
      "abt": "abt-Latn-ZZ",
      "aby": "aby-Latn-ZZ",
      "acd": "acd-Latn-ZZ",
      "ace": "ace-Latn-ID",
      "ach": "ach-Latn-UG",
      "ada": "ada-Latn-GH",
      "ade": "ade-Latn-ZZ",
      "adj": "adj-Latn-ZZ",
      "adp": "adp-Tibt-BT",
      "ady": "ady-Cyrl-RU",
      "adz": "adz-Latn-ZZ",
      "ae": "ae-Avst-IR",
      "aeb": "aeb-Arab-TN",
      "aey": "aey-Latn-ZZ",
      "af": "af-Latn-ZA",
      "agc": "agc-Latn-ZZ",
      "agd": "agd-Latn-ZZ",
      "agg": "agg-Latn-ZZ",
      "agm": "agm-Latn-ZZ",
      "ago": "ago-Latn-ZZ",
      "agq": "agq-Latn-CM",
      "aha": "aha-Latn-ZZ",
      "ahl": "ahl-Latn-ZZ",
      "aho": "aho-Ahom-IN",
      "ajg": "ajg-Latn-ZZ",
      "ak": "ak-Latn-GH",
      "akk": "akk-Xsux-IQ",
      "ala": "ala-Latn-ZZ",
      "ali": "ali-Latn-ZZ",
      "aln": "aln-Latn-XK",
      "alt": "alt-Cyrl-RU",
      "am": "am-Ethi-ET",
      "amm": "amm-Latn-ZZ",
      "amn": "amn-Latn-ZZ",
      "amo": "amo-Latn-NG",
      "amp": "amp-Latn-ZZ",
      "an": "an-Latn-ES",
      "anc": "anc-Latn-ZZ",
      "ank": "ank-Latn-ZZ",
      "ann": "ann-Latn-ZZ",
      "any": "any-Latn-ZZ",
      "aoj": "aoj-Latn-ZZ",
      "aom": "aom-Latn-ZZ",
      "aoz": "aoz-Latn-ID",
      "apc": "apc-Arab-ZZ",
      "apd": "apd-Arab-TG",
      "ape": "ape-Latn-ZZ",
      "apr": "apr-Latn-ZZ",
      "aps": "aps-Latn-ZZ",
      "apz": "apz-Latn-ZZ",
      "ar": "ar-Arab-EG",
      "arc": "arc-Armi-IR",
      "arc-Nbat": "arc-Nbat-JO",
      "arc-Palm": "arc-Palm-SY",
      "arh": "arh-Latn-ZZ",
      "arn": "arn-Latn-CL",
      "aro": "aro-Latn-BO",
      "arq": "arq-Arab-DZ",
      "ars": "ars-Arab-SA",
      "ary": "ary-Arab-MA",
      "arz": "arz-Arab-EG",
      "as": "as-Beng-IN",
      "asa": "asa-Latn-TZ",
      "ase": "ase-Sgnw-US",
      "asg": "asg-Latn-ZZ",
      "aso": "aso-Latn-ZZ",
      "ast": "ast-Latn-ES",
      "ata": "ata-Latn-ZZ",
      "atg": "atg-Latn-ZZ",
      "atj": "atj-Latn-CA",
      "auy": "auy-Latn-ZZ",
      "av": "av-Cyrl-RU",
      "avl": "avl-Arab-ZZ",
      "avn": "avn-Latn-ZZ",
      "avt": "avt-Latn-ZZ",
      "avu": "avu-Latn-ZZ",
      "awa": "awa-Deva-IN",
      "awb": "awb-Latn-ZZ",
      "awo": "awo-Latn-ZZ",
      "awx": "awx-Latn-ZZ",
      "ay": "ay-Latn-BO",
      "ayb": "ayb-Latn-ZZ",
      "az": "az-Latn-AZ",
      "az-Arab": "az-Arab-IR",
      "az-IQ": "az-Arab-IQ",
      "az-IR": "az-Arab-IR",
      "az-RU": "az-Cyrl-RU",
      "ba": "ba-Cyrl-RU",
      "bal": "bal-Arab-PK",
      "ban": "ban-Latn-ID",
      "bap": "bap-Deva-NP",
      "bar": "bar-Latn-AT",
      "bas": "bas-Latn-CM",
      "bav": "bav-Latn-ZZ",
      "bax": "bax-Bamu-CM",
      "bba": "bba-Latn-ZZ",
      "bbb": "bbb-Latn-ZZ",
      "bbc": "bbc-Latn-ID",
      "bbd": "bbd-Latn-ZZ",
      "bbj": "bbj-Latn-CM",
      "bbp": "bbp-Latn-ZZ",
      "bbr": "bbr-Latn-ZZ",
      "bcf": "bcf-Latn-ZZ",
      "bch": "bch-Latn-ZZ",
      "bci": "bci-Latn-CI",
      "bcm": "bcm-Latn-ZZ",
      "bcn": "bcn-Latn-ZZ",
      "bco": "bco-Latn-ZZ",
      "bcq": "bcq-Ethi-ZZ",
      "bcu": "bcu-Latn-ZZ",
      "bdd": "bdd-Latn-ZZ",
      "be": "be-Cyrl-BY",
      "bef": "bef-Latn-ZZ",
      "beh": "beh-Latn-ZZ",
      "bej": "bej-Arab-SD",
      "bem": "bem-Latn-ZM",
      "bet": "bet-Latn-ZZ",
      "bew": "bew-Latn-ID",
      "bex": "bex-Latn-ZZ",
      "bez": "bez-Latn-TZ",
      "bfd": "bfd-Latn-CM",
      "bfq": "bfq-Taml-IN",
      "bft": "bft-Arab-PK",
      "bfy": "bfy-Deva-IN",
      "bg": "bg-Cyrl-BG",
      "bgc": "bgc-Deva-IN",
      "bgn": "bgn-Arab-PK",
      "bgx": "bgx-Grek-TR",
      "bhb": "bhb-Deva-IN",
      "bhg": "bhg-Latn-ZZ",
      "bhi": "bhi-Deva-IN",
      "bhl": "bhl-Latn-ZZ",
      "bho": "bho-Deva-IN",
      "bhy": "bhy-Latn-ZZ",
      "bi": "bi-Latn-VU",
      "bib": "bib-Latn-ZZ",
      "big": "big-Latn-ZZ",
      "bik": "bik-Latn-PH",
      "bim": "bim-Latn-ZZ",
      "bin": "bin-Latn-NG",
      "bio": "bio-Latn-ZZ",
      "biq": "biq-Latn-ZZ",
      "bjh": "bjh-Latn-ZZ",
      "bji": "bji-Ethi-ZZ",
      "bjj": "bjj-Deva-IN",
      "bjn": "bjn-Latn-ID",
      "bjo": "bjo-Latn-ZZ",
      "bjr": "bjr-Latn-ZZ",
      "bjt": "bjt-Latn-SN",
      "bjz": "bjz-Latn-ZZ",
      "bkc": "bkc-Latn-ZZ",
      "bkm": "bkm-Latn-CM",
      "bkq": "bkq-Latn-ZZ",
      "bku": "bku-Latn-PH",
      "bkv": "bkv-Latn-ZZ",
      "blt": "blt-Tavt-VN",
      "bm": "bm-Latn-ML",
      "bmh": "bmh-Latn-ZZ",
      "bmk": "bmk-Latn-ZZ",
      "bmq": "bmq-Latn-ML",
      "bmu": "bmu-Latn-ZZ",
      "bn": "bn-Beng-BD",
      "bng": "bng-Latn-ZZ",
      "bnm": "bnm-Latn-ZZ",
      "bnp": "bnp-Latn-ZZ",
      "bo": "bo-Tibt-CN",
      "boj": "boj-Latn-ZZ",
      "bom": "bom-Latn-ZZ",
      "bon": "bon-Latn-ZZ",
      "bpy": "bpy-Beng-IN",
      "bqc": "bqc-Latn-ZZ",
      "bqi": "bqi-Arab-IR",
      "bqp": "bqp-Latn-ZZ",
      "bqv": "bqv-Latn-CI",
      "br": "br-Latn-FR",
      "bra": "bra-Deva-IN",
      "brh": "brh-Arab-PK",
      "brx": "brx-Deva-IN",
      "brz": "brz-Latn-ZZ",
      "bs": "bs-Latn-BA",
      "bsj": "bsj-Latn-ZZ",
      "bsq": "bsq-Bass-LR",
      "bss": "bss-Latn-CM",
      "bst": "bst-Ethi-ZZ",
      "bto": "bto-Latn-PH",
      "btt": "btt-Latn-ZZ",
      "btv": "btv-Deva-PK",
      "bua": "bua-Cyrl-RU",
      "buc": "buc-Latn-YT",
      "bud": "bud-Latn-ZZ",
      "bug": "bug-Latn-ID",
      "buk": "buk-Latn-ZZ",
      "bum": "bum-Latn-CM",
      "buo": "buo-Latn-ZZ",
      "bus": "bus-Latn-ZZ",
      "buu": "buu-Latn-ZZ",
      "bvb": "bvb-Latn-GQ",
      "bwd": "bwd-Latn-ZZ",
      "bwr": "bwr-Latn-ZZ",
      "bxh": "bxh-Latn-ZZ",
      "bye": "bye-Latn-ZZ",
      "byn": "byn-Ethi-ER",
      "byr": "byr-Latn-ZZ",
      "bys": "bys-Latn-ZZ",
      "byv": "byv-Latn-CM",
      "byx": "byx-Latn-ZZ",
      "bza": "bza-Latn-ZZ",
      "bze": "bze-Latn-ML",
      "bzf": "bzf-Latn-ZZ",
      "bzh": "bzh-Latn-ZZ",
      "bzw": "bzw-Latn-ZZ",
      "ca": "ca-Latn-ES",
      "cad": "cad-Latn-US",
      "can": "can-Latn-ZZ",
      "cbj": "cbj-Latn-ZZ",
      "cch": "cch-Latn-NG",
      "ccp": "ccp-Cakm-BD",
      "ce": "ce-Cyrl-RU",
      "ceb": "ceb-Latn-PH",
      "cfa": "cfa-Latn-ZZ",
      "cgg": "cgg-Latn-UG",
      "ch": "ch-Latn-GU",
      "chk": "chk-Latn-FM",
      "chm": "chm-Cyrl-RU",
      "cho": "cho-Latn-US",
      "chp": "chp-Latn-CA",
      "chr": "chr-Cher-US",
      "cic": "cic-Latn-US",
      "cja": "cja-Arab-KH",
      "cjm": "cjm-Cham-VN",
      "cjv": "cjv-Latn-ZZ",
      "ckb": "ckb-Arab-IQ",
      "ckl": "ckl-Latn-ZZ",
      "cko": "cko-Latn-ZZ",
      "cky": "cky-Latn-ZZ",
      "cla": "cla-Latn-ZZ",
      "cme": "cme-Latn-ZZ",
      "cmg": "cmg-Soyo-MN",
      "co": "co-Latn-FR",
      "cop": "cop-Copt-EG",
      "cps": "cps-Latn-PH",
      "cr": "cr-Cans-CA",
      "crh": "crh-Cyrl-UA",
      "crj": "crj-Cans-CA",
      "crk": "crk-Cans-CA",
      "crl": "crl-Cans-CA",
      "crm": "crm-Cans-CA",
      "crs": "crs-Latn-SC",
      "cs": "cs-Latn-CZ",
      "csb": "csb-Latn-PL",
      "csw": "csw-Cans-CA",
      "ctd": "ctd-Pauc-MM",
      "cu": "cu-Cyrl-RU",
      "cu-Glag": "cu-Glag-BG",
      "cv": "cv-Cyrl-RU",
      "cy": "cy-Latn-GB",
      "da": "da-Latn-DK",
      "dad": "dad-Latn-ZZ",
      "daf": "daf-Latn-CI",
      "dag": "dag-Latn-ZZ",
      "dah": "dah-Latn-ZZ",
      "dak": "dak-Latn-US",
      "dar": "dar-Cyrl-RU",
      "dav": "dav-Latn-KE",
      "dbd": "dbd-Latn-ZZ",
      "dbq": "dbq-Latn-ZZ",
      "dcc": "dcc-Arab-IN",
      "ddn": "ddn-Latn-ZZ",
      "de": "de-Latn-DE",
      "ded": "ded-Latn-ZZ",
      "den": "den-Latn-CA",
      "dga": "dga-Latn-ZZ",
      "dgh": "dgh-Latn-ZZ",
      "dgi": "dgi-Latn-ZZ",
      "dgl": "dgl-Arab-ZZ",
      "dgr": "dgr-Latn-CA",
      "dgz": "dgz-Latn-ZZ",
      "dia": "dia-Latn-ZZ",
      "dje": "dje-Latn-NE",
      "dnj": "dnj-Latn-CI",
      "dob": "dob-Latn-ZZ",
      "doi": "doi-Deva-IN",
      "dop": "dop-Latn-ZZ",
      "dow": "dow-Latn-ZZ",
      "drh": "drh-Mong-CN",
      "dri": "dri-Latn-ZZ",
      "drs": "drs-Ethi-ZZ",
      "dsb": "dsb-Latn-DE",
      "dtm": "dtm-Latn-ML",
      "dtp": "dtp-Latn-MY",
      "dts": "dts-Latn-ZZ",
      "dty": "dty-Deva-NP",
      "dua": "dua-Latn-CM",
      "duc": "duc-Latn-ZZ",
      "dud": "dud-Latn-ZZ",
      "dug": "dug-Latn-ZZ",
      "dv": "dv-Thaa-MV",
      "dva": "dva-Latn-ZZ",
      "dww": "dww-Latn-ZZ",
      "dyo": "dyo-Latn-SN",
      "dyu": "dyu-Latn-BF",
      "dz": "dz-Tibt-BT",
      "dzg": "dzg-Latn-ZZ",
      "ebu": "ebu-Latn-KE",
      "ee": "ee-Latn-GH",
      "efi": "efi-Latn-NG",
      "egl": "egl-Latn-IT",
      "egy": "egy-Egyp-EG",
      "eka": "eka-Latn-ZZ",
      "eky": "eky-Kali-MM",
      "el": "el-Grek-GR",
      "ema": "ema-Latn-ZZ",
      "emi": "emi-Latn-ZZ",
      "en": "en-Latn-US",
      "en-Shaw": "en-Shaw-GB",
      "enn": "enn-Latn-ZZ",
      "enq": "enq-Latn-ZZ",
      "eo": "eo-Latn-001",
      "eri": "eri-Latn-ZZ",
      "es": "es-Latn-ES",
      "esg": "esg-Gonm-IN",
      "esu": "esu-Latn-US",
      "et": "et-Latn-EE",
      "etr": "etr-Latn-ZZ",
      "ett": "ett-Ital-IT",
      "etu": "etu-Latn-ZZ",
      "etx": "etx-Latn-ZZ",
      "eu": "eu-Latn-ES",
      "ewo": "ewo-Latn-CM",
      "ext": "ext-Latn-ES",
      "eza": "eza-Latn-ZZ",
      "fa": "fa-Arab-IR",
      "faa": "faa-Latn-ZZ",
      "fab": "fab-Latn-ZZ",
      "fag": "fag-Latn-ZZ",
      "fai": "fai-Latn-ZZ",
      "fan": "fan-Latn-GQ",
      "ff": "ff-Latn-SN",
      "ff-Adlm": "ff-Adlm-GN",
      "ffi": "ffi-Latn-ZZ",
      "ffm": "ffm-Latn-ML",
      "fi": "fi-Latn-FI",
      "fia": "fia-Arab-SD",
      "fil": "fil-Latn-PH",
      "fit": "fit-Latn-SE",
      "fj": "fj-Latn-FJ",
      "flr": "flr-Latn-ZZ",
      "fmp": "fmp-Latn-ZZ",
      "fo": "fo-Latn-FO",
      "fod": "fod-Latn-ZZ",
      "fon": "fon-Latn-BJ",
      "for": "for-Latn-ZZ",
      "fpe": "fpe-Latn-ZZ",
      "fqs": "fqs-Latn-ZZ",
      "fr": "fr-Latn-FR",
      "frc": "frc-Latn-US",
      "frp": "frp-Latn-FR",
      "frr": "frr-Latn-DE",
      "frs": "frs-Latn-DE",
      "fub": "fub-Arab-CM",
      "fud": "fud-Latn-WF",
      "fue": "fue-Latn-ZZ",
      "fuf": "fuf-Latn-GN",
      "fuh": "fuh-Latn-ZZ",
      "fuq": "fuq-Latn-NE",
      "fur": "fur-Latn-IT",
      "fuv": "fuv-Latn-NG",
      "fuy": "fuy-Latn-ZZ",
      "fvr": "fvr-Latn-SD",
      "fy": "fy-Latn-NL",
      "ga": "ga-Latn-IE",
      "gaa": "gaa-Latn-GH",
      "gaf": "gaf-Latn-ZZ",
      "gag": "gag-Latn-MD",
      "gah": "gah-Latn-ZZ",
      "gaj": "gaj-Latn-ZZ",
      "gam": "gam-Latn-ZZ",
      "gan": "gan-Hans-CN",
      "gaw": "gaw-Latn-ZZ",
      "gay": "gay-Latn-ID",
      "gba": "gba-Latn-ZZ",
      "gbf": "gbf-Latn-ZZ",
      "gbm": "gbm-Deva-IN",
      "gby": "gby-Latn-ZZ",
      "gbz": "gbz-Arab-IR",
      "gcr": "gcr-Latn-GF",
      "gd": "gd-Latn-GB",
      "gde": "gde-Latn-ZZ",
      "gdn": "gdn-Latn-ZZ",
      "gdr": "gdr-Latn-ZZ",
      "geb": "geb-Latn-ZZ",
      "gej": "gej-Latn-ZZ",
      "gel": "gel-Latn-ZZ",
      "gez": "gez-Ethi-ET",
      "gfk": "gfk-Latn-ZZ",
      "ggn": "ggn-Deva-NP",
      "ghs": "ghs-Latn-ZZ",
      "gil": "gil-Latn-KI",
      "gim": "gim-Latn-ZZ",
      "gjk": "gjk-Arab-PK",
      "gjn": "gjn-Latn-ZZ",
      "gju": "gju-Arab-PK",
      "gkn": "gkn-Latn-ZZ",
      "gkp": "gkp-Latn-ZZ",
      "gl": "gl-Latn-ES",
      "glk": "glk-Arab-IR",
      "gmm": "gmm-Latn-ZZ",
      "gmv": "gmv-Ethi-ZZ",
      "gn": "gn-Latn-PY",
      "gnd": "gnd-Latn-ZZ",
      "gng": "gng-Latn-ZZ",
      "god": "god-Latn-ZZ",
      "gof": "gof-Ethi-ZZ",
      "goi": "goi-Latn-ZZ",
      "gom": "gom-Deva-IN",
      "gon": "gon-Telu-IN",
      "gor": "gor-Latn-ID",
      "gos": "gos-Latn-NL",
      "got": "got-Goth-UA",
      "grb": "grb-Latn-ZZ",
      "grc": "grc-Cprt-CY",
      "grc-Linb": "grc-Linb-GR",
      "grt": "grt-Beng-IN",
      "grw": "grw-Latn-ZZ",
      "gsw": "gsw-Latn-CH",
      "gu": "gu-Gujr-IN",
      "gub": "gub-Latn-BR",
      "guc": "guc-Latn-CO",
      "gud": "gud-Latn-ZZ",
      "gur": "gur-Latn-GH",
      "guw": "guw-Latn-ZZ",
      "gux": "gux-Latn-ZZ",
      "guz": "guz-Latn-KE",
      "gv": "gv-Latn-IM",
      "gvf": "gvf-Latn-ZZ",
      "gvr": "gvr-Deva-NP",
      "gvs": "gvs-Latn-ZZ",
      "gwc": "gwc-Arab-ZZ",
      "gwi": "gwi-Latn-CA",
      "gwt": "gwt-Arab-ZZ",
      "gyi": "gyi-Latn-ZZ",
      "ha": "ha-Latn-NG",
      "ha-CM": "ha-Arab-CM",
      "ha-SD": "ha-Arab-SD",
      "hag": "hag-Latn-ZZ",
      "hak": "hak-Hans-CN",
      "ham": "ham-Latn-ZZ",
      "haw": "haw-Latn-US",
      "haz": "haz-Arab-AF",
      "hbb": "hbb-Latn-ZZ",
      "hdy": "hdy-Ethi-ZZ",
      "he": "he-Hebr-IL",
      "hhy": "hhy-Latn-ZZ",
      "hi": "hi-Deva-IN",
      "hia": "hia-Latn-ZZ",
      "hif": "hif-Latn-FJ",
      "hig": "hig-Latn-ZZ",
      "hih": "hih-Latn-ZZ",
      "hil": "hil-Latn-PH",
      "hla": "hla-Latn-ZZ",
      "hlu": "hlu-Hluw-TR",
      "hmd": "hmd-Plrd-CN",
      "hmt": "hmt-Latn-ZZ",
      "hnd": "hnd-Arab-PK",
      "hne": "hne-Deva-IN",
      "hnj": "hnj-Hmng-LA",
      "hnn": "hnn-Latn-PH",
      "hno": "hno-Arab-PK",
      "ho": "ho-Latn-PG",
      "hoc": "hoc-Deva-IN",
      "hoj": "hoj-Deva-IN",
      "hot": "hot-Latn-ZZ",
      "hr": "hr-Latn-HR",
      "hsb": "hsb-Latn-DE",
      "hsn": "hsn-Hans-CN",
      "ht": "ht-Latn-HT",
      "hu": "hu-Latn-HU",
      "hui": "hui-Latn-ZZ",
      "hy": "hy-Armn-AM",
      "hz": "hz-Latn-NA",
      "ia": "ia-Latn-001",
      "ian": "ian-Latn-ZZ",
      "iar": "iar-Latn-ZZ",
      "iba": "iba-Latn-MY",
      "ibb": "ibb-Latn-NG",
      "iby": "iby-Latn-ZZ",
      "ica": "ica-Latn-ZZ",
      "ich": "ich-Latn-ZZ",
      "id": "id-Latn-ID",
      "idd": "idd-Latn-ZZ",
      "idi": "idi-Latn-ZZ",
      "idu": "idu-Latn-ZZ",
      "ife": "ife-Latn-TG",
      "ig": "ig-Latn-NG",
      "igb": "igb-Latn-ZZ",
      "ige": "ige-Latn-ZZ",
      "ii": "ii-Yiii-CN",
      "ijj": "ijj-Latn-ZZ",
      "ik": "ik-Latn-US",
      "ikk": "ikk-Latn-ZZ",
      "ikt": "ikt-Latn-CA",
      "ikw": "ikw-Latn-ZZ",
      "ikx": "ikx-Latn-ZZ",
      "ilo": "ilo-Latn-PH",
      "imo": "imo-Latn-ZZ",
      "in": "in-Latn-ID",
      "inh": "inh-Cyrl-RU",
      "io": "io-Latn-001",
      "iou": "iou-Latn-ZZ",
      "iri": "iri-Latn-ZZ",
      "is": "is-Latn-IS",
      "it": "it-Latn-IT",
      "iu": "iu-Cans-CA",
      "iw": "iw-Hebr-IL",
      "iwm": "iwm-Latn-ZZ",
      "iws": "iws-Latn-ZZ",
      "izh": "izh-Latn-RU",
      "izi": "izi-Latn-ZZ",
      "ja": "ja-Jpan-JP",
      "jab": "jab-Latn-ZZ",
      "jam": "jam-Latn-JM",
      "jar": "jar-Latn-ZZ",
      "jbo": "jbo-Latn-001",
      "jbu": "jbu-Latn-ZZ",
      "jen": "jen-Latn-ZZ",
      "jgk": "jgk-Latn-ZZ",
      "jgo": "jgo-Latn-CM",
      "ji": "ji-Hebr-UA",
      "jib": "jib-Latn-ZZ",
      "jmc": "jmc-Latn-TZ",
      "jml": "jml-Deva-NP",
      "jra": "jra-Latn-ZZ",
      "jut": "jut-Latn-DK",
      "jv": "jv-Latn-ID",
      "jw": "jw-Latn-ID",
      "ka": "ka-Geor-GE",
      "kaa": "kaa-Cyrl-UZ",
      "kab": "kab-Latn-DZ",
      "kac": "kac-Latn-MM",
      "kad": "kad-Latn-ZZ",
      "kai": "kai-Latn-ZZ",
      "kaj": "kaj-Latn-NG",
      "kam": "kam-Latn-KE",
      "kao": "kao-Latn-ML",
      "kbd": "kbd-Cyrl-RU",
      "kbm": "kbm-Latn-ZZ",
      "kbp": "kbp-Latn-ZZ",
      "kbq": "kbq-Latn-ZZ",
      "kbx": "kbx-Latn-ZZ",
      "kby": "kby-Arab-NE",
      "kcg": "kcg-Latn-NG",
      "kck": "kck-Latn-ZW",
      "kcl": "kcl-Latn-ZZ",
      "kct": "kct-Latn-ZZ",
      "kde": "kde-Latn-TZ",
      "kdh": "kdh-Arab-TG",
      "kdl": "kdl-Latn-ZZ",
      "kdt": "kdt-Thai-TH",
      "kea": "kea-Latn-CV",
      "ken": "ken-Latn-CM",
      "kez": "kez-Latn-ZZ",
      "kfo": "kfo-Latn-CI",
      "kfr": "kfr-Deva-IN",
      "kfy": "kfy-Deva-IN",
      "kg": "kg-Latn-CD",
      "kge": "kge-Latn-ID",
      "kgf": "kgf-Latn-ZZ",
      "kgp": "kgp-Latn-BR",
      "kha": "kha-Latn-IN",
      "khb": "khb-Talu-CN",
      "khn": "khn-Deva-IN",
      "khq": "khq-Latn-ML",
      "khs": "khs-Latn-ZZ",
      "kht": "kht-Mymr-IN",
      "khw": "khw-Arab-PK",
      "khz": "khz-Latn-ZZ",
      "ki": "ki-Latn-KE",
      "kij": "kij-Latn-ZZ",
      "kiu": "kiu-Latn-TR",
      "kiw": "kiw-Latn-ZZ",
      "kj": "kj-Latn-NA",
      "kjd": "kjd-Latn-ZZ",
      "kjg": "kjg-Laoo-LA",
      "kjs": "kjs-Latn-ZZ",
      "kjy": "kjy-Latn-ZZ",
      "kk": "kk-Cyrl-KZ",
      "kk-AF": "kk-Arab-AF",
      "kk-Arab": "kk-Arab-CN",
      "kk-CN": "kk-Arab-CN",
      "kk-IR": "kk-Arab-IR",
      "kk-MN": "kk-Arab-MN",
      "kkc": "kkc-Latn-ZZ",
      "kkj": "kkj-Latn-CM",
      "kl": "kl-Latn-GL",
      "kln": "kln-Latn-KE",
      "klq": "klq-Latn-ZZ",
      "klt": "klt-Latn-ZZ",
      "klx": "klx-Latn-ZZ",
      "km": "km-Khmr-KH",
      "kmb": "kmb-Latn-AO",
      "kmh": "kmh-Latn-ZZ",
      "kmo": "kmo-Latn-ZZ",
      "kms": "kms-Latn-ZZ",
      "kmu": "kmu-Latn-ZZ",
      "kmw": "kmw-Latn-ZZ",
      "kn": "kn-Knda-IN",
      "knf": "knf-Latn-GW",
      "knp": "knp-Latn-ZZ",
      "ko": "ko-Kore-KR",
      "koi": "koi-Cyrl-RU",
      "kok": "kok-Deva-IN",
      "kol": "kol-Latn-ZZ",
      "kos": "kos-Latn-FM",
      "koz": "koz-Latn-ZZ",
      "kpe": "kpe-Latn-LR",
      "kpf": "kpf-Latn-ZZ",
      "kpo": "kpo-Latn-ZZ",
      "kpr": "kpr-Latn-ZZ",
      "kpx": "kpx-Latn-ZZ",
      "kqb": "kqb-Latn-ZZ",
      "kqf": "kqf-Latn-ZZ",
      "kqs": "kqs-Latn-ZZ",
      "kqy": "kqy-Ethi-ZZ",
      "kr": "kr-Latn-ZZ",
      "krc": "krc-Cyrl-RU",
      "kri": "kri-Latn-SL",
      "krj": "krj-Latn-PH",
      "krl": "krl-Latn-RU",
      "krs": "krs-Latn-ZZ",
      "kru": "kru-Deva-IN",
      "ks": "ks-Arab-IN",
      "ksb": "ksb-Latn-TZ",
      "ksd": "ksd-Latn-ZZ",
      "ksf": "ksf-Latn-CM",
      "ksh": "ksh-Latn-DE",
      "ksj": "ksj-Latn-ZZ",
      "ksr": "ksr-Latn-ZZ",
      "ktb": "ktb-Ethi-ZZ",
      "ktm": "ktm-Latn-ZZ",
      "kto": "kto-Latn-ZZ",
      "ktr": "ktr-Latn-MY",
      "ku": "ku-Latn-TR",
      "ku-Arab": "ku-Arab-IQ",
      "ku-LB": "ku-Arab-LB",
      "ku-Yezi": "ku-Yezi-GE",
      "kub": "kub-Latn-ZZ",
      "kud": "kud-Latn-ZZ",
      "kue": "kue-Latn-ZZ",
      "kuj": "kuj-Latn-ZZ",
      "kum": "kum-Cyrl-RU",
      "kun": "kun-Latn-ZZ",
      "kup": "kup-Latn-ZZ",
      "kus": "kus-Latn-ZZ",
      "kv": "kv-Cyrl-RU",
      "kvg": "kvg-Latn-ZZ",
      "kvr": "kvr-Latn-ID",
      "kvx": "kvx-Arab-PK",
      "kw": "kw-Latn-GB",
      "kwj": "kwj-Latn-ZZ",
      "kwo": "kwo-Latn-ZZ",
      "kwq": "kwq-Latn-ZZ",
      "kxa": "kxa-Latn-ZZ",
      "kxc": "kxc-Ethi-ZZ",
      "kxe": "kxe-Latn-ZZ",
      "kxl": "kxl-Deva-IN",
      "kxm": "kxm-Thai-TH",
      "kxp": "kxp-Arab-PK",
      "kxw": "kxw-Latn-ZZ",
      "kxz": "kxz-Latn-ZZ",
      "ky": "ky-Cyrl-KG",
      "ky-Arab": "ky-Arab-CN",
      "ky-CN": "ky-Arab-CN",
      "ky-Latn": "ky-Latn-TR",
      "ky-TR": "ky-Latn-TR",
      "kye": "kye-Latn-ZZ",
      "kyx": "kyx-Latn-ZZ",
      "kzh": "kzh-Arab-ZZ",
      "kzj": "kzj-Latn-MY",
      "kzr": "kzr-Latn-ZZ",
      "kzt": "kzt-Latn-MY",
      "la": "la-Latn-VA",
      "lab": "lab-Lina-GR",
      "lad": "lad-Hebr-IL",
      "lag": "lag-Latn-TZ",
      "lah": "lah-Arab-PK",
      "laj": "laj-Latn-UG",
      "las": "las-Latn-ZZ",
      "lb": "lb-Latn-LU",
      "lbe": "lbe-Cyrl-RU",
      "lbu": "lbu-Latn-ZZ",
      "lbw": "lbw-Latn-ID",
      "lcm": "lcm-Latn-ZZ",
      "lcp": "lcp-Thai-CN",
      "ldb": "ldb-Latn-ZZ",
      "led": "led-Latn-ZZ",
      "lee": "lee-Latn-ZZ",
      "lem": "lem-Latn-ZZ",
      "lep": "lep-Lepc-IN",
      "leq": "leq-Latn-ZZ",
      "leu": "leu-Latn-ZZ",
      "lez": "lez-Cyrl-RU",
      "lg": "lg-Latn-UG",
      "lgg": "lgg-Latn-ZZ",
      "li": "li-Latn-NL",
      "lia": "lia-Latn-ZZ",
      "lid": "lid-Latn-ZZ",
      "lif": "lif-Deva-NP",
      "lif-Limb": "lif-Limb-IN",
      "lig": "lig-Latn-ZZ",
      "lih": "lih-Latn-ZZ",
      "lij": "lij-Latn-IT",
      "lis": "lis-Lisu-CN",
      "ljp": "ljp-Latn-ID",
      "lki": "lki-Arab-IR",
      "lkt": "lkt-Latn-US",
      "lle": "lle-Latn-ZZ",
      "lln": "lln-Latn-ZZ",
      "lmn": "lmn-Telu-IN",
      "lmo": "lmo-Latn-IT",
      "lmp": "lmp-Latn-ZZ",
      "ln": "ln-Latn-CD",
      "lns": "lns-Latn-ZZ",
      "lnu": "lnu-Latn-ZZ",
      "lo": "lo-Laoo-LA",
      "loj": "loj-Latn-ZZ",
      "lok": "lok-Latn-ZZ",
      "lol": "lol-Latn-CD",
      "lor": "lor-Latn-ZZ",
      "los": "los-Latn-ZZ",
      "loz": "loz-Latn-ZM",
      "lrc": "lrc-Arab-IR",
      "lt": "lt-Latn-LT",
      "ltg": "ltg-Latn-LV",
      "lu": "lu-Latn-CD",
      "lua": "lua-Latn-CD",
      "luo": "luo-Latn-KE",
      "luy": "luy-Latn-KE",
      "luz": "luz-Arab-IR",
      "lv": "lv-Latn-LV",
      "lwl": "lwl-Thai-TH",
      "lzh": "lzh-Hans-CN",
      "lzz": "lzz-Latn-TR",
      "mad": "mad-Latn-ID",
      "maf": "maf-Latn-CM",
      "mag": "mag-Deva-IN",
      "mai": "mai-Deva-IN",
      "mak": "mak-Latn-ID",
      "man": "man-Latn-GM",
      "man-GN": "man-Nkoo-GN",
      "man-Nkoo": "man-Nkoo-GN",
      "mas": "mas-Latn-KE",
      "maw": "maw-Latn-ZZ",
      "maz": "maz-Latn-MX",
      "mbh": "mbh-Latn-ZZ",
      "mbo": "mbo-Latn-ZZ",
      "mbq": "mbq-Latn-ZZ",
      "mbu": "mbu-Latn-ZZ",
      "mbw": "mbw-Latn-ZZ",
      "mci": "mci-Latn-ZZ",
      "mcp": "mcp-Latn-ZZ",
      "mcq": "mcq-Latn-ZZ",
      "mcr": "mcr-Latn-ZZ",
      "mcu": "mcu-Latn-ZZ",
      "mda": "mda-Latn-ZZ",
      "mde": "mde-Arab-ZZ",
      "mdf": "mdf-Cyrl-RU",
      "mdh": "mdh-Latn-PH",
      "mdj": "mdj-Latn-ZZ",
      "mdr": "mdr-Latn-ID",
      "mdx": "mdx-Ethi-ZZ",
      "med": "med-Latn-ZZ",
      "mee": "mee-Latn-ZZ",
      "mek": "mek-Latn-ZZ",
      "men": "men-Latn-SL",
      "mer": "mer-Latn-KE",
      "met": "met-Latn-ZZ",
      "meu": "meu-Latn-ZZ",
      "mfa": "mfa-Arab-TH",
      "mfe": "mfe-Latn-MU",
      "mfn": "mfn-Latn-ZZ",
      "mfo": "mfo-Latn-ZZ",
      "mfq": "mfq-Latn-ZZ",
      "mg": "mg-Latn-MG",
      "mgh": "mgh-Latn-MZ",
      "mgl": "mgl-Latn-ZZ",
      "mgo": "mgo-Latn-CM",
      "mgp": "mgp-Deva-NP",
      "mgy": "mgy-Latn-TZ",
      "mh": "mh-Latn-MH",
      "mhi": "mhi-Latn-ZZ",
      "mhl": "mhl-Latn-ZZ",
      "mi": "mi-Latn-NZ",
      "mif": "mif-Latn-ZZ",
      "min": "min-Latn-ID",
      "mis": "mis-Hatr-IQ",
      "mis-Medf": "mis-Medf-NG",
      "miw": "miw-Latn-ZZ",
      "mk": "mk-Cyrl-MK",
      "mki": "mki-Arab-ZZ",
      "mkl": "mkl-Latn-ZZ",
      "mkp": "mkp-Latn-ZZ",
      "mkw": "mkw-Latn-ZZ",
      "ml": "ml-Mlym-IN",
      "mle": "mle-Latn-ZZ",
      "mlp": "mlp-Latn-ZZ",
      "mls": "mls-Latn-SD",
      "mmo": "mmo-Latn-ZZ",
      "mmu": "mmu-Latn-ZZ",
      "mmx": "mmx-Latn-ZZ",
      "mn": "mn-Cyrl-MN",
      "mn-CN": "mn-Mong-CN",
      "mn-Mong": "mn-Mong-CN",
      "mna": "mna-Latn-ZZ",
      "mnf": "mnf-Latn-ZZ",
      "mni": "mni-Beng-IN",
      "mnw": "mnw-Mymr-MM",
      "mo": "mo-Latn-RO",
      "moa": "moa-Latn-ZZ",
      "moe": "moe-Latn-CA",
      "moh": "moh-Latn-CA",
      "mos": "mos-Latn-BF",
      "mox": "mox-Latn-ZZ",
      "mpp": "mpp-Latn-ZZ",
      "mps": "mps-Latn-ZZ",
      "mpt": "mpt-Latn-ZZ",
      "mpx": "mpx-Latn-ZZ",
      "mql": "mql-Latn-ZZ",
      "mr": "mr-Deva-IN",
      "mrd": "mrd-Deva-NP",
      "mrj": "mrj-Cyrl-RU",
      "mro": "mro-Mroo-BD",
      "ms": "ms-Latn-MY",
      "ms-CC": "ms-Arab-CC",
      "mt": "mt-Latn-MT",
      "mtc": "mtc-Latn-ZZ",
      "mtf": "mtf-Latn-ZZ",
      "mti": "mti-Latn-ZZ",
      "mtr": "mtr-Deva-IN",
      "mua": "mua-Latn-CM",
      "mur": "mur-Latn-ZZ",
      "mus": "mus-Latn-US",
      "mva": "mva-Latn-ZZ",
      "mvn": "mvn-Latn-ZZ",
      "mvy": "mvy-Arab-PK",
      "mwk": "mwk-Latn-ML",
      "mwr": "mwr-Deva-IN",
      "mwv": "mwv-Latn-ID",
      "mww": "mww-Hmnp-US",
      "mxc": "mxc-Latn-ZW",
      "mxm": "mxm-Latn-ZZ",
      "my": "my-Mymr-MM",
      "myk": "myk-Latn-ZZ",
      "mym": "mym-Ethi-ZZ",
      "myv": "myv-Cyrl-RU",
      "myw": "myw-Latn-ZZ",
      "myx": "myx-Latn-UG",
      "myz": "myz-Mand-IR",
      "mzk": "mzk-Latn-ZZ",
      "mzm": "mzm-Latn-ZZ",
      "mzn": "mzn-Arab-IR",
      "mzp": "mzp-Latn-ZZ",
      "mzw": "mzw-Latn-ZZ",
      "mzz": "mzz-Latn-ZZ",
      "na": "na-Latn-NR",
      "nac": "nac-Latn-ZZ",
      "naf": "naf-Latn-ZZ",
      "nak": "nak-Latn-ZZ",
      "nan": "nan-Hans-CN",
      "nap": "nap-Latn-IT",
      "naq": "naq-Latn-NA",
      "nas": "nas-Latn-ZZ",
      "nb": "nb-Latn-NO",
      "nca": "nca-Latn-ZZ",
      "nce": "nce-Latn-ZZ",
      "ncf": "ncf-Latn-ZZ",
      "nch": "nch-Latn-MX",
      "nco": "nco-Latn-ZZ",
      "ncu": "ncu-Latn-ZZ",
      "nd": "nd-Latn-ZW",
      "ndc": "ndc-Latn-MZ",
      "nds": "nds-Latn-DE",
      "ne": "ne-Deva-NP",
      "neb": "neb-Latn-ZZ",
      "new": "new-Deva-NP",
      "nex": "nex-Latn-ZZ",
      "nfr": "nfr-Latn-ZZ",
      "ng": "ng-Latn-NA",
      "nga": "nga-Latn-ZZ",
      "ngb": "ngb-Latn-ZZ",
      "ngl": "ngl-Latn-MZ",
      "nhb": "nhb-Latn-ZZ",
      "nhe": "nhe-Latn-MX",
      "nhw": "nhw-Latn-MX",
      "nif": "nif-Latn-ZZ",
      "nii": "nii-Latn-ZZ",
      "nij": "nij-Latn-ID",
      "nin": "nin-Latn-ZZ",
      "niu": "niu-Latn-NU",
      "niy": "niy-Latn-ZZ",
      "niz": "niz-Latn-ZZ",
      "njo": "njo-Latn-IN",
      "nkg": "nkg-Latn-ZZ",
      "nko": "nko-Latn-ZZ",
      "nl": "nl-Latn-NL",
      "nmg": "nmg-Latn-CM",
      "nmz": "nmz-Latn-ZZ",
      "nn": "nn-Latn-NO",
      "nnf": "nnf-Latn-ZZ",
      "nnh": "nnh-Latn-CM",
      "nnk": "nnk-Latn-ZZ",
      "nnm": "nnm-Latn-ZZ",
      "nnp": "nnp-Wcho-IN",
      "no": "no-Latn-NO",
      "nod": "nod-Lana-TH",
      "noe": "noe-Deva-IN",
      "non": "non-Runr-SE",
      "nop": "nop-Latn-ZZ",
      "nou": "nou-Latn-ZZ",
      "nqo": "nqo-Nkoo-GN",
      "nr": "nr-Latn-ZA",
      "nrb": "nrb-Latn-ZZ",
      "nsk": "nsk-Cans-CA",
      "nsn": "nsn-Latn-ZZ",
      "nso": "nso-Latn-ZA",
      "nss": "nss-Latn-ZZ",
      "ntm": "ntm-Latn-ZZ",
      "ntr": "ntr-Latn-ZZ",
      "nui": "nui-Latn-ZZ",
      "nup": "nup-Latn-ZZ",
      "nus": "nus-Latn-SS",
      "nuv": "nuv-Latn-ZZ",
      "nux": "nux-Latn-ZZ",
      "nv": "nv-Latn-US",
      "nwb": "nwb-Latn-ZZ",
      "nxq": "nxq-Latn-CN",
      "nxr": "nxr-Latn-ZZ",
      "ny": "ny-Latn-MW",
      "nym": "nym-Latn-TZ",
      "nyn": "nyn-Latn-UG",
      "nzi": "nzi-Latn-GH",
      "oc": "oc-Latn-FR",
      "ogc": "ogc-Latn-ZZ",
      "okr": "okr-Latn-ZZ",
      "okv": "okv-Latn-ZZ",
      "om": "om-Latn-ET",
      "ong": "ong-Latn-ZZ",
      "onn": "onn-Latn-ZZ",
      "ons": "ons-Latn-ZZ",
      "opm": "opm-Latn-ZZ",
      "or": "or-Orya-IN",
      "oro": "oro-Latn-ZZ",
      "oru": "oru-Arab-ZZ",
      "os": "os-Cyrl-GE",
      "osa": "osa-Osge-US",
      "ota": "ota-Arab-ZZ",
      "otk": "otk-Orkh-MN",
      "ozm": "ozm-Latn-ZZ",
      "pa": "pa-Guru-IN",
      "pa-Arab": "pa-Arab-PK",
      "pa-PK": "pa-Arab-PK",
      "pag": "pag-Latn-PH",
      "pal": "pal-Phli-IR",
      "pal-Phlp": "pal-Phlp-CN",
      "pam": "pam-Latn-PH",
      "pap": "pap-Latn-AW",
      "pau": "pau-Latn-PW",
      "pbi": "pbi-Latn-ZZ",
      "pcd": "pcd-Latn-FR",
      "pcm": "pcm-Latn-NG",
      "pdc": "pdc-Latn-US",
      "pdt": "pdt-Latn-CA",
      "ped": "ped-Latn-ZZ",
      "peo": "peo-Xpeo-IR",
      "pex": "pex-Latn-ZZ",
      "pfl": "pfl-Latn-DE",
      "phl": "phl-Arab-ZZ",
      "phn": "phn-Phnx-LB",
      "pil": "pil-Latn-ZZ",
      "pip": "pip-Latn-ZZ",
      "pka": "pka-Brah-IN",
      "pko": "pko-Latn-KE",
      "pl": "pl-Latn-PL",
      "pla": "pla-Latn-ZZ",
      "pms": "pms-Latn-IT",
      "png": "png-Latn-ZZ",
      "pnn": "pnn-Latn-ZZ",
      "pnt": "pnt-Grek-GR",
      "pon": "pon-Latn-FM",
      "ppa": "ppa-Deva-IN",
      "ppo": "ppo-Latn-ZZ",
      "pra": "pra-Khar-PK",
      "prd": "prd-Arab-IR",
      "prg": "prg-Latn-001",
      "ps": "ps-Arab-AF",
      "pss": "pss-Latn-ZZ",
      "pt": "pt-Latn-BR",
      "ptp": "ptp-Latn-ZZ",
      "puu": "puu-Latn-GA",
      "pwa": "pwa-Latn-ZZ",
      "qu": "qu-Latn-PE",
      "quc": "quc-Latn-GT",
      "qug": "qug-Latn-EC",
      "rai": "rai-Latn-ZZ",
      "raj": "raj-Deva-IN",
      "rao": "rao-Latn-ZZ",
      "rcf": "rcf-Latn-RE",
      "rej": "rej-Latn-ID",
      "rel": "rel-Latn-ZZ",
      "res": "res-Latn-ZZ",
      "rgn": "rgn-Latn-IT",
      "rhg": "rhg-Arab-MM",
      "ria": "ria-Latn-IN",
      "rif": "rif-Tfng-MA",
      "rif-NL": "rif-Latn-NL",
      "rjs": "rjs-Deva-NP",
      "rkt": "rkt-Beng-BD",
      "rm": "rm-Latn-CH",
      "rmf": "rmf-Latn-FI",
      "rmo": "rmo-Latn-CH",
      "rmt": "rmt-Arab-IR",
      "rmu": "rmu-Latn-SE",
      "rn": "rn-Latn-BI",
      "rna": "rna-Latn-ZZ",
      "rng": "rng-Latn-MZ",
      "ro": "ro-Latn-RO",
      "rob": "rob-Latn-ID",
      "rof": "rof-Latn-TZ",
      "roo": "roo-Latn-ZZ",
      "rro": "rro-Latn-ZZ",
      "rtm": "rtm-Latn-FJ",
      "ru": "ru-Cyrl-RU",
      "rue": "rue-Cyrl-UA",
      "rug": "rug-Latn-SB",
      "rw": "rw-Latn-RW",
      "rwk": "rwk-Latn-TZ",
      "rwo": "rwo-Latn-ZZ",
      "ryu": "ryu-Kana-JP",
      "sa": "sa-Deva-IN",
      "saf": "saf-Latn-GH",
      "sah": "sah-Cyrl-RU",
      "saq": "saq-Latn-KE",
      "sas": "sas-Latn-ID",
      "sat": "sat-Olck-IN",
      "sav": "sav-Latn-SN",
      "saz": "saz-Saur-IN",
      "sba": "sba-Latn-ZZ",
      "sbe": "sbe-Latn-ZZ",
      "sbp": "sbp-Latn-TZ",
      "sc": "sc-Latn-IT",
      "sck": "sck-Deva-IN",
      "scl": "scl-Arab-ZZ",
      "scn": "scn-Latn-IT",
      "sco": "sco-Latn-GB",
      "scs": "scs-Latn-CA",
      "sd": "sd-Arab-PK",
      "sd-Deva": "sd-Deva-IN",
      "sd-Khoj": "sd-Khoj-IN",
      "sd-Sind": "sd-Sind-IN",
      "sdc": "sdc-Latn-IT",
      "sdh": "sdh-Arab-IR",
      "se": "se-Latn-NO",
      "sef": "sef-Latn-CI",
      "seh": "seh-Latn-MZ",
      "sei": "sei-Latn-MX",
      "ses": "ses-Latn-ML",
      "sg": "sg-Latn-CF",
      "sga": "sga-Ogam-IE",
      "sgs": "sgs-Latn-LT",
      "sgw": "sgw-Ethi-ZZ",
      "sgz": "sgz-Latn-ZZ",
      "shi": "shi-Tfng-MA",
      "shk": "shk-Latn-ZZ",
      "shn": "shn-Mymr-MM",
      "shu": "shu-Arab-ZZ",
      "si": "si-Sinh-LK",
      "sid": "sid-Latn-ET",
      "sig": "sig-Latn-ZZ",
      "sil": "sil-Latn-ZZ",
      "sim": "sim-Latn-ZZ",
      "sjr": "sjr-Latn-ZZ",
      "sk": "sk-Latn-SK",
      "skc": "skc-Latn-ZZ",
      "skr": "skr-Arab-PK",
      "sks": "sks-Latn-ZZ",
      "sl": "sl-Latn-SI",
      "sld": "sld-Latn-ZZ",
      "sli": "sli-Latn-PL",
      "sll": "sll-Latn-ZZ",
      "sly": "sly-Latn-ID",
      "sm": "sm-Latn-WS",
      "sma": "sma-Latn-SE",
      "smj": "smj-Latn-SE",
      "smn": "smn-Latn-FI",
      "smp": "smp-Samr-IL",
      "smq": "smq-Latn-ZZ",
      "sms": "sms-Latn-FI",
      "sn": "sn-Latn-ZW",
      "snc": "snc-Latn-ZZ",
      "snk": "snk-Latn-ML",
      "snp": "snp-Latn-ZZ",
      "snx": "snx-Latn-ZZ",
      "sny": "sny-Latn-ZZ",
      "so": "so-Latn-SO",
      "sog": "sog-Sogd-UZ",
      "sok": "sok-Latn-ZZ",
      "soq": "soq-Latn-ZZ",
      "sou": "sou-Thai-TH",
      "soy": "soy-Latn-ZZ",
      "spd": "spd-Latn-ZZ",
      "spl": "spl-Latn-ZZ",
      "sps": "sps-Latn-ZZ",
      "sq": "sq-Latn-AL",
      "sr": "sr-Cyrl-RS",
      "sr-ME": "sr-Latn-ME",
      "sr-RO": "sr-Latn-RO",
      "sr-RU": "sr-Latn-RU",
      "sr-TR": "sr-Latn-TR",
      "srb": "srb-Sora-IN",
      "srn": "srn-Latn-SR",
      "srr": "srr-Latn-SN",
      "srx": "srx-Deva-IN",
      "ss": "ss-Latn-ZA",
      "ssd": "ssd-Latn-ZZ",
      "ssg": "ssg-Latn-ZZ",
      "ssy": "ssy-Latn-ER",
      "st": "st-Latn-ZA",
      "stk": "stk-Latn-ZZ",
      "stq": "stq-Latn-DE",
      "su": "su-Latn-ID",
      "sua": "sua-Latn-ZZ",
      "sue": "sue-Latn-ZZ",
      "suk": "suk-Latn-TZ",
      "sur": "sur-Latn-ZZ",
      "sus": "sus-Latn-GN",
      "sv": "sv-Latn-SE",
      "sw": "sw-Latn-TZ",
      "swb": "swb-Arab-YT",
      "swc": "swc-Latn-CD",
      "swg": "swg-Latn-DE",
      "swp": "swp-Latn-ZZ",
      "swv": "swv-Deva-IN",
      "sxn": "sxn-Latn-ID",
      "sxw": "sxw-Latn-ZZ",
      "syl": "syl-Beng-BD",
      "syr": "syr-Syrc-IQ",
      "szl": "szl-Latn-PL",
      "ta": "ta-Taml-IN",
      "taj": "taj-Deva-NP",
      "tal": "tal-Latn-ZZ",
      "tan": "tan-Latn-ZZ",
      "taq": "taq-Latn-ZZ",
      "tbc": "tbc-Latn-ZZ",
      "tbd": "tbd-Latn-ZZ",
      "tbf": "tbf-Latn-ZZ",
      "tbg": "tbg-Latn-ZZ",
      "tbo": "tbo-Latn-ZZ",
      "tbw": "tbw-Latn-PH",
      "tbz": "tbz-Latn-ZZ",
      "tci": "tci-Latn-ZZ",
      "tcy": "tcy-Knda-IN",
      "tdd": "tdd-Tale-CN",
      "tdg": "tdg-Deva-NP",
      "tdh": "tdh-Deva-NP",
      "tdu": "tdu-Latn-MY",
      "te": "te-Telu-IN",
      "ted": "ted-Latn-ZZ",
      "tem": "tem-Latn-SL",
      "teo": "teo-Latn-UG",
      "tet": "tet-Latn-TL",
      "tfi": "tfi-Latn-ZZ",
      "tg": "tg-Cyrl-TJ",
      "tg-Arab": "tg-Arab-PK",
      "tg-PK": "tg-Arab-PK",
      "tgc": "tgc-Latn-ZZ",
      "tgo": "tgo-Latn-ZZ",
      "tgu": "tgu-Latn-ZZ",
      "th": "th-Thai-TH",
      "thl": "thl-Deva-NP",
      "thq": "thq-Deva-NP",
      "thr": "thr-Deva-NP",
      "ti": "ti-Ethi-ET",
      "tif": "tif-Latn-ZZ",
      "tig": "tig-Ethi-ER",
      "tik": "tik-Latn-ZZ",
      "tim": "tim-Latn-ZZ",
      "tio": "tio-Latn-ZZ",
      "tiv": "tiv-Latn-NG",
      "tk": "tk-Latn-TM",
      "tkl": "tkl-Latn-TK",
      "tkr": "tkr-Latn-AZ",
      "tkt": "tkt-Deva-NP",
      "tl": "tl-Latn-PH",
      "tlf": "tlf-Latn-ZZ",
      "tlx": "tlx-Latn-ZZ",
      "tly": "tly-Latn-AZ",
      "tmh": "tmh-Latn-NE",
      "tmy": "tmy-Latn-ZZ",
      "tn": "tn-Latn-ZA",
      "tnh": "tnh-Latn-ZZ",
      "to": "to-Latn-TO",
      "tof": "tof-Latn-ZZ",
      "tog": "tog-Latn-MW",
      "toq": "toq-Latn-ZZ",
      "tpi": "tpi-Latn-PG",
      "tpm": "tpm-Latn-ZZ",
      "tpz": "tpz-Latn-ZZ",
      "tqo": "tqo-Latn-ZZ",
      "tr": "tr-Latn-TR",
      "tru": "tru-Latn-TR",
      "trv": "trv-Latn-TW",
      "trw": "trw-Arab-PK",
      "ts": "ts-Latn-ZA",
      "tsd": "tsd-Grek-GR",
      "tsf": "tsf-Deva-NP",
      "tsg": "tsg-Latn-PH",
      "tsj": "tsj-Tibt-BT",
      "tsw": "tsw-Latn-ZZ",
      "tt": "tt-Cyrl-RU",
      "ttd": "ttd-Latn-ZZ",
      "tte": "tte-Latn-ZZ",
      "ttj": "ttj-Latn-UG",
      "ttr": "ttr-Latn-ZZ",
      "tts": "tts-Thai-TH",
      "ttt": "ttt-Latn-AZ",
      "tuh": "tuh-Latn-ZZ",
      "tul": "tul-Latn-ZZ",
      "tum": "tum-Latn-MW",
      "tuq": "tuq-Latn-ZZ",
      "tvd": "tvd-Latn-ZZ",
      "tvl": "tvl-Latn-TV",
      "tvu": "tvu-Latn-ZZ",
      "twh": "twh-Latn-ZZ",
      "twq": "twq-Latn-NE",
      "txg": "txg-Tang-CN",
      "ty": "ty-Latn-PF",
      "tya": "tya-Latn-ZZ",
      "tyv": "tyv-Cyrl-RU",
      "tzm": "tzm-Latn-MA",
      "ubu": "ubu-Latn-ZZ",
      "udm": "udm-Cyrl-RU",
      "ug": "ug-Arab-CN",
      "ug-Cyrl": "ug-Cyrl-KZ",
      "ug-KZ": "ug-Cyrl-KZ",
      "ug-MN": "ug-Cyrl-MN",
      "uga": "uga-Ugar-SY",
      "uk": "uk-Cyrl-UA",
      "uli": "uli-Latn-FM",
      "umb": "umb-Latn-AO",
      "und": "en-Latn-US",
      "und-002": "en-Latn-NG",
      "und-003": "en-Latn-US",
      "und-005": "pt-Latn-BR",
      "und-009": "en-Latn-AU",
      "und-011": "en-Latn-NG",
      "und-013": "es-Latn-MX",
      "und-014": "sw-Latn-TZ",
      "und-015": "ar-Arab-EG",
      "und-017": "sw-Latn-CD",
      "und-018": "en-Latn-ZA",
      "und-019": "en-Latn-US",
      "und-021": "en-Latn-US",
      "und-029": "es-Latn-CU",
      "und-030": "zh-Hans-CN",
      "und-034": "hi-Deva-IN",
      "und-035": "id-Latn-ID",
      "und-039": "it-Latn-IT",
      "und-053": "en-Latn-AU",
      "und-054": "en-Latn-PG",
      "und-057": "en-Latn-GU",
      "und-061": "sm-Latn-WS",
      "und-142": "zh-Hans-CN",
      "und-143": "uz-Latn-UZ",
      "und-145": "ar-Arab-SA",
      "und-150": "ru-Cyrl-RU",
      "und-151": "ru-Cyrl-RU",
      "und-154": "en-Latn-GB",
      "und-155": "de-Latn-DE",
      "und-202": "en-Latn-NG",
      "und-419": "es-Latn-419",
      "und-AD": "ca-Latn-AD",
      "und-Adlm": "ff-Adlm-GN",
      "und-AE": "ar-Arab-AE",
      "und-AF": "fa-Arab-AF",
      "und-Aghb": "lez-Aghb-RU",
      "und-Ahom": "aho-Ahom-IN",
      "und-AL": "sq-Latn-AL",
      "und-AM": "hy-Armn-AM",
      "und-AO": "pt-Latn-AO",
      "und-AQ": "und-Latn-AQ",
      "und-AR": "es-Latn-AR",
      "und-Arab": "ar-Arab-EG",
      "und-Arab-CC": "ms-Arab-CC",
      "und-Arab-CN": "ug-Arab-CN",
      "und-Arab-GB": "ks-Arab-GB",
      "und-Arab-ID": "ms-Arab-ID",
      "und-Arab-IN": "ur-Arab-IN",
      "und-Arab-KH": "cja-Arab-KH",
      "und-Arab-MM": "rhg-Arab-MM",
      "und-Arab-MN": "kk-Arab-MN",
      "und-Arab-MU": "ur-Arab-MU",
      "und-Arab-NG": "ha-Arab-NG",
      "und-Arab-PK": "ur-Arab-PK",
      "und-Arab-TG": "apd-Arab-TG",
      "und-Arab-TH": "mfa-Arab-TH",
      "und-Arab-TJ": "fa-Arab-TJ",
      "und-Arab-TR": "az-Arab-TR",
      "und-Arab-YT": "swb-Arab-YT",
      "und-Armi": "arc-Armi-IR",
      "und-Armn": "hy-Armn-AM",
      "und-AS": "sm-Latn-AS",
      "und-AT": "de-Latn-AT",
      "und-Avst": "ae-Avst-IR",
      "und-AW": "nl-Latn-AW",
      "und-AX": "sv-Latn-AX",
      "und-AZ": "az-Latn-AZ",
      "und-BA": "bs-Latn-BA",
      "und-Bali": "ban-Bali-ID",
      "und-Bamu": "bax-Bamu-CM",
      "und-Bass": "bsq-Bass-LR",
      "und-Batk": "bbc-Batk-ID",
      "und-BD": "bn-Beng-BD",
      "und-BE": "nl-Latn-BE",
      "und-Beng": "bn-Beng-BD",
      "und-BF": "fr-Latn-BF",
      "und-BG": "bg-Cyrl-BG",
      "und-BH": "ar-Arab-BH",
      "und-Bhks": "sa-Bhks-IN",
      "und-BI": "rn-Latn-BI",
      "und-BJ": "fr-Latn-BJ",
      "und-BL": "fr-Latn-BL",
      "und-BN": "ms-Latn-BN",
      "und-BO": "es-Latn-BO",
      "und-Bopo": "zh-Bopo-TW",
      "und-BQ": "pap-Latn-BQ",
      "und-BR": "pt-Latn-BR",
      "und-Brah": "pka-Brah-IN",
      "und-Brai": "fr-Brai-FR",
      "und-BT": "dz-Tibt-BT",
      "und-Bugi": "bug-Bugi-ID",
      "und-Buhd": "bku-Buhd-PH",
      "und-BV": "und-Latn-BV",
      "und-BY": "be-Cyrl-BY",
      "und-Cakm": "ccp-Cakm-BD",
      "und-Cans": "cr-Cans-CA",
      "und-Cari": "xcr-Cari-TR",
      "und-CD": "sw-Latn-CD",
      "und-CF": "fr-Latn-CF",
      "und-CG": "fr-Latn-CG",
      "und-CH": "de-Latn-CH",
      "und-Cham": "cjm-Cham-VN",
      "und-Cher": "chr-Cher-US",
      "und-Chrs": "xco-Chrs-UZ",
      "und-CI": "fr-Latn-CI",
      "und-CL": "es-Latn-CL",
      "und-CM": "fr-Latn-CM",
      "und-CN": "zh-Hans-CN",
      "und-CO": "es-Latn-CO",
      "und-Copt": "cop-Copt-EG",
      "und-CP": "und-Latn-CP",
      "und-Cprt": "grc-Cprt-CY",
      "und-CR": "es-Latn-CR",
      "und-CU": "es-Latn-CU",
      "und-CV": "pt-Latn-CV",
      "und-CW": "pap-Latn-CW",
      "und-CY": "el-Grek-CY",
      "und-Cyrl": "ru-Cyrl-RU",
      "und-Cyrl-AL": "mk-Cyrl-AL",
      "und-Cyrl-BA": "sr-Cyrl-BA",
      "und-Cyrl-GE": "os-Cyrl-GE",
      "und-Cyrl-GR": "mk-Cyrl-GR",
      "und-Cyrl-MD": "uk-Cyrl-MD",
      "und-Cyrl-RO": "bg-Cyrl-RO",
      "und-Cyrl-SK": "uk-Cyrl-SK",
      "und-Cyrl-TR": "kbd-Cyrl-TR",
      "und-Cyrl-XK": "sr-Cyrl-XK",
      "und-CZ": "cs-Latn-CZ",
      "und-DE": "de-Latn-DE",
      "und-Deva": "hi-Deva-IN",
      "und-Deva-BT": "ne-Deva-BT",
      "und-Deva-FJ": "hif-Deva-FJ",
      "und-Deva-MU": "bho-Deva-MU",
      "und-Deva-PK": "btv-Deva-PK",
      "und-Diak": "dv-Diak-MV",
      "und-DJ": "aa-Latn-DJ",
      "und-DK": "da-Latn-DK",
      "und-DO": "es-Latn-DO",
      "und-Dogr": "doi-Dogr-IN",
      "und-Dupl": "fr-Dupl-FR",
      "und-DZ": "ar-Arab-DZ",
      "und-EA": "es-Latn-EA",
      "und-EC": "es-Latn-EC",
      "und-EE": "et-Latn-EE",
      "und-EG": "ar-Arab-EG",
      "und-Egyp": "egy-Egyp-EG",
      "und-EH": "ar-Arab-EH",
      "und-Elba": "sq-Elba-AL",
      "und-Elym": "arc-Elym-IR",
      "und-ER": "ti-Ethi-ER",
      "und-ES": "es-Latn-ES",
      "und-ET": "am-Ethi-ET",
      "und-Ethi": "am-Ethi-ET",
      "und-EU": "en-Latn-IE",
      "und-EZ": "de-Latn-EZ",
      "und-FI": "fi-Latn-FI",
      "und-FO": "fo-Latn-FO",
      "und-FR": "fr-Latn-FR",
      "und-GA": "fr-Latn-GA",
      "und-GE": "ka-Geor-GE",
      "und-Geor": "ka-Geor-GE",
      "und-GF": "fr-Latn-GF",
      "und-GH": "ak-Latn-GH",
      "und-GL": "kl-Latn-GL",
      "und-Glag": "cu-Glag-BG",
      "und-GN": "fr-Latn-GN",
      "und-Gong": "wsg-Gong-IN",
      "und-Gonm": "esg-Gonm-IN",
      "und-Goth": "got-Goth-UA",
      "und-GP": "fr-Latn-GP",
      "und-GQ": "es-Latn-GQ",
      "und-GR": "el-Grek-GR",
      "und-Gran": "sa-Gran-IN",
      "und-Grek": "el-Grek-GR",
      "und-Grek-TR": "bgx-Grek-TR",
      "und-GS": "und-Latn-GS",
      "und-GT": "es-Latn-GT",
      "und-Gujr": "gu-Gujr-IN",
      "und-Guru": "pa-Guru-IN",
      "und-GW": "pt-Latn-GW",
      "und-Hanb": "zh-Hanb-TW",
      "und-Hang": "ko-Hang-KR",
      "und-Hani": "zh-Hani-CN",
      "und-Hano": "hnn-Hano-PH",
      "und-Hans": "zh-Hans-CN",
      "und-Hant": "zh-Hant-TW",
      "und-Hatr": "mis-Hatr-IQ",
      "und-Hebr": "he-Hebr-IL",
      "und-Hebr-CA": "yi-Hebr-CA",
      "und-Hebr-GB": "yi-Hebr-GB",
      "und-Hebr-SE": "yi-Hebr-SE",
      "und-Hebr-UA": "yi-Hebr-UA",
      "und-Hebr-US": "yi-Hebr-US",
      "und-Hira": "ja-Hira-JP",
      "und-HK": "zh-Hant-HK",
      "und-Hluw": "hlu-Hluw-TR",
      "und-HM": "und-Latn-HM",
      "und-Hmng": "hnj-Hmng-LA",
      "und-Hmnp": "mww-Hmnp-US",
      "und-HN": "es-Latn-HN",
      "und-HR": "hr-Latn-HR",
      "und-HT": "ht-Latn-HT",
      "und-HU": "hu-Latn-HU",
      "und-Hung": "hu-Hung-HU",
      "und-IC": "es-Latn-IC",
      "und-ID": "id-Latn-ID",
      "und-IL": "he-Hebr-IL",
      "und-IN": "hi-Deva-IN",
      "und-IQ": "ar-Arab-IQ",
      "und-IR": "fa-Arab-IR",
      "und-IS": "is-Latn-IS",
      "und-IT": "it-Latn-IT",
      "und-Ital": "ett-Ital-IT",
      "und-Jamo": "ko-Jamo-KR",
      "und-Java": "jv-Java-ID",
      "und-JO": "ar-Arab-JO",
      "und-JP": "ja-Jpan-JP",
      "und-Jpan": "ja-Jpan-JP",
      "und-Kali": "eky-Kali-MM",
      "und-Kana": "ja-Kana-JP",
      "und-KE": "sw-Latn-KE",
      "und-KG": "ky-Cyrl-KG",
      "und-KH": "km-Khmr-KH",
      "und-Khar": "pra-Khar-PK",
      "und-Khmr": "km-Khmr-KH",
      "und-Khoj": "sd-Khoj-IN",
      "und-Kits": "zkt-Kits-CN",
      "und-KM": "ar-Arab-KM",
      "und-Knda": "kn-Knda-IN",
      "und-Kore": "ko-Kore-KR",
      "und-KP": "ko-Kore-KP",
      "und-KR": "ko-Kore-KR",
      "und-Kthi": "bho-Kthi-IN",
      "und-KW": "ar-Arab-KW",
      "und-KZ": "ru-Cyrl-KZ",
      "und-LA": "lo-Laoo-LA",
      "und-Lana": "nod-Lana-TH",
      "und-Laoo": "lo-Laoo-LA",
      "und-Latn-AF": "tk-Latn-AF",
      "und-Latn-AM": "ku-Latn-AM",
      "und-Latn-CN": "za-Latn-CN",
      "und-Latn-CY": "tr-Latn-CY",
      "und-Latn-DZ": "fr-Latn-DZ",
      "und-Latn-ET": "en-Latn-ET",
      "und-Latn-GE": "ku-Latn-GE",
      "und-Latn-IR": "tk-Latn-IR",
      "und-Latn-KM": "fr-Latn-KM",
      "und-Latn-MA": "fr-Latn-MA",
      "und-Latn-MK": "sq-Latn-MK",
      "und-Latn-MM": "kac-Latn-MM",
      "und-Latn-MO": "pt-Latn-MO",
      "und-Latn-MR": "fr-Latn-MR",
      "und-Latn-RU": "krl-Latn-RU",
      "und-Latn-SY": "fr-Latn-SY",
      "und-Latn-TN": "fr-Latn-TN",
      "und-Latn-TW": "trv-Latn-TW",
      "und-Latn-UA": "pl-Latn-UA",
      "und-LB": "ar-Arab-LB",
      "und-Lepc": "lep-Lepc-IN",
      "und-LI": "de-Latn-LI",
      "und-Limb": "lif-Limb-IN",
      "und-Lina": "lab-Lina-GR",
      "und-Linb": "grc-Linb-GR",
      "und-Lisu": "lis-Lisu-CN",
      "und-LK": "si-Sinh-LK",
      "und-LS": "st-Latn-LS",
      "und-LT": "lt-Latn-LT",
      "und-LU": "fr-Latn-LU",
      "und-LV": "lv-Latn-LV",
      "und-LY": "ar-Arab-LY",
      "und-Lyci": "xlc-Lyci-TR",
      "und-Lydi": "xld-Lydi-TR",
      "und-MA": "ar-Arab-MA",
      "und-Mahj": "hi-Mahj-IN",
      "und-Maka": "mak-Maka-ID",
      "und-Mand": "myz-Mand-IR",
      "und-Mani": "xmn-Mani-CN",
      "und-Marc": "bo-Marc-CN",
      "und-MC": "fr-Latn-MC",
      "und-MD": "ro-Latn-MD",
      "und-ME": "sr-Latn-ME",
      "und-Medf": "mis-Medf-NG",
      "und-Mend": "men-Mend-SL",
      "und-Merc": "xmr-Merc-SD",
      "und-Mero": "xmr-Mero-SD",
      "und-MF": "fr-Latn-MF",
      "und-MG": "mg-Latn-MG",
      "und-MK": "mk-Cyrl-MK",
      "und-ML": "bm-Latn-ML",
      "und-Mlym": "ml-Mlym-IN",
      "und-MM": "my-Mymr-MM",
      "und-MN": "mn-Cyrl-MN",
      "und-MO": "zh-Hant-MO",
      "und-Modi": "mr-Modi-IN",
      "und-Mong": "mn-Mong-CN",
      "und-MQ": "fr-Latn-MQ",
      "und-MR": "ar-Arab-MR",
      "und-Mroo": "mro-Mroo-BD",
      "und-MT": "mt-Latn-MT",
      "und-Mtei": "mni-Mtei-IN",
      "und-MU": "mfe-Latn-MU",
      "und-Mult": "skr-Mult-PK",
      "und-MV": "dv-Thaa-MV",
      "und-MX": "es-Latn-MX",
      "und-MY": "ms-Latn-MY",
      "und-Mymr": "my-Mymr-MM",
      "und-Mymr-IN": "kht-Mymr-IN",
      "und-Mymr-TH": "mnw-Mymr-TH",
      "und-MZ": "pt-Latn-MZ",
      "und-NA": "af-Latn-NA",
      "und-Nand": "sa-Nand-IN",
      "und-Narb": "xna-Narb-SA",
      "und-Nbat": "arc-Nbat-JO",
      "und-NC": "fr-Latn-NC",
      "und-NE": "ha-Latn-NE",
      "und-Newa": "new-Newa-NP",
      "und-NI": "es-Latn-NI",
      "und-Nkoo": "man-Nkoo-GN",
      "und-NL": "nl-Latn-NL",
      "und-NO": "nb-Latn-NO",
      "und-NP": "ne-Deva-NP",
      "und-Nshu": "zhx-Nshu-CN",
      "und-Ogam": "sga-Ogam-IE",
      "und-Olck": "sat-Olck-IN",
      "und-OM": "ar-Arab-OM",
      "und-Orkh": "otk-Orkh-MN",
      "und-Orya": "or-Orya-IN",
      "und-Osge": "osa-Osge-US",
      "und-Osma": "so-Osma-SO",
      "und-PA": "es-Latn-PA",
      "und-Palm": "arc-Palm-SY",
      "und-Pauc": "ctd-Pauc-MM",
      "und-PE": "es-Latn-PE",
      "und-Perm": "kv-Perm-RU",
      "und-PF": "fr-Latn-PF",
      "und-PG": "tpi-Latn-PG",
      "und-PH": "fil-Latn-PH",
      "und-Phag": "lzh-Phag-CN",
      "und-Phli": "pal-Phli-IR",
      "und-Phlp": "pal-Phlp-CN",
      "und-Phnx": "phn-Phnx-LB",
      "und-PK": "ur-Arab-PK",
      "und-PL": "pl-Latn-PL",
      "und-Plrd": "hmd-Plrd-CN",
      "und-PM": "fr-Latn-PM",
      "und-PR": "es-Latn-PR",
      "und-Prti": "xpr-Prti-IR",
      "und-PS": "ar-Arab-PS",
      "und-PT": "pt-Latn-PT",
      "und-PW": "pau-Latn-PW",
      "und-PY": "gn-Latn-PY",
      "und-QA": "ar-Arab-QA",
      "und-QO": "en-Latn-DG",
      "und-RE": "fr-Latn-RE",
      "und-Rjng": "rej-Rjng-ID",
      "und-RO": "ro-Latn-RO",
      "und-Rohg": "rhg-Rohg-MM",
      "und-RS": "sr-Cyrl-RS",
      "und-RU": "ru-Cyrl-RU",
      "und-Runr": "non-Runr-SE",
      "und-RW": "rw-Latn-RW",
      "und-SA": "ar-Arab-SA",
      "und-Samr": "smp-Samr-IL",
      "und-Sarb": "xsa-Sarb-YE",
      "und-Saur": "saz-Saur-IN",
      "und-SC": "fr-Latn-SC",
      "und-SD": "ar-Arab-SD",
      "und-SE": "sv-Latn-SE",
      "und-Sgnw": "ase-Sgnw-US",
      "und-Shaw": "en-Shaw-GB",
      "und-Shrd": "sa-Shrd-IN",
      "und-SI": "sl-Latn-SI",
      "und-Sidd": "sa-Sidd-IN",
      "und-Sind": "sd-Sind-IN",
      "und-Sinh": "si-Sinh-LK",
      "und-SJ": "nb-Latn-SJ",
      "und-SK": "sk-Latn-SK",
      "und-SM": "it-Latn-SM",
      "und-SN": "fr-Latn-SN",
      "und-SO": "so-Latn-SO",
      "und-Sogd": "sog-Sogd-UZ",
      "und-Sogo": "sog-Sogo-UZ",
      "und-Sora": "srb-Sora-IN",
      "und-Soyo": "cmg-Soyo-MN",
      "und-SR": "nl-Latn-SR",
      "und-ST": "pt-Latn-ST",
      "und-Sund": "su-Sund-ID",
      "und-SV": "es-Latn-SV",
      "und-SY": "ar-Arab-SY",
      "und-Sylo": "syl-Sylo-BD",
      "und-Syrc": "syr-Syrc-IQ",
      "und-Tagb": "tbw-Tagb-PH",
      "und-Takr": "doi-Takr-IN",
      "und-Tale": "tdd-Tale-CN",
      "und-Talu": "khb-Talu-CN",
      "und-Taml": "ta-Taml-IN",
      "und-Tang": "txg-Tang-CN",
      "und-Tavt": "blt-Tavt-VN",
      "und-TD": "fr-Latn-TD",
      "und-Telu": "te-Telu-IN",
      "und-TF": "fr-Latn-TF",
      "und-Tfng": "zgh-Tfng-MA",
      "und-TG": "fr-Latn-TG",
      "und-Tglg": "fil-Tglg-PH",
      "und-TH": "th-Thai-TH",
      "und-Thaa": "dv-Thaa-MV",
      "und-Thai": "th-Thai-TH",
      "und-Thai-CN": "lcp-Thai-CN",
      "und-Thai-KH": "kdt-Thai-KH",
      "und-Thai-LA": "kdt-Thai-LA",
      "und-Tibt": "bo-Tibt-CN",
      "und-Tirh": "mai-Tirh-IN",
      "und-TJ": "tg-Cyrl-TJ",
      "und-TK": "tkl-Latn-TK",
      "und-TL": "pt-Latn-TL",
      "und-TM": "tk-Latn-TM",
      "und-TN": "ar-Arab-TN",
      "und-TO": "to-Latn-TO",
      "und-TR": "tr-Latn-TR",
      "und-TV": "tvl-Latn-TV",
      "und-TW": "zh-Hant-TW",
      "und-TZ": "sw-Latn-TZ",
      "und-UA": "uk-Cyrl-UA",
      "und-UG": "sw-Latn-UG",
      "und-Ugar": "uga-Ugar-SY",
      "und-UY": "es-Latn-UY",
      "und-UZ": "uz-Latn-UZ",
      "und-VA": "it-Latn-VA",
      "und-Vaii": "vai-Vaii-LR",
      "und-VE": "es-Latn-VE",
      "und-VN": "vi-Latn-VN",
      "und-VU": "bi-Latn-VU",
      "und-Wara": "hoc-Wara-IN",
      "und-Wcho": "nnp-Wcho-IN",
      "und-WF": "fr-Latn-WF",
      "und-WS": "sm-Latn-WS",
      "und-XK": "sq-Latn-XK",
      "und-Xpeo": "peo-Xpeo-IR",
      "und-Xsux": "akk-Xsux-IQ",
      "und-YE": "ar-Arab-YE",
      "und-Yezi": "ku-Yezi-GE",
      "und-Yiii": "ii-Yiii-CN",
      "und-YT": "fr-Latn-YT",
      "und-Zanb": "cmg-Zanb-MN",
      "und-ZW": "sn-Latn-ZW",
      "unr": "unr-Beng-IN",
      "unr-Deva": "unr-Deva-NP",
      "unr-NP": "unr-Deva-NP",
      "unx": "unx-Beng-IN",
      "uok": "uok-Latn-ZZ",
      "ur": "ur-Arab-PK",
      "uri": "uri-Latn-ZZ",
      "urt": "urt-Latn-ZZ",
      "urw": "urw-Latn-ZZ",
      "usa": "usa-Latn-ZZ",
      "uth": "uth-Latn-ZZ",
      "utr": "utr-Latn-ZZ",
      "uvh": "uvh-Latn-ZZ",
      "uvl": "uvl-Latn-ZZ",
      "uz": "uz-Latn-UZ",
      "uz-AF": "uz-Arab-AF",
      "uz-Arab": "uz-Arab-AF",
      "uz-CN": "uz-Cyrl-CN",
      "vag": "vag-Latn-ZZ",
      "vai": "vai-Vaii-LR",
      "van": "van-Latn-ZZ",
      "ve": "ve-Latn-ZA",
      "vec": "vec-Latn-IT",
      "vep": "vep-Latn-RU",
      "vi": "vi-Latn-VN",
      "vic": "vic-Latn-SX",
      "viv": "viv-Latn-ZZ",
      "vls": "vls-Latn-BE",
      "vmf": "vmf-Latn-DE",
      "vmw": "vmw-Latn-MZ",
      "vo": "vo-Latn-001",
      "vot": "vot-Latn-RU",
      "vro": "vro-Latn-EE",
      "vun": "vun-Latn-TZ",
      "vut": "vut-Latn-ZZ",
      "wa": "wa-Latn-BE",
      "wae": "wae-Latn-CH",
      "waj": "waj-Latn-ZZ",
      "wal": "wal-Ethi-ET",
      "wan": "wan-Latn-ZZ",
      "war": "war-Latn-PH",
      "wbp": "wbp-Latn-AU",
      "wbq": "wbq-Telu-IN",
      "wbr": "wbr-Deva-IN",
      "wci": "wci-Latn-ZZ",
      "wer": "wer-Latn-ZZ",
      "wgi": "wgi-Latn-ZZ",
      "whg": "whg-Latn-ZZ",
      "wib": "wib-Latn-ZZ",
      "wiu": "wiu-Latn-ZZ",
      "wiv": "wiv-Latn-ZZ",
      "wja": "wja-Latn-ZZ",
      "wji": "wji-Latn-ZZ",
      "wls": "wls-Latn-WF",
      "wmo": "wmo-Latn-ZZ",
      "wnc": "wnc-Latn-ZZ",
      "wni": "wni-Arab-KM",
      "wnu": "wnu-Latn-ZZ",
      "wo": "wo-Latn-SN",
      "wob": "wob-Latn-ZZ",
      "wos": "wos-Latn-ZZ",
      "wrs": "wrs-Latn-ZZ",
      "wsg": "wsg-Gong-IN",
      "wsk": "wsk-Latn-ZZ",
      "wtm": "wtm-Deva-IN",
      "wuu": "wuu-Hans-CN",
      "wuv": "wuv-Latn-ZZ",
      "wwa": "wwa-Latn-ZZ",
      "xav": "xav-Latn-BR",
      "xbi": "xbi-Latn-ZZ",
      "xco": "xco-Chrs-UZ",
      "xcr": "xcr-Cari-TR",
      "xes": "xes-Latn-ZZ",
      "xh": "xh-Latn-ZA",
      "xla": "xla-Latn-ZZ",
      "xlc": "xlc-Lyci-TR",
      "xld": "xld-Lydi-TR",
      "xmf": "xmf-Geor-GE",
      "xmn": "xmn-Mani-CN",
      "xmr": "xmr-Merc-SD",
      "xna": "xna-Narb-SA",
      "xnr": "xnr-Deva-IN",
      "xog": "xog-Latn-UG",
      "xon": "xon-Latn-ZZ",
      "xpr": "xpr-Prti-IR",
      "xrb": "xrb-Latn-ZZ",
      "xsa": "xsa-Sarb-YE",
      "xsi": "xsi-Latn-ZZ",
      "xsm": "xsm-Latn-ZZ",
      "xsr": "xsr-Deva-NP",
      "xwe": "xwe-Latn-ZZ",
      "yam": "yam-Latn-ZZ",
      "yao": "yao-Latn-MZ",
      "yap": "yap-Latn-FM",
      "yas": "yas-Latn-ZZ",
      "yat": "yat-Latn-ZZ",
      "yav": "yav-Latn-CM",
      "yay": "yay-Latn-ZZ",
      "yaz": "yaz-Latn-ZZ",
      "yba": "yba-Latn-ZZ",
      "ybb": "ybb-Latn-CM",
      "yby": "yby-Latn-ZZ",
      "yer": "yer-Latn-ZZ",
      "ygr": "ygr-Latn-ZZ",
      "ygw": "ygw-Latn-ZZ",
      "yi": "yi-Hebr-001",
      "yko": "yko-Latn-ZZ",
      "yle": "yle-Latn-ZZ",
      "ylg": "ylg-Latn-ZZ",
      "yll": "yll-Latn-ZZ",
      "yml": "yml-Latn-ZZ",
      "yo": "yo-Latn-NG",
      "yon": "yon-Latn-ZZ",
      "yrb": "yrb-Latn-ZZ",
      "yre": "yre-Latn-ZZ",
      "yrl": "yrl-Latn-BR",
      "yss": "yss-Latn-ZZ",
      "yua": "yua-Latn-MX",
      "yue": "yue-Hant-HK",
      "yue-CN": "yue-Hans-CN",
      "yue-Hans": "yue-Hans-CN",
      "yuj": "yuj-Latn-ZZ",
      "yut": "yut-Latn-ZZ",
      "yuw": "yuw-Latn-ZZ",
      "za": "za-Latn-CN",
      "zag": "zag-Latn-SD",
      "zdj": "zdj-Arab-KM",
      "zea": "zea-Latn-NL",
      "zgh": "zgh-Tfng-MA",
      "zh": "zh-Hans-CN",
      "zh-AU": "zh-Hant-AU",
      "zh-BN": "zh-Hant-BN",
      "zh-Bopo": "zh-Bopo-TW",
      "zh-GB": "zh-Hant-GB",
      "zh-GF": "zh-Hant-GF",
      "zh-Hanb": "zh-Hanb-TW",
      "zh-Hant": "zh-Hant-TW",
      "zh-HK": "zh-Hant-HK",
      "zh-ID": "zh-Hant-ID",
      "zh-MO": "zh-Hant-MO",
      "zh-PA": "zh-Hant-PA",
      "zh-PF": "zh-Hant-PF",
      "zh-PH": "zh-Hant-PH",
      "zh-SR": "zh-Hant-SR",
      "zh-TH": "zh-Hant-TH",
      "zh-TW": "zh-Hant-TW",
      "zh-US": "zh-Hant-US",
      "zh-VN": "zh-Hant-VN",
      "zhx": "zhx-Nshu-CN",
      "zia": "zia-Latn-ZZ",
      "zkt": "zkt-Kits-CN",
      "zlm": "zlm-Latn-TG",
      "zmi": "zmi-Latn-MY",
      "zne": "zne-Latn-ZZ",
      "zu": "zu-Latn-ZA",
      "zza": "zza-Latn-TR"
    }
  }
}

},{}],87:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (_isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _isNativeFunction(fn) {
  return Function.toString.call(fn).indexOf("[native code]") !== -1;
}

function _wrapNativeSuper(Class) {
  var _cache = typeof Map === "function" ? new Map() : undefined;

  _wrapNativeSuper = function _wrapNativeSuper(Class) {
    if (Class === null || !_isNativeFunction(Class)) return Class;

    if (typeof Class !== "function") {
      throw new TypeError("Super expression must either be null or a function");
    }

    if (typeof _cache !== "undefined") {
      if (_cache.has(Class)) return _cache.get(Class);

      _cache.set(Class, Wrapper);
    }

    function Wrapper() {
      return _construct(Class, arguments, _getPrototypeOf(this).constructor);
    }

    Wrapper.prototype = Object.create(Class.prototype, {
      constructor: {
        value: Wrapper,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    return _setPrototypeOf(Wrapper, Class);
  };

  return _wrapNativeSuper(Class);
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(n);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o) {
  var i = 0;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (o = _unsupportedIterableToArray(o))) return function () {
      if (i >= o.length) return {
        done: true
      };
      return {
        done: false,
        value: o[i++]
      };
    };
    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  i = o[Symbol.iterator]();
  return i.next.bind(i);
}

// these aren't really private, but nor are they really useful to document

/**
 * @private
 */
var LuxonError = /*#__PURE__*/function (_Error) {
  _inheritsLoose(LuxonError, _Error);

  function LuxonError() {
    return _Error.apply(this, arguments) || this;
  }

  return LuxonError;
}( /*#__PURE__*/_wrapNativeSuper(Error));
/**
 * @private
 */


var InvalidDateTimeError = /*#__PURE__*/function (_LuxonError) {
  _inheritsLoose(InvalidDateTimeError, _LuxonError);

  function InvalidDateTimeError(reason) {
    return _LuxonError.call(this, "Invalid DateTime: " + reason.toMessage()) || this;
  }

  return InvalidDateTimeError;
}(LuxonError);
/**
 * @private
 */

var InvalidIntervalError = /*#__PURE__*/function (_LuxonError2) {
  _inheritsLoose(InvalidIntervalError, _LuxonError2);

  function InvalidIntervalError(reason) {
    return _LuxonError2.call(this, "Invalid Interval: " + reason.toMessage()) || this;
  }

  return InvalidIntervalError;
}(LuxonError);
/**
 * @private
 */

var InvalidDurationError = /*#__PURE__*/function (_LuxonError3) {
  _inheritsLoose(InvalidDurationError, _LuxonError3);

  function InvalidDurationError(reason) {
    return _LuxonError3.call(this, "Invalid Duration: " + reason.toMessage()) || this;
  }

  return InvalidDurationError;
}(LuxonError);
/**
 * @private
 */

var ConflictingSpecificationError = /*#__PURE__*/function (_LuxonError4) {
  _inheritsLoose(ConflictingSpecificationError, _LuxonError4);

  function ConflictingSpecificationError() {
    return _LuxonError4.apply(this, arguments) || this;
  }

  return ConflictingSpecificationError;
}(LuxonError);
/**
 * @private
 */

var InvalidUnitError = /*#__PURE__*/function (_LuxonError5) {
  _inheritsLoose(InvalidUnitError, _LuxonError5);

  function InvalidUnitError(unit) {
    return _LuxonError5.call(this, "Invalid unit " + unit) || this;
  }

  return InvalidUnitError;
}(LuxonError);
/**
 * @private
 */

var InvalidArgumentError = /*#__PURE__*/function (_LuxonError6) {
  _inheritsLoose(InvalidArgumentError, _LuxonError6);

  function InvalidArgumentError() {
    return _LuxonError6.apply(this, arguments) || this;
  }

  return InvalidArgumentError;
}(LuxonError);
/**
 * @private
 */

var ZoneIsAbstractError = /*#__PURE__*/function (_LuxonError7) {
  _inheritsLoose(ZoneIsAbstractError, _LuxonError7);

  function ZoneIsAbstractError() {
    return _LuxonError7.call(this, "Zone is an abstract class") || this;
  }

  return ZoneIsAbstractError;
}(LuxonError);

/**
 * @private
 */
var n = "numeric",
    s = "short",
    l = "long";
var DATE_SHORT = {
  year: n,
  month: n,
  day: n
};
var DATE_MED = {
  year: n,
  month: s,
  day: n
};
var DATE_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s
};
var DATE_FULL = {
  year: n,
  month: l,
  day: n
};
var DATE_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l
};
var TIME_SIMPLE = {
  hour: n,
  minute: n
};
var TIME_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n
};
var TIME_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s
};
var TIME_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l
};
var TIME_24_SIMPLE = {
  hour: n,
  minute: n,
  hour12: false
};
/**
 * {@link toLocaleString}; format like '09:30:23', always 24-hour.
 */

var TIME_24_WITH_SECONDS = {
  hour: n,
  minute: n,
  second: n,
  hour12: false
};
/**
 * {@link toLocaleString}; format like '09:30:23 EDT', always 24-hour.
 */

var TIME_24_WITH_SHORT_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hour12: false,
  timeZoneName: s
};
/**
 * {@link toLocaleString}; format like '09:30:23 Eastern Daylight Time', always 24-hour.
 */

var TIME_24_WITH_LONG_OFFSET = {
  hour: n,
  minute: n,
  second: n,
  hour12: false,
  timeZoneName: l
};
/**
 * {@link toLocaleString}; format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
 */

var DATETIME_SHORT = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n
};
/**
 * {@link toLocaleString}; format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
 */

var DATETIME_SHORT_WITH_SECONDS = {
  year: n,
  month: n,
  day: n,
  hour: n,
  minute: n,
  second: n
};
var DATETIME_MED = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n
};
var DATETIME_MED_WITH_SECONDS = {
  year: n,
  month: s,
  day: n,
  hour: n,
  minute: n,
  second: n
};
var DATETIME_MED_WITH_WEEKDAY = {
  year: n,
  month: s,
  day: n,
  weekday: s,
  hour: n,
  minute: n
};
var DATETIME_FULL = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  timeZoneName: s
};
var DATETIME_FULL_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: s
};
var DATETIME_HUGE = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  timeZoneName: l
};
var DATETIME_HUGE_WITH_SECONDS = {
  year: n,
  month: l,
  day: n,
  weekday: l,
  hour: n,
  minute: n,
  second: n,
  timeZoneName: l
};

/*
  This is just a junk drawer, containing anything used across multiple classes.
  Because Luxon is small(ish), this should stay small and we won't worry about splitting
  it up into, say, parsingUtil.js and basicUtil.js and so on. But they are divided up by feature area.
*/
/**
 * @private
 */
// TYPES

function isUndefined(o) {
  return typeof o === "undefined";
}
function isNumber(o) {
  return typeof o === "number";
}
function isInteger(o) {
  return typeof o === "number" && o % 1 === 0;
}
function isString(o) {
  return typeof o === "string";
}
function isDate(o) {
  return Object.prototype.toString.call(o) === "[object Date]";
} // CAPABILITIES

function hasIntl() {
  try {
    return typeof Intl !== "undefined" && Intl.DateTimeFormat;
  } catch (e) {
    return false;
  }
}
function hasFormatToParts() {
  return !isUndefined(Intl.DateTimeFormat.prototype.formatToParts);
}
function hasRelative() {
  try {
    return typeof Intl !== "undefined" && !!Intl.RelativeTimeFormat;
  } catch (e) {
    return false;
  }
} // OBJECTS AND ARRAYS

function maybeArray(thing) {
  return Array.isArray(thing) ? thing : [thing];
}
function bestBy(arr, by, compare) {
  if (arr.length === 0) {
    return undefined;
  }

  return arr.reduce(function (best, next) {
    var pair = [by(next), next];

    if (!best) {
      return pair;
    } else if (compare(best[0], pair[0]) === best[0]) {
      return best;
    } else {
      return pair;
    }
  }, null)[1];
}
function pick(obj, keys) {
  return keys.reduce(function (a, k) {
    a[k] = obj[k];
    return a;
  }, {});
}
function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
} // NUMBERS AND STRINGS

function integerBetween(thing, bottom, top) {
  return isInteger(thing) && thing >= bottom && thing <= top;
} // x % n but takes the sign of n instead of x

function floorMod(x, n) {
  return x - n * Math.floor(x / n);
}
function padStart(input, n) {
  if (n === void 0) {
    n = 2;
  }

  var minus = input < 0 ? "-" : "";
  var target = minus ? input * -1 : input;
  var result;

  if (target.toString().length < n) {
    result = ("0".repeat(n) + target).slice(-n);
  } else {
    result = target.toString();
  }

  return "" + minus + result;
}
function parseInteger(string) {
  if (isUndefined(string) || string === null || string === "") {
    return undefined;
  } else {
    return parseInt(string, 10);
  }
}
function parseMillis(fraction) {
  // Return undefined (instead of 0) in these cases, where fraction is not set
  if (isUndefined(fraction) || fraction === null || fraction === "") {
    return undefined;
  } else {
    var f = parseFloat("0." + fraction) * 1000;
    return Math.floor(f);
  }
}
function roundTo(number, digits, towardZero) {
  if (towardZero === void 0) {
    towardZero = false;
  }

  var factor = Math.pow(10, digits),
      rounder = towardZero ? Math.trunc : Math.round;
  return rounder(number * factor) / factor;
} // DATE BASICS

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
function daysInYear(year) {
  return isLeapYear(year) ? 366 : 365;
}
function daysInMonth(year, month) {
  var modMonth = floorMod(month - 1, 12) + 1,
      modYear = year + (month - modMonth) / 12;

  if (modMonth === 2) {
    return isLeapYear(modYear) ? 29 : 28;
  } else {
    return [31, null, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][modMonth - 1];
  }
} // covert a calendar object to a local timestamp (epoch, but with the offset baked in)

function objToLocalTS(obj) {
  var d = Date.UTC(obj.year, obj.month - 1, obj.day, obj.hour, obj.minute, obj.second, obj.millisecond); // for legacy reasons, years between 0 and 99 are interpreted as 19XX; revert that

  if (obj.year < 100 && obj.year >= 0) {
    d = new Date(d);
    d.setUTCFullYear(d.getUTCFullYear() - 1900);
  }

  return +d;
}
function weeksInWeekYear(weekYear) {
  var p1 = (weekYear + Math.floor(weekYear / 4) - Math.floor(weekYear / 100) + Math.floor(weekYear / 400)) % 7,
      last = weekYear - 1,
      p2 = (last + Math.floor(last / 4) - Math.floor(last / 100) + Math.floor(last / 400)) % 7;
  return p1 === 4 || p2 === 3 ? 53 : 52;
}
function untruncateYear(year) {
  if (year > 99) {
    return year;
  } else return year > 60 ? 1900 + year : 2000 + year;
} // PARSING

function parseZoneInfo(ts, offsetFormat, locale, timeZone) {
  if (timeZone === void 0) {
    timeZone = null;
  }

  var date = new Date(ts),
      intlOpts = {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  };

  if (timeZone) {
    intlOpts.timeZone = timeZone;
  }

  var modified = Object.assign({
    timeZoneName: offsetFormat
  }, intlOpts),
      intl = hasIntl();

  if (intl && hasFormatToParts()) {
    var parsed = new Intl.DateTimeFormat(locale, modified).formatToParts(date).find(function (m) {
      return m.type.toLowerCase() === "timezonename";
    });
    return parsed ? parsed.value : null;
  } else if (intl) {
    // this probably doesn't work for all locales
    var without = new Intl.DateTimeFormat(locale, intlOpts).format(date),
        included = new Intl.DateTimeFormat(locale, modified).format(date),
        diffed = included.substring(without.length),
        trimmed = diffed.replace(/^[, \u200e]+/, "");
    return trimmed;
  } else {
    return null;
  }
} // signedOffset('-5', '30') -> -330

function signedOffset(offHourStr, offMinuteStr) {
  var offHour = parseInt(offHourStr, 10); // don't || this because we want to preserve -0

  if (Number.isNaN(offHour)) {
    offHour = 0;
  }

  var offMin = parseInt(offMinuteStr, 10) || 0,
      offMinSigned = offHour < 0 || Object.is(offHour, -0) ? -offMin : offMin;
  return offHour * 60 + offMinSigned;
} // COERCION

function asNumber(value) {
  var numericValue = Number(value);
  if (typeof value === "boolean" || value === "" || Number.isNaN(numericValue)) throw new InvalidArgumentError("Invalid unit value " + value);
  return numericValue;
}
function normalizeObject(obj, normalizer, nonUnitKeys) {
  var normalized = {};

  for (var u in obj) {
    if (hasOwnProperty(obj, u)) {
      if (nonUnitKeys.indexOf(u) >= 0) continue;
      var v = obj[u];
      if (v === undefined || v === null) continue;
      normalized[normalizer(u)] = asNumber(v);
    }
  }

  return normalized;
}
function formatOffset(offset, format) {
  var hours = Math.trunc(Math.abs(offset / 60)),
      minutes = Math.trunc(Math.abs(offset % 60)),
      sign = offset >= 0 ? "+" : "-";

  switch (format) {
    case "short":
      return "" + sign + padStart(hours, 2) + ":" + padStart(minutes, 2);

    case "narrow":
      return "" + sign + hours + (minutes > 0 ? ":" + minutes : "");

    case "techie":
      return "" + sign + padStart(hours, 2) + padStart(minutes, 2);

    default:
      throw new RangeError("Value format " + format + " is out of range for property format");
  }
}
function timeObject(obj) {
  return pick(obj, ["hour", "minute", "second", "millisecond"]);
}
var ianaRegex = /[A-Za-z_+-]{1,256}(:?\/[A-Za-z_+-]{1,256}(\/[A-Za-z_+-]{1,256})?)?/;

function stringify(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}
/**
 * @private
 */


var monthsLong = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
var monthsNarrow = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
function months(length) {
  switch (length) {
    case "narrow":
      return monthsNarrow;

    case "short":
      return monthsShort;

    case "long":
      return monthsLong;

    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

    case "2-digit":
      return ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

    default:
      return null;
  }
}
var weekdaysLong = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
var weekdaysShort = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
var weekdaysNarrow = ["M", "T", "W", "T", "F", "S", "S"];
function weekdays(length) {
  switch (length) {
    case "narrow":
      return weekdaysNarrow;

    case "short":
      return weekdaysShort;

    case "long":
      return weekdaysLong;

    case "numeric":
      return ["1", "2", "3", "4", "5", "6", "7"];

    default:
      return null;
  }
}
var meridiems = ["AM", "PM"];
var erasLong = ["Before Christ", "Anno Domini"];
var erasShort = ["BC", "AD"];
var erasNarrow = ["B", "A"];
function eras(length) {
  switch (length) {
    case "narrow":
      return erasNarrow;

    case "short":
      return erasShort;

    case "long":
      return erasLong;

    default:
      return null;
  }
}
function meridiemForDateTime(dt) {
  return meridiems[dt.hour < 12 ? 0 : 1];
}
function weekdayForDateTime(dt, length) {
  return weekdays(length)[dt.weekday - 1];
}
function monthForDateTime(dt, length) {
  return months(length)[dt.month - 1];
}
function eraForDateTime(dt, length) {
  return eras(length)[dt.year < 0 ? 0 : 1];
}
function formatRelativeTime(unit, count, numeric, narrow) {
  if (numeric === void 0) {
    numeric = "always";
  }

  if (narrow === void 0) {
    narrow = false;
  }

  var units = {
    years: ["year", "yr."],
    quarters: ["quarter", "qtr."],
    months: ["month", "mo."],
    weeks: ["week", "wk."],
    days: ["day", "day", "days"],
    hours: ["hour", "hr."],
    minutes: ["minute", "min."],
    seconds: ["second", "sec."]
  };
  var lastable = ["hours", "minutes", "seconds"].indexOf(unit) === -1;

  if (numeric === "auto" && lastable) {
    var isDay = unit === "days";

    switch (count) {
      case 1:
        return isDay ? "tomorrow" : "next " + units[unit][0];

      case -1:
        return isDay ? "yesterday" : "last " + units[unit][0];

      case 0:
        return isDay ? "today" : "this " + units[unit][0];

    }
  }

  var isInPast = Object.is(count, -0) || count < 0,
      fmtValue = Math.abs(count),
      singular = fmtValue === 1,
      lilUnits = units[unit],
      fmtUnit = narrow ? singular ? lilUnits[1] : lilUnits[2] || lilUnits[1] : singular ? units[unit][0] : unit;
  return isInPast ? fmtValue + " " + fmtUnit + " ago" : "in " + fmtValue + " " + fmtUnit;
}
function formatString(knownFormat) {
  // these all have the offsets removed because we don't have access to them
  // without all the intl stuff this is backfilling
  var filtered = pick(knownFormat, ["weekday", "era", "year", "month", "day", "hour", "minute", "second", "timeZoneName", "hour12"]),
      key = stringify(filtered),
      dateTimeHuge = "EEEE, LLLL d, yyyy, h:mm a";

  switch (key) {
    case stringify(DATE_SHORT):
      return "M/d/yyyy";

    case stringify(DATE_MED):
      return "LLL d, yyyy";

    case stringify(DATE_MED_WITH_WEEKDAY):
      return "EEE, LLL d, yyyy";

    case stringify(DATE_FULL):
      return "LLLL d, yyyy";

    case stringify(DATE_HUGE):
      return "EEEE, LLLL d, yyyy";

    case stringify(TIME_SIMPLE):
      return "h:mm a";

    case stringify(TIME_WITH_SECONDS):
      return "h:mm:ss a";

    case stringify(TIME_WITH_SHORT_OFFSET):
      return "h:mm a";

    case stringify(TIME_WITH_LONG_OFFSET):
      return "h:mm a";

    case stringify(TIME_24_SIMPLE):
      return "HH:mm";

    case stringify(TIME_24_WITH_SECONDS):
      return "HH:mm:ss";

    case stringify(TIME_24_WITH_SHORT_OFFSET):
      return "HH:mm";

    case stringify(TIME_24_WITH_LONG_OFFSET):
      return "HH:mm";

    case stringify(DATETIME_SHORT):
      return "M/d/yyyy, h:mm a";

    case stringify(DATETIME_MED):
      return "LLL d, yyyy, h:mm a";

    case stringify(DATETIME_FULL):
      return "LLLL d, yyyy, h:mm a";

    case stringify(DATETIME_HUGE):
      return dateTimeHuge;

    case stringify(DATETIME_SHORT_WITH_SECONDS):
      return "M/d/yyyy, h:mm:ss a";

    case stringify(DATETIME_MED_WITH_SECONDS):
      return "LLL d, yyyy, h:mm:ss a";

    case stringify(DATETIME_MED_WITH_WEEKDAY):
      return "EEE, d LLL yyyy, h:mm a";

    case stringify(DATETIME_FULL_WITH_SECONDS):
      return "LLLL d, yyyy, h:mm:ss a";

    case stringify(DATETIME_HUGE_WITH_SECONDS):
      return "EEEE, LLLL d, yyyy, h:mm:ss a";

    default:
      return dateTimeHuge;
  }
}

function stringifyTokens(splits, tokenToString) {
  var s = "";

  for (var _iterator = _createForOfIteratorHelperLoose(splits), _step; !(_step = _iterator()).done;) {
    var token = _step.value;

    if (token.literal) {
      s += token.val;
    } else {
      s += tokenToString(token.val);
    }
  }

  return s;
}

var _macroTokenToFormatOpts = {
  D: DATE_SHORT,
  DD: DATE_MED,
  DDD: DATE_FULL,
  DDDD: DATE_HUGE,
  t: TIME_SIMPLE,
  tt: TIME_WITH_SECONDS,
  ttt: TIME_WITH_SHORT_OFFSET,
  tttt: TIME_WITH_LONG_OFFSET,
  T: TIME_24_SIMPLE,
  TT: TIME_24_WITH_SECONDS,
  TTT: TIME_24_WITH_SHORT_OFFSET,
  TTTT: TIME_24_WITH_LONG_OFFSET,
  f: DATETIME_SHORT,
  ff: DATETIME_MED,
  fff: DATETIME_FULL,
  ffff: DATETIME_HUGE,
  F: DATETIME_SHORT_WITH_SECONDS,
  FF: DATETIME_MED_WITH_SECONDS,
  FFF: DATETIME_FULL_WITH_SECONDS,
  FFFF: DATETIME_HUGE_WITH_SECONDS
};
/**
 * @private
 */

var Formatter = /*#__PURE__*/function () {
  Formatter.create = function create(locale, opts) {
    if (opts === void 0) {
      opts = {};
    }

    return new Formatter(locale, opts);
  };

  Formatter.parseFormat = function parseFormat(fmt) {
    var current = null,
        currentFull = "",
        bracketed = false;
    var splits = [];

    for (var i = 0; i < fmt.length; i++) {
      var c = fmt.charAt(i);

      if (c === "'") {
        if (currentFull.length > 0) {
          splits.push({
            literal: bracketed,
            val: currentFull
          });
        }

        current = null;
        currentFull = "";
        bracketed = !bracketed;
      } else if (bracketed) {
        currentFull += c;
      } else if (c === current) {
        currentFull += c;
      } else {
        if (currentFull.length > 0) {
          splits.push({
            literal: false,
            val: currentFull
          });
        }

        currentFull = c;
        current = c;
      }
    }

    if (currentFull.length > 0) {
      splits.push({
        literal: bracketed,
        val: currentFull
      });
    }

    return splits;
  };

  Formatter.macroTokenToFormatOpts = function macroTokenToFormatOpts(token) {
    return _macroTokenToFormatOpts[token];
  };

  function Formatter(locale, formatOpts) {
    this.opts = formatOpts;
    this.loc = locale;
    this.systemLoc = null;
  }

  var _proto = Formatter.prototype;

  _proto.formatWithSystemDefault = function formatWithSystemDefault(dt, opts) {
    if (this.systemLoc === null) {
      this.systemLoc = this.loc.redefaultToSystem();
    }

    var df = this.systemLoc.dtFormatter(dt, Object.assign({}, this.opts, opts));
    return df.format();
  };

  _proto.formatDateTime = function formatDateTime(dt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var df = this.loc.dtFormatter(dt, Object.assign({}, this.opts, opts));
    return df.format();
  };

  _proto.formatDateTimeParts = function formatDateTimeParts(dt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var df = this.loc.dtFormatter(dt, Object.assign({}, this.opts, opts));
    return df.formatToParts();
  };

  _proto.resolvedOptions = function resolvedOptions(dt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var df = this.loc.dtFormatter(dt, Object.assign({}, this.opts, opts));
    return df.resolvedOptions();
  };

  _proto.num = function num(n, p) {
    if (p === void 0) {
      p = 0;
    }

    // we get some perf out of doing this here, annoyingly
    if (this.opts.forceSimple) {
      return padStart(n, p);
    }

    var opts = Object.assign({}, this.opts);

    if (p > 0) {
      opts.padTo = p;
    }

    return this.loc.numberFormatter(opts).format(n);
  };

  _proto.formatDateTimeFromString = function formatDateTimeFromString(dt, fmt) {
    var _this = this;

    var knownEnglish = this.loc.listingMode() === "en",
        useDateTimeFormatter = this.loc.outputCalendar && this.loc.outputCalendar !== "gregory" && hasFormatToParts(),
        string = function string(opts, extract) {
      return _this.loc.extract(dt, opts, extract);
    },
        formatOffset = function formatOffset(opts) {
      if (dt.isOffsetFixed && dt.offset === 0 && opts.allowZ) {
        return "Z";
      }

      return dt.isValid ? dt.zone.formatOffset(dt.ts, opts.format) : "";
    },
        meridiem = function meridiem() {
      return knownEnglish ? meridiemForDateTime(dt) : string({
        hour: "numeric",
        hour12: true
      }, "dayperiod");
    },
        month = function month(length, standalone) {
      return knownEnglish ? monthForDateTime(dt, length) : string(standalone ? {
        month: length
      } : {
        month: length,
        day: "numeric"
      }, "month");
    },
        weekday = function weekday(length, standalone) {
      return knownEnglish ? weekdayForDateTime(dt, length) : string(standalone ? {
        weekday: length
      } : {
        weekday: length,
        month: "long",
        day: "numeric"
      }, "weekday");
    },
        maybeMacro = function maybeMacro(token) {
      var formatOpts = Formatter.macroTokenToFormatOpts(token);

      if (formatOpts) {
        return _this.formatWithSystemDefault(dt, formatOpts);
      } else {
        return token;
      }
    },
        era = function era(length) {
      return knownEnglish ? eraForDateTime(dt, length) : string({
        era: length
      }, "era");
    },
        tokenToString = function tokenToString(token) {
      // Where possible: http://cldr.unicode.org/translation/date-time-1/date-time#TOC-Standalone-vs.-Format-Styles
      switch (token) {
        // ms
        case "S":
          return _this.num(dt.millisecond);

        case "u": // falls through

        case "SSS":
          return _this.num(dt.millisecond, 3);
        // seconds

        case "s":
          return _this.num(dt.second);

        case "ss":
          return _this.num(dt.second, 2);
        // minutes

        case "m":
          return _this.num(dt.minute);

        case "mm":
          return _this.num(dt.minute, 2);
        // hours

        case "h":
          return _this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12);

        case "hh":
          return _this.num(dt.hour % 12 === 0 ? 12 : dt.hour % 12, 2);

        case "H":
          return _this.num(dt.hour);

        case "HH":
          return _this.num(dt.hour, 2);
        // offset

        case "Z":
          // like +6
          return formatOffset({
            format: "narrow",
            allowZ: _this.opts.allowZ
          });

        case "ZZ":
          // like +06:00
          return formatOffset({
            format: "short",
            allowZ: _this.opts.allowZ
          });

        case "ZZZ":
          // like +0600
          return formatOffset({
            format: "techie",
            allowZ: _this.opts.allowZ
          });

        case "ZZZZ":
          // like EST
          return dt.zone.offsetName(dt.ts, {
            format: "short",
            locale: _this.loc.locale
          });

        case "ZZZZZ":
          // like Eastern Standard Time
          return dt.zone.offsetName(dt.ts, {
            format: "long",
            locale: _this.loc.locale
          });
        // zone

        case "z":
          // like America/New_York
          return dt.zoneName;
        // meridiems

        case "a":
          return meridiem();
        // dates

        case "d":
          return useDateTimeFormatter ? string({
            day: "numeric"
          }, "day") : _this.num(dt.day);

        case "dd":
          return useDateTimeFormatter ? string({
            day: "2-digit"
          }, "day") : _this.num(dt.day, 2);
        // weekdays - standalone

        case "c":
          // like 1
          return _this.num(dt.weekday);

        case "ccc":
          // like 'Tues'
          return weekday("short", true);

        case "cccc":
          // like 'Tuesday'
          return weekday("long", true);

        case "ccccc":
          // like 'T'
          return weekday("narrow", true);
        // weekdays - format

        case "E":
          // like 1
          return _this.num(dt.weekday);

        case "EEE":
          // like 'Tues'
          return weekday("short", false);

        case "EEEE":
          // like 'Tuesday'
          return weekday("long", false);

        case "EEEEE":
          // like 'T'
          return weekday("narrow", false);
        // months - standalone

        case "L":
          // like 1
          return useDateTimeFormatter ? string({
            month: "numeric",
            day: "numeric"
          }, "month") : _this.num(dt.month);

        case "LL":
          // like 01, doesn't seem to work
          return useDateTimeFormatter ? string({
            month: "2-digit",
            day: "numeric"
          }, "month") : _this.num(dt.month, 2);

        case "LLL":
          // like Jan
          return month("short", true);

        case "LLLL":
          // like January
          return month("long", true);

        case "LLLLL":
          // like J
          return month("narrow", true);
        // months - format

        case "M":
          // like 1
          return useDateTimeFormatter ? string({
            month: "numeric"
          }, "month") : _this.num(dt.month);

        case "MM":
          // like 01
          return useDateTimeFormatter ? string({
            month: "2-digit"
          }, "month") : _this.num(dt.month, 2);

        case "MMM":
          // like Jan
          return month("short", false);

        case "MMMM":
          // like January
          return month("long", false);

        case "MMMMM":
          // like J
          return month("narrow", false);
        // years

        case "y":
          // like 2014
          return useDateTimeFormatter ? string({
            year: "numeric"
          }, "year") : _this.num(dt.year);

        case "yy":
          // like 14
          return useDateTimeFormatter ? string({
            year: "2-digit"
          }, "year") : _this.num(dt.year.toString().slice(-2), 2);

        case "yyyy":
          // like 0012
          return useDateTimeFormatter ? string({
            year: "numeric"
          }, "year") : _this.num(dt.year, 4);

        case "yyyyyy":
          // like 000012
          return useDateTimeFormatter ? string({
            year: "numeric"
          }, "year") : _this.num(dt.year, 6);
        // eras

        case "G":
          // like AD
          return era("short");

        case "GG":
          // like Anno Domini
          return era("long");

        case "GGGGG":
          return era("narrow");

        case "kk":
          return _this.num(dt.weekYear.toString().slice(-2), 2);

        case "kkkk":
          return _this.num(dt.weekYear, 4);

        case "W":
          return _this.num(dt.weekNumber);

        case "WW":
          return _this.num(dt.weekNumber, 2);

        case "o":
          return _this.num(dt.ordinal);

        case "ooo":
          return _this.num(dt.ordinal, 3);

        case "q":
          // like 1
          return _this.num(dt.quarter);

        case "qq":
          // like 01
          return _this.num(dt.quarter, 2);

        case "X":
          return _this.num(Math.floor(dt.ts / 1000));

        case "x":
          return _this.num(dt.ts);

        default:
          return maybeMacro(token);
      }
    };

    return stringifyTokens(Formatter.parseFormat(fmt), tokenToString);
  };

  _proto.formatDurationFromString = function formatDurationFromString(dur, fmt) {
    var _this2 = this;

    var tokenToField = function tokenToField(token) {
      switch (token[0]) {
        case "S":
          return "millisecond";

        case "s":
          return "second";

        case "m":
          return "minute";

        case "h":
          return "hour";

        case "d":
          return "day";

        case "M":
          return "month";

        case "y":
          return "year";

        default:
          return null;
      }
    },
        tokenToString = function tokenToString(lildur) {
      return function (token) {
        var mapped = tokenToField(token);

        if (mapped) {
          return _this2.num(lildur.get(mapped), token.length);
        } else {
          return token;
        }
      };
    },
        tokens = Formatter.parseFormat(fmt),
        realTokens = tokens.reduce(function (found, _ref) {
      var literal = _ref.literal,
          val = _ref.val;
      return literal ? found : found.concat(val);
    }, []),
        collapsed = dur.shiftTo.apply(dur, realTokens.map(tokenToField).filter(function (t) {
      return t;
    }));

    return stringifyTokens(tokens, tokenToString(collapsed));
  };

  return Formatter;
}();

var Invalid = /*#__PURE__*/function () {
  function Invalid(reason, explanation) {
    this.reason = reason;
    this.explanation = explanation;
  }

  var _proto = Invalid.prototype;

  _proto.toMessage = function toMessage() {
    if (this.explanation) {
      return this.reason + ": " + this.explanation;
    } else {
      return this.reason;
    }
  };

  return Invalid;
}();

/**
 * @interface
 */

var Zone = /*#__PURE__*/function () {
  function Zone() {}

  var _proto = Zone.prototype;

  /**
   * Returns the offset's common name (such as EST) at the specified timestamp
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the name
   * @param {Object} opts - Options to affect the format
   * @param {string} opts.format - What style of offset to return. Accepts 'long' or 'short'.
   * @param {string} opts.locale - What locale to return the offset name in.
   * @return {string}
   */
  _proto.offsetName = function offsetName(ts, opts) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Returns the offset's value as a string
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to get the offset
   * @param {string} format - What style of offset to return.
   *                          Accepts 'narrow', 'short', or 'techie'. Returning '+6', '+06:00', or '+0600' respectively
   * @return {string}
   */
  ;

  _proto.formatOffset = function formatOffset(ts, format) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return the offset in minutes for this zone at the specified timestamp.
   * @abstract
   * @param {number} ts - Epoch milliseconds for which to compute the offset
   * @return {number}
   */
  ;

  _proto.offset = function offset(ts) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return whether this Zone is equal to another zone
   * @abstract
   * @param {Zone} otherZone - the zone to compare
   * @return {boolean}
   */
  ;

  _proto.equals = function equals(otherZone) {
    throw new ZoneIsAbstractError();
  }
  /**
   * Return whether this Zone is valid.
   * @abstract
   * @type {boolean}
   */
  ;

  _createClass(Zone, [{
    key: "type",

    /**
     * The type of zone
     * @abstract
     * @type {string}
     */
    get: function get() {
      throw new ZoneIsAbstractError();
    }
    /**
     * The name of this zone.
     * @abstract
     * @type {string}
     */

  }, {
    key: "name",
    get: function get() {
      throw new ZoneIsAbstractError();
    }
    /**
     * Returns whether the offset is known to be fixed for the whole year.
     * @abstract
     * @type {boolean}
     */

  }, {
    key: "universal",
    get: function get() {
      throw new ZoneIsAbstractError();
    }
  }, {
    key: "isValid",
    get: function get() {
      throw new ZoneIsAbstractError();
    }
  }]);

  return Zone;
}();

var singleton = null;
/**
 * Represents the local zone for this JavaScript environment.
 * @implements {Zone}
 */

var LocalZone = /*#__PURE__*/function (_Zone) {
  _inheritsLoose(LocalZone, _Zone);

  function LocalZone() {
    return _Zone.apply(this, arguments) || this;
  }

  var _proto = LocalZone.prototype;

  /** @override **/
  _proto.offsetName = function offsetName(ts, _ref) {
    var format = _ref.format,
        locale = _ref.locale;
    return parseZoneInfo(ts, format, locale);
  }
  /** @override **/
  ;

  _proto.formatOffset = function formatOffset$1(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  /** @override **/
  ;

  _proto.offset = function offset(ts) {
    return -new Date(ts).getTimezoneOffset();
  }
  /** @override **/
  ;

  _proto.equals = function equals(otherZone) {
    return otherZone.type === "local";
  }
  /** @override **/
  ;

  _createClass(LocalZone, [{
    key: "type",

    /** @override **/
    get: function get() {
      return "local";
    }
    /** @override **/

  }, {
    key: "name",
    get: function get() {
      if (hasIntl()) {
        return new Intl.DateTimeFormat().resolvedOptions().timeZone;
      } else return "local";
    }
    /** @override **/

  }, {
    key: "universal",
    get: function get() {
      return false;
    }
  }, {
    key: "isValid",
    get: function get() {
      return true;
    }
  }], [{
    key: "instance",

    /**
     * Get a singleton instance of the local zone
     * @return {LocalZone}
     */
    get: function get() {
      if (singleton === null) {
        singleton = new LocalZone();
      }

      return singleton;
    }
  }]);

  return LocalZone;
}(Zone);

var matchingRegex = RegExp("^" + ianaRegex.source + "$");
var dtfCache = {};

function makeDTF(zone) {
  if (!dtfCache[zone]) {
    dtfCache[zone] = new Intl.DateTimeFormat("en-US", {
      hour12: false,
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  }

  return dtfCache[zone];
}

var typeToPos = {
  year: 0,
  month: 1,
  day: 2,
  hour: 3,
  minute: 4,
  second: 5
};

function hackyOffset(dtf, date) {
  var formatted = dtf.format(date).replace(/\u200E/g, ""),
      parsed = /(\d+)\/(\d+)\/(\d+),? (\d+):(\d+):(\d+)/.exec(formatted),
      fMonth = parsed[1],
      fDay = parsed[2],
      fYear = parsed[3],
      fHour = parsed[4],
      fMinute = parsed[5],
      fSecond = parsed[6];
  return [fYear, fMonth, fDay, fHour, fMinute, fSecond];
}

function partsOffset(dtf, date) {
  var formatted = dtf.formatToParts(date),
      filled = [];

  for (var i = 0; i < formatted.length; i++) {
    var _formatted$i = formatted[i],
        type = _formatted$i.type,
        value = _formatted$i.value,
        pos = typeToPos[type];

    if (!isUndefined(pos)) {
      filled[pos] = parseInt(value, 10);
    }
  }

  return filled;
}

var ianaZoneCache = {};
/**
 * A zone identified by an IANA identifier, like America/New_York
 * @implements {Zone}
 */

var IANAZone = /*#__PURE__*/function (_Zone) {
  _inheritsLoose(IANAZone, _Zone);

  /**
   * @param {string} name - Zone name
   * @return {IANAZone}
   */
  IANAZone.create = function create(name) {
    if (!ianaZoneCache[name]) {
      ianaZoneCache[name] = new IANAZone(name);
    }

    return ianaZoneCache[name];
  }
  /**
   * Reset local caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  ;

  IANAZone.resetCache = function resetCache() {
    ianaZoneCache = {};
    dtfCache = {};
  }
  /**
   * Returns whether the provided string is a valid specifier. This only checks the string's format, not that the specifier identifies a known zone; see isValidZone for that.
   * @param {string} s - The string to check validity on
   * @example IANAZone.isValidSpecifier("America/New_York") //=> true
   * @example IANAZone.isValidSpecifier("Fantasia/Castle") //=> true
   * @example IANAZone.isValidSpecifier("Sport~~blorp") //=> false
   * @return {boolean}
   */
  ;

  IANAZone.isValidSpecifier = function isValidSpecifier(s) {
    return !!(s && s.match(matchingRegex));
  }
  /**
   * Returns whether the provided string identifies a real zone
   * @param {string} zone - The string to check
   * @example IANAZone.isValidZone("America/New_York") //=> true
   * @example IANAZone.isValidZone("Fantasia/Castle") //=> false
   * @example IANAZone.isValidZone("Sport~~blorp") //=> false
   * @return {boolean}
   */
  ;

  IANAZone.isValidZone = function isValidZone(zone) {
    try {
      new Intl.DateTimeFormat("en-US", {
        timeZone: zone
      }).format();
      return true;
    } catch (e) {
      return false;
    }
  } // Etc/GMT+8 -> -480

  /** @ignore */
  ;

  IANAZone.parseGMTOffset = function parseGMTOffset(specifier) {
    if (specifier) {
      var match = specifier.match(/^Etc\/GMT([+-]\d{1,2})$/i);

      if (match) {
        return -60 * parseInt(match[1]);
      }
    }

    return null;
  };

  function IANAZone(name) {
    var _this;

    _this = _Zone.call(this) || this;
    /** @private **/

    _this.zoneName = name;
    /** @private **/

    _this.valid = IANAZone.isValidZone(name);
    return _this;
  }
  /** @override **/


  var _proto = IANAZone.prototype;

  /** @override **/
  _proto.offsetName = function offsetName(ts, _ref) {
    var format = _ref.format,
        locale = _ref.locale;
    return parseZoneInfo(ts, format, locale, this.name);
  }
  /** @override **/
  ;

  _proto.formatOffset = function formatOffset$1(ts, format) {
    return formatOffset(this.offset(ts), format);
  }
  /** @override **/
  ;

  _proto.offset = function offset(ts) {
    var date = new Date(ts),
        dtf = makeDTF(this.name),
        _ref2 = dtf.formatToParts ? partsOffset(dtf, date) : hackyOffset(dtf, date),
        year = _ref2[0],
        month = _ref2[1],
        day = _ref2[2],
        hour = _ref2[3],
        minute = _ref2[4],
        second = _ref2[5],
        adjustedHour = hour === 24 ? 0 : hour;

    var asUTC = objToLocalTS({
      year: year,
      month: month,
      day: day,
      hour: adjustedHour,
      minute: minute,
      second: second,
      millisecond: 0
    });
    var asTS = +date;
    var over = asTS % 1000;
    asTS -= over >= 0 ? over : 1000 + over;
    return (asUTC - asTS) / (60 * 1000);
  }
  /** @override **/
  ;

  _proto.equals = function equals(otherZone) {
    return otherZone.type === "iana" && otherZone.name === this.name;
  }
  /** @override **/
  ;

  _createClass(IANAZone, [{
    key: "type",
    get: function get() {
      return "iana";
    }
    /** @override **/

  }, {
    key: "name",
    get: function get() {
      return this.zoneName;
    }
    /** @override **/

  }, {
    key: "universal",
    get: function get() {
      return false;
    }
  }, {
    key: "isValid",
    get: function get() {
      return this.valid;
    }
  }]);

  return IANAZone;
}(Zone);

var singleton$1 = null;
/**
 * A zone with a fixed offset (meaning no DST)
 * @implements {Zone}
 */

var FixedOffsetZone = /*#__PURE__*/function (_Zone) {
  _inheritsLoose(FixedOffsetZone, _Zone);

  /**
   * Get an instance with a specified offset
   * @param {number} offset - The offset in minutes
   * @return {FixedOffsetZone}
   */
  FixedOffsetZone.instance = function instance(offset) {
    return offset === 0 ? FixedOffsetZone.utcInstance : new FixedOffsetZone(offset);
  }
  /**
   * Get an instance of FixedOffsetZone from a UTC offset string, like "UTC+6"
   * @param {string} s - The offset string to parse
   * @example FixedOffsetZone.parseSpecifier("UTC+6")
   * @example FixedOffsetZone.parseSpecifier("UTC+06")
   * @example FixedOffsetZone.parseSpecifier("UTC-6:00")
   * @return {FixedOffsetZone}
   */
  ;

  FixedOffsetZone.parseSpecifier = function parseSpecifier(s) {
    if (s) {
      var r = s.match(/^utc(?:([+-]\d{1,2})(?::(\d{2}))?)?$/i);

      if (r) {
        return new FixedOffsetZone(signedOffset(r[1], r[2]));
      }
    }

    return null;
  };

  _createClass(FixedOffsetZone, null, [{
    key: "utcInstance",

    /**
     * Get a singleton instance of UTC
     * @return {FixedOffsetZone}
     */
    get: function get() {
      if (singleton$1 === null) {
        singleton$1 = new FixedOffsetZone(0);
      }

      return singleton$1;
    }
  }]);

  function FixedOffsetZone(offset) {
    var _this;

    _this = _Zone.call(this) || this;
    /** @private **/

    _this.fixed = offset;
    return _this;
  }
  /** @override **/


  var _proto = FixedOffsetZone.prototype;

  /** @override **/
  _proto.offsetName = function offsetName() {
    return this.name;
  }
  /** @override **/
  ;

  _proto.formatOffset = function formatOffset$1(ts, format) {
    return formatOffset(this.fixed, format);
  }
  /** @override **/
  ;

  /** @override **/
  _proto.offset = function offset() {
    return this.fixed;
  }
  /** @override **/
  ;

  _proto.equals = function equals(otherZone) {
    return otherZone.type === "fixed" && otherZone.fixed === this.fixed;
  }
  /** @override **/
  ;

  _createClass(FixedOffsetZone, [{
    key: "type",
    get: function get() {
      return "fixed";
    }
    /** @override **/

  }, {
    key: "name",
    get: function get() {
      return this.fixed === 0 ? "UTC" : "UTC" + formatOffset(this.fixed, "narrow");
    }
  }, {
    key: "universal",
    get: function get() {
      return true;
    }
  }, {
    key: "isValid",
    get: function get() {
      return true;
    }
  }]);

  return FixedOffsetZone;
}(Zone);

/**
 * A zone that failed to parse. You should never need to instantiate this.
 * @implements {Zone}
 */

var InvalidZone = /*#__PURE__*/function (_Zone) {
  _inheritsLoose(InvalidZone, _Zone);

  function InvalidZone(zoneName) {
    var _this;

    _this = _Zone.call(this) || this;
    /**  @private */

    _this.zoneName = zoneName;
    return _this;
  }
  /** @override **/


  var _proto = InvalidZone.prototype;

  /** @override **/
  _proto.offsetName = function offsetName() {
    return null;
  }
  /** @override **/
  ;

  _proto.formatOffset = function formatOffset() {
    return "";
  }
  /** @override **/
  ;

  _proto.offset = function offset() {
    return NaN;
  }
  /** @override **/
  ;

  _proto.equals = function equals() {
    return false;
  }
  /** @override **/
  ;

  _createClass(InvalidZone, [{
    key: "type",
    get: function get() {
      return "invalid";
    }
    /** @override **/

  }, {
    key: "name",
    get: function get() {
      return this.zoneName;
    }
    /** @override **/

  }, {
    key: "universal",
    get: function get() {
      return false;
    }
  }, {
    key: "isValid",
    get: function get() {
      return false;
    }
  }]);

  return InvalidZone;
}(Zone);

/**
 * @private
 */
function normalizeZone(input, defaultZone) {
  var offset;

  if (isUndefined(input) || input === null) {
    return defaultZone;
  } else if (input instanceof Zone) {
    return input;
  } else if (isString(input)) {
    var lowered = input.toLowerCase();
    if (lowered === "local") return defaultZone;else if (lowered === "utc" || lowered === "gmt") return FixedOffsetZone.utcInstance;else if ((offset = IANAZone.parseGMTOffset(input)) != null) {
      // handle Etc/GMT-4, which V8 chokes on
      return FixedOffsetZone.instance(offset);
    } else if (IANAZone.isValidSpecifier(lowered)) return IANAZone.create(input);else return FixedOffsetZone.parseSpecifier(lowered) || new InvalidZone(input);
  } else if (isNumber(input)) {
    return FixedOffsetZone.instance(input);
  } else if (typeof input === "object" && input.offset && typeof input.offset === "number") {
    // This is dumb, but the instanceof check above doesn't seem to really work
    // so we're duck checking it
    return input;
  } else {
    return new InvalidZone(input);
  }
}

var now = function now() {
  return Date.now();
},
    defaultZone = null,
    // not setting this directly to LocalZone.instance bc loading order issues
defaultLocale = null,
    defaultNumberingSystem = null,
    defaultOutputCalendar = null,
    throwOnInvalid = false;
/**
 * Settings contains static getters and setters that control Luxon's overall behavior. Luxon is a simple library with few options, but the ones it does have live here.
 */


var Settings = /*#__PURE__*/function () {
  function Settings() {}

  /**
   * Reset Luxon's global caches. Should only be necessary in testing scenarios.
   * @return {void}
   */
  Settings.resetCaches = function resetCaches() {
    Locale.resetCache();
    IANAZone.resetCache();
  };

  _createClass(Settings, null, [{
    key: "now",

    /**
     * Get the callback for returning the current timestamp.
     * @type {function}
     */
    get: function get() {
      return now;
    }
    /**
     * Set the callback for returning the current timestamp.
     * The function should return a number, which will be interpreted as an Epoch millisecond count
     * @type {function}
     * @example Settings.now = () => Date.now() + 3000 // pretend it is 3 seconds in the future
     * @example Settings.now = () => 0 // always pretend it's Jan 1, 1970 at midnight in UTC time
     */
    ,
    set: function set(n) {
      now = n;
    }
    /**
     * Get the default time zone to create DateTimes in.
     * @type {string}
     */

  }, {
    key: "defaultZoneName",
    get: function get() {
      return Settings.defaultZone.name;
    }
    /**
     * Set the default time zone to create DateTimes in. Does not affect existing instances.
     * @type {string}
     */
    ,
    set: function set(z) {
      if (!z) {
        defaultZone = null;
      } else {
        defaultZone = normalizeZone(z);
      }
    }
    /**
     * Get the default time zone object to create DateTimes in. Does not affect existing instances.
     * @type {Zone}
     */

  }, {
    key: "defaultZone",
    get: function get() {
      return defaultZone || LocalZone.instance;
    }
    /**
     * Get the default locale to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */

  }, {
    key: "defaultLocale",
    get: function get() {
      return defaultLocale;
    }
    /**
     * Set the default locale to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */
    ,
    set: function set(locale) {
      defaultLocale = locale;
    }
    /**
     * Get the default numbering system to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */

  }, {
    key: "defaultNumberingSystem",
    get: function get() {
      return defaultNumberingSystem;
    }
    /**
     * Set the default numbering system to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */
    ,
    set: function set(numberingSystem) {
      defaultNumberingSystem = numberingSystem;
    }
    /**
     * Get the default output calendar to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */

  }, {
    key: "defaultOutputCalendar",
    get: function get() {
      return defaultOutputCalendar;
    }
    /**
     * Set the default output calendar to create DateTimes with. Does not affect existing instances.
     * @type {string}
     */
    ,
    set: function set(outputCalendar) {
      defaultOutputCalendar = outputCalendar;
    }
    /**
     * Get whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
     * @type {boolean}
     */

  }, {
    key: "throwOnInvalid",
    get: function get() {
      return throwOnInvalid;
    }
    /**
     * Set whether Luxon will throw when it encounters invalid DateTimes, Durations, or Intervals
     * @type {boolean}
     */
    ,
    set: function set(t) {
      throwOnInvalid = t;
    }
  }]);

  return Settings;
}();

var intlDTCache = {};

function getCachedDTF(locString, opts) {
  if (opts === void 0) {
    opts = {};
  }

  var key = JSON.stringify([locString, opts]);
  var dtf = intlDTCache[key];

  if (!dtf) {
    dtf = new Intl.DateTimeFormat(locString, opts);
    intlDTCache[key] = dtf;
  }

  return dtf;
}

var intlNumCache = {};

function getCachedINF(locString, opts) {
  if (opts === void 0) {
    opts = {};
  }

  var key = JSON.stringify([locString, opts]);
  var inf = intlNumCache[key];

  if (!inf) {
    inf = new Intl.NumberFormat(locString, opts);
    intlNumCache[key] = inf;
  }

  return inf;
}

var intlRelCache = {};

function getCachedRTF(locString, opts) {
  if (opts === void 0) {
    opts = {};
  }

  var _opts = opts,
      base = _opts.base,
      cacheKeyOpts = _objectWithoutPropertiesLoose(_opts, ["base"]); // exclude `base` from the options


  var key = JSON.stringify([locString, cacheKeyOpts]);
  var inf = intlRelCache[key];

  if (!inf) {
    inf = new Intl.RelativeTimeFormat(locString, opts);
    intlRelCache[key] = inf;
  }

  return inf;
}

var sysLocaleCache = null;

function systemLocale() {
  if (sysLocaleCache) {
    return sysLocaleCache;
  } else if (hasIntl()) {
    var computedSys = new Intl.DateTimeFormat().resolvedOptions().locale; // node sometimes defaults to "und". Override that because that is dumb

    sysLocaleCache = !computedSys || computedSys === "und" ? "en-US" : computedSys;
    return sysLocaleCache;
  } else {
    sysLocaleCache = "en-US";
    return sysLocaleCache;
  }
}

function parseLocaleString(localeStr) {
  // I really want to avoid writing a BCP 47 parser
  // see, e.g. https://github.com/wooorm/bcp-47
  // Instead, we'll do this:
  // a) if the string has no -u extensions, just leave it alone
  // b) if it does, use Intl to resolve everything
  // c) if Intl fails, try again without the -u
  var uIndex = localeStr.indexOf("-u-");

  if (uIndex === -1) {
    return [localeStr];
  } else {
    var options;
    var smaller = localeStr.substring(0, uIndex);

    try {
      options = getCachedDTF(localeStr).resolvedOptions();
    } catch (e) {
      options = getCachedDTF(smaller).resolvedOptions();
    }

    var _options = options,
        numberingSystem = _options.numberingSystem,
        calendar = _options.calendar; // return the smaller one so that we can append the calendar and numbering overrides to it

    return [smaller, numberingSystem, calendar];
  }
}

function intlConfigString(localeStr, numberingSystem, outputCalendar) {
  if (hasIntl()) {
    if (outputCalendar || numberingSystem) {
      localeStr += "-u";

      if (outputCalendar) {
        localeStr += "-ca-" + outputCalendar;
      }

      if (numberingSystem) {
        localeStr += "-nu-" + numberingSystem;
      }

      return localeStr;
    } else {
      return localeStr;
    }
  } else {
    return [];
  }
}

function mapMonths(f) {
  var ms = [];

  for (var i = 1; i <= 12; i++) {
    var dt = DateTime.utc(2016, i, 1);
    ms.push(f(dt));
  }

  return ms;
}

function mapWeekdays(f) {
  var ms = [];

  for (var i = 1; i <= 7; i++) {
    var dt = DateTime.utc(2016, 11, 13 + i);
    ms.push(f(dt));
  }

  return ms;
}

function listStuff(loc, length, defaultOK, englishFn, intlFn) {
  var mode = loc.listingMode(defaultOK);

  if (mode === "error") {
    return null;
  } else if (mode === "en") {
    return englishFn(length);
  } else {
    return intlFn(length);
  }
}

function supportsFastNumbers(loc) {
  if (loc.numberingSystem && loc.numberingSystem !== "latn") {
    return false;
  } else {
    return loc.numberingSystem === "latn" || !loc.locale || loc.locale.startsWith("en") || hasIntl() && new Intl.DateTimeFormat(loc.intl).resolvedOptions().numberingSystem === "latn";
  }
}
/**
 * @private
 */


var PolyNumberFormatter = /*#__PURE__*/function () {
  function PolyNumberFormatter(intl, forceSimple, opts) {
    this.padTo = opts.padTo || 0;
    this.floor = opts.floor || false;

    if (!forceSimple && hasIntl()) {
      var intlOpts = {
        useGrouping: false
      };
      if (opts.padTo > 0) intlOpts.minimumIntegerDigits = opts.padTo;
      this.inf = getCachedINF(intl, intlOpts);
    }
  }

  var _proto = PolyNumberFormatter.prototype;

  _proto.format = function format(i) {
    if (this.inf) {
      var fixed = this.floor ? Math.floor(i) : i;
      return this.inf.format(fixed);
    } else {
      // to match the browser's numberformatter defaults
      var _fixed = this.floor ? Math.floor(i) : roundTo(i, 3);

      return padStart(_fixed, this.padTo);
    }
  };

  return PolyNumberFormatter;
}();
/**
 * @private
 */


var PolyDateFormatter = /*#__PURE__*/function () {
  function PolyDateFormatter(dt, intl, opts) {
    this.opts = opts;
    this.hasIntl = hasIntl();
    var z;

    if (dt.zone.universal && this.hasIntl) {
      // UTC-8 or Etc/UTC-8 are not part of tzdata, only Etc/GMT+8 and the like.
      // That is why fixed-offset TZ is set to that unless it is:
      // 1. Outside of the supported range Etc/GMT-14 to Etc/GMT+12.
      // 2. Not a whole hour, e.g. UTC+4:30.
      var gmtOffset = -1 * (dt.offset / 60);

      if (gmtOffset >= -14 && gmtOffset <= 12 && gmtOffset % 1 === 0) {
        z = gmtOffset >= 0 ? "Etc/GMT+" + gmtOffset : "Etc/GMT" + gmtOffset;
        this.dt = dt;
      } else {
        // Not all fixed-offset zones like Etc/+4:30 are present in tzdata.
        // So we have to make do. Two cases:
        // 1. The format options tell us to show the zone. We can't do that, so the best
        // we can do is format the date in UTC.
        // 2. The format options don't tell us to show the zone. Then we can adjust them
        // the time and tell the formatter to show it to us in UTC, so that the time is right
        // and the bad zone doesn't show up.
        z = "UTC";

        if (opts.timeZoneName) {
          this.dt = dt;
        } else {
          this.dt = dt.offset === 0 ? dt : DateTime.fromMillis(dt.ts + dt.offset * 60 * 1000);
        }
      }
    } else if (dt.zone.type === "local") {
      this.dt = dt;
    } else {
      this.dt = dt;
      z = dt.zone.name;
    }

    if (this.hasIntl) {
      var intlOpts = Object.assign({}, this.opts);

      if (z) {
        intlOpts.timeZone = z;
      }

      this.dtf = getCachedDTF(intl, intlOpts);
    }
  }

  var _proto2 = PolyDateFormatter.prototype;

  _proto2.format = function format() {
    if (this.hasIntl) {
      return this.dtf.format(this.dt.toJSDate());
    } else {
      var tokenFormat = formatString(this.opts),
          loc = Locale.create("en-US");
      return Formatter.create(loc).formatDateTimeFromString(this.dt, tokenFormat);
    }
  };

  _proto2.formatToParts = function formatToParts() {
    if (this.hasIntl && hasFormatToParts()) {
      return this.dtf.formatToParts(this.dt.toJSDate());
    } else {
      // This is kind of a cop out. We actually could do this for English. However, we couldn't do it for intl strings
      // and IMO it's too weird to have an uncanny valley like that
      return [];
    }
  };

  _proto2.resolvedOptions = function resolvedOptions() {
    if (this.hasIntl) {
      return this.dtf.resolvedOptions();
    } else {
      return {
        locale: "en-US",
        numberingSystem: "latn",
        outputCalendar: "gregory"
      };
    }
  };

  return PolyDateFormatter;
}();
/**
 * @private
 */


var PolyRelFormatter = /*#__PURE__*/function () {
  function PolyRelFormatter(intl, isEnglish, opts) {
    this.opts = Object.assign({
      style: "long"
    }, opts);

    if (!isEnglish && hasRelative()) {
      this.rtf = getCachedRTF(intl, opts);
    }
  }

  var _proto3 = PolyRelFormatter.prototype;

  _proto3.format = function format(count, unit) {
    if (this.rtf) {
      return this.rtf.format(count, unit);
    } else {
      return formatRelativeTime(unit, count, this.opts.numeric, this.opts.style !== "long");
    }
  };

  _proto3.formatToParts = function formatToParts(count, unit) {
    if (this.rtf) {
      return this.rtf.formatToParts(count, unit);
    } else {
      return [];
    }
  };

  return PolyRelFormatter;
}();
/**
 * @private
 */


var Locale = /*#__PURE__*/function () {
  Locale.fromOpts = function fromOpts(opts) {
    return Locale.create(opts.locale, opts.numberingSystem, opts.outputCalendar, opts.defaultToEN);
  };

  Locale.create = function create(locale, numberingSystem, outputCalendar, defaultToEN) {
    if (defaultToEN === void 0) {
      defaultToEN = false;
    }

    var specifiedLocale = locale || Settings.defaultLocale,
        // the system locale is useful for human readable strings but annoying for parsing/formatting known formats
    localeR = specifiedLocale || (defaultToEN ? "en-US" : systemLocale()),
        numberingSystemR = numberingSystem || Settings.defaultNumberingSystem,
        outputCalendarR = outputCalendar || Settings.defaultOutputCalendar;
    return new Locale(localeR, numberingSystemR, outputCalendarR, specifiedLocale);
  };

  Locale.resetCache = function resetCache() {
    sysLocaleCache = null;
    intlDTCache = {};
    intlNumCache = {};
    intlRelCache = {};
  };

  Locale.fromObject = function fromObject(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        locale = _ref.locale,
        numberingSystem = _ref.numberingSystem,
        outputCalendar = _ref.outputCalendar;

    return Locale.create(locale, numberingSystem, outputCalendar);
  };

  function Locale(locale, numbering, outputCalendar, specifiedLocale) {
    var _parseLocaleString = parseLocaleString(locale),
        parsedLocale = _parseLocaleString[0],
        parsedNumberingSystem = _parseLocaleString[1],
        parsedOutputCalendar = _parseLocaleString[2];

    this.locale = parsedLocale;
    this.numberingSystem = numbering || parsedNumberingSystem || null;
    this.outputCalendar = outputCalendar || parsedOutputCalendar || null;
    this.intl = intlConfigString(this.locale, this.numberingSystem, this.outputCalendar);
    this.weekdaysCache = {
      format: {},
      standalone: {}
    };
    this.monthsCache = {
      format: {},
      standalone: {}
    };
    this.meridiemCache = null;
    this.eraCache = {};
    this.specifiedLocale = specifiedLocale;
    this.fastNumbersCached = null;
  }

  var _proto4 = Locale.prototype;

  _proto4.listingMode = function listingMode(defaultOK) {
    if (defaultOK === void 0) {
      defaultOK = true;
    }

    var intl = hasIntl(),
        hasFTP = intl && hasFormatToParts(),
        isActuallyEn = this.isEnglish(),
        hasNoWeirdness = (this.numberingSystem === null || this.numberingSystem === "latn") && (this.outputCalendar === null || this.outputCalendar === "gregory");

    if (!hasFTP && !(isActuallyEn && hasNoWeirdness) && !defaultOK) {
      return "error";
    } else if (!hasFTP || isActuallyEn && hasNoWeirdness) {
      return "en";
    } else {
      return "intl";
    }
  };

  _proto4.clone = function clone(alts) {
    if (!alts || Object.getOwnPropertyNames(alts).length === 0) {
      return this;
    } else {
      return Locale.create(alts.locale || this.specifiedLocale, alts.numberingSystem || this.numberingSystem, alts.outputCalendar || this.outputCalendar, alts.defaultToEN || false);
    }
  };

  _proto4.redefaultToEN = function redefaultToEN(alts) {
    if (alts === void 0) {
      alts = {};
    }

    return this.clone(Object.assign({}, alts, {
      defaultToEN: true
    }));
  };

  _proto4.redefaultToSystem = function redefaultToSystem(alts) {
    if (alts === void 0) {
      alts = {};
    }

    return this.clone(Object.assign({}, alts, {
      defaultToEN: false
    }));
  };

  _proto4.months = function months$1(length, format, defaultOK) {
    var _this = this;

    if (format === void 0) {
      format = false;
    }

    if (defaultOK === void 0) {
      defaultOK = true;
    }

    return listStuff(this, length, defaultOK, months, function () {
      var intl = format ? {
        month: length,
        day: "numeric"
      } : {
        month: length
      },
          formatStr = format ? "format" : "standalone";

      if (!_this.monthsCache[formatStr][length]) {
        _this.monthsCache[formatStr][length] = mapMonths(function (dt) {
          return _this.extract(dt, intl, "month");
        });
      }

      return _this.monthsCache[formatStr][length];
    });
  };

  _proto4.weekdays = function weekdays$1(length, format, defaultOK) {
    var _this2 = this;

    if (format === void 0) {
      format = false;
    }

    if (defaultOK === void 0) {
      defaultOK = true;
    }

    return listStuff(this, length, defaultOK, weekdays, function () {
      var intl = format ? {
        weekday: length,
        year: "numeric",
        month: "long",
        day: "numeric"
      } : {
        weekday: length
      },
          formatStr = format ? "format" : "standalone";

      if (!_this2.weekdaysCache[formatStr][length]) {
        _this2.weekdaysCache[formatStr][length] = mapWeekdays(function (dt) {
          return _this2.extract(dt, intl, "weekday");
        });
      }

      return _this2.weekdaysCache[formatStr][length];
    });
  };

  _proto4.meridiems = function meridiems$1(defaultOK) {
    var _this3 = this;

    if (defaultOK === void 0) {
      defaultOK = true;
    }

    return listStuff(this, undefined, defaultOK, function () {
      return meridiems;
    }, function () {
      // In theory there could be aribitrary day periods. We're gonna assume there are exactly two
      // for AM and PM. This is probably wrong, but it's makes parsing way easier.
      if (!_this3.meridiemCache) {
        var intl = {
          hour: "numeric",
          hour12: true
        };
        _this3.meridiemCache = [DateTime.utc(2016, 11, 13, 9), DateTime.utc(2016, 11, 13, 19)].map(function (dt) {
          return _this3.extract(dt, intl, "dayperiod");
        });
      }

      return _this3.meridiemCache;
    });
  };

  _proto4.eras = function eras$1(length, defaultOK) {
    var _this4 = this;

    if (defaultOK === void 0) {
      defaultOK = true;
    }

    return listStuff(this, length, defaultOK, eras, function () {
      var intl = {
        era: length
      }; // This is problematic. Different calendars are going to define eras totally differently. What I need is the minimum set of dates
      // to definitely enumerate them.

      if (!_this4.eraCache[length]) {
        _this4.eraCache[length] = [DateTime.utc(-40, 1, 1), DateTime.utc(2017, 1, 1)].map(function (dt) {
          return _this4.extract(dt, intl, "era");
        });
      }

      return _this4.eraCache[length];
    });
  };

  _proto4.extract = function extract(dt, intlOpts, field) {
    var df = this.dtFormatter(dt, intlOpts),
        results = df.formatToParts(),
        matching = results.find(function (m) {
      return m.type.toLowerCase() === field;
    });
    return matching ? matching.value : null;
  };

  _proto4.numberFormatter = function numberFormatter(opts) {
    if (opts === void 0) {
      opts = {};
    }

    // this forcesimple option is never used (the only caller short-circuits on it, but it seems safer to leave)
    // (in contrast, the rest of the condition is used heavily)
    return new PolyNumberFormatter(this.intl, opts.forceSimple || this.fastNumbers, opts);
  };

  _proto4.dtFormatter = function dtFormatter(dt, intlOpts) {
    if (intlOpts === void 0) {
      intlOpts = {};
    }

    return new PolyDateFormatter(dt, this.intl, intlOpts);
  };

  _proto4.relFormatter = function relFormatter(opts) {
    if (opts === void 0) {
      opts = {};
    }

    return new PolyRelFormatter(this.intl, this.isEnglish(), opts);
  };

  _proto4.isEnglish = function isEnglish() {
    return this.locale === "en" || this.locale.toLowerCase() === "en-us" || hasIntl() && new Intl.DateTimeFormat(this.intl).resolvedOptions().locale.startsWith("en-us");
  };

  _proto4.equals = function equals(other) {
    return this.locale === other.locale && this.numberingSystem === other.numberingSystem && this.outputCalendar === other.outputCalendar;
  };

  _createClass(Locale, [{
    key: "fastNumbers",
    get: function get() {
      if (this.fastNumbersCached == null) {
        this.fastNumbersCached = supportsFastNumbers(this);
      }

      return this.fastNumbersCached;
    }
  }]);

  return Locale;
}();

/*
 * This file handles parsing for well-specified formats. Here's how it works:
 * Two things go into parsing: a regex to match with and an extractor to take apart the groups in the match.
 * An extractor is just a function that takes a regex match array and returns a { year: ..., month: ... } object
 * parse() does the work of executing the regex and applying the extractor. It takes multiple regex/extractor pairs to try in sequence.
 * Extractors can take a "cursor" representing the offset in the match to look at. This makes it easy to combine extractors.
 * combineExtractors() does the work of combining them, keeping track of the cursor through multiple extractions.
 * Some extractions are super dumb and simpleParse and fromStrings help DRY them.
 */

function combineRegexes() {
  for (var _len = arguments.length, regexes = new Array(_len), _key = 0; _key < _len; _key++) {
    regexes[_key] = arguments[_key];
  }

  var full = regexes.reduce(function (f, r) {
    return f + r.source;
  }, "");
  return RegExp("^" + full + "$");
}

function combineExtractors() {
  for (var _len2 = arguments.length, extractors = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    extractors[_key2] = arguments[_key2];
  }

  return function (m) {
    return extractors.reduce(function (_ref, ex) {
      var mergedVals = _ref[0],
          mergedZone = _ref[1],
          cursor = _ref[2];

      var _ex = ex(m, cursor),
          val = _ex[0],
          zone = _ex[1],
          next = _ex[2];

      return [Object.assign(mergedVals, val), mergedZone || zone, next];
    }, [{}, null, 1]).slice(0, 2);
  };
}

function parse(s) {
  if (s == null) {
    return [null, null];
  }

  for (var _len3 = arguments.length, patterns = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
    patterns[_key3 - 1] = arguments[_key3];
  }

  for (var _i = 0, _patterns = patterns; _i < _patterns.length; _i++) {
    var _patterns$_i = _patterns[_i],
        regex = _patterns$_i[0],
        extractor = _patterns$_i[1];
    var m = regex.exec(s);

    if (m) {
      return extractor(m);
    }
  }

  return [null, null];
}

function simpleParse() {
  for (var _len4 = arguments.length, keys = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    keys[_key4] = arguments[_key4];
  }

  return function (match, cursor) {
    var ret = {};
    var i;

    for (i = 0; i < keys.length; i++) {
      ret[keys[i]] = parseInteger(match[cursor + i]);
    }

    return [ret, null, cursor + i];
  };
} // ISO and SQL parsing


var offsetRegex = /(?:(Z)|([+-]\d\d)(?::?(\d\d))?)/,
    isoTimeBaseRegex = /(\d\d)(?::?(\d\d)(?::?(\d\d)(?:[.,](\d{1,30}))?)?)?/,
    isoTimeRegex = RegExp("" + isoTimeBaseRegex.source + offsetRegex.source + "?"),
    isoTimeExtensionRegex = RegExp("(?:T" + isoTimeRegex.source + ")?"),
    isoYmdRegex = /([+-]\d{6}|\d{4})(?:-?(\d\d)(?:-?(\d\d))?)?/,
    isoWeekRegex = /(\d{4})-?W(\d\d)(?:-?(\d))?/,
    isoOrdinalRegex = /(\d{4})-?(\d{3})/,
    extractISOWeekData = simpleParse("weekYear", "weekNumber", "weekDay"),
    extractISOOrdinalData = simpleParse("year", "ordinal"),
    sqlYmdRegex = /(\d{4})-(\d\d)-(\d\d)/,
    // dumbed-down version of the ISO one
sqlTimeRegex = RegExp(isoTimeBaseRegex.source + " ?(?:" + offsetRegex.source + "|(" + ianaRegex.source + "))?"),
    sqlTimeExtensionRegex = RegExp("(?: " + sqlTimeRegex.source + ")?");

function int(match, pos, fallback) {
  var m = match[pos];
  return isUndefined(m) ? fallback : parseInteger(m);
}

function extractISOYmd(match, cursor) {
  var item = {
    year: int(match, cursor),
    month: int(match, cursor + 1, 1),
    day: int(match, cursor + 2, 1)
  };
  return [item, null, cursor + 3];
}

function extractISOTime(match, cursor) {
  var item = {
    hours: int(match, cursor, 0),
    minutes: int(match, cursor + 1, 0),
    seconds: int(match, cursor + 2, 0),
    milliseconds: parseMillis(match[cursor + 3])
  };
  return [item, null, cursor + 4];
}

function extractISOOffset(match, cursor) {
  var local = !match[cursor] && !match[cursor + 1],
      fullOffset = signedOffset(match[cursor + 1], match[cursor + 2]),
      zone = local ? null : FixedOffsetZone.instance(fullOffset);
  return [{}, zone, cursor + 3];
}

function extractIANAZone(match, cursor) {
  var zone = match[cursor] ? IANAZone.create(match[cursor]) : null;
  return [{}, zone, cursor + 1];
} // ISO time parsing


var isoTimeOnly = RegExp("^T?" + isoTimeBaseRegex.source + "$"); // ISO duration parsing

var isoDuration = /^-?P(?:(?:(-?\d{1,9})Y)?(?:(-?\d{1,9})M)?(?:(-?\d{1,9})W)?(?:(-?\d{1,9})D)?(?:T(?:(-?\d{1,9})H)?(?:(-?\d{1,9})M)?(?:(-?\d{1,20})(?:[.,](-?\d{1,9}))?S)?)?)$/;

function extractISODuration(match) {
  var s = match[0],
      yearStr = match[1],
      monthStr = match[2],
      weekStr = match[3],
      dayStr = match[4],
      hourStr = match[5],
      minuteStr = match[6],
      secondStr = match[7],
      millisecondsStr = match[8];
  var hasNegativePrefix = s[0] === "-";

  var maybeNegate = function maybeNegate(num) {
    return num && hasNegativePrefix ? -num : num;
  };

  return [{
    years: maybeNegate(parseInteger(yearStr)),
    months: maybeNegate(parseInteger(monthStr)),
    weeks: maybeNegate(parseInteger(weekStr)),
    days: maybeNegate(parseInteger(dayStr)),
    hours: maybeNegate(parseInteger(hourStr)),
    minutes: maybeNegate(parseInteger(minuteStr)),
    seconds: maybeNegate(parseInteger(secondStr)),
    milliseconds: maybeNegate(parseMillis(millisecondsStr))
  }];
} // These are a little braindead. EDT *should* tell us that we're in, say, America/New_York
// and not just that we're in -240 *right now*. But since I don't think these are used that often
// I'm just going to ignore that


var obsOffsets = {
  GMT: 0,
  EDT: -4 * 60,
  EST: -5 * 60,
  CDT: -5 * 60,
  CST: -6 * 60,
  MDT: -6 * 60,
  MST: -7 * 60,
  PDT: -7 * 60,
  PST: -8 * 60
};

function fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr) {
  var result = {
    year: yearStr.length === 2 ? untruncateYear(parseInteger(yearStr)) : parseInteger(yearStr),
    month: monthsShort.indexOf(monthStr) + 1,
    day: parseInteger(dayStr),
    hour: parseInteger(hourStr),
    minute: parseInteger(minuteStr)
  };
  if (secondStr) result.second = parseInteger(secondStr);

  if (weekdayStr) {
    result.weekday = weekdayStr.length > 3 ? weekdaysLong.indexOf(weekdayStr) + 1 : weekdaysShort.indexOf(weekdayStr) + 1;
  }

  return result;
} // RFC 2822/5322


var rfc2822 = /^(?:(Mon|Tue|Wed|Thu|Fri|Sat|Sun),\s)?(\d{1,2})\s(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{2,4})\s(\d\d):(\d\d)(?::(\d\d))?\s(?:(UT|GMT|[ECMP][SD]T)|([Zz])|(?:([+-]\d\d)(\d\d)))$/;

function extractRFC2822(match) {
  var weekdayStr = match[1],
      dayStr = match[2],
      monthStr = match[3],
      yearStr = match[4],
      hourStr = match[5],
      minuteStr = match[6],
      secondStr = match[7],
      obsOffset = match[8],
      milOffset = match[9],
      offHourStr = match[10],
      offMinuteStr = match[11],
      result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  var offset;

  if (obsOffset) {
    offset = obsOffsets[obsOffset];
  } else if (milOffset) {
    offset = 0;
  } else {
    offset = signedOffset(offHourStr, offMinuteStr);
  }

  return [result, new FixedOffsetZone(offset)];
}

function preprocessRFC2822(s) {
  // Remove comments and folding whitespace and replace multiple-spaces with a single space
  return s.replace(/\([^)]*\)|[\n\t]/g, " ").replace(/(\s\s+)/g, " ").trim();
} // http date


var rfc1123 = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d\d) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d\d):(\d\d):(\d\d) GMT$/,
    rfc850 = /^(Monday|Tuesday|Wedsday|Thursday|Friday|Saturday|Sunday), (\d\d)-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d\d) (\d\d):(\d\d):(\d\d) GMT$/,
    ascii = /^(Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d\d) (\d\d):(\d\d):(\d\d) (\d{4})$/;

function extractRFC1123Or850(match) {
  var weekdayStr = match[1],
      dayStr = match[2],
      monthStr = match[3],
      yearStr = match[4],
      hourStr = match[5],
      minuteStr = match[6],
      secondStr = match[7],
      result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, FixedOffsetZone.utcInstance];
}

function extractASCII(match) {
  var weekdayStr = match[1],
      monthStr = match[2],
      dayStr = match[3],
      hourStr = match[4],
      minuteStr = match[5],
      secondStr = match[6],
      yearStr = match[7],
      result = fromStrings(weekdayStr, yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr);
  return [result, FixedOffsetZone.utcInstance];
}

var isoYmdWithTimeExtensionRegex = combineRegexes(isoYmdRegex, isoTimeExtensionRegex);
var isoWeekWithTimeExtensionRegex = combineRegexes(isoWeekRegex, isoTimeExtensionRegex);
var isoOrdinalWithTimeExtensionRegex = combineRegexes(isoOrdinalRegex, isoTimeExtensionRegex);
var isoTimeCombinedRegex = combineRegexes(isoTimeRegex);
var extractISOYmdTimeAndOffset = combineExtractors(extractISOYmd, extractISOTime, extractISOOffset);
var extractISOWeekTimeAndOffset = combineExtractors(extractISOWeekData, extractISOTime, extractISOOffset);
var extractISOOrdinalDataAndTime = combineExtractors(extractISOOrdinalData, extractISOTime);
var extractISOTimeAndOffset = combineExtractors(extractISOTime, extractISOOffset);
/**
 * @private
 */

function parseISODate(s) {
  return parse(s, [isoYmdWithTimeExtensionRegex, extractISOYmdTimeAndOffset], [isoWeekWithTimeExtensionRegex, extractISOWeekTimeAndOffset], [isoOrdinalWithTimeExtensionRegex, extractISOOrdinalDataAndTime], [isoTimeCombinedRegex, extractISOTimeAndOffset]);
}
function parseRFC2822Date(s) {
  return parse(preprocessRFC2822(s), [rfc2822, extractRFC2822]);
}
function parseHTTPDate(s) {
  return parse(s, [rfc1123, extractRFC1123Or850], [rfc850, extractRFC1123Or850], [ascii, extractASCII]);
}
function parseISODuration(s) {
  return parse(s, [isoDuration, extractISODuration]);
}
var extractISOTimeOnly = combineExtractors(extractISOTime);
function parseISOTimeOnly(s) {
  return parse(s, [isoTimeOnly, extractISOTimeOnly]);
}
var sqlYmdWithTimeExtensionRegex = combineRegexes(sqlYmdRegex, sqlTimeExtensionRegex);
var sqlTimeCombinedRegex = combineRegexes(sqlTimeRegex);
var extractISOYmdTimeOffsetAndIANAZone = combineExtractors(extractISOYmd, extractISOTime, extractISOOffset, extractIANAZone);
var extractISOTimeOffsetAndIANAZone = combineExtractors(extractISOTime, extractISOOffset, extractIANAZone);
function parseSQL(s) {
  return parse(s, [sqlYmdWithTimeExtensionRegex, extractISOYmdTimeOffsetAndIANAZone], [sqlTimeCombinedRegex, extractISOTimeOffsetAndIANAZone]);
}

var INVALID = "Invalid Duration"; // unit conversion constants

var lowOrderMatrix = {
  weeks: {
    days: 7,
    hours: 7 * 24,
    minutes: 7 * 24 * 60,
    seconds: 7 * 24 * 60 * 60,
    milliseconds: 7 * 24 * 60 * 60 * 1000
  },
  days: {
    hours: 24,
    minutes: 24 * 60,
    seconds: 24 * 60 * 60,
    milliseconds: 24 * 60 * 60 * 1000
  },
  hours: {
    minutes: 60,
    seconds: 60 * 60,
    milliseconds: 60 * 60 * 1000
  },
  minutes: {
    seconds: 60,
    milliseconds: 60 * 1000
  },
  seconds: {
    milliseconds: 1000
  }
},
    casualMatrix = Object.assign({
  years: {
    quarters: 4,
    months: 12,
    weeks: 52,
    days: 365,
    hours: 365 * 24,
    minutes: 365 * 24 * 60,
    seconds: 365 * 24 * 60 * 60,
    milliseconds: 365 * 24 * 60 * 60 * 1000
  },
  quarters: {
    months: 3,
    weeks: 13,
    days: 91,
    hours: 91 * 24,
    minutes: 91 * 24 * 60,
    seconds: 91 * 24 * 60 * 60,
    milliseconds: 91 * 24 * 60 * 60 * 1000
  },
  months: {
    weeks: 4,
    days: 30,
    hours: 30 * 24,
    minutes: 30 * 24 * 60,
    seconds: 30 * 24 * 60 * 60,
    milliseconds: 30 * 24 * 60 * 60 * 1000
  }
}, lowOrderMatrix),
    daysInYearAccurate = 146097.0 / 400,
    daysInMonthAccurate = 146097.0 / 4800,
    accurateMatrix = Object.assign({
  years: {
    quarters: 4,
    months: 12,
    weeks: daysInYearAccurate / 7,
    days: daysInYearAccurate,
    hours: daysInYearAccurate * 24,
    minutes: daysInYearAccurate * 24 * 60,
    seconds: daysInYearAccurate * 24 * 60 * 60,
    milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000
  },
  quarters: {
    months: 3,
    weeks: daysInYearAccurate / 28,
    days: daysInYearAccurate / 4,
    hours: daysInYearAccurate * 24 / 4,
    minutes: daysInYearAccurate * 24 * 60 / 4,
    seconds: daysInYearAccurate * 24 * 60 * 60 / 4,
    milliseconds: daysInYearAccurate * 24 * 60 * 60 * 1000 / 4
  },
  months: {
    weeks: daysInMonthAccurate / 7,
    days: daysInMonthAccurate,
    hours: daysInMonthAccurate * 24,
    minutes: daysInMonthAccurate * 24 * 60,
    seconds: daysInMonthAccurate * 24 * 60 * 60,
    milliseconds: daysInMonthAccurate * 24 * 60 * 60 * 1000
  }
}, lowOrderMatrix); // units ordered by size

var orderedUnits = ["years", "quarters", "months", "weeks", "days", "hours", "minutes", "seconds", "milliseconds"];
var reverseUnits = orderedUnits.slice(0).reverse(); // clone really means "create another instance just like this one, but with these changes"

function clone(dur, alts, clear) {
  if (clear === void 0) {
    clear = false;
  }

  // deep merge for vals
  var conf = {
    values: clear ? alts.values : Object.assign({}, dur.values, alts.values || {}),
    loc: dur.loc.clone(alts.loc),
    conversionAccuracy: alts.conversionAccuracy || dur.conversionAccuracy
  };
  return new Duration(conf);
}

function antiTrunc(n) {
  return n < 0 ? Math.floor(n) : Math.ceil(n);
} // NB: mutates parameters


function convert(matrix, fromMap, fromUnit, toMap, toUnit) {
  var conv = matrix[toUnit][fromUnit],
      raw = fromMap[fromUnit] / conv,
      sameSign = Math.sign(raw) === Math.sign(toMap[toUnit]),
      // ok, so this is wild, but see the matrix in the tests
  added = !sameSign && toMap[toUnit] !== 0 && Math.abs(raw) <= 1 ? antiTrunc(raw) : Math.trunc(raw);
  toMap[toUnit] += added;
  fromMap[fromUnit] -= added * conv;
} // NB: mutates parameters


function normalizeValues(matrix, vals) {
  reverseUnits.reduce(function (previous, current) {
    if (!isUndefined(vals[current])) {
      if (previous) {
        convert(matrix, vals, previous, vals, current);
      }

      return current;
    } else {
      return previous;
    }
  }, null);
}
/**
 * A Duration object represents a period of time, like "2 months" or "1 day, 1 hour". Conceptually, it's just a map of units to their quantities, accompanied by some additional configuration and methods for creating, parsing, interrogating, transforming, and formatting them. They can be used on their own or in conjunction with other Luxon types; for example, you can use {@link DateTime.plus} to add a Duration object to a DateTime, producing another DateTime.
 *
 * Here is a brief overview of commonly used methods and getters in Duration:
 *
 * * **Creation** To create a Duration, use {@link Duration.fromMillis}, {@link Duration.fromObject}, or {@link Duration.fromISO}.
 * * **Unit values** See the {@link Duration.years}, {@link Duration.months}, {@link Duration.weeks}, {@link Duration.days}, {@link Duration.hours}, {@link Duration.minutes}, {@link Duration.seconds}, {@link Duration.milliseconds} accessors.
 * * **Configuration** See  {@link Duration.locale} and {@link Duration.numberingSystem} accessors.
 * * **Transformation** To create new Durations out of old ones use {@link Duration.plus}, {@link Duration.minus}, {@link Duration.normalize}, {@link Duration.set}, {@link Duration.reconfigure}, {@link Duration.shiftTo}, and {@link Duration.negate}.
 * * **Output** To convert the Duration into other representations, see {@link Duration.as}, {@link Duration.toISO}, {@link Duration.toFormat}, and {@link Duration.toJSON}
 *
 * There's are more methods documented below. In addition, for more information on subtler topics like internationalization and validity, see the external documentation.
 */


var Duration = /*#__PURE__*/function () {
  /**
   * @private
   */
  function Duration(config) {
    var accurate = config.conversionAccuracy === "longterm" || false;
    /**
     * @access private
     */

    this.values = config.values;
    /**
     * @access private
     */

    this.loc = config.loc || Locale.create();
    /**
     * @access private
     */

    this.conversionAccuracy = accurate ? "longterm" : "casual";
    /**
     * @access private
     */

    this.invalid = config.invalid || null;
    /**
     * @access private
     */

    this.matrix = accurate ? accurateMatrix : casualMatrix;
    /**
     * @access private
     */

    this.isLuxonDuration = true;
  }
  /**
   * Create Duration from a number of milliseconds.
   * @param {number} count of milliseconds
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */


  Duration.fromMillis = function fromMillis(count, opts) {
    return Duration.fromObject(Object.assign({
      milliseconds: count
    }, opts));
  }
  /**
   * Create a Duration from a JavaScript object with keys like 'years' and 'hours.
   * If this object is empty then a zero milliseconds duration is returned.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.years
   * @param {number} obj.quarters
   * @param {number} obj.months
   * @param {number} obj.weeks
   * @param {number} obj.days
   * @param {number} obj.hours
   * @param {number} obj.minutes
   * @param {number} obj.seconds
   * @param {number} obj.milliseconds
   * @param {string} [obj.locale='en-US'] - the locale to use
   * @param {string} obj.numberingSystem - the numbering system to use
   * @param {string} [obj.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  ;

  Duration.fromObject = function fromObject(obj) {
    if (obj == null || typeof obj !== "object") {
      throw new InvalidArgumentError("Duration.fromObject: argument expected to be an object, got " + (obj === null ? "null" : typeof obj));
    }

    return new Duration({
      values: normalizeObject(obj, Duration.normalizeUnit, ["locale", "numberingSystem", "conversionAccuracy", "zone" // a bit of debt; it's super inconvenient internally not to be able to blindly pass this
      ]),
      loc: Locale.fromObject(obj),
      conversionAccuracy: obj.conversionAccuracy
    });
  }
  /**
   * Create a Duration from an ISO 8601 duration string.
   * @param {string} text - text to parse
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromISO('P3Y6M1W4DT12H30M5S').toObject() //=> { years: 3, months: 6, weeks: 1, days: 4, hours: 12, minutes: 30, seconds: 5 }
   * @example Duration.fromISO('PT23H').toObject() //=> { hours: 23 }
   * @example Duration.fromISO('P5Y3M').toObject() //=> { years: 5, months: 3 }
   * @return {Duration}
   */
  ;

  Duration.fromISO = function fromISO(text, opts) {
    var _parseISODuration = parseISODuration(text),
        parsed = _parseISODuration[0];

    if (parsed) {
      var obj = Object.assign(parsed, opts);
      return Duration.fromObject(obj);
    } else {
      return Duration.invalid("unparsable", "the input \"" + text + "\" can't be parsed as ISO 8601");
    }
  }
  /**
   * Create a Duration from an ISO 8601 time string.
   * @param {string} text - text to parse
   * @param {Object} opts - options for parsing
   * @param {string} [opts.locale='en-US'] - the locale to use
   * @param {string} opts.numberingSystem - the numbering system to use
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @see https://en.wikipedia.org/wiki/ISO_8601#Times
   * @example Duration.fromISOTime('11:22:33.444').toObject() //=> { hours: 11, minutes: 22, seconds: 33, milliseconds: 444 }
   * @example Duration.fromISOTime('11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('T11:00').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @example Duration.fromISOTime('T1100').toObject() //=> { hours: 11, minutes: 0, seconds: 0 }
   * @return {Duration}
   */
  ;

  Duration.fromISOTime = function fromISOTime(text, opts) {
    var _parseISOTimeOnly = parseISOTimeOnly(text),
        parsed = _parseISOTimeOnly[0];

    if (parsed) {
      var obj = Object.assign(parsed, opts);
      return Duration.fromObject(obj);
    } else {
      return Duration.invalid("unparsable", "the input \"" + text + "\" can't be parsed as ISO 8601");
    }
  }
  /**
   * Create an invalid Duration.
   * @param {string} reason - simple string of why this datetime is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Duration}
   */
  ;

  Duration.invalid = function invalid(reason, explanation) {
    if (explanation === void 0) {
      explanation = null;
    }

    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the Duration is invalid");
    }

    var invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);

    if (Settings.throwOnInvalid) {
      throw new InvalidDurationError(invalid);
    } else {
      return new Duration({
        invalid: invalid
      });
    }
  }
  /**
   * @private
   */
  ;

  Duration.normalizeUnit = function normalizeUnit(unit) {
    var normalized = {
      year: "years",
      years: "years",
      quarter: "quarters",
      quarters: "quarters",
      month: "months",
      months: "months",
      week: "weeks",
      weeks: "weeks",
      day: "days",
      days: "days",
      hour: "hours",
      hours: "hours",
      minute: "minutes",
      minutes: "minutes",
      second: "seconds",
      seconds: "seconds",
      millisecond: "milliseconds",
      milliseconds: "milliseconds"
    }[unit ? unit.toLowerCase() : unit];
    if (!normalized) throw new InvalidUnitError(unit);
    return normalized;
  }
  /**
   * Check if an object is a Duration. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  ;

  Duration.isDuration = function isDuration(o) {
    return o && o.isLuxonDuration || false;
  }
  /**
   * Get  the locale of a Duration, such 'en-GB'
   * @type {string}
   */
  ;

  var _proto = Duration.prototype;

  /**
   * Returns a string representation of this Duration formatted according to the specified format string. You may use these tokens:
   * * `S` for milliseconds
   * * `s` for seconds
   * * `m` for minutes
   * * `h` for hours
   * * `d` for days
   * * `M` for months
   * * `y` for years
   * Notes:
   * * Add padding by repeating the token, e.g. "yy" pads the years to two digits, "hhhh" pads the hours out to four digits
   * * The duration will be converted to the set of units in the format string using {@link Duration.shiftTo} and the Durations's conversion accuracy setting.
   * @param {string} fmt - the format string
   * @param {Object} opts - options
   * @param {boolean} [opts.floor=true] - floor numerical values
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("y d s") //=> "1 6 2"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("yy dd sss") //=> "01 06 002"
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toFormat("M S") //=> "12 518402000"
   * @return {string}
   */
  _proto.toFormat = function toFormat(fmt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    // reverse-compat since 1.2; we always round down now, never up, and we do it by default
    var fmtOpts = Object.assign({}, opts, {
      floor: opts.round !== false && opts.floor !== false
    });
    return this.isValid ? Formatter.create(this.loc, fmtOpts).formatDurationFromString(this, fmt) : INVALID;
  }
  /**
   * Returns a JavaScript object with this Duration's values.
   * @param opts - options for generating the object
   * @param {boolean} [opts.includeConfig=false] - include configuration attributes in the output
   * @example Duration.fromObject({ years: 1, days: 6, seconds: 2 }).toObject() //=> { years: 1, days: 6, seconds: 2 }
   * @return {Object}
   */
  ;

  _proto.toObject = function toObject(opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (!this.isValid) return {};
    var base = Object.assign({}, this.values);

    if (opts.includeConfig) {
      base.conversionAccuracy = this.conversionAccuracy;
      base.numberingSystem = this.loc.numberingSystem;
      base.locale = this.loc.locale;
    }

    return base;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Duration.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Durations
   * @example Duration.fromObject({ years: 3, seconds: 45 }).toISO() //=> 'P3YT45S'
   * @example Duration.fromObject({ months: 4, seconds: 45 }).toISO() //=> 'P4MT45S'
   * @example Duration.fromObject({ months: 5 }).toISO() //=> 'P5M'
   * @example Duration.fromObject({ minutes: 5 }).toISO() //=> 'PT5M'
   * @example Duration.fromObject({ milliseconds: 6 }).toISO() //=> 'PT0.006S'
   * @return {string}
   */
  ;

  _proto.toISO = function toISO() {
    // we could use the formatter, but this is an easier way to get the minimum string
    if (!this.isValid) return null;
    var s = "P";
    if (this.years !== 0) s += this.years + "Y";
    if (this.months !== 0 || this.quarters !== 0) s += this.months + this.quarters * 3 + "M";
    if (this.weeks !== 0) s += this.weeks + "W";
    if (this.days !== 0) s += this.days + "D";
    if (this.hours !== 0 || this.minutes !== 0 || this.seconds !== 0 || this.milliseconds !== 0) s += "T";
    if (this.hours !== 0) s += this.hours + "H";
    if (this.minutes !== 0) s += this.minutes + "M";
    if (this.seconds !== 0 || this.milliseconds !== 0) // this will handle "floating point madness" by removing extra decimal places
      // https://stackoverflow.com/questions/588004/is-floating-point-math-broken
      s += roundTo(this.seconds + this.milliseconds / 1000, 3) + "S";
    if (s === "P") s += "T0S";
    return s;
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Duration, formatted as a time of day.
   * Note that this will return null if the duration is invalid, negative, or equal to or greater than 24 hours.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Times
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example Duration.fromObject({ hours: 11 }).toISOTime() //=> '11:00:00.000'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressMilliseconds: true }) //=> '11:00:00'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ suppressSeconds: true }) //=> '11:00'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ includePrefix: true }) //=> 'T11:00:00.000'
   * @example Duration.fromObject({ hours: 11 }).toISOTime({ format: 'basic' }) //=> '110000.000'
   * @return {string}
   */
  ;

  _proto.toISOTime = function toISOTime(opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (!this.isValid) return null;
    var millis = this.toMillis();
    if (millis < 0 || millis >= 86400000) return null;
    opts = Object.assign({
      suppressMilliseconds: false,
      suppressSeconds: false,
      includePrefix: false,
      format: "extended"
    }, opts);
    var value = this.shiftTo("hours", "minutes", "seconds", "milliseconds");
    var fmt = opts.format === "basic" ? "hhmm" : "hh:mm";

    if (!opts.suppressSeconds || value.seconds !== 0 || value.milliseconds !== 0) {
      fmt += opts.format === "basic" ? "ss" : ":ss";

      if (!opts.suppressMilliseconds || value.milliseconds !== 0) {
        fmt += ".SSS";
      }
    }

    var str = value.toFormat(fmt);

    if (opts.includePrefix) {
      str = "T" + str;
    }

    return str;
  }
  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in JSON.
   * @return {string}
   */
  ;

  _proto.toJSON = function toJSON() {
    return this.toISO();
  }
  /**
   * Returns an ISO 8601 representation of this Duration appropriate for use in debugging.
   * @return {string}
   */
  ;

  _proto.toString = function toString() {
    return this.toISO();
  }
  /**
   * Returns an milliseconds value of this Duration.
   * @return {number}
   */
  ;

  _proto.toMillis = function toMillis() {
    return this.as("milliseconds");
  }
  /**
   * Returns an milliseconds value of this Duration. Alias of {@link toMillis}
   * @return {number}
   */
  ;

  _proto.valueOf = function valueOf() {
    return this.toMillis();
  }
  /**
   * Make this Duration longer by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  ;

  _proto.plus = function plus(duration) {
    if (!this.isValid) return this;
    var dur = friendlyDuration(duration),
        result = {};

    for (var _iterator = _createForOfIteratorHelperLoose(orderedUnits), _step; !(_step = _iterator()).done;) {
      var k = _step.value;

      if (hasOwnProperty(dur.values, k) || hasOwnProperty(this.values, k)) {
        result[k] = dur.get(k) + this.get(k);
      }
    }

    return clone(this, {
      values: result
    }, true);
  }
  /**
   * Make this Duration shorter by the specified amount. Return a newly-constructed Duration.
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @return {Duration}
   */
  ;

  _proto.minus = function minus(duration) {
    if (!this.isValid) return this;
    var dur = friendlyDuration(duration);
    return this.plus(dur.negate());
  }
  /**
   * Scale this Duration by the specified amount. Return a newly-constructed Duration.
   * @param {function} fn - The function to apply to each unit. Arity is 1 or 2: the value of the unit and, optionally, the unit name. Must return a number.
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnit(x => x * 2) //=> { hours: 2, minutes: 60 }
   * @example Duration.fromObject({ hours: 1, minutes: 30 }).mapUnit((x, u) => u === "hour" ? x * 2 : x) //=> { hours: 2, minutes: 30 }
   * @return {Duration}
   */
  ;

  _proto.mapUnits = function mapUnits(fn) {
    if (!this.isValid) return this;
    var result = {};

    for (var _i = 0, _Object$keys = Object.keys(this.values); _i < _Object$keys.length; _i++) {
      var k = _Object$keys[_i];
      result[k] = asNumber(fn(this.values[k], k));
    }

    return clone(this, {
      values: result
    }, true);
  }
  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example Duration.fromObject({years: 2, days: 3}).years //=> 2
   * @example Duration.fromObject({years: 2, days: 3}).months //=> 0
   * @example Duration.fromObject({years: 2, days: 3}).days //=> 3
   * @return {number}
   */
  ;

  _proto.get = function get(unit) {
    return this[Duration.normalizeUnit(unit)];
  }
  /**
   * "Set" the values of specified units. Return a newly-constructed Duration.
   * @param {Object} values - a mapping of units to numbers
   * @example dur.set({ years: 2017 })
   * @example dur.set({ hours: 8, minutes: 30 })
   * @return {Duration}
   */
  ;

  _proto.set = function set(values) {
    if (!this.isValid) return this;
    var mixed = Object.assign(this.values, normalizeObject(values, Duration.normalizeUnit, []));
    return clone(this, {
      values: mixed
    });
  }
  /**
   * "Set" the locale and/or numberingSystem.  Returns a newly-constructed Duration.
   * @example dur.reconfigure({ locale: 'en-GB' })
   * @return {Duration}
   */
  ;

  _proto.reconfigure = function reconfigure(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        locale = _ref.locale,
        numberingSystem = _ref.numberingSystem,
        conversionAccuracy = _ref.conversionAccuracy;

    var loc = this.loc.clone({
      locale: locale,
      numberingSystem: numberingSystem
    }),
        opts = {
      loc: loc
    };

    if (conversionAccuracy) {
      opts.conversionAccuracy = conversionAccuracy;
    }

    return clone(this, opts);
  }
  /**
   * Return the length of the duration in the specified unit.
   * @param {string} unit - a unit such as 'minutes' or 'days'
   * @example Duration.fromObject({years: 1}).as('days') //=> 365
   * @example Duration.fromObject({years: 1}).as('months') //=> 12
   * @example Duration.fromObject({hours: 60}).as('days') //=> 2.5
   * @return {number}
   */
  ;

  _proto.as = function as(unit) {
    return this.isValid ? this.shiftTo(unit).get(unit) : NaN;
  }
  /**
   * Reduce this Duration to its canonical representation in its current units.
   * @example Duration.fromObject({ years: 2, days: 5000 }).normalize().toObject() //=> { years: 15, days: 255 }
   * @example Duration.fromObject({ hours: 12, minutes: -45 }).normalize().toObject() //=> { hours: 11, minutes: 15 }
   * @return {Duration}
   */
  ;

  _proto.normalize = function normalize() {
    if (!this.isValid) return this;
    var vals = this.toObject();
    normalizeValues(this.matrix, vals);
    return clone(this, {
      values: vals
    }, true);
  }
  /**
   * Convert this Duration into its representation in a different set of units.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).shiftTo('minutes', 'milliseconds').toObject() //=> { minutes: 60, milliseconds: 30000 }
   * @return {Duration}
   */
  ;

  _proto.shiftTo = function shiftTo() {
    for (var _len = arguments.length, units = new Array(_len), _key = 0; _key < _len; _key++) {
      units[_key] = arguments[_key];
    }

    if (!this.isValid) return this;

    if (units.length === 0) {
      return this;
    }

    units = units.map(function (u) {
      return Duration.normalizeUnit(u);
    });
    var built = {},
        accumulated = {},
        vals = this.toObject();
    var lastUnit;

    for (var _iterator2 = _createForOfIteratorHelperLoose(orderedUnits), _step2; !(_step2 = _iterator2()).done;) {
      var k = _step2.value;

      if (units.indexOf(k) >= 0) {
        lastUnit = k;
        var own = 0; // anything we haven't boiled down yet should get boiled to this unit

        for (var ak in accumulated) {
          own += this.matrix[ak][k] * accumulated[ak];
          accumulated[ak] = 0;
        } // plus anything that's already in this unit


        if (isNumber(vals[k])) {
          own += vals[k];
        }

        var i = Math.trunc(own);
        built[k] = i;
        accumulated[k] = own - i; // we'd like to absorb these fractions in another unit
        // plus anything further down the chain that should be rolled up in to this

        for (var down in vals) {
          if (orderedUnits.indexOf(down) > orderedUnits.indexOf(k)) {
            convert(this.matrix, vals, down, built, k);
          }
        } // otherwise, keep it in the wings to boil it later

      } else if (isNumber(vals[k])) {
        accumulated[k] = vals[k];
      }
    } // anything leftover becomes the decimal for the last unit
    // lastUnit must be defined since units is not empty


    for (var key in accumulated) {
      if (accumulated[key] !== 0) {
        built[lastUnit] += key === lastUnit ? accumulated[key] : accumulated[key] / this.matrix[lastUnit][key];
      }
    }

    return clone(this, {
      values: built
    }, true).normalize();
  }
  /**
   * Return the negative of this Duration.
   * @example Duration.fromObject({ hours: 1, seconds: 30 }).negate().toObject() //=> { hours: -1, seconds: -30 }
   * @return {Duration}
   */
  ;

  _proto.negate = function negate() {
    if (!this.isValid) return this;
    var negated = {};

    for (var _i2 = 0, _Object$keys2 = Object.keys(this.values); _i2 < _Object$keys2.length; _i2++) {
      var k = _Object$keys2[_i2];
      negated[k] = -this.values[k];
    }

    return clone(this, {
      values: negated
    }, true);
  }
  /**
   * Get the years.
   * @type {number}
   */
  ;

  /**
   * Equality check
   * Two Durations are equal iff they have the same units and the same values for each unit.
   * @param {Duration} other
   * @return {boolean}
   */
  _proto.equals = function equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }

    if (!this.loc.equals(other.loc)) {
      return false;
    }

    function eq(v1, v2) {
      // Consider 0 and undefined as equal
      if (v1 === undefined || v1 === 0) return v2 === undefined || v2 === 0;
      return v1 === v2;
    }

    for (var _iterator3 = _createForOfIteratorHelperLoose(orderedUnits), _step3; !(_step3 = _iterator3()).done;) {
      var u = _step3.value;

      if (!eq(this.values[u], other.values[u])) {
        return false;
      }
    }

    return true;
  };

  _createClass(Duration, [{
    key: "locale",
    get: function get() {
      return this.isValid ? this.loc.locale : null;
    }
    /**
     * Get the numbering system of a Duration, such 'beng'. The numbering system is used when formatting the Duration
     *
     * @type {string}
     */

  }, {
    key: "numberingSystem",
    get: function get() {
      return this.isValid ? this.loc.numberingSystem : null;
    }
  }, {
    key: "years",
    get: function get() {
      return this.isValid ? this.values.years || 0 : NaN;
    }
    /**
     * Get the quarters.
     * @type {number}
     */

  }, {
    key: "quarters",
    get: function get() {
      return this.isValid ? this.values.quarters || 0 : NaN;
    }
    /**
     * Get the months.
     * @type {number}
     */

  }, {
    key: "months",
    get: function get() {
      return this.isValid ? this.values.months || 0 : NaN;
    }
    /**
     * Get the weeks
     * @type {number}
     */

  }, {
    key: "weeks",
    get: function get() {
      return this.isValid ? this.values.weeks || 0 : NaN;
    }
    /**
     * Get the days.
     * @type {number}
     */

  }, {
    key: "days",
    get: function get() {
      return this.isValid ? this.values.days || 0 : NaN;
    }
    /**
     * Get the hours.
     * @type {number}
     */

  }, {
    key: "hours",
    get: function get() {
      return this.isValid ? this.values.hours || 0 : NaN;
    }
    /**
     * Get the minutes.
     * @type {number}
     */

  }, {
    key: "minutes",
    get: function get() {
      return this.isValid ? this.values.minutes || 0 : NaN;
    }
    /**
     * Get the seconds.
     * @return {number}
     */

  }, {
    key: "seconds",
    get: function get() {
      return this.isValid ? this.values.seconds || 0 : NaN;
    }
    /**
     * Get the milliseconds.
     * @return {number}
     */

  }, {
    key: "milliseconds",
    get: function get() {
      return this.isValid ? this.values.milliseconds || 0 : NaN;
    }
    /**
     * Returns whether the Duration is invalid. Invalid durations are returned by diff operations
     * on invalid DateTimes or Intervals.
     * @return {boolean}
     */

  }, {
    key: "isValid",
    get: function get() {
      return this.invalid === null;
    }
    /**
     * Returns an error code if this Duration became invalid, or null if the Duration is valid
     * @return {string}
     */

  }, {
    key: "invalidReason",
    get: function get() {
      return this.invalid ? this.invalid.reason : null;
    }
    /**
     * Returns an explanation of why this Duration became invalid, or null if the Duration is valid
     * @type {string}
     */

  }, {
    key: "invalidExplanation",
    get: function get() {
      return this.invalid ? this.invalid.explanation : null;
    }
  }]);

  return Duration;
}();
function friendlyDuration(durationish) {
  if (isNumber(durationish)) {
    return Duration.fromMillis(durationish);
  } else if (Duration.isDuration(durationish)) {
    return durationish;
  } else if (typeof durationish === "object") {
    return Duration.fromObject(durationish);
  } else {
    throw new InvalidArgumentError("Unknown duration argument " + durationish + " of type " + typeof durationish);
  }
}

var INVALID$1 = "Invalid Interval"; // checks if the start is equal to or before the end

function validateStartEnd(start, end) {
  if (!start || !start.isValid) {
    return Interval.invalid("missing or invalid start");
  } else if (!end || !end.isValid) {
    return Interval.invalid("missing or invalid end");
  } else if (end < start) {
    return Interval.invalid("end before start", "The end of an interval must be after its start, but you had start=" + start.toISO() + " and end=" + end.toISO());
  } else {
    return null;
  }
}
/**
 * An Interval object represents a half-open interval of time, where each endpoint is a {@link DateTime}. Conceptually, it's a container for those two endpoints, accompanied by methods for creating, parsing, interrogating, comparing, transforming, and formatting them.
 *
 * Here is a brief overview of the most commonly used methods and getters in Interval:
 *
 * * **Creation** To create an Interval, use {@link fromDateTimes}, {@link after}, {@link before}, or {@link fromISO}.
 * * **Accessors** Use {@link start} and {@link end} to get the start and end.
 * * **Interrogation** To analyze the Interval, use {@link count}, {@link length}, {@link hasSame}, {@link contains}, {@link isAfter}, or {@link isBefore}.
 * * **Transformation** To create other Intervals out of this one, use {@link set}, {@link splitAt}, {@link splitBy}, {@link divideEqually}, {@link merge}, {@link xor}, {@link union}, {@link intersection}, or {@link difference}.
 * * **Comparison** To compare this Interval to another one, use {@link equals}, {@link overlaps}, {@link abutsStart}, {@link abutsEnd}, {@link engulfs}.
 * * **Output** To convert the Interval into other representations, see {@link toString}, {@link toISO}, {@link toISODate}, {@link toISOTime}, {@link toFormat}, and {@link toDuration}.
 */


var Interval = /*#__PURE__*/function () {
  /**
   * @private
   */
  function Interval(config) {
    /**
     * @access private
     */
    this.s = config.start;
    /**
     * @access private
     */

    this.e = config.end;
    /**
     * @access private
     */

    this.invalid = config.invalid || null;
    /**
     * @access private
     */

    this.isLuxonInterval = true;
  }
  /**
   * Create an invalid Interval.
   * @param {string} reason - simple string of why this Interval is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {Interval}
   */


  Interval.invalid = function invalid(reason, explanation) {
    if (explanation === void 0) {
      explanation = null;
    }

    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the Interval is invalid");
    }

    var invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);

    if (Settings.throwOnInvalid) {
      throw new InvalidIntervalError(invalid);
    } else {
      return new Interval({
        invalid: invalid
      });
    }
  }
  /**
   * Create an Interval from a start DateTime and an end DateTime. Inclusive of the start but not the end.
   * @param {DateTime|Date|Object} start
   * @param {DateTime|Date|Object} end
   * @return {Interval}
   */
  ;

  Interval.fromDateTimes = function fromDateTimes(start, end) {
    var builtStart = friendlyDateTime(start),
        builtEnd = friendlyDateTime(end);
    var validateError = validateStartEnd(builtStart, builtEnd);

    if (validateError == null) {
      return new Interval({
        start: builtStart,
        end: builtEnd
      });
    } else {
      return validateError;
    }
  }
  /**
   * Create an Interval from a start DateTime and a Duration to extend to.
   * @param {DateTime|Date|Object} start
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  ;

  Interval.after = function after(start, duration) {
    var dur = friendlyDuration(duration),
        dt = friendlyDateTime(start);
    return Interval.fromDateTimes(dt, dt.plus(dur));
  }
  /**
   * Create an Interval from an end DateTime and a Duration to extend backwards to.
   * @param {DateTime|Date|Object} end
   * @param {Duration|Object|number} duration - the length of the Interval.
   * @return {Interval}
   */
  ;

  Interval.before = function before(end, duration) {
    var dur = friendlyDuration(duration),
        dt = friendlyDateTime(end);
    return Interval.fromDateTimes(dt.minus(dur), dt);
  }
  /**
   * Create an Interval from an ISO 8601 string.
   * Accepts `<start>/<end>`, `<start>/<duration>`, and `<duration>/<end>` formats.
   * @param {string} text - the ISO string to parse
   * @param {Object} [opts] - options to pass {@link DateTime.fromISO} and optionally {@link Duration.fromISO}
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {Interval}
   */
  ;

  Interval.fromISO = function fromISO(text, opts) {
    var _split = (text || "").split("/", 2),
        s = _split[0],
        e = _split[1];

    if (s && e) {
      var start, startIsValid;

      try {
        start = DateTime.fromISO(s, opts);
        startIsValid = start.isValid;
      } catch (e) {
        startIsValid = false;
      }

      var end, endIsValid;

      try {
        end = DateTime.fromISO(e, opts);
        endIsValid = end.isValid;
      } catch (e) {
        endIsValid = false;
      }

      if (startIsValid && endIsValid) {
        return Interval.fromDateTimes(start, end);
      }

      if (startIsValid) {
        var dur = Duration.fromISO(e, opts);

        if (dur.isValid) {
          return Interval.after(start, dur);
        }
      } else if (endIsValid) {
        var _dur = Duration.fromISO(s, opts);

        if (_dur.isValid) {
          return Interval.before(end, _dur);
        }
      }
    }

    return Interval.invalid("unparsable", "the input \"" + text + "\" can't be parsed as ISO 8601");
  }
  /**
   * Check if an object is an Interval. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  ;

  Interval.isInterval = function isInterval(o) {
    return o && o.isLuxonInterval || false;
  }
  /**
   * Returns the start of the Interval
   * @type {DateTime}
   */
  ;

  var _proto = Interval.prototype;

  /**
   * Returns the length of the Interval in the specified unit.
   * @param {string} unit - the unit (such as 'hours' or 'days') to return the length in.
   * @return {number}
   */
  _proto.length = function length(unit) {
    if (unit === void 0) {
      unit = "milliseconds";
    }

    return this.isValid ? this.toDuration.apply(this, [unit]).get(unit) : NaN;
  }
  /**
   * Returns the count of minutes, hours, days, months, or years included in the Interval, even in part.
   * Unlike {@link length} this counts sections of the calendar, not periods of time, e.g. specifying 'day'
   * asks 'what dates are included in this interval?', not 'how many days long is this interval?'
   * @param {string} [unit='milliseconds'] - the unit of time to count.
   * @return {number}
   */
  ;

  _proto.count = function count(unit) {
    if (unit === void 0) {
      unit = "milliseconds";
    }

    if (!this.isValid) return NaN;
    var start = this.start.startOf(unit),
        end = this.end.startOf(unit);
    return Math.floor(end.diff(start, unit).get(unit)) + 1;
  }
  /**
   * Returns whether this Interval's start and end are both in the same unit of time
   * @param {string} unit - the unit of time to check sameness on
   * @return {boolean}
   */
  ;

  _proto.hasSame = function hasSame(unit) {
    return this.isValid ? this.isEmpty() || this.e.minus(1).hasSame(this.s, unit) : false;
  }
  /**
   * Return whether this Interval has the same start and end DateTimes.
   * @return {boolean}
   */
  ;

  _proto.isEmpty = function isEmpty() {
    return this.s.valueOf() === this.e.valueOf();
  }
  /**
   * Return whether this Interval's start is after the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  ;

  _proto.isAfter = function isAfter(dateTime) {
    if (!this.isValid) return false;
    return this.s > dateTime;
  }
  /**
   * Return whether this Interval's end is before the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  ;

  _proto.isBefore = function isBefore(dateTime) {
    if (!this.isValid) return false;
    return this.e <= dateTime;
  }
  /**
   * Return whether this Interval contains the specified DateTime.
   * @param {DateTime} dateTime
   * @return {boolean}
   */
  ;

  _proto.contains = function contains(dateTime) {
    if (!this.isValid) return false;
    return this.s <= dateTime && this.e > dateTime;
  }
  /**
   * "Sets" the start and/or end dates. Returns a newly-constructed Interval.
   * @param {Object} values - the values to set
   * @param {DateTime} values.start - the starting DateTime
   * @param {DateTime} values.end - the ending DateTime
   * @return {Interval}
   */
  ;

  _proto.set = function set(_temp) {
    var _ref = _temp === void 0 ? {} : _temp,
        start = _ref.start,
        end = _ref.end;

    if (!this.isValid) return this;
    return Interval.fromDateTimes(start || this.s, end || this.e);
  }
  /**
   * Split this Interval at each of the specified DateTimes
   * @param {...[DateTime]} dateTimes - the unit of time to count.
   * @return {[Interval]}
   */
  ;

  _proto.splitAt = function splitAt() {
    var _this = this;

    if (!this.isValid) return [];

    for (var _len = arguments.length, dateTimes = new Array(_len), _key = 0; _key < _len; _key++) {
      dateTimes[_key] = arguments[_key];
    }

    var sorted = dateTimes.map(friendlyDateTime).filter(function (d) {
      return _this.contains(d);
    }).sort(),
        results = [];
    var s = this.s,
        i = 0;

    while (s < this.e) {
      var added = sorted[i] || this.e,
          next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s, next));
      s = next;
      i += 1;
    }

    return results;
  }
  /**
   * Split this Interval into smaller Intervals, each of the specified length.
   * Left over time is grouped into a smaller interval
   * @param {Duration|Object|number} duration - The length of each resulting interval.
   * @return {[Interval]}
   */
  ;

  _proto.splitBy = function splitBy(duration) {
    var dur = friendlyDuration(duration);

    if (!this.isValid || !dur.isValid || dur.as("milliseconds") === 0) {
      return [];
    }

    var s = this.s,
        added,
        next;
    var results = [];

    while (s < this.e) {
      added = s.plus(dur);
      next = +added > +this.e ? this.e : added;
      results.push(Interval.fromDateTimes(s, next));
      s = next;
    }

    return results;
  }
  /**
   * Split this Interval into the specified number of smaller intervals.
   * @param {number} numberOfParts - The number of Intervals to divide the Interval into.
   * @return {[Interval]}
   */
  ;

  _proto.divideEqually = function divideEqually(numberOfParts) {
    if (!this.isValid) return [];
    return this.splitBy(this.length() / numberOfParts).slice(0, numberOfParts);
  }
  /**
   * Return whether this Interval overlaps with the specified Interval
   * @param {Interval} other
   * @return {boolean}
   */
  ;

  _proto.overlaps = function overlaps(other) {
    return this.e > other.s && this.s < other.e;
  }
  /**
   * Return whether this Interval's end is adjacent to the specified Interval's start.
   * @param {Interval} other
   * @return {boolean}
   */
  ;

  _proto.abutsStart = function abutsStart(other) {
    if (!this.isValid) return false;
    return +this.e === +other.s;
  }
  /**
   * Return whether this Interval's start is adjacent to the specified Interval's end.
   * @param {Interval} other
   * @return {boolean}
   */
  ;

  _proto.abutsEnd = function abutsEnd(other) {
    if (!this.isValid) return false;
    return +other.e === +this.s;
  }
  /**
   * Return whether this Interval engulfs the start and end of the specified Interval.
   * @param {Interval} other
   * @return {boolean}
   */
  ;

  _proto.engulfs = function engulfs(other) {
    if (!this.isValid) return false;
    return this.s <= other.s && this.e >= other.e;
  }
  /**
   * Return whether this Interval has the same start and end as the specified Interval.
   * @param {Interval} other
   * @return {boolean}
   */
  ;

  _proto.equals = function equals(other) {
    if (!this.isValid || !other.isValid) {
      return false;
    }

    return this.s.equals(other.s) && this.e.equals(other.e);
  }
  /**
   * Return an Interval representing the intersection of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the maximum start time and the minimum end time of the two Intervals.
   * Returns null if the intersection is empty, meaning, the intervals don't intersect.
   * @param {Interval} other
   * @return {Interval}
   */
  ;

  _proto.intersection = function intersection(other) {
    if (!this.isValid) return this;
    var s = this.s > other.s ? this.s : other.s,
        e = this.e < other.e ? this.e : other.e;

    if (s > e) {
      return null;
    } else {
      return Interval.fromDateTimes(s, e);
    }
  }
  /**
   * Return an Interval representing the union of this Interval and the specified Interval.
   * Specifically, the resulting Interval has the minimum start time and the maximum end time of the two Intervals.
   * @param {Interval} other
   * @return {Interval}
   */
  ;

  _proto.union = function union(other) {
    if (!this.isValid) return this;
    var s = this.s < other.s ? this.s : other.s,
        e = this.e > other.e ? this.e : other.e;
    return Interval.fromDateTimes(s, e);
  }
  /**
   * Merge an array of Intervals into a equivalent minimal set of Intervals.
   * Combines overlapping and adjacent Intervals.
   * @param {[Interval]} intervals
   * @return {[Interval]}
   */
  ;

  Interval.merge = function merge(intervals) {
    var _intervals$sort$reduc = intervals.sort(function (a, b) {
      return a.s - b.s;
    }).reduce(function (_ref2, item) {
      var sofar = _ref2[0],
          current = _ref2[1];

      if (!current) {
        return [sofar, item];
      } else if (current.overlaps(item) || current.abutsStart(item)) {
        return [sofar, current.union(item)];
      } else {
        return [sofar.concat([current]), item];
      }
    }, [[], null]),
        found = _intervals$sort$reduc[0],
        final = _intervals$sort$reduc[1];

    if (final) {
      found.push(final);
    }

    return found;
  }
  /**
   * Return an array of Intervals representing the spans of time that only appear in one of the specified Intervals.
   * @param {[Interval]} intervals
   * @return {[Interval]}
   */
  ;

  Interval.xor = function xor(intervals) {
    var _Array$prototype;

    var start = null,
        currentCount = 0;

    var results = [],
        ends = intervals.map(function (i) {
      return [{
        time: i.s,
        type: "s"
      }, {
        time: i.e,
        type: "e"
      }];
    }),
        flattened = (_Array$prototype = Array.prototype).concat.apply(_Array$prototype, ends),
        arr = flattened.sort(function (a, b) {
      return a.time - b.time;
    });

    for (var _iterator = _createForOfIteratorHelperLoose(arr), _step; !(_step = _iterator()).done;) {
      var i = _step.value;
      currentCount += i.type === "s" ? 1 : -1;

      if (currentCount === 1) {
        start = i.time;
      } else {
        if (start && +start !== +i.time) {
          results.push(Interval.fromDateTimes(start, i.time));
        }

        start = null;
      }
    }

    return Interval.merge(results);
  }
  /**
   * Return an Interval representing the span of time in this Interval that doesn't overlap with any of the specified Intervals.
   * @param {...Interval} intervals
   * @return {[Interval]}
   */
  ;

  _proto.difference = function difference() {
    var _this2 = this;

    for (var _len2 = arguments.length, intervals = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      intervals[_key2] = arguments[_key2];
    }

    return Interval.xor([this].concat(intervals)).map(function (i) {
      return _this2.intersection(i);
    }).filter(function (i) {
      return i && !i.isEmpty();
    });
  }
  /**
   * Returns a string representation of this Interval appropriate for debugging.
   * @return {string}
   */
  ;

  _proto.toString = function toString() {
    if (!this.isValid) return INVALID$1;
    return "[" + this.s.toISO() + " \u2013 " + this.e.toISO() + ")";
  }
  /**
   * Returns an ISO 8601-compliant string representation of this Interval.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime.toISO}
   * @return {string}
   */
  ;

  _proto.toISO = function toISO(opts) {
    if (!this.isValid) return INVALID$1;
    return this.s.toISO(opts) + "/" + this.e.toISO(opts);
  }
  /**
   * Returns an ISO 8601-compliant string representation of date of this Interval.
   * The time components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @return {string}
   */
  ;

  _proto.toISODate = function toISODate() {
    if (!this.isValid) return INVALID$1;
    return this.s.toISODate() + "/" + this.e.toISODate();
  }
  /**
   * Returns an ISO 8601-compliant string representation of time of this Interval.
   * The date components are ignored.
   * @see https://en.wikipedia.org/wiki/ISO_8601#Time_intervals
   * @param {Object} opts - The same options as {@link DateTime.toISO}
   * @return {string}
   */
  ;

  _proto.toISOTime = function toISOTime(opts) {
    if (!this.isValid) return INVALID$1;
    return this.s.toISOTime(opts) + "/" + this.e.toISOTime(opts);
  }
  /**
   * Returns a string representation of this Interval formatted according to the specified format string.
   * @param {string} dateFormat - the format string. This string formats the start and end time. See {@link DateTime.toFormat} for details.
   * @param {Object} opts - options
   * @param {string} [opts.separator =  ' – '] - a separator to place between the start and end representations
   * @return {string}
   */
  ;

  _proto.toFormat = function toFormat(dateFormat, _temp2) {
    var _ref3 = _temp2 === void 0 ? {} : _temp2,
        _ref3$separator = _ref3.separator,
        separator = _ref3$separator === void 0 ? " – " : _ref3$separator;

    if (!this.isValid) return INVALID$1;
    return "" + this.s.toFormat(dateFormat) + separator + this.e.toFormat(dateFormat);
  }
  /**
   * Return a Duration representing the time spanned by this interval.
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example Interval.fromDateTimes(dt1, dt2).toDuration().toObject() //=> { milliseconds: 88489257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('days').toObject() //=> { days: 1.0241812152777778 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes']).toObject() //=> { hours: 24, minutes: 34.82095 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration(['hours', 'minutes', 'seconds']).toObject() //=> { hours: 24, minutes: 34, seconds: 49.257 }
   * @example Interval.fromDateTimes(dt1, dt2).toDuration('seconds').toObject() //=> { seconds: 88489.257 }
   * @return {Duration}
   */
  ;

  _proto.toDuration = function toDuration(unit, opts) {
    if (!this.isValid) {
      return Duration.invalid(this.invalidReason);
    }

    return this.e.diff(this.s, unit, opts);
  }
  /**
   * Run mapFn on the interval start and end, returning a new Interval from the resulting DateTimes
   * @param {function} mapFn
   * @return {Interval}
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.toUTC())
   * @example Interval.fromDateTimes(dt1, dt2).mapEndpoints(endpoint => endpoint.plus({ hours: 2 }))
   */
  ;

  _proto.mapEndpoints = function mapEndpoints(mapFn) {
    return Interval.fromDateTimes(mapFn(this.s), mapFn(this.e));
  };

  _createClass(Interval, [{
    key: "start",
    get: function get() {
      return this.isValid ? this.s : null;
    }
    /**
     * Returns the end of the Interval
     * @type {DateTime}
     */

  }, {
    key: "end",
    get: function get() {
      return this.isValid ? this.e : null;
    }
    /**
     * Returns whether this Interval's end is at least its start, meaning that the Interval isn't 'backwards'.
     * @type {boolean}
     */

  }, {
    key: "isValid",
    get: function get() {
      return this.invalidReason === null;
    }
    /**
     * Returns an error code if this Interval is invalid, or null if the Interval is valid
     * @type {string}
     */

  }, {
    key: "invalidReason",
    get: function get() {
      return this.invalid ? this.invalid.reason : null;
    }
    /**
     * Returns an explanation of why this Interval became invalid, or null if the Interval is valid
     * @type {string}
     */

  }, {
    key: "invalidExplanation",
    get: function get() {
      return this.invalid ? this.invalid.explanation : null;
    }
  }]);

  return Interval;
}();

/**
 * The Info class contains static methods for retrieving general time and date related data. For example, it has methods for finding out if a time zone has a DST, for listing the months in any supported locale, and for discovering which of Luxon features are available in the current environment.
 */

var Info = /*#__PURE__*/function () {
  function Info() {}

  /**
   * Return whether the specified zone contains a DST.
   * @param {string|Zone} [zone='local'] - Zone to check. Defaults to the environment's local zone.
   * @return {boolean}
   */
  Info.hasDST = function hasDST(zone) {
    if (zone === void 0) {
      zone = Settings.defaultZone;
    }

    var proto = DateTime.now().setZone(zone).set({
      month: 12
    });
    return !zone.universal && proto.offset !== proto.set({
      month: 6
    }).offset;
  }
  /**
   * Return whether the specified zone is a valid IANA specifier.
   * @param {string} zone - Zone to check
   * @return {boolean}
   */
  ;

  Info.isValidIANAZone = function isValidIANAZone(zone) {
    return IANAZone.isValidSpecifier(zone) && IANAZone.isValidZone(zone);
  }
  /**
   * Converts the input into a {@link Zone} instance.
   *
   * * If `input` is already a Zone instance, it is returned unchanged.
   * * If `input` is a string containing a valid time zone name, a Zone instance
   *   with that name is returned.
   * * If `input` is a string that doesn't refer to a known time zone, a Zone
   *   instance with {@link Zone.isValid} == false is returned.
   * * If `input is a number, a Zone instance with the specified fixed offset
   *   in minutes is returned.
   * * If `input` is `null` or `undefined`, the default zone is returned.
   * @param {string|Zone|number} [input] - the value to be converted
   * @return {Zone}
   */
  ;

  Info.normalizeZone = function normalizeZone$1(input) {
    return normalizeZone(input, Settings.defaultZone);
  }
  /**
   * Return an array of standalone month names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @example Info.months()[0] //=> 'January'
   * @example Info.months('short')[0] //=> 'Jan'
   * @example Info.months('numeric')[0] //=> '1'
   * @example Info.months('short', { locale: 'fr-CA' } )[0] //=> 'janv.'
   * @example Info.months('numeric', { locale: 'ar' })[0] //=> '١'
   * @example Info.months('long', { outputCalendar: 'islamic' })[0] //=> 'Rabiʻ I'
   * @return {[string]}
   */
  ;

  Info.months = function months(length, _temp) {
    if (length === void 0) {
      length = "long";
    }

    var _ref = _temp === void 0 ? {} : _temp,
        _ref$locale = _ref.locale,
        locale = _ref$locale === void 0 ? null : _ref$locale,
        _ref$numberingSystem = _ref.numberingSystem,
        numberingSystem = _ref$numberingSystem === void 0 ? null : _ref$numberingSystem,
        _ref$outputCalendar = _ref.outputCalendar,
        outputCalendar = _ref$outputCalendar === void 0 ? "gregory" : _ref$outputCalendar;

    return Locale.create(locale, numberingSystem, outputCalendar).months(length);
  }
  /**
   * Return an array of format month names.
   * Format months differ from standalone months in that they're meant to appear next to the day of the month. In some languages, that
   * changes the string.
   * See {@link months}
   * @param {string} [length='long'] - the length of the month representation, such as "numeric", "2-digit", "narrow", "short", "long"
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @param {string} [opts.outputCalendar='gregory'] - the calendar
   * @return {[string]}
   */
  ;

  Info.monthsFormat = function monthsFormat(length, _temp2) {
    if (length === void 0) {
      length = "long";
    }

    var _ref2 = _temp2 === void 0 ? {} : _temp2,
        _ref2$locale = _ref2.locale,
        locale = _ref2$locale === void 0 ? null : _ref2$locale,
        _ref2$numberingSystem = _ref2.numberingSystem,
        numberingSystem = _ref2$numberingSystem === void 0 ? null : _ref2$numberingSystem,
        _ref2$outputCalendar = _ref2.outputCalendar,
        outputCalendar = _ref2$outputCalendar === void 0 ? "gregory" : _ref2$outputCalendar;

    return Locale.create(locale, numberingSystem, outputCalendar).months(length, true);
  }
  /**
   * Return an array of standalone week names.
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param {string} [length='long'] - the length of the weekday representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @example Info.weekdays()[0] //=> 'Monday'
   * @example Info.weekdays('short')[0] //=> 'Mon'
   * @example Info.weekdays('short', { locale: 'fr-CA' })[0] //=> 'lun.'
   * @example Info.weekdays('short', { locale: 'ar' })[0] //=> 'الاثنين'
   * @return {[string]}
   */
  ;

  Info.weekdays = function weekdays(length, _temp3) {
    if (length === void 0) {
      length = "long";
    }

    var _ref3 = _temp3 === void 0 ? {} : _temp3,
        _ref3$locale = _ref3.locale,
        locale = _ref3$locale === void 0 ? null : _ref3$locale,
        _ref3$numberingSystem = _ref3.numberingSystem,
        numberingSystem = _ref3$numberingSystem === void 0 ? null : _ref3$numberingSystem;

    return Locale.create(locale, numberingSystem, null).weekdays(length);
  }
  /**
   * Return an array of format week names.
   * Format weekdays differ from standalone weekdays in that they're meant to appear next to more date information. In some languages, that
   * changes the string.
   * See {@link weekdays}
   * @param {string} [length='long'] - the length of the weekday representation, such as "narrow", "short", "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale=null] - the locale code
   * @param {string} [opts.numberingSystem=null] - the numbering system
   * @return {[string]}
   */
  ;

  Info.weekdaysFormat = function weekdaysFormat(length, _temp4) {
    if (length === void 0) {
      length = "long";
    }

    var _ref4 = _temp4 === void 0 ? {} : _temp4,
        _ref4$locale = _ref4.locale,
        locale = _ref4$locale === void 0 ? null : _ref4$locale,
        _ref4$numberingSystem = _ref4.numberingSystem,
        numberingSystem = _ref4$numberingSystem === void 0 ? null : _ref4$numberingSystem;

    return Locale.create(locale, numberingSystem, null).weekdays(length, true);
  }
  /**
   * Return an array of meridiems.
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.meridiems() //=> [ 'AM', 'PM' ]
   * @example Info.meridiems({ locale: 'my' }) //=> [ 'နံနက်', 'ညနေ' ]
   * @return {[string]}
   */
  ;

  Info.meridiems = function meridiems(_temp5) {
    var _ref5 = _temp5 === void 0 ? {} : _temp5,
        _ref5$locale = _ref5.locale,
        locale = _ref5$locale === void 0 ? null : _ref5$locale;

    return Locale.create(locale).meridiems();
  }
  /**
   * Return an array of eras, such as ['BC', 'AD']. The locale can be specified, but the calendar system is always Gregorian.
   * @param {string} [length='short'] - the length of the era representation, such as "short" or "long".
   * @param {Object} opts - options
   * @param {string} [opts.locale] - the locale code
   * @example Info.eras() //=> [ 'BC', 'AD' ]
   * @example Info.eras('long') //=> [ 'Before Christ', 'Anno Domini' ]
   * @example Info.eras('long', { locale: 'fr' }) //=> [ 'avant Jésus-Christ', 'après Jésus-Christ' ]
   * @return {[string]}
   */
  ;

  Info.eras = function eras(length, _temp6) {
    if (length === void 0) {
      length = "short";
    }

    var _ref6 = _temp6 === void 0 ? {} : _temp6,
        _ref6$locale = _ref6.locale,
        locale = _ref6$locale === void 0 ? null : _ref6$locale;

    return Locale.create(locale, null, "gregory").eras(length);
  }
  /**
   * Return the set of available features in this environment.
   * Some features of Luxon are not available in all environments. For example, on older browsers, timezone support is not available. Use this function to figure out if that's the case.
   * Keys:
   * * `zones`: whether this environment supports IANA timezones
   * * `intlTokens`: whether this environment supports internationalized token-based formatting/parsing
   * * `intl`: whether this environment supports general internationalization
   * * `relative`: whether this environment supports relative time formatting
   * @example Info.features() //=> { intl: true, intlTokens: false, zones: true, relative: false }
   * @return {Object}
   */
  ;

  Info.features = function features() {
    var intl = false,
        intlTokens = false,
        zones = false,
        relative = false;

    if (hasIntl()) {
      intl = true;
      intlTokens = hasFormatToParts();
      relative = hasRelative();

      try {
        zones = new Intl.DateTimeFormat("en", {
          timeZone: "America/New_York"
        }).resolvedOptions().timeZone === "America/New_York";
      } catch (e) {
        zones = false;
      }
    }

    return {
      intl: intl,
      intlTokens: intlTokens,
      zones: zones,
      relative: relative
    };
  };

  return Info;
}();

function dayDiff(earlier, later) {
  var utcDayStart = function utcDayStart(dt) {
    return dt.toUTC(0, {
      keepLocalTime: true
    }).startOf("day").valueOf();
  },
      ms = utcDayStart(later) - utcDayStart(earlier);

  return Math.floor(Duration.fromMillis(ms).as("days"));
}

function highOrderDiffs(cursor, later, units) {
  var differs = [["years", function (a, b) {
    return b.year - a.year;
  }], ["quarters", function (a, b) {
    return b.quarter - a.quarter;
  }], ["months", function (a, b) {
    return b.month - a.month + (b.year - a.year) * 12;
  }], ["weeks", function (a, b) {
    var days = dayDiff(a, b);
    return (days - days % 7) / 7;
  }], ["days", dayDiff]];
  var results = {};
  var lowestOrder, highWater;

  for (var _i = 0, _differs = differs; _i < _differs.length; _i++) {
    var _differs$_i = _differs[_i],
        unit = _differs$_i[0],
        differ = _differs$_i[1];

    if (units.indexOf(unit) >= 0) {
      var _cursor$plus;

      lowestOrder = unit;
      var delta = differ(cursor, later);
      highWater = cursor.plus((_cursor$plus = {}, _cursor$plus[unit] = delta, _cursor$plus));

      if (highWater > later) {
        var _cursor$plus2;

        cursor = cursor.plus((_cursor$plus2 = {}, _cursor$plus2[unit] = delta - 1, _cursor$plus2));
        delta -= 1;
      } else {
        cursor = highWater;
      }

      results[unit] = delta;
    }
  }

  return [cursor, results, highWater, lowestOrder];
}

function _diff (earlier, later, units, opts) {
  var _highOrderDiffs = highOrderDiffs(earlier, later, units),
      cursor = _highOrderDiffs[0],
      results = _highOrderDiffs[1],
      highWater = _highOrderDiffs[2],
      lowestOrder = _highOrderDiffs[3];

  var remainingMillis = later - cursor;
  var lowerOrderUnits = units.filter(function (u) {
    return ["hours", "minutes", "seconds", "milliseconds"].indexOf(u) >= 0;
  });

  if (lowerOrderUnits.length === 0) {
    if (highWater < later) {
      var _cursor$plus3;

      highWater = cursor.plus((_cursor$plus3 = {}, _cursor$plus3[lowestOrder] = 1, _cursor$plus3));
    }

    if (highWater !== cursor) {
      results[lowestOrder] = (results[lowestOrder] || 0) + remainingMillis / (highWater - cursor);
    }
  }

  var duration = Duration.fromObject(Object.assign(results, opts));

  if (lowerOrderUnits.length > 0) {
    var _Duration$fromMillis;

    return (_Duration$fromMillis = Duration.fromMillis(remainingMillis, opts)).shiftTo.apply(_Duration$fromMillis, lowerOrderUnits).plus(duration);
  } else {
    return duration;
  }
}

var numberingSystems = {
  arab: "[\u0660-\u0669]",
  arabext: "[\u06F0-\u06F9]",
  bali: "[\u1B50-\u1B59]",
  beng: "[\u09E6-\u09EF]",
  deva: "[\u0966-\u096F]",
  fullwide: "[\uFF10-\uFF19]",
  gujr: "[\u0AE6-\u0AEF]",
  hanidec: "[〇|一|二|三|四|五|六|七|八|九]",
  khmr: "[\u17E0-\u17E9]",
  knda: "[\u0CE6-\u0CEF]",
  laoo: "[\u0ED0-\u0ED9]",
  limb: "[\u1946-\u194F]",
  mlym: "[\u0D66-\u0D6F]",
  mong: "[\u1810-\u1819]",
  mymr: "[\u1040-\u1049]",
  orya: "[\u0B66-\u0B6F]",
  tamldec: "[\u0BE6-\u0BEF]",
  telu: "[\u0C66-\u0C6F]",
  thai: "[\u0E50-\u0E59]",
  tibt: "[\u0F20-\u0F29]",
  latn: "\\d"
};
var numberingSystemsUTF16 = {
  arab: [1632, 1641],
  arabext: [1776, 1785],
  bali: [6992, 7001],
  beng: [2534, 2543],
  deva: [2406, 2415],
  fullwide: [65296, 65303],
  gujr: [2790, 2799],
  khmr: [6112, 6121],
  knda: [3302, 3311],
  laoo: [3792, 3801],
  limb: [6470, 6479],
  mlym: [3430, 3439],
  mong: [6160, 6169],
  mymr: [4160, 4169],
  orya: [2918, 2927],
  tamldec: [3046, 3055],
  telu: [3174, 3183],
  thai: [3664, 3673],
  tibt: [3872, 3881]
}; // eslint-disable-next-line

var hanidecChars = numberingSystems.hanidec.replace(/[\[|\]]/g, "").split("");
function parseDigits(str) {
  var value = parseInt(str, 10);

  if (isNaN(value)) {
    value = "";

    for (var i = 0; i < str.length; i++) {
      var code = str.charCodeAt(i);

      if (str[i].search(numberingSystems.hanidec) !== -1) {
        value += hanidecChars.indexOf(str[i]);
      } else {
        for (var key in numberingSystemsUTF16) {
          var _numberingSystemsUTF = numberingSystemsUTF16[key],
              min = _numberingSystemsUTF[0],
              max = _numberingSystemsUTF[1];

          if (code >= min && code <= max) {
            value += code - min;
          }
        }
      }
    }

    return parseInt(value, 10);
  } else {
    return value;
  }
}
function digitRegex(_ref, append) {
  var numberingSystem = _ref.numberingSystem;

  if (append === void 0) {
    append = "";
  }

  return new RegExp("" + numberingSystems[numberingSystem || "latn"] + append);
}

var MISSING_FTP = "missing Intl.DateTimeFormat.formatToParts support";

function intUnit(regex, post) {
  if (post === void 0) {
    post = function post(i) {
      return i;
    };
  }

  return {
    regex: regex,
    deser: function deser(_ref) {
      var s = _ref[0];
      return post(parseDigits(s));
    }
  };
}

var NBSP = String.fromCharCode(160);
var spaceOrNBSP = "( |" + NBSP + ")";
var spaceOrNBSPRegExp = new RegExp(spaceOrNBSP, "g");

function fixListRegex(s) {
  // make dots optional and also make them literal
  // make space and non breakable space characters interchangeable
  return s.replace(/\./g, "\\.?").replace(spaceOrNBSPRegExp, spaceOrNBSP);
}

function stripInsensitivities(s) {
  return s.replace(/\./g, "") // ignore dots that were made optional
  .replace(spaceOrNBSPRegExp, " ") // interchange space and nbsp
  .toLowerCase();
}

function oneOf(strings, startIndex) {
  if (strings === null) {
    return null;
  } else {
    return {
      regex: RegExp(strings.map(fixListRegex).join("|")),
      deser: function deser(_ref2) {
        var s = _ref2[0];
        return strings.findIndex(function (i) {
          return stripInsensitivities(s) === stripInsensitivities(i);
        }) + startIndex;
      }
    };
  }
}

function offset(regex, groups) {
  return {
    regex: regex,
    deser: function deser(_ref3) {
      var h = _ref3[1],
          m = _ref3[2];
      return signedOffset(h, m);
    },
    groups: groups
  };
}

function simple(regex) {
  return {
    regex: regex,
    deser: function deser(_ref4) {
      var s = _ref4[0];
      return s;
    }
  };
}

function escapeToken(value) {
  // eslint-disable-next-line no-useless-escape
  return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
}

function unitForToken(token, loc) {
  var one = digitRegex(loc),
      two = digitRegex(loc, "{2}"),
      three = digitRegex(loc, "{3}"),
      four = digitRegex(loc, "{4}"),
      six = digitRegex(loc, "{6}"),
      oneOrTwo = digitRegex(loc, "{1,2}"),
      oneToThree = digitRegex(loc, "{1,3}"),
      oneToSix = digitRegex(loc, "{1,6}"),
      oneToNine = digitRegex(loc, "{1,9}"),
      twoToFour = digitRegex(loc, "{2,4}"),
      fourToSix = digitRegex(loc, "{4,6}"),
      literal = function literal(t) {
    return {
      regex: RegExp(escapeToken(t.val)),
      deser: function deser(_ref5) {
        var s = _ref5[0];
        return s;
      },
      literal: true
    };
  },
      unitate = function unitate(t) {
    if (token.literal) {
      return literal(t);
    }

    switch (t.val) {
      // era
      case "G":
        return oneOf(loc.eras("short", false), 0);

      case "GG":
        return oneOf(loc.eras("long", false), 0);
      // years

      case "y":
        return intUnit(oneToSix);

      case "yy":
        return intUnit(twoToFour, untruncateYear);

      case "yyyy":
        return intUnit(four);

      case "yyyyy":
        return intUnit(fourToSix);

      case "yyyyyy":
        return intUnit(six);
      // months

      case "M":
        return intUnit(oneOrTwo);

      case "MM":
        return intUnit(two);

      case "MMM":
        return oneOf(loc.months("short", true, false), 1);

      case "MMMM":
        return oneOf(loc.months("long", true, false), 1);

      case "L":
        return intUnit(oneOrTwo);

      case "LL":
        return intUnit(two);

      case "LLL":
        return oneOf(loc.months("short", false, false), 1);

      case "LLLL":
        return oneOf(loc.months("long", false, false), 1);
      // dates

      case "d":
        return intUnit(oneOrTwo);

      case "dd":
        return intUnit(two);
      // ordinals

      case "o":
        return intUnit(oneToThree);

      case "ooo":
        return intUnit(three);
      // time

      case "HH":
        return intUnit(two);

      case "H":
        return intUnit(oneOrTwo);

      case "hh":
        return intUnit(two);

      case "h":
        return intUnit(oneOrTwo);

      case "mm":
        return intUnit(two);

      case "m":
        return intUnit(oneOrTwo);

      case "q":
        return intUnit(oneOrTwo);

      case "qq":
        return intUnit(two);

      case "s":
        return intUnit(oneOrTwo);

      case "ss":
        return intUnit(two);

      case "S":
        return intUnit(oneToThree);

      case "SSS":
        return intUnit(three);

      case "u":
        return simple(oneToNine);
      // meridiem

      case "a":
        return oneOf(loc.meridiems(), 0);
      // weekYear (k)

      case "kkkk":
        return intUnit(four);

      case "kk":
        return intUnit(twoToFour, untruncateYear);
      // weekNumber (W)

      case "W":
        return intUnit(oneOrTwo);

      case "WW":
        return intUnit(two);
      // weekdays

      case "E":
      case "c":
        return intUnit(one);

      case "EEE":
        return oneOf(loc.weekdays("short", false, false), 1);

      case "EEEE":
        return oneOf(loc.weekdays("long", false, false), 1);

      case "ccc":
        return oneOf(loc.weekdays("short", true, false), 1);

      case "cccc":
        return oneOf(loc.weekdays("long", true, false), 1);
      // offset/zone

      case "Z":
      case "ZZ":
        return offset(new RegExp("([+-]" + oneOrTwo.source + ")(?::(" + two.source + "))?"), 2);

      case "ZZZ":
        return offset(new RegExp("([+-]" + oneOrTwo.source + ")(" + two.source + ")?"), 2);
      // we don't support ZZZZ (PST) or ZZZZZ (Pacific Standard Time) in parsing
      // because we don't have any way to figure out what they are

      case "z":
        return simple(/[a-z_+-/]{1,256}?/i);

      default:
        return literal(t);
    }
  };

  var unit = unitate(token) || {
    invalidReason: MISSING_FTP
  };
  unit.token = token;
  return unit;
}

var partTypeStyleToTokenVal = {
  year: {
    "2-digit": "yy",
    numeric: "yyyyy"
  },
  month: {
    numeric: "M",
    "2-digit": "MM",
    short: "MMM",
    long: "MMMM"
  },
  day: {
    numeric: "d",
    "2-digit": "dd"
  },
  weekday: {
    short: "EEE",
    long: "EEEE"
  },
  dayperiod: "a",
  dayPeriod: "a",
  hour: {
    numeric: "h",
    "2-digit": "hh"
  },
  minute: {
    numeric: "m",
    "2-digit": "mm"
  },
  second: {
    numeric: "s",
    "2-digit": "ss"
  }
};

function tokenForPart(part, locale, formatOpts) {
  var type = part.type,
      value = part.value;

  if (type === "literal") {
    return {
      literal: true,
      val: value
    };
  }

  var style = formatOpts[type];
  var val = partTypeStyleToTokenVal[type];

  if (typeof val === "object") {
    val = val[style];
  }

  if (val) {
    return {
      literal: false,
      val: val
    };
  }

  return undefined;
}

function buildRegex(units) {
  var re = units.map(function (u) {
    return u.regex;
  }).reduce(function (f, r) {
    return f + "(" + r.source + ")";
  }, "");
  return ["^" + re + "$", units];
}

function match(input, regex, handlers) {
  var matches = input.match(regex);

  if (matches) {
    var all = {};
    var matchIndex = 1;

    for (var i in handlers) {
      if (hasOwnProperty(handlers, i)) {
        var h = handlers[i],
            groups = h.groups ? h.groups + 1 : 1;

        if (!h.literal && h.token) {
          all[h.token.val[0]] = h.deser(matches.slice(matchIndex, matchIndex + groups));
        }

        matchIndex += groups;
      }
    }

    return [matches, all];
  } else {
    return [matches, {}];
  }
}

function dateTimeFromMatches(matches) {
  var toField = function toField(token) {
    switch (token) {
      case "S":
        return "millisecond";

      case "s":
        return "second";

      case "m":
        return "minute";

      case "h":
      case "H":
        return "hour";

      case "d":
        return "day";

      case "o":
        return "ordinal";

      case "L":
      case "M":
        return "month";

      case "y":
        return "year";

      case "E":
      case "c":
        return "weekday";

      case "W":
        return "weekNumber";

      case "k":
        return "weekYear";

      case "q":
        return "quarter";

      default:
        return null;
    }
  };

  var zone;

  if (!isUndefined(matches.Z)) {
    zone = new FixedOffsetZone(matches.Z);
  } else if (!isUndefined(matches.z)) {
    zone = IANAZone.create(matches.z);
  } else {
    zone = null;
  }

  if (!isUndefined(matches.q)) {
    matches.M = (matches.q - 1) * 3 + 1;
  }

  if (!isUndefined(matches.h)) {
    if (matches.h < 12 && matches.a === 1) {
      matches.h += 12;
    } else if (matches.h === 12 && matches.a === 0) {
      matches.h = 0;
    }
  }

  if (matches.G === 0 && matches.y) {
    matches.y = -matches.y;
  }

  if (!isUndefined(matches.u)) {
    matches.S = parseMillis(matches.u);
  }

  var vals = Object.keys(matches).reduce(function (r, k) {
    var f = toField(k);

    if (f) {
      r[f] = matches[k];
    }

    return r;
  }, {});
  return [vals, zone];
}

var dummyDateTimeCache = null;

function getDummyDateTime() {
  if (!dummyDateTimeCache) {
    dummyDateTimeCache = DateTime.fromMillis(1555555555555);
  }

  return dummyDateTimeCache;
}

function maybeExpandMacroToken(token, locale) {
  if (token.literal) {
    return token;
  }

  var formatOpts = Formatter.macroTokenToFormatOpts(token.val);

  if (!formatOpts) {
    return token;
  }

  var formatter = Formatter.create(locale, formatOpts);
  var parts = formatter.formatDateTimeParts(getDummyDateTime());
  var tokens = parts.map(function (p) {
    return tokenForPart(p, locale, formatOpts);
  });

  if (tokens.includes(undefined)) {
    return token;
  }

  return tokens;
}

function expandMacroTokens(tokens, locale) {
  var _Array$prototype;

  return (_Array$prototype = Array.prototype).concat.apply(_Array$prototype, tokens.map(function (t) {
    return maybeExpandMacroToken(t, locale);
  }));
}
/**
 * @private
 */


function explainFromTokens(locale, input, format) {
  var tokens = expandMacroTokens(Formatter.parseFormat(format), locale),
      units = tokens.map(function (t) {
    return unitForToken(t, locale);
  }),
      disqualifyingUnit = units.find(function (t) {
    return t.invalidReason;
  });

  if (disqualifyingUnit) {
    return {
      input: input,
      tokens: tokens,
      invalidReason: disqualifyingUnit.invalidReason
    };
  } else {
    var _buildRegex = buildRegex(units),
        regexString = _buildRegex[0],
        handlers = _buildRegex[1],
        regex = RegExp(regexString, "i"),
        _match = match(input, regex, handlers),
        rawMatches = _match[0],
        matches = _match[1],
        _ref6 = matches ? dateTimeFromMatches(matches) : [null, null],
        result = _ref6[0],
        zone = _ref6[1];

    if (hasOwnProperty(matches, "a") && hasOwnProperty(matches, "H")) {
      throw new ConflictingSpecificationError("Can't include meridiem when specifying 24-hour format");
    }

    return {
      input: input,
      tokens: tokens,
      regex: regex,
      rawMatches: rawMatches,
      matches: matches,
      result: result,
      zone: zone
    };
  }
}
function parseFromTokens(locale, input, format) {
  var _explainFromTokens = explainFromTokens(locale, input, format),
      result = _explainFromTokens.result,
      zone = _explainFromTokens.zone,
      invalidReason = _explainFromTokens.invalidReason;

  return [result, zone, invalidReason];
}

var nonLeapLadder = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
    leapLadder = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];

function unitOutOfRange(unit, value) {
  return new Invalid("unit out of range", "you specified " + value + " (of type " + typeof value + ") as a " + unit + ", which is invalid");
}

function dayOfWeek(year, month, day) {
  var js = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return js === 0 ? 7 : js;
}

function computeOrdinal(year, month, day) {
  return day + (isLeapYear(year) ? leapLadder : nonLeapLadder)[month - 1];
}

function uncomputeOrdinal(year, ordinal) {
  var table = isLeapYear(year) ? leapLadder : nonLeapLadder,
      month0 = table.findIndex(function (i) {
    return i < ordinal;
  }),
      day = ordinal - table[month0];
  return {
    month: month0 + 1,
    day: day
  };
}
/**
 * @private
 */


function gregorianToWeek(gregObj) {
  var year = gregObj.year,
      month = gregObj.month,
      day = gregObj.day,
      ordinal = computeOrdinal(year, month, day),
      weekday = dayOfWeek(year, month, day);
  var weekNumber = Math.floor((ordinal - weekday + 10) / 7),
      weekYear;

  if (weekNumber < 1) {
    weekYear = year - 1;
    weekNumber = weeksInWeekYear(weekYear);
  } else if (weekNumber > weeksInWeekYear(year)) {
    weekYear = year + 1;
    weekNumber = 1;
  } else {
    weekYear = year;
  }

  return Object.assign({
    weekYear: weekYear,
    weekNumber: weekNumber,
    weekday: weekday
  }, timeObject(gregObj));
}
function weekToGregorian(weekData) {
  var weekYear = weekData.weekYear,
      weekNumber = weekData.weekNumber,
      weekday = weekData.weekday,
      weekdayOfJan4 = dayOfWeek(weekYear, 1, 4),
      yearInDays = daysInYear(weekYear);
  var ordinal = weekNumber * 7 + weekday - weekdayOfJan4 - 3,
      year;

  if (ordinal < 1) {
    year = weekYear - 1;
    ordinal += daysInYear(year);
  } else if (ordinal > yearInDays) {
    year = weekYear + 1;
    ordinal -= daysInYear(weekYear);
  } else {
    year = weekYear;
  }

  var _uncomputeOrdinal = uncomputeOrdinal(year, ordinal),
      month = _uncomputeOrdinal.month,
      day = _uncomputeOrdinal.day;

  return Object.assign({
    year: year,
    month: month,
    day: day
  }, timeObject(weekData));
}
function gregorianToOrdinal(gregData) {
  var year = gregData.year,
      month = gregData.month,
      day = gregData.day,
      ordinal = computeOrdinal(year, month, day);
  return Object.assign({
    year: year,
    ordinal: ordinal
  }, timeObject(gregData));
}
function ordinalToGregorian(ordinalData) {
  var year = ordinalData.year,
      ordinal = ordinalData.ordinal,
      _uncomputeOrdinal2 = uncomputeOrdinal(year, ordinal),
      month = _uncomputeOrdinal2.month,
      day = _uncomputeOrdinal2.day;

  return Object.assign({
    year: year,
    month: month,
    day: day
  }, timeObject(ordinalData));
}
function hasInvalidWeekData(obj) {
  var validYear = isInteger(obj.weekYear),
      validWeek = integerBetween(obj.weekNumber, 1, weeksInWeekYear(obj.weekYear)),
      validWeekday = integerBetween(obj.weekday, 1, 7);

  if (!validYear) {
    return unitOutOfRange("weekYear", obj.weekYear);
  } else if (!validWeek) {
    return unitOutOfRange("week", obj.week);
  } else if (!validWeekday) {
    return unitOutOfRange("weekday", obj.weekday);
  } else return false;
}
function hasInvalidOrdinalData(obj) {
  var validYear = isInteger(obj.year),
      validOrdinal = integerBetween(obj.ordinal, 1, daysInYear(obj.year));

  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validOrdinal) {
    return unitOutOfRange("ordinal", obj.ordinal);
  } else return false;
}
function hasInvalidGregorianData(obj) {
  var validYear = isInteger(obj.year),
      validMonth = integerBetween(obj.month, 1, 12),
      validDay = integerBetween(obj.day, 1, daysInMonth(obj.year, obj.month));

  if (!validYear) {
    return unitOutOfRange("year", obj.year);
  } else if (!validMonth) {
    return unitOutOfRange("month", obj.month);
  } else if (!validDay) {
    return unitOutOfRange("day", obj.day);
  } else return false;
}
function hasInvalidTimeData(obj) {
  var hour = obj.hour,
      minute = obj.minute,
      second = obj.second,
      millisecond = obj.millisecond;
  var validHour = integerBetween(hour, 0, 23) || hour === 24 && minute === 0 && second === 0 && millisecond === 0,
      validMinute = integerBetween(minute, 0, 59),
      validSecond = integerBetween(second, 0, 59),
      validMillisecond = integerBetween(millisecond, 0, 999);

  if (!validHour) {
    return unitOutOfRange("hour", hour);
  } else if (!validMinute) {
    return unitOutOfRange("minute", minute);
  } else if (!validSecond) {
    return unitOutOfRange("second", second);
  } else if (!validMillisecond) {
    return unitOutOfRange("millisecond", millisecond);
  } else return false;
}

var INVALID$2 = "Invalid DateTime";
var MAX_DATE = 8.64e15;

function unsupportedZone(zone) {
  return new Invalid("unsupported zone", "the zone \"" + zone.name + "\" is not supported");
} // we cache week data on the DT object and this intermediates the cache


function possiblyCachedWeekData(dt) {
  if (dt.weekData === null) {
    dt.weekData = gregorianToWeek(dt.c);
  }

  return dt.weekData;
} // clone really means, "make a new object with these modifications". all "setters" really use this
// to create a new object while only changing some of the properties


function clone$1(inst, alts) {
  var current = {
    ts: inst.ts,
    zone: inst.zone,
    c: inst.c,
    o: inst.o,
    loc: inst.loc,
    invalid: inst.invalid
  };
  return new DateTime(Object.assign({}, current, alts, {
    old: current
  }));
} // find the right offset a given local time. The o input is our guess, which determines which
// offset we'll pick in ambiguous cases (e.g. there are two 3 AMs b/c Fallback DST)


function fixOffset(localTS, o, tz) {
  // Our UTC time is just a guess because our offset is just a guess
  var utcGuess = localTS - o * 60 * 1000; // Test whether the zone matches the offset for this ts

  var o2 = tz.offset(utcGuess); // If so, offset didn't change and we're done

  if (o === o2) {
    return [utcGuess, o];
  } // If not, change the ts by the difference in the offset


  utcGuess -= (o2 - o) * 60 * 1000; // If that gives us the local time we want, we're done

  var o3 = tz.offset(utcGuess);

  if (o2 === o3) {
    return [utcGuess, o2];
  } // If it's different, we're in a hole time. The offset has changed, but the we don't adjust the time


  return [localTS - Math.min(o2, o3) * 60 * 1000, Math.max(o2, o3)];
} // convert an epoch timestamp into a calendar object with the given offset


function tsToObj(ts, offset) {
  ts += offset * 60 * 1000;
  var d = new Date(ts);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
    millisecond: d.getUTCMilliseconds()
  };
} // convert a calendar object to a epoch timestamp


function objToTS(obj, offset, zone) {
  return fixOffset(objToLocalTS(obj), offset, zone);
} // create a new DT instance by adding a duration, adjusting for DSTs


function adjustTime(inst, dur) {
  var oPre = inst.o,
      year = inst.c.year + Math.trunc(dur.years),
      month = inst.c.month + Math.trunc(dur.months) + Math.trunc(dur.quarters) * 3,
      c = Object.assign({}, inst.c, {
    year: year,
    month: month,
    day: Math.min(inst.c.day, daysInMonth(year, month)) + Math.trunc(dur.days) + Math.trunc(dur.weeks) * 7
  }),
      millisToAdd = Duration.fromObject({
    years: dur.years - Math.trunc(dur.years),
    quarters: dur.quarters - Math.trunc(dur.quarters),
    months: dur.months - Math.trunc(dur.months),
    weeks: dur.weeks - Math.trunc(dur.weeks),
    days: dur.days - Math.trunc(dur.days),
    hours: dur.hours,
    minutes: dur.minutes,
    seconds: dur.seconds,
    milliseconds: dur.milliseconds
  }).as("milliseconds"),
      localTS = objToLocalTS(c);

  var _fixOffset = fixOffset(localTS, oPre, inst.zone),
      ts = _fixOffset[0],
      o = _fixOffset[1];

  if (millisToAdd !== 0) {
    ts += millisToAdd; // that could have changed the offset by going over a DST, but we want to keep the ts the same

    o = inst.zone.offset(ts);
  }

  return {
    ts: ts,
    o: o
  };
} // helper useful in turning the results of parsing into real dates
// by handling the zone options


function parseDataToDateTime(parsed, parsedZone, opts, format, text) {
  var setZone = opts.setZone,
      zone = opts.zone;

  if (parsed && Object.keys(parsed).length !== 0) {
    var interpretationZone = parsedZone || zone,
        inst = DateTime.fromObject(Object.assign(parsed, opts, {
      zone: interpretationZone,
      // setZone is a valid option in the calling methods, but not in fromObject
      setZone: undefined
    }));
    return setZone ? inst : inst.setZone(zone);
  } else {
    return DateTime.invalid(new Invalid("unparsable", "the input \"" + text + "\" can't be parsed as " + format));
  }
} // if you want to output a technical format (e.g. RFC 2822), this helper
// helps handle the details


function toTechFormat(dt, format, allowZ) {
  if (allowZ === void 0) {
    allowZ = true;
  }

  return dt.isValid ? Formatter.create(Locale.create("en-US"), {
    allowZ: allowZ,
    forceSimple: true
  }).formatDateTimeFromString(dt, format) : null;
} // technical time formats (e.g. the time part of ISO 8601), take some options
// and this commonizes their handling


function toTechTimeFormat(dt, _ref) {
  var _ref$suppressSeconds = _ref.suppressSeconds,
      suppressSeconds = _ref$suppressSeconds === void 0 ? false : _ref$suppressSeconds,
      _ref$suppressMillisec = _ref.suppressMilliseconds,
      suppressMilliseconds = _ref$suppressMillisec === void 0 ? false : _ref$suppressMillisec,
      includeOffset = _ref.includeOffset,
      _ref$includePrefix = _ref.includePrefix,
      includePrefix = _ref$includePrefix === void 0 ? false : _ref$includePrefix,
      _ref$includeZone = _ref.includeZone,
      includeZone = _ref$includeZone === void 0 ? false : _ref$includeZone,
      _ref$spaceZone = _ref.spaceZone,
      spaceZone = _ref$spaceZone === void 0 ? false : _ref$spaceZone,
      _ref$format = _ref.format,
      format = _ref$format === void 0 ? "extended" : _ref$format;
  var fmt = format === "basic" ? "HHmm" : "HH:mm";

  if (!suppressSeconds || dt.second !== 0 || dt.millisecond !== 0) {
    fmt += format === "basic" ? "ss" : ":ss";

    if (!suppressMilliseconds || dt.millisecond !== 0) {
      fmt += ".SSS";
    }
  }

  if ((includeZone || includeOffset) && spaceZone) {
    fmt += " ";
  }

  if (includeZone) {
    fmt += "z";
  } else if (includeOffset) {
    fmt += format === "basic" ? "ZZZ" : "ZZ";
  }

  var str = toTechFormat(dt, fmt);

  if (includePrefix) {
    str = "T" + str;
  }

  return str;
} // defaults for unspecified units in the supported calendars


var defaultUnitValues = {
  month: 1,
  day: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
},
    defaultWeekUnitValues = {
  weekNumber: 1,
  weekday: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
},
    defaultOrdinalUnitValues = {
  ordinal: 1,
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0
}; // Units in the supported calendars, sorted by bigness

var orderedUnits$1 = ["year", "month", "day", "hour", "minute", "second", "millisecond"],
    orderedWeekUnits = ["weekYear", "weekNumber", "weekday", "hour", "minute", "second", "millisecond"],
    orderedOrdinalUnits = ["year", "ordinal", "hour", "minute", "second", "millisecond"]; // standardize case and plurality in units

function normalizeUnit(unit) {
  var normalized = {
    year: "year",
    years: "year",
    month: "month",
    months: "month",
    day: "day",
    days: "day",
    hour: "hour",
    hours: "hour",
    minute: "minute",
    minutes: "minute",
    quarter: "quarter",
    quarters: "quarter",
    second: "second",
    seconds: "second",
    millisecond: "millisecond",
    milliseconds: "millisecond",
    weekday: "weekday",
    weekdays: "weekday",
    weeknumber: "weekNumber",
    weeksnumber: "weekNumber",
    weeknumbers: "weekNumber",
    weekyear: "weekYear",
    weekyears: "weekYear",
    ordinal: "ordinal"
  }[unit.toLowerCase()];
  if (!normalized) throw new InvalidUnitError(unit);
  return normalized;
} // this is a dumbed down version of fromObject() that runs about 60% faster
// but doesn't do any validation, makes a bunch of assumptions about what units
// are present, and so on.


function quickDT(obj, zone) {
  // assume we have the higher-order units
  for (var _iterator = _createForOfIteratorHelperLoose(orderedUnits$1), _step; !(_step = _iterator()).done;) {
    var u = _step.value;

    if (isUndefined(obj[u])) {
      obj[u] = defaultUnitValues[u];
    }
  }

  var invalid = hasInvalidGregorianData(obj) || hasInvalidTimeData(obj);

  if (invalid) {
    return DateTime.invalid(invalid);
  }

  var tsNow = Settings.now(),
      offsetProvis = zone.offset(tsNow),
      _objToTS = objToTS(obj, offsetProvis, zone),
      ts = _objToTS[0],
      o = _objToTS[1];

  return new DateTime({
    ts: ts,
    zone: zone,
    o: o
  });
}

function diffRelative(start, end, opts) {
  var round = isUndefined(opts.round) ? true : opts.round,
      format = function format(c, unit) {
    c = roundTo(c, round || opts.calendary ? 0 : 2, true);
    var formatter = end.loc.clone(opts).relFormatter(opts);
    return formatter.format(c, unit);
  },
      differ = function differ(unit) {
    if (opts.calendary) {
      if (!end.hasSame(start, unit)) {
        return end.startOf(unit).diff(start.startOf(unit), unit).get(unit);
      } else return 0;
    } else {
      return end.diff(start, unit).get(unit);
    }
  };

  if (opts.unit) {
    return format(differ(opts.unit), opts.unit);
  }

  for (var _iterator2 = _createForOfIteratorHelperLoose(opts.units), _step2; !(_step2 = _iterator2()).done;) {
    var unit = _step2.value;
    var count = differ(unit);

    if (Math.abs(count) >= 1) {
      return format(count, unit);
    }
  }

  return format(0, opts.units[opts.units.length - 1]);
}
/**
 * A DateTime is an immutable data structure representing a specific date and time and accompanying methods. It contains class and instance methods for creating, parsing, interrogating, transforming, and formatting them.
 *
 * A DateTime comprises of:
 * * A timestamp. Each DateTime instance refers to a specific millisecond of the Unix epoch.
 * * A time zone. Each instance is considered in the context of a specific zone (by default the local system's zone).
 * * Configuration properties that effect how output strings are formatted, such as `locale`, `numberingSystem`, and `outputCalendar`.
 *
 * Here is a brief overview of the most commonly used functionality it provides:
 *
 * * **Creation**: To create a DateTime from its components, use one of its factory class methods: {@link local}, {@link utc}, and (most flexibly) {@link fromObject}. To create one from a standard string format, use {@link fromISO}, {@link fromHTTP}, and {@link fromRFC2822}. To create one from a custom string format, use {@link fromFormat}. To create one from a native JS date, use {@link fromJSDate}.
 * * **Gregorian calendar and time**: To examine the Gregorian properties of a DateTime individually (i.e as opposed to collectively through {@link toObject}), use the {@link year}, {@link month},
 * {@link day}, {@link hour}, {@link minute}, {@link second}, {@link millisecond} accessors.
 * * **Week calendar**: For ISO week calendar attributes, see the {@link weekYear}, {@link weekNumber}, and {@link weekday} accessors.
 * * **Configuration** See the {@link locale} and {@link numberingSystem} accessors.
 * * **Transformation**: To transform the DateTime into other DateTimes, use {@link set}, {@link reconfigure}, {@link setZone}, {@link setLocale}, {@link plus}, {@link minus}, {@link endOf}, {@link startOf}, {@link toUTC}, and {@link toLocal}.
 * * **Output**: To convert the DateTime to other representations, use the {@link toRelative}, {@link toRelativeCalendar}, {@link toJSON}, {@link toISO}, {@link toHTTP}, {@link toObject}, {@link toRFC2822}, {@link toString}, {@link toLocaleString}, {@link toFormat}, {@link toMillis} and {@link toJSDate}.
 *
 * There's plenty others documented below. In addition, for more information on subtler topics like internationalization, time zones, alternative calendars, validity, and so on, see the external documentation.
 */


var DateTime = /*#__PURE__*/function () {
  /**
   * @access private
   */
  function DateTime(config) {
    var zone = config.zone || Settings.defaultZone;
    var invalid = config.invalid || (Number.isNaN(config.ts) ? new Invalid("invalid input") : null) || (!zone.isValid ? unsupportedZone(zone) : null);
    /**
     * @access private
     */

    this.ts = isUndefined(config.ts) ? Settings.now() : config.ts;
    var c = null,
        o = null;

    if (!invalid) {
      var unchanged = config.old && config.old.ts === this.ts && config.old.zone.equals(zone);

      if (unchanged) {
        var _ref2 = [config.old.c, config.old.o];
        c = _ref2[0];
        o = _ref2[1];
      } else {
        var ot = zone.offset(this.ts);
        c = tsToObj(this.ts, ot);
        invalid = Number.isNaN(c.year) ? new Invalid("invalid input") : null;
        c = invalid ? null : c;
        o = invalid ? null : ot;
      }
    }
    /**
     * @access private
     */


    this._zone = zone;
    /**
     * @access private
     */

    this.loc = config.loc || Locale.create();
    /**
     * @access private
     */

    this.invalid = invalid;
    /**
     * @access private
     */

    this.weekData = null;
    /**
     * @access private
     */

    this.c = c;
    /**
     * @access private
     */

    this.o = o;
    /**
     * @access private
     */

    this.isLuxonDateTime = true;
  } // CONSTRUCT

  /**
   * Create a DateTime for the current instant, in the system's time zone.
   *
   * Use Settings to override these default values if needed.
   * @example DateTime.now().toISO() //~> now in the ISO format
   * @return {DateTime}
   */


  DateTime.now = function now() {
    return new DateTime({});
  }
  /**
   * Create a local DateTime
   * @param {number} [year] - The calendar year. If omitted (as in, call `local()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month, 1-indexed
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @example DateTime.local()                            //~> now
   * @example DateTime.local(2017)                        //~> 2017-01-01T00:00:00
   * @example DateTime.local(2017, 3)                     //~> 2017-03-01T00:00:00
   * @example DateTime.local(2017, 3, 12)                 //~> 2017-03-12T00:00:00
   * @example DateTime.local(2017, 3, 12, 5)              //~> 2017-03-12T05:00:00
   * @example DateTime.local(2017, 3, 12, 5, 45)          //~> 2017-03-12T05:45:00
   * @example DateTime.local(2017, 3, 12, 5, 45, 10)      //~> 2017-03-12T05:45:10
   * @example DateTime.local(2017, 3, 12, 5, 45, 10, 765) //~> 2017-03-12T05:45:10.765
   * @return {DateTime}
   */
  ;

  DateTime.local = function local(year, month, day, hour, minute, second, millisecond) {
    if (isUndefined(year)) {
      return new DateTime({});
    } else {
      return quickDT({
        year: year,
        month: month,
        day: day,
        hour: hour,
        minute: minute,
        second: second,
        millisecond: millisecond
      }, Settings.defaultZone);
    }
  }
  /**
   * Create a DateTime in UTC
   * @param {number} [year] - The calendar year. If omitted (as in, call `utc()` with no arguments), the current time will be used
   * @param {number} [month=1] - The month, 1-indexed
   * @param {number} [day=1] - The day of the month
   * @param {number} [hour=0] - The hour of the day, in 24-hour time
   * @param {number} [minute=0] - The minute of the hour, meaning a number between 0 and 59
   * @param {number} [second=0] - The second of the minute, meaning a number between 0 and 59
   * @param {number} [millisecond=0] - The millisecond of the second, meaning a number between 0 and 999
   * @example DateTime.utc()                            //~> now
   * @example DateTime.utc(2017)                        //~> 2017-01-01T00:00:00Z
   * @example DateTime.utc(2017, 3)                     //~> 2017-03-01T00:00:00Z
   * @example DateTime.utc(2017, 3, 12)                 //~> 2017-03-12T00:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5)              //~> 2017-03-12T05:00:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45)          //~> 2017-03-12T05:45:00Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10)      //~> 2017-03-12T05:45:10Z
   * @example DateTime.utc(2017, 3, 12, 5, 45, 10, 765) //~> 2017-03-12T05:45:10.765Z
   * @return {DateTime}
   */
  ;

  DateTime.utc = function utc(year, month, day, hour, minute, second, millisecond) {
    if (isUndefined(year)) {
      return new DateTime({
        ts: Settings.now(),
        zone: FixedOffsetZone.utcInstance
      });
    } else {
      return quickDT({
        year: year,
        month: month,
        day: day,
        hour: hour,
        minute: minute,
        second: second,
        millisecond: millisecond
      }, FixedOffsetZone.utcInstance);
    }
  }
  /**
   * Create a DateTime from a JavaScript Date object. Uses the default zone.
   * @param {Date} date - a JavaScript Date object
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @return {DateTime}
   */
  ;

  DateTime.fromJSDate = function fromJSDate(date, options) {
    if (options === void 0) {
      options = {};
    }

    var ts = isDate(date) ? date.valueOf() : NaN;

    if (Number.isNaN(ts)) {
      return DateTime.invalid("invalid input");
    }

    var zoneToUse = normalizeZone(options.zone, Settings.defaultZone);

    if (!zoneToUse.isValid) {
      return DateTime.invalid(unsupportedZone(zoneToUse));
    }

    return new DateTime({
      ts: ts,
      zone: zoneToUse,
      loc: Locale.fromObject(options)
    });
  }
  /**
   * Create a DateTime from a number of milliseconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} milliseconds - a number of milliseconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @return {DateTime}
   */
  ;

  DateTime.fromMillis = function fromMillis(milliseconds, options) {
    if (options === void 0) {
      options = {};
    }

    if (!isNumber(milliseconds)) {
      throw new InvalidArgumentError("fromMillis requires a numerical input, but received a " + typeof milliseconds + " with value " + milliseconds);
    } else if (milliseconds < -MAX_DATE || milliseconds > MAX_DATE) {
      // this isn't perfect because because we can still end up out of range because of additional shifting, but it's a start
      return DateTime.invalid("Timestamp out of range");
    } else {
      return new DateTime({
        ts: milliseconds,
        zone: normalizeZone(options.zone, Settings.defaultZone),
        loc: Locale.fromObject(options)
      });
    }
  }
  /**
   * Create a DateTime from a number of seconds since the epoch (meaning since 1 January 1970 00:00:00 UTC). Uses the default zone.
   * @param {number} seconds - a number of seconds since 1970 UTC
   * @param {Object} options - configuration options for the DateTime
   * @param {string|Zone} [options.zone='local'] - the zone to place the DateTime into
   * @param {string} [options.locale] - a locale to set on the resulting DateTime instance
   * @param {string} options.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} options.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @return {DateTime}
   */
  ;

  DateTime.fromSeconds = function fromSeconds(seconds, options) {
    if (options === void 0) {
      options = {};
    }

    if (!isNumber(seconds)) {
      throw new InvalidArgumentError("fromSeconds requires a numerical input");
    } else {
      return new DateTime({
        ts: seconds * 1000,
        zone: normalizeZone(options.zone, Settings.defaultZone),
        loc: Locale.fromObject(options)
      });
    }
  }
  /**
   * Create a DateTime from a JavaScript object with keys like 'year' and 'hour' with reasonable defaults.
   * @param {Object} obj - the object to create the DateTime from
   * @param {number} obj.year - a year, such as 1987
   * @param {number} obj.month - a month, 1-12
   * @param {number} obj.day - a day of the month, 1-31, depending on the month
   * @param {number} obj.ordinal - day of the year, 1-365 or 366
   * @param {number} obj.weekYear - an ISO week year
   * @param {number} obj.weekNumber - an ISO week number, between 1 and 52 or 53, depending on the year
   * @param {number} obj.weekday - an ISO weekday, 1-7, where 1 is Monday and 7 is Sunday
   * @param {number} obj.hour - hour of the day, 0-23
   * @param {number} obj.minute - minute of the hour, 0-59
   * @param {number} obj.second - second of the minute, 0-59
   * @param {number} obj.millisecond - millisecond of the second, 0-999
   * @param {string|Zone} [obj.zone='local'] - interpret the numbers in the context of a particular zone. Can take any value taken as the first argument to setZone()
   * @param {string} [obj.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} obj.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} obj.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromObject({ year: 1982, month: 5, day: 25}).toISODate() //=> '1982-05-25'
   * @example DateTime.fromObject({ year: 1982 }).toISODate() //=> '1982-01-01'
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6 }) //~> today at 10:26:06
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6, zone: 'utc' }),
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6, zone: 'local' })
   * @example DateTime.fromObject({ hour: 10, minute: 26, second: 6, zone: 'America/New_York' })
   * @example DateTime.fromObject({ weekYear: 2016, weekNumber: 2, weekday: 3 }).toISODate() //=> '2016-01-13'
   * @return {DateTime}
   */
  ;

  DateTime.fromObject = function fromObject(obj) {
    var zoneToUse = normalizeZone(obj.zone, Settings.defaultZone);

    if (!zoneToUse.isValid) {
      return DateTime.invalid(unsupportedZone(zoneToUse));
    }

    var tsNow = Settings.now(),
        offsetProvis = zoneToUse.offset(tsNow),
        normalized = normalizeObject(obj, normalizeUnit, ["zone", "locale", "outputCalendar", "numberingSystem"]),
        containsOrdinal = !isUndefined(normalized.ordinal),
        containsGregorYear = !isUndefined(normalized.year),
        containsGregorMD = !isUndefined(normalized.month) || !isUndefined(normalized.day),
        containsGregor = containsGregorYear || containsGregorMD,
        definiteWeekDef = normalized.weekYear || normalized.weekNumber,
        loc = Locale.fromObject(obj); // cases:
    // just a weekday -> this week's instance of that weekday, no worries
    // (gregorian data or ordinal) + (weekYear or weekNumber) -> error
    // (gregorian month or day) + ordinal -> error
    // otherwise just use weeks or ordinals or gregorian, depending on what's specified

    if ((containsGregor || containsOrdinal) && definiteWeekDef) {
      throw new ConflictingSpecificationError("Can't mix weekYear/weekNumber units with year/month/day or ordinals");
    }

    if (containsGregorMD && containsOrdinal) {
      throw new ConflictingSpecificationError("Can't mix ordinal dates with month/day");
    }

    var useWeekData = definiteWeekDef || normalized.weekday && !containsGregor; // configure ourselves to deal with gregorian dates or week stuff

    var units,
        defaultValues,
        objNow = tsToObj(tsNow, offsetProvis);

    if (useWeekData) {
      units = orderedWeekUnits;
      defaultValues = defaultWeekUnitValues;
      objNow = gregorianToWeek(objNow);
    } else if (containsOrdinal) {
      units = orderedOrdinalUnits;
      defaultValues = defaultOrdinalUnitValues;
      objNow = gregorianToOrdinal(objNow);
    } else {
      units = orderedUnits$1;
      defaultValues = defaultUnitValues;
    } // set default values for missing stuff


    var foundFirst = false;

    for (var _iterator3 = _createForOfIteratorHelperLoose(units), _step3; !(_step3 = _iterator3()).done;) {
      var u = _step3.value;
      var v = normalized[u];

      if (!isUndefined(v)) {
        foundFirst = true;
      } else if (foundFirst) {
        normalized[u] = defaultValues[u];
      } else {
        normalized[u] = objNow[u];
      }
    } // make sure the values we have are in range


    var higherOrderInvalid = useWeekData ? hasInvalidWeekData(normalized) : containsOrdinal ? hasInvalidOrdinalData(normalized) : hasInvalidGregorianData(normalized),
        invalid = higherOrderInvalid || hasInvalidTimeData(normalized);

    if (invalid) {
      return DateTime.invalid(invalid);
    } // compute the actual time


    var gregorian = useWeekData ? weekToGregorian(normalized) : containsOrdinal ? ordinalToGregorian(normalized) : normalized,
        _objToTS2 = objToTS(gregorian, offsetProvis, zoneToUse),
        tsFinal = _objToTS2[0],
        offsetFinal = _objToTS2[1],
        inst = new DateTime({
      ts: tsFinal,
      zone: zoneToUse,
      o: offsetFinal,
      loc: loc
    }); // gregorian data + weekday serves only to validate


    if (normalized.weekday && containsGregor && obj.weekday !== inst.weekday) {
      return DateTime.invalid("mismatched weekday", "you can't specify both a weekday of " + normalized.weekday + " and a date of " + inst.toISO());
    }

    return inst;
  }
  /**
   * Create a DateTime from an ISO 8601 string
   * @param {string} text - the ISO string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the time to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromISO('2016-05-25T09:08:34.123')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00')
   * @example DateTime.fromISO('2016-05-25T09:08:34.123+06:00', {setZone: true})
   * @example DateTime.fromISO('2016-05-25T09:08:34.123', {zone: 'utc'})
   * @example DateTime.fromISO('2016-W05-4')
   * @return {DateTime}
   */
  ;

  DateTime.fromISO = function fromISO(text, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var _parseISODate = parseISODate(text),
        vals = _parseISODate[0],
        parsedZone = _parseISODate[1];

    return parseDataToDateTime(vals, parsedZone, opts, "ISO 8601", text);
  }
  /**
   * Create a DateTime from an RFC 2822 string
   * @param {string} text - the RFC 2822 string
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since the offset is always specified in the string itself, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with a fixed-offset zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23:12 GMT')
   * @example DateTime.fromRFC2822('Fri, 25 Nov 2016 13:23:12 +0600')
   * @example DateTime.fromRFC2822('25 Nov 2016 13:23 Z')
   * @return {DateTime}
   */
  ;

  DateTime.fromRFC2822 = function fromRFC2822(text, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var _parseRFC2822Date = parseRFC2822Date(text),
        vals = _parseRFC2822Date[0],
        parsedZone = _parseRFC2822Date[1];

    return parseDataToDateTime(vals, parsedZone, opts, "RFC 2822", text);
  }
  /**
   * Create a DateTime from an HTTP header date
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @param {string} text - the HTTP header date
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - convert the time to this zone. Since HTTP dates are always in UTC, this has no effect on the interpretation of string, merely the zone the resulting DateTime is expressed in.
   * @param {boolean} [opts.setZone=false] - override the zone with the fixed-offset zone specified in the string. For HTTP dates, this is always UTC, so this option is equivalent to setting the `zone` option to 'utc', but this option is included for consistency with similar methods.
   * @param {string} [opts.locale='system's locale'] - a locale to set on the resulting DateTime instance
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @param {string} opts.numberingSystem - the numbering system to set on the resulting DateTime instance
   * @example DateTime.fromHTTP('Sun, 06 Nov 1994 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sunday, 06-Nov-94 08:49:37 GMT')
   * @example DateTime.fromHTTP('Sun Nov  6 08:49:37 1994')
   * @return {DateTime}
   */
  ;

  DateTime.fromHTTP = function fromHTTP(text, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var _parseHTTPDate = parseHTTPDate(text),
        vals = _parseHTTPDate[0],
        parsedZone = _parseHTTPDate[1];

    return parseDataToDateTime(vals, parsedZone, opts, "HTTP", opts);
  }
  /**
   * Create a DateTime from an input string and format string.
   * Defaults to en-US if no locale has been specified, regardless of the system's locale.
   * @see https://moment.github.io/luxon/docs/manual/parsing.html#table-of-tokens
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see the link below for the formats)
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @return {DateTime}
   */
  ;

  DateTime.fromFormat = function fromFormat(text, fmt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (isUndefined(text) || isUndefined(fmt)) {
      throw new InvalidArgumentError("fromFormat requires an input string and a format");
    }

    var _opts = opts,
        _opts$locale = _opts.locale,
        locale = _opts$locale === void 0 ? null : _opts$locale,
        _opts$numberingSystem = _opts.numberingSystem,
        numberingSystem = _opts$numberingSystem === void 0 ? null : _opts$numberingSystem,
        localeToUse = Locale.fromOpts({
      locale: locale,
      numberingSystem: numberingSystem,
      defaultToEN: true
    }),
        _parseFromTokens = parseFromTokens(localeToUse, text, fmt),
        vals = _parseFromTokens[0],
        parsedZone = _parseFromTokens[1],
        invalid = _parseFromTokens[2];

    if (invalid) {
      return DateTime.invalid(invalid);
    } else {
      return parseDataToDateTime(vals, parsedZone, opts, "format " + fmt, text);
    }
  }
  /**
   * @deprecated use fromFormat instead
   */
  ;

  DateTime.fromString = function fromString(text, fmt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    return DateTime.fromFormat(text, fmt, opts);
  }
  /**
   * Create a DateTime from a SQL date, time, or datetime
   * Defaults to en-US if no locale has been specified, regardless of the system's locale
   * @param {string} text - the string to parse
   * @param {Object} opts - options to affect the creation
   * @param {string|Zone} [opts.zone='local'] - use this zone if no offset is specified in the input string itself. Will also convert the DateTime to this zone
   * @param {boolean} [opts.setZone=false] - override the zone with a zone specified in the string itself, if it specifies one
   * @param {string} [opts.locale='en-US'] - a locale string to use when parsing. Will also set the DateTime to this locale
   * @param {string} opts.numberingSystem - the numbering system to use when parsing. Will also set the resulting DateTime to this numbering system
   * @param {string} opts.outputCalendar - the output calendar to set on the resulting DateTime instance
   * @example DateTime.fromSQL('2017-05-15')
   * @example DateTime.fromSQL('2017-05-15 09:12:34')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342+06:00')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles')
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342 America/Los_Angeles', { setZone: true })
   * @example DateTime.fromSQL('2017-05-15 09:12:34.342', { zone: 'America/Los_Angeles' })
   * @example DateTime.fromSQL('09:12:34.342')
   * @return {DateTime}
   */
  ;

  DateTime.fromSQL = function fromSQL(text, opts) {
    if (opts === void 0) {
      opts = {};
    }

    var _parseSQL = parseSQL(text),
        vals = _parseSQL[0],
        parsedZone = _parseSQL[1];

    return parseDataToDateTime(vals, parsedZone, opts, "SQL", text);
  }
  /**
   * Create an invalid DateTime.
   * @param {string} reason - simple string of why this DateTime is invalid. Should not contain parameters or anything else data-dependent
   * @param {string} [explanation=null] - longer explanation, may include parameters and other useful debugging information
   * @return {DateTime}
   */
  ;

  DateTime.invalid = function invalid(reason, explanation) {
    if (explanation === void 0) {
      explanation = null;
    }

    if (!reason) {
      throw new InvalidArgumentError("need to specify a reason the DateTime is invalid");
    }

    var invalid = reason instanceof Invalid ? reason : new Invalid(reason, explanation);

    if (Settings.throwOnInvalid) {
      throw new InvalidDateTimeError(invalid);
    } else {
      return new DateTime({
        invalid: invalid
      });
    }
  }
  /**
   * Check if an object is a DateTime. Works across context boundaries
   * @param {object} o
   * @return {boolean}
   */
  ;

  DateTime.isDateTime = function isDateTime(o) {
    return o && o.isLuxonDateTime || false;
  } // INFO

  /**
   * Get the value of unit.
   * @param {string} unit - a unit such as 'minute' or 'day'
   * @example DateTime.local(2017, 7, 4).get('month'); //=> 7
   * @example DateTime.local(2017, 7, 4).get('day'); //=> 4
   * @return {number}
   */
  ;

  var _proto = DateTime.prototype;

  _proto.get = function get(unit) {
    return this[unit];
  }
  /**
   * Returns whether the DateTime is valid. Invalid DateTimes occur when:
   * * The DateTime was created from invalid calendar information, such as the 13th month or February 30
   * * The DateTime was created by an operation on another invalid date
   * @type {boolean}
   */
  ;

  /**
   * Returns the resolved Intl options for this DateTime.
   * This is useful in understanding the behavior of formatting methods
   * @param {Object} opts - the same options as toLocaleString
   * @return {Object}
   */
  _proto.resolvedLocaleOpts = function resolvedLocaleOpts(opts) {
    if (opts === void 0) {
      opts = {};
    }

    var _Formatter$create$res = Formatter.create(this.loc.clone(opts), opts).resolvedOptions(this),
        locale = _Formatter$create$res.locale,
        numberingSystem = _Formatter$create$res.numberingSystem,
        calendar = _Formatter$create$res.calendar;

    return {
      locale: locale,
      numberingSystem: numberingSystem,
      outputCalendar: calendar
    };
  } // TRANSFORM

  /**
   * "Set" the DateTime's zone to UTC. Returns a newly-constructed DateTime.
   *
   * Equivalent to {@link setZone}('utc')
   * @param {number} [offset=0] - optionally, an offset from UTC in minutes
   * @param {Object} [opts={}] - options to pass to `setZone()`
   * @return {DateTime}
   */
  ;

  _proto.toUTC = function toUTC(offset, opts) {
    if (offset === void 0) {
      offset = 0;
    }

    if (opts === void 0) {
      opts = {};
    }

    return this.setZone(FixedOffsetZone.instance(offset), opts);
  }
  /**
   * "Set" the DateTime's zone to the host's local zone. Returns a newly-constructed DateTime.
   *
   * Equivalent to `setZone('local')`
   * @return {DateTime}
   */
  ;

  _proto.toLocal = function toLocal() {
    return this.setZone(Settings.defaultZone);
  }
  /**
   * "Set" the DateTime's zone to specified zone. Returns a newly-constructed DateTime.
   *
   * By default, the setter keeps the underlying time the same (as in, the same timestamp), but the new instance will report different local times and consider DSTs when making computations, as with {@link plus}. You may wish to use {@link toLocal} and {@link toUTC} which provide simple convenience wrappers for commonly used zones.
   * @param {string|Zone} [zone='local'] - a zone identifier. As a string, that can be any IANA zone supported by the host environment, or a fixed-offset name of the form 'UTC+3', or the strings 'local' or 'utc'. You may also supply an instance of a {@link Zone} class.
   * @param {Object} opts - options
   * @param {boolean} [opts.keepLocalTime=false] - If true, adjust the underlying time so that the local time stays the same, but in the target zone. You should rarely need this.
   * @return {DateTime}
   */
  ;

  _proto.setZone = function setZone(zone, _temp) {
    var _ref3 = _temp === void 0 ? {} : _temp,
        _ref3$keepLocalTime = _ref3.keepLocalTime,
        keepLocalTime = _ref3$keepLocalTime === void 0 ? false : _ref3$keepLocalTime,
        _ref3$keepCalendarTim = _ref3.keepCalendarTime,
        keepCalendarTime = _ref3$keepCalendarTim === void 0 ? false : _ref3$keepCalendarTim;

    zone = normalizeZone(zone, Settings.defaultZone);

    if (zone.equals(this.zone)) {
      return this;
    } else if (!zone.isValid) {
      return DateTime.invalid(unsupportedZone(zone));
    } else {
      var newTS = this.ts;

      if (keepLocalTime || keepCalendarTime) {
        var offsetGuess = zone.offset(this.ts);
        var asObj = this.toObject();

        var _objToTS3 = objToTS(asObj, offsetGuess, zone);

        newTS = _objToTS3[0];
      }

      return clone$1(this, {
        ts: newTS,
        zone: zone
      });
    }
  }
  /**
   * "Set" the locale, numberingSystem, or outputCalendar. Returns a newly-constructed DateTime.
   * @param {Object} properties - the properties to set
   * @example DateTime.local(2017, 5, 25).reconfigure({ locale: 'en-GB' })
   * @return {DateTime}
   */
  ;

  _proto.reconfigure = function reconfigure(_temp2) {
    var _ref4 = _temp2 === void 0 ? {} : _temp2,
        locale = _ref4.locale,
        numberingSystem = _ref4.numberingSystem,
        outputCalendar = _ref4.outputCalendar;

    var loc = this.loc.clone({
      locale: locale,
      numberingSystem: numberingSystem,
      outputCalendar: outputCalendar
    });
    return clone$1(this, {
      loc: loc
    });
  }
  /**
   * "Set" the locale. Returns a newly-constructed DateTime.
   * Just a convenient alias for reconfigure({ locale })
   * @example DateTime.local(2017, 5, 25).setLocale('en-GB')
   * @return {DateTime}
   */
  ;

  _proto.setLocale = function setLocale(locale) {
    return this.reconfigure({
      locale: locale
    });
  }
  /**
   * "Set" the values of specified units. Returns a newly-constructed DateTime.
   * You can only set units with this method; for "setting" metadata, see {@link reconfigure} and {@link setZone}.
   * @param {Object} values - a mapping of units to numbers
   * @example dt.set({ year: 2017 })
   * @example dt.set({ hour: 8, minute: 30 })
   * @example dt.set({ weekday: 5 })
   * @example dt.set({ year: 2005, ordinal: 234 })
   * @return {DateTime}
   */
  ;

  _proto.set = function set(values) {
    if (!this.isValid) return this;
    var normalized = normalizeObject(values, normalizeUnit, []),
        settingWeekStuff = !isUndefined(normalized.weekYear) || !isUndefined(normalized.weekNumber) || !isUndefined(normalized.weekday);
    var mixed;

    if (settingWeekStuff) {
      mixed = weekToGregorian(Object.assign(gregorianToWeek(this.c), normalized));
    } else if (!isUndefined(normalized.ordinal)) {
      mixed = ordinalToGregorian(Object.assign(gregorianToOrdinal(this.c), normalized));
    } else {
      mixed = Object.assign(this.toObject(), normalized); // if we didn't set the day but we ended up on an overflow date,
      // use the last day of the right month

      if (isUndefined(normalized.day)) {
        mixed.day = Math.min(daysInMonth(mixed.year, mixed.month), mixed.day);
      }
    }

    var _objToTS4 = objToTS(mixed, this.o, this.zone),
        ts = _objToTS4[0],
        o = _objToTS4[1];

    return clone$1(this, {
      ts: ts,
      o: o
    });
  }
  /**
   * Add a period of time to this DateTime and return the resulting DateTime
   *
   * Adding hours, minutes, seconds, or milliseconds increases the timestamp by the right number of milliseconds. Adding days, months, or years shifts the calendar, accounting for DSTs and leap years along the way. Thus, `dt.plus({ hours: 24 })` may result in a different time than `dt.plus({ days: 1 })` if there's a DST shift in between.
   * @param {Duration|Object|number} duration - The amount to add. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   * @example DateTime.now().plus(123) //~> in 123 milliseconds
   * @example DateTime.now().plus({ minutes: 15 }) //~> in 15 minutes
   * @example DateTime.now().plus({ days: 1 }) //~> this time tomorrow
   * @example DateTime.now().plus({ days: -1 }) //~> this time yesterday
   * @example DateTime.now().plus({ hours: 3, minutes: 13 }) //~> in 3 hr, 13 min
   * @example DateTime.now().plus(Duration.fromObject({ hours: 3, minutes: 13 })) //~> in 3 hr, 13 min
   * @return {DateTime}
   */
  ;

  _proto.plus = function plus(duration) {
    if (!this.isValid) return this;
    var dur = friendlyDuration(duration);
    return clone$1(this, adjustTime(this, dur));
  }
  /**
   * Subtract a period of time to this DateTime and return the resulting DateTime
   * See {@link plus}
   * @param {Duration|Object|number} duration - The amount to subtract. Either a Luxon Duration, a number of milliseconds, the object argument to Duration.fromObject()
   @return {DateTime}
  */
  ;

  _proto.minus = function minus(duration) {
    if (!this.isValid) return this;
    var dur = friendlyDuration(duration).negate();
    return clone$1(this, adjustTime(this, dur));
  }
  /**
   * "Set" this DateTime to the beginning of a unit of time.
   * @param {string} unit - The unit to go to the beginning of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @example DateTime.local(2014, 3, 3).startOf('month').toISODate(); //=> '2014-03-01'
   * @example DateTime.local(2014, 3, 3).startOf('year').toISODate(); //=> '2014-01-01'
   * @example DateTime.local(2014, 3, 3).startOf('week').toISODate(); //=> '2014-03-03', weeks always start on Mondays
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('day').toISOTime(); //=> '00:00.000-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).startOf('hour').toISOTime(); //=> '05:00:00.000-05:00'
   * @return {DateTime}
   */
  ;

  _proto.startOf = function startOf(unit) {
    if (!this.isValid) return this;
    var o = {},
        normalizedUnit = Duration.normalizeUnit(unit);

    switch (normalizedUnit) {
      case "years":
        o.month = 1;
      // falls through

      case "quarters":
      case "months":
        o.day = 1;
      // falls through

      case "weeks":
      case "days":
        o.hour = 0;
      // falls through

      case "hours":
        o.minute = 0;
      // falls through

      case "minutes":
        o.second = 0;
      // falls through

      case "seconds":
        o.millisecond = 0;
        break;
      // no default, invalid units throw in normalizeUnit()
    }

    if (normalizedUnit === "weeks") {
      o.weekday = 1;
    }

    if (normalizedUnit === "quarters") {
      var q = Math.ceil(this.month / 3);
      o.month = (q - 1) * 3 + 1;
    }

    return this.set(o);
  }
  /**
   * "Set" this DateTime to the end (meaning the last millisecond) of a unit of time
   * @param {string} unit - The unit to go to the end of. Can be 'year', 'quarter', 'month', 'week', 'day', 'hour', 'minute', 'second', or 'millisecond'.
   * @example DateTime.local(2014, 3, 3).endOf('month').toISO(); //=> '2014-03-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('year').toISO(); //=> '2014-12-31T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3).endOf('week').toISO(); // => '2014-03-09T23:59:59.999-05:00', weeks start on Mondays
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('day').toISO(); //=> '2014-03-03T23:59:59.999-05:00'
   * @example DateTime.local(2014, 3, 3, 5, 30).endOf('hour').toISO(); //=> '2014-03-03T05:59:59.999-05:00'
   * @return {DateTime}
   */
  ;

  _proto.endOf = function endOf(unit) {
    var _this$plus;

    return this.isValid ? this.plus((_this$plus = {}, _this$plus[unit] = 1, _this$plus)).startOf(unit).minus(1) : this;
  } // OUTPUT

  /**
   * Returns a string representation of this DateTime formatted according to the specified format string.
   * **You may not want this.** See {@link toLocaleString} for a more flexible formatting tool. For a table of tokens and their interpretations, see [here](https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens).
   * Defaults to en-US if no locale has been specified, regardless of the system's locale.
   * @see https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens
   * @param {string} fmt - the format string
   * @param {Object} opts - opts to override the configuration options
   * @example DateTime.now().toFormat('yyyy LLL dd') //=> '2017 Apr 22'
   * @example DateTime.now().setLocale('fr').toFormat('yyyy LLL dd') //=> '2017 avr. 22'
   * @example DateTime.now().toFormat('yyyy LLL dd', { locale: "fr" }) //=> '2017 avr. 22'
   * @example DateTime.now().toFormat("HH 'hours and' mm 'minutes'") //=> '20 hours and 55 minutes'
   * @return {string}
   */
  ;

  _proto.toFormat = function toFormat(fmt, opts) {
    if (opts === void 0) {
      opts = {};
    }

    return this.isValid ? Formatter.create(this.loc.redefaultToEN(opts)).formatDateTimeFromString(this, fmt) : INVALID$2;
  }
  /**
   * Returns a localized string representing this date. Accepts the same options as the Intl.DateTimeFormat constructor and any presets defined by Luxon, such as `DateTime.DATE_FULL` or `DateTime.TIME_SIMPLE`.
   * The exact behavior of this method is browser-specific, but in general it will return an appropriate representation
   * of the DateTime in the assigned locale.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat
   * @param opts {Object} - Intl.DateTimeFormat constructor options and configuration options
   * @example DateTime.now().toLocaleString(); //=> 4/20/2017
   * @example DateTime.now().setLocale('en-gb').toLocaleString(); //=> '20/04/2017'
   * @example DateTime.now().toLocaleString({ locale: 'en-gb' }); //=> '20/04/2017'
   * @example DateTime.now().toLocaleString(DateTime.DATE_FULL); //=> 'April 20, 2017'
   * @example DateTime.now().toLocaleString(DateTime.TIME_SIMPLE); //=> '11:32 AM'
   * @example DateTime.now().toLocaleString(DateTime.DATETIME_SHORT); //=> '4/20/2017, 11:32 AM'
   * @example DateTime.now().toLocaleString({ weekday: 'long', month: 'long', day: '2-digit' }); //=> 'Thursday, April 20'
   * @example DateTime.now().toLocaleString({ weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }); //=> 'Thu, Apr 20, 11:27 AM'
   * @example DateTime.now().toLocaleString({ hour: '2-digit', minute: '2-digit', hour12: false }); //=> '11:32'
   * @return {string}
   */
  ;

  _proto.toLocaleString = function toLocaleString(opts) {
    if (opts === void 0) {
      opts = DATE_SHORT;
    }

    return this.isValid ? Formatter.create(this.loc.clone(opts), opts).formatDateTime(this) : INVALID$2;
  }
  /**
   * Returns an array of format "parts", meaning individual tokens along with metadata. This is allows callers to post-process individual sections of the formatted output.
   * Defaults to the system's locale if no locale has been specified
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DateTimeFormat/formatToParts
   * @param opts {Object} - Intl.DateTimeFormat constructor options, same as `toLocaleString`.
   * @example DateTime.now().toLocaleParts(); //=> [
   *                                   //=>   { type: 'day', value: '25' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'month', value: '05' },
   *                                   //=>   { type: 'literal', value: '/' },
   *                                   //=>   { type: 'year', value: '1982' }
   *                                   //=> ]
   */
  ;

  _proto.toLocaleParts = function toLocaleParts(opts) {
    if (opts === void 0) {
      opts = {};
    }

    return this.isValid ? Formatter.create(this.loc.clone(opts), opts).formatDateTimeParts(this) : [];
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc(1982, 5, 25).toISO() //=> '1982-05-25T00:00:00.000Z'
   * @example DateTime.now().toISO() //=> '2017-04-22T20:47:05.335-04:00'
   * @example DateTime.now().toISO({ includeOffset: false }) //=> '2017-04-22T20:47:05.335'
   * @example DateTime.now().toISO({ format: 'basic' }) //=> '20170422T204705.335-0400'
   * @return {string}
   */
  ;

  _proto.toISO = function toISO(opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (!this.isValid) {
      return null;
    }

    return this.toISODate(opts) + "T" + this.toISOTime(opts);
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's date component
   * @param {Object} opts - options
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc(1982, 5, 25).toISODate() //=> '1982-05-25'
   * @example DateTime.utc(1982, 5, 25).toISODate({ format: 'basic' }) //=> '19820525'
   * @return {string}
   */
  ;

  _proto.toISODate = function toISODate(_temp3) {
    var _ref5 = _temp3 === void 0 ? {} : _temp3,
        _ref5$format = _ref5.format,
        format = _ref5$format === void 0 ? "extended" : _ref5$format;

    var fmt = format === "basic" ? "yyyyMMdd" : "yyyy-MM-dd";

    if (this.year > 9999) {
      fmt = "+" + fmt;
    }

    return toTechFormat(this, fmt);
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's week date
   * @example DateTime.utc(1982, 5, 25).toISOWeekDate() //=> '1982-W21-2'
   * @return {string}
   */
  ;

  _proto.toISOWeekDate = function toISOWeekDate() {
    return toTechFormat(this, "kkkk-'W'WW-c");
  }
  /**
   * Returns an ISO 8601-compliant string representation of this DateTime's time component
   * @param {Object} opts - options
   * @param {boolean} [opts.suppressMilliseconds=false] - exclude milliseconds from the format if they're 0
   * @param {boolean} [opts.suppressSeconds=false] - exclude seconds from the format if they're 0
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @param {boolean} [opts.includePrefix=false] - include the `T` prefix
   * @param {string} [opts.format='extended'] - choose between the basic and extended format
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime() //=> '07:34:19.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34, seconds: 0, milliseconds: 0 }).toISOTime({ suppressSeconds: true }) //=> '07:34Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ format: 'basic' }) //=> '073419.361Z'
   * @example DateTime.utc().set({ hour: 7, minute: 34 }).toISOTime({ includePrefix: true }) //=> 'T07:34:19.361Z'
   * @return {string}
   */
  ;

  _proto.toISOTime = function toISOTime(_temp4) {
    var _ref6 = _temp4 === void 0 ? {} : _temp4,
        _ref6$suppressMillise = _ref6.suppressMilliseconds,
        suppressMilliseconds = _ref6$suppressMillise === void 0 ? false : _ref6$suppressMillise,
        _ref6$suppressSeconds = _ref6.suppressSeconds,
        suppressSeconds = _ref6$suppressSeconds === void 0 ? false : _ref6$suppressSeconds,
        _ref6$includeOffset = _ref6.includeOffset,
        includeOffset = _ref6$includeOffset === void 0 ? true : _ref6$includeOffset,
        _ref6$includePrefix = _ref6.includePrefix,
        includePrefix = _ref6$includePrefix === void 0 ? false : _ref6$includePrefix,
        _ref6$format = _ref6.format,
        format = _ref6$format === void 0 ? "extended" : _ref6$format;

    return toTechTimeFormat(this, {
      suppressSeconds: suppressSeconds,
      suppressMilliseconds: suppressMilliseconds,
      includeOffset: includeOffset,
      includePrefix: includePrefix,
      format: format
    });
  }
  /**
   * Returns an RFC 2822-compatible string representation of this DateTime, always in UTC
   * @example DateTime.utc(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 +0000'
   * @example DateTime.local(2014, 7, 13).toRFC2822() //=> 'Sun, 13 Jul 2014 00:00:00 -0400'
   * @return {string}
   */
  ;

  _proto.toRFC2822 = function toRFC2822() {
    return toTechFormat(this, "EEE, dd LLL yyyy HH:mm:ss ZZZ", false);
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in HTTP headers.
   * Specifically, the string conforms to RFC 1123.
   * @see https://www.w3.org/Protocols/rfc2616/rfc2616-sec3.html#sec3.3.1
   * @example DateTime.utc(2014, 7, 13).toHTTP() //=> 'Sun, 13 Jul 2014 00:00:00 GMT'
   * @example DateTime.utc(2014, 7, 13, 19).toHTTP() //=> 'Sun, 13 Jul 2014 19:00:00 GMT'
   * @return {string}
   */
  ;

  _proto.toHTTP = function toHTTP() {
    return toTechFormat(this.toUTC(), "EEE, dd LLL yyyy HH:mm:ss 'GMT'");
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Date
   * @example DateTime.utc(2014, 7, 13).toSQLDate() //=> '2014-07-13'
   * @return {string}
   */
  ;

  _proto.toSQLDate = function toSQLDate() {
    return toTechFormat(this, "yyyy-MM-dd");
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL Time
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @example DateTime.utc().toSQL() //=> '05:15:16.345'
   * @example DateTime.now().toSQL() //=> '05:15:16.345 -04:00'
   * @example DateTime.now().toSQL({ includeOffset: false }) //=> '05:15:16.345'
   * @example DateTime.now().toSQL({ includeZone: false }) //=> '05:15:16.345 America/New_York'
   * @return {string}
   */
  ;

  _proto.toSQLTime = function toSQLTime(_temp5) {
    var _ref7 = _temp5 === void 0 ? {} : _temp5,
        _ref7$includeOffset = _ref7.includeOffset,
        includeOffset = _ref7$includeOffset === void 0 ? true : _ref7$includeOffset,
        _ref7$includeZone = _ref7.includeZone,
        includeZone = _ref7$includeZone === void 0 ? false : _ref7$includeZone;

    return toTechTimeFormat(this, {
      includeOffset: includeOffset,
      includeZone: includeZone,
      spaceZone: true
    });
  }
  /**
   * Returns a string representation of this DateTime appropriate for use in SQL DateTime
   * @param {Object} opts - options
   * @param {boolean} [opts.includeZone=false] - include the zone, such as 'America/New_York'. Overrides includeOffset.
   * @param {boolean} [opts.includeOffset=true] - include the offset, such as 'Z' or '-04:00'
   * @example DateTime.utc(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 Z'
   * @example DateTime.local(2014, 7, 13).toSQL() //=> '2014-07-13 00:00:00.000 -04:00'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeOffset: false }) //=> '2014-07-13 00:00:00.000'
   * @example DateTime.local(2014, 7, 13).toSQL({ includeZone: true }) //=> '2014-07-13 00:00:00.000 America/New_York'
   * @return {string}
   */
  ;

  _proto.toSQL = function toSQL(opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (!this.isValid) {
      return null;
    }

    return this.toSQLDate() + " " + this.toSQLTime(opts);
  }
  /**
   * Returns a string representation of this DateTime appropriate for debugging
   * @return {string}
   */
  ;

  _proto.toString = function toString() {
    return this.isValid ? this.toISO() : INVALID$2;
  }
  /**
   * Returns the epoch milliseconds of this DateTime. Alias of {@link toMillis}
   * @return {number}
   */
  ;

  _proto.valueOf = function valueOf() {
    return this.toMillis();
  }
  /**
   * Returns the epoch milliseconds of this DateTime.
   * @return {number}
   */
  ;

  _proto.toMillis = function toMillis() {
    return this.isValid ? this.ts : NaN;
  }
  /**
   * Returns the epoch seconds of this DateTime.
   * @return {number}
   */
  ;

  _proto.toSeconds = function toSeconds() {
    return this.isValid ? this.ts / 1000 : NaN;
  }
  /**
   * Returns an ISO 8601 representation of this DateTime appropriate for use in JSON.
   * @return {string}
   */
  ;

  _proto.toJSON = function toJSON() {
    return this.toISO();
  }
  /**
   * Returns a BSON serializable equivalent to this DateTime.
   * @return {Date}
   */
  ;

  _proto.toBSON = function toBSON() {
    return this.toJSDate();
  }
  /**
   * Returns a JavaScript object with this DateTime's year, month, day, and so on.
   * @param opts - options for generating the object
   * @param {boolean} [opts.includeConfig=false] - include configuration attributes in the output
   * @example DateTime.now().toObject() //=> { year: 2017, month: 4, day: 22, hour: 20, minute: 49, second: 42, millisecond: 268 }
   * @return {Object}
   */
  ;

  _proto.toObject = function toObject(opts) {
    if (opts === void 0) {
      opts = {};
    }

    if (!this.isValid) return {};
    var base = Object.assign({}, this.c);

    if (opts.includeConfig) {
      base.outputCalendar = this.outputCalendar;
      base.numberingSystem = this.loc.numberingSystem;
      base.locale = this.loc.locale;
    }

    return base;
  }
  /**
   * Returns a JavaScript Date equivalent to this DateTime.
   * @return {Date}
   */
  ;

  _proto.toJSDate = function toJSDate() {
    return new Date(this.isValid ? this.ts : NaN);
  } // COMPARE

  /**
   * Return the difference between two DateTimes as a Duration.
   * @param {DateTime} otherDateTime - the DateTime to compare this one to
   * @param {string|string[]} [unit=['milliseconds']] - the unit or array of units (such as 'hours' or 'days') to include in the duration.
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @example
   * var i1 = DateTime.fromISO('1982-05-25T09:45'),
   *     i2 = DateTime.fromISO('1983-10-14T10:30');
   * i2.diff(i1).toObject() //=> { milliseconds: 43807500000 }
   * i2.diff(i1, 'hours').toObject() //=> { hours: 12168.75 }
   * i2.diff(i1, ['months', 'days']).toObject() //=> { months: 16, days: 19.03125 }
   * i2.diff(i1, ['months', 'days', 'hours']).toObject() //=> { months: 16, days: 19, hours: 0.75 }
   * @return {Duration}
   */
  ;

  _proto.diff = function diff(otherDateTime, unit, opts) {
    if (unit === void 0) {
      unit = "milliseconds";
    }

    if (opts === void 0) {
      opts = {};
    }

    if (!this.isValid || !otherDateTime.isValid) {
      return Duration.invalid(this.invalid || otherDateTime.invalid, "created by diffing an invalid DateTime");
    }

    var durOpts = Object.assign({
      locale: this.locale,
      numberingSystem: this.numberingSystem
    }, opts);

    var units = maybeArray(unit).map(Duration.normalizeUnit),
        otherIsLater = otherDateTime.valueOf() > this.valueOf(),
        earlier = otherIsLater ? this : otherDateTime,
        later = otherIsLater ? otherDateTime : this,
        diffed = _diff(earlier, later, units, durOpts);

    return otherIsLater ? diffed.negate() : diffed;
  }
  /**
   * Return the difference between this DateTime and right now.
   * See {@link diff}
   * @param {string|string[]} [unit=['milliseconds']] - the unit or units units (such as 'hours' or 'days') to include in the duration
   * @param {Object} opts - options that affect the creation of the Duration
   * @param {string} [opts.conversionAccuracy='casual'] - the conversion system to use
   * @return {Duration}
   */
  ;

  _proto.diffNow = function diffNow(unit, opts) {
    if (unit === void 0) {
      unit = "milliseconds";
    }

    if (opts === void 0) {
      opts = {};
    }

    return this.diff(DateTime.now(), unit, opts);
  }
  /**
   * Return an Interval spanning between this DateTime and another DateTime
   * @param {DateTime} otherDateTime - the other end point of the Interval
   * @return {Interval}
   */
  ;

  _proto.until = function until(otherDateTime) {
    return this.isValid ? Interval.fromDateTimes(this, otherDateTime) : this;
  }
  /**
   * Return whether this DateTime is in the same unit of time as another DateTime.
   * Higher-order units must also be identical for this function to return `true`.
   * Note that time zones are **ignored** in this comparison, which compares the **local** calendar time. Use {@link setZone} to convert one of the dates if needed.
   * @param {DateTime} otherDateTime - the other DateTime
   * @param {string} unit - the unit of time to check sameness on
   * @example DateTime.now().hasSame(otherDT, 'day'); //~> true if otherDT is in the same current calendar day
   * @return {boolean}
   */
  ;

  _proto.hasSame = function hasSame(otherDateTime, unit) {
    if (!this.isValid) return false;
    var inputMs = otherDateTime.valueOf();
    var otherZoneDateTime = this.setZone(otherDateTime.zone, {
      keepLocalTime: true
    });
    return otherZoneDateTime.startOf(unit) <= inputMs && inputMs <= otherZoneDateTime.endOf(unit);
  }
  /**
   * Equality check
   * Two DateTimes are equal iff they represent the same millisecond, have the same zone and location, and are both valid.
   * To compare just the millisecond values, use `+dt1 === +dt2`.
   * @param {DateTime} other - the other DateTime
   * @return {boolean}
   */
  ;

  _proto.equals = function equals(other) {
    return this.isValid && other.isValid && this.valueOf() === other.valueOf() && this.zone.equals(other.zone) && this.loc.equals(other.loc);
  }
  /**
   * Returns a string representation of a this time relative to now, such as "in two days". Can only internationalize if your
   * platform supports Intl.RelativeTimeFormat. Rounds down by default.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} [options.style="long"] - the style of units, must be "long", "short", or "narrow"
   * @param {string} options.unit - use a specific unit; if omitted, the method will pick the unit. Use one of "years", "quarters", "months", "weeks", "days", "hours", "minutes", or "seconds"
   * @param {boolean} [options.round=true] - whether to round the numbers in the output.
   * @param {number} [options.padding=0] - padding in milliseconds. This allows you to round up the result if it fits inside the threshold. Don't use in combination with {round: false} because the decimal output will include the padding.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.now().plus({ days: 1 }).toRelative() //=> "in 1 day"
   * @example DateTime.now().setLocale("es").toRelative({ days: 1 }) //=> "dentro de 1 día"
   * @example DateTime.now().plus({ days: 1 }).toRelative({ locale: "fr" }) //=> "dans 23 heures"
   * @example DateTime.now().minus({ days: 2 }).toRelative() //=> "2 days ago"
   * @example DateTime.now().minus({ days: 2 }).toRelative({ unit: "hours" }) //=> "48 hours ago"
   * @example DateTime.now().minus({ hours: 36 }).toRelative({ round: false }) //=> "1.5 days ago"
   */
  ;

  _proto.toRelative = function toRelative(options) {
    if (options === void 0) {
      options = {};
    }

    if (!this.isValid) return null;
    var base = options.base || DateTime.fromObject({
      zone: this.zone
    }),
        padding = options.padding ? this < base ? -options.padding : options.padding : 0;
    return diffRelative(base, this.plus(padding), Object.assign(options, {
      numeric: "always",
      units: ["years", "months", "days", "hours", "minutes", "seconds"]
    }));
  }
  /**
   * Returns a string representation of this date relative to today, such as "yesterday" or "next month".
   * Only internationalizes on platforms that supports Intl.RelativeTimeFormat.
   * @param {Object} options - options that affect the output
   * @param {DateTime} [options.base=DateTime.now()] - the DateTime to use as the basis to which this time is compared. Defaults to now.
   * @param {string} options.locale - override the locale of this DateTime
   * @param {string} options.unit - use a specific unit; if omitted, the method will pick the unit. Use one of "years", "quarters", "months", "weeks", or "days"
   * @param {string} options.numberingSystem - override the numberingSystem of this DateTime. The Intl system may choose not to honor this
   * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar() //=> "tomorrow"
   * @example DateTime.now().setLocale("es").plus({ days: 1 }).toRelative() //=> ""mañana"
   * @example DateTime.now().plus({ days: 1 }).toRelativeCalendar({ locale: "fr" }) //=> "demain"
   * @example DateTime.now().minus({ days: 2 }).toRelativeCalendar() //=> "2 days ago"
   */
  ;

  _proto.toRelativeCalendar = function toRelativeCalendar(options) {
    if (options === void 0) {
      options = {};
    }

    if (!this.isValid) return null;
    return diffRelative(options.base || DateTime.fromObject({
      zone: this.zone
    }), this, Object.assign(options, {
      numeric: "auto",
      units: ["years", "months", "days"],
      calendary: true
    }));
  }
  /**
   * Return the min of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the minimum
   * @return {DateTime} the min DateTime, or undefined if called with no argument
   */
  ;

  DateTime.min = function min() {
    for (var _len = arguments.length, dateTimes = new Array(_len), _key = 0; _key < _len; _key++) {
      dateTimes[_key] = arguments[_key];
    }

    if (!dateTimes.every(DateTime.isDateTime)) {
      throw new InvalidArgumentError("min requires all arguments be DateTimes");
    }

    return bestBy(dateTimes, function (i) {
      return i.valueOf();
    }, Math.min);
  }
  /**
   * Return the max of several date times
   * @param {...DateTime} dateTimes - the DateTimes from which to choose the maximum
   * @return {DateTime} the max DateTime, or undefined if called with no argument
   */
  ;

  DateTime.max = function max() {
    for (var _len2 = arguments.length, dateTimes = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      dateTimes[_key2] = arguments[_key2];
    }

    if (!dateTimes.every(DateTime.isDateTime)) {
      throw new InvalidArgumentError("max requires all arguments be DateTimes");
    }

    return bestBy(dateTimes, function (i) {
      return i.valueOf();
    }, Math.max);
  } // MISC

  /**
   * Explain how a string would be parsed by fromFormat()
   * @param {string} text - the string to parse
   * @param {string} fmt - the format the string is expected to be in (see description)
   * @param {Object} options - options taken by fromFormat()
   * @return {Object}
   */
  ;

  DateTime.fromFormatExplain = function fromFormatExplain(text, fmt, options) {
    if (options === void 0) {
      options = {};
    }

    var _options = options,
        _options$locale = _options.locale,
        locale = _options$locale === void 0 ? null : _options$locale,
        _options$numberingSys = _options.numberingSystem,
        numberingSystem = _options$numberingSys === void 0 ? null : _options$numberingSys,
        localeToUse = Locale.fromOpts({
      locale: locale,
      numberingSystem: numberingSystem,
      defaultToEN: true
    });
    return explainFromTokens(localeToUse, text, fmt);
  }
  /**
   * @deprecated use fromFormatExplain instead
   */
  ;

  DateTime.fromStringExplain = function fromStringExplain(text, fmt, options) {
    if (options === void 0) {
      options = {};
    }

    return DateTime.fromFormatExplain(text, fmt, options);
  } // FORMAT PRESETS

  /**
   * {@link toLocaleString} format like 10/14/1983
   * @type {Object}
   */
  ;

  _createClass(DateTime, [{
    key: "isValid",
    get: function get() {
      return this.invalid === null;
    }
    /**
     * Returns an error code if this DateTime is invalid, or null if the DateTime is valid
     * @type {string}
     */

  }, {
    key: "invalidReason",
    get: function get() {
      return this.invalid ? this.invalid.reason : null;
    }
    /**
     * Returns an explanation of why this DateTime became invalid, or null if the DateTime is valid
     * @type {string}
     */

  }, {
    key: "invalidExplanation",
    get: function get() {
      return this.invalid ? this.invalid.explanation : null;
    }
    /**
     * Get the locale of a DateTime, such 'en-GB'. The locale is used when formatting the DateTime
     *
     * @type {string}
     */

  }, {
    key: "locale",
    get: function get() {
      return this.isValid ? this.loc.locale : null;
    }
    /**
     * Get the numbering system of a DateTime, such 'beng'. The numbering system is used when formatting the DateTime
     *
     * @type {string}
     */

  }, {
    key: "numberingSystem",
    get: function get() {
      return this.isValid ? this.loc.numberingSystem : null;
    }
    /**
     * Get the output calendar of a DateTime, such 'islamic'. The output calendar is used when formatting the DateTime
     *
     * @type {string}
     */

  }, {
    key: "outputCalendar",
    get: function get() {
      return this.isValid ? this.loc.outputCalendar : null;
    }
    /**
     * Get the time zone associated with this DateTime.
     * @type {Zone}
     */

  }, {
    key: "zone",
    get: function get() {
      return this._zone;
    }
    /**
     * Get the name of the time zone.
     * @type {string}
     */

  }, {
    key: "zoneName",
    get: function get() {
      return this.isValid ? this.zone.name : null;
    }
    /**
     * Get the year
     * @example DateTime.local(2017, 5, 25).year //=> 2017
     * @type {number}
     */

  }, {
    key: "year",
    get: function get() {
      return this.isValid ? this.c.year : NaN;
    }
    /**
     * Get the quarter
     * @example DateTime.local(2017, 5, 25).quarter //=> 2
     * @type {number}
     */

  }, {
    key: "quarter",
    get: function get() {
      return this.isValid ? Math.ceil(this.c.month / 3) : NaN;
    }
    /**
     * Get the month (1-12).
     * @example DateTime.local(2017, 5, 25).month //=> 5
     * @type {number}
     */

  }, {
    key: "month",
    get: function get() {
      return this.isValid ? this.c.month : NaN;
    }
    /**
     * Get the day of the month (1-30ish).
     * @example DateTime.local(2017, 5, 25).day //=> 25
     * @type {number}
     */

  }, {
    key: "day",
    get: function get() {
      return this.isValid ? this.c.day : NaN;
    }
    /**
     * Get the hour of the day (0-23).
     * @example DateTime.local(2017, 5, 25, 9).hour //=> 9
     * @type {number}
     */

  }, {
    key: "hour",
    get: function get() {
      return this.isValid ? this.c.hour : NaN;
    }
    /**
     * Get the minute of the hour (0-59).
     * @example DateTime.local(2017, 5, 25, 9, 30).minute //=> 30
     * @type {number}
     */

  }, {
    key: "minute",
    get: function get() {
      return this.isValid ? this.c.minute : NaN;
    }
    /**
     * Get the second of the minute (0-59).
     * @example DateTime.local(2017, 5, 25, 9, 30, 52).second //=> 52
     * @type {number}
     */

  }, {
    key: "second",
    get: function get() {
      return this.isValid ? this.c.second : NaN;
    }
    /**
     * Get the millisecond of the second (0-999).
     * @example DateTime.local(2017, 5, 25, 9, 30, 52, 654).millisecond //=> 654
     * @type {number}
     */

  }, {
    key: "millisecond",
    get: function get() {
      return this.isValid ? this.c.millisecond : NaN;
    }
    /**
     * Get the week year
     * @see https://en.wikipedia.org/wiki/ISO_week_date
     * @example DateTime.local(2014, 11, 31).weekYear //=> 2015
     * @type {number}
     */

  }, {
    key: "weekYear",
    get: function get() {
      return this.isValid ? possiblyCachedWeekData(this).weekYear : NaN;
    }
    /**
     * Get the week number of the week year (1-52ish).
     * @see https://en.wikipedia.org/wiki/ISO_week_date
     * @example DateTime.local(2017, 5, 25).weekNumber //=> 21
     * @type {number}
     */

  }, {
    key: "weekNumber",
    get: function get() {
      return this.isValid ? possiblyCachedWeekData(this).weekNumber : NaN;
    }
    /**
     * Get the day of the week.
     * 1 is Monday and 7 is Sunday
     * @see https://en.wikipedia.org/wiki/ISO_week_date
     * @example DateTime.local(2014, 11, 31).weekday //=> 4
     * @type {number}
     */

  }, {
    key: "weekday",
    get: function get() {
      return this.isValid ? possiblyCachedWeekData(this).weekday : NaN;
    }
    /**
     * Get the ordinal (meaning the day of the year)
     * @example DateTime.local(2017, 5, 25).ordinal //=> 145
     * @type {number|DateTime}
     */

  }, {
    key: "ordinal",
    get: function get() {
      return this.isValid ? gregorianToOrdinal(this.c).ordinal : NaN;
    }
    /**
     * Get the human readable short month name, such as 'Oct'.
     * Defaults to the system's locale if no locale has been specified
     * @example DateTime.local(2017, 10, 30).monthShort //=> Oct
     * @type {string}
     */

  }, {
    key: "monthShort",
    get: function get() {
      return this.isValid ? Info.months("short", {
        locale: this.locale
      })[this.month - 1] : null;
    }
    /**
     * Get the human readable long month name, such as 'October'.
     * Defaults to the system's locale if no locale has been specified
     * @example DateTime.local(2017, 10, 30).monthLong //=> October
     * @type {string}
     */

  }, {
    key: "monthLong",
    get: function get() {
      return this.isValid ? Info.months("long", {
        locale: this.locale
      })[this.month - 1] : null;
    }
    /**
     * Get the human readable short weekday, such as 'Mon'.
     * Defaults to the system's locale if no locale has been specified
     * @example DateTime.local(2017, 10, 30).weekdayShort //=> Mon
     * @type {string}
     */

  }, {
    key: "weekdayShort",
    get: function get() {
      return this.isValid ? Info.weekdays("short", {
        locale: this.locale
      })[this.weekday - 1] : null;
    }
    /**
     * Get the human readable long weekday, such as 'Monday'.
     * Defaults to the system's locale if no locale has been specified
     * @example DateTime.local(2017, 10, 30).weekdayLong //=> Monday
     * @type {string}
     */

  }, {
    key: "weekdayLong",
    get: function get() {
      return this.isValid ? Info.weekdays("long", {
        locale: this.locale
      })[this.weekday - 1] : null;
    }
    /**
     * Get the UTC offset of this DateTime in minutes
     * @example DateTime.now().offset //=> -240
     * @example DateTime.utc().offset //=> 0
     * @type {number}
     */

  }, {
    key: "offset",
    get: function get() {
      return this.isValid ? +this.o : NaN;
    }
    /**
     * Get the short human name for the zone's current offset, for example "EST" or "EDT".
     * Defaults to the system's locale if no locale has been specified
     * @type {string}
     */

  }, {
    key: "offsetNameShort",
    get: function get() {
      if (this.isValid) {
        return this.zone.offsetName(this.ts, {
          format: "short",
          locale: this.locale
        });
      } else {
        return null;
      }
    }
    /**
     * Get the long human name for the zone's current offset, for example "Eastern Standard Time" or "Eastern Daylight Time".
     * Defaults to the system's locale if no locale has been specified
     * @type {string}
     */

  }, {
    key: "offsetNameLong",
    get: function get() {
      if (this.isValid) {
        return this.zone.offsetName(this.ts, {
          format: "long",
          locale: this.locale
        });
      } else {
        return null;
      }
    }
    /**
     * Get whether this zone's offset ever changes, as in a DST.
     * @type {boolean}
     */

  }, {
    key: "isOffsetFixed",
    get: function get() {
      return this.isValid ? this.zone.universal : null;
    }
    /**
     * Get whether the DateTime is in a DST.
     * @type {boolean}
     */

  }, {
    key: "isInDST",
    get: function get() {
      if (this.isOffsetFixed) {
        return false;
      } else {
        return this.offset > this.set({
          month: 1
        }).offset || this.offset > this.set({
          month: 5
        }).offset;
      }
    }
    /**
     * Returns true if this DateTime is in a leap year, false otherwise
     * @example DateTime.local(2016).isInLeapYear //=> true
     * @example DateTime.local(2013).isInLeapYear //=> false
     * @type {boolean}
     */

  }, {
    key: "isInLeapYear",
    get: function get() {
      return isLeapYear(this.year);
    }
    /**
     * Returns the number of days in this DateTime's month
     * @example DateTime.local(2016, 2).daysInMonth //=> 29
     * @example DateTime.local(2016, 3).daysInMonth //=> 31
     * @type {number}
     */

  }, {
    key: "daysInMonth",
    get: function get() {
      return daysInMonth(this.year, this.month);
    }
    /**
     * Returns the number of days in this DateTime's year
     * @example DateTime.local(2016).daysInYear //=> 366
     * @example DateTime.local(2013).daysInYear //=> 365
     * @type {number}
     */

  }, {
    key: "daysInYear",
    get: function get() {
      return this.isValid ? daysInYear(this.year) : NaN;
    }
    /**
     * Returns the number of weeks in this DateTime's year
     * @see https://en.wikipedia.org/wiki/ISO_week_date
     * @example DateTime.local(2004).weeksInWeekYear //=> 53
     * @example DateTime.local(2013).weeksInWeekYear //=> 52
     * @type {number}
     */

  }, {
    key: "weeksInWeekYear",
    get: function get() {
      return this.isValid ? weeksInWeekYear(this.weekYear) : NaN;
    }
  }], [{
    key: "DATE_SHORT",
    get: function get() {
      return DATE_SHORT;
    }
    /**
     * {@link toLocaleString} format like 'Oct 14, 1983'
     * @type {Object}
     */

  }, {
    key: "DATE_MED",
    get: function get() {
      return DATE_MED;
    }
    /**
     * {@link toLocaleString} format like 'Fri, Oct 14, 1983'
     * @type {Object}
     */

  }, {
    key: "DATE_MED_WITH_WEEKDAY",
    get: function get() {
      return DATE_MED_WITH_WEEKDAY;
    }
    /**
     * {@link toLocaleString} format like 'October 14, 1983'
     * @type {Object}
     */

  }, {
    key: "DATE_FULL",
    get: function get() {
      return DATE_FULL;
    }
    /**
     * {@link toLocaleString} format like 'Tuesday, October 14, 1983'
     * @type {Object}
     */

  }, {
    key: "DATE_HUGE",
    get: function get() {
      return DATE_HUGE;
    }
    /**
     * {@link toLocaleString} format like '09:30 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "TIME_SIMPLE",
    get: function get() {
      return TIME_SIMPLE;
    }
    /**
     * {@link toLocaleString} format like '09:30:23 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "TIME_WITH_SECONDS",
    get: function get() {
      return TIME_WITH_SECONDS;
    }
    /**
     * {@link toLocaleString} format like '09:30:23 AM EDT'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "TIME_WITH_SHORT_OFFSET",
    get: function get() {
      return TIME_WITH_SHORT_OFFSET;
    }
    /**
     * {@link toLocaleString} format like '09:30:23 AM Eastern Daylight Time'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "TIME_WITH_LONG_OFFSET",
    get: function get() {
      return TIME_WITH_LONG_OFFSET;
    }
    /**
     * {@link toLocaleString} format like '09:30', always 24-hour.
     * @type {Object}
     */

  }, {
    key: "TIME_24_SIMPLE",
    get: function get() {
      return TIME_24_SIMPLE;
    }
    /**
     * {@link toLocaleString} format like '09:30:23', always 24-hour.
     * @type {Object}
     */

  }, {
    key: "TIME_24_WITH_SECONDS",
    get: function get() {
      return TIME_24_WITH_SECONDS;
    }
    /**
     * {@link toLocaleString} format like '09:30:23 EDT', always 24-hour.
     * @type {Object}
     */

  }, {
    key: "TIME_24_WITH_SHORT_OFFSET",
    get: function get() {
      return TIME_24_WITH_SHORT_OFFSET;
    }
    /**
     * {@link toLocaleString} format like '09:30:23 Eastern Daylight Time', always 24-hour.
     * @type {Object}
     */

  }, {
    key: "TIME_24_WITH_LONG_OFFSET",
    get: function get() {
      return TIME_24_WITH_LONG_OFFSET;
    }
    /**
     * {@link toLocaleString} format like '10/14/1983, 9:30 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_SHORT",
    get: function get() {
      return DATETIME_SHORT;
    }
    /**
     * {@link toLocaleString} format like '10/14/1983, 9:30:33 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_SHORT_WITH_SECONDS",
    get: function get() {
      return DATETIME_SHORT_WITH_SECONDS;
    }
    /**
     * {@link toLocaleString} format like 'Oct 14, 1983, 9:30 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_MED",
    get: function get() {
      return DATETIME_MED;
    }
    /**
     * {@link toLocaleString} format like 'Oct 14, 1983, 9:30:33 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_MED_WITH_SECONDS",
    get: function get() {
      return DATETIME_MED_WITH_SECONDS;
    }
    /**
     * {@link toLocaleString} format like 'Fri, 14 Oct 1983, 9:30 AM'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_MED_WITH_WEEKDAY",
    get: function get() {
      return DATETIME_MED_WITH_WEEKDAY;
    }
    /**
     * {@link toLocaleString} format like 'October 14, 1983, 9:30 AM EDT'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_FULL",
    get: function get() {
      return DATETIME_FULL;
    }
    /**
     * {@link toLocaleString} format like 'October 14, 1983, 9:30:33 AM EDT'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_FULL_WITH_SECONDS",
    get: function get() {
      return DATETIME_FULL_WITH_SECONDS;
    }
    /**
     * {@link toLocaleString} format like 'Friday, October 14, 1983, 9:30 AM Eastern Daylight Time'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_HUGE",
    get: function get() {
      return DATETIME_HUGE;
    }
    /**
     * {@link toLocaleString} format like 'Friday, October 14, 1983, 9:30:33 AM Eastern Daylight Time'. Only 12-hour if the locale is.
     * @type {Object}
     */

  }, {
    key: "DATETIME_HUGE_WITH_SECONDS",
    get: function get() {
      return DATETIME_HUGE_WITH_SECONDS;
    }
  }]);

  return DateTime;
}();
function friendlyDateTime(dateTimeish) {
  if (DateTime.isDateTime(dateTimeish)) {
    return dateTimeish;
  } else if (dateTimeish && dateTimeish.valueOf && isNumber(dateTimeish.valueOf())) {
    return DateTime.fromJSDate(dateTimeish);
  } else if (dateTimeish && typeof dateTimeish === "object") {
    return DateTime.fromObject(dateTimeish);
  } else {
    throw new InvalidArgumentError("Unknown datetime argument: " + dateTimeish + ", of type " + typeof dateTimeish);
  }
}

var VERSION = "1.26.0";

exports.DateTime = DateTime;
exports.Duration = Duration;
exports.FixedOffsetZone = FixedOffsetZone;
exports.IANAZone = IANAZone;
exports.Info = Info;
exports.Interval = Interval;
exports.InvalidZone = InvalidZone;
exports.LocalZone = LocalZone;
exports.Settings = Settings;
exports.VERSION = VERSION;
exports.Zone = Zone;


},{}],88:[function(require,module,exports){
(function (global){(function (){
/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __spreadArrays;
var __spreadArray;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
var __classPrivateFieldGet;
var __classPrivateFieldSet;
var __createBinding;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };

    __extends = function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function(m, o) {
        for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
    };

    __createBinding = Object.create ? (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
    }) : (function(o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
    });

    __values = function (o) {
        var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    /** @deprecated */
    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    /** @deprecated */
    __spreadArrays = function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    };

    __spreadArray = function (to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator], i;
        return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    var __setModuleDefault = Object.create ? (function(o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
        o["default"] = v;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
        __setModuleDefault(result, mod);
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    __classPrivateFieldGet = function (receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    };

    __classPrivateFieldSet = function (receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__createBinding", __createBinding);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__spreadArray", __spreadArray);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
    exporter("__classPrivateFieldGet", __classPrivateFieldGet);
    exporter("__classPrivateFieldSet", __classPrivateFieldSet);
});

}).call(this)}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},[1])