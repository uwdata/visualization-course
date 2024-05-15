import * as aq from 'npm:arquero';
import { vl } from './vega-lite.js';

export function marks() {
  const data = aq.table({
    u: 'ABCDEFGH'.split(''),
    v: [2, 8, 3, 7, 5, 4, 6, 1]
  }).objects();

  const base = vl.mark().data(data)
    .encode(
      vl.x().fieldO('u').axis(null),
      vl.y().fieldQ('v').axis(null)
    )
    .width(110)
    .height(80);

  return vl.hconcat(
      base.mark({type:'bar'}),
      base.mark({type:'line', point:true, interpolate:'monotone'}),
      base.mark({type:'tick'}),
      base.mark({type:'text', fill:'steelblue', baseline:'middle'})
          .encode(vl.text().fieldN('u')),
      base.mark({type:'area'})
    )
    .spacing(15)
    .config({view: {stroke: null}})
    .render();
}
