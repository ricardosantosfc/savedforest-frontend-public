import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Unity instance will throw an error and stop loading if the user swtiches to another route as its loading.
 * To prevent that, its better to only show the navbar-items that allow route swtiching once the game has finished loading,
 * so use this service to control that
 * Simple service to "access" the navbar through the home component. basically holds a boolean that by default is true 
 * (so that if someone by chance accesses the website first trhough the how to play or about routes the navbar is still shown),
 * but on the home component it will be turned false at the beggining of the route render, and will turn true
 * once the unity instance of the home component has finished loading. 
 * it could also be left as false by default, but that would require this service to be injected also on the other routes.
 * the navbar component is subscribd to this boolean, so that when it changes,the navbar items show up 
 */
@Injectable({
  providedIn: 'root'
})
export class NavbarService {

  showNavItemsSubject = new BehaviorSubject<boolean>(true);

  constructor() { }

  toggleNavItems(bool : boolean): void {
    this.showNavItemsSubject.next(bool);
  }
  
}

