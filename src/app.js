"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var stops_1 = require("./stops");
var arrowSrc = require('./img/down-arrow.svg');
require('./css/style.scss');
require('./tau.js');
var AvgangApp = /** @class */ (function () {
    function AvgangApp() {
        this.stops = new stops_1.Stops();
    }
    AvgangApp.prototype.init = function () {
        this.registerEvents();
        this.loadImages();
    };
    /**
     * Register default events
     */
    AvgangApp.prototype.registerEvents = function () {
        /* Register exit on back button */
        window.addEventListener("tizenhwkey", (function (ev) {
            if (ev['keyName'] === "back") {
                var activePopup = document.querySelector(".ui-popup-active");
                var page = document.getElementsByClassName("ui-page-active")[0];
                var pageId = page ? page.id : "";
                if (pageId === "main" && !activePopup) {
                    try {
                        tizen.application.getCurrentApplication().exit();
                    }
                    catch (ignore) {
                    }
                }
                else {
                    window.history.back();
                }
            }
        }));
        /* 		// make SectionChanger object
                sectionChanger = tau.widget.SectionChanger(content, {
                    circular: false,
                    orientation: "horizontal",
                    useBouncingEffect: true
                });
        
                content.addEventListener("sectionchange", function(e) {
                    pageIndicator.setActive(e.detail.active);
                });
        
                mainPage.addEventListener('pagebeforeshow', function() {
                    sectionChanger.refresh();
                    if (pageIndicator) {
                        pageIndicator.setActive(sectionChanger.getActiveSectionIndex());
                    }
                }, false);
        
                stoppestedPage.addEventListener('pagebeforeshow', function() {
                    var SCROLL_STEP = 50,
                        elScroller = stoppestedPage.querySelector('.ui-scroller');
        
                    var scrollPage = function(event) {
                        if (event.detail.direction === 'CW') {
                            elScroller.scrollTop += SCROLL_STEP;
                        } else if (event.detail.direction === 'CCW') {
                            elScroller.scrollTop -= SCROLL_STEP;
                        }
                    };
        
                    document.addEventListener('rotarydetent', scrollPage, false);
                    
                    stoppestedPage.addEventListener('pagebeforehide', function pageHideHandler() {
                        stoppestedPage.removeEventListener('pagebeforehide', pageHideHandler, false);
                        document.removeEventListener('rotarydetent', scrollPage, false);
                    }, false);
                }, false); */
    };
    AvgangApp.prototype.loadImages = function () {
        var arrow = document.getElementById("arrow");
        arrow.src = arrowSrc;
        arrow.width = 50;
    };
    return AvgangApp;
}());
window.onload = function () {
    var app = new AvgangApp();
    app.init();
};
