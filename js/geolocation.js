//Example from http://openlayers.org/dev/examples/geolocation.html

var style = {
    fillColor: '#000',
    fillOpacity: 0.1,
    strokeWidth: 0
};


var currentServices = [];

var WGS84 = new OpenLayers.Projection("EPSG:900913");      // WGS 1984
var Spherical = new OpenLayers.Projection("EPSG:4326");        // Spherical Mercator

var map = new OpenLayers.Map('map');
var layer = new OpenLayers.Layer.OSM( "Simple OSM Map");
var vector = new OpenLayers.Layer.Vector('Own pos Layer');
map.addLayers([layer, vector]);

// allow testing of specific renderers via "?renderer=Canvas", etc
var renderer = OpenLayers.Util.getParameters(window.location.href).renderer;
renderer = (renderer) ? [renderer] : OpenLayers.Layer.Vector.prototype.renderers;

vectors = new OpenLayers.Layer.Vector("Marker Layer", {
    renderers: renderer
});

map.addLayers([vectors]);

var markerControl = new OpenLayers.Control.DrawFeature(vectors,OpenLayers.Handler.Point);

//map.addControl(new OpenLayers.Control.LayerSwitcher());
//map.addControl(new OpenLayers.Control.MousePosition());

map.addControl(markerControl);

/*
var points = [
    new OpenLayers.Geometry.Point(12.574539, 55.706418),
    new OpenLayers.Geometry.Point(12.622553, 55.674487),
    new OpenLayers.Geometry.Point(12.556635, 55.672551)
];

var pointsWGS = [
    new OpenLayers.Geometry.Point(12.574539, 55.706418).transform(Spherical,WGS84),
    new OpenLayers.Geometry.Point(12.622553, 55.674487).transform(Spherical,WGS84),
    new OpenLayers.Geometry.Point(12.556635, 55.672551).transform(Spherical,WGS84)
];


var ring = new OpenLayers.Geometry.LinearRing(points);
var polygon = new OpenLayers.Geometry.Polygon([ring]);


var ringWGS = new OpenLayers.Geometry.LinearRing(pointsWGS);
var polygonWGS = new OpenLayers.Geometry.Polygon([ringWGS]);
console.log('printing polygon cph: ' +polygonWGS);

var polygonFeature = new OpenLayers.Feature.Vector(polygonWGS);

var polyVector = new OpenLayers.Layer.Vector('Polygon Layer');

polyVector.addFeatures([polygonFeature]);
map.addLayers([polyVector]);
*/

//
//json service testing
//
var serviceTitles = [];
var polygonCollection = [];
var polygonCollectionWGS = [];
for (i=0;i<service.length;i++){
    //titles

    serviceTitles.push(service[i].description);

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
            features[i].style = null;
            //features[i].style = {fill: true,fillColor: "#ff0000"};
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
        vector.drawFeature(feature);
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
    vector.removeAllFeatures();
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
    vector.addFeatures([
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
            features[i].style = null;

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

        markerControl.deactivate();
        vectors.removeAllFeatures();

        vector.removeAllFeatures();
        geolocate.deactivate();
        //document.getElementById('track').checked = false;
        geolocate.watch = false;
        //firstGeolocation = true;
        geolocate.activate();
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

        vector.removeAllFeatures();
        geolocate.deactivate();
        markerControl.activate();
    }
    //No filter
    else if (radios[2].checked) {
        //clean up
        markerControl.deactivate();
        geolocate.deactivate();

        vectors.removeAllFeatures();
        vector.removeAllFeatures();

        //Show all services in list
        showAllServices();
        //Show all service polygons
        var features = polyServiceVector.features;
        for (i=0;i<features.length;i++){
                //Showing polygons
                features[i].style = null;
        }
        //force redraw
        polyServiceVector.redraw();

    }
    else console.log("not hit");

};

//Angular stuff
function geolocationCtrl($scope) {
    //$scope.serviceTitles = serviceTitles;
    console.log("in geolocationCtrl");
    $scope.serviceTitles = currentServices;
    console.log("with" +$scope.serviceTitles);

    $scope.markService = function(clickedTitle) {
        var indexOfTitle = currentServices.indexOf(clickedTitle);
        console.log("Du trykker på index: "+indexOfTitle);
        var features = polyServiceVector.features;

        //hideAllFeatures(polyServiceVector);

        var markedFeature = polyServiceVector.getFeatureById(clickedTitle);
        markedFeature.style = {fillColor: "#ee9900", fillOpacity: 0.4};
        //features[indexOfTitle].style = {fillColor: "#ee9900", fillOpacity: 0.4};
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