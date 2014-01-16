var service = [ {
    "description" : "MSI BALTICO NAVTEX",
	"endpoint" : [ {
		"type" : "NAVTEX",
		"url" : "navtex://ROGALAND"
	}, {
		"type" : "NAVTEX",
		"url" : "navtex://BALTICO"
	} ],
	"extent" : {
		"type" : "staticServiceExtent",
		"area" : {
			"type" : "polygon",
			"points" : [ {
				"lat" : 53.398,
				"lon" : 8.37686
			}, {
				"lat" : 53.7982,
				"lon" : 19.363
			}, {
				"lat" : 58.24649,
				"lon" : 21.121889
			}, {
				"lat" : 58.385162,
				"lon" : 7.84510931
			}, {
				"lat" : 53.39847,
				"lon" : 8.376868058
			} ]
		}
	},
	"provider" : "BALTICO",
	"variant" : {
		"method" : "NAVTEX",
		"specification" : {
			"description" : "Maritime Safety Information Service",
			"operationalService" : {
				"name" : "MSI"
			},
			"serviceId" : "MSI",
			"version" : "1.1"
		}
	}
}, {
	"description" : "MSI DMA WebService",
	"endpoint" : [ {
		"type" : "INTERNET_URL",
		"url" : "http://msi.dma.dk/msi/warnings?wsdl"
	} ],
	"extent" : {
		"type" : "staticServiceExtent",
		"area" : {
			"type" : "polygon",
			"points" : [ {
				"lat" : 54.0,
				"lon" : 7.0
			}, {
				"lat" : 58.6,
				"lon" : 5.9
			}, {
				"lat" : 58.7,
				"lon" : 14.5
			}, {
				"lat" : 54.0,
				"lon" : 14.15
			} ]
		}
	},
	"provider" : "DMA",
	"variant" : {
		"method" : "SOAP",
		"specification" : {
			"description" : "Maritime Safety Information Service",
			"operationalService" : {
				"name" : "MSI"
			},
			"serviceId" : "MSI",
			"version" : "1.1"
		}
	}
},{
    "description" : "MSI DMA WebService 2",
    "endpoint" : [ {
        "type" : "INTERNET_URL",
        "url" : "http://msi.dma.dk/msi/warnings?wsdl"
    } ],
    "extent" : {
        "type" : "staticServiceExtent",
        "area" : {
            "type" : "circle",
            "points" : [ {
                "lat" : 56.059769,
                "lon" : 12.094293
            } ],
            "radius" : 170000
        }
    },
    "provider" : "DMA",
    "variant" : {
        "method" : "SOAP",
        "specification" : {
            "description" : "Maritime Safety Information Service",
            "operationalService" : {
                "name" : "MSI"
            },
            "serviceId" : "MSI",
            "version" : "1.1"
        }
    }
},{
    "description" : "MSI DMA WebService 3",
    "endpoint" : [ {
        "type" : "INTERNET_URL",
        "url" : "http://msi.dma.dk/msi/warnings?wsdl"
    } ],
    "extent" : {
        "type" : "staticServiceExtent",
        "area" : {
            "type" : "circle",
            "points" : [ {
                "lat" : 57.171992,
                "lon" : 12.204157
            } ],
            "radius" : 150000
        }
    },
    "provider" : "DMA",
    "variant" : {
        "method" : "SOAP",
        "specification" : {
            "description" : "Maritime Safety Information Service",
            "operationalService" : {
                "name" : "MSI"
            },
            "serviceId" : "MSI",
            "version" : "1.1"
        }
    }
},{
    "description" : "MSI DMA WebService 4",
    "endpoint" : [ {
        "type" : "INTERNET_URL",
        "url" : "http://msi.dma.dk/msi/warnings?wsdl"
    } ],
    "extent" : {
        "type" : "staticServiceExtent",
        "area" : {
            "type" : "circle",
            "points" : [ {
                "lat" : 58.608334,
                "lon" : 11.226373
            } ],
            "radius" : 100000
        }
    },
    "provider" : "DMA",
    "variant" : {
        "method" : "SOAP",
        "specification" : {
            "description" : "Maritime Safety Information Service",
            "operationalService" : {
                "name" : "MSI"
            },
            "serviceId" : "MSI",
            "version" : "1.1"
        }
    }
},{
    "description" : "MSI DMA WebService 5",
    "endpoint" : [ {
        "type" : "INTERNET_URL",
        "url" : "http://msi.dma.dk/msi/warnings?wsdl"
    } ],
    "extent" : {
        "type" : "staticServiceExtent",
        "area" : {
            "type" : "circle",
            "points" : [ {
                "lat" : 58.112714,
                "lon" : 7.963434
            } ],
            "radius" : 200000
        }
    },
    "provider" : "DMA",
    "variant" : {
        "method" : "SOAP",
        "specification" : {
            "description" : "Maritime Safety Information Service",
            "operationalService" : {
                "name" : "MSI"
            },
            "serviceId" : "MSI",
            "version" : "1.1"
        }
    }
} ];