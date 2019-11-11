var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
function buildFilters(){
  buildStreetFilter();
  buildDateFilter();
}

var date_sort_desc = function (date1, date2) {
  // This is a comparison function that will result in dates being sorted in
  // DESCENDING order.
  if (date1 > date2) return -1;
  if (date1 < date2) return 1;
  return 0;
};


function buildStreetFilter(){
  var i;
  var Streets = new Set();
  var streetDropdown = document.querySelector("#street_select");
  i = 0;
  for (i = 0; i < potholeData.length; i++){
    address = potholeData[i]["address"];
    var StreeAddress = address.split(",")[0].split(" ").slice(1,100).join(" ");
    potholeData[i]["address"] = StreeAddress;
    Streets.add(StreeAddress);
  }
  for(var street of Streets){
    streetOption = document.createElement("option");
    streetOption.value = street;
    streetOption.textContent = street;
    streetDropdown.appendChild(streetOption);
  }
  console.log(Streets);
}


function buildDateFilter(){
  var i;
  var DatesSet = new Set();
  var DatesArray = new Array();
  var fromDateDropdown = document.querySelector("#date_select");
  var toDateDropdown = document.querySelector("#up_to_date");
  for(i = 0; i < potholeData.length; i ++ ){
    var date = potholeData[i]["Date"].slice(0,10).split("-");
    var dateObject = new Date(date[2], date[1], date[0]);
    if (DatesSet.has(dateObject.getMonth() + " " + dateObject.getFullYear()) == false){
      DatesSet.add(dateObject.getMonth() + " " + dateObject.getFullYear());
      DatesArray.push(dateObject);
    }
    potholeData[i]["Date"] = dateObject
    
  }
  DatesArray.sort(date_sort_desc);
  //console.log(Dates);

  var date;
  for (i = 0; i < DatesArray.length; i++){
    date = months[DatesArray[i].getMonth()] + " " + DatesArray[i].getFullYear();
    dateOption = document.createElement("option");
    dateOption.value = date;
    dateOption.textContent = date;
    fromDateDropdown.appendChild(dateOption);

    dateOption2 = document.createElement("option");
    dateOption2.value = date;
    dateOption2.textContent = date;
    toDateDropdown.appendChild(dateOption2);
  }
}

function clearMarkers(){
  var i;
  for(i = 0; i < markers.length; i++){
    markers[i].setMap(null);
  }
}

function checkDate(date){
  var fromDateDropdown = document.querySelector("#date_select");
  var toDateDropdown = document.querySelector("#up_to_date");
  var toAll = false;
  var fromAll = false;

  var fromDate = fromDateDropdown.options[fromDateDropdown.selectedIndex].value;
  var toDate = toDateDropdown.options[toDateDropdown.selectedIndex].value;

  if(fromDate == "all"){
    fromAll = true;
  }
  else{
    var split = fromDate.split(" ");
    fromDate = new Date(split[1], months.indexOf(split[0]), 0);
  }

  if(toDate == "all"){
    toAll = true;
  }
  else{
    var split = toDate.split(" ");
    toDate = new Date(split[1], months.indexOf(split[0]), 31);
  }

  if(fromAll && toAll){
    return true;
  }
  if (toAll && (fromAll <= date)){
    return true
  }
  if(fromAll && (toDate >= date)){
    return true
  }
  if(fromAll <= date && toDate >= date){
    return true;
  }
  return false;
}

function checkStatus(status){
  var statusDropdown = document.querySelector("#statusDrop");
  var statusValue = statusDropdown.options[statusDropdown.selectedIndex].value;
  if (statusValue == "all" || statusValue == status){
    return true;
  }
  return false;
}

function checkStreet(street){
  var streetDropdown = document.querySelector("#street_select");
  var streetValue = streetDropdown.options[streetDropdown.selectedIndex].value;

  if (streetValue == "all" || streetValue == street){
    return true;
  }
  return false;
}

function addTableRow(reportMap, tableBody, rowNum){
  var row = tableBody.insertRow(rowNum);
  row.setAttribute("height", "300");

  //create necessary cells
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
  var date = reportMap["Date"];
  dateCell.innerHTML = date.getDate() + "-" + date.getMonth() + "-" + date.getFullYear();
  timeCell.innerHTML = reportMap["Time"];
  confCell.innerHTML = reportMap["confidense"];
  imgCell.appendChild(reportMap["reportPicture"]);
}

function clearTable(table) {
  //var firstRow = table.tHead;
  var tBody = table.tBodies[0].cloneNode(false);
  //tBody.appendChild(firstRow);
  table.replaceChild(tBody, table.tBodies[0]);
  return tBody;
}

function filterData(){
  clearMarkers();
  var mainTable = document.querySelector("#mainTable");

  var body = clearTable(mainTable);
   
  
  var i;
  //clear table
  
  var count = 0;
  for(i = 0; i < potholeData.length; i++){
    var dateCheck = checkDate(potholeData[i]["Date"]);

    var statusCheck = checkStatus(potholeData[i]["Status"]);
    var streetCheck = checkStreet(potholeData[i]["address"]);
    if (dateCheck && statusCheck && streetCheck){
      markers[i].setMap(map);
      addTableRow(potholeData[i], body, count);
      count++;
    }
  }
  
}



