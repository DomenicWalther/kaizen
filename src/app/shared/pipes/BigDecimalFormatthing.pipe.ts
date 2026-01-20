import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'BigDecimalFormat',
})
export class BigDecimalFormat implements PipeTransform {
  transform(value: number): string {
    const formatted = Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
    return formatted;
  }
}
