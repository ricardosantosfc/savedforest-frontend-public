import { Component, OnInit } from '@angular/core';
import {User} from "src/app/interfaces/user";
import { UserService } from "src/app/services/user.service";
import {SAM} from "src/app/interfaces/sam";
import { SamService } from "src/app/services/sam.service";
import {IRI_AES} from "src/app/interfaces/iri-aes";
import { IriAesService } from "src/app/services/iri-aes.service";
import { NavbarService } from '../../services/navbar.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { ActivationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/internal/operators/filter';
import { take } from 'rxjs/internal/operators/take';
import { QuizService } from 'src/app/services/quiz.service';
import { MobileFormsService } from 'src/app/services/mobile-forms.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  private hasShownPopupWarning = false;
  myGameInstance = null;
  currentWindowWidth = -1;
  isLoading= true;
  isMobile=false;
  isPortrait = false;
  canvasRef!: HTMLElement;
  containerRef!: HTMLElement;
  rootDivRef:HTMLElement | undefined ;
 
  constructor(private userService: UserService, private samService: SamService, private iriAesService: IriAesService,
    private quizService : QuizService, private mobileFormsService : MobileFormsService,
    private navbarService: NavbarService, private router: Router) { }
    
  ngOnInit(): void {

    this.navbarService.toggleNavItems(false); //turn navbar off 
    const paragraph = document.querySelector('hover-underline-animation');
    paragraph?.classList.add('initial-underline');
    
    var buildUrl = "assets/Build";
    var config = {
      //non decompression fallback build for local testing: 
      //dataUrl: buildUrl + "/v29_for_local_testing.data.unityweb",
      //frameworkUrl: buildUrl + "/v29_for_local_testing.framework.js.unityweb",
      //codeUrl: buildUrl + "/v29_for_local_testing.wasm.unityweb",
      dataUrl: buildUrl + "/v29enabledtest.data.br",
      frameworkUrl: buildUrl + "/v29enabledtest.framework.js.br",
      codeUrl: buildUrl + "/v29enabledtest.wasm.br",
      streamingAssetsUrl: "StreamingAssets",
      companyName: "saveDforest",
      productName: "saveDforest 1",
      productVersion: "v1.1",
      devicePixelRatio: 0 //= 1 to lower resolution on mobile for +performancce, but not worthy atm
    };
    //matchWebGLToCanvasSize = false; // "if you want to decouple this synchronization from happening inside the engine, 
    //and you would instead like to size up the canvas DOM size and WebGL render target sizes yourself"
    // - but also lowers the resoultion

    var container : HTMLElement = document.querySelector("#unity-container") || new HTMLElement();
    var canvas : HTMLElement = document.querySelector("#unity-canvas") || new HTMLElement();
    var loadingBar : HTMLElement = document.querySelector("#unity-loading-bar") || new HTMLElement();
    var progressBarFull : HTMLElement = document.querySelector("#unity-progress-bar-full") || new HTMLElement();
    var fullscreenButton : HTMLElement = document.querySelector("#unity-fullscreen-button") || new HTMLElement();
    var rootDiv : HTMLElement = document.querySelector("#rootDiv") || new HTMLElement();

    this.canvasRef = canvas;
    this.containerRef = container;

    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
     
      this.isMobile = true;

      this.rootDivRef=rootDiv;
      
      var meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, height=device-height, initial-scale=1.0, user-scalable=no, shrink-to-fit=yes';
      document.getElementsByTagName('head')[0].appendChild(meta);
      container.className = "unity-mobile";

      this.currentWindowWidth = this.adjustCanvasMobile();
      
    } else { 
      
      this.adjustCanvasDesktop();
    
    }

    //centering the loading bar div 
    loadingBar.style.top =canvas.offsetHeight/2 + "px";
    loadingBar.style.display = "block";
    
    createUnityInstance(canvas, config, (progress: any) => { 
      //const percentage = Math.floor(progress * 100);
      //this.loadingText.nativeElement.textContent = `${percentage}%`; -> worthless as its not accurate
    }).then((unityInstance: any) => {

      this.isLoading=false;
      this.myGameInstance = unityInstance;
      loadingBar.style.display = "none";

      //https://stackoverflow.com/questions/56145437/how-to-make-textmesh-pro-input-field-deselect-on-enter-key
      //https://gamedev.stackexchange.com/questions/179585/how-can-i-economically-check-if-a-ui-dropdown-is-open-or-closed - scroll open dropdown enable/diable
      if(this.isMobile==true){ //to allow scrolling immediatly after canvas is loaded
        this.canvasRef.style.background= "none";


        function onMouse(containerRef:HTMLElement) {
          containerRef.style.pointerEvents = 'auto';
        }

        function onScroll(containerRef:HTMLElement) {
          containerRef.style.pointerEvents = 'none';
        }

        const handleTouchMove = () => {
          onScroll(this.containerRef);
        };
      
        const handleMouseMove = () => {
          onMouse(this.containerRef);
        };

        document.addEventListener("touchmove", handleTouchMove, false);
        document.addEventListener('mousemove', handleMouseMove, false);

        (window as any).disableMobileScrolling = () => {
          document.removeEventListener("touchmove", handleTouchMove, false);
        };

        (window as any).enableMobileScrolling = () => {
          document.addEventListener("touchmove", handleTouchMove, false);
        };
        
      }else{

        //has been previiously set but may need readjsutment, 
        //so as the canvas is fully loaded, reajust if needed be
        if(canvas.offsetWidth>window.innerWidth){
          this.adjustCanvasDesktop();
        }

      }
      
      this.navbarService.toggleNavItems(true);
      
    }).catch((message: any) => {
      alert(message);
    });

    
    //----------------------------------------------SETTING UP EVENT LISTENERS----------------------------

    // call needs to come from unity, since the user can play, logout, and login again, which means that the title creen scene can be created and destroyed 
    //so input forms might need to be adapted more than once per session
    (window as any).isMobile = () => {
      if(this.isMobile== true){
        (this.myGameInstance as any).SendMessage('MobileController', 'ConfigureForMobile');
        
        (window as any).promptForm = (elem: string, form:string, currInput:string) => {
          this.mobileFormsService.promptForm(this.myGameInstance, elem, form, currInput);
        }
      }     
    }
    
    (window as any).openLink = (link: string) => {
      var tab = window.open(link,'_blank');
      if(tab == null && this.hasShownPopupWarning == false){ 
        (this.myGameInstance as any).SendMessage('CanvasController', 'ShowWarningCanvasAndHideCurrent');
        this.hasShownPopupWarning = true;
      }  
    }
    
    (window as any).sendSignup = (email: string, password: string, username: string, age: string, sex: string, 
      nationality: string, education_level: string, education_background: string, education_background_specified: string) => {
      this.userService.sendSignup({email,password,username, age, sex, nationality, education_level, education_background, education_background_specified } as User, this.myGameInstance).subscribe();
    }

    (window as any).sendLogin = (email: string, password: string ) => {
      this.userService.sendLogin({email,password } as User, this.myGameInstance).subscribe();
    }

    (window as any).sendResetPassword = (email: string) => {
      this.userService.sendResetPassword( email, this.myGameInstance).subscribe();
    }

    (window as any).sendLogout = () => {
      this.userService.sendLogout(this.myGameInstance).subscribe();
    }

    (window as any).sendIRI = (scene: number ,scoreIRI: number,questionsIRIjson : JSON, 
      scoreAES: number, questionsAESjson: JSON)=> {
      this.iriAesService.sendIRI_AES( {scene,scoreIRI, questionsIRIjson, scoreAES, questionsAESjson} as IRI_AES, this.myGameInstance).subscribe();
    };

    (window as any).updateScoreAndSceneIRI = () => {
      this.iriAesService.updateScoreAndSceneIRI_AES(this.myGameInstance).subscribe();
    };

    (window as any).sendSAM = (scene: number, arousal: number, valence: number, next_scene:number, score:number) => {
      this.samService.sendSAM({ scene, arousal, valence, next_scene, score } as SAM, this.myGameInstance).subscribe();
    }

    (window as any).updateScoreAndSceneSAM = (next_scene: number, score: number) => {
      this.samService.updateScoreAndSceneSAM(next_scene, score, this.myGameInstance).subscribe();
    };
    
    (window as any).sendQuiz = (quiz: number, score: number, badge: number) => {
      this.quizService.sendQuiz( quiz, score, badge, this.myGameInstance).subscribe();
    }

    (window as any).sendFinalQuizAndSetFinalBadge = ( score: number, badge: number) => {
      this.quizService.sendFinalQuizAndSetFinalBadge( score, badge, this.myGameInstance).subscribe();
    }

    if(this.isMobile!=true){
      (window as any).onresize = () => {
        this.resizeComponent();
        if(this.isLoading){ 
          loadingBar.style.top =canvas.offsetHeight/2 + "px";
          loadingBar.style.display = "block";
        }
      }
    }else{
    if(window.visualViewport){
      window.visualViewport.addEventListener('resize', () => {
        this.adjustCanvasMobile();
        if (this.isLoading) {
          loadingBar.style.top = canvas.offsetHeight / 2 + "px";
          loadingBar.style.display = "block";
        }
      });
    }
  }
  }
  

  resizeComponent(){   
    if(this.isMobile==false){
      this.adjustCanvasDesktop();
      
    }else{
      if(this.currentWindowWidth!=window.innerWidth ){
        this.currentWindowWidth = this.adjustCanvasMobile();
      }
    }
  }

  sub?: Subscription;
  onRouteReactivation() {
    if (this.sub && !this.sub.closed) return;
    this.sub = this.router.events
      .pipe(
        filter(e => e instanceof ActivationEnd),
        take(1)
      )
      .subscribe(e => {
        this.resizeComponent();
        this.enableResizeEventListener();
      });
  }

  enableResizeEventListener(){
    (window as any).onresize = () => {
     this.resizeComponent(); 
    };
  }

  disableResizeEventListener(){
      (window as any).onresize = null;
  } 

  adjustCanvasMobile(): number {

    switch (screen.orientation.type) {

      case "portrait-secondary":
      case "portrait-primary":

        this.isPortrait= true;
        this.rootDivRef!.style.backgroundColor="white";
        const PORTRAIT_WIDTH = window.innerWidth;
        const PORTRAIT_HEIGHT = window.innerWidth/2;
        
        this.canvasRef.style.width = `${PORTRAIT_WIDTH}px`;
        this.canvasRef.style.height = `${PORTRAIT_HEIGHT}px`;
        this.containerRef.style.width = `${PORTRAIT_WIDTH}px`;
        this.containerRef.style.height = `${PORTRAIT_HEIGHT}px`;        
        break;

      case "landscape-primary":
      case "landscape-secondary":

        this.isPortrait= false;
        this.rootDivRef!.style.backgroundImage = "radial-gradient(circle, rgb(255 255 255 / 94%), rgb(0, 0, 0))";
        var LANDSCAPE_WIDTH;
        var LANDSCAPE_HEIGHT;

        if(window.innerWidth/2 <= window.innerHeight){ 
          LANDSCAPE_WIDTH = window.innerWidth;
          LANDSCAPE_HEIGHT = ((LANDSCAPE_WIDTH)/2); 
        }else{
          LANDSCAPE_HEIGHT = window.innerHeight;
          LANDSCAPE_WIDTH = LANDSCAPE_HEIGHT * 2;
        }

        this.canvasRef.style.width = `${LANDSCAPE_WIDTH}px`;
        this.canvasRef.style.height = `${LANDSCAPE_HEIGHT}px`;
        this.containerRef.style.width = `${LANDSCAPE_WIDTH}px`;
        this.containerRef.style.height = `${LANDSCAPE_HEIGHT}px`;
        break;

      default:
        //console.log("The orientation API isn't supported in this browser :(");
    } 
    return window.innerWidth;
}

adjustCanvasDesktop() { 
  
  if(this.canvasRef.offsetWidth>window.innerWidth -100){
    this.canvasRef.style.width= window.innerWidth - 150 + "px";
    this.canvasRef.style.height = (window.innerWidth - 150)/2 + "px";
  }else{ 
    var footerHeight = window.innerHeight;
    const pixelHeight = (footerHeight * 8) / 100;
    var heightFinal = window.innerHeight-pixelHeight- 150;
    this.canvasRef.style.width= 2* heightFinal + "px";
    this.canvasRef.style.height = window.innerHeight-pixelHeight- 150 + "px";
  }
}

}







