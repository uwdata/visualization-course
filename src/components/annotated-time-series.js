import { vl } from './vega-lite.js';
import vega_datasets from 'npm:vega-datasets@1';

export function timeSeries() {
  const data = vega_datasets['stocks.csv'].url;

  // select a point for which to provide details-on-demand
  const hover = vl.selectPoint('hover')
    .encodings('x')  // limit selection to x-axis value
    .on('mouseover') // select on mouseover events
    .toggle(false)   // disable toggle on shift-hover
    .nearest(true);  // select data point nearest the cursor

  // predicate to test if a point is hover-selected
  // return false if the selection is empty
  const isHovered = hover.empty(false);

  // define our base line chart of stock prices
  const line = vl.markLine().encode(
    vl.x().fieldT('date'),
    vl.y().fieldQ('price').scale({type: 'log'}),
    vl.color().fieldN('symbol')
  );

  // shared base for new layers, filtered to hover selection
  const base = line.transform(vl.filter(isHovered));

  // mark properties for text label layers
  const label = {align: 'left', dx: 5, dy: -5};
  const white = {stroke: 'white', strokeWidth: 2};

  return vl.data(data)
    .layer(
      line,
      // add a rule mark to serve as a guide line
      vl.markRule({color: '#aaa'})
        .transform(vl.filter(isHovered))
        .encode(vl.x().fieldT('date')),
      // add circle marks for selected time points, hide unselected points
      line.markCircle()
        .params(hover) // use as anchor points for selection
        .encode(vl.opacity().if(isHovered, vl.value(1)).value(0)),
      // add white stroked text to provide a legible background for labels
      base.markText(label, white).encode(vl.text().fieldQ('price')),
      // add text labels for stock prices
      base.markText(label).encode(vl.text().fieldQ('price'))
    )
    .width(700)
    .height(400);
}
