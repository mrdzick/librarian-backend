import * as moment from 'moment';

export class DateUtil {
  static getDaysDifference(date1: Date, date2: Date): number {
    const moment1 = moment(date1);
    const moment2 = moment(date2);
    return Math.abs(moment1.diff(moment2, 'days'));
  }

  static addDays(date: Date, days: number): Date {
    return moment(date).add(days, 'days').toDate();
  }
}