$(function() {
	mapboxgl.accessToken = 'pk.eyJ1Ijoic3RhbmlzbGF2ZmVsZG1hbiIsImEiOiJjaW1qeDNzcWIwMHZpdmlrdWtzN25rM2V4In0.fHHjC9KgMpEuyayafUAVwA';
	var map = new mapboxgl.Map({
	    container: 'map',
	    style: 'mapbox://styles/stanislavfeldman/cimkplo510022zpmcm7f1fkb3',
	    center: [10, 20],
	    zoom: 2
	});
	var countries = ["Malaysia", "Russia", "United States", "Indonesia", "Philippines", "Cambodia", "Thailand", "Netherlands", "Spain", "China", "Vietnam", "France", "Bahamas", "Ukraine", "Cyprus", "Turkey", "Singapore", "Belarus", "Egypt", "Bulgaria", "Morocco"];
	map.on('style.load', function () {
		var markers = [];
	    var requests = [];
	    for (var i = 0; i < countries.length; ++i) {
			requests.push(addCountryMarker(countries[i]));
		}

		function addCountryMarker(name) {
			return $.get("http://www.mapquestapi.com/geocoding/v1/address?key=YX6zHuQX0RnGP7KdaZneJ5PKePDoAemo&location=" + name, function(data) {
				var location = data.results[0].locations[0].latLng;
				markers.push({
	                "type": "Feature",
	                "geometry": {
	                    "type": "Point",
	                    "coordinates": [location.lng, location.lat]
	                },
	                "properties": {
	                    "title": name,
	                    "marker-symbol": "monument"
	                }
	            });
			});
			// geocoder.query(name, function (err, data) {
			//     if(data.latlng) {
			//     	console.log(data.latlng);
			//     	// addMarker(data.latlng[0], data.latlng[1], name, "", {
			//      //        "iconUrl": "https://ss3.4sqi.net/img/categories_v2/travel/travelagency_44.png",
			//      //        "iconSize": [40, 40], // size of the icon
			//      //        "iconAnchor": [20, 20], // point of the icon which will correspond to marker's location
			//      //        "popupAnchor": [0, -12], 
			//      //        "className": "country-icon"
			//      //    }, 1000);
			//     }
			// });
		}

		function showPlaces(offset, callback) {
			var limit = 250;
			$.get("https://api.foursquare.com/v2/users/self/checkins?offset=" + offset + "&limit=" + limit + "&oauth_token=EWILCTFULERW3FO52ARKGOMK5MN1L2VTK4F0HDEKCHLJROD0&v=20160403", function( data ) {
				places = _.map(data.response.checkins.items, function(item){
					var categories = item.venue.categories;
					var icon = null;
					if(categories.length > 0)
						icon = categories[0].icon.prefix + "44" + categories[0].icon.suffix
					return { 
						name: item.venue.name, 
						location: item.venue.location,
						icon: icon
					}; 
				});
				for (var i = 0; i < places.length; ++i) {
					var place = places[i];
					var address = place.location.formattedAddress;
					var description = "";
					if(address)
						description = address[address.length-1];
					markers.push({
		                "type": "Feature",
		                "geometry": {
		                    "type": "Point",
		                    "coordinates": [place.location.lng, place.location.lat]
		                },
		                "properties": {
		                    "title": place.name,
		                    "marker-symbol": "monument"
		                }
		            });
					// addMarker(place.location.lat, place.location.lng, place.name, description, {
			  //           "iconUrl": place.icon,
			  //           "iconSize": [32, 32], // size of the icon
			  //           "iconAnchor": [16, 16], // point of the icon which will correspond to marker's location
			  //           "popupAnchor": [0, -10], 
			  //           "className": "place-icon"
			  //       }, 0);
				}
				if(places.length > 0)
					showPlaces(offset + limit, callback);
				else if(callback)
					callback();
			});
		}

		$.when.apply($, requests).done(function() {
			showPlaces(0, function() {
				map.addSource("markers", {
			        "type": "geojson",
			        "data": {
			            "type": "FeatureCollection",
			            "features": markers
			        }
			    });
				map.addLayer({
			        "id": "markers",
			        "type": "symbol",
			        "source": "markers",
			        "layout": {
			            "icon-image": "marker-15",
			            "text-field": "{title}",
			            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
			            "text-offset": [0, 0.6],
			            "text-anchor": "top"
			        }
			    });
			    setTimeout(function() {
					$(".mapboxgl-ctrl-attrib").html("<div class='mapbox-improve-map'>Visited countries (" + countries.length + "):<br>" + countries + "</div>");
				}, 1000);
				console.log("done!");
			});
		});
	});

	// function addMarker(lat, lng, title, description, icon, zIndex) {
	// 	if (!lat || !lng || !icon || !icon.iconUrl)
	// 		return;
	// 	if(!description)
	// 		description = "";
	// 	var popupContent =  '<h4>' + title + '</h4>' + description;
	// 	L.marker([lat, lng], {
	// 		title: title,
	// 		icon: L.icon(icon),
	// 		riseOnHover: true,
	// 		zIndexOffset: zIndex
	// 	}).addTo(map).bindPopup(popupContent, {
	//         closeButton: false
	//     }).on("mouseover", function(e) {
	// 		e.target.openPopup()
	// 	}).on("mouseout", function(e) {
	// 		e.target.closePopup()
	// 	});

	// }
});