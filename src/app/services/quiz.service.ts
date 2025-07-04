import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { timeout, tap, catchError, Observable, of, retry, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuizService {

  private sendQuizUrl = "/api/quiz"
  private sendFinalQuizAndSetFinalBadgeUrl = "/api/quizSetFinalBadge"

  //private sendQuizUrl  = "http://localhost:3000/quiz" 
  //private sendFinalQuizAndSetFinalBadgeUrl = "http://localhost:3000/quizSetFinalBadge"

   httpOptions = { 
    headers: new HttpHeaders({ "Content-Type": "application/json" } ), withCredentials: true
  }; 

  constructor(
    private http: HttpClient
  ) { }

  sendQuiz(quiz: number, score: number, badge: number, unityInstance: any) {
    const body = { quiz, score, badge }; 
    return this.http.post(this.sendQuizUrl, body, this.httpOptions).pipe(
      timeout(80000),
      retry(3), 
      tap(() => unityInstance.SendMessage('BrowserController', 'SendQuizSuccess')),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          unityInstance.SendMessage('BrowserController', 'FailureShowWarning',
            "The server took too long to respond. Sorry for the inconvenience. Trying to reconnect...")
          return throwError(() => error);
        }
        return this.handleError<JSON>(unityInstance, 0)(error);
      })
    );
  }

  sendFinalQuizAndSetFinalBadge(score: number, badge: number, unityInstance: any) {
    const body = { score: score, badge: badge}; 
    return this.http.post(this.sendFinalQuizAndSetFinalBadgeUrl, body, this.httpOptions).pipe(
      timeout(80000),
      retry(3), 
      tap(() => unityInstance.SendMessage('BrowserController', 'SendQuizSuccess')),
      catchError(error => {
        if (error.name === 'TimeoutError') {
          unityInstance.SendMessage('BrowserController', 'FailureShowWarning',
            "The server took too long to respond. Sorry for the inconvenience. Trying to reconnect...")
          return throwError(() => error);
        }
        return this.handleError<JSON>(unityInstance, 0)(error);
      })
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
            unityInstance.SendMessage('BrowserController', 'FailureRefreshScene',
            "The server took too long to respond. Please try again. Sorry for the inconvenience.") //
            //this introduces an exploitable though, user can just urn off the internet and replay until gets good score, then turn again
          }else{
            unityInstance.SendMessage('BrowserController', 'FailureRefreshScene',
            "The server took too long to respond. Sorry for the inconvenience.")
          }  
        }else if(error.status == 403 ){
          unityInstance.SendMessage('BrowserController', 'FailureReturnToTitleScreen',
          "This session has expired or has been revoked. Please log in again.")
        }else{
          if(op == 0){
            unityInstance.SendMessage('BrowserController', 'FailureRefreshScene',
            "There has been an error in the server. Please try again. Sorry for the inconvenience.")
          }else{
            unityInstance.SendMessage('BrowserController', 'FailureRefreshScene',
            "There has been an error in the server. Sorry for the inconvenience.")
          }  
        }
        
        // Let the app keep running by returning an empty result.
        return of(result as T);
      };
    }
  
  }
