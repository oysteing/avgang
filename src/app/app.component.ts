import {Component, HostListener} from '@angular/core';

declare var tizen: any;

interface TizenHWKey {
  keyName: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  @HostListener('window:tizenhwkey', ['$event']) onTizenHWKey(ev: CustomEvent) {
    // @ts-ignore
    if (ev.keyName === 'back') {
      const activePopup = document.querySelector('.ui-popup-active');
      const page = document.getElementsByClassName('ui-page-active')[0];
      const pageId = page ? page.id : '';

      if (pageId === 'main' && !activePopup) {
        try {
          tizen.application.getCurrentApplication().exit();
        } catch (ignore) {
        }
      } else {
        window.history.back();
      }
    }
  }
}
//
// import {Stops} from './stops';
//
// declare var tizen: any;
//
// class AvgangApp {
//
//   stops = new Stops();
//
//   init() {
//     this.registerEvents();
//   }
//
//
//     /* 		// make SectionChanger object
//             sectionChanger = tau.widget.SectionChanger(content, {
//                 circular: false,
//                 orientation: "horizontal",
//                 useBouncingEffect: true
//             });
//
//             content.addEventListener("sectionchange", function(e) {
//                 pageIndicator.setActive(e.detail.active);
//             });
//
//             mainPage.addEventListener('pagebeforeshow', function() {
//                 sectionChanger.refresh();
//                 if (pageIndicator) {
//                     pageIndicator.setActive(sectionChanger.getActiveSectionIndex());
//                 }
//             }, false);
//
//             stoppestedPage.addEventListener('pagebeforeshow', function() {
//                 var SCROLL_STEP = 50,
//                     elScroller = stoppestedPage.querySelector('.ui-scroller');
//
//                 var scrollPage = function(event) {
//                     if (event.detail.direction === 'CW') {
//                         elScroller.scrollTop += SCROLL_STEP;
//                     } else if (event.detail.direction === 'CCW') {
//                         elScroller.scrollTop -= SCROLL_STEP;
//                     }
//                 };
//
//                 document.addEventListener('rotarydetent', scrollPage, false);
//
//                 stoppestedPage.addEventListener('pagebeforehide', function pageHideHandler() {
//                     stoppestedPage.removeEventListener('pagebeforehide', pageHideHandler, false);
//                     document.removeEventListener('rotarydetent', scrollPage, false);
//                 }, false);
//             }, false); */
//   }
// }
//
// window.onload = () => {
//   const app = new AvgangApp();
//   app.init();
// };
