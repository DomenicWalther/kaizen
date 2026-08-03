import {
  AfterViewInit,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  ViewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { AutoSaveService } from '../../services/autosave-service';
import { DebugMenu } from '../debug-menu/debug-menu';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, DebugMenu],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './navbar-style.css',
})
export class Navbar implements AfterViewInit {
  private readonly destroyRef = inject(DestroyRef);
  @ViewChild('nav') nav!: ElementRef;
  @ViewChild('underline') underline!: ElementRef;

  constructor(
    private router: Router,
    readonly autoSaveService: AutoSaveService,
  ) {}

  async saveNow() {
    try {
      await this.autoSaveService.saveNow();
    } catch {
      // The service exposes the error state for the navbar; no further action is needed here.
    }
  }
  ngAfterViewInit() {
    this.moveUnderline();

    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        setTimeout(() => this.moveUnderline());
      });
  }

  moveUnderline() {
    const active = this.nav.nativeElement.querySelector('.active-link');
    if (!active) return;

    const rect = active.getBoundingClientRect();
    const parentRect = this.nav.nativeElement.getBoundingClientRect();

    const left = rect.left - parentRect.left;
    const width = rect.width;

    const el = this.underline.nativeElement;
    el.style.left = `${left}px`;
    el.style.width = `${width}px`;
  }
}
