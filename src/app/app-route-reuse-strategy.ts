import { ActivatedRouteSnapshot, DetachedRouteHandle, RouteReuseStrategy } from '@angular/router';

export class AppRouteReuseStrategy implements RouteReuseStrategy {
  handlers: {[key: string]: DetachedRouteHandle} = {};

  //currently storing all routes - reset pwd has no need to 
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
        return true;
  }

  /*
  when a route is stored (= deactivated) , check if == 'about' or 'home' 
  if is, disable resize events listener
  fired twice each time there's route switching between two previously stored routes: one time for the route being deactivated, and one time for the route being activated.
  for the route being deactivated, handle is not null. For the activated, it is.
  */
  store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
      this.handlers[route.routeConfig!.path!] = handle;
      if(handle!=null){
        const routePath = route.routeConfig!.path;
        if(routePath == 'about' || routePath == ''){ 
          (this.handlers[routePath] as any).componentRef?.instance.disableResizeEventListener();
        }
      }
  }
  
  //when a route is about to be activated, checks if route is stored. if is, retrieve it
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
      return !!route.routeConfig && !!this.handlers[route.routeConfig!.path!]; 
  }

  /*
  when a route is retrieved (ie reactivated), check if == 'about or '', 
  if is, resize route and enable resize event listener
  may be fired multiple times ->so about and home comp subscribe to router events on onRouteReactivation 
  */
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle|null {
      if (!route.routeConfig) return null;
      var routePath = route.routeConfig!.path;
      if(routePath == 'about' || routePath == ''){ 
        (this.handlers[routePath] as any).componentRef?.instance.onRouteReactivation()
      }
      return this.handlers[route.routeConfig.path!];
  }

  shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
      return future.routeConfig === curr.routeConfig;
  }

}