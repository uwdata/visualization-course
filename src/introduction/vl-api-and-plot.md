# Data Types, Graphical Marks, and Visual Encoding Channels

```js
import { vl } from '../components/vega-lite.js';
import { marks } from '../components/marks.js';
import vega_datasets from 'npm:vega-datasets';
```

A visualization represents data using a collection of _graphical marks_ such as bars, lines, and point symbols. The attributes of a mark &mdash; such as its position, shape, size, or color &mdash; serve as _channels_ in which we can encode underlying data values.

```js
marks()
```

With a basic framework of _data types_, _marks_, and _encoding channels_, we can concisely create a wide variety of visualizations. In this lesson, we explore each of these elements and show how to use them to create custom statistical graphics.

## Global Development Data

We will visualize global health and population measures for countries of the world, recorded over the years 1955 to 2005. The data was collected by the [Gapminder Foundation](https://www.gapminder.org/) and shared in [Hans Rosling's popular TED talk](https://www.youtube.com/watch?v=hVimVzgtD6w). (If you haven't seen the talk, we encourage you to watch it!)

Let's first load the dataset from the [vega-datasets](https://github.com/vega/vega-datasets) collection into a JavaScript array.

```js echo
const data = vega_datasets['gapminder.json']()
```

How large is the dataset?

${data.length} rows, ${Object.keys(data[0]).length} columns!

Let's take a peek at the table content:

```js echo
Inputs.table(data, { maxWidth: 600 })
```

For each `country` and `year` (in 5-year intervals), we have measures of fertility in terms of the number of children per woman (`fertility`), life expectancy in years (`life_expect`), and total population (`pop`).

We also see a `cluster` field with an integer code. What might this represent? We'll try and solve this mystery as we visualize the data!

Let's also create a smaller data array, filtered down to values for the year 2000 only:

```js echo
const data2000 = data.filter(d => d.year === 2000)
```

```js echo
Inputs.table(data2000, { maxWidth: 600 })
```

## Data Types

The first ingredient in effective visualization is the input data. Data values can represent different forms of measurement. What kinds of comparisons do those measurements support? And what kinds of visual encodings then support those comparisons?

We will start by looking at the basic data types that Vega-Lite uses to inform visual encoding choices. These data types determine the kinds of comparisons we can make, and thereby guide our visualization design decisions.

### Nominal (N)

*Nominal* data &mdash; also called *categorical* data &mdash; consist of category names.

With nominal data we can compare the equality of values: *is value A the same or different than value B? (A = B)*, supporting statements like “A is equal to B” or “A is not equal to B”.
In the dataset above, the `country` field is nominal.

When visualizing nominal data we should readily perceive if values are the same or different: position, color hue (blue, red, green, *etc.*), and shape are all reasonable options. In contrast, using a size channel to encode nominal data might mislead us, suggesting rank-order or magnitude differences among values that do not exist!

### Ordinal (O)

*Ordinal* data consist of values that have a specific ordering.

With ordinal data we can compare the rank-ordering of values: *does value A come before or after value B? (A < B)*, supporting statements like “A is less than B” or “A is greater than B”.
In the dataset above, we can treat the `year` field as ordinal.

When visualizing ordinal data, we should perceive a sense of rank-order. Position, size, or color value (brightness) might be appropriate, whereas color hue (which is not perceptually ordered) would be less appropriate.

### Quantitative (Q)

With *quantitative* data we can measure numerical differences among values. There are multiple sub-types of quantitative data:

For *interval* data we can measure the distance (interval) between points: *what is the distance to value A from value B? (A - B)*, supporting statements such as “A is 12 units away from B”.

For *ratio* data the zero point is meaningful, so we can also measure proportions or scale factors: *value A is what proportion of value B? (A / B)*, supporting statements such as “A is 10% of B” or “B is 7 times larger than A”.

In the dataset above, `year` is a quantitative interval field (the value of year "zero" is subjective), whereas `fertility` and `life_expect` are quantitative ratio fields (zero is meaningful for calculating proportions).
Vega-Lite represents quantitative data, but does not make a distinction between interval and ratio types.

Quantitative values can be visualized using position, size, or color value, among other channels. An axis with a zero baseline is essential for proportional comparisons of ratio values, but can be safely omitted for interval comparisons.

### Temporal (T)

*Temporal* values measure time points or intervals. This type is a special case of quantitative values (timestamps) with rich semantics and conventions (i.e., the [Gregorian calendar](https://en.wikipedia.org/wiki/Gregorian_calendar)).

Example temporal values include date strings such as `“2019-01-04”` and `“Jan 04 2019”`, as well as standardized date-times such as the [ISO date-time format](https://en.wikipedia.org/wiki/ISO_8601): `“2019-01-04T17:50:35.643Z”`. There are no temporal values in our global development dataset above, as the `year` field is encoded as an integer.

The temporal type in Vega-Lite supports reasoning about time units (year, month, day, hour, etc.), and provides methods for requesting specific time intervals. For more details about temporal data in Vega-Lite, see the [TimeUnit documentation](https://vega.github.io/vega-lite/docs/timeunit.html).

### Summary

These data types are not mutually exclusive, but rather form a hierarchy: ordinal data support nominal (equality) comparisons, while quantitative data support ordinal (rank-order) comparisons.

Moreover, these data types do _not_ provide a fixed categorization. For example, just because a data field is represented using a number doesn't mean we have to treat it as a quantitative type! We might interpret a set of ages (10 years old, 20 years old, _etc._) as nominal (underage or overage), ordinal (grouped by year), or quantitative (calculate average age).

Now let's examine how to visualize these data types using _encoding channels_.

## Encoding Channels

At the heart of Vega-Lite is the use of *encodings* that bind data fields (with a given data type) to available encoding *channels* of a chosen *mark* type. In this notebook we'll examine the following encoding channels:

- `x`: Horizontal (x-axis) position of the mark.
- `y`: Vertical (y-axis) position of the mark.
- `size`: Size of the mark. May correspond to area or length, depending on the mark type.
- `color`: Mark color, specified as a [legal CSS color](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value).
- `opacity`: Mark opacity, ranging from 0 (fully transparent) to 1 (fully opaque).
- `shape`: Plotting symbol shape for `point` marks.
- `tooltip`: Tooltip text to display upon mouse hover over the mark.
- `order`: Mark ordering, determines line/area point order and drawing order.
- `column`: Facet the data into horizontally-aligned subplots.
- `row`: Facet the data into vertically-aligned subplots.

For a complete list of available channels, see the [Vega-Lite encoding documentation](https://vega.github.io/vega-lite/docs/encoding.html).

### X

The `x` encoding channel sets a mark's horizontal position (x-coordinate). In addition, default choices of axis and title are made automatically. In the chart below, the choice of a quantitative data type results in a continuous linear axis scale:

```js echo
vl.markPoint()
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility')
  )
  .render()
```

```js echo
Plot.plot({
  marks: [
    Plot.dot(data2000, { x: 'fertility', stroke: 'steelblue' })
  ]
})
```

### Y

The `y` encoding channel sets a mark's vertical position (y-coordinate). Here we've added the `cluster` field using an ordinal (`O`) data type. The result is a discrete axis that includes a sized band, with a default step size, for each unique value:

```js echo
vl.markPoint()
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldO('cluster')
  )
  .render()
```

_What happens to the chart above if you swap the `O` and `Q` field types?_

```js echo
Plot.plot({
  y: { type: 'point' },
  marks: [
    Plot.dotY(data2000, {
      x: 'fertility',
      y: 'cluster',
      stroke: 'steelblue'
    })
  ]
})
```

_What happens to the chart above if you remove the `'point'` scale type?_

If we instead add the `life_expect` field as a quantitative (`Q`) variable, the result is a scatter plot with linear scales for both axes:

```js echo
vl.markPoint()
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldQ('life_expect')
  )
  .render()
```

```js echo
Plot.plot({
  x: { zero: true },
  y: { zero: true },
  marks: [
    Plot.dotY(data2000, {
      x: 'fertility',
      y: 'life_expect',
      stroke: 'steelblue'
    })
  ]
})
```

By default, axes for linear quantitative scales include zero to ensure a proper baseline for comparing ratio-valued data. In some cases, however, a zero baseline may be meaningless or you may want to focus on interval comparisons. To disable automatic inclusion of zero, configure the encoding `scale` attribute:

```js echo
vl.markPoint()
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility').scale({zero: false}),
    vl.y().fieldQ('life_expect').scale({zero: false})
  )
  .render()
```

```js echo
Plot.plot({
  x: { nice: true },
  y: { nice: true },
  marks: [
    Plot.dotY(data2000, {
      x: 'fertility',
      y: 'life_expect',
      stroke: 'steelblue'
    })
  ]
})
```

Now the axis scales no longer include zero by default. Some padding still remains, as the axis domain end points are automatically snapped to _nice_ numbers like multiples of 5 or 10.

_What happens if you also add `nice: false` to the scale properties above?_

### Size

The `size` encoding channel sets a mark's size or extent. The meaning of the channel can vary based on the mark type. For `point` marks, the `size` channel maps to the pixel area of the plotting symbol, such that the diameter of the point matches the square root of the size value.

Let's augment our scatter plot by encoding population (`pop`) on the `size` channel. As a result, the chart now also includes a legend for interpreting the size values.

```js echo
vl.markPoint()
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldQ('life_expect'),
    vl.size().fieldQ('pop')
  )
  .render()
```

```js echo
Plot.plot({
  x: { nice: true },
  y: { nice: true },
  marks: [
    Plot.dotY(data2000, {
      x: 'fertility',
      y: 'life_expect',
      r: 'pop',
      stroke: 'steelblue'
    })
  ]
})
```

In some cases we might be unsatisfied with the default size range. To provide a customized span of sizes, set the `range` parameter of the `scale` attribute to an array indicating the smallest and largest sizes. Here we update the size encoding to range from 0 pixels (for zero values) to 1,000 pixels (for the maximum value in the scale domain):

```js echo
vl.markPoint()
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldQ('life_expect'),
    vl.size().fieldQ('pop').scale({range: [0, 1000]})
  )
  .render()
```

```js echo
Plot.plot({
  x: { nice: true, zero: true },
  y: { nice: true, zero: true },
  r: { range: [0, 16] }, // 16 ~ sqrt(1000) / 2
  marks: [
    Plot.dotY(data2000, {
      x: 'fertility',
      y: 'life_expect',
      r: 'pop',
      stroke: 'steelblue'
    })
  ]
})
```

### Color and Opacity

The `color` encoding channel sets a mark's color. The style of color encoding is highly dependent on the data type: nominal data will default to a multi-hued qualitative color scheme, whereas ordinal and quantitative data will use perceptually ordered color gradients.

Here, we encode the `cluster` field using the `color` channel and a nominal (`N`) data type, resulting in a distinct hue for each cluster value. Can you start to guess what the `cluster` field might indicate?

```js echo
vl.markPoint()
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldQ('life_expect'),
    vl.size().fieldQ('pop').scale({range: [0, 1000]}),
    vl.color().fieldN('cluster')
  )
  .render()
```

```js echo
Plot.plot({
  x: { nice: true, zero: true },
  y: { nice: true, zero: true },
  r: { range: [0, 16] },
  color: { type: 'categorical', scheme: 'tableau10', legend: true },
  marks: [
    Plot.dotY(data2000, {
      x: 'fertility',
      y: 'life_expect',
      r: 'pop',
      stroke: 'cluster'
    })
  ]
})
```

If you prefer filled shapes, pass `{filled: true}` to the `markPoint` method:

```js echo
vl.markPoint({filled: true})
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldQ('life_expect'),
    vl.size().fieldQ('pop').scale({range: [0, 1000]}),
    vl.color().fieldN('cluster')
  )
  .render()
```

```js echo
Plot.plot({
  x: { nice: true, zero: true },
  y: { nice: true, zero: true },
  r: { range: [0, 16] },
  color: { type: 'categorical', scheme: 'tableau10', legend: true },
  marks: [
    Plot.dotY(data2000, {
      x: 'fertility',
      y: 'life_expect',
      r: 'pop',
      fill: 'cluster',
      fillOpacity: 0.7
    })
  ]
})
```

By default, Vega-Lite uses a bit of transparency to help combat over-plotting. We are free to further adjust the opacity, either by passing a default value to the `mark*` method, or using a dedicated encoding channel.

Here we demonstrate how to provide a constant value to an encoding channel instead of binding a data field:

```js echo
vl.markPoint({filled: true})
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldQ('life_expect'),
    vl.size().fieldQ('pop').scale({range: [0, 1000]}),
    vl.color().fieldN('cluster'),
    vl.opacity().value(0.5)
  )
  .render()
```

### Shape

The `shape` encoding channel sets the geometric shape used by `point` marks. Unlike the other channels we have seen so far, the `shape` channel can not be used by other mark types. The shape encoding channel should only be used with nominal data, as perceptual rank-order and magnitude comparisons are not supported.

Let's encode the `cluster` field using `shape` as well as `color`. Using multiple channels for the same underlying data field is known as a *redundant encoding*. The resulting chart combines both color and shape information into a single symbol legend:

```js echo
vl.markPoint({filled: true})
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldQ('life_expect'),
    vl.size().fieldQ('pop').scale({range: [0, 1000]}),
    vl.color().fieldN('cluster'),
    vl.opacity().value(0.5),
    vl.shape().fieldN('cluster')
  )
  .render()
```

```js echo
Plot.plot({
  x: { nice: true, zero: true },
  y: { nice: true, zero: true },
  r: { range: [0, 16] },
  color: { type: 'categorical', scheme: 'tableau10' },
  symbol: { legend: true },
  marks: [
    Plot.dotY(data2000, {
      x: 'fertility',
      y: 'life_expect',
      r: 'pop',
      fill: 'cluster',
      fillOpacity: 0.7,
      symbol: 'cluster'
    })
  ]
})
```

### Tooltips & Ordering

By this point, you might feel a bit frustrated: we've built up a chart, but we still don't know what countries the visualized points correspond to! Let's add interactive tooltips to enable exploration.

The `tooltip` encoding channel determines tooltip text to show when a user moves the mouse cursor over a mark. Let's add a tooltip encoding for the `country` field, then investigate which countries are being represented.

```js echo
vl.markPoint({filled: true})
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldQ('life_expect'),
    vl.size().fieldQ('pop').scale({range: [0, 1000]}),
    vl.color().fieldN('cluster'),
    vl.opacity().value(0.5),
    vl.tooltip().fieldN('country')
  )
  .render()
```

As you mouse around you may notice that you can not select some of the points. For example, the largest dark blue circle corresponds to India, which is drawn on top of a country with a smaller population, preventing the mouse from hovering over that country. To fix this problem, we can use the `order` encoding channel.

The `order` encoding channel determines the order of data points, affecting both the order in which they are drawn and, for `line` and `area` marks, the order in which they are connected to one another.

Let's order the values in descending rank order by the population (`pop`), ensuring that smaller circles are drawn later than larger circles:

```js echo
vl.markPoint({filled: true})
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldQ('life_expect'),
    vl.size().fieldQ('pop').scale({range: [0, 1000]}),
    vl.color().fieldN('cluster'),
    vl.opacity().value(0.5),
    vl.tooltip().fieldN('country'),
    vl.order().fieldQ('pop').sort('descending')
  )
  .render()
```

```js echo
Plot.plot({
  x: { nice: true, zero: true },
  y: { nice: true, zero: true },
  r: { range: [0, 16] },
  color: { type: 'categorical', scheme: 'tableau10', legend: true },
  marks: [
    Plot.dotY(data2000, {
      x: 'fertility',
      y: 'life_expect',
      r: 'pop',
      fill: 'cluster',
      fillOpacity: 0.7,
      title: 'country',
      tip: true
    })
  ]
})
```

Now we can identify the smaller country being obscured by India: it's Bangladesh!

We can also now figure out what the `cluster` field represents. Mouse over the various colored points to formulate your own explanation.

At this point we've added tooltips that show only a single property of the underlying data record. To show multiple values, we can provide the `tooltip` channel an array of encodings, one for each field we want to include:

```js echo
vl.markPoint({filled: true})
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldQ('life_expect'),
    vl.size().fieldQ('pop').scale({range: [0, 1000]}),
    vl.color().fieldN('cluster'),
    vl.opacity().value(0.5),
    vl.order().fieldQ('pop').sort('descending'),
    vl.tooltip(['country', 'fertility', 'life_expect'])
  )
  .render()
```

```js echo
Plot.plot({
  x: { nice: true, zero: true },
  y: { nice: true, zero: true },
  r: { range: [0, 16] },
  color: { type: 'categorical', scheme: 'tableau10', legend: true },
  marks: [
    Plot.dotY(data2000, {
      x: 'fertility',
      y: 'life_expect',
      r: 'pop',
      fill: 'cluster',
      fillOpacity: 0.7,
      title: d => `Country: ${d.country}\nFertility: ${d.fertility}\nLife Expectancy: ${d.life_expect}`,
      tip: true
    })
  ]
})
```

Now we can see multiple data fields upon mouse over! We used an array of string values to indicate the fields, which serves as a convenient alternative to writing `vl.tooltip().fieldN('name')` for all three field entries.

### Column and Row Facets

Spatial position is one of the most powerful and flexible channels for visual encoding, but what can we do if we already have assigned fields to the `x` and `y` channels? One valuable technique is to create a *trellis plot*, consisting of sub-plots that show a subset of the data. A trellis plot is one example of the more general technique of presenting data using [small multiples](https://en.wikipedia.org/wiki/Small_multiple) of views.

The `column` and `row` encoding channels generate either a horizontal (columns) or vertical (rows) set of sub-plots, in which the data is partitioned according to the provided data field.

Here is a trellis plot that divides the data into one column per `cluster` value:

```js echo
vl.markPoint({filled: true})
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldQ('life_expect'),
    vl.size().fieldQ('pop').scale({range: [0, 1000]}),
    vl.color().fieldN('cluster'),
    vl.opacity().value(0.5),
    vl.tooltip().fieldN('country'),
    vl.order().fieldQ('pop').sort('descending'),
    vl.column().fieldN('cluster')
  )
  .render()
```

The plot above does not fit on screen, making it difficult to compare the sub-plots to each other! We can set the `width` and `height` properties to create a smaller set of multiples. Also, as the column headers already label the `cluster` values, let's remove our `color` legend by setting it to `null`. To make better use of space we can also orient our `size` legend to the `'bottom'` of the chart.

```js echo
vl.markPoint({filled: true})
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldQ('life_expect'),
    vl.size().fieldQ('pop').scale({range: [0, 1000]})
      .legend({orient: 'bottom', titleOrient: 'left'}),
    vl.color().fieldN('cluster')
      .legend(null),
    vl.opacity().value(0.5),
    vl.tooltip().fieldN('country'),
    vl.order().fieldQ('pop').sort('descending'),
    vl.column().fieldN('cluster')
  )
  .width(130)
  .height(130)
  .render()
```

```js echo
Plot.plot({
  x: { nice: true, zero: true, ticks: 5, grid: true },
  y: { nice: true, zero: true, ticks: 5, grid: true },
  r: { range: [0, 16] },
  color: { type: 'categorical', scheme: 'tableau10', legend: true },
  width: 800,
  height: 160,
  marks: [
    Plot.frame(),
    Plot.dotY(data2000, {
      x: 'fertility',
      y: 'life_expect',
      r: 'pop',
      fill: 'cluster',
      fillOpacity: 0.7,
      fx: 'cluster'
    })
  ]
})
```

Underneath the hood, the `column` and `row` encodings are translated into a new specification that uses the `facet` view composition operator. We will re-visit faceting in greater depth later on!

In the meantime, _can you rewrite the chart above to facet into rows instead of columns?_

### A Peek Ahead: Interactive Filtering

In later modules, we'll dive into interaction techniques for data exploration. Here is a sneak peak: binding a range slider to the `year` field to enable interactive scrubbing through each year of data. Don't worry if the code for the cell below is a bit confusing at this point, as we will cover interaction in detail later.

_Drag the slider back and forth to see how the data values change over time!_

```js echo
(function() {
  const selectYear = vl.selectPoint('select').fields('year')
    .init({year: 1955})
    .bind(vl.slider().min(1955).max(2005).step(5));

  return vl.markPoint({filled: true})
    .data({values: data})
    .params(selectYear)
    .transform(vl.filter(selectYear))
    .encode(
      vl.x().fieldQ('fertility').scale({domain: [0, 9]}),
      vl.y().fieldQ('life_expect').scale({domain: [0, 90]}),
      vl.size().fieldQ('pop').scale({domain: [0, 1200000000], range: [0, 1000]}),
      vl.color().fieldN('cluster').legend(null),
      vl.opacity().value(0.5),
      vl.tooltip().fieldN('country'),
      vl.order().fieldQ('pop').sort('descending')
    )
    .render();
})()
```

```js
const year = view(Inputs.range([1955, 2005], { step: 5 }));
```

```js echo
Plot.plot({
  x: { domain: [0, 9], grid: true },
  y: { domain: [0, 90], grid: true },
  r: { range: [0, 16] },
  color: { type: 'categorical', scheme: 'tableau10', legend: true },
  marks: [
    Plot.dotY(data.filter(d => d.year === year), {
      x: 'fertility',
      y: 'life_expect',
      r: 'pop',
      fill: 'cluster',
      fillOpacity: 0.7
    })
  ]
})
```

## Graphical Marks

Our exploration of encoding channels above exclusively uses `point` marks to visualize the data. However, the `point` mark type is only one of the many geometric shapes that can be used to visually represent data. Vega-Lite includes a number of built-in mark types, including:

- `markArea()` - Filled areas defined by a top-line and a baseline.
- `markBar()` -	Rectangular bars.
- `markCircle()`	- Scatter plot points as filled circles.
- `markLine()` - Connected line segments.
- `markPoint()` - Scatter plot points with configurable shapes.
- `markRect()` - Filled rectangles, useful for heatmaps.
- `markRule()` - Vertical or horizontal lines spanning the axis.
- `markSquare()` - Scatter plot points as filled squares.
- `markText()` - Scatter plot points represented by text.
- `markTick()` - Vertical or horizontal tick marks.

For a complete list, see the [Vega-Lite mark documentation](https://vega.github.io/vega-lite/docs/mark.html). Next, we will step through a number of the most commonly used mark types for statistical graphics.

### Point Marks

The `point` mark type conveys specific points, as in *scatter plots* and *dot plots*. In addition to `x` and `y` encoding channels (to specify 2D point positions), point marks can use `color`, `size`, and `shape` encodings to convey additional data fields.

Below is a dot plot of `fertility`, with the `cluster` field redundantly encoded using both the `y` and `shape` channels.

```js echo
vl.markPoint()
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldN('cluster'),
    vl.shape().fieldN('cluster')
  )
  .render()
```

In addition to encoding channels, marks can be stylized by providing values to the `mark*()` methods.

For example: point marks are drawn with stroked outlines by default, but can be specified to use `filled` shapes instead. Similarly, you can set a default `size` to set the total pixel area of the point mark.

```js echo
vl.markPoint({filled: true, size: 100})
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldN('cluster'),
    vl.shape().fieldN('cluster')
  )
  .render()
```

### Circle Marks

The `circle` mark type is a shorthand for `point` marks drawn as filled circles.

```js echo
vl.markCircle({size: 100})
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldN('cluster')
  )
  .render()
```

### Square Marks

The `square` mark type is a shorthand for `point` marks drawn as filled squares.

```js echo
vl.markSquare({size: 100})
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldN('cluster')
  )
  .render()
```

### Tick Marks

The `tick` mark type conveys a data point using a short line segment or "tick". These are particularly useful for comparing values along a single dimension with minimal overlap. A *dot plot* drawn with tick marks is sometimes referred to as a *strip plot*.

```js echo
vl.markTick()
  .data(data2000)
  .encode(
    vl.x().fieldQ('fertility'),
    vl.y().fieldN('cluster')
  )
  .render()
```

### Bar Marks

The `bar` mark type draws a rectangle with a position, width, and height.

The plot below is a simple bar chart of the population (`pop`) of each country.

```js echo
vl.markBar()
  .data(data2000)
  .encode(
    vl.x().fieldN('country'),
    vl.y().fieldQ('pop')
  )
  .render()
```

The bar width is set to a default size. _To change the width, try setting the `step` property of the `markBar` object's `width` attribute, like so:_

`vl.markBar().width({step: 12})`.

Bars can also be stacked. Let's change the `x` encoding to use the `cluster` field, and encode `country` using the `color` channel. We'll also disable the legend (which would be very long with colors for all countries!) and use tooltips for the country name.

```js echo
vl.markBar()
  .data(data2000)
  .encode(
    vl.x().fieldN('cluster'),
    vl.y().fieldQ('pop'),
    vl.color().fieldN('country').legend(null),
    vl.tooltip().fieldN('country')
  )
  .render()
```

The examples above create bar charts from a zero baseline, and the `y` channel only encodes the non-zero value (or height) of the bar. However, the bar mark also allows you to specify starting and ending points to convey ranges.

The chart below uses the `x` (starting point) and `x2` (ending point) channels to show the range of life expectancies within each regional cluster. Below we use the `min` and `max` aggregation functions to determine the end points of the range. We will discuss aggregation in greater detail in the next notebook!

Alternatively, you can use `x` and `width` to provide a starting point plus offset, such that `x2 = x + width`.

```js echo
vl.markBar()
  .data(data2000)
  .encode(
    vl.x().min('life_expect'),
    vl.x2().max('life_expect'),
    vl.y().fieldN('cluster')
  )
  .render()
```

### Line Marks

The `line` mark type connects plotted points with line segments, for example so that a line's slope conveys information about the rate of change.

Let's plot a line chart of fertility per country over the years, using the full, unfiltered global development data frame. We'll again hide the legend and use tooltips instead.

```js echo
vl.markLine()
  .data(data)
  .encode(
    vl.x().fieldO('year'),
    vl.y().fieldQ('fertility'),
    vl.color().fieldN('country').legend(null),
    vl.tooltip().fieldN('country')
  )
  .width(400)
  .render()
```

We can see interesting variations per country, but overall trends for lower numbers of children per family over time. Also note that we set a custom width of 400 pixels. _Try changing (or removing) the widths and see what happens!_

Let's change some of the default mark parameters to customize the plot. We can set the `strokeWidth` to determine the thickness of the lines and the `opacity` to add some transparency. By default, the `line` mark uses straight line segments to connect data points. In some cases we might want to smooth the lines. We can adjust the interpolation used to connect data points by setting the `interpolate` mark parameter. Let's use `'monotone'` interpolation to provide smooth lines that are also guaranteed not to inadvertently generate "false" minimum or maximum values as a result of the interpolation.

```js echo
vl.markLine({strokeWidth: 3, opacity: 0.5, interpolate: 'monotone'})
  .data(data)
  .encode(
    vl.x().fieldO('year'),
    vl.y().fieldQ('fertility'),
    vl.color().fieldN('country').legend(null),
    vl.tooltip().fieldN('country')
  )
  .width(400)
  .render()
```

The `line` mark can also be used to create *slope graphs*, charts that highlight the change in value between two comparison points using line slopes.

Below let's create a slope graph comparing the populations of each country at minimum and maximum years in our full dataset: 1955 and 2005. We'll create a new data array filtered to those years, and use Vega-Lite to create the slope graph.

By default, Vega-Lite places the years close together. To space out the years along the x-axis, we can use the `width` `step` property to indicate the size (in pixels) of discrete steps along the axis. We can also adjust the `scale` `padding` property to change the amount of spacing (as a fraction of the `step` size) along the edges of the axis.

_Try adjusting `padding` and `step` below and see how the chart changes in response._

```js echo
vl.markLine({opacity: 0.5})
  .data(data.filter(d => d.year === 1955 || d.year === 2005))
  .encode(
    vl.x().fieldO('year').scale({ padding: 0.1 }),
    vl.y().fieldQ('pop'),
    vl.color().fieldN('country').legend(null),
    vl.tooltip().fieldN('country')
  )
  .width({step: 100})
  .render()
```

### Area Marks

The `area` mark type combines aspects of `line` and `bar` marks: it visualizes connections (slopes) among data points, but also shows a filled region, with one edge defaulting to a zero-valued baseline.

The chart below is an area chart of population over time for just the United States:

```js echo
const dataUS = data.filter(d => d.country === 'United States')
```

```js echo
vl.markArea()
  .data(dataUS)
  .encode(
    vl.x().fieldO('year'),
    vl.y().fieldQ('fertility')
  )
  .render()
```

Similar to `line` marks, `area` marks support an `interpolate` parameter.

```js echo
vl.markArea({interpolate: 'monotone'})
  .data(dataUS)
  .encode(
    vl.x().fieldO('year'),
    vl.y().fieldQ('fertility')
  )
  .render()
```

Similar to `bar` marks, `area` marks also support stacking. Here we create a new data frame with data for the three North American countries, then plot them using an `area` mark and a `color` encoding channel to stack by country.

```js echo
const dataNA = data.filter(d => {
  return d.country === 'United States'
      || d.country === 'Canada'
      || d.country === 'Mexico';
})
```

```js echo
vl.markArea()
  .data(dataNA)
  .encode(
    vl.x().fieldO('year'),
    vl.y().fieldQ('pop'),
    vl.color().fieldN('country')
  )
  .render()
```

By default, stacking is performed relative to a zero baseline. However, other `stack` options are available:

- `center` - to stack relative to a baseline in the center of the chart, creating a *streamgraph* visualization, and
- `normalize` - to normalize the summed data at each stacking point to 100%, enabling percentage comparisons.

Below we adapt the chart by setting the `y` encoding `stack` property to `center`. _What happens if you instead set it `normalize`?_

```js echo
vl.markArea()
  .data(dataNA)
  .encode(
    vl.x().fieldO('year'),
    vl.y().fieldQ('pop').stack('center'),
    vl.color().fieldN('country')
  )
  .render()
```

To disable stacking altogether, set the `stack` property to `null`. We can also add `opacity` as a default mark property to ensure we see the overlapping areas!

```js echo
vl.markArea({opacity: 0.5})
  .data(dataNA)
  .encode(
    vl.x().fieldO('year'),
    vl.y().fieldQ('pop').stack(null),
    vl.color().fieldN('country')
  )
  .render()
```

The `area` mark type also supports data-driven baselines, with both the upper and lower series determined by data fields. As with `bar` marks, we can use the `x` and `x2` (or `y` and `y2`) channels to provide end points for the area mark.

The chart below visualizes the range of minimum and maximum fertility, per year, for North American countries:

```js echo
vl.markArea()
  .data(dataNA)
  .encode(
    vl.x().fieldO('year'),
    vl.y().min('fertility'),
    vl.y2().max('fertility')
  )
  .width({step: 40})
  .render();
```

We can see a larger range of values in 1995, from just under 4 to just under 7. By 2005, both the overall fertility values and the variability have declined, centered around 2 children per familty.

All the `area` mark examples above use a vertically oriented area. However, Vega-Lite supports horizontal areas as well. Let's transpose the chart above, simply by swapping the `x` and `y` channels.

```js echo
vl.markArea()
  .data(dataNA)
  .encode(
    vl.y().fieldO('year'),
    vl.x().min('fertility'),
    vl.x2().max('fertility')
  )
  .height({step: 40})
  .render()
```

## Summary

We've completed our tour of data types, encoding channels, and graphical marks! You should now be well-equipped to further explore the space of encodings, mark types, and mark parameters. For a comprehensive reference &ndash; including features we've skipped over here! &ndash; see the Vega-Lite [marks](https://vega.github.io/vega-lite/docs/mark.html) and [encoding](https://vega.github.io/vega-lite/docs/encoding.html) documentation.

In the next module, we will look at the use of data transformations to create charts that summarize data or visualize new derived fields. In a later module, we'll examine how to further customize your charts by modifying scales, axes, and legends.

Interested in learning more about visual encoding?

<img
  style="max-width: 650px;"
  title="Bertin's Taxonomy of Visual Encoding Channels"
  src="https://cdn-images-1.medium.com/max/2000/1*jsb78Rr2cDy6zrE7j2IKig.png"
/><br/>
<small>Bertin's taxonomy of visual encodings from _[Sémiologie Graphique](https://books.google.com/books/about/Semiology_of_Graphics.html?id=X5caQwAACAAJ)_, as adapted by [Mike Bostock](https://bost.ocks.org/mike/).</small>

- The systematic study of marks, visual encodings, and backing data types was initiated by [Jacques Bertin](https://en.wikipedia.org/wiki/Jacques_Bertin) in his pioneering 1967 work [_Sémiologie Graphique (The Semiology of Graphics)_](https://books.google.com/books/about/Semiology_of_Graphics.html?id=X5caQwAACAAJ). The image above illustrates position, size, value (brightness), texture, color (hue), orientation, and shape channels, alongside Bertin's recommendations for the data type comparisons they support.
- The framework of data types, marks, and channels also guides _automated_ visualization design tools, starting with [Mackinlay's APT (A Presentation Tool)](https://scholar.google.com/scholar?cluster=10191273548472217907) in 1986 and continuing in more recent systems such as [Voyager](http://idl.cs.washington.edu/papers/voyager/) and [Draco](http://idl.cs.washington.edu/papers/draco/).
- The identification of nominal, ordinal, interval, and ratio types dates at least as far back as S. S. Steven's 1947 article [_On the theory of scales of measurement_](https://scholar.google.com/scholar?cluster=14356809180080326415).
