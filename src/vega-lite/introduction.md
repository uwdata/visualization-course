```js
import { render } from '../components/vega-lite.js';
import vega_datasets from 'npm:vega-datasets';
```

# Introduction to Vega-Lite

[**Vega-Lite**](https://vega.github.io/vega-lite) is a declarative language for interactive data visualization. Vega-Lite offers a powerful and concise visualization grammar for quickly building a wide range of statistical graphics.

<img style="max-width: 920px;" title="Vega-Lite Example Gallery" src="images/teaser.png">

By *declarative*, we mean that you can provide a high-level specification of *what* you want the visualization to include, in terms of *data*, *graphical marks*, and *encoding channels*, rather than having to specify *how* to implement the visualization in terms of for-loops, low-level drawing commands, *etc*. The key idea is that you declare links between data fields and visual encoding channels, such as the x-axis, y-axis, color, *etc*. The rest of the plot details are handled automatically. Building on this declarative plotting idea, a surprising range of simple to sophisticated visualizations can be created using a concise grammar.

To learn more about the motivation and basic concepts behind Vega-Lite, watch the [Vega-Lite presentation video from OpenVisConf 2017](https://www.youtube.com/watch?v=9uaHRWj04D4).

This notebook walks through the basic process of creating visualizations with Vega-Lite. Vega-Lite uses [JavaScript Object Notation (JSON)](https://en.wikipedia.org/wiki/JSON) as a stand-alone file format for describing charts.

<hr/>

## Imports

To start, we import a `render` method that takes a Vega-Lite JSON specification as input and returns a rendered webpage element. We will use Vega-Lite version 5:

```js run=false
import { render } from '../components/vega-lite.js';
```

We will often use datasets imported from the [vega-datasets](https://github.com/vega/vega-datasets) repository:

```js run=false
import vega_datasets from 'npm:vega-datasets@2';
```

<hr/>

## Data

Data in Vega-Lite is assumed to be formatted as a data table (or data frame) consisting of a set of named data *columns*. We will also regularly refer to data columns as data *fields*. Once loaded, the default table representation is an array of JavaScript objects.

When using Vega-Lite, datasets may be pre-loaded as an array of objects, or provided via a URL to load a network-accessible dataset. As we will see, the named columns of the data frame are an essential piece of plotting with Vega-Lite.

Let's starts by loading a dataset about cars from the vega-datasets collection...

```js echo
const cars = vega_datasets['cars.json']() // load and parse cars data
```

...and then inspect it within as a table display:

```js echo
Inputs.table(cars)
```

All datasets in the vega-datasets collection can also be accessed via URLs:

```js echo
vega_datasets['cars.json'].url
```

_Open the URL above in a separate browser tab if you want to examine the raw data file!_

<hr/>

### Weather Data

Statistical visualization in Vega-Lite begins with ["tidy"](http://vita.had.co.nz/papers/tidy-data.html) data frames. Here, we'll start by creating a simple data frame (`df`) containing the average precipitation (`precip`) for a given `city` and `month` &mdash; written in JSON format:

```js echo
const df = [
  {"city": "Seattle",  "month": "Apr", "precip": 2.68},
  {"city": "Seattle",  "month": "Aug", "precip": 0.87},
  {"city": "Seattle",  "month": "Dec", "precip": 5.31},
  {"city": "New York", "month": "Apr", "precip": 3.94},
  {"city": "New York", "month": "Aug", "precip": 4.13},
  {"city": "New York", "month": "Dec", "precip": 3.58},
  {"city": "Chicago",  "month": "Apr", "precip": 3.62},
  {"city": "Chicago",  "month": "Aug", "precip": 3.98},
  {"city": "Chicago",  "month": "Dec", "precip": 2.56}
];
```

Or, in a more human-friendly format:

```js echo
Inputs.table(df, { maxWidth: 600 })
```

<hr/>

## Marks and Encodings

Given the weather data above, we can specify how we would like the data to be visualized with Vega-Lite. We first indicate what kind of graphical *mark* (geometric shape) we want to use to represent the data. We can create a new Vega-Lite mark instance as an object with a `mark` property.

We then pass the data using the `data` property. We pass an object with a `values` key to indicate that our data is preloaded (other possibilities include loading data directly from a `url`).

```js echo
render({
  mark: 'point',
  data: { values: df }
})
```

Here the rendering consists of one point per row in the dataset, all plotted on top of each other, since we have not yet specified positions for these points.

To visually separate the points, we can map various *encoding channels* (or just *channels* for short) to fields in the dataset. For example, we can encode the data field `city` using the `y` channel, which represents the y-axis position of the points. To specify this, use the `encoding` key with an object containing definitions for specific channels.

```js echo
render({
  mark: 'point',
  data: { values: df },
  encoding: {
    y: { field: 'city', type: 'nominal' }
  }
})
```

The `encoding` property uses a key-value mapping between encoding channels (such as `x`, `y`, `color`, `shape`, `size`, *etc.*) to fields in the dataset, accessed by field name. We provide a channel encoding using the channel as an object key. To visualize a field, we indicate the field name along with a *data type* to guide the visualization design. Here we encode the `city` field as a `nominal` type, indicating unordered, categorical values:

```js echo
render({
  mark: 'point',
  data: { values: df },
  encoding: {
    y: { field: 'city', type: 'nominal' }
  }
})
```

Though we've now separated the data by one attribute, we still have multiple points overlapping within each category. Let's further separate these by adding an `x` encoding channel, mapped to the quantitative `precip` field:

```js echo
render({
  mark: 'point',
  data: { values: df },
  encoding: {
    x: { field: 'precip', type: 'quantitative' },
    y: { field: 'city', type: 'nominal' }
  }
})
```

_Seattle exhibits both the least-rainiest and most-rainiest months!_

Above we use the `quantitative` type to instruct Vega-Lite to treat `precip` as a quantitative field (that is, a real-valued number). We see that grid lines and axis titles are automatically added as well.

So far, we've seen `nominal` and `quantitative` types. The complete set of type-specific field methods is:

- `nominal` indicates a *nominal* type (unordered, categorical data),
- `ordinal` indicates an *ordinal* type (rank-ordered data),
- `quantitative` indicates a *quantitative* type (numerical magnitudes),
- `temporal` indicates a *temporal* type (corresponding to [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date) values),

What do you think will happen to our chart if we treat `precip` as a nominal or ordinal variable, rather than a quantitative variable? _Modify the code above and find out!_

We will take a closer look at data types and encoding channels in the next notebook.

<hr/>

## Data Transformation: Aggregation

To allow for more flexibility in how data are visualized, Vega-Lite has a built-in syntax for *aggregation* of data. For example, we can compute the average of all values by specifying an aggregation function along with the field name:

```js echo
render({
  mark: 'point',
  data: { values: df },
  encoding: {
    x: { aggregate: 'average', field: 'precip' },
    y: { field: 'city', type: 'nominal' }
  }
})
```

Now within each x-axis category, we see a single point reflecting the *average* of the values within that category. Because we are averaging, Vega-Lite automatically assumes the result has a quantitative type. However, you can add a `type` property to specify a different treatment, if desired.

_Does Seattle really have the lowest average precipitation of these cities? (It does!) Still, how might this plot mislead? Which months are included? What counts as precipitation?_

Vega-Lite supports a variety of aggregation functions, including `count`, `min` (minimum), `max` (maximum), `average`, `median`, and `stdev` (standard deviation). In a later notebook, we will take a tour of data transformations, including aggregation, sorting, filtering, and creation of new derived fields using calculation formulas.

<hr/>

## Changing the Mark Type

Let's say we want to represent our aggregated values using rectangular bars rather than circular points. We can change our `mark` type from `"point"` to `"bar"`:

```js echo
render({
  mark: 'bar',
  data: { values: df },
  encoding: {
    x: { aggregate: 'average', field: 'precip' },
    y: { field: 'city', type: 'nominal' }
  }
})
```

Because the nominal field `city` is mapped to the `y`-axis, the result is a horizontal bar chart. To get a vertical bar chart, we can simply swap the `x` and `y` assignments:

```js echo
render({
  mark: 'bar',
  data: { values: df },
  encoding: {
    y: { aggregate: 'average', field: 'precip' },
    x: { field: 'city', type: 'nominal' }
  }
})
```

<hr/>

## Customizing a Visualization

By default Vega-Lite makes some choices about properties of the visualization, but these can be changed using methods to customize the look of the visualization. For example, we can modify scale properties using the `scale` property, set titles using the `title` property, and we can specify the color of the mark by passing an object to the `mark` property with a `color` property containing a valid [CSS color string](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value):

```js echo
render({
  mark: { type: 'point', color: 'firebrick' },
  data: { values: df },
  encoding: {
    x: { field: 'precip', type: 'quantitative', scale: { type: 'log' }, title: 'Log-Scaled Precipitation' },
    y: { field: 'city', type: 'nominal', title: 'City' }
  }
})
```

A subsequent notebook will explore the various options available for scales, axes, and legends to create customized charts.`

<hr/>

## Multiple Views

As we've seen above, a basic Vega-Lite visualization represents a plot with a single mark type. What about more complicated diagrams, involving multiple charts or layers? Using a set of *view composition* operators, Vega-Lite can take multiple chart definitions and combine them to create more complex views.

As a starting point, let's plot the cars dataset in a line chart, showing the average mileage by the year of manufacture:

```js echo
render({
  mark: { type: 'line' },
  data: { values: cars },
  encoding: {
    x: { field: 'Year', type: 'temporal' },
    y: { aggregate: 'average', field: 'Miles_per_Gallon' }
  }
})
```

To augment this plot, we might like to add `circle` marks for each averaged data point. (The `circle` mark is a shorthand for `point` marks that used filled circles.)

We can start by defining each chart separately: first a line plot, then a scatter plot. We can then use the `layer` operator to combine the two into a layered chart.

```js echo
render({
  layer: [
    {
      mark: { type: 'line' },
      data: { values: cars },
      encoding: {
        x: { field: 'Year', type: 'temporal' },
        y: { aggregate: 'average', field: 'Miles_per_Gallon' }
      }
    },
    {
      mark: { type: 'circle' },
      data: { values: cars },
      encoding: {
        x: { field: 'Year', type: 'temporal' },
        y: { aggregate: 'average', field: 'Miles_per_Gallon' }
      }
    }
  ]
})
```

We can also create this chart by *reusing* a previous chart definition! Rather than completely re-write a chart, we can start with the line chart, then copy and overwrite that mark definition with a different mark type:

```js
{
  const line = {
    mark: { type: 'line' },
    data: { values: cars },
    encoding: {
      x: { field: 'Year', type: 'temporal' },
      y: { aggregate: 'average', field: 'Miles_per_Gallon' }
    }
  };

  display(await render({ layer: [line, {...line, mark: { type: 'circle' } }] }));
}
```

```js run=false
const line = {
  mark: { type: 'line' },
  data: { values: cars },
  encoding: {
    x: { field: 'Year', type: 'temporal' },
    y: { aggregate: 'average', field: 'Miles_per_Gallon' }
  }
};

render({ layer: [line, {...line, mark: { type: 'circle' } }] })
```

_(The need to place points on lines is so common, the `line` mark also includes a shorthand to generate a new layer for you. Trying setting `point: true` within the `mark` object!)_

Now, what if we'd like to see this chart alongside other plots, such as the average horsepower over time?

We can use *concatenation* operators to place multiple charts side-by-side, either vertically or horizontally. Here, we'll use the `hconcat` method to perform horizontal concatenation of two charts:

```js
{
  const mpg = {
    mark: 'line',
    data: { values: cars },
    encoding: {
      x: { field: 'Year', type: 'temporal' },
      y: { aggregate: 'average', field: 'Miles_per_Gallon' }
    }
  };

  const hp = {
    mark: 'line',
    data: { values: cars },
    encoding: {
      x: { field: 'Year', type: 'temporal' },
      y: { aggregate: 'average', field: 'Horsepower' }
    }
  };

  display(await render({
    hconcat: [
      { layer: [mpg, { ...mpg, mark: 'circle' }] },
      { layer: [hp, { ...hp, mark: 'circle' }] }
    ]
  }));
}
```

```js run=false
const mpg = {
  mark: 'line',
  data: { values: cars },
  encoding: {
    x: { field: 'Year', type: 'temporal' },
    y: { aggregate: 'average', field: 'Miles_per_Gallon' }
  }
};

const hp = {
  mark: 'line',
  data: { values: cars },
  encoding: {
    x: { field: 'Year', type: 'temporal' },
    y: { aggregate: 'average', field: 'Horsepower' }
  }
};

render({
  hconcat: [
    { layer: [mpg, { ...mpg, mark: 'circle' }] },
    { layer: [hp, { ...hp, mark: 'circle' }] }
  ]
})
```

_We can see that, in this dataset, over the 1970s and early '80s the average fuel efficiency improved while the average horsepower decreased._

A later notebook will focus on *view composition*, including not only layering and concatenation, but also the `facet` operator for splitting data into sub-plots and the `repeat` operator to concisely generate concatenated charts from a template.

<hr/>

## Interactivity

In addition to basic plotting and view composition, one of Vega-Lite's more exciting features is its support for interaction.

Starting with a scatter plot, we can add a basic (yet valuable!) form of interactivity &ndash; tooltips upon mouse hover &ndash; by including a `tooltip` encoding channel:

```js echo
render({
  mark: 'point',
  data: { values: cars },
  encoding: {
    x: { field: 'Horsepower', type: 'quantitative' },
    y: { field: 'Miles_per_Gallon', type: 'quantitative' },
    color: { field: 'Origin' },
    tooltip: [ {field: 'Name'}, {field: 'Origin'} ] // show the Name and Origin fields in a tooltip
  }
})
```

For more complex interactions, such as linked charts and cross-filtering, Vega-Lite provides a *selection* abstraction for defining interactive selections and then binding them to components of a chart. We will cover this is in detail in a later notebook.

Below is a more complex example. The upper histogram shows the count of cars per year and  uses an interactive selection to modify the opacity of points in the lower scatter plot, which shows horsepower versus mileage.

_Drag an interval in the upper chart and see how it affects the points in the lower chart. As you examine the code, **don't worry if parts don't make sense yet!** This is an aspirational example; we will fill in all the needed details over the course of the different notebooks._

```js
{
  // create an interval selection over an x-axis encoding
  const brush = { name: 'brush', select: 'interval', encodings: ['x'] };

  // determine opacity based on brush
  const opacity = {
    condition: { param: 'brush', value: 0.9 }, // if in brush...
    value: 0.1 // else
  };

  // an overview histogram of cars per year
  // add the interval brush to select cars over time
  const overview = {
    mark: 'bar',
    encoding: {
      x: {
        field: 'Year', type: 'ordinal', timeUnit: 'year', // extract year unit, treat as ordinal
        axis: { title: null, labelAngle: 0 }   // no title, no label angle
      },
      y: { aggregate: 'count', title: null },  // counts, no axis title
      opacity  // modulate bar opacity based on the brush selection
    },
    params: [ brush ], // add interval brush selection to the chart
    width: 400,        // use the full default chart width
    height: 50         // set chart height to 50 pixels
  };

  // a detail scatterplot of horsepower vs. mileage
  const detail = {
    mark: 'point',
    encoding: {
      x: { field: 'Horsepower', type: 'quantitative' },
      y: { field: 'Miles_per_Gallon', type: 'quantitative' },
      opacity // modulate point opacity based on the brush selection
    }
  };

  // vertically concatenate (vconcat) charts
  display(await render({
    data: { values: cars },
    vconcat: [ overview, detail ]
  }));
}
```

```js run=false
// create an interval selection over an x-axis encoding
const brush = { name: 'brush', select: 'interval', encodings: ['x'] };

// determine opacity based on brush
const opacity = {
  condition: { param: 'brush', value: 0.9 }, // if in brush...
  value: 0.1 // else
};

// an overview histogram of cars per year
// add the interval brush to select cars over time
const overview = {
  mark: 'bar',
  encoding: {
    x: {
      field: 'Year', type: 'ordinal', timeUnit: 'year', // extract year unit, treat as ordinal
      axis: { title: null, labelAngle: 0 }   // no title, no label angle
    },
    y: { aggregate: 'count', title: null },  // counts, no axis title
    opacity  // modulate bar opacity based on the brush selection
  },
  params: [ brush ], // add interval brush selection to the chart
  width: 400,        // use the full default chart width
  height: 50         // set chart height to 50 pixels
};

// a detail scatterplot of horsepower vs. mileage
const detail = {
  mark: 'point',
  encoding: {
    x: { field: 'Horsepower', type: 'quantitative' },
    y: { field: 'Miles_per_Gallon', type: 'quantitative' },
    opacity // modulate point opacity based on the brush selection
  }
};

// vertically concatenate (vconcat) charts
render({
  data: { values: cars },
  vconcat: [ overview, detail ]
});
```

<hr/>

## Coda: Publishing a Visualization

Once you have visualized your data, perhaps you would like to publish it somewhere else on the web. To save an exported image, you can simply right-click a visualization and select "Save Image As..." from the context menu, assuming the default [canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) rendering option is used.

_Scroll up and try saving one of the images generated above!_

To include a Vega-Lite visualization on your own web page, you can use the [vega-embed JavaScript package](https://github.com/vega/vega-embed). Here is a basic HTML template, where your Vega-Lite JSON specification should be stored in the `spec` JavaScript variable:

```html run=false
<!DOCTYPE html>
<html>
  <head>
    <script src="https://cdn.jsdelivr.net/npm/vega@5"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-lite@5"></script>
    <script src="https://cdn.jsdelivr.net/npm/vega-embed@6"></script>
  </head>
  <body>
    <div id="vis"></div>
    <script type="text/javascript">
    const spec = {};  /* JSON Vega-Lite chart specification */
    const opt = { actions: false };  /* Options for the embedding */
    vegaEmbed("#vis", spec, opt);
    </script>
  </body>
</html>
```

For more information on embedding Vega-Lite, see the [vega-embed documentation](https://github.com/vega/vega-embed).

<hr/>

## Next Steps

🎉 Hooray, you've completed the introduction to Vega-Lite! In the [next notebook](data-types-graphical-marks-encoding-channels), we will dive deeper into creating visualizations using Vega-Lite's model of data types, graphical marks, and visual encoding channels.
