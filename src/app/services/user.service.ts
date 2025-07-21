import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { catchError, tap, timeout } from "rxjs/operators";
import { User } from "../interfaces/user";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  //1st party cookie, as request circumvents the different domain and the browser treats it as a same domain 
  //via rewritee rule on render
  private sendLoginUrl = "/api/login"; 
  private sendSignupUrl = "/api/signup"; 
  private sendLogoutUrl = "/api/logout/";
  private sendResetPasswordRequestUrl = "/api/resetPwdRequest";
  private sendNewPasswordUrl = "/api/newPwdSubmit";
 
  /* 
  private sendLoginUrl = "http://localhost:3000/login"; 
  private sendSignupUrl = "http://localhost:3000/signup"; 
  private sendLogoutUrl = "http://localhost:3000/logout/";
  private sendResetPasswordRequestUrl = "http://localhost:3000/resetPwdRequest"
  private sendNewPasswordUrl = "http://localhost:3000/newPwdSubmit"
  */


  httpOptions = { 
    headers: new HttpHeaders({ "Content-Type": "application/json" } ), withCredentials: true
  };

  constructor(private http: HttpClient) { }

  sendSignup(user: User, unityInstance: any) {
    return this.http.post(this.sendSignupUrl, user, this.httpOptions).pipe(
      timeout(90000),
      tap(() => unityInstance.SendMessage('BrowserController', 'SendSignupSuccess')),
      catchError(this.handleError<JSON>(1,unityInstance)) 
    );
  }

  sendLogin(user: User, unityInstance: any) {
    return this.http.post(this.sendLoginUrl, user, this.httpOptions).pipe(
      timeout(90000),
      tap((res: any) => unityInstance.SendMessage('BrowserController', 'SendLoginSuccess', res.currentScene+ "," +
      res.score +","+  res.badges + "," + res.username + "," + res.finishedGame + "," + res.maxScore)),
      catchError(this.handleError<JSON>(2,unityInstance))
    );
  }

  sendResetPassword(email: string, unityInstance: any ) {
    const body = { email: email };
    return this.http.post(this.sendResetPasswordRequestUrl, body, this.httpOptions).pipe(
      timeout(80000),
      tap(() => unityInstance.SendMessage('BrowserController', 'SendResetPasswordSuccess')), 
      catchError(this.handleError<JSON>(3,unityInstance)) 
    );
  }

  submitNewPassword(token: string, password: string, id: string){
    const body = { token: token, password: password, id: id};
    return this.http.post(this.sendNewPasswordUrl, body, this.httpOptions).pipe(
      timeout(80000),
      catchError(this.handleError<JSON>(4,null))
    );
  }


  sendLogout (unityInstance: any) {
    const body= ""; //to avoid any errors
    return this.http.post<JSON>(this.sendLogoutUrl, body, this.httpOptions).pipe(
        timeout(80000),
        tap(() => unityInstance.SendMessage('BrowserController', 'SendLogoutSuccess')),
        catchError(this.handleError<JSON>(5,unityInstance))
      );
  }


  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
   private handleError<T>(op: number, unityInstance: any,  result?: T) {
    return (error: any): Observable<T> => {
      
      if(op == 4){
        alert("This link is no longer valid. Please request a new password reset.");
        return of(error as T);
      }
      if (error.name === 'TimeoutError') {
          unityInstance.SendMessage('BrowserController', 'FailureShowWarning',
          "The server took too long to respond. Please try again. Sorry for the inconvenience.")
        
      }else if(error.status == 401 ){
        unityInstance.SendMessage('BrowserController', 'FailureShowWarning',
        "Wrong nickname or password.")

      }else if(error.status == 422){ 
        unityInstance.SendMessage('BrowserController', 'FailureSignupEmail', 
        "An account with this email already exists."); 
      
      }else if(error.status == 403 ){ 
        unityInstance.SendMessage('BrowserController', 'FailureReturnToTitleScreen',
        "This session has expired or has been revoked.\nPlease log in again.")
      }else{
         unityInstance.SendMessage('BrowserController', 'FailureShowWarning',
         "There has been an error in the server. Please try again later.");
        }
    
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
