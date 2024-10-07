```js
import { render } from '../components/vega-lite.js';
import vega_datasets from 'npm:vega-datasets@1';
```

# Multi-View Composition

When visualizing a number of different data fields, we might be tempted to use as many visual encoding channels as we can: `x`, `y`, `color`, `size`, `shape`, and so on. However, as the number of encoding channels increases, a chart can rapidly become cluttered and difficult to read. An alternative to "over-loading" a single chart is to instead _compose multiple charts_ in a way that facilitates rapid comparisons.

In this notebook, we will examine a variety of operations for _multi-view composition_:

- [_layer_](#layer): place compatible charts directly on top of each other,
- [_facet_](#facet): partition data into multiple charts, organized in rows or columns,
- [_concatenate_](#concatenate): position arbitrary charts within a shared layout, and
- [_repeat_](#repeat): take a base chart specification and apply it to multiple data fields.

We'll then look at how these operations form a _view composition algebra_, in which the operations can be combined to build a variety of complex multi-view displays.

<hr/>

## Weather Data

We will be visualizing weather statistics for the U.S. cities of Seattle and New York. Let's load the dataset and peek at the rows:

```js run=false
const weather = vega_datasets['weather.csv']()
```

```js
const weather = await vega_datasets['weather.csv']();
```

```js echo
Inputs.table(weather)
```

We will create multi-view displays to examine weather within and across the cities.

<hr/>

## Layer

One of the most common ways of combining multiple charts is to *layer* marks on top of each other. If the underlying scale domains are compatible, we can merge them to form _shared axes_. If either of the `x` or `y` encodings is not compatible, we might instead create a _dual-axis chart_, which overlays marks using separate scales and axes.

### Shared Axes

Let's start by plotting the minimum and maximum average temperatures per month:


```js echo
render({
  mark: { type: 'area' },
  data: { values: weather },
  encoding: {
    x: { timeUnit: 'month', field: 'date' },
    y: { aggregate: 'average', field: 'temp_max' },
    y2: { aggregate: 'average', field: 'temp_min' }
  }
})
```

_The plot shows us temperature ranges for each month over the entirety of our data. However, this is pretty misleading as it aggregates the measurements for both Seattle and New York!_

Let's subdivide the data by location using a color encoding, while also adjusting the mark opacity to accommodate overlapping areas:

```js echo
render({
  mark: { type: 'area', opacity: 0.3 },
  data: { values: weather },
  encoding: {
    x: { timeUnit: 'month', field: 'date' },
    y: { aggregate: 'average', field: 'temp_max' },
    y2: { aggregate: 'average', field: 'temp_min' },
    color: { field: 'location', type: 'N' }
  }
})
```

_We can see that Seattle is more temperate: warmer in the winter, and cooler in the summer._

In this case we've created a layered chart without any special features by simply subdividing the area marks by color. While the chart above shows us the temperature ranges, we might also want to emphasize the middle of the range.

Let's create a line chart showing the average temperature midpoint. We'll use a `calculate` transform to compute the midpoints between the minimum and maximum daily temperatures:

```js echo
render({
  mark: { type: 'line' },
  data: { values: weather },
  transform: [
    { calculate: '(datum.temp_min + datum.temp_max) / 2', as: 'temp_mid' }
  ],
  encoding: {
    x: { timeUnit: 'month', field: 'date' },
    y: { aggregate: 'average', field: 'temp_mid' },
    color: { field: 'location', type: 'N' }
  }
})
```

We'd now like to combine these charts by layering the midpoint lines over the range areas. Using the `layer` directive, we can specify that we want a new layered chart in which `chart1` is the first layer and `chart2` is a second layer drawn on top:

```js
{
  const tempMinMax = {
    mark: { type: 'area', opacity: 0.3 },
    data: { values: weather },
    encoding: {
      x: { timeUnit: 'month', field: 'date' },
      y: { aggregate: 'average', field: 'temp_max' },
      y2: { aggregate: 'average', field: 'temp_min' },
      color: { field: 'location', type: 'N' }
    }
  };

  const tempMid = {
    mark: { type: 'line' },
    data: { values: weather },
    transform: [
      { calculate: '(datum.temp_min + datum.temp_max) / 2', as: 'temp_mid' }
    ],
    encoding: {
      x: { timeUnit: 'month', field: 'date' },
      y: { aggregate: 'average', field: 'temp_mid' },
      color: { field: 'location', type: 'N' }
    }
  };

  display(await render({ layer: [ tempMinMax, tempMid ] }));
}
```

```js run=false
const tempMinMax = {
  mark: { type: 'area', opacity: 0.3 },
  data: { values: weather },
  encoding: {
    x: { timeUnit: 'month', field: 'date' },
    y: { aggregate: 'average', field: 'temp_max' },
    y2: { aggregate: 'average', field: 'temp_min' },
    color: { field: 'location', type: 'N' }
  }
};

const tempMid = {
  mark: { type: 'line' },
  data: { values: weather },
  transform: [
    { calculate: '(datum.temp_min + datum.temp_max) / 2', as: 'temp_mid' }
  ],
  encoding: {
    x: { timeUnit: 'month', field: 'date' },
    y: { aggregate: 'average', field: 'temp_mid' },
    color: { field: 'location', type: 'N' }
  }
}

render({ layer: [ tempMinMax, tempMid ] })
```

_Now we have a multi-layer plot! However, the y-axis title (though informative) has become a bit long and unruly..._

Let's customize our axes to clean up the plot. If we set a custom axis title within one of the layers, it will automatically be used as a shared axis title for all the layers:

```js
{
  const tempMinMax = {
    mark: { type: 'area', opacity: 0.3 },
    data: { values: weather },
    encoding: {
      x: {
        timeUnit: 'month', field: 'date',
        axis: { format: '%b' },
        title: null
      },
      y: {
        aggregate: 'average', field: 'temp_max',
        title: 'Avg. Temperature °C'
      },
      y2: { aggregate: 'average', field: 'temp_min' },
      color: { field: 'location', type: 'N' }
    }
  };

  const tempMid = {
    mark: { type: 'line' },
    data: { values: weather },
    transform: [
      { calculate: '(datum.temp_min + datum.temp_max) / 2', as: 'temp_mid' }
    ],
    encoding: {
      x: { timeUnit: 'month', field: 'date' },
      y: { aggregate: 'average', field: 'temp_mid' },
      color: { field: 'location', type: 'N' }
    }
  };

  display(await render({ layer: [ tempMinMax, tempMid ] }));
}
```

```js run=false
const tempMinMax = {
  mark: { type: 'area', opacity: 0.3 },
  data: { values: weather },
  encoding: {
    x: {
      timeUnit: 'month', field: 'date',
      axis: { format: '%b' },
      title: null
    },
    y: {
      aggregate: 'average', field: 'temp_max',
      title: 'Avg. Temperature °C'
    },
    y2: { aggregate: 'average', field: 'temp_min' },
    color: { field: 'location', type: 'N' }
  }
};

const tempMid = {
  mark: { type: 'line' },
  data: { values: weather },
  transform: [
    { calculate: '(datum.temp_min + datum.temp_max) / 2', as: 'temp_mid' }
  ],
  encoding: {
    x: { timeUnit: 'month', field: 'date' },
    y: { aggregate: 'average', field: 'temp_mid' },
    color: { field: 'location', type: 'N' }
  }
};

render({ layer: [ tempMinMax, tempMid ] })
```

_What happens if both layers have custom axis titles? Modify the code above to find out..._

When creating multiple views, we might find ourselves redundantly specifying the same input data for multiple marks. If we want to, we can move a shared data definition to the `layer`-level for more compact specifications, like so:

```js
{
  const tempMinMax = {
    mark: { type: 'area', opacity: 0.3 },
    encoding: {
      x: {
        timeUnit: 'month', field: 'date',
        axis: { format: '%b' },
        title: null
      },
      y: {
        aggregate: 'average', field: 'temp_max',
        title: 'Avg. Temperature °C'
      },
      y2: { aggregate: 'average', field: 'temp_min' },
      color: { field: 'location', type: 'N' }
    }
  };

  const tempMid = {
    mark: { type: 'line' },
    encoding: {
      x: { timeUnit: 'month', field: 'date' },
      y: { aggregate: 'average', field: 'temp_mid' },
      color: { field: 'location', type: 'N' }
    }
  };

  display(await render({
    layer: [ tempMinMax, tempMid ],
    data: { values: weather },
    transform: [
      { calculate: '(datum.temp_min + datum.temp_max) / 2', as: 'temp_mid' }
    ]
  }));
}
```

```js run=false
const tempMinMax = {
  mark: { type: 'area', opacity: 0.3 },
  encoding: {
    x: {
      timeUnit: 'month', field: 'date',
      axis: { format: '%b' },
      title: null
    },
    y: {
      aggregate: 'average', field: 'temp_max',
      title: 'Avg. Temperature °C'
    },
    y2: { aggregate: 'average', field: 'temp_min' },
    color: { field: 'location', type: 'N' }
  }
};

const tempMid = {
  mark: { type: 'line' },
  encoding: {
    x: { timeUnit: 'month', field: 'date' },
    y: { aggregate: 'average', field: 'temp_mid' },
    color: { field: 'location', type: 'N' }
  }
};

render({
  layer: [ tempMinMax, tempMid ],
  data: { values: weather },
  transform: [
    { calculate: '(datum.temp_min + datum.temp_max) / 2', as: 'temp_mid' }
  ]
})
```

Note that the order of inputs to a layer matters, as subsequent layers will be drawn on top of earlier layers. _Try swapping the order of the charts in the cells above. What happens? (Hint: look closely at the color of the `line` marks.)_

### Dual-Axis Charts

_Seattle has a reputation as a rainy city. Is that deserved?_

Let's look at precipitation alongside temperature to learn more. First let's create a base plot that shows average monthly precipitation in Seattle:

```js echo
render({
  mark: { type: 'line', interpolate: 'monotone', stroke: 'grey' },
  data: { values: weather },
   transform: [
    { filter: 'datum.location == "Seattle"' }
  ],
  encoding: {
    x: { timeUnit: 'month', field: 'date', title: null },
    y: { aggregate: 'average', field: 'precipitation', title: 'Precipitation' }
  }
})
```

To facilitate comparison with the temperature data, let's create a new layered chart. Here's what happens if we try to layer the charts as we did earlier:

```js
{
  const tempMinMax = {
    mark: { type: 'area', opacity: 0.3 },
    encoding: {
      x: {
        timeUnit: 'month', field: 'date',
        axis: { format: '%b' },
        title: null
      },
      y: {
        aggregate: 'average', field: 'temp_max',
        title: 'Avg. Temperature °C'
      },
      y2: { aggregate: 'average', field: 'temp_min' }
    }
  };

  const precip = {
    mark: { type: 'line', interpolate: 'monotone', stroke: 'grey' },
    encoding: {
      x: { timeUnit: 'month', field: 'date', title: null },
      y: { aggregate: 'average', field: 'precipitation', title: 'Precipitation' }
    }
  };

  display(await render({
    layer: [ tempMinMax, precip ],
    data: { values: weather },
    transform: [
      { filter: 'datum.location == "Seattle"' }
    ]
  }));
}
```

```js run=false
const tempMinMax = {
  mark: { type: 'area', opacity: 0.3 },
  encoding: {
    x: {
      timeUnit: 'month', field: 'date',
      axis: { format: '%b' },
      title: null
    },
    y: {
      aggregate: 'average', field: 'temp_max',
      title: 'Avg. Temperature °C'
    },
    y2: { aggregate: 'average', field: 'temp_min' }
  }
};

const precip = {
  mark: { type: 'line', interpolate: 'monotone', stroke: 'grey' },
  encoding: {
    x: { timeUnit: 'month', field: 'date', title: null },
    y: { aggregate: 'average', field: 'precipitation', title: 'Precipitation' }
  }
};

render({
  layer: [ tempMinMax, precip ],
  data: { values: weather },
  transform: [
    { filter: 'datum.location == "Seattle"' }
  ]
})
```

_The precipitation values use a much smaller range of the y-axis than the temperatures!_

By default, layered charts use a *shared domain*: the values for the x-axis or y-axis are combined across all the layers to determine a shared extent. This default behavior assumes that the layered values have the same units. However, this doesn't hold up for this example, as we are combining temperature values (degrees Celsius) with precipitation values (inches)!

If we want to use different y-axis scales, we need to specify how we want Vega-Lite to *resolve* the data across layers. In this case, we want to resolve the y-axis `scale` domains to be `independent` rather than use a `shared` domain:

```js
{
  const tempMinMax = {
    mark: { type: 'area', opacity: 0.3 },
    encoding: {
      x: {
        timeUnit: 'month', field: 'date',
        axis: { format: '%b' },
        title: null
      },
      y: {
        aggregate: 'average', field: 'temp_max',
        title: 'Avg. Temperature °C'
      },
      y2: { aggregate: 'average', field: 'temp_min' }
    }
  };

  const precip = {
    mark: { type: 'line', interpolate: 'monotone', stroke: 'grey' },
    encoding: {
      x: { timeUnit: 'month', field: 'date', title: null },
      y: { aggregate: 'average', field: 'precipitation', title: 'Precipitation' }
    }
  };

  display(await render({
    layer: [ tempMinMax, precip ],
    data: { values: weather },
    transform: [
      { filter: 'datum.location == "Seattle"' }
    ],
    resolve: {
      scale: { y: 'independent' } // resolve to independent y channel scales
    }
  }));
}
```

```js run=false
const tempMinMax = {
  mark: { type: 'area', opacity: 0.3 },
  encoding: {
    x: {
      timeUnit: 'month', field: 'date',
      axis: { format: '%b' },
      title: null
    },
    y: {
      aggregate: 'average', field: 'temp_max',
      title: 'Avg. Temperature °C'
    },
    y2: { aggregate: 'average', field: 'temp_min' }
  }
};

const precip = {
  mark: { type: 'line', interpolate: 'monotone', stroke: 'grey' },
  encoding: {
    x: { timeUnit: 'month', field: 'date', title: null },
    y: { aggregate: 'average', field: 'precipitation', title: 'Precipitation' }
  }
};

render({
  layer: [ tempMinMax, precip ],
  data: { values: weather },
  transform: [
    { filter: 'datum.location == "Seattle"' }
  ]
})
```

_We can now see that autumn is the rainiest season in Seattle (peaking in November), complemented by dry summers._

While dual-axis charts can be useful, _they are often prone to misinterpretation_, as the different units and axis scales may be incommensurate. As is feasible, you might consider transformations that map different data fields to shared units, for example showing [quantiles](https://en.wikipedia.org/wiki/Quantile) or relative percentage change.

<hr/>

## Facet

*Faceting* involves subdividing a dataset into groups and creating a separate plot for each group. In earlier notebooks, we learned how to create faceted charts using the `row` and `column` encoding channels. We'll first review those channels and then show how they are instances of the more general `facet` operator.

Let's start with a basic histogram of maximum temperature values in Seattle:

```js echo
render({
  mark: { type: 'bar' },
  data: { values: weather },
  transform: [
    { filter: 'datum.location == "Seattle"' }
  ],
  encoding: {
    x: {
      field: 'temp_max', type: 'Q', bin: true,
      title: 'Temperature (°C)'
    },
    y: { aggregate: 'count' }
  }
})
```

_How does this temperature profile change based on the weather of a given day – that is, whether there was drizzle, fog, rain, snow, or sun?_

Let's use the `column` encoding channel to facet the data by weather type. We can also use `color` as a redundant encoding, using a customized color range:

```js echo
const colors = {
  domain: ['drizzle', 'fog', 'rain', 'snow', 'sun'],
  range: ['#aec7e8', '#c7c7c7', '#1f77b4', '#9467bd', '#e7ba52']
};
```

```js echo
render({
  mark: { type: 'bar' },
  data: { values: weather },
  transform: [
    { filter: 'datum.location == "Seattle"' }
  ],
  encoding: {
    x: {
      field: 'temp_max', type: 'Q', bin: true,
      title: 'Temperature (°C)'
    },
    y: { aggregate: 'count' },
    color: { field: 'weather', type: 'N', scale: colors },
    column: { field: 'weather', type: 'N' }
  },
  width: 150,
  height: 150
})
```

_Unsurprisingly, those rare snow days center on the coldest temperatures, followed by rainy and foggy days. Sunny days are warmer and, despite Seattle stereotypes, are the most plentiful. Though as any Seattleite can tell you, the drizzle occasionally comes, no matter the temperature!_

In addition to `row` and `column` encoding channels *within* a mark definition, we can take a basic mark specification and then apply faceting using an explicit `facet` operator.

Let's recreate the chart above, but this time using `facet`. We start with the same basic histogram definition, but remove the data source, filter transform, and column channel. We then place this definition within a `facet` specification, passing in the data and specifying that we should facet into columns according to the `weather` field. The `facet` property accepts an object with `row` and/or `column` properties. The two can be used together to create a 2D grid of faceted plots.

Finally we include our filter transform, applying it to the top-level faceted chart. While we could apply the filter transform to the histogram definition as before, that is slightly less efficient. Rather than filter out "New York" values within each facet cell, applying the filter to the faceted chart lets Vega-Lite know that we can filter out those values up front, prior to the facet subdivision.
`

```js echo
render({
  facet: {
    column: { field: 'weather' }
  },
  data: { values: weather },
  transform: [
    { filter: 'datum.location == "Seattle"' }
  ],
  spec: {
    mark: { type: 'bar' },
    encoding: {
      x: {
        field: 'temp_max', type: 'Q', bin: true,
        title: 'Temperature (°C)'
      },
      y: { aggregate: 'count' },
      color: { field: 'weather', type: 'N', scale: colors },
    },
    width: 150,
    height: 150
  }
})
```

Given all the extra code above, why would we want to use an explicit `facet` operator? For basic charts, we should certainly use the `column` or `row` encoding channels if we can. However, using the `facet` operator explicitly is useful if we want to facet composed views, such as layered charts.

Let's revisit our layered temperature plots from earlier. Instead of plotting data for New York and Seattle in the same plot, let's break them up into separate facets. The individual chart definitions are nearly the same as before: one area mark and one line mark. We can layer the charts much as before,  then invoke `facet` on the layered view, passing in the data and specifying `column` facets based on the `location` field:

```js
{
  const tempMinMax = {
    mark: { type: 'area', opacity: 0.3 },
    encoding: {
      x: {
        timeUnit: 'month', field: 'date',
        axis: { format: '%b' },
        title: null
      },
      y: {
        aggregate: 'average', field: 'temp_max',
        title: 'Avg. Temperature (°C)'
      },
      y2: { aggregate: 'average', field: 'temp_min' },
      color: { field: 'location', type: 'N' }
    }
  };

  const tempMid = {
    mark: { type: 'line' },
    encoding: {
      x: { timeUnit: 'month', field: 'date' },
      y: { aggregate: 'average', field: 'temp_mid' },
      color: { field: 'location', type: 'N' }
    }
  };

  display(await render({
    facet: {
      column: { field: 'location' }
    },
    spec: {
      layer: [ tempMinMax, tempMid ]
    },
    data: { values: weather },
    transform: [
      { calculate: '(datum.temp_min + datum.temp_max) / 2', as: 'temp_mid' }
    ]
  }));
}
```

```js run=false
const tempMinMax = {
  mark: { type: 'area', opacity: 0.3 },
  encoding: {
    x: {
      timeUnit: 'month', field: 'date',
      axis: { format: '%b' },
      title: null
    },
    y: {
      aggregate: 'average', field: 'temp_max',
      title: 'Avg. Temperature (°C)'
    },
    y2: { aggregate: 'average', field: 'temp_min' },
    color: { field: 'location', type: 'N' }
  }
};

const tempMid = {
  mark: { type: 'line' },
  encoding: {
    x: { timeUnit: 'month', field: 'date' },
    y: { aggregate: 'average', field: 'temp_mid' },
    color: { field: 'location', type: 'N' }
  }
};

render({
  facet: {
    column: { field: 'location' }
  },
  spec: {
    layer: [ tempMinMax, tempMid ]
  },
  data: { values: weather },
  transform: [
    { calculate: '(datum.temp_min + datum.temp_max) / 2', as: 'temp_mid' }
  ]
})
```

The faceted charts we have seen so far use the same axis domains across the facet cells. This default of using *shared* scales and axes helps aid accurate comparison of values. However, in some cases you may wish to scale each chart independently, for example if the range of values in the cells differs significantly.

Similar to layered charts, faceted charts also support _resolving_ to independent scales or axes across plots. Let's see what happens if we call the `resolve` method to request `independent` y-axes:

```js
{
  const tempMinMax = {
    mark: { type: 'area', opacity: 0.3 },
    encoding: {
      x: {
        timeUnit: 'month', field: 'date',
        axis: { format: '%b' },
        title: null
      },
      y: {
        aggregate: 'average', field: 'temp_max',
        title: 'Avg. Temperature (°C)'
      },
      y2: { aggregate: 'average', field: 'temp_min' },
      color: { field: 'location', type: 'N' }
    }
  };

  const tempMid = {
    mark: { type: 'line' },
    encoding: {
      x: { timeUnit: 'month', field: 'date' },
      y: { aggregate: 'average', field: 'temp_mid' },
      color: { field: 'location', type: 'N' }
    }
  };

  display(await render({
    facet: {
      column: { field: 'location' }
    },
    spec: {
      layer: [ tempMinMax, tempMid ]
    },
    data: { values: weather },
    transform: [
      { calculate: '(datum.temp_min + datum.temp_max) / 2', as: 'temp_mid' }
    ],
    resolve: { axis: { y: 'independent' } }
  }));
}
```

```js run=false
const tempMinMax = {
  mark: { type: 'area', opacity: 0.3 },
  encoding: {
    x: {
      timeUnit: 'month', field: 'date',
      axis: { format: '%b' },
      title: null
    },
    y: {
      aggregate: 'average', field: 'temp_max',
      title: 'Avg. Temperature (°C)'
    },
    y2: { aggregate: 'average', field: 'temp_min' },
    color: { field: 'location', type: 'N' }
  }
};

const tempMid = {
  mark: { type: 'line' },
  encoding: {
    x: { timeUnit: 'month', field: 'date' },
    y: { aggregate: 'average', field: 'temp_mid' },
    color: { field: 'location', type: 'N' }
  }
};

render({
  facet: {
    column: { field: 'location' }
  },
  spec: {
    layer: [ tempMinMax, tempMid ]
  },
  data: { values: weather },
  transform: [
    { calculate: '(datum.temp_min + datum.temp_max) / 2', as: 'temp_mid' }
  ],
  resolve: { axis: { y: 'independent' } }
})
```

_The chart above looks largely unchanged, but the plot for Seattle now includes its own axis._

What if we instead `resolve` the underlying scale domains?

_Now we see facet cells with different axis scale domains. In this case, using independent scales seems like a bad idea! The domains aren't very different, and one might be fooled into thinking that New York and Seattle have similar maximum summer temperatures._

```js
{
  const tempMinMax = {
    mark: { type: 'area', opacity: 0.3 },
    encoding: {
      x: {
        timeUnit: 'month', field: 'date',
        axis: { format: '%b' },
        title: null
      },
      y: {
        aggregate: 'average', field: 'temp_max',
        title: 'Avg. Temperature (°C)'
      },
      y2: { aggregate: 'average', field: 'temp_min' },
      color: { field: 'location', type: 'N' }
    }
  };

  const tempMid = {
    mark: { type: 'line' },
    encoding: {
      x: { timeUnit: 'month', field: 'date' },
      y: { aggregate: 'average', field: 'temp_mid' },
      color: { field: 'location', type: 'N' }
    }
  };

  display(await render({
    facet: {
      column: { field: 'location' }
    },
    spec: {
      layer: [ tempMinMax, tempMid ]
    },
    data: { values: weather },
    transform: [
      { calculate: '(datum.temp_min + datum.temp_max) / 2', as: 'temp_mid' }
    ],
    resolve: { scale: { y: 'independent' } }
  }));
}
```

```js run=false
const tempMinMax = {
  mark: { type: 'area', opacity: 0.3 },
  encoding: {
    x: {
      timeUnit: 'month', field: 'date',
      axis: { format: '%b' },
      title: null
    },
    y: {
      aggregate: 'average', field: 'temp_max',
      title: 'Avg. Temperature (°C)'
    },
    y2: { aggregate: 'average', field: 'temp_min' },
    color: { field: 'location', type: 'N' }
  }
};

const tempMid = {
  mark: { type: 'line' },
  encoding: {
    x: { timeUnit: 'month', field: 'date' },
    y: { aggregate: 'average', field: 'temp_mid' },
    color: { field: 'location', type: 'N' }
  }
};

render({
  facet: {
    column: { field: 'location' }
  },
  spec: {
    layer: [ tempMinMax, tempMid ]
  },
  data: { values: weather },
  transform: [
    { calculate: '(datum.temp_min + datum.temp_max) / 2', as: 'temp_mid' }
  ],
  resolve: { scale: { y: 'independent' } }
})
```

To borrow a cliché: just because you *can* do something, doesn't mean you *should*...

<hr/>

## Concatenate

Faceting creates [small multiple](https://en.wikipedia.org/wiki/Small_multiple) plots that show separate subdivisions of the data. However, we might wish to create a multi-view display with different views of the *same* dataset (not subsets) or views involving *different* datasets.

Vega-Lite provides *concatenation* operators to combine arbitrary charts into a composed chart. The `hconcat` operator performs horizontal concatenation, while the `vconcat` operator performs vertical concatenation.

Let's start with a basic line chart showing the average maximum temperature per month for both New York and Seattle, much like we've seen before:

```js echo
render({
  mark: { type: 'line' },
  data: { values: weather },
  encoding: {
    x: { timeUnit: 'month', field: 'date', title: null },
    y: { aggregate: 'average', field: 'temp_max' },
    color: { field: 'location', type: 'N' }
  }
})
```

_What if we want to view not just temperature, but also precipitation and wind levels?_

Let's create a concatenated chart consisting of three plots. We'll start by defining a "base" chart definition that contains all the aspects that should be shared by our three plots. We can then modify this base chart to create customized variants, with different y-axis encodings for the `temp_max`, `precipitation`, and `wind` fields. We can then concatenate them using the `hconcat` operator:

```js
{
  const base = (encoding) => {
    return {
      mark: { type: 'line' },
      data: { values: weather },
      encoding: {
        x: { timeUnit: 'month', field: 'date', title: null },
        ...encoding,
        color: { field: 'location', type: 'N' }
      },
      width: 240,
      height: 180
    };
  };

  const temp = base({ y: { aggregate: 'average', field: 'temp_max' } });
  const precip = base({ y: { aggregate: 'average', field: 'precipitation' } });
  const wind = base({ y: { aggregate: 'average', field: 'wind' } });

  display(await render({
    hconcat: [temp, precip, wind]
  }));
}
```

```js run=false
const base = (encoding) => {
  return {
    mark: { type: 'line' },
    data: { values: weather },
    encoding: {
      x: { timeUnit: 'month', field: 'date', title: null },
      ...encoding,
      color: { field: 'location', type: 'N' }
    },
    width: 240,
    height: 180
  };
};

const temp = base({ y: { aggregate: 'average', field: 'temp_max' } });
const precip = base({ y: { aggregate: 'average', field: 'precipitation' } });
const wind = base({ y: { aggregate: 'average', field: 'wind' } });

render({
  hconcat: [temp, precip, wind]
})
```

Vertical concatenation works similarly to horizontal concatenation. _Using the `vconcat` operator, modify the code to use a vertical ordering instead of a horizontal ordering._

Finally, note that horizontal and vertical concatenation can be combined. _What happens if you write something like this?_

```js
{ vconcat: [ { hconcat: [temp, precip] }, wind ] }
```

As we will revisit later, concatenation operators let you combine any and all charts into a multi-view dashboard!

<hr/>

## Repeat

The concatenation operators above are quite general, allowing arbitrary charts to be composed. Nevertheless, the example above was still a bit verbose: we have three very similar charts, yet have to define them separately and then concatenate them.

For cases where only one or two variables are changing, the `repeat` operator provides a convenient shortcut for creating multiple charts. Given a *template* specification with some free variables, the repeat operator will then create a chart for each specified assignment of those variables.

Let's recreate our concatenation example above using the `repeat` operator. The only aspect that changes across charts is the choice of data field for the `y` encoding channel. To create a template specification, we can use the *repeater variable* `{ repeat: 'column' }` as our y-axis field. This code simply states that we want to use the variable assigned to the `column` repeater, which organizes repeated charts in a horizontal direction.

We then wrap our chart specification within a `repeat` operator, passing in data field names for each column:

```js echo
render({
  repeat: {
    column: ['temp_max', 'precipitation', 'wind']
  },
  spec: {
    mark: { type: 'line' },
    data: { values: weather },
    encoding: {
      x: { timeUnit: 'month', field: 'date', title: null },
      y: { aggregate: 'average', field: { repeat: 'column' } },
      color: { field: 'location', type: 'N' }
    },
    width: 240,
    height: 180
  }
})
```

Repetition is supported for both columns and rows. _What happens if you modify the code above to use `row` instead of `column`?_

We can also use `row` and `column` repetition together! One common visualization for exploratory data analysis is the [scatter plot matrix (or SPLOM)](https://en.wikipedia.org/wiki/Scatter_plot#Scatterplot_matrices). Given a collection of variables to inspect, a SPLOM provides a grid of all pairwise plots of those variables, allowing us to assess potential associations.

Let's use the `repeat` operator to create a SPLOM for the `temp_max`, `precipitation`, and `wind` fields. We first need a template specification, with repeater variables for both the x- and y-axis data fields. We then pass this to the `repeat` operator, with arrays of field names to use for both `row` and `column`. Vega-Lite will then generate the [cross product (or, Cartesian product)](https://en.wikipedia.org/wiki/Cartesian_product) to create the full space of repeated charts.

_Looking at these plots, there does not appear to be a strong association between precipitation and wind, though we do see that extreme wind and precipitation events occur in similar temperature ranges (~5-15° C). However, this observation is not particularly surprising: if we revisit our histogram at the beginning of the facet section, we can plainly see that the days with maximum temperatures in the range of 5-15° C are the most commonly occurring._

```js echo
render({
  repeat: {
    row: ['temp_max', 'precipitation', 'wind'],
    column: ['wind', 'precipitation', 'temp_max']
  },
  data: { values: weather },
  transform: [
    { filter: 'datum.location == "Seattle"' }
  ],
  spec: {
    mark: { type: 'circle', size: 15, opacity: 0.5 },
    encoding: {
      x: { field: { repeat: 'column' }, type: 'Q' },
      y: { field: { repeat: 'row' }, type: 'Q' }
    },
    width: 150,
    height: 150
  }
})
```

*Now modify the code above to get a better understanding of chart repetition. Try adding another variable (`temp_min`) to the SPLOM. What happens if you rearrange the order of the field names in either the `row` or `column` arguments to the `repeat` operator?*

_Finally, to really appreciate what the `repeat` operator provides, take a moment to imagine how you might recreate the SPLOM above using only `hconcat` and `vconcat`!_

<hr/>

## A View Composition Algebra

Together, the composition operators `layer`, `facet`, `concat`, and `repeat` form a *view composition algebra*: the various operators can be combined to construct a variety of multi-view visualizations.

As an example, let's start with two basic charts: a histogram and a simple line (a single `rule` mark) showing a global average.

```js
{
  const basic1 = {
    mark: { type: 'bar' },
    data: { values: weather },
    transform: [
      { filter: 'datum.location == "Seattle"' }
    ],
    encoding: {
      x: { timeUnit: 'month', field: 'date', type: 'O', title: 'Month' },
      y: { aggregate: 'average', field: 'temp_max' }
    }
  };

  const basic2 = {
    mark: { type: 'rule', stroke: 'firebrick' },
    data: { values: weather },
    transform: [
      { filter: 'datum.location == "Seattle"' }
    ],
    encoding: {
      y: { aggregate: 'average', field: 'temp_max' }
    }
  };

  display(await render({
    hconcat: [basic1, basic2]
  }));
}
```

```js run=false
const basic1 = {
  mark: { type: 'bar' },
  data: { values: weather },
  transform: [
    { filter: 'datum.location == "Seattle"' }
  ],
  encoding: {
    x: { timeUnit: 'month', field: 'date', type: 'O', title: 'Month' },
    y: { aggregate: 'average', field: 'temp_max' }
  }
};

const basic2 = {
  mark: { type: 'rule', stroke: 'firebrick' },
  data: { values: weather },
  transform: [
    { filter: 'datum.location == "Seattle"' }
  ],
  encoding: {
    y: { aggregate: 'average', field: 'temp_max' }
  }
};

render({
  hconcat: [basic1, basic2]
})
```

We can combine the two charts using a `layer` operator, and then `repeat` that layered chart to show histograms with overlaid averages for multiple fields:

```js echo
render({
  repeat: {
    column: ['temp_max', 'precipitation', 'wind']
  },
  data: { values: weather },
  transform: [
    { filter: 'datum.location == "Seattle"' }
  ],
  spec: {
    layer: [
      {
        mark: { type: 'bar' },
        encoding: {
          x: { timeUnit: 'month', field: 'date', type: 'O', title: 'Month' },
          y: { aggregate: 'average', field: { repeat: 'column' } }
        }
      },
      {
        mark: { type: 'rule', stroke: 'firebrick' },
        encoding: {
          y: { aggregate: 'average', field: { repeat: 'column' } }
        }
      }
    ],
    width: 200,
    height: 150
  }
})
```

Focusing only on the multi-view composition operators, the model for the visualization above is:

~~~
 repeat(column: [...])
 |- layer
    |- basic1
    |- basic2
~~~

Now let's explore how we can apply *all* the operators within a final [dashboard](https://en.wikipedia.org/wiki/Dashboard_%28business%29) that provides an overview of Seattle weather. We'll combine the SPLOM and faceted histogram displays from earlier sections with the repeated histograms above:

```js
{
  const splom = {
    repeat: {
      row: ['temp_max', 'precipitation', 'wind'],
      column: ['wind', 'precipitation', 'temp_max']
    },
    spec: {
      mark: { type: 'circle', size: 15, opacity: 0.5 },
      encoding: {
        x: { field: { repeat: 'column' }, type: 'Q' },
        y: { field: { repeat: 'row' }, type: 'Q' }
      },
      width: 125,
      height: 125
    }
  };

  const dateHist = {
    repeat: {
      row: ['temp_max', 'precipitation', 'wind']
    },
    spec: {
      layer: [
        {
          mark: { type: 'bar' },
          encoding: {
            x: { timeUnit: 'month', field: 'date', type: 'O', title: 'Month' },
            y: { aggregate: 'average', field: { repeat: 'row' } }
          }
        },
        {
          mark: { type: 'rule', stroke: 'firebrick' },
          encoding: {
            y: { aggregate: 'average', field: { repeat: 'row' } }
          }
        }
      ],
      width: 175,
      height: 125
    }
  };

  const tempHist = {
    facet: {
      column: { field: 'weather' }
    },
    spec: {
      mark: { type: 'bar' },
      encoding: {
        x: {
          field: 'temp_max', type: 'Q', bin: true,
          title: 'Temperature (°C)'
        },
        y: { aggregate: 'count' },
        color: {
          field: 'weather', type: 'N',
          scale: {
            domain: ['drizzle', 'fog', 'rain', 'snow', 'sun'],
            range: ['#aec7e8', '#c7c7c7', '#1f77b4', '#9467bd', '#e7ba52']
          }
        }
      },
      width: 115,
      height: 100
    }
  };

  display(await render({
    data: { values: weather },
    transform: [
      { filter: 'datum.location == "Seattle"' }
    ],
    title: 'Seattle Weather Dashboard',
    vconcat: [
      { hconcat: [splom, dateHist] },
      tempHist
    ],
    resolve: { legend: { color: 'independent' } },
    config: { axis: { labelAngle: 0 } }
  }));
}
```

```js run=false
const splom = {
  repeat: {
    row: ['temp_max', 'precipitation', 'wind'],
    column: ['wind', 'precipitation', 'temp_max']
  },
  spec: {
    mark: { type: 'circle', size: 15, opacity: 0.5 },
    encoding: {
      x: { field: { repeat: 'column' }, type: 'Q' },
      y: { field: { repeat: 'row' }, type: 'Q' }
    },
    width: 125,
    height: 125
  }
};

const dateHist = {
  repeat: {
    row: ['temp_max', 'precipitation', 'wind']
  },
  spec: {
    layer: [
      {
        mark: { type: 'bar' },
        encoding: {
          x: { timeUnit: 'month', field: 'date', type: 'O', title: 'Month' },
          y: { aggregate: 'average', field: { repeat: 'row' } }
        }
      },
      {
        mark: { type: 'rule', stroke: 'firebrick' },
        encoding: {
          y: { aggregate: 'average', field: { repeat: 'row' } }
        }
      }
    ],
    width: 175,
    height: 125
  }
};

const tempHist = {
  facet: {
    column: { field: 'weather' }
  },
  spec: {
    mark: { type: 'bar' },
    encoding: {
      x: {
        field: 'temp_max', type: 'Q', bin: true,
        title: 'Temperature (°C)'
      },
      y: { aggregate: 'count' },
      color: {
        field: 'weather', type: 'N',
        scale: {
          domain: ['drizzle', 'fog', 'rain', 'snow', 'sun'],
          range: ['#aec7e8', '#c7c7c7', '#1f77b4', '#9467bd', '#e7ba52']
        }
      }
    },
    width: 115,
    height: 100
  }
};

render({
  data: { values: weather },
  transform: [
    { filter: 'datum.location == "Seattle"' }
  ],
  title: 'Seattle Weather Dashboard',
  vconcat: [
    { hconcat: [splom, dateHist] },
    tempHist
  ],
  resolve: { legend: { color: 'independent' } },
  config: { axis: { labelAngle: 0 } }
});
```

The full composition model for this dashboard is:

~~~
 vconcat
 |- hconcat
 |  |- repeat(row: [...], column: [...])
 |  |  |- splom base chart
 |  |- repeat(row: [...])
 |     |- layer
 |        |- dateHist base chart 1
 |        |- dateHist base chart 2
 |- facet(column: 'weather')
    |- tempHist base chart
~~~

_Phew!_ The dashboard also includes a few customizations to improve the layout:

- We adjust chart `width` and `height` properties to assist alignment and ensure the full visualization fits on the screen.
- We add `resolve: {legend: { color: 'independent' }}` to ensure the color legend is associated directly with the colored histograms by temperature. Otherwise, the legend will resolve to the dashboard as a whole.
- We use `config: {axis: { labelAngle: 0 }}` to ensure that no axis labels are rotated. This helps to ensure proper alignment among the scatter plots in the SPLOM and the histograms by month on the right.

_Try removing or modifying any of these adjustments and see how the dashboard layout responds!_

This dashboard can be reused to show data for other locations or from other datasets. _Update the dashboard to show weather patterns for New York instead of Seattle._

<hr/>

## Summary

For more details on multi-view composition, including control over sub-plot spacing and header labels, see the [Vega-Lite View Composition documentation](https://vega.github.io/vega-lite/docs/composition.html).

Now that we've seen how to compose multiple views, we're ready to put them into action. In addition to statically presenting data, multiple views can enable interactive multi-dimensional exploration. For example, using _linked selections_ we can highlight points in one view to see corresponding values highlight in other views.

In the next notebook, we'll examine how to author *interactive selections* for both individual plots and multi-view compositions.
