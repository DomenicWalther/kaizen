import { Component, OnInit } from '@angular/core';
import { ClerkService } from '../../../services/clerk.service';
import {
  CvaUnauthenticatedDirective,
  CvaAuthenticatedDirective,
  CvaAuthLoadingDirective,
  injectAuth,
} from 'convex-angular';

@Component({
  selector: 'app-login',
  imports: [CvaUnauthenticatedDirective, CvaAuthenticatedDirective, CvaAuthLoadingDirective],
  templateUrl: './login.html',
  styles: ``,
})
export class Login {
  auth = injectAuth();

  constructor(private clerk: ClerkService) {}

  signIn() {
    this.clerk.openSignIn();
  }

  signUp() {
    this.clerk.openSignUp();
  }
  signOut() {
    this.clerk.signOut();
  }
}
