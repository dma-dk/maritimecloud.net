#!/usr/bin/perl -w 

use strict;
use JSON;
#use Geo::KML;
use Data::Dumper;
 
my @services;
my $s = {};

my $op_serv_tugs = {
	name => 'Tugs service'
};

$s->{specification}->{operationalService} = $op_serv_tugs;


push(@services, $s);

$s = {};

push(@services, $s);


 






print Data::Dumper->Dump( [\@services], [qw(*services)] );

