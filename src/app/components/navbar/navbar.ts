import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar-style.css',
})
export class Navbar implements AfterViewInit {
  @ViewChild('nav') nav!: ElementRef;
  @ViewChild('underline') underline!: ElementRef;

  constructor(private router: Router) {}
  ngAfterViewInit() {
    this.moveUnderline();

    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
      setTimeout(() => this.moveUnderline());
    });
  }

  moveUnderline() {
    console.log('Moving underline!');
    const active = this.nav.nativeElement.querySelector('.active-link');
    console.log(active);
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
