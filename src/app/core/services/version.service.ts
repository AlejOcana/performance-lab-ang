import { Injectable, signal } from '@angular/core';
import type { Version } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  readonly version = signal<Version>('unoptimized');

  setVersion(version: Version): void {
    this.version.set(version);
  }

  toggleVersion(): void {
    this.version.update(v => v === 'optimized' ? 'unoptimized' : 'optimized');
  }
}