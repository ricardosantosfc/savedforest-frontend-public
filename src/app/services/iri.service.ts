import { Injectable } from '@angular/core';
import { IRI } from '../interfaces/iri';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, tap, timeout } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class IriService {
  
  private sendIRIurl = "/api/iri";  
  private updateScoreAndSceneIRIulr = "/api/updateScoreIRI"

  //private sendIRIurl = "http://localhost:3000/iri"; 
  //private updateScoreAndSceneIRIulr = "http://localhost:3000/updateScoreIRI"
  
  //with credentials to include auth cookie on requests
  httpOptions = { 
    headers: new HttpHeaders({ "Content-Type": "application/json" } ), withCredentials: true
  }; 
  
  constructor(
    private http: HttpClient
  ) { }
  
  sendIRI(iri: IRI, unityInstance: any) {
    return this.http.post(this.sendIRIurl, iri, this.httpOptions).pipe(
      timeout(80000),
      tap(() => unityInstance.SendMessage('BrowserController', 'SendIRISuccess')), 
      catchError(this.handleError<JSON>(unityInstance,0)),
    );
  }

  updateScoreAndSceneIRI(unityInstance: any) {
    const body= ""; //to avoid any errors
    return this.http.post(this.updateScoreAndSceneIRIulr, body, this.httpOptions).pipe(
      timeout(80000),
      tap((res: any) => unityInstance.SendMessage('BrowserController', 'UpdateScoreAndSceneIRISuccess', res.maxScore)), 
      catchError(this.handleError<JSON>(unityInstance,1)) 
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param op - number of the operation that failed
   * @param result - optional value to return as the observable result
   */
   private handleError<T>(unityInstance: any, op:number, result?: T) {

    return (error: any): Observable<T> => {
      if (error.name === 'TimeoutError') {
        if(op == 0){
          unityInstance.SendMessage('BrowserController', 'FailureShowWarning',
           "The server took too long to respond. Please try again. Sorry for the inconvenience.")
        }else{
          unityInstance.SendMessage('BrowserController', 'FailureRefreshScene',
          "The server took too long to respond. Sorry for the inconvenience.")
        }  
      }else if(error.status == 403 ){ 
        unityInstance.SendMessage('BrowserController', 'FailureReturnToTitleScreen', 
        "This session has expired or has been revoked.\nPlease log in again.")
      }else{
        if(op == 0){
          unityInstance.SendMessage('BrowserController', 'FailureShowWarning',
          "There has been an error in the server. Please try again later.")
        }else{
          unityInstance.SendMessage('BrowserController', 'FailureRefreshScene',
          "There has been an error in the server. Please try again later.")
        }  
      }
      
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}



