//Example from http://openlayers.org/dev/examples/geolocation.html

var style = {
    fillColor: '#00000',
    fillOpacity: 0.1,
    strokeWidth: 0
};
//Service polygon styles
var defaultServiceStyle = {fillColor: "#ee9900", fillOpacity: 0.1, strokeWidth: 1, strokeColor: '#ee9900'};
var selectedServiceStyle = {fillColor: "#ee9900", fillOpacity: 0.3,  strokeWidth: 1, strokeColor: '#000000'};
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

/*
var defaultServiceStyle = new OpenLayers.Style({
    'fillColor': "#ee9900",
    'fillOpacity': 0.1,
    'strokeWidth': 1,
    'strokeColor': "#ee9900"
});


var selectedServiceStyle = new OpenLayers.Style({
    'fillColor': "#ee9900",
    'fillOpacity': 0.3,
    'strokeWidth': 1,
    'strokeColor': "#000000"
});
*/

var currentServices = [];

var WGS84 = new OpenLayers.Projection("EPSG:900913");       // WGS 1984
var Spherical = new OpenLayers.Projection("EPSG:4326");     // Spherical Mercator

var map = new OpenLayers.Map('map', {
    projection: new OpenLayers.Projection("EPSG:900913"),
    units: "ft"
});
map.addControl(new OpenLayers.Control.ScaleLine({geodesic: true}));

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

var markerControl = new OpenLayers.Control.DrawFeature(markerLayer,OpenLayers.Handler.Point,mouseMarkerStyle);
map.addControl(markerControl);



//
//json service testing
//
var serviceTitles = [];
var polygonCollection = [];
var polygonCollectionWGS = [];
var polyServiceVector = new OpenLayers.Layer.Vector('Polygons form Service Layer');
for (i=0;i<service.length;i++){
    //titles
    serviceTitles.push(service[i].description);

    if (service[i].extent.area.type == 'polygon'){
        //polygons
        console.log("inside poly");
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
        tempPolyFeature.id = serviceTitles[i];
        tempPolyFeature.data = {type: "polygon"};
        polyServiceVector.addFeatures([tempPolyFeature]);
    }

    else if (service[i].extent.area.type == 'circle'){
        //circles
        console.log("inside circle");
        var tempCenterPoint = new OpenLayers.Geometry.Point(service[i].extent.area.points[0].lon,
            service[i].extent.area.points[0].lat);
        var tempCenterPointWGS = new OpenLayers.Geometry.Point(service[i].extent.area.points[0].lon,
            service[i].extent.area.points[0].lat).transform(Spherical,WGS84);

        var tempRadius = service[i].extent.area.radius;

        var testPoints = calculateRing(tempCenterPoint.x,tempCenterPoint.y, tempRadius/1000, 30);
        var testPointsWGS = [];
        for (j=0;j<testPoints.length;j++){
            testPointsWGS[j]=testPoints[j].transform(Spherical,WGS84);
        }
        var testPolygonWGS = new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(testPointsWGS)]);
        var testCircleFeature = new OpenLayers.Feature.Vector(testPolygonWGS);
        testCircleFeature.id = serviceTitles[i];
        console.log("cicle titles: "+serviceTitles[i]);
        testCircleFeature.data = {type: "circle", center: tempCenterPoint, radius: tempRadius};
        polyServiceVector.addFeatures([testCircleFeature]);
    }
}
map.addLayers([polyServiceVector]);

//hide all service polygons
hideAllFeatures(polyServiceVector);

markerControl.events.register('featureadded', markerControl, function(f) {



    //delete last marker
    var markerFeatures = markerLayer.features;
    markerLayer.removeFeatures(markerFeatures[0]);
    if (markerFeatures.length > 0) {
        markerLayer.removeFeatures(markerFeatures[0]);
    }

    //remove own position when using marker tool
    ownPosLayer.removeAllFeatures();

    //un-check all options on tool selector
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
    console.log("@ "+latLon.x+","+latLon.y);

    //main loop to control services to show
    var serviceFeatures = polyServiceVector.features;
    showSelectedFeatures(latLon,serviceFeatures);

    //force redraw
    polyServiceVector.redraw();

    //getting right scope and forcing angular to apply changes
    var selector = angular.element(document.getElementById("serviceList"));
    geolocationCtrl(selector.scope());
    selector.scope().$apply();
});

map.setCenter(
    new OpenLayers.LonLat(12.55854, 55.676036).transform(
        new OpenLayers.Projection("EPSG:4326"),
        map.getProjectionObject()
    ), 5
);


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

var geolocate = new OpenLayers.Control.Geolocate({
    bind: false,
    geolocationOptions: {
        enableHighAccuracy: false,
        maximumAge: 0,
        timeout: 7000
    }
});
map.addControl(geolocate);
//var firstGeolocation = true;
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
    //if (firstGeolocation) {
        //map.zoomToExtent(vector.getDataExtent());
        pulsate(circle);
        //firstGeolocation = false;
        this.bind = true;
    //}

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
    var selector = angular.element(document.getElementById("serviceList"));
    geolocationCtrl(selector.scope());
    selector.scope().$apply();

    map.setCenter(
        new OpenLayers.LonLat(e.point.x, e.point.y), 5
    );

});
geolocate.events.register("locationfailed",this,function() {
    OpenLayers.Console.log('Location detection failed');
});

//Own position and marker tool is default
geolocate.activate();
markerControl.activate();


document.getElementById('mapform').onclick = function() {

    var radios = document.getElementsByName('maptype');

    //Own position filter
    if (radios[0].checked) {
        console.log("Own position checked");

        //clean up
        currentServices = [];
        hideAllFeatures(polyServiceVector);

        markerLayer.removeAllFeatures();
        markerControl.deactivate();

        ownPosLayer.removeAllFeatures();
        geolocate.deactivate();

        geolocate.activate();
        markerControl.activate();
    }
    //Marker Positon filter
    /*
    else if (radios[1].checked) {
        console.log("Marker position checked");

        //clean up
        currentServices = [];
        hideAllFeatures(polyServiceVector);

        var serviceListDiv=document.getElementById("serviceList");
        var selector = angular.element(serviceListDiv);
        geolocationCtrl(selector.scope());
        selector.scope().$apply();

        ownPosLayer.removeAllFeatures();
        geolocate.deactivate();

        markerControl.activate();
    }
    */
    //No filter
    else if (radios[1].checked) {
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
    else console.log("not hit");

};

//Angular stuff
function geolocationCtrl($scope) {
    //control of info-box visibility
    $scope.showInfoBox = false;

    //info-box string variables



    $scope.serviceTitles = currentServices;


    $scope.selectedIndex = -1;

    $scope.markService = function(clickedTitle,$index) {
        $scope.provider = '';
        $scope.method = '';
        $scope.endpoints = {};
        $scope.endpointUrl = '';
        $scope.isInternet = true;


        $scope.selectedIndex = $index;

        //clear all styling of current service polygons
        for (i=0;i<currentServices.length;i++){
            //Resetting polygon styles
            var tempFeature = polyServiceVector.getFeatureById(currentServices[i]);
            tempFeature.style = defaultServiceStyle;
        }

        //and style the selected service polygon
        var markedFeature = polyServiceVector.getFeatureById(clickedTitle);
        markedFeature.style = selectedServiceStyle;

        //when service is clicked show infobox
        $scope.showInfoBox = true;

        //populating infobox
        var indexOfSerivce = service.length;
        while( indexOfSerivce-- ) if( service[indexOfSerivce].description == clickedTitle ) break;

        console.log("provider: "+service[indexOfSerivce].provider);
        console.log("method: "+service[indexOfSerivce].variant.method);

        var currentService = service[indexOfSerivce];

        var tempString = '';
        for (j=0;j<currentService.endpoint.length;j++){

            if(currentService.endpoint[j].type == "INTERNET_URL"){
                $scope.isInternet = true;
                $scope.endpoints[j] = currentService.endpoint[j].url;
                //tempString = currentService.endpoint[j].url;
            }
            else {
                $scope.isInternet = false;
                $scope.endpoints[j] = currentService.endpoint[j].url;
                //tempString = "noURL";
            }



            //tempString += service[indexOfSerivce].endpoint[j].url+',';

        }



        $scope.provider = "Provider: " +service[indexOfSerivce].provider;
        $scope.method = "Method: " +service[indexOfSerivce].variant.method;
        //$scope.endpoint ="Endpoint: "+tempString;
        $scope.endpointUrl=tempString;

        polyServiceVector.redraw();
    }

}

function showAllServices(features){
    currentServices = [];

    //getting right scope
    var serviceListDiv=document.getElementById("serviceList");
    var selector = angular.element(serviceListDiv);

    for (i=0;i<features.length;i++){
        currentServices.push(service[i].description);
    }
    geolocationCtrl(selector.scope());
    selector.scope().$apply();
}

function hideAllFeatures(fromLayer){

    var features = fromLayer.features;

    for( var i = 0; i < features.length; i++ ) {
        features[i].style = { display: 'none' };
    }

    fromLayer.redraw();
}

function showSelectedFeatures(testPoint,serviceFeatures){
    for (i=0;i<serviceFeatures.length;i++){
        //is marker position inside polygon?
        //polygon
        if (serviceFeatures[i].data.type == 'polygon'){
            console.log("marker polygon check");
            if (polygonCollection[i].containsPoint(testPoint)) {
                //push to list of current services
                currentServices.push(service[i].description);
                //Showing polygons
                serviceFeatures[i].style = defaultServiceStyle;
            }
        }
        else if (serviceFeatures[i].data.type == 'circle'){
            console.log("marker circle check");
            var testDistance = getDistanceFromLatLonInM(serviceFeatures[i].data.center.y,serviceFeatures[i].data.center.x,testPoint.y,testPoint.x);
            console.log("center @ "+serviceFeatures[i].data.center.x+","+serviceFeatures[i].data.center.y);
            console.log("marker @ "+testPoint.x+","+testPoint.y);
            console.log("testDist: "+testDistance);
            console.log("radius: "+serviceFeatures[i].data.radius);

            if(testDistance<=serviceFeatures[i].data.radius){
                //push to list of current services
                currentServices.push(service[i].description);
                //Showing polygons
                serviceFeatures[i].style = defaultServiceStyle;
            }
        }
    }
}



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

/*
document.getElementById('track').onclick = function() {
    vector.removeAllFeatures();
    geolocate.deactivate();
    if (this.checked) {
        geolocate.watch = true;
        firstGeolocation = true;
        geolocate.activate();
    }
};
document.getElementById('track').checked = false;
*/