import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'docTypeName',
})
export class DocTypeNamePipe implements PipeTransform {

  transform(value: string): string {
    switch (value) {
      case 'class':
        return '类';
      case 'function':
        return '函数';
      default:
        return value;
    }
  }

}
