import { Injectable } from '@angular/core';
import { SAM } from '../interfaces/sam';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, tap, timeout } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class SamService {
 
  private sendSAMurl = "/api/sam"; 
  private updateScoreAndSceneSAMurl = "/api/updateScoreSam"

  //private sendSAMurl = "http://localhost:3000/sam";
  //private updateScoreAndSceneSAMurl = "http://localhost:3000/updateScoreSam"

  httpOptions = { 
    headers: new HttpHeaders({ "Content-Type": "application/json" } ), withCredentials: true
  }; 

  constructor(
    private http: HttpClient
  ) { }

  sendSAM(sam: SAM, unityInstance: any) {
    return this.http.post(this.sendSAMurl, sam, this.httpOptions).pipe(
      timeout(80000),
      tap(() => unityInstance.SendMessage('BrowserController', 'SendSAMSuccess')), 
      catchError(this.handleError<JSON>(unityInstance, 0)) 
    );
  }

  updateScoreAndSceneSAM(nextScene : number, score: number, unityInstance: any) {
    const body = {nextScene: nextScene, score:score};
    return this.http.post(this.updateScoreAndSceneSAMurl, body, this.httpOptions).pipe(
      timeout(80000),
      tap(() => unityInstance.SendMessage('BrowserController', 'SendSAMSuccess')),
      catchError(this.handleError<JSON>( unityInstance, 1)) 
    );
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
   private handleError<T>(unityInstance: any,  op: number, result?: T) {
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
          "There has been an error in the server.")
        }  
      }
      
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}



