var myTable = document.createElement("TABLE");

function initWebsite() {
  if(!firebase.apps.length) {
    firebase.initializeApp({
      apiKey: "AIzaSyDcrzJHNR0lYSO4gWFapG75byPllpzlYSQ",
      authDomain: "epics-smart-city-website.firebaseapp.com",
      databaseURL: "https://epics-smart-city-website.firebaseio.com",
      projectId: "epics-smart-city-website",
      storageBucket: "epics-smart-city-website.appspot.com",
      messagingSenderId: "498032615483"
    });
  }
  
  firebase.database().ref("reports").once("value").then(function(snapshot) {
    var reportsObject = snapshot.val();
    var keys = Object.keys(reportsObject);
    var header_array = ['Index', 'Status', 'Time Stamp', 'Type', 'Image', 'Description'];
    var header = myTable.createTHead();
    var body = document.createElement('tbody');
    
    for(var i = 0; i < keys.length; i++)
    {
      if(i == 0) {
        reportsObject[keys[i]].status = "Resolved";
        reportsObject[keys[i]].timeStamp = "2018.09.04";
      }
      else if(i == 2) {
        reportsObject[keys[i]].type = "Traffic";
      }
      
      reportsObject[keys[i]].month = reportsObject[keys[i]].timeStamp.split(".")[1];
      reportsObject[keys[i]].year = reportsObject[keys[i]].timeStamp.split(".")[0];
    }
    
    myTable.setAttribute('class', 'table  table-hover table-bordered');
    myTable.setAttribute('id','myTable');
    myTable.appendChild(body);
    
    createDropdowns(reportsObject, keys);
    addTableElement(header_array, myTable, 0, header, body);
    
    for (i = 0; i < keys.length; i++){
      var reportStatus = reportsObject[keys[i]]['status'];
      var reportDate = reportsObject[keys[i]]['timeStamp'];
      var reportIssue = reportsObject[keys[i]]['type'];
      var reportPicture = reportsObject[keys[i]]['encodedImage'];
      var reportDescription = reportsObject[keys[i]]['description'];
      var lat = reportsObject[keys[i]]['latitude'];
      var lon = reportsObject[keys[i]]['longitude'];
      var reportArray = [i+1, reportStatus, reportDate, reportIssue, reportPicture, reportDescription, lat, lon]; 
      
      addTableElement(reportArray, myTable, i+1, header, body);
    }
    
    document.body.appendChild(myTable);
    
    updateMap(myTable);
  });
}

function createDropdowns(Pothole_data, keys) {
  var Pothole_dataPH = JSON.parse(JSON.stringify(Pothole_data));
  var DatesPH = new Array();
  var Dates = new Array();
  var Date_values = new Array();
  
  for(var i = 0; i < keys.length; i++) {
    for(var j = i + 1; j < keys.length; j++) {
      if(Pothole_dataPH[keys[i]].year == Pothole_dataPH[keys[j]].year && Pothole_dataPH[keys[i]].month == Pothole_dataPH[keys[j]].month) {
        Pothole_dataPH[keys[j]].year = NaN;
        Pothole_dataPH[keys[j]].month = NaN;
      }
    }
  }
  
  var x = 0;
  
  for(i = 0; i < keys.length; i++) {
    if(!isNaN(Pothole_dataPH[keys[i]].year))
    {
      DatesPH[x] = Pothole_dataPH[keys[i]].year + Pothole_dataPH[keys[i]].month;
      Date_values[x] = parseFloat(Pothole_dataPH[keys[i]].month) + 13*parseFloat(Pothole_dataPH[keys[i]].year);
      
      x++;
    }
  }
  
  var date_index;
  var max_value = 0;
  
  for(i = 0; i < DatesPH.length; i++) {
    max_value = 0;
    
    for(var j = 0; j < DatesPH.length; j++) {
      if (Date_values[j] > max_value) {
        max_value = Date_values[j];
        date_index = j;
      }
    }
    
    Dates[i] = DatesPH[date_index];
    Date_values[date_index] = 0;
  }

  var date_option;
  var date_txt;
  var date_dropdown = document.querySelector("#from_date");
  var date_dropdown2 = document.querySelector("#to_date");
  var Months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  for(i = 0; i < Dates.length; i++) {
    date_option = document.createElement("option");
    date_option.value = Dates[i];
    date_txt = Dates[i];
    date_option.textContent = Months[parseFloat(date_txt[4] + date_txt[5]) - 1] + ' ' + date_txt[0] + date_txt[1] + date_txt[2] + date_txt[3];
    
    date_dropdown.appendChild(date_option);
  }
  
  for(i = 0; i < Dates.length; i++) {
    date_option = document.createElement("option");
    date_option.value = Dates[i];
    date_txt = Dates[i];
    date_option.textContent = Months[parseFloat(date_txt[4] + date_txt[5]) - 1] + ' ' + date_txt[0] + date_txt[1] + date_txt[2] + date_txt[3];
    
    date_dropdown2.appendChild(date_option);
  }
}

function updateMap(table) {
  var map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.4237, lng: -86.9212},
    zoom: 15
  });
  
  for(var i = 0; i < table.rows.length-1; i++)
  {
    if(table.rows[i+1].style.display != "none")
    {
      var latlong = {
    	        lat: parseFloat(table.rows[i+1].cells[6].innerHTML),
    	        lng: parseFloat(table.rows[i+1].cells[7].innerHTML),
    	    }
    	    
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(latlong),
          map: map,
          label: {text: (i+1).toString()},
          clickable: true
        });
        (function(marker, i)
        {
          google.maps.event.addListener(marker,'click', function() {
            infowindow = new google.maps.InfoWindow({content: '<div id="bodyContent"><p><b>Status</b>: '+table.rows[i+1].cells[1].innerHTML+
                                                                                '</p><p><b>Issue</b>: '+table.rows[i+1].cells[3].innerHTML+
                                                                                '</p><p><b>Description</b>: '+table.rows[i+1].cells[5].innerHTML+
                                                                                '</p><p><img style="max-width:200px;max-height:100px;width:auto;height:auto"'+table.rows[i+1].cells[4].innerHTML.slice(5, )+'</p></div>'});
            infowindow.open(map, marker);
          })
        })(marker,i);
    }
  }
}

function addTableElement(reportArray, z1, rowNum, header, body) {
  if(rowNum == 0){
    var row = header.insertRow(rowNum);
  }
  else {
    var row = body.insertRow(rowNum-1);
  }
    
  var cell0 = row.insertCell(0);
  var cell1 = row.insertCell(1);
  var cell2 = row.insertCell(2);
  var cell3 = row.insertCell(3);
  var cell4 = row.insertCell(4);
  var cell5 = row.insertCell(5);
  var cell6 = row.insertCell(6);
  var cell7 = row.insertCell(7);
  var img = document.createElement("IMG");

  cell0.setAttribute("width", "3%");
  cell1.setAttribute("width", "8%");
  cell2.setAttribute("width", "12%");
  cell3.setAttribute("width", "10%");
  cell4.setAttribute("width", "15%");
  cell5.setAttribute("width", "25%");
  cell6.style.display = "none";
  cell7.style.display = "none";
  
  cell0.innerHTML = reportArray[0];
  cell1.innerHTML = reportArray[1];
  cell2.innerHTML = reportArray[2];
  cell3.innerHTML = reportArray[3];
  cell5.innerHTML = reportArray[5];
  cell6.innerHTML = reportArray[6];
  cell7.innerHTML = reportArray[7];

  if(rowNum == 0){
    cell4.innerHTML = "Image";
  }
  else {
    if(reportArray[4] == 'no image') {
      cell4.innerHTML = "no image";
    }
    else {
      var modal = document.getElementById("myModal");
      var modalImg = document.getElementById("img01");
      var captionText = document.getElementById("caption");
      var span = document.getElementsByClassName("close")[0];
      
      img.setAttribute("src", "data:image/jpg;base64," + reportArray[4]);
      img.setAttribute("width", "auto");
      img.setAttribute("height", "auto");
      img.setAttribute("style", "max-width:200px;max-height:100px");
      img.setAttribute("id", "myImg");
      img.setAttribute("alt", "");
      
      img.onclick = function() {
        modal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
      }
      
      span.onclick = function() {
        modal.style.display = "none";
      }
      
      cell4.appendChild(img)
    }
  }
}

function checkDropdown() {
  var status = document.getElementById("status").value;
  var type = document.getElementById("type").value;
  var fromDate = document.getElementById("from_date").value;
  var toDate = document.getElementById("to_date").value;
  
	filterTable("all","-1");
  
  if((status != "all"))
  {
  	filterTable(status, 1);
  }
  
  if((type != "all"))
  {
  	filterTable(type, 3);
  }
  
  if((fromDate != "all") && (toDate == "all"))
  {
  	filterTable(fromDate, 2);
  }
  else if((fromDate == "all") && (toDate != "all"))
  {
    filterTable(toDate, 22);
  }
  else
  {
    filterTable(fromDate.concat("/").concat(toDate), 222)
  }
  
  updateMap(myTable);
}

function filterTable(inVar, columnNum) {
  var table = document.getElementById("myTable");
  
  for (i = 1; i < table.rows.length; i++) {
    if(columnNum == "-1")
    {
      table.rows[i].style.display = "";
    }
    else if((columnNum != "2" && columnNum != "22" && columnNum != "222") && table.rows[i].cells[columnNum].innerHTML != inVar) {
      table.rows[i].style.display = "none";
	  }
    else if(columnNum == "2" || columnNum == "22" || columnNum == "222")
    {
      var month0 = inVar.slice(4, 6);
      var year0 = inVar.slice(0, 4);
      
      if(columnNum == "2")
      {
        if(parseInt(table.rows[i].cells[columnNum].innerHTML.split(".")[0]) < parseInt(year0))
        {
          table.rows[i].style.display = "none";
        }
        else if(parseInt(table.rows[i].cells[columnNum].innerHTML.split(".")[0]) == parseInt(year0) && parseInt(table.rows[i].cells[columnNum].innerHTML.split(".")[1]) < parseInt(month0))
        {
          table.rows[i].style.display = "none";
        }
      }
      else if(columnNum == "22")
      {
        if(parseInt(table.rows[i].cells[columnNum-20].innerHTML.split(".")[0]) > parseInt(year0))
        {
          table.rows[i].style.display = "none";
        }
        else if(parseInt(table.rows[i].cells[columnNum-20].innerHTML.split(".")[0]) == parseInt(year0) && parseInt(table.rows[i].cells[columnNum-20].innerHTML.split(".")[1]) > parseInt(month0))
        {
          table.rows[i].style.display = "none";
        }
      }
      else
      {
        var month1 = inVar.slice(11, 13);
        var year1 = inVar.slice(7, 11);
        
        if(parseInt(table.rows[i].cells[columnNum-220].innerHTML.split(".")[0]) < parseInt(year0) || parseInt(table.rows[i].cells[columnNum-220].innerHTML.split(".")[0]) > parseInt(year1))
        {
          table.rows[i].style.display = "none";
        }
        else if((parseInt(table.rows[i].cells[columnNum-220].innerHTML.split(".")[0]) == parseInt(year0) && parseInt(table.rows[i].cells[columnNum-220].innerHTML.split(".")[1]) < parseInt(month0)) || (parseInt(table.rows[i].cells[columnNum-220].innerHTML.split(".")[0]) == parseInt(year1) && parseInt(table.rows[i].cells[columnNum-220].innerHTML.split(".")[1]) > parseInt(month1)))
        {
          table.rows[i].style.display = "none";
        }
      }
    }
  }
}