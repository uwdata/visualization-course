```js
import { render } from '../components/vega-lite.js';
import vega_datasets from 'npm:vega-datasets@1';
```

# Interaction

_“A graphic is not ‘drawn’ once and for all; it is ‘constructed’ and reconstructed until it reveals all the relationships constituted by the interplay of the data. The best graphic operations are those carried out by the decision-maker themself.”_ &mdash; [Jacques Bertin](https://books.google.com/books?id=csqX_xnm4tcC)

Visualization provides a powerful means of making sense of data. A single image, however, typically provides answers to, at best, a handful of questions. Through _interaction_ we can transform static images into tools for exploration: highlighting points of interest, zooming in to reveal finer-grained patterns, and linking across multiple views to reason about multi-dimensional relationships.

At the core of interaction is the notion of a _selection_: a means of indicating to the computer which elements or regions we are interested in. For example, we might hover the mouse over a point, click multiple marks, or draw a bounding box around a region to highlight subsets of the data for further scrutiny.

Alongside visual encodings and data transformations, Vega-Lite provides a _selection_ abstraction for authoring interactions. These selections encompass three aspects:

1. Input event handling to select points or regions of interest, such as mouse hover, click, drag, scroll, and touch events.
2. Generalizing from the input to form a selection rule (or [_predicate_](https://en.wikipedia.org/wiki/Predicate_%28mathematical_logic%29)) that determines whether or not a given data record lies within the selection.
3. Using the selection predicate to dynamically configure a visualization by driving _conditional encodings_, _filter transforms_, or _scale domains_.

This notebook introduces interactive selections and explores how to use them to author a variety of interaction techniques, such as dynamic queries, panning &amp; zooming, details-on-demand, and brushing &amp; linking.

<hr/>

## Datasets

We will visualize a variety of datasets from the vega-datasets collection:

- A dataset of `cars` from the 1970s and early 1980s,
- A dataset of `movies`, previously used in the [Data Transformation](https://observablehq.com/@uwdata/data-transformation) notebook,
- A dataset containing ten years of [S&amp;P 500](https://en.wikipedia.org/wiki/S%26P_500_Index) (`sp500`) stock prices, and
- A dataset of `flights`, including departure time, distance, and arrival delay.

```js echo
const cars = vega_datasets['cars.json'].url // use URL
```

```js echo
const movies = vega_datasets['movies.json']() // load dataset
```

```js echo
const sp500 = vega_datasets['sp500.csv'].url // use URL
```

```js echo
const flights = vega_datasets['flights-5k.json'].url // use URL
```

<hr/>

## Introducing Selections

Let's start with a basic selection: simply clicking a point to highlight it. Using the `cars` dataset, we'll start with a scatter plot of horsepower versus miles per gallon, with a color encoding for the number cylinders in the car engine.

In addition, we'll create a selection instance by creating an interactive parameter with `select: { type: 'point' }`, indicating we want a selection defined over a _point value_. By default, the selection uses a mouse click to determine the selected value. To register a selection with a visualized mark, we must add it to the `params` list. (Why _params_? Selections are one example of a broader class of interactive _parameters_ supported by Vega-Lite.)

Once our selection has been defined, we can use it as a parameter for _conditional encodings_, which apply a different encoding depending on whether a data record lies in or out of the selection. For example, consider the following snippet:

```js run=false
color: {
  condition: { param: 'highlight', field: 'Cylinders', type: 'O' },
  value: 'grey'
}
```

This encoding definition states that data points contained within the `selection` named `'highlight'` should be colored according to the `Cylinder` field. Non-selected data points, meanwhile, should use the color `grey`. An empty selection includes _all_ data points, and so initially all points will be colored.

_Try clicking different points in the chart below. What happens? (Click the background to clear the selection state and return to an "empty" selection.)_

```js echo
render({
  mark: { type: 'circle' },
  data: { url: cars },
  params: [
    { name: 'highlight', select: { type: 'point' } }
  ],
  encoding: {
    x: { field: 'Horsepower', type: 'Q' },
    y: { field: 'Miles_per_Gallon', type: 'Q' },
    color: {
      condition: { param: 'highlight', field: 'Cylinders', type: 'O' },
      value: 'grey'
    },
    opacity: {
      condition: { param: 'highlight', value: 0.8 },
      value: 0.1
    }
  }
})
```

Of course, highlighting individual data points one-at-a-time is not particularly exciting... As we'll see, point value selections provide a useful building block for more powerful interactions. Moreover, there are additional selection types:

- `point` - select one or more discrete values. The first value is selected on mouse click and additional values toggled using shift-click.
- `interval` - select a continuous range of values, initiated by mouse drag.

Let's compare each of these selection types side-by-side. To keep our code tidy we'll first define a function (`plot`) that generates a scatter plot specification just like the one above. We can pass a selection to the `plot` function to apply it to the chart:

```js echo
function plot(selection, title) {
  const name = selection.name;
  return {
    mark: { type: 'circle' },
    data: { url: cars },
    params: [ selection ],
    encoding: {
      x: { field: 'Horsepower', type: 'Q' },
      y: { field: 'Miles_per_Gallon', type: 'Q' },
      color: {
        condition: { param: name, field: 'Cylinders', type: 'O' },
        value: 'grey'
      },
      opacity: {
        condition: { param: name, value: 0.8 },
        value: 0.1
      }
    },
    title,
    width: 300,
    height: 225
  };
}
```

Let's use our `plot` function to create three chart variants, one per selection type.

The first (`point`) chart replicates our earlier example, and supports shift-click interactions to toggle inclusion of multiple points within the selection. The second (`interval`) chart generates a selection region (or _brush_) upon mouse drag. Once created, you can drag the brush around to select different points, or scroll when the cursor is inside the brush to scale (zoom) the brush size.

_Try interacting with each of the charts below!_

```js echo
render({
  hconcat: [
    plot({ name: 'click', select: { type: 'point' } }, 'Point (Click)'),
    plot({ name: 'drag', select: { type: 'interval' } }, 'Interval (Drag)')
  ]
})
```

The examples above use default interactions (click, shift-click, drag), depending on the selection type. We can further customize the interactions by providing input event specifications using [Vega event selector syntax](https://vega.github.io/vega/docs/event-streams/). For example, we can modify our `point` chart to trigger upon `mouseover` events instead of `click` events.

_Hold down the shift key to "paint" with data!_

```js echo
render({
  hconcat: [
    plot({ name: 'click', select: { type: 'point', on: 'mouseover' } }, 'Point (Mouseover)'),
  ]
})
```

Now that we've covered the basics of Vega-Lite selections, let's take a tour through the various interaction techniques they enable!

<hr/>

## Dynamic Queries

_Dynamic queries_ enable rapid, reversible exploration of data to isolate patterns of interest. As defined by [Ahlberg, Williamson, &amp; Shneiderman](https://www.cs.umd.edu/~ben/papers/Ahlberg1992Dynamic.pdf), a dynamic query:

- represents a query graphically,
- provides visible limits on the query range,
- provides a graphical representation of the data and query result,
- gives immediate feedback of the result after every query adjustment,
- and allows novice users to begin working with little training.

A common approach is to manipulate query parameters using standard user interface widgets such as sliders, radio buttons, and drop-down menus. To generate dynamic query widgets, we can apply a `bind` operation to one or more data fields we wish to query.

Let's build an interactive scatter plot that uses a dynamic query to filter the display. Given a scatter plot of movie ratings (from Rotten Tomates and IMDB), we can add a selection over the `Major_Genre` field to enable interactive filtering by film genre.
To start, let's extract the unique (non-null) genres from the `movies` data:

```js
genres
```
```js echo
const genres = Array
  .from(new Set(movies.map(d => d.Major_Genre).filter(d => d != null)))
  .sort(d3.ascending)
```

For later use, let's also define a list of unique `MPAA_Rating` values:

```js
mpaa
```
```js echo
const mpaa = ['G', 'PG', 'PG-13', 'R', 'NC-17', 'Not Rated']
```

Now let's create a `point` selection bound to a drop-down menu.

*Use the dynamic query menu below to explore the data. How do ratings vary by genre? How would you revise the code to filter `MPAA_Rating` (G, PG, PG-13, etc.) instead of `Major_Genre`?*

```js echo
render({
  mark: { type: 'circle' },
  data: { values: movies },
  params: [
    {
      name: 'Select', // name the selection 'Select'
      select: { type: 'point', fields: ['Major_Genre'] }, // limit selection to the Major_Genre field
      value: { Major_Genre: genres[0] }, // use first genre entry as initial value
      bind: {
        input: 'select', options: genres, // bind to a menu of unique genre values
        name: 'Major Genre' // set the menu label text
      }
    }
  ],
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q' },
    y: { field: 'IMDB_Rating', type: 'Q' },
    tooltip: { field: 'Title', type: 'N' },
    opacity: {
      condition: { param: 'Select', value: 0.75 },
      value: 0.05
    }
  }
})
```

Our construction above leverages multiple aspects of selections:

- We constrain the selection to a specific data field (`Major_Genre`). Earlier when we used a `point` selection, the selection mapped to individual data points. By limiting the selection to a specific field, we can select _all_ data points whose `Major_Genre` field value matches the single selected value.
- We initialize `value` the selection to a starting value.
- We `bind` the selection to an interface widget, in this case a drop-down `select` menu. The `input` property (here `select`) indicates an underlying [HTML `input` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input) type.
- As before, we then use a conditional encoding to control the opacity channel.
<br/><br/>

### Binding Selections to Multiple Inputs

One selection instance can be bound to _multiple_ dynamic query widgets. Let's modify the example above to provide filters for _both_ `Major_Genre` and `MPAA_Rating`, using radio buttons instead of a menu. Our `point` selection is now defined over a _pair_ of genre and MPAA rating values

_Look for surprising conjunctions of genre and rating. Are there G or PG-rated horror films?_

```js echo
render({
  mark: { type: 'circle' },
  data: { values: movies },
  params: [
    {
      name: 'Select',
      // point-value selection over [Major_Genre, MPAA_Rating] pairs
      select: { type: 'point', fields: ['Major_Genre', 'MPAA_Rating'] },
      // use specific hard-wired values as the initial selected values
      value: { Major_Genre: 'Drama', MPAA_Rating: 'R' },
      bind: {
        Major_Genre: { input: 'select', options: genres, name: 'Major Genre' },
        MPAA_Rating: { input: 'radio', options: mpaa, name: 'MPAA Rating' }
      }
    }
  ],
  // scatter plot, modify opacity based on selection
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q' },
    y: { field: 'IMDB_Rating', type: 'Q' },
    tooltip: { field: 'Title', type: 'N' },
    opacity: {
      condition: { param: 'Select', value: 0.75 },
      value: 0.05
    }
  }
})
```

_Fun facts: The PG-13 rating didn't exist when the movies [Jaws](https://www.imdb.com/title/tt0073195/) and [Jaws 2](https://www.imdb.com/title/tt0077766/) were released. The first film to receive a PG-13 rating was 1984's [Red Dawn](https://www.imdb.com/title/tt0087985/)._<br/><br/>

### Using Visualizations as Dynamic Queries

Though standard interface widgets show the _possible_ query parameter values, they do not visualize the _distribution_ of those values. We might also wish to use richer interactions, such as multi-value or interval selections, rather than input widgets that select only a single value at a time.

To address these issues, we can author additional charts to both visualize data and support dynamic queries. Let's add a histogram of the count of films per year and use an interval selection to dynamically highlight films over selected time periods.

*Interact with the year histogram to explore films from different time periods. Do you see any evidence of [sampling bias](https://en.wikipedia.org/wiki/Sampling_bias) across the years? (How do year and critics' ratings relate?)*

_The years range from 1930 to 2040! Are future films in pre-production, or are there "off-by-one century" errors? Also, depending on which time zone you're in, you may see a small bump in either 1969 or 1970. Why might that be? (See the end of the notebook for an explanation!)_

```js echo
render({
  vconcat: [
    {
      // dynamic query histogram
      mark: { type: 'bar', width: 4 },
      data: { values: movies },
      params: [
        // interval selection, limited to x-axis (year) values
        { name: 'brush', select: { type: 'interval', encodings: ['x'] } }
      ],
      encoding: {
        x: { timeUnit: 'year', field: 'Release_Date', title: 'Films by Release Year' },
        y: { aggregate: 'count', title: null }
      },
      width: 600,
      height: 50
    },
    {
      mark: { type: 'circle' },
      data: { values: movies },
      encoding: {
        x: { field: 'Rotten_Tomatoes_Rating', type: 'Q' },
        y: { field: 'IMDB_Rating', type: 'Q' },
        tooltip: { field: 'Title', type: 'N' },
        opacity: {
          condition: { param: 'brush', value: 0.75 },
          value: 0.05
        }
      },
      width: 600,
      height: 400
    }
  ],
  spacing: 5
})
```

The example above provides dynamic queries using a _linked selection_ between charts:

- We add an `interval` selection (named `brush`) under `params` in our histogram of films.
- We use `encodings: ['x']` to limit the selection to the x-axis only, resulting in a one-dimensional selection interval.
- We use `brush` in a conditional encoding to adjust the scatter plot `opacity`.

This interaction technique of selecting elements in one chart and seeing linked highlights in one or more other charts is known as [_brushing &amp; linking_](https://en.wikipedia.org/wiki/Brushing_and_linking).

<hr/>

## Navigation: Panning & Zooming

The movie rating scatter plot is a bit cluttered in places, making it hard to examine points in denser regions. Using the interaction techniques of _panning_ and _zooming_, we can inspect dense regions more closely.

Let's start by thinking about how we might express panning and zooming using Vega-Lite selections. What defines the "viewport" of a chart? _Axis scale domains!_

We can change the scale domains to modify the visualized range of data values. To do so interactively, we can bind an `interval` selection to scale domains using `bind: 'scales'`. The result is that instead of an interval brush that we can drag and zoom, we instead can drag and zoom the entire plotting area!

_In the chart below, click and drag to pan (translate) the view, or scroll to zoom (scale) the view. What can you discover about the precision of the provided rating values?_

```js echo
render({
  mark: { type: 'circle' },
  data: { values: movies },
  params: [
    // bind interval selection to scale domains
    { name: 'sel', select: { type: 'interval' }, bind: 'scales' }
  ],
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q' },
    y: {
      field: 'IMDB_Rating', type: 'Q',
      axis: { minExtent: 30 } // add min extent to stabilize axis title placement
    },
    tooltip: [
      { field: 'Title', type: 'N' },
      { field: 'Release_Date', type: 'T' },
      { field: 'IMDB_Rating', type: 'Q' },
      { field: 'Rotten_Tomatoes_Rating', type: 'Q' }
    ]
  },
  width: 600,
  height: 450
})
```

_Zooming in, we can see that the rating values have limited precision! The Rotten Tomatoes ratings are integers, while the IMDB ratings are truncated to tenths. As a result, there is overplotting even when we zoom in, with multiple movies sharing the same rating values._

Reading the code above, you may notice `axis: { minExtent: 30 }` in the `y` encoding channel. The `minExtent` parameter ensures a minimum amount of space is reserved for axis ticks and labels. Why do this? When we pan and zoom, the axis labels may change and cause the axis title position to shift. By setting a minimum extent we can reduce distracting movements in the plot. _Try removing the `minExtent` value, and then zoom out to see what happens when longer axis labels enter the view._

By default, scale bindings for selections include both the `x` and `y` encoding channels. What if we want to limit panning and zooming along a single dimension? We can invoke `encodings: ['x']` to constrain the selection to the `x` channel only:

```js echo
render({
  mark: { type: 'circle' },
  data: { values: movies },
  params: [
    // limit interval selection to x-axis scale only
    { name: 'sel', select: { type: 'interval', encodings: ['x'] }, bind: 'scales' }
  ],
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q' },
    y: {
      field: 'IMDB_Rating', type: 'Q',
      axis: { minExtent: 30 } // add min extent to stabilize axis title placement
    },
    tooltip: [
      { field: 'Title', type: 'N' },
      { field: 'Release_Date', type: 'T' },
      { field: 'IMDB_Rating', type: 'Q' },
      { field: 'Rotten_Tomatoes_Rating', type: 'Q' }
    ]
  },
  width: 600,
  height: 450
})
```

_When zooming along a single axis only, the shape of the visualized data can change, potentially affecting our perception of relationships in the data. [Choosing an appropriate aspect ratio](http://vis.stanford.edu/papers/arclength-banking) is an important visualization design concern!_

<hr/>

## Navigation: Overview + Detail

When panning and zooming, we directly adjust the "viewport" of a chart. The related navigation strategy of _overview + detail_ instead uses an overview display to show _all_ of the data, while supporting selections that pan and zoom a separate focus display.

Below we have two area charts showing a decade of price fluctuations for the S&amp;P 500 stock index. Initially both charts show the same data range. _Click and drag in the bottom overview chart to update the focus display and examine specific time spans._

```js echo
render({
  data: { url: sp500 },
  vconcat: [
    {
      mark: { type: 'area' },
      encoding: {
        x: {
          field: 'date', type: 'T', title: null,
          scale: { domain: { param: 'brush' } }
        },
        y: { field: 'price', type: 'Q' }
      },
      width: 700
    },
    {
      mark: { type: 'area' },
      params: [
        { name: 'brush', select: { type: 'interval', encodings: ['x'] } }
      ],
      encoding: {
        x: { field: 'date', type: 'T', title: null },
        y: { field: 'price', type: 'Q' }
      },
      width: 700,
      height: 60
    }
  ]
})
```

Unlike our earlier panning &amp; zooming case, here we don't want to bind a selection directly to the scales of a single interactive chart. Instead, we want to bind the selection to a scale domain in _another_ chart. To do so, we update the `x` encoding channel for our focus chart, setting the scale `domain` property to be our `brush` selection. If no interval is defined (the selection is empty), Vega-Lite ignores the brush and uses the underlying data to determine the domain. When a brush interval is created, Vega-Lite instead uses that as the scale `domain` for the focus chart.

<hr/>

## Details on Demand

Once we spot points of interest within a visualization, we often want to know more about them. _Details-on-demand_ refers to interactively querying for more information about selected values. _Tooltips_ are one useful means of providing details on demand. However, tooltips typically only show information for one data point at a time. How might we show more?

The movie ratings scatterplot includes a number of potentially interesting outliers where the Rotten Tomatoes and IMDB ratings disagree. Let's create a plot that allows us to interactively select points and show their labels.

_Mouse over points in the scatter plot below to see a highlight and title label. Shift-click points to make annotations persistent and view multiple labels at once. Which movies are loved by Rotten Tomatoes critics, but not the general audience on IMDB (or vice versa)? See if you can find possible errors, where two different movies with the same name were accidentally combined!_

```js
{
  // scatter plot encodings shared by all marks
  const xy = {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q' },
    y: { field: 'IMDB_Rating', type: 'Q' }
  };

  const hover = {
    name: 'hover',
    select: {
      type: 'point',
      on: 'mouseover', // select on mouseover
      nearest: true,   // select nearest point to mouse cursor
      toggle: false    // do not toggle on shift-hover
    }
  };

  const click = { name: 'click', select: { type: 'point' } };

  // logical 'or' to select points in either selection
  // empty selections should match nothing
  const filter = {
    filter: {
      or: [
        { param: 'click', empty: false },
        { param: 'hover', empty: false }
      ]
    }
  };

  display(await render({
    // layer scatter plot points, halo annotations, and title labels
    layer: [
      {
        mark: { type: 'circle' },
        params: [ hover, click ],
        encoding: xy
      },
      {
        mark: { type: 'point', size: 100, stroke: 'firebrick', strokeWidth: 1 },
        transform: [filter],
        encoding: xy
      },
      {
        mark: { type: 'text', dx: 4, dy: -8, align: 'right', stroke: 'white', strokeWidth: 2 },
        transform: [filter],
        encoding: { ...xy, text: { field: 'Title', type: 'N' } }
      },
      {
        mark: { type: 'text', dx: 4, dy: -8, align: 'right' },
        transform: [filter],
        encoding: { ...xy, text: { field: 'Title', type: 'N' } }
      }
    ],
    data: { values: movies },
    width: 600,
    height: 450
  }));
}
```
```js run=false
// scatter plot encodings shared by all marks
const xy = {
  x: { field: 'Rotten_Tomatoes_Rating', type: 'Q' },
  y: { field: 'IMDB_Rating', type: 'Q' }
};

const hover = {
  name: 'hover',
  select: {
    type: 'point',
    on: 'mouseover', // select on mouseover
    nearest: true,   // select nearest point to mouse cursor
    toggle: false    // do not toggle on shift-hover
  }
};

const click = { name: 'click', select: { type: 'point' } };

// logical 'or' to select points in either selection
// empty selections should match nothing
const filter = {
  filter: {
    or: [
      { param: 'click', empty: false },
      { param: 'hover', empty: false }
    ]
  }
};

render({
  // layer scatter plot points, halo annotations, and title labels
  layer: [
    {
      mark: { type: 'circle' },
      params: [ hover, click ],
      encoding: xy
    },
    {
      mark: { type: 'point', size: 100, stroke: 'firebrick', strokeWidth: 1 },
      transform: [filter],
      encoding: xy
    },
    {
      mark: { type: 'text', dx: 4, dy: -8, align: 'right', stroke: 'white', strokeWidth: 2 },
      transform: [filter],
      encoding: { ...xy, text: { field: 'Title', type: 'N' } }
    },
    {
      mark: { type: 'text', dx: 4, dy: -8, align: 'right' },
      transform: [filter],
      encoding: { ...xy, text: { field: 'Title', type: 'N' } }
    }
  ],
  data: { values: movies },
  width: 600,
  height: 450
})
```

The example above adds three new layers to the scatter plot: a circular annotation, white text to provide a legible background, and black text showing a film title. In addition, this example uses two selections in tandem:

1. A point selection (`hover`) that includes `nearest: true` to automatically select the nearest data point as the mouse moves. We set `toggle: false` to prevent shift-hover from toggling the selection status.
2. A point selection (`click`) to create persistent selections via shift-click.

We then combine these selections into a single `or` filter predicate to include points that reside in _either_ selection. In constructing this predicate, we also specify `empty: false` to indicate that no points should be included if a selection is empty. We use this predicate to filter the new layers to show annotations and labels for selected points only.

Using selections and layers, we can realize a number of different designs for details on demand! For example, here is a log-scaled time series of technology stock prices, annotated with a guideline and labels for the date nearest the mouse cursor:

```js
import { timeSeries } from '../components/annotated-time-series.js';
```

```js
timeSeries().render()
```

To see the code for this line chart example, visit the [Annotated Time Series](./examples/annotated-time-series) example.

_Putting into action what we've learned so far: can you modify the movie scatter plot above (the one with the dynamic query over years) to include a `rule` mark that shows the average IMDB (or Rotten Tomatoes) rating for the data contained within the year `interval` selection?_

<hr/>

## Brushing &amp; Linking, Revisited

Earlier in this notebook we saw an example of _brushing &amp; linking_: using a dynamic query histogram to highlight points in a movie rating scatter plot. Here, we'll visit some additional examples involving linked selections.

Returning to the `cars` dataset, we can use the `repeat` operator to build a [scatter plot matrix (SPLOM)](https://en.wikipedia.org/wiki/Scatter_plot#Scatterplot_matrices) that shows associations between mileage, acceleration, and horsepower. We can define an `interval` selection and include it _within_ our repeated scatter plot specification to enable linked selections among all the plots.

Moreover, we can combine our brushing selection with a `point` selection that is bound to our legend, allowing us to select or de-select points corresponding to specific legend entries. We can combine these two selections into a single selection predicate using the code `vl.and(brush, legend)`.

_Click and drag in any of the plots below to perform brushing &amp; linking. Shift-click legend entries to isolate specific cylinder groups._

```js
{
  const brush = {
    name: 'brush',
    // resolve all selections to a single global instance
    select: { type: 'interval', resolve: 'global' }
  };

  const legend = {
    name: 'legend',
    select: { type: 'point', fields: ['Cylinders'] },
    bind: 'legend' // bind to interactions with the color legend
  };

  const brushAndLegend = { and: [ { param: 'brush' }, { param: 'legend' } ] };

  display(await render({
    repeat: {
      column: ['Acceleration', 'Horsepower', 'Miles_per_Gallon'],
      row: ['Miles_per_Gallon', 'Horsepower', 'Acceleration']
    },
    spec: {
      mark: { type: 'circle' },
      data: { url: cars },
      params: [ brush, legend ],
      encoding: {
        x: { field: { repeat: 'column' }, type: 'Q' },
        y: { field: { repeat: 'row' }, type: 'Q' },
        color: {
          condition: { test: brushAndLegend, field: 'Cylinders', type: 'O' },
          value: 'grey'
        },
        opacity: {
          condition: { test: brushAndLegend, value: 0.8 },
          value: 0.1
        }
      },
      width: 140,
      height: 140
    }
  }));
}
```
```js run=false
const brush = {
  name: 'brush',
  // resolve all selections to a single global instance
  select: { type: 'interval', resolve: 'global' }
};

const legend = {
  name: 'legend',
  select: { type: 'point', fields: ['Cylinders'] },
  bind: 'legend' // bind to interactions with the color legend
};

const brushAndLegend = { and: [ { param: 'brush' }, { param: 'legend' } ] };

return render({
  repeat: {
    column: ['Acceleration', 'Horsepower', 'Miles_per_Gallon'],
    row: ['Miles_per_Gallon', 'Horsepower', 'Acceleration']
  },
  spec: {
    mark: { type: 'circle' },
    data: { url: cars },
    params: [ brush, legend ],
    encoding: {
      x: { field: { repeat: 'column' }, type: 'Q' },
      y: { field: { repeat: 'row' }, type: 'Q' },
      color: {
        condition: { test: brushAndLegend, field: 'Cylinders', type: 'O' },
        value: 'grey'
      },
      opacity: {
        condition: { test: brushAndLegend, value: 0.8 },
        value: 0.1
      }
    },
    width: 140,
    height: 140
  }
})
```

Note above the use of the `resolve` property on the `interval` selection. The default setting of `'global'` indicates that across all plots only one brush can be active at a time. However, in some cases we might want to define brushes in multiple plots and combine the results. If we use `resolve: 'union'`, the selection will be the _union_ of all brushes: if a point resides within any brush it will be selected. Alternatively, if we use `resolve: 'intersect'`, the selection will consist of the _intersection_ of all brushes: only points that reside within all brushes will be selected.

_Try changing the `resolve` parameter to `'union'` and `'intersect'` and see how it changes the resulting selection logic._

<br/>

### Cross-Filtering

The brushing &amp; linking examples we've looked at all use conditional encodings, for example to change opacity values in response to a selection. Another option is to use a selection defined in one view to _filter_ the content of another view.

Let's build a collection of histograms for the `flights` dataset: arrival `delay` (how early or late a flight arrives, in minutes), `distance` flown (in miles), and `time` of departure (hour of the day). We'll use the `repeat` operator to create the histograms, and add an `interval` selection for the `x` axis with brushes resolved via intersection.

In particular, each histogram will consist of two layers: a gray background layer and a blue foreground layer, with the foreground layer filtered by our intersection of brush selections. The result is a _cross-filtering_ interaction across the three charts!

_Drag out brush intervals in the charts below. As you select flights with longer or shorter arrival delays, how do the distance and time distributions respond?_

```js
{
  const brush = {
    name: 'brush',
    select: { type: 'interval', encodings: ['x'], resolve: 'intersect' }
  };

  // x/y encodings shared across layers
  const xy = {
    x: {
      field: { repeat: 'row' }, type: 'Q',
      bin: { maxbins: 100, minstep: 1 }, // up to 100 bins, but no smaller than 1 unit
      axis: {format: 'd', titleAnchor: 'start'} // integer format, left-aligned title
    },
    y: {
      aggregate: 'count',
      title: null // no y-axis title
    }
  };

  display(await render({
    data: { url: flights },
    transform: [
      { calculate: 'datum.delay < 180 ? datum.delay : 180', as: 'delay' }, // clamp delays > 3 hours
      { calculate: 'hours(datum.date) + minutes(datum.date) / 60', as: 'time' } // fractional hours
    ],
    repeat: { row: [ 'delay', 'distance', 'time' ] },
    spec: {
      layer: [
        {
          mark: { type: 'bar' },
          params: [ brush ],
          encoding: { ...xy, color: { value: 'lightgrey' } }
        },
        {
          mark: { type: 'bar' },
          transform: [
            { filter: { param: 'brush' } }
          ],
          encoding: xy
        }
      ],
      width: 900,
      height: 100
    },
    config: { view: { stroke: null } } // no chart outlines
  }))
}
```
```js
const brush = {
  name: 'brush',
  select: { type: 'interval', encodings: ['x'], resolve: 'intersect' }
};

// x/y encodings shared across layers
const xy = {
  x: {
    field: { repeat: 'row' }, type: 'Q',
    bin: { maxbins: 100, minstep: 1 }, // up to 100 bins, but no smaller than 1 unit
    axis: {format: 'd', titleAnchor: 'start'} // integer format, left-aligned title
  },
  y: {
    aggregate: 'count',
    title: null // no y-axis title
  }
};

render({
  data: { url: flights },
  transform: [
    { calculate: 'datum.delay < 180 ? datum.delay : 180', as: 'delay' }, // clamp delays > 3 hours
    { calculate: 'hours(datum.date) + minutes(datum.date) / 60', as: 'time' } // fractional hours
  ],
  repeat: { row: [ 'delay', 'distance', 'time' ] },
  spec: {
    layer: [
      {
        mark: { type: 'bar' },
        params: [ brush ],
        encoding: { ...xy, color: { value: 'lightgrey' } }
      },
      {
        mark: { type: 'bar' },
        transform: [
          { filter: { param: 'brush' } }
        ],
        encoding: xy
      }
    ],
    width: 900,
    height: 100
  },
  config: { view: { stroke: null } } // no chart outlines
})
```

_By cross-filtering you can observe that delayed flights are more likely to depart at later hours. This phenomenon is familiar to frequent fliers: a delay can propagate through the day, affecting subsequent travel by that plane. For the best odds of an on-time arrival, book an early flight!_

The combination of multiple views and interactive selections can enable valuable forms of multi-dimensional reasoning, turning even basic histograms into powerful input devices for asking questions of a dataset!

<hr/>

## Summary

For more information about the supported interaction options in Vega-Lite, please consult the [Vega-Lite interactive selection documentation](https://vega.github.io/vega-lite/docs/selection.html). For example, you might want to use [customized event handlers](https://observablehq.com/@vega/vega-lite-composing-selections) to compose multiple interaction techniques or support touch-based input on mobile devices.

Interested in learning more?
- The _selection_ abstraction was introduced in the paper [Vega-Lite: A Grammar of Interactive Graphics](http://idl.cs.washington.edu/papers/vega-lite/), by Satyanarayan, Moritz, Wongsuphasawat, &amp; Heer.
- The PRIM-9 system (for projection, rotation, isolation, and masking in up to 9 dimensions) is one of the earliest interactive visualization tools, built in the early 1970s by Fisherkeller, Tukey, &amp; Friedman. [A retro demo video survives!](https://www.youtube.com/watch?v=B7XoW2qiFUA)
- The concept of brushing &amp; linking was crystallized by Becker, Cleveland, &amp; Wilks in their 1987 article [Dynamic Graphics for Data Analysis](https://scholar.google.com/scholar?cluster=14817303117298653693).
- For a comprehensive summary of interaction techniques for visualization, see [Interactive Dynamics for Visual Analysis](https://queue.acm.org/detail.cfm?id=2146416) by Heer &amp; Shneiderman.
- Finally, for a treatise on what makes interaction effective, read the classic [Direct Manipulation Interfaces](https://scholar.google.com/scholar?cluster=15702972136892195211) paper by Hutchins, Hollan, &amp; Norman.

<hr/>

#### Appendix: On The Representation of Time

Earlier we observed a small bump in the number of movies in either 1969 and 1970. Where does that bump come from? And why 1969 _or_ 1970? The answer stems from a combination of missing data and how your computer represents time.

Internally, dates and times are represented relative to the [UNIX epoch](https://en.wikipedia.org/wiki/Unix_time), in which time "zero" corresponds to the stroke of midnight on January 1, 1970 in [UTC time](https://en.wikipedia.org/wiki/Coordinated_Universal_Time), which runs along the [prime meridian](https://en.wikipedia.org/wiki/Prime_meridian). It turns out there are a few movies with missing (`null`) release dates. Those `null` values get interpreted as time `0`, and thus map to January 1, 1970 in UTC time. If you live in the Americas &ndash; and thus in "earlier" time zones &ndash; this precise point in time corresponds to an earlier hour on December 31, 1969 in your local time zone. On the other hand, if you live near or east of the prime meridian, the date in your local time zone will be January 1, 1970.

The takeaway? Always be skeptical of your data, and be mindful that how data is represented (whether as date times, or floating point numbers, or latitudes and longitudes, _etc._) can sometimes lead to artifacts that impact analysis!
