(function(tau) {

	var stops = [],
		refresher,
		positionWatch,
		VEHICLE_MODE_CLASSES = ["icon-svg icon-svg-Bus", "icon-svg icon-svg-Boat", "icon-svg icon-svg-Train", "icon-svg icon-svg-Tram", "icon-svg icon-svg-Metro"],
		TRANSPORTATION_TYPE = ["", "icon-svg icon-svg-Bus", "icon-svg icon-svg-Bus", "", "icon-svg icon-svg-Train", "icon-svg icon-svg-Boat", "icon-svg icon-svg-Train", "icon-svg icon-svg-Tram", "icon-svg icon-svg-Metro"],
//		DEFAULT_STOP = {ID: 3010443, Name: "Grefsenveien"};
		DEFAULT_STOP = {ID: 3012050, Name: "Alna [tog]"};

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
		getStop({ID: li.getAttribute("data-id"), Name: li.getAttribute("data-value")});
		refresher = setInterval(getStop, 10000, {ID: li.getAttribute("data-id"), Name: li.getAttribute("data-value")});
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
			link.appendChild(document.createTextNode(stops[i].Name));
			li.appendChild(link);
			li.setAttribute("data-id", stops[i].ID);
			li.setAttribute("data-value", stops[i].Name);
			ul.appendChild(li);
		}
		ul.addEventListener("click", clickStop, {once: true});
		stoppesteder.replaceChild(ul, stoppesteder.childNodes[0]);
	}
	
	function addFavourite(favourite) {
		var favouritesString = localStorage.getItem("favourites");
		var favourites = favouritesString === null ? new Set() : new Set(favouritesString.split(","));
		favourites.add(favourite);
		localStorage.setItem("favourites", Array.from(favourites).join(","));
	}

	function removeFavourite(favourite) {
		var favouritesString = localStorage.getItem("favourites");
		var favourites = favouritesString === null ? new Set() : new Set(favouritesString.split(","));
		favourites.delete(favourite);
		localStorage.setItem("favourites", Array.from(favourites).join(","));
	}
	
	function isFavourite(stopID, lineID, destination) {
		var favourite = stopID + "-" + lineID + "-" + destination;
		var favouritesString = localStorage.getItem("favourites");
		var favourites = favouritesString === null ? new Set() : new Set(favouritesString.split(","));
		return favourites.has(favourite);
	}
	
	function toggleFavourite(event) {
		var stopID = event.target.getAttribute("stopID");
		var lineID = event.target.getAttribute("lineID");
		var destination = event.target.getAttribute("destination");
		var favourite = stopID + "-" + lineID + "-" + destination;
		if (this.checked) {
			console.log("Adding favourite " + favourite);
			addFavourite(favourite);
		} else {
			console.log("Resetting favourites");
			removeFavourite(favourite);
		}
	}

	/**
	 * Update the text of an HTML element with the name of a stop
	 */
	function showStopName(stopID, element) {
		var xmlhttp = new XMLHttpRequest();

		xmlhttp.open("GET", "http://reisapi.ruter.no/Place/GetStop/" + stopID);
		xmlhttp.responseType = "json";
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4) {
				
				if (xmlhttp.status === 200) {
					element.textContent = xmlhttp.response.Name ? xmlhttp.response.Name : "Ingen stopp funnet";
				} else {
					console.error("Kunne ikke hente data. Sjekk internettforbindelsen. HTTP status " + xmlhttp.status);
				}
				xmlhttp = null;
			}
		};
		xmlhttp.send();
	} 
	
	/**
	 * Render destination information and append to element
	 */
	function renderDestination(destination, line, departures, content) {
		var lineBlock = document.createElement("div");
		lineBlock.className = "line-block";
		lineBlock.setAttribute("style", "background-color: #" + line.LineColour);
		var lineNumber = document.createElement("div");
		lineNumber.className = "line-number";
		lineNumber.appendChild(document.createTextNode(line.Name));
		lineBlock.appendChild(lineNumber);
		var lineDestination = document.createElement("div");
		lineDestination.className = "line-destination";
		lineDestination.appendChild(document.createTextNode(destination.Destination));
		lineBlock.appendChild(lineDestination);
		var favourite = document.createElement("input");
		favourite.type = "checkbox";
		favourite.className = "favourite";
		if (isFavourite(destination.StopID, destination.LineID, destination.Destination)) {
			favourite.checked = true;
		}
		favourite.setAttribute("stopid", destination.StopID);
		favourite.setAttribute("lineid",  destination.LineID);
		favourite.setAttribute("destination", destination.Destination);
		favourite.addEventListener("change", toggleFavourite);
		lineBlock.appendChild(favourite);
		var vehicleIcon = document.createElement("span");
		vehicleIcon.className = "vehicle " + TRANSPORTATION_TYPE[line.Transportation];
		lineBlock.appendChild(vehicleIcon);
		content.appendChild(lineBlock);

		var node = document.createElement("div");
		node.className = "departures";
		for (var i = 0; i < departures.length && i < 4; i++) {
			var departureNode = document.createTextNode(formatTime(departures[i]));
			node.appendChild(departureNode);
		}
		content.appendChild(node);
	}

	/**
	 * Render destination information and append to element
	 * 
	 * Fetch line information as it is not known. Wrapper to allow common rendering
	 * for favourites and stop based queries
	 */
	function renderDestinationFetchLine(destination, content) {
		var xmlhttp = new XMLHttpRequest();

		xmlhttp.open("GET", "http://reisapi.ruter.no/Line/GetDataByLineID/" + destination.LineID);
		xmlhttp.responseType = "json";
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4) {
				
				if (xmlhttp.status === 200) {
					var response = xmlhttp.response;

					var departures = [];
					for (var i = 0; i < destination.MonitoredStopVisits.length; i++) {
						departures.push(new Date(destination.MonitoredStopVisits[i].MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime));
					}
					renderDestination(destination, response, departures, content);
				} else {
					console.error("Kunne ikke hente data. Sjekk internettforbindelsen. HTTP status " + xmlhttp.status);
				}
				xmlhttp = null;
			}
		};
		xmlhttp.send();
	}
	
	/**
	 * Show real time departure times for favourites
	 * 
	 * Limitation: only renders one stop/one page
	 */
	function showFavourites(favouriteModel) {
		for (var stopID in favouriteModel) {
			var stop = favouriteModel[stopID];
			showStopName(stopID, document.getElementById("stopp"));
			var content = document.getElementById("content"); 
			content.innerHTML = '';
			for (var i = 0; i < stop.length; i++) {
				var destination = stop[i];
				renderDestinationFetchLine(destination, content);
			}
			// TBD support more than one favourite stop - multiple pages?
			break;
		}
	}
	
	/**
	 * Format time as remaining time in minutes or absolute time
	 */
	function formatTime(time) {
		var now = new Date();
		var difference = Math.floor((time - now)/1000/60);
		if (difference < 1) {
			return "nå ";
		} else if (difference < 60) {
			return difference + "m ";
		} else {
			return str_pad(time.getHours()) + ":" + str_pad(time.getMinutes()) + " ";
		}
	}

	/**
	 * Show real time departure times for one stop
	 */
	function showDepartures(stop, destinations) {
		document.getElementById("stopp").innerHTML = stop.Name;
		var content = document.getElementById("content");
		document.getElementById("content").innerHTML = '';
		for (var key in destinations) {
			var destination = destinations[key];
			var line = {LineColour: destination.lineColour, Name: destination.publishedLineName, Transportation: destination.vehicleMode};
			renderDestination({LineID: destinations[key].lineRef, Destination: destinations[key].destinationName, StopID: stop.ID}, line, destination.departures, content);
		}
	}

	/**
	 * Display real time departure times for store favourites
	 */
	function getFavourites(favourites) {
		console.log("Loading favourites " + favourites);

		var xmlhttp = new XMLHttpRequest();

		xmlhttp.open("GET", "http://reisapi.ruter.no/Favourites/GetFavourites?favouritesRequest=" + favourites);
		xmlhttp.responseType = "json";
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4) {
				
				if (xmlhttp.status === 200) {
					var response = xmlhttp.response;
	
					if (response.length > 0) {
						var favouriteModel = {};
						// Iterate over favourites (stop/line/destination)
						for (var i = 0; i < response.length; i++) {
							var favourite = response[i];
							if (!(favourite.StopID in favouriteModel)) {
								favouriteModel[favourite.StopID] = [];
							}
							favouriteModel[favourite.StopID].push(favourite);
						}
						showFavourites(favouriteModel);
					} else {
						document.getElementById("stopp").innerHTML = "Favoritter";
						document.getElementById("content").innerHTML = "Ingen avganger funnet";
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
	 * Reads data from Ruter REIS API by XMLHttpRequest, and store received data to
	 * the local array. Render departure times.
	 * 
	 * @private
	 */
	function getStop(stop) {
		var xmlhttp = new XMLHttpRequest();

		xmlhttp.open("GET", "http://reisapi.ruter.no/StopVisit/GetDepartures/" + stop.ID);
		xmlhttp.responseType = "json";
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4) {
				
				if (xmlhttp.status === 200) {
					var response = xmlhttp.response;
	
					if (response.length > 0) {
						var destinations = {};
						for (var i = 0; i < response.length; i++) {
							var stopVisit = response[i];
	
							var destinationName = stopVisit.MonitoredVehicleJourney.DestinationName;
							if (!(destinationName in destinations)) {
								destinations[destinationName] = {
									destinationName: destinationName,
									lineColour: stopVisit.Extensions.LineColour,
									publishedLineName: stopVisit.MonitoredVehicleJourney.PublishedLineName,
									vehicleMode: stopVisit.MonitoredVehicleJourney.VehicleMode,
									departures: [],
									lineRef: stopVisit.MonitoredVehicleJourney.LineRef
									};
							}
							destinations[destinationName].departures.push(new Date(stopVisit.MonitoredVehicleJourney.MonitoredCall.ExpectedDepartureTime));
						}
						showDepartures(stop, destinations);
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
		xmlhttp.send();
	}

	/**
	 * Look up closest stops from Ruter REIS API and create list
	 * 
	 * Parameter coordinates must be coordinates of type UTMCoord
	 */
	function getClosestStops(coordinates) {
		var xmlhttp = new XMLHttpRequest();
		
		xmlhttp.open("GET", "http://reisapi.ruter.no/Place/GetClosestStops?coordinates=x=" + Math.round(coordinates.easting) + ",y=" + Math.round(coordinates.northing));
		xmlhttp.responseType = "json";
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState === 4) {
				
				if (xmlhttp.status === 200) {
					var response = xmlhttp.response;
	
					if (response.length > 0) {
						stops = xmlhttp.response;
						renderStops(stops);
					} else {
						console.error("Ingen stopp funnet");
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
	 * Convert position to UTM and display real time departures for closest stop
	 */
	function positionSuccess(position) {
		var deg = new UTMConv.DegCoords(position.coords.latitude, position.coords.longitude);
		var utm = deg.to_utm();
		getClosestStops(utm);
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
		if (navigator.geolocation) {
			positionWatch = navigator.geolocation.watchPosition(positionSuccess, positionError);
		}
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
	
	function scrollPage(event) {
		var SCROLL_STEP = 50;
		var elScroller = document.querySelector('.ui-page-active .ui-scroller');
		
		if (event.detail.direction === 'CW') {
			/* Scroll down */
			elScroller.scrollTop += SCROLL_STEP;
		} else if (event.detail.direction === 'CCW') {
			/* Scroll up */
			elScroller.scrollTop -= SCROLL_STEP;
		}
	}
	
	/**
	 * Register default events
	 */
	function registerEvents() {
		/* Register exit on back button */
		document.addEventListener("tizenhwkey", keyEventHandler);
		
		/* Register page scrolling on bezel rotation */
        document.addEventListener('rotarydetent', scrollPage, false);
	}
	
	/**
	 * Initiates the application.
	 * 
	 * @private
	 */
	function init() {
		registerEvents();
		
		detectNearestStop();
//		localStorage.setItem("favourites", "3012050-9101-Spikkestad");
		var favourites = localStorage.getItem("favourites");
		if (favourites) {
			getFavourites(favourites);
			refresher = setInterval(getFavourites, 10000, favourites);
		} else {
			getStop(DEFAULT_STOP);
			refresher = setInterval(getStop, 10000, DEFAULT_STOP);
		}
	}

	window.onload = init();
	
	return;
}(window.tau));