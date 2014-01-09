//Example from http://openlayers.org/dev/examples/geolocation.html

var style = {
    fillColor: '#000',
    fillOpacity: 0.1,
    strokeWidth: 0
};


var currentServices = [];

var WGS84 = new OpenLayers.Projection("EPSG:900913");      // WGS 1984
var Spherical = new OpenLayers.Projection("EPSG:4326");        // Spherical Mercator

//var map = new OpenLayers.Map({
//    div: "map",
//    layers: [
//        new OpenLayers.Layer.OSM("OSM (without buffer)"),
//        new OpenLayers.Layer.OSM("OSM (with buffer)", null, {buffer: 2})
//    ],
//    controls: [
//        new OpenLayers.Control.Navigation({
//            dragPanOptions: {
//                enableKinetic: true
//            }
//        }),
//        new OpenLayers.Control.PanZoom(),
//        new OpenLayers.Control.Attribution()
//    ],
//    center: [0, 0],
//    zoom: 3
//});

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
    polyServiceVector.addFeatures([new OpenLayers.Feature.Vector(polygonCollectionWGS[i])]);
}
map.addLayers([polyServiceVector]);

//
//
//


markerControl.events.register('featureadded', markerControl, function(f) {
    /*
    // create a WKT reader/parser/writer
    var wkt = new OpenLayers.Format.WKT();

    // write out the feature's geometry in WKT format
    var out = wkt.write(f.feature);
    console.log(out);
    console.log(f.feature.geometry.x);
    */

    var latLon = new OpenLayers.Geometry.Point(f.feature.geometry.x,f.feature.geometry.y);

    latLon.transform(
        new OpenLayers.Projection("EPSG:900913"),   // transform from WGS 1984
        new OpenLayers.Projection("EPSG:4326")      // to Spherical Mercator
    );

    //console.log("point inside polygon?: " +polygon.containsPoint(latLon));
    currentServices = [];

    //getting right scope
    var serviceListDiv=document.getElementById("serviceList");
    var selector = angular.element(serviceListDiv);

    for (i=0;i<polygonCollection.length;i++){
    if (polygonCollection[i].containsPoint(latLon)) {
        currentServices.push(service[i].description);
        console.log('Inside ' +service[i].description);
    }
    }
    geolocationCtrl(selector.scope());
    selector.scope().$apply();
});

map.setCenter(
    new OpenLayers.LonLat(12.55854, 55.676036).transform(
        new OpenLayers.Projection("EPSG:4326"),
        map.getProjectionObject()
    ), 6
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
                graphicName: 'cross',
                strokeColor: '#f00',
                strokeWidth: 2,
                fillOpacity: 0,
                pointRadius: 10
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

    //TESTING
    console.log("x: " +e.point.x);
    console.log("y: " +e.point.y);

    var latLon = new OpenLayers.Geometry.Point(e.point.x,e.point.y);

    latLon.transform(
        new OpenLayers.Projection("EPSG:900913"),   // transform from WGS 1984
        new OpenLayers.Projection("EPSG:4326")      // to Spherical Mercator
    );

    currentServices = [];

    //getting right scope
    var serviceListDiv=document.getElementById("serviceList");
    var selector = angular.element(serviceListDiv);

    for (i=0;i<polygonCollection.length;i++){
        if (polygonCollection[i].containsPoint(latLon)) {
            currentServices.push(service[i].description);
            console.log('Inside ' +service[i].description);
        }
    }
    geolocationCtrl(selector.scope());
    selector.scope().$apply();

});
geolocate.events.register("locationfailed",this,function() {
    OpenLayers.Console.log('Location detection failed');
});

/*
document.getElementById('locate').onclick = function() {
    vector.removeAllFeatures();
    geolocate.deactivate();
    document.getElementById('track').checked = false;
    geolocate.watch = false;
    firstGeolocation = true;
    geolocate.activate();
};
*/


document.getElementById('mapform').onclick = function() {

    var radios = document.getElementsByName('maptype');

    if (radios[0].checked) {
        console.log("Own position checked");

        //clean up
        currentServices = [];
        var serviceListDiv=document.getElementById("serviceList");
        var selector = angular.element(serviceListDiv);
        geolocationCtrl(selector.scope());
        selector.scope().$apply();


        markerControl.deactivate();
        vectors.removeAllFeatures();

        vector.removeAllFeatures();
        geolocate.deactivate();
        //document.getElementById('track').checked = false;
        geolocate.watch = false;
        //firstGeolocation = true;
        geolocate.activate();
    }

    else if (radios[1].checked) {
        console.log("Marker position checked");

        //clean up
        currentServices = [];
        var serviceListDiv=document.getElementById("serviceList");
        var selector = angular.element(serviceListDiv);
        geolocationCtrl(selector.scope());
        selector.scope().$apply();

        vector.removeAllFeatures();
        geolocate.deactivate();
        markerControl.activate();



    }
    else console.log("not hit");

};

//Angular stuff
function geolocationCtrl($scope) {
    //$scope.serviceTitles = serviceTitles;
    console.log("in geolocationCtrl");
    $scope.serviceTitles = currentServices;
    console.log("with" +$scope.serviceTitles);

}


//console.log("testing json service: " +service[0].description);

//console.log("testing json service: " +service);





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