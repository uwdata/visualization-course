import { vl } from './vega-lite.js';
import vega_datasets from 'npm:vega-datasets@1';

export function airportConnections() {
  const flights = vega_datasets['flights-airport.csv'].url;
  const airports = vega_datasets['airports.csv'].url;
  const world = vega_datasets['us-10m.json'].url;

  // interactive selection for origin airport
  // select nearest airport to mouse cursor
  const origin = vl.selectPoint().fields('origin')
    .on('mouseover').nearest(true);

  // base map of the United States
  const map = vl.markGeoshape({fill: '#ddd', stroke: '#fff', strokeWidth: 1})
    .data(vl.topojson(world).feature('states'));

  // shared data reference for lookup transforms
  const foreign = vl.data(airports).key('iata').fields('latitude', 'longitude');

  // add route lines from selected origin airport to destination airports
  const routes = vl.markRule({color: '#000', opacity: 0.35})
    .data(flights)
    .transform(
      vl.filter(origin.empty(false)), // filter to selected origin only
      vl.lookup('origin').from(foreign), // origin lat/lon
      vl.lookup('destination').from(foreign).as('lat2', 'lon2') // dest lat/lon
    )
    .encode(
      vl.latitude().fieldQ('latitude'),
      vl.longitude().fieldQ('longitude'),
      vl.latitude2().field('lat2'),
      vl.longitude2().field('lon2')
    );

  // size airports by number of outgoing routes
  // 1. aggregate flights-airport data set
  // 2. lookup location data from airports data set
  // 3. remove Puerto Rico (PR) and Virgin Islands (VI)
  const points = vl.markCircle()
    .data(flights)
    .transform(
      vl.groupby('origin').aggregate(vl.count().as('routes')),
      vl.lookup('origin').from(foreign.fields('state', 'latitude', 'longitude')),
      vl.filter('datum.state !== "PR" && datum.state !== "VI"')
    )
    .select(origin)
    .encode(
      vl.latitude().fieldQ('latitude'),
      vl.longitude().fieldQ('longitude'),
      vl.size().fieldQ('routes').scale({range: [0, 1000]}).legend(null),
      vl.order().fieldQ('routes').sort('descending') // place smaller circles on top
    );

  return vl.layer(map, routes, points)
    .project(vl.projection('albersUsa'))
    .width(900).height(500)
    .config({view: {stroke: null}});
}
