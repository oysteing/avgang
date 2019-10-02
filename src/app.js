import './css/style.scss';
import './tau.js'
import Arrow from './img/arrow.svg';

(function(tau) {

	var mainPage = document.getElementById('main'),
		stoppestedPage = document.getElementById('stoppested'),
		stoppesteder = document.getElementById('stoppesteder'),
		content = document.getElementById('content'),
		sections = document.getElementById('sections'),
		sectionChanger, pageIndicator;
	
	var stops = [],
		refresher,
		positionWatch;

	function popup(message){
		document.getElementById("popup").innerHTML = message;
		tau.openPopup("#popup");
	}

	function str_pad(n) {
	    return String("00" + n).slice(-2);
	}
	
	function clickStop(event) {
		var li = event.target.parentElement;
		clearInterval(refresher);
		var stop = {ID: li.getAttribute("data-id"), Name: li.getAttribute("data-value")};
		//refreshStop(stop);
		getStop(stop);
		localStorage.setItem("currentStop", JSON.stringify(stop));
	}
	
	/**
	 * Render list of closest stops
	 */
	function renderStops(stops) {
		var stoppesteder = document.getElementById("stoppesteder");
		var ul = document.createElement("ul");
		ul.className = "ui-listview";
		for (var i = 0; i < stops.length && i < 6; i++) {
			var li = document.createElement("li");
			var link = document.createElement("a");
			link.setAttribute("href", "#main");
			link.appendChild(document.createTextNode(stops[i].properties.name));
			li.appendChild(link);
			li.setAttribute("data-id", stops[i].properties.id);
			li.setAttribute("data-value", stops[i].properties.name);
			ul.appendChild(li);
		}
		ul.addEventListener("click", clickStop, {once: true});
		stoppesteder.replaceChild(ul, stoppesteder.childNodes[0]);
	}
	
	/**
	 * Format time as remaining time in minutes or absolute time
	 */
	function formatTime(time) {
		var now = new Date();
		var difference = Math.floor((time - now)/1000/60);
		if (difference < 1) {
			return "nå";
		} else if (difference < 60) {
			return "om " + difference + " min";
		} else {
			return str_pad(time.getHours()) + ":" + str_pad(time.getMinutes());
		}
	}

	/**
	 * Map transport mode to icon name
	 */
	function transportModeToIcon(transportMode) {
		switch (transportMode) {
//		case "air":
//			return
		case "bus":
			return "img/bus.svg";
//		case "cableway":
//			return
//		case "water":
//			return
//		case "funicular":
//			return
//		case "lift":
//			return
//		case "rail":
//			return
		case "metro":
			return "img/t-banen.svg";
//		case "tram":
//			return
//		case "coach":
//			return
//		case "unknown":
//			return
		default:
			console.log("Sorry, we don't have an icon for transportMode " + transportMode);
			return;
		}
	}

	/**
	 * Render a single departure by modifying the DOM directly
	 */
	function renderDeparture(departure) {
		var transportMode = document.createElement("div");
		var transportModeIcon = document.createElement("img");
		transportModeIcon.className = "icon";
		transportModeIcon.setAttribute("src", transportModeToIcon(departure.serviceJourney.line.transportMode));
		transportMode.appendChild(transportModeIcon);
		var destination = document.createElement("div");
		destination.className = "destination";
		var line = document.createElement("span");
		line.className = "line";
		line.setAttribute("style", "background-color: #" + departure.serviceJourney.line.presentation.colour);
		line.appendChild(document.createTextNode(departure.serviceJourney.line.publicCode));
		destination.appendChild(line);
		destination.appendChild(document.createTextNode(departure.destinationDisplay.frontText));
		var departureTime = document.createElement("div");
		departureTime.className = "departure-time";
		departureTime.appendChild(document.createTextNode(formatTime(new Date(departure.expectedDepartureTime))));
		var departureElement = document.createElement("section");
		departureElement.className = "section";
		departureElement.appendChild(transportMode);
		departureElement.appendChild(destination);
		departureElement.appendChild(departureTime);
		
		return departureElement;
	}

	/**
	 * Show real time departure times for one stop
	 */
	function renderStop(stop) {
		document.getElementById("stopp").innerHTML = stop.name;
		sections.innerHTML = '';
		for (var estimatedCall of stop.estimatedCalls) {
			sections.appendChild(renderDeparture(estimatedCall));
		}
		pageIndicator = tau.widget.PageIndicator(document.getElementById("pageIndicator"), {numberOfPages: stop.estimatedCalls.length});
		pageIndicator.setActive(0);
		sectionChanger.refresh();
	}

	/**
	 * Load departures for stop. Update every 10 seconds
	 * 
	 * @param stop
	 * @returns
	 */
//	function refreshStop(stop) {
//		getStop(stop);
//		refresher = setInterval(getStop, 10000, stop);
//	}

	/**
	 * Reads data from Entur JourneyPlanner API by XMLHttpRequest. Render departure times.
	 * 
	 * @private
	 */
	function getStop(stop) {
		var xmlhttp = new XMLHttpRequest();

		xmlhttp.open("POST", "https://api.entur.io/journey-planner/v2/graphql");
		xmlhttp.setRequestHeader("ET-Client-Name", "øystein_gisnås - avgang");
		xmlhttp.setRequestHeader("Content-Type", "application/json");
		xmlhttp.responseType = "json";
		var query = `{
		  stopPlace(id: "NSR:StopPlace:58366") {
		    id
		    name
		    estimatedCalls(timeRange: 72100, numberOfDepartures: 10) {     
		      realtime
		      aimedArrivalTime
		      aimedDepartureTime
		      expectedArrivalTime
		      expectedDepartureTime
		      actualArrivalTime
		      actualDepartureTime
		      date
		      forBoarding
		      forAlighting
		      destinationDisplay {
		        frontText
		      }
		      quay {
		        id
		      }
		      serviceJourney {
      line {
        publicCode
        name
        transportMode
        transportSubmode
        presentation {
          colour
          textColour
        }
        notices {
          id
          text
        }
        situations {
          summary {
            value
            language
          }
        }
      }
		      }
		    }
		  }
		}`;
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4) {
				
				if (xmlhttp.status === 200) {
					var response = xmlhttp.response;
					if (response !== null) {
						renderStop(response.data.stopPlace);
					} else {
						document.getElementById("stopp").innerHTML = stop.Name;
						document.getElementById("content").innerHTML = "Ingen avganger funnet";
					}
				} else {
					console.error("Kunne ikke hente data. Sjekk internettforbindelsen. HTTP status " + xmlhttp.status);
				}
				xmlhttp = null;
			}
		};
		xmlhttp.send(JSON.stringify({query: query}));
	}

	function selectJernbanetorget() {
		getStop({ID: 'NSR:StopPlace:58366', Name: 'Jerbanetorget'});
	}
	
	/**
	 * Look up closest stops from Entur Geocoding API and create list
	 */
	function getClosestStops(coords) {
		var xmlhttp = new XMLHttpRequest();
		
		xmlhttp.open("GET", "https://api.entur.io/geocoder/v1/reverse?layers=venue&point.lat=" + coords.latitude + "&point.lon=" + coords.longitude);
		xmlhttp.setRequestHeader("ET-Client-Name", "øystein_gisnås - avgang");
		xmlhttp.responseType = "json";
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4) {
				
				if (xmlhttp.status === 200) {
					var response = xmlhttp.response;
	
					if (response.type === 'FeatureCollection' && response.features.length > 0) {
						stops = xmlhttp.response.features;
						renderStops(stops);
					} else {
						stoppesteder.innerHTML = 'Ingen stoppesteder i nærheten<br/><a href="#main">(trykk for å velge Jernbanetorget)</a>';
						stoppesteder.addEventListener("click", selectJernbanetorget, {once: true});
					}
				} else {
					console.error("Kunne ikke hente data. Sjekk internettforbindelsen. HTTP status " + xmlhttp.status);
				}
				xmlhttp = null;
			}
		};
		xmlhttp.send();
	}

	/**
	 * Display real time departures for closest stop
	 */
	function positionSuccess(position) {
		getClosestStops(position.coords);
	}

	/**
	 * Error getting position. Display popup error message
	 */
	function positionError(error) {
	    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.error('User denied the request for Geolocation.');
            break;
        case error.POSITION_UNAVAILABLE:
        	console.error('Location information is unavailable.');
            break;
        case error.TIMEOUT:
        	console.error('The request to get user location timed out.');
            break;
        case error.UNKNOWN_ERROR:
        	console.error('An unknown error occurred.');
            break;
	    }
		popup('Position error ' + error.code);
		console.error("Could not detect position, code " + error.code + ": " + error.message);
	}

	/**
	 * Start detcting position in order to create list of nearest stops
	 */
	function detectNearestStop() {
		positionWatch = navigator.geolocation.watchPosition(positionSuccess, positionError);
	}

	/**
	 * Handles the hardware key events.
	 * 
	 * @private
	 * @param {Object}
	 *            event - The object contains data of key event
	 */
	function keyEventHandler(ev) {
		var activePopup = null, page = null, pageid = "";

		if (ev.keyName === "back") {
			activePopup = document.querySelector(".ui-popup-active");
			page = document.getElementsByClassName("ui-page-active")[0];
			pageid = page ? page.id : "";

			if (pageid === "main" && !activePopup) {
				try {
					navigator.geolocation.clearWatch(positionWatch);
					tizen.application.getCurrentApplication().exit();
				} catch (ignore) {
				}
			} else {
				window.history.back();
			}
		}
	}
	
	/**
	 * Register default events
	 */
	function registerEvents() {
		/* Register exit on back button */
		document.addEventListener("tizenhwkey", keyEventHandler);
		
		// make SectionChanger object
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

			/* Register section change on bezel rotation */
			var changeSection = function(event) {
				if (event.detail.direction === 'CW' && sectionChanger.getActiveSectionIndex() < sectionChanger.sections.length-1) {
					// Next section
					sectionChanger.setActiveSection(sectionChanger.getActiveSectionIndex()+1);
				} else if (event.detail.direction === 'CCW' && sectionChanger.getActiveSectionIndex() > 0) {
					// Previous section
					sectionChanger.setActiveSection(sectionChanger.getActiveSectionIndex()-1);
				}
			};
			
			document.addEventListener('rotarydetent', changeSection, false);
		    
		    mainPage.addEventListener('pagebeforehide', function pageHideHandler() {
				mainPage.removeEventListener('pagebeforehide', pageHideHandler, false);
			    document.removeEventListener('rotarydetent', changeSection, false);
			}, false);
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
		}, false);
	}
	
	/**
	 * Initiates the application.
	 * 
	 * @private
	 */
	function init() {
		registerEvents();
		
		detectNearestStop();

 		if ("currentStop" in localStorage) {
 			var stop = JSON.parse(localStorage.getItem("currentStop"));
 			//refreshStop(stop);
 			getStop(stop);
 		} else {
 			sections.innerHTML = '<section><div><span style="font-size: smaller">Vis sanntidsavganger ved å velge stoppested i nærheten</span></div><div><img src="' + Arrow + '" width="50"/></div></section>';
		}
	}

	window.onload = init();
	
	return;
}(window.tau));