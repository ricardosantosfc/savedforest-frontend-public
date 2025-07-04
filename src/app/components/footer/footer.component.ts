import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  isLandscapeMode= false

  constructor(public router: Router) { } // accessed through the html so the background-color changes depending on the route
  ngOnInit() {
    
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      this.checkLandscapeMode();
      window.addEventListener('resize', this.checkLandscapeMode.bind(this));
    }
    
}

checkLandscapeMode() {
  switch (screen.orientation.type) {
    case "portrait-secondary":
    case "portrait-primary":
      this.isLandscapeMode = false;
      
      break;
    case "landscape-primary":
    case "landscape-secondary":
      this.isLandscapeMode=true;
    
      break;
    default:
      //console.log("The orientation API isn't supported in this browser :(");
  } 
}
}
