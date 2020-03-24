"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Stops = /** @class */ (function () {
    function Stops() {
        this.page = document.getElementById('stoppesteder');
        if (this.page != null) {
            this.page.addEventListener('pagecreate', this.loadPage);
        }
    }
    Stops.prototype.loadPage = function () {
        console.log("heidu");
        // @ts-ignore
        document.getElementById('stoppesteder').innerHTML = 'hei';
    };
    return Stops;
}());
exports.Stops = Stops;
