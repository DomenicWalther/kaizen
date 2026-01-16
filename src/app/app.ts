import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { StoreUserService } from './services/store-user-service';
import { AutoSaveService } from './services/autosave-service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
})
export class App implements OnInit, OnDestroy {
  constructor(private autoSaveService: AutoSaveService) {}

  ngOnInit() {
    this.autoSaveService.startAutoSave();
  }

  ngOnDestroy() {
    this.autoSaveService.stopAutoSave();
  }
  _ = inject(StoreUserService);
}
