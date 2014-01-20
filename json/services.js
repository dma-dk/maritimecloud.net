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
	"specification" : {
		"description" : "Maritime Safety Information Service",
		"operationalService" : {
			"name" : "MSI"
		},
		"serviceId" : "MSI",
		"transport" : "NAVTEX",
		"variant" : "S-53",
		"version" : "1.1"
	}
} ];