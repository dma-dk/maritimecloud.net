//
//Prototype functions
//===================
Array.prototype.contains = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === v) return true;
    }
    return false;
};
Array.prototype.containsType = function(v) {
    for(var i = 0; i < this.length; i++) {
        if(this[i].type === v) return true;
    }
    return false;
};

Array.prototype.unique = function() {
    var arr = [];
    for(var i = 0; i < this.length; i++) {
        if(!arr.contains(this[i])) {
            arr.push(this[i]);
        }
    }
    return arr;
}

//
//Map styles
//===================

var style = {
    fillColor: '#00000',
    fillOpacity: 0.1,
    strokeWidth: 0
};
//Service polygon styles
var defaultServiceStyle = {fillColor: "#ee9900", fillOpacity: 0.1, strokeWidth: 1, strokeColor: '#ee9900'};
var selectedServiceStyle = {fillColor: "#ee9900", fillOpacity: 0.3,  strokeWidth: 3, strokeColor: '#000000'};
var mouseMarkerStyle = {
    handlerOptions: {
        freehand: true,
        style: {
            fillColor: "black",
            fillOpacity: 0.4,
            strokeColor: "black",
            strokeOpacity: 1,
            strokeWidth: 2,
            pointRadius: 3
        }
    }
};

//
//Map init
//===================


var WGS84 = new OpenLayers.Projection("EPSG:900913");       // WGS 1984
var Spherical = new OpenLayers.Projection("EPSG:4326");     // Spherical Mercator

var map = new OpenLayers.Map('map', {
    projection: new OpenLayers.Projection("EPSG:900913")
});

var layer = new OpenLayers.Layer.OSM('Simple OSM Map');
var ownPosLayer = new OpenLayers.Layer.Vector('Own pos Layer');
map.addLayers([layer, ownPosLayer]);

// allow testing of specific renderers via "?renderer=Canvas", etc
var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

var markerLayer = new OpenLayers.Layer.Vector("Marker Layer", {
    renderers: renderer
});
map.addLayers([markerLayer]);

//adding map marker control
var markerControl = new OpenLayers.Control.DrawFeature(markerLayer,OpenLayers.Handler.Point,mouseMarkerStyle);
map.addControl(markerControl);

//adding geolocation control
var geolocate = new OpenLayers.Control.Geolocate({
    bind: false,
    geolocationOptions: {
        enableHighAccuracy: false,
        maximumAge: 0,
        timeout: 7000
    }
});
map.addControl(geolocate);

map.setCenter(
    new OpenLayers.LonLat(12.55854, 55.676036).transform(
        new OpenLayers.Projection("EPSG:4326"),
        map.getProjectionObject()
    ), 5
);


//Array to hold current selected services
var currentServices = [];

//
//json service consuming
//

var polyServiceVector = new OpenLayers.Layer.Vector('Polygons form Service Layer');
var serviceHeadlines = [];
var polygonCollection = [];
var polygonCollectionWGS = [];

for (i=0;i<service.length;i++){
    //collect service headlines
    serviceHeadlines.push(service[i].specification.operationalService.name);

    //console.log("name: "+service[i].name);
    if (service[i].extent.area.type == 'polygon'){
        //polygons
        var tempPoints = service[i].extent.area.points;
        var tempPoint;
        var tempPointWGS;
        var olPoints = [];
        var olPointsWGS = [];
        for (j=0;j<tempPoints.length;j++){
            tempPoint = new OpenLayers.Geometry.Point(tempPoints[j].lon, tempPoints[j].lat);
            tempPointWGS = new OpenLayers.Geometry.Point(tempPoints[j].lon, tempPoints[j].lat).transform(Spherical,WGS84);
            olPoints.push(tempPoint);
            olPointsWGS.push(tempPointWGS);
        }
        var polygon = new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(olPoints)]);
        var polygonWGS = new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(olPointsWGS)]);
        polygonCollection.push(polygon);
        polygonCollectionWGS.push(polygonWGS);

        var tempPolyFeature = new OpenLayers.Feature.Vector(polygonWGS);
        tempPolyFeature.id = service[i].name;
        tempPolyFeature.data = {type: "polygon"};
        polyServiceVector.addFeatures([tempPolyFeature]);
    }

    else if (service[i].extent.area.type == 'circle'){
        //circles
        var tempCenterPoint = new OpenLayers.Geometry.Point(service[i].extent.area.points[0].lon,
            service[i].extent.area.points[0].lat);
        var tempCenterPointWGS = new OpenLayers.Geometry.Point(service[i].extent.area.points[0].lon,
            service[i].extent.area.points[0].lat).transform(Spherical,WGS84);
        var tempRadius = service[i].extent.area.radius;
        //control of circles with no area
        if (tempRadius == 0){
            var circlePolygon = tempCenterPoint;
            var circlePolygonWGS = tempCenterPointWGS;

        }
        else{
            var testPoints = calculateRing(tempCenterPoint.x,tempCenterPoint.y, tempRadius/1000, 30);
            var testPointsWGS = [];
            for (j=0;j<testPoints.length;j++){
                testPointsWGS[j]=testPoints[j].transform(Spherical,WGS84);
            }
            var circlePolygon = new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(testPoints)]);
            var circlePolygonWGS = new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(testPointsWGS)]);

        }

        polygonCollection.push(circlePolygon);
        polygonCollectionWGS.push(circlePolygonWGS);

        var tempCircleFeature = new OpenLayers.Feature.Vector(circlePolygonWGS);
        tempCircleFeature.id = service[i].name;
        tempCircleFeature.data = {type: "circle", center: tempCenterPoint, radius: tempRadius};
        polyServiceVector.addFeatures([tempCircleFeature]);
    }
}
map.addLayers([polyServiceVector]);

//make serviceHeadlines unique values
serviceHeadlines = serviceHeadlines.unique();

//hide all service polygons
hideAllFeatures(polyServiceVector);

//
//Defalut: 1) All services shown 2) Marker tool activated
//
markerControl.activate();
//All services are shown on startup as default
var features = polyServiceVector.features;
//Show all services in list
currentServices = [];
for (i=0;i<features.length;i++) currentServices.push({type: service[i].specification.operationalService.name, title: service[i].name});
//Show all service polygons
for (i=0;i<features.length;i++) features[i].style = defaultServiceStyle;
//force redraw
polyServiceVector.redraw();

//function to be run after each mouse marker event
markerControl.events.register('featureadded', markerControl, function(f) {

    //delete last marker
    var markerFeatures = markerLayer.features;
    markerLayer.removeFeatures(markerFeatures[0]);
    if (markerFeatures.length > 0) {
        markerLayer.removeFeatures(markerFeatures[0]);
    }

    //remove own position when using marker tool
    ownPosLayer.removeAllFeatures();

    //un-check all options on #filter selector
    var radio = document.getElementById('mapform');
    for(var i=0;i<radio.length;i++)
        radio[i].checked = false;

    //change style of marker
    markerLayer.addFeatures([
        new OpenLayers.Feature.Vector(
            new OpenLayers.Geometry.Point(f.feature.geometry.x,f.feature.geometry.y),
            {},
            {
                graphicName: 'circle',
                strokeColor: '#000000',
                strokeWidth: 2,
                fillOpacity: 0.8,
                pointRadius: 3
            }
        )
    ]);

    //empty memory
    currentServices = [];
    hideAllFeatures(polyServiceVector);

    //get postion of marker to check services availability
    var latLon = new OpenLayers.Geometry.Point(f.feature.geometry.x,f.feature.geometry.y).transform(WGS84,Spherical);

     //main loop to control services to show
    var serviceFeatures = polyServiceVector.features;
    showSelectedFeatures(latLon,serviceFeatures);

    //force redraw
    polyServiceVector.redraw();

    //getting right scope and forcing angular to apply changes
    var selector = angular.element(document.getElementById("services"));
    geolocationCtrl(selector.scope());
    selector.scope().$apply();
});

var pulsate = function(feature) {
    var point = feature.geometry.getCentroid(),
        bounds = feature.geometry.getBounds(),
        radius = Math.abs((bounds.right - bounds.left)/2),
        count = 0,
        grow = 'up';

    var resize = function(){
        if (count>16) {
            clearInterval(window.resizeInterval);
        }
        var interval = radius * 0.03;
        var ratio = interval/radius;
        switch(count) {
            case 4:
            case 12:
                grow = 'down'; break;
            case 8:
                grow = 'up'; break;
        }
        if (grow!=='up') {
            ratio = - Math.abs(ratio);
        }
        feature.geometry.resize(1+ratio, point);
        ownPosLayer.drawFeature(feature);
        count++;
    };
    window.resizeInterval = window.setInterval(resize, 50, point, radius);
};

//function to be run after each geolocate event
geolocate.events.register("locationupdated",geolocate,function(e) {
    ownPosLayer.removeAllFeatures();
    var circle = new OpenLayers.Feature.Vector(
        OpenLayers.Geometry.Polygon.createRegularPolygon(
            new OpenLayers.Geometry.Point(e.point.x, e.point.y),
            e.position.coords.accuracy/2,
            40,
            0
        ),
        {},
        style
    );
    ownPosLayer.addFeatures([
        new OpenLayers.Feature.Vector(
            e.point,
            {},
            {
                graphicName: 'circle',
                strokeColor: '#000000',
                strokeWidth: 2,
                fillOpacity: 0.8,
                pointRadius: 3
            }
        ),
        circle
    ]);

    pulsate(circle);
    this.bind = true;

    //
    //which services to show:
    //

    //get postion of user
    var latLon = new OpenLayers.Geometry.Point(e.point.x,e.point.y).transform(WGS84,Spherical);

    //empty memory
    currentServices = [];
    hideAllFeatures(polyServiceVector);

    //find services to show
    var serviceFeatures = polyServiceVector.features;
    showSelectedFeatures(latLon,serviceFeatures);

    //force redraw
    polyServiceVector.redraw();

    //getting right scope and forcing angular to apply changes
    var selector = angular.element(document.getElementById("services"));
    geolocationCtrl(selector.scope());
    selector.scope().$apply();

    map.setCenter(
        new OpenLayers.LonLat(e.point.x, e.point.y), 5);

});
geolocate.events.register("locationfailed",this,function() {
    OpenLayers.Console.log('Location detection failed');
});

//Control of #filter radio-buttons
document.getElementById('mapform').onclick = function() {

    var radios = document.getElementsByName('maptype');

    //Own position filter
    if (radios[1].checked) {
        //clean up
        currentServices = [];
        hideAllFeatures(polyServiceVector);

        markerLayer.removeAllFeatures();
        markerControl.deactivate();

        ownPosLayer.removeAllFeatures();
        geolocate.deactivate();

        geolocate.activate();
        markerControl.activate();

        //getting right scope and forcing angular to apply changes
        var selector = angular.element(document.getElementById("services"));
        geolocationCtrl(selector.scope());
        selector.scope().$apply();
    }
    //Show all services
    else if (radios[0].checked) {
        //clean up
        //markerControl.deactivate();
        geolocate.deactivate();

        markerLayer.removeAllFeatures();
        ownPosLayer.removeAllFeatures();

        var features = polyServiceVector.features;

        //Show all services in list
        showAllServices(features);
        //Show all service polygons
        for (i=0;i<features.length;i++){
                //Showing polygons
                features[i].style = defaultServiceStyle;
        }
        //force redraw
        polyServiceVector.redraw();
    }
};

//Angular stuff
function geolocationCtrl($scope) {

    //
    //Hide/show detailed info
    //

    $scope.showHideInfoBox=false;
    $scope.showHideButtonText='Show details';

    $scope.extendInfoBox = function(){
        var elem = document.getElementById("showHideButton");
        if (elem.value=="Hide details") {
            $scope.showHideInfoBox=false;
            elem.value = "Show details";
        }
        else {
            $scope.showHideInfoBox=true;
            elem.value = "Hide details";
        }
    }

    //making serviceHeadlines an Angular array
    $scope.serviceHeadlines = serviceHeadlines;
    //making currentServices an Angular array
    $scope.servicesAngular = currentServices;

    //control of info-box visibility
    $scope.showInfoBox = false;

    /*
    //Filter on services
    $scope.authorityFilter = "Tugs service";
    $scope.commercialFilter = "Local Port Service (LPS)";



    var indexTest1 = currentServices.length;
    while( indexTest1-- ) {
        console.log("typRR: "+currentServices[indexTest1].type);
        if( currentServices[indexTest1].type == $scope.authorityFilter ) break;
    }
    console.log("indexTest1 "+indexTest1);
    $scope.authorityServices = true;
    if (indexTest1==-1) $scope.authorityServices=false;

    var indexTest2 = currentServices.length;
    while( indexTest2-- ) if( currentServices[indexTest2].type == $scope.commercialFilter ) break;
    $scope.commercialServices = true;
    if (indexTest2==-1) $scope.commercialServices=false;


    $scope.selectedIndex1 = -1;
    $scope.selectedIndex2 = -1;
    */

    //control #noServices information
    $scope.noServices = function(){
        if (currentServices.length == 0) return true;
        else return false;
    }

    //hide headlines if no services in category
    $scope.checkHeadline = function(headLine) {
        return currentServices.containsType(headLine);
    }

    //function to marked selected service in map and show infobox
    $scope.markService = function(clickedTitle,$index) {
        $scope.markedTitle = clickedTitle;
        $scope.selectedIndex = $index;

        //info-box string variables
        $scope.provider = '';
        $scope.method = '';
        $scope.endpoints = [];
        $scope.endpointUrl='';
        $scope.urlShorted='';

        //show internet URL or not
        $scope.isInternet = true;

        //clear all styling of current service polygons
        for (i=0;i<currentServices.length;i++){
            //Resetting polygon styles
            var tempFeature = polyServiceVector.getFeatureById(currentServices[i].title);
            tempFeature.style = defaultServiceStyle;
        }

        //and style the selected service polygon
        var markedFeature = polyServiceVector.getFeatureById(clickedTitle);
        markedFeature.style = selectedServiceStyle;

        //zoomToFeature
        var markedFeatureBounds = markedFeature.geometry.getBounds();
        //service with no area
        if (markedFeatureBounds.left==markedFeatureBounds.right || markedFeatureBounds.top==markedFeatureBounds.bottom){
            map.setCenter(new OpenLayers.LonLat(markedFeatureBounds.left,markedFeatureBounds.top),8);
        }
        //service with an area
        else map.zoomToExtent(markedFeatureBounds, closest=false);

        //when service is clicked show infobox
        $scope.showInfoBox = true;

        //control when there is endpoint
        $scope.isEndpoint = true;

        //control when there is internet url
        $scope.isInternetUrl = true;

        //
        //populating infobox
        //
        var indexOfSerivce = service.length;
        while( indexOfSerivce-- ) if( service[indexOfSerivce].name == clickedTitle ) break;

        var currentService = service[indexOfSerivce];
        $scope.instanceName = currentService.name;
        $scope.provider = currentService.provider.name + " ("+currentService.provider.id +")";
        $scope.operationalService = currentService.specification.operationalService.name;
        $scope.serviceID = currentService.specification.serviceId;
        $scope.serviceName = currentService.specification.name;
        $scope.serviceVersion = currentService.specification.version;
        $scope.serviceVariant = currentService.specification.variant;
        $scope.serviceTransport = currentService.specification.transport;
        //no endpoint in service
        if (currentService.endpoint==undefined) {
            $scope.isEndpoint=false;
            $scope.description= currentService.description;
            $scope.endpoints = [];
            $scope.endpointUrl='';
            $scope.urlShorted='';
        //endpoint in service
        } else {
            if (currentService.endpoint[0].type=="URL") $scope.isInternetUrl = true;
            else $scope.isInternetUrl = false;

            $scope.isEndpoint=true;
            $scope.description="";
            for(var i=0; i < currentService.endpoint.length; i++){
                $scope.endpoints[i] = { type:currentService.endpoint[i].type,
                                    url:currentService.endpoint[i].url,
                                    shortUrl:currentService.endpoint[i].url.slice(0,30)+"..."};
            }
            $scope.endpointUrl=currentService.endpoint[0].url;
            $scope.urlShorted=currentService.endpoint[0].url.slice(0,30)+"...";
        }
        polyServiceVector.redraw();
    }

}
//will show all services from json array
function showAllServices(features){
    currentServices = [];

    //getting right scope
    var serviceListDiv=document.getElementById("services");
    var selector = angular.element(serviceListDiv);

    geolocationCtrl(selector.scope());
    selector.scope().$apply();

    for (i=0;i<features.length;i++){
        currentServices.push({type: service[i].specification.operationalService.name, title: service[i].name});
    }
    geolocationCtrl(selector.scope());
    selector.scope().$apply();
}

//will show all features from json array
function hideAllFeatures(fromLayer){
    var features = fromLayer.features;
    for( var i = 0; i < features.length; i++ ) {
        features[i].style = { display: 'none' };
    }
    fromLayer.redraw();
}

//will show selected services from json array
function showSelectedFeatures(testPoint,serviceFeatures){
    for (var i=0;i<serviceFeatures.length;i++){
        //is marker position inside polygon?
        //polygon
        if (serviceFeatures[i].data.type == 'polygon'){
            if (polygonCollection[i].containsPoint(testPoint)) {
                //push to list of current services
                currentServices.push({type: service[i].specification.operationalService.name, title: service[i].name});
                //Showing polygons
                serviceFeatures[i].style = defaultServiceStyle;
            }
        }
        else if (serviceFeatures[i].data.type == 'circle'){
            var testDistance = getDistanceFromLatLonInM(serviceFeatures[i].data.center.y,serviceFeatures[i].data.center.x,testPoint.y,testPoint.x);

            if(testDistance<=serviceFeatures[i].data.radius){
                //push to list of current services
                currentServices.push({type: service[i].specification.operationalService.name, title: service[i].name});
                //Showing polygons
                serviceFeatures[i].style = defaultServiceStyle;
            }
        }
    }
}

//
// Geo helping functions
//
function toRad(degree) {
    return degree / 360 * 2 * Math.PI;
}
function toDegree(rad) {
    return rad * 360 / 2 / Math.PI;
}

function calculateRing(longitude, latitude, radius, noPoints) {
    var points = [];
    var lat1 = toRad(latitude);
    var lon1 = toRad(longitude);
    var R = 6371; // earths mean radius
    var d = radius;
    for (var i = 0; i < noPoints; i++) {
        var brng = Math.PI * 2 * i / noPoints;
        var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) +
            Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );
        var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1),
            Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));

        points.push(new OpenLayers.Geometry.Point(toDegree(lon2), toDegree(lat2)));
    }
    return points;
}

function getDistanceFromLatLonInM(lat1,lon1,lat2,lon2) {
    var R = 6371000; // Radius of the earth in m
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1);
    var a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                    Math.sin(dLon/2) * Math.sin(dLon/2)
        ;
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c; // Distance in m
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}