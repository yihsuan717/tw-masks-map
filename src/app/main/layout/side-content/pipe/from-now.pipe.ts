import { Pipe, PipeTransform } from '@angular/core';
import * as dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-tw';

@Pipe({
  name: 'fromNow'
})
export class FromNowPipe implements PipeTransform {

  transform(value: any): string {
    const d = new Date(value);
    dayjs.extend(relativeTime);
    return d ? dayjs().locale('zh-tw').from(dayjs(d)) : value;
  }

}
