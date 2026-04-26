import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [NgClass],
  template: `
    <div 
      class="skeleton" 
      [ngClass]="className"
      [style.height]="height"
      [style.width]="width"
    ></div>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class SkeletonComponent {
  @Input() className: string = '';
  @Input() height: string = '1rem';
  @Input() width: string = '100%';
}