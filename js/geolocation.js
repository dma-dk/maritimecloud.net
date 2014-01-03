//Example from http://openlayers.org/dev/examples/geolocation.html

var style = {
    fillColor: '#000',
    fillOpacity: 0.1,
    strokeWidth: 0
};

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

control = new OpenLayers.Control.DrawFeature(vectors,OpenLayers.Handler.Point);

map.addControl(new OpenLayers.Control.LayerSwitcher());
map.addControl(new OpenLayers.Control.MousePosition());

map.addControl(control);

control.events.register('featureadded', control, function(f) {

    // create a WKT reader/parser/writer
    var wkt = new OpenLayers.Format.WKT();

    // write out the feature's geometry in WKT format
    var out = wkt.write(f.feature);
    console.log(out);
});

map.setCenter(
    new OpenLayers.LonLat(12.55854, 55.676036).transform(
        new OpenLayers.Projection("EPSG:4326"),
        map.getProjectionObject()
    ), 10
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
var firstGeolocation = true;
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
    if (firstGeolocation) {
        map.zoomToExtent(vector.getDataExtent());
        pulsate(circle);
        firstGeolocation = false;
        this.bind = true;
    }
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

        control.deactivate();
        vectors.removeAllFeatures();

        vector.removeAllFeatures();
        geolocate.deactivate();
        //document.getElementById('track').checked = false;
        geolocate.watch = false;
        firstGeolocation = true;
        geolocate.activate();
    }

    else if (radios[1].checked) {
        console.log("Marker position checked");

        vector.removeAllFeatures();
        geolocate.deactivate();

        map.setCenter(
            new OpenLayers.LonLat(12.55854, 55.676036).transform(
                new OpenLayers.Projection("EPSG:4326"),
                map.getProjectionObject()
            ), 10
        );

        control.activate();



    }
    else console.log("not hit");

};

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