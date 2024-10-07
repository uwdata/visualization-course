import * as vega from 'npm:vega';
import * as vegalite from 'npm:vega-lite';
import * as api from 'npm:vega-lite-api';
import * as tooltip from 'npm:vega-tooltip';

const opt = {
  config: {
    // vega-lite default configuration
    config: {
      view: { continuousWidth: 400, continuousHeight: 300 },
      mark: { tooltip: null }
    }
  },
  init: view => {
    // initialize tooltip handler
    view.tooltip(new tooltip.Handler().call);
    // enable horizontal scrolling for large plots
    if (view.container()) view.container().style['overflow-x'] = 'auto';
  },
  view: {
    renderer: 'svg',
    logLevel: vega.Warn
  }
};

export const vl = api.register(vega, vegalite, opt);

/**
 * Render a Vega-Lite JSON specification.
 * @returns The rendered HTML element.
 */
export async function render(spec) {
  return vl.render({ ...opt, spec });
}
