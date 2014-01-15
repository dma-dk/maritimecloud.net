//Example from http://openlayers.org/dev/examples/geolocation.html

var style = {
    fillColor: '#000',
    fillOpacity: 0.1,
    strokeWidth: 0
};
//Service polygon styles
var defaultServiceStyle = {fillColor: "#ee9900", fillOpacity: 0.1, strokeWidth: 1, strokeColor: '#ee9900'};
var selectedServiceStyle = {fillColor: "#ee9900", fillOpacity: 0.3,  strokeWidth: 1, strokeColor: '#000000'};


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

var markerControl = new OpenLayers.Control.DrawFeature(markerLayer,OpenLayers.Handler.Point);
map.addControl(markerControl);


//
//json service testing
//
var serviceTitles = [];
var polygonCollection = [];
var polygonCollectionWGS = [];
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
    }
    /*
    else if (service[i].extent.area.type == 'circle'){
        //circles
        console.log("inside circle");
        var tempCenterPoint = new OpenLayers.Geometry.Point(service[i].extent.area.points[0].lon,
            service[i].extent.area.points[0].lat);
        var tempCenterPointWGS = new OpenLayers.Geometry.Point(service[i].extent.area.points[0].lon,
            service[i].extent.area.points[0].lat).transform(Spherical,WGS84);

        var tempRadius = service[i].extent.area.radius;
        console.log('projection: ' +map.getProjectionObject());


        var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(tempCenterPoint,
            tempRadius*2,
            30,
            0);

        var circleWGS = OpenLayers.Geometry.Polygon.createRegularPolygon(tempCenterPointWGS,
            tempRadius*2,
            30,
            0
            );

        var olPoints = [];
        var olPointsWGS = [];

        olPoints = calculateRing(tempCenterPointWGS.x,tempCenterPointWGS.y, tempRadius, 40);
        console.log("lonner: "+tempCenterPointWGS.x);

        for (j=0;j<olPoints.length;j++){
            olPointsWGS[j]=olPoints[j];
        }

        var polygon = new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(olPoints)]);
        var polygonWGS = new OpenLayers.Geometry.Polygon([new OpenLayers.Geometry.LinearRing(olPointsWGS)]);
        polygonCollection.push(polygon);
        polygonCollectionWGS.push(polygonWGS);

        //polygonCollection.push(circle);
        //polygonCollectionWGS.push(circleWGS);

    }
    */
}

var polyServiceVector = new OpenLayers.Layer.Vector('Polygons form Service Layer');
for (i=0;i<polygonCollection.length;i++){
    console.log("Adding polygon " +i+ " from service");
    var tempFeature = new OpenLayers.Feature.Vector(polygonCollectionWGS[i]);
    tempFeature.id = serviceTitles[i];
    polyServiceVector.addFeatures([tempFeature]);
}
map.addLayers([polyServiceVector]);

//hide all service polygons
hideAllFeatures(polyServiceVector);


markerControl.events.register('featureadded', markerControl, function(f) {

    //get postion of marker
    var latLon = new OpenLayers.Geometry.Point(f.feature.geometry.x,f.feature.geometry.y).transform(WGS84,Spherical);

    //empty memory
    currentServices = [];
    hideAllFeatures(polyServiceVector);

    //main loop to control services to show
    var features = polyServiceVector.features;

    for (i=0;i<polygonCollection.length;i++){

        if (polygonCollection[i].containsPoint(latLon)) {
            //List of current services
            currentServices.push(service[i].description);
            //Showing polygons
            features[i].style = defaultServiceStyle;
        }
    }
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
                fillOpacity: 100,
                pointRadius: 8
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

    //main loop to control services to show
    var features = polyServiceVector.features;
    for (i=0;i<polygonCollection.length;i++){
        if (polygonCollection[i].containsPoint(latLon)) {
            //List of current services
            currentServices.push(service[i].description);
            //Showing polygons
            features[i].style = defaultServiceStyle;

        }
    }
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

//Own position is default
geolocate.activate();

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

        //geolocate.activate();
        markerControl.activate();
    }
    //Marker Positon filter
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
    //No filter
    else if (radios[2].checked) {
        //clean up
        markerControl.deactivate();
        geolocate.deactivate();

        markerLayer.removeAllFeatures();
        ownPosLayer.removeAllFeatures();

        //Show all services in list
        showAllServices();
        //Show all service polygons
        var features = polyServiceVector.features;
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
    $scope.provider = '';
    $scope.method = '';
    $scope.endpoint = '';


    $scope.serviceTitles = currentServices;


    $scope.selectedIndex = -1;

    $scope.markService = function(clickedTitle,$index) {
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

        var tempString = '';
        for (j=0;j<service[indexOfSerivce].endpoint.length;j++){

            tempString += service[indexOfSerivce].endpoint[j].url+',';

        }

        $scope.provider = "Provider: " +service[indexOfSerivce].provider;
        $scope.method = "Method: " +service[indexOfSerivce].variant.method;
        $scope.endpoint = "Endpoint: " +tempString;


        console.log("endpoint: "+tempString);

        service[indexOfSerivce].provider;

        polyServiceVector.redraw();
    }

}

function showAllServices(){
    currentServices = [];

    //getting right scope
    var serviceListDiv=document.getElementById("serviceList");
    var selector = angular.element(serviceListDiv);

    for (i=0;i<polygonCollection.length;i++){
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
    console.log("point lat1,lon1: "+lat1+","+lon1);
    var R = 6371; // earths mean radius
    var d = radius;
    for (var i = 0; i < noPoints; i++) {
        var brng = Math.PI * 2 * i / noPoints;
        var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) +
            Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );
        var lon2 = lon1 + Math.atan2(Math.sin(brng)*Math.sin(d/R)*Math.cos(lat1),
            Math.cos(d/R)-Math.sin(lat1)*Math.sin(lat2));

        points.push(new OpenLayers.Geometry.Point(toDegree(lon2), toDegree(lat2)));
        console.log("point lon2,lat2: "+toDegree(lon2)+","+toDegree(lat2));
    }
    return points;
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