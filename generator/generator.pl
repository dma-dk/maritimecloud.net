#!/usr/bin/perl -w

use strict;
use JSON;

my $json = JSON->new();
$json->pretty(1);
my @services;
my $s;

##
## Operational services
my $op_serv_tugs   = { name => 'Tugs service' };
my $op_serv_lps    = { name => 'Local Port Service (LPS)' };
my $op_serv_tos    = { name => 'Traffic Organization Service (TOS)' };
my $op_serv_msi    = { name => 'Maritime Safety Information' };
my $op_serv_report = { name => 'Vessel shore reporting' };

##
## Create Copenhagen port tug acquire service
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_tugs;
$s->{specification}->{serviceId}          = "imo.tug.acquire";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "text";
$s->{specification}->{transport}          = "none";
$s->{specification}->{name}               = "Tugs acquire service";
$s->{provider}->{id}                      = "DK-PRT-000001";
$s->{provider}->{name}                    = "Copenhagen Port";
$s->{type}                                = "STATIC";
$s->{name}                                = "Copenhagen Port Tug Acquire Service";
$s->{description}                         = <<TEXT;
* Tugs can be acquired on VHF Channel 16/9
* 4h notice required, but 18h recommended. 1h notice for cancellation. 
  45% extra charge might be added for late order or cancellations. 
  Late request/notice may lead to tugs being not available in the port.
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = loadPolygon("tugs_cph_port.kml");
push( @services, $s );

##
## Create Oslo port Local Port Service
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_lps;
$s->{specification}->{serviceId}          = "imo.lps";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "text";
$s->{specification}->{transport}          = "none";
$s->{specification}->{name}               = "Local Port Service";
$s->{provider}->{id}                      = "NO-PRT-000001";
$s->{provider}->{name}                    = "Oslo Port";
$s->{type}                                = "STATIC";
$s->{name}                                = "Oslo LPS";
$s->{description}                         = <<TEXT;
* Phone +47 815 00 606
* Oslo port operates on VHF channel 80 (main channel for all)
* VHF channel 12 in the harbour district 
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = loadPolygon("lps_oslo_port.kml");
push( @services, $s );

##
## Create Göteborg port Local Port Service
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_lps;
$s->{specification}->{serviceId}          = "imo.lps";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "text";
$s->{specification}->{transport}          = "none";
$s->{specification}->{name}               = "Local Port Service";
$s->{provider}->{id}                      = "SE-PRT-000004";
$s->{provider}->{name}                    = "Gothenburg Port";
$s->{type}                                = "STATIC";
$s->{name}                                = "Gothenburg LPS";
$s->{description}                         = <<TEXT;
* VHF: Channel 12
* Telephone: +46 31 368 75 15
* E-mail: portcontrol\@portgot.se
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = loadPolygon("lps_goth_port.kml");
push( @services, $s );

##
## Create Oslo TOS
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_tos;
$s->{specification}->{serviceId}          = "imo.tos";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "web";
$s->{specification}->{transport}          = "web";
$s->{specification}->{name}               = "Traffic Organisation Service (web)";
$s->{provider}->{id}                      = "NO-VTS-000001";
$s->{provider}->{name}                    = "Oslo VTS";
$s->{type}                                = "STATIC";
$s->{name}                                = "Oslo VTS TOS";
$s->{description}                         = <<TEXT;
Oslo VTS Traffic Organization Service
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = loadPolygon("tos_oslo_vts.kml");
$s->{endpoint}                 = [
	{
		type => 'URL',
		url  => 'http://www.oslohavn.no/en/cargo/services_at_port_of_oslo/oslo_vts/'
	}
];
push( @services, $s );

##
## Create Gothenburg TOS
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_tos;
$s->{specification}->{serviceId}          = "imo.tos";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "web";
$s->{specification}->{transport}          = "web";
$s->{specification}->{name}               = "Traffic Organisation Service (web)";
$s->{provider}->{id}                      = "SE-VTS-000002";
$s->{provider}->{name}                    = "Gothenburg VTS";
$s->{type}                                = "STATIC";
$s->{name}                                = "Gothenburg VTS TOS";
$s->{description}                         = <<TEXT;
Oslo VTS Traffic Organization Service
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = loadPolygon("tos_goth_vts.kml");
$s->{endpoint}                 = [
	{
		type => 'URL',
		url  => 'http://goteborgshamn.se/Om-hamnen/Maritimt2/Gothenburg-Approach/'
	}
];
push( @services, $s );

##
## Create Sound TOS
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_tos;
$s->{specification}->{serviceId}          = "imo.tos";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "web";
$s->{specification}->{transport}          = "web";
$s->{specification}->{name}               = "Traffic Organisation Service (web)";
$s->{provider}->{id}                      = "SE-VTS-000004";
$s->{provider}->{name}                    = "Sound VTS";
$s->{type}                                = "STATIC";
$s->{name}                                = "Sound VTS TOS";
$s->{description}                         = <<TEXT;
The Sound VTS Traffic Organization Service
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = loadPolygon("tos_sound_vts.kml");
$s->{endpoint}                 = [
	{
		type => 'URL',
		url  => 'http://www.sjofartsverket.se/en/Sound-VTS/Masters-Guide/'
	}
];
push( @services, $s );

##
## MSI BALTICO NAVTEX
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_msi;
$s->{specification}->{serviceId}          = "imo.msi";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "broadcast-low";
$s->{specification}->{transport}          = "navtex";
$s->{specification}->{name}               = "MSI (navtex)";
$s->{provider}->{id}                      = "SE-AUH-000001";
$s->{provider}->{name}                    = "Swedish Maritime Administration";
$s->{type}                                = "STATIC";
$s->{name}                                = "BALTICO MSI NAVTEX";
$s->{description}                         = <<TEXT;
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = loadPolygon("msi_baltico_navtex.kml");
$s->{endpoint}                 = [
	{
		type => 'navtex',
		url  => 'navtex://grimeton'
	},
	{
		type => 'navtex',
		url  => 'navtex://rogaland'
	},
];
push( @services, $s );

##
## MSI BALTICO NAVTEX
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_msi;
$s->{specification}->{serviceId}          = "imo.msi";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "web";
$s->{specification}->{transport}          = "web";
$s->{specification}->{name}               = "MSI (web)";
$s->{provider}->{id}                      = "SE-AUH-000001";
$s->{provider}->{name}                    = "Swedish Maritime Administration";
$s->{type}                                = "STATIC";
$s->{name}                                = "BALTICO MSI WEB";
$s->{description}                         = <<TEXT;
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = loadPolygon("msi_baltico_navtex.kml");
$s->{endpoint}                 = [
	{
		type => 'URL',
		url  => 'http://www.sjofartsverket.se/en/Maritime-services/Maritime-Traffic-Information/Navigational-Warnings/NAVTEX1/'
	}
];
push( @services, $s );

##
## MSI DK LOCAL
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_msi;
$s->{specification}->{serviceId}          = "imo.msi.local";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "web";
$s->{specification}->{transport}          = "web";
$s->{specification}->{name}               = "MSI local (web)";
$s->{provider}->{id}                      = "DK-AUH-000001";
$s->{provider}->{name}                    = "Danish Maritime Authority";
$s->{type}                                = "STATIC";
$s->{name}                                = "Danish local MSI (web)";
$s->{description}                         = <<TEXT;
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = loadPolygon("msi_local_dk.kml");
$s->{endpoint}                 = [
	{
		type => 'URL',
		url  => 'http://www.dma.dk/Ships/Sider/MaritimeSafetyInformation.aspx'
	}
];
push( @services, $s );

##
## MSI DK LOCAL
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_msi;
$s->{specification}->{serviceId}          = "imo.msi.local";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "vhf";
$s->{specification}->{transport}          = "none";
$s->{specification}->{name}               = "MSI local (vhf)";
$s->{provider}->{id}                      = "DK-AUH-000001";
$s->{provider}->{name}                    = "Danish Maritime Authority";
$s->{type}                                = "STATIC";
$s->{name}                                = "Danish local MSI (vhf)";
$s->{description}                         = <<TEXT;
Navigational Warnings are broadcasted first time immediately after the first period of silence 
after reception and after this as follows: In connection with the periods of silence at 0133, 
0533, 0933, 1333, 1733 and 2133 hours on: 
VHF channel 1, 2, 3, 4, 5, 7, 23, 61, 64, 65, 66, 83 and 85. 
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = loadPolygon("msi_local_dk_vhf.kml");
push( @services, $s );

##
## MSI DK LOCAL
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_msi;
$s->{specification}->{serviceId}          = "imo.msi.local";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "req-resp";
$s->{specification}->{transport}          = "soap";
$s->{specification}->{name}               = "MSI local (web service)";
$s->{provider}->{id}                      = "DK-AUH-000001";
$s->{provider}->{name}                    = "Danish Maritime Authority";
$s->{type}                                = "STATIC";
$s->{name}                                = "Danish local MSI (web service)";
$s->{description}                         = <<TEXT;
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = loadPolygon("msi_local_dk_vhf.kml");
$s->{endpoint}                 = [
	{
		type => 'URL',
		url  => 'http://msi.dma.dk/msi/ws/warning?wsdl'
	}
];
push( @services, $s );


##
## Norweigian reporting service
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_report;
$s->{specification}->{serviceId}          = "imo.reporting";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "web";
$s->{specification}->{transport}          = "web";
$s->{specification}->{name}               = "Single window reporting (web)";
$s->{provider}->{id}                      = "NO-AUH-000001";
$s->{provider}->{name}                    = "Norwegian Coastal Administration";
$s->{type}                                = "STATIC";
$s->{name}                                = "Shiprep Norway";
$s->{description}                         = <<TEXT;
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = [];
$s->{endpoint}                 = [
	{
		type => 'URL',
		url  => 'http://shiprep.no/'
	}
];
push( @services, $s );

##
## Great belt VTS route suggestion (GM)
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_tos;
$s->{specification}->{serviceId}          = "imo.tos.routesuggestion";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "push-resp";
$s->{specification}->{transport}          = "gm";
$s->{specification}->{name}               = "Route suggestion";
$s->{provider}->{id}                      = "DK-VTS-000002";
$s->{provider}->{name}                    = "Great Belt VTS";
$s->{type}                                = "STATIC";
$s->{name}                                = "Great Belt route suggestion";
$s->{description}                         = <<TEXT;
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = loadPolygon("tos_gb_vts.kml");
$s->{endpoint}                 = [
	{
		type => 'GM',
		url  => 'gm://DK-VTS-000002/imo.tos.routesuggestion/1.0'
	}
];
push( @services, $s );

##
## Great belt VTS route suggestion (AIS)
##
$s                                        = {};
$s->{specification}->{operationalService} = $op_serv_tos;
$s->{specification}->{serviceId}          = "imo.tos.routesuggestion";
$s->{specification}->{version}            = "1.0";
$s->{specification}->{variant}            = "push-resp";
$s->{specification}->{transport}          = "ais";
$s->{specification}->{name}               = "Route suggestion";
$s->{provider}->{id}                      = "DK-VTS-000002";
$s->{provider}->{name}                    = "Great Belt VTS";
$s->{type}                                = "STATIC";
$s->{name}                                = "Great Belt route suggestion";
$s->{description}                         = <<TEXT;
TEXT
$s->{extent}->{area}->{type}   = "polygon";
$s->{extent}->{area}->{points} = loadPolygon("tos_gb_vts.kml");
$s->{endpoint}                 = [
	{
		type => 'AISASM',
		url  => 'ais://002190001'
	}
];
push( @services, $s );














print "var service = " . $json->encode( \@services );

sub loadPolygon {
	my $file = shift;
	open( FILE, "< $file" ) or die "Failed to open file: $file: $!\n";
	my $kml = join( "\n", <FILE> );
	close(FILE);
	if ( not $kml =~ m|<coordinates>\s*(.+?)\s*</coordinates>|ig ) {
		die "Could not find polygon in KML\n";
	}

	# Split by space
	my @points;
	my @pointParts = split( /\s+/, $1 );
	foreach my $p (@pointParts) {
		my ( $lon, $lat ) = split( /,/, $p );
		push( @points, { lat => $lat, lon => $lon } );
	}
	return \@points;
}
