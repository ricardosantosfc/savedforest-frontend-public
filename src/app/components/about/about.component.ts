import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivationEnd, Router } from '@angular/router';
import { filter, Subscription, take } from 'rxjs';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements AfterViewInit{
 
  @ViewChild('bigImage')
  bigImage!: ElementRef;
  @ViewChild('textOverlay')
  overlay!: ElementRef;
  currHeightImage = 0;
  constructor( private router: Router) { }

  // BUG: on Firefox, background image doesn't scale correctly when this route is accessed directly via its URL (Only happens on initial load.).
  // Works fine in Chrome and Opera.  setting up a timeout fixes it, but rendering not smooth
    
  ngAfterViewInit() {
   this.resizeComponent();
   this.enableResizeEventListener();
  }

    enableResizeEventListener(){
      (window as any).onresize = () => {
        this.resizeComponent();
      
      };
    }

  resizeComponent(){
    const overlayHeight = this.overlay.nativeElement.offsetHeight;
    this.bigImage.nativeElement.style.height = `${overlayHeight+173.483}px`; // Set the calculated height for the background image
    this.currHeightImage = overlayHeight+173.483 ;
  }

    //Called by route-reuse-strategy when route is deactivated
    disableResizeEventListener(){
      (window as any).onresize = null;

  }
  
  //When returning from another route, trigger resize, and re-enable listener
  sub?: Subscription;
  onRouteReactivation() {
    if (this.sub && !this.sub.closed) return;
    this.sub = this.router.events
      .pipe(
        filter(e => e instanceof ActivationEnd),
        take(1)
      )
      .subscribe(e => {
        this.resizeComponent(); //maybe redundance: fired everytime the user comes back, even when there hasnt been any size change.
        this.enableResizeEventListener();
      });
  }
  
  }



