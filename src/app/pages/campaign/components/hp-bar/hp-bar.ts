import { Component, computed, input, OnInit } from '@angular/core';

@Component({
  selector: 'app-hp-bar',
  imports: [],
  templateUrl: './hp-bar.html',
  styles: ``,
})
export class HPBar {
  currentHP = input.required<number>();
  enemyMAXHP = input.required<number>();

  SEGMENTS = 20;

  private _segmentHP = computed(() => this.enemyMAXHP() / this.SEGMENTS);
  private _activeSegmentsCount = computed(() => {
    return Math.floor(this.currentHP() / this._segmentHP());
  });

  segments = computed(() => {
    const activeCount = this._activeSegmentsCount();
    return Array.from({ length: this.SEGMENTS }, (_, i) => ({
      isActive: i < activeCount,
    }));
  });
}
