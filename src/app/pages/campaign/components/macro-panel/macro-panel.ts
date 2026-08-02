import { Component, inject, signal } from '@angular/core';
import { CharacterService } from '../../../../services/character-service';
import { MacroService } from '../../../../services/macro-service';

@Component({
  selector: 'app-macro-panel',
  imports: [],
  templateUrl: './macro-panel.html',
})
export class MacroPanel {
  readonly macroService = inject(MacroService);
  readonly characterService = inject(CharacterService);
  readonly stageTarget = signal(20);

  updateStageTarget(event: Event): void {
    const input = event.target as HTMLInputElement;
    const target = Number(input.value);
    this.stageTarget.set(Number.isFinite(target) ? target : 1);
  }

  addReachStage(): void {
    this.macroService.addReachStage(this.stageTarget());
  }

  toggleLooping(): void {
    this.macroService.setLooping(!this.macroService.isLooping());
  }

  toggleRun(): void {
    if (this.macroService.isRunning()) {
      this.macroService.stop();
    } else {
      this.macroService.start();
    }
  }
}
