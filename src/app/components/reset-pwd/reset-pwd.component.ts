import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-reset-pwd',
  templateUrl: './reset-pwd.component.html',
  styleUrls: ['./reset-pwd.component.css']
})
export class ResetPwdComponent {
  isOkPassLen: boolean = false; 
  isOkPassNum: boolean = false; 
  isOkPassConfirm: boolean = false;


  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute) { }

  toggleOk(password: string, passwordConfirm: string) { 

  password = password.trim(); 
  passwordConfirm = passwordConfirm.trim();
  const id = this.route.snapshot.paramMap.get("id")?.replace(":", '');
  const token = this.route.snapshot.paramMap.get("token")?.replace(':', '');

  if(password.length >0 && password==passwordConfirm && token!=null && id != null){
    this.userService.submitNewPassword(token, password, id).subscribe(res =>{ 
      if((res as any).ok === false){
        this.router.navigate([''])
      }else{
        document.getElementById("Message")!.style.color = "green";
        document.getElementById("Message")!.innerHTML = "Password successfully changed!!! You will be redirected to the homepage shortly..."
        setTimeout(() => {
          this.router.navigate(['']);
      }, 3000);
      }
      
      }); 
    
  }else{
    document.getElementById("Message")!.style.color = "red";
    document.getElementById("Message")!.innerHTML = "The passwords don't match. Please try again."
  }

}

  validatePass(pass: string){ 
    if(pass.length >=8 ){
      this.isOkPassLen = true;
    }else{
      this.isOkPassLen = false;
    }if(pass.match(new RegExp('(?=.*\\d)'))){
      this.isOkPassNum = true;
    }else{
      this.isOkPassNum = false;
  }
}

validatePassConfirm(pass: string){ 
if(pass.length >0 ){
  this.isOkPassConfirm = true;
}else{
  this.isOkPassConfirm = false;
}
}

//button disabler 
  checkButton() { 
    if (!this.isOkPassLen  || !this.isOkPassNum || !this.isOkPassConfirm) { 
      return true; //disable button 
    } else {
      return false;
    }
  }
  

}
