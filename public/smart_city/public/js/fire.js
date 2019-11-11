

var database = firebase.database();
var listReports = "did not update";
(readAllReports(callback1));
var keys = []

var infoWindow;

//Reads All the reports on the database Expects a callback function as argument
async function readAllReports(callbackFunction) {
	var reports = firebase.database().ref('potholes');
	reports.once('value').then(function (snapshot) {
		listReports = snapshot.val();
		callbackFunction(snapshot.val());
	});
	var snapshot = await reports.once("value");
	keys = (Object.keys(snapshot.val()));

	return (snapshot.val());
}

function formatTimeStamp(origStamp){
	var finalString = "";
	leftSide = origStamp.substring(0,10);
	rightSide = origStamp.substring(11,19);
	nrightSide = rightSide.replace(/-/g,":");
	//finalString = leftSide + "</br >" +  nrightSide;
	return [leftSide, nrightSide];
}

//callback function example
function callback1(reportsObject) {
	//var keyArray[] = [, 'asdfasdfasdf']; //this array will hold the keys for reportsObject (dictionary data type)
	var keyArray = Object.keys(reportsObject);
	var keyArrayLength = Object.keys(reportsObject).length;
	var tableObj = document.createElement("table");
	//create header
	var header = tableObj.createTHead();
	var body = document.createElement('tbody');
	tableObj.appendChild(body);
	
	infoWindow = new google.maps.InfoWindow();


	tableObj.setAttribute('id', 'mainTable');
	tableObj.setAttribute('class', 'table  table-hover table-bordered');
	var headerMap = {
				"index": "Index",
				"reportStatus": "",
				"Date":"Date",
				"Time":"Time",
				"confidense": "Confidence",
				"reportPicture": "Image",
				"pothole": "Pothole",
				"address": "Address"
			}

	markers = marker_creator(reportsObject, keyArray, keyArrayLength);
	addTableElement(headerMap, tableObj, 0, header, body);
	for (i = 0; i < keyArrayLength; i = i + 1) {
		var reportStatus = reportsObject[keyArray[i]]['status'];
		//var reportStatus = "In Progress";
		var timeStamp = formatTimeStamp(reportsObject[keyArray[i]]['timeStamp']);
		var reportDate = timeStamp[0];
		var reportTime = timeStamp[1];
		//var reportDate = "test";
		//var reportIssue = reportsObject[keyArray[i]]['type'];
		var PotholeConfidense = reportsObject[keyArray[i]]['confidense'];
		var reportIssue = "Pothole";
		var reportLocation2 = reportsObject[keyArray[i]]['long'];
		var reportLocation1 = reportsObject[keyArray[i]]['lat'];
		var reportPicture = reportsObject[keyArray[i]]['img'];
		var pothole = reportsObject[keyArray[i]]['pothole'].split(',');
		var address = reportsObject[keyArray[i]]['street'];
		//var reportDescription = reportsObject[keyArray[i]]['description'];
		var reportDescription = "test";
		var k = keyArray[i]
		//var reportArray = [i + 1, reportStatus, reportDate, reportTime, PotholeConfidense, reportPicture, reportDescription, k, pothole, address];//this array will hold the order for the report list row
		var reportMap = {
			"index": i+1,
			"reportStatus": reportStatus,
			"Date":reportDate,
			"Time":reportTime,
			"confidense": PotholeConfidense,
			"reportPicture": reportPicture,
			"pothole": pothole,
			"address": address
		}
		potholeData.push(reportMap);
		addTableElement(reportMap, tableObj, i + 1, header, body, markers);
	}
	document.body.appendChild(tableObj);
	buildFilters();
}

//Code to add elements into a table format
//all cell elements are stored in reportArray
function addTableElement(reportMap, z1, rowNum, header, body, markers) {
	//var z1 = document.createElement("TABLE");

	if (rowNum == 0) {
		var row = header.insertRow(rowNum);
	}
	else {
		var row = body.insertRow(rowNum - 1);
		row.setAttribute("height", "300");
	}

	var indexCell = row.insertCell(0);
	var statusCell = row.insertCell(1);
	var dateCell = row.insertCell(2);
	var timeCell = row.insertCell(3);
	var confCell = row.insertCell(4);
	var imgCell = row.insertCell(5);
	//var cell7 = row.insertCell(5);
	indexCell.setAttribute("width", "3%");
	statusCell.setAttribute("width", "8%");
	dateCell.setAttribute("width", "12%");
	timeCell.setAttribute("width", "8%");
	confCell.setAttribute("width", "10%");
	imgCell.setAttribute("width", "15%");
	

	indexCell.innerHTML = reportMap["index"];
	
	if (reportMap["reportStatus"] == "") {
		statusCell.innerHTML = "Status";
	}
	else {
		statusCell.innerHTML ='<select style="width:100%;" class="custom-select" id="statusDrop"><option selected disabled value="all">Status</i></option><option  value="1">Submitted</option><option  value="2">Pending Action</option><option  value="3">In Progress</option><option = value="3">Resolved</option></select>' 
	}
	dateCell.innerHTML = reportMap["Date"];
	timeCell.innerHTML = reportMap["Time"];
	confCell.innerHTML = reportMap["confidense"];



	//var img = document.createElement("IMG");
	
	if (rowNum == 0) {
		imgCell.innerHTML = "Image";
	}
	else {
		if (reportMap["reportPicture"] == 'no image') {
			imgCell.innerHTML = "no image";
		}
		else {
			
			//set rectangle
			var pothole = reportMap["pothole"];
			

			var canvas = create_canvas(reportMap["reportPicture"], pothole, "200", "200");
			var markerCanvas = create_canvas(reportMap["reportPicture"], pothole, "100%", "100%");
			//tableDiv = create_canvas_div("50","50", canvas);
			imgCell.appendChild(canvas);
			//save canvas to not rebuild it later
			reportMap["reportPicture"] = canvas;
			
			var markerIndex = rowNum - 1;
			var marker = markers[markerIndex];
			//cell6.innerHTML = "<img id='myImg' alt='Snow'  src = \"data:image/jpg;base64," +reportArray[4] + "\"width = \"100\" height = \"80\">";
			var confidense = Math.round(parseFloat(reportMap["confidense"]) * 100) / 100;
			

			var markerDiv = create_marker_infoWindow(markerCanvas, confidense);
			marker.infoWindowContent = markerDiv;
			(function (marker, i) {
			google.maps.event.addListener(marker, 'click', function () {
				//infowindow = new google.maps.InfoWindow({ content: markerDiv});
				infoWindow.setContent(marker.infoWindowContent);
				infoWindow.open(map, marker);
			})
		})(marker, i);
		}
	}
	//cell7.innerHTML = reportArray[5];

}
input = "Pothole";

function create_marker_infoWindow(canvasDiv, confidense){
	var markerDiv = document.createElement("div");
	markerDiv.setAttribute("width", "100%");
	markerDiv.setAttribute("height", "90%");
	//confidense
	var confidenseDiv = document.createElement("div");
	confidenseDiv.setAttribute("width", "100%");
	confidenseDiv.setAttribute("height", "10%");
	var confidenseLabel = document.createElement("b");
	confidenseLabel.innerHTML = "Confidense: ";
	var confidenseText = document.createElement("t");
	confidenseText.innerHTML = confidense;
	confidenseDiv.appendChild(confidenseLabel);
	confidenseDiv.appendChild(confidenseText);
	markerDiv.appendChild(confidenseDiv);
	//canvas
	markerDiv.appendChild(canvasDiv);
	return markerDiv


}

function create_canvas_div(width, height, canvas){
	var tableDiv = document.createElement("div");
	tableDiv.setAttribute("width", width);
	tableDiv.setAttribute("height", height);
	tableDiv.appendChild(canvas);
	return tableDiv
}


function create_canvas(base64Img, pothole, width, height){
	var canvas = document.createElement('canvas');
	var img = new Image();
	canvas.setAttribute("id", "myImg");
	canvas.setAttribute("alt", "");
	
	//img.src = "data:image/jpg;base64," + reportArray[4];
	canvas.setAttribute("width", width);
	canvas.setAttribute("height", height);
	
	var ctx = canvas.getContext('2d');
	img.onload  = function(){
		ctx.drawImage(img, 0,0, img.width, img.height, 0, 0, canvas.width, canvas.height);
		ctx.beginPath();
		
		var scale = canvas.width / img.width;
		
		x = parseInt(pothole[0]) * scale;
		y = parseInt(pothole[1]) * scale;
		w = parseInt(pothole[2]) * scale;
		h = parseInt(pothole[3]) * scale;
		ctx.lineWidth = "1";
		ctx.strokeStyle = "red";
		ctx.rect(x, y, w, h);
		ctx.stroke();
		
	}
	ctx.drawImage(img, 0, 0);
	img.setAttribute("src", "data:image/jpg;base64," + base64Img);

	var modal = document.getElementById("myModal");
			var modalImg = document.getElementById("img01");
			var captionText = document.getElementById("caption");
			canvas.onclick = function () {
				modal.style.display = "block";
				modalImg.src = this.toDataURL();
				captionText.innerHTML = "";
			}
			var span = document.getElementsByClassName("close")[0];
			span.onclick = function () {
				modal.style.display = "none";
			}
	return canvas
}

//Creates a new report and addes it to the database
function writeNewReport(reportId, pictures, reportType, description, lat, long) {
	// A report entry.
	var postData = {
		reportId: reportId,
		reportType: reportType,
		location: [lat, long],
		description: description,
		pictures: pictures
	};

	// Get a key for a new report.
	var newPostKey = firebase.database().ref().child('reports').push().key;

	// Write the new post's data simultaneously in the posts list and the user's post list.
	var updates = {};
	updates['/reports/' + newPostKey] = postData;

	return firebase.database().ref().update(updates);
}

//Remove a key given a ReportKey
//ReportKey is the Idnetifier of every report
function removeReport(reportKey) {
	var newPostKey = firebase.database().ref().child('reports').child(reportKey).remove();
	return firebase.database().ref();
}


function initMap(reportLocation1, reportLocation2) {
	var myLatLng = { lat: parseFloat(reportLocation1), lng: parseFloat(reportLocation2) };
	var mapAlt = new google.maps.Map(document.getElementById("map"));
	var marker = new google.maps.Marker({
		position: myLatLng,
		//map: map,
	});
	marker.setMap(mapAlt);
}
/**
function geocodeFunction() {
	
	
	
}**/
function marker_creator(Pothole_data, key_array, length) {
	var markers = [];
	var streets = [];
	var testing = length;
	var contentString = "HAHA";
	//var map = new google.maps.Map(document.getElementById("map"));
	
	for (var i = 0; i < testing; i++) {
		var latlong = {
			lat: parseFloat(Pothole_data[key_array[i]]['lat']),
			lng: parseFloat(Pothole_data[key_array[i]]['long']),
		}
		var confidense = parseFloat(Pothole_data[key_array[i]]['confidense']);
		var RGB = confidense_to_RGB(confidense);
		var icon = {
			url: 'http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=|' + RGB,
			//size: new google.maps.Size(100,100)
			labelOrigin: new google.maps.Point(10,10),
			anchor: new google.maps.Point(10,10),


		}
		var marker = new google.maps.Marker({
			position: new google.maps.LatLng(latlong),
			map: map,
			icon: icon,
			//labelAnchor: {x:0, y:0},
			label: { 
				text: (i + 1).toString(),
				fontSize: "8px",

			},
			


			clickable: true
		});
		markers.push(marker);
/*
		(function (marker, i) {
			google.maps.event.addListener(marker, 'click', function () {
				infowindow = new google.maps.InfoWindow({ content: contentString + i.toString() });
				infowindow.open(map, marker);
			})
		})(marker, i);*/

	}
	//center map
	center_map(markers);
	//function to detect the change of value in dropdown menu on status bar
	$(document).ready(function () {
		$('.dropdown').each(function (key, dropdown) {
			var $dropdown = $(dropdown);
			$dropdown.find('.dropdown-menu a').on('click', function () {
				$dropdown.find('button').text($(this).text()).append(' <span class="caret"></span>');
				var x = window.prompt("sometext", "defaultText");
			});
		});
	});
	return markers;

}

function confidense_to_RGB(confidense){
	var R  = Math.floor(255);
	var B = 0;
	var gScale = (confidense - 0.5) / (0.5);
	var G = Math.floor(255 * (1 - gScale));
	RGB = R.toString(16) + G.toString(16) + '00'
	return RGB
}

function center_map(marker_array){
	var bounds = new google.maps.LatLngBounds();
	for (var i = 0; i < marker_array.length; i++) {
	 bounds.extend(marker_array[i].getPosition());
	}
	
	map.fitBounds(bounds);
	//map.setZoom(map.getZoom());

}
