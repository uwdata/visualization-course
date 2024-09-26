```js
import { render } from '../components/vega-lite.js';
import vega_datasets from 'npm:vega-datasets@1';
```

# Data Transformation

In previous notebooks we learned how to use marks and visual encodings to represent individual data records. Here we will explore methods for *transforming* data, including the use of aggregates to summarize multiple records. Data transformation is an integral part of visualization: choosing the  variables to show and their level of detail is just as important as choosing appropriate visual encodings. After all, it doesn't matter how well chosen your visual encodings are if you are showing the wrong information!

As you work through this notebook, you might keep the [Vega-Lite Transformation documentation](https://vega.github.io/vega-lite/docs/transform.html) open in another tab. It can be a useful resource if at any point you'd like more details or want to see what other transformations are available.

<hr/>

## The Movies Dataset

We will be working with a table of data about motion pictures, taken from the [vega-datasets](https://vega.github.io/vega-datasets/) collection. The data includes variables such as the film name, director, genre, release date, ratings, and gross revenues. However, _be careful when working with this data_: the films are from unevenly sampled years, using data combined from multiple sources. If you dig in you will find issues with missing values and even some subtle errors! Nevertheless, the data should prove interesting to explore...

Let's retrieve the JSON data file, and load it into an array of objects so that we can inspect the contents:

```js echo
const movies = vega_datasets['movies.json']()
```

How many rows (records) and columns (fields) are in the movies dataset?

${movies.length} rows, ${Object.keys(movies[0]).length} columns!

Now let's peek at the rows to get a sense of the fields and data types...

```js echo
Inputs.table(movies)
```

<hr/>

## Histograms

We'll start our transformation tour by _binning_ data into discrete groups and _counting_ records to summarize those groups. The resulting plots are known as [_histograms_](https://en.wikipedia.org/wiki/Histogram).

Let's first look at unaggregated data: a scatter plot showing movie ratings from Rotten Tomatoes versus ratings from IMDB users. We'll provide data to Vega-Lite by binding the movies data to a `circle` mark. We can then encode the Rotten Tomatoes and IMDB ratings fields using the `x` and `y` channels:

```js echo
render({
  mark: { type: 'circle' },
  data: { values: movies },
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q' },
    y: { field: 'IMDB_Rating', type: 'Q' }
  }
})
```

To summarize this data, we can _bin_ a data field to group numeric values into discrete groups. Here we bin along the x-axis by adding `bin: true` to the `x` encoding channel. The result is a set of ten bins of equal step size, each corresponding to a span of ten ratings points.

```js echo
render({
  mark: { type: 'circle' },
  data: { values: movies },
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q', bin: true },
    y: { field: 'IMDB_Rating', type: 'Q' }
  }
})
```

Setting `bin: true` uses default binning settings, but we can exercise more control if desired. Let's instead set the maximum bin count (`maxbins`) to 20, which has the effect of doubling the number of bins. Now each bin corresponds to a span of five ratings points.

```js echo
render({
  mark: { type: 'circle' },
  data: { values: movies },
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q', bin: { maxbins: 20 } },
    y: { field: 'IMDB_Rating', type: 'Q' }
  }
})
```

With the data binned, let's now summarize the distribution of Rotten Tomatoes ratings. We will drop the IMDB ratings for now and instead use the `y` encoding channel to show an aggregate `count` of records, so that the vertical position of each point indicates the number of movies per Rotten Tomatoes rating bin.

As the `count` aggregate counts the number of total records in each bin regardless of the field values, we do not need to include a field name in the `y` encoding.

```js echo
render({
  mark: { type: 'circle' },
  data: { values: movies },
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q', bin: { maxbins: 20 } },
    y: { aggregate: 'count' }
  }
})
```

To arrive at a standard histogram, let's change the mark type from `circle` to `bar`:

```js echo
render({
  mark: { type: 'bar' },
  data: { values: movies },
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q', bin: { maxbins: 20 } },
    y: { aggregate: 'count' }
  }
})
```

_We can now examine the distribution of ratings more clearly: we can see fewer movies on the negative end, and a bit more movies on the high end, but a generally uniform distribution overall. Rotten Tomatoes ratings are determined by taking "thumbs up" and "thumbs down" judgments from film critics and calculating the percentage of positive reviews. It appears this approach does a good job of utilizing the full range of rating values._

We can similarly create a histogram for IMDB ratings by changing the field in the `x` encoding channel:

```js echo
render({
  mark: { type: 'bar' },
  data: { values: movies },
  encoding: {
    x: { field: 'IMDB_Rating', type: 'Q', bin: { maxbins: 20 } },
    y: { aggregate: 'count' }
  }
})
```

_In contrast to the more uniform distribution we saw before, IMDB ratings exhibit a bell-shaped (though [negatively skewed](https://en.wikipedia.org/wiki/Skewness)) distribution. IMDB ratings are formed by averaging scores (ranging from 1 to 10) provided by the site's users. We can see that this form of measurement leads to a different shape than the Rotten Tomatoes ratings. We can also see that the mode of the distribution is between 6.5 and 7: people generally enjoy watching movies, potentially explaining the positive bias!_

Now let's turn back to our scatter plot of Rotten Tomatoes and IMDB ratings. Here's what happens if we bin *both* axes of our original plot:

```js echo
render({
  mark: { type: 'circle' },
  data: { values: movies },
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q', bin: { maxbins: 20 } },
    y: { field: 'IMDB_Rating', type: 'Q', bin: { maxbins: 20 } }
  }
})
```

Detail is lost due to *overplotting*: many points are drawn directly on top of each other.

To form a two-dimensional histogram we can add a `count` aggregate as before. As both the `x` and `y` encoding channels are already taken, we must use a different encoding channel to convey the counts. Here is the result of using circular area by adding a `size` encoding channel:

```js echo
render({
  mark: { type: 'circle' },
  data: { values: movies },
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q', bin: { maxbins: 20 } },
    y: { field: 'IMDB_Rating', type: 'Q', bin: { maxbins: 20 } },
    size: { aggregate: 'count' }
  }
})
```

Alternatively, we can encode counts using the `color` channel and change the mark type to `bar`. The result is a two-dimensional histogram in the form of a [*heatmap*](https://en.wikipedia.org/wiki/Heat_map).

```js echo
render({
  mark: { type: 'bar' },
  data: { values: movies },
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q', bin: { maxbins: 20 } },
    y: { field: 'IMDB_Rating', type: 'Q', bin: { maxbins: 20 } },
    color: { aggregate: 'count' }
  }
})
```

_Compare the `size` and `color`-based 2D histograms above. Which encoding do you think should be preferred? Why? In which plot can you more precisely compare the magnitude of individual values? In which plot can you more accurately see the overall density of ratings?_

<hr/>

## Aggregation

Counts are just one type of aggregate. We can also calculate summaries using measures such as the `average`, `median`, `min`, or `max`. The Vega-Lite documentation includes the [full set of available aggregation functions](https://vega.github.io/vega-lite/docs/aggregate.html#ops).

Let's look at some examples!

### Averages and Sorting

_Do different genres of films receive consistently different ratings from critics?_ As a first step towards answering this question, we might examine the [*average* (a.k.a. the *arithmetic mean*)](https://en.wikipedia.org/wiki/Arithmetic_mean) rating for each genre of movie.

Let's visualize genre along the `y` axis and plot `average` Rotten Tomatoes ratings along the `x` axis.

```js echo
render({
  mark: { type: 'bar' },
  data: { values: movies },
  encoding: {
    x: { aggregate: 'average', field: 'Rotten_Tomatoes_Rating' },
    y: { field: 'Major_Genre', type: 'N' }
  }
})
```

_There does appear to be some interesting variation, but looking at the data as an alphabetical list is not very helpful for ranking critical reactions to the genres._

For a tidier picture, let's sort the genres in descending order of average rating. To do so, we will add a `sort` parameter to the `y` encoding channel, stating that we wish to sort by the `average` Rotten Tomatoes rating in descending `order`.

```js echo
render({
  mark: { type: 'bar' },
  data: { values: movies },
  encoding: {
    x: { aggregate: 'average', field: 'Rotten_Tomatoes_Rating' },
    y: {
      field: 'Major_Genre', type: 'N',
      sort: { op: 'average', field: 'Rotten_Tomatoes_Rating', order: 'descending' }
    }
  }
})
```

_The sorted plot suggests that critics think highly of documentaries, musicals, westerns, and dramas, but look down on romantic comedies and horror films... (and who doesn't love `null` movies!?)_

### Medians and the Inter-Quartile Range

While averages are a common way to summarize data, they can sometimes mislead. For example, very large or very small values ([*outliers*](https://en.wikipedia.org/wiki/Outlier)) might skew the average. To be safe, we can compare the genres according to the [*median*](https://en.wikipedia.org/wiki/Median) ratings as well.

The median is a point that splits the data evenly, such that half of the values are less than the median and the other half are greater. The median is less sensitive to outliers and so is referred to as a [*robust* statistic](https://en.wikipedia.org/wiki/Robust_statistics). For example, arbitrarily increasing the largest rating value will not cause the median to change.

Let's update our plot to use a `median` aggregate and sort by those values:

```js echo
render({
  mark: { type: 'bar' },
  data: { values: movies },
  encoding: {
    x: { aggregate: 'median', field: 'Rotten_Tomatoes_Rating' },
    y: {
      field: 'Major_Genre', type: 'N',
      sort: { op: 'median', field: 'Rotten_Tomatoes_Rating', order: 'descending' }
    }
  }
})
```

_We can see that some of the genres with similar averages have swapped places (films of unknown genre, or `null`, are now rated highest!), but the overall groups have stayed stable. Horror films continue to get little love from professional film critics._

It's a good idea to stay skeptical when viewing aggregate statistics. So far we've only looked at *point estimates*. We have not examined how ratings vary within a genre.

Let's visualize the variation among the ratings to add some nuance to our rankings. Here we will encode the [*inter-quartile range* (IQR)](https://en.wikipedia.org/wiki/Interquartile_range) for each genre. The IQR is the range in which the middle half of data values reside. A [*quartile*](https://en.wikipedia.org/wiki/Quartile) contains 25% of the data values. The inter-quartile range consists of the two middle quartiles, and so contains the middle 50%.

To visualize ranges, we can use the `x` and `x2` encoding channels to indicate the starting and ending points. We use the aggregate functions `q1` (the lower quartile boundary) and `q3` (the upper quartile boundary) to provide the inter-quartile range. (In case you are wondering, *q2* would be the median.)

```js echo
render({
  mark: { type: 'bar' },
  data: { values: movies },
  encoding: {
    x: { aggregate: 'q1', field: 'Rotten_Tomatoes_Rating' },
    x2: { aggregate: 'q3', field: 'Rotten_Tomatoes_Rating' },
    y: {
      field: 'Major_Genre', type: 'N',
      sort: { op: 'median', field: 'Rotten_Tomatoes_Rating', order: 'descending' }
    }
  }
})
```

_Though the median score for documentaries is slightly less than for `null`, its IQR has less variation and is more highly concentrated towards higher scores._`


### Time Units

_Now let's ask a completely different question: do box office returns vary by season?_

To get an initial answer, let's plot the median U.S. gross revenue by month.

We'll use a `timeUnit` transform to map release dates to the `month` of the year. The result is similar to binning, but with meaningful time intervals. Other valid time units include `year`, `quarter`, `date` (numeric day in month), `day` (day of the week), and `hours`, as well as compound units such as `timeYM` (year-month) or `timeHM` (hours-minutes). See the Vega-Lite documentation for a [complete list of time units](https://vega.github.io/vega-lite/docs/timeunit.html).

```js echo
render({
  mark: { type: 'area' },
  data: { values: movies },
  encoding: {
    x: { timeUnit: 'month', field: 'Release_Date' },
    y: { aggregate: 'median', field: 'US_Gross' }
  }
})
```

_Looking at the resulting plot, median movie sales in the U.S. appear to spike around the summer blockbuster season and the end of year holiday period. Of course, people around the world (not just the U.S.) go out to the movies. Does a similar pattern arise for worldwide gross revenue?_

```js echo
render({
  mark: { type: 'area' },
  data: { values: movies },
  encoding: {
    x: { timeUnit: 'month', field: 'Release_Date' },
    y: { aggregate: 'median', field: 'Worldwide_Gross' }
  }
})
```

_Yes!_

<hr/>

## Advanced Data Transformation

The examples above all use transformations (`bin`, `timeUnit`, `aggregate`, `sort`) that are defined relative to an encoding channel. However, at times you may want to apply a chain of multiple transformations prior to visualization, or use transformations that don't integrate into encoding definitions. For such cases, Vega-Lite supports data transformations defined separately from encodings. These transformations are applied to the data _before_ any encodings are considered.

We _could_ also perform transformations in JavaScript directly, and then visualize the result. However, using the built-in transforms allows our visualizations to be published more easily in other contexts; for example, exporting the Vega-Lite JSON to use in a stand-alone web interface. Let's look at the built-in transforms supported by Vega-Lite, such as `calculate`, `filter`, `aggregate`, and `window`.

### Calculate

_Think back to our comparison of U.S. gross and worldwide gross. Doesn't worldwide revenue include the U.S.? (Indeed it does.) How might we get a better sense of trends outside the U.S.?_

With the `calculate` transform we can derive new fields. Here we want to subtract U.S. gross from worldwide gross. The `calculate` transform takes a [Vega expression string](https://vega.github.io/vega/docs/expressions/) to define a formula over a single record. Vega expressions use JavaScript syntax. The `datum.` prefix accesses a field value on the input record.

```js echo
render({
  mark: { type: 'area' },
  data: { values: movies },
  transform: [
    { calculate: 'datum.Worldwide_Gross - datum.US_Gross', as: 'NonUS_Gross' }
  ],
  encoding: {
    x: { timeUnit: 'month', field: 'Release_Date' },
    y: { aggregate: 'median', field: 'NonUS_Gross' }
  }
})
```

_We can see that seasonal trends hold outside the U.S., but with a more pronounced decline in the non-peak months._

### Filter

The `filter` transform creates a new table with a subset of the original data, removing rows that fail to meet a provided [*predicate*](https://en.wikipedia.org/wiki/Predicate_%28mathematical_logic%29) test. Similar to the `calculate` transform, filter predicates are expressed using the [Vega expression language](https://vega.github.io/vega/docs/expressions/).

Below we add a filter to limit our initial scatter plot of IMDB vs. Rotten Tomatoes ratings to only films in the major genre of "Romantic Comedy".

```js echo
render({
  mark: { type: 'circle' },
  data: { values: movies },
  transform: [
    { filter: 'datum.Major_Genre == "Romantic Comedy"' }
  ],
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q' },
    y: { aggregate: 'median', field: 'IMDB_Rating' }
  }
})
```

_How does the plot change if we filter to other genres? Edit the filter expression to find out._

Now let's filter to look at films released before 1970:

```js echo
render({
  mark: { type: 'circle' },
  data: { values: movies },
  transform: [
    { filter: 'year(datum.Release_Date) < 1970' }
  ],
  encoding: {
    x: { field: 'Rotten_Tomatoes_Rating', type: 'Q' },
    y: { field: 'IMDB_Rating', type: 'Q' }
  }
})
```

_They seem to score unusually high! Are older films simply better, or is there a [selection bias](https://en.wikipedia.org/wiki/Selection%5Fbias) towards more highly-rated older films in this dataset?_

### Aggregate

We have already seen `aggregate` transforms such as `count` and `average` in the context of encoding channels. We can also specify aggregates separately, as a pre-processing step for other transforms (as in the `window` transform examples below). The output of an `aggregate` transform is a new data table with records that contain both the `groupby` fields and the computed `aggregate` measures.

Let's recreate our plot of average ratings by genre, but this time using a separate `aggregate` transform. The output table from the aggregate transform contains 13 rows, one for each genre.

```js echo
render({
  mark: { type: 'bar' },
  data: { values: movies },
  transform: [
    {
      aggregate: [
        { op: 'average', field: 'Rotten_Tomatoes_Rating', as: 'Average_Rating' }
      ],
      groupby: ['Major_Genre']
    }
  ],
  encoding: {
    x: { field: 'Average_Rating', type: 'Q' },
    y: {
      field: 'Major_Genre', type: 'N',
      sort: { field: 'Average_Rating', order: 'descending' }
    }
  }
})
```

### Window

The `window` transform performs calculations over sorted groups of data records. Window transforms are quite powerful, supporting tasks such as ranking, lead/lag analysis, cumulative totals, and running sums or averages. Values calculated by a `window` transform are written back to the input data table as new fields. Window operations include the aggregate operations we've seen earlier, as well as specialized operations such as `rank`, `row_number`, `lead`, and `lag`. The Vega-Lite documentation lists [all valid window operations](https://vega.github.io/vega-lite/docs/window.html#ops).

One use case for a `window` transform is to calculate top-k lists. Let's plot the top 20 directors in terms of total worldwide gross.

We first use a `filter` transform to remove records for which we don't know the director. Otherwise, the director `null` would dominate the list! We then apply an `aggregate` to sum up the worldwide gross for all films, grouped by director. At this point we could plot a sorted bar chart, but we'd end up with hundreds and hundreds of directors. How can we limit the display to the top 20?

The `window` transform allows us to determine the top directors by calculating their rank order. Within our `window` transform definition we can `sort` by gross and use the `rank` operation to calculate rank scores according to that sort order. We can then add a subsequent `filter` transform to limit the data to only records with a rank value less than or equal to 20.

```js echo
render({
  mark: { type: 'bar' },
  data: { values: movies },
  transform: [
    { filter: 'datum.Director != null' },
    {
      aggregate: [{ op: 'sum', field: 'Worldwide_Gross', as: 'Gross' }],
      groupby: ['Director']
    },
    {
      window: [{ op: 'rank', as: 'Rank' }],
      sort: [{ field: 'Gross', order: 'descending' }]
    },
    { filter: 'datum.Rank < 20' }
  ],
  encoding: {
    x: { field: 'Gross', type: 'Q' },
    y: {
      field: 'Director', type: 'N',
      sort: { field: 'Gross', order: 'descending' }
    }
  }
})
```

_We can see that Steven Spielberg has been quite successful in his career! However, showing sums might favor directors who have had longer careers, and so have made more movies and thus more money. What happens if we change the choice of aggregate operation? Who is the most successful director in terms of  `average` or `median` gross per film? Modify the aggregate transform above!_

Earlier in this notebook we looked at histograms, which approximate the [*probability density function*](https://en.wikipedia.org/wiki/Probability_density_function) of a set of values. A complementary approach is to look at the [*cumulative distribution*](https://en.wikipedia.org/wiki/Cumulative_distribution_function). For example, think of a histogram in which each bin includes not only its own count but also the counts from all previous bins &mdash; the result is a _running total_, with the last bin containing the total number of records. A cumulative chart directly shows us, for a given reference value, how many data values are less than or equal to that reference.

As a concrete example, let's look at the cumulative distribution of films by running time (in minutes). Only a subset of records actually include running time information, so we first `filter` down to the subset of films for which we have running times. Next, we apply an `aggregate` to count the number of films per duration (implicitly using "bins" of 1 minute each). We then use a `window` transform to compute a running total of counts across bins, sorted by increasing running time.

```js echo
render({
  mark: { type: 'line', interpolate: 'step-before' },
  data: { values: movies },
  transform: [
    { filter: 'datum.Running_Time_min != null' },
    {
      aggregate: [{ op: 'count', as: 'Count' }],
      groupby: ['Running_Time_min']
    },
    {
      window: [{ op: 'sum', field: 'Count', as: 'Cumulative_Sum' }],
      sort: [{ field: 'Running_Time_min' }]
    }
  ],
  encoding: {
    x: { field: 'Running_Time_min', type: 'Q', title: 'Duration (min)' },
    y: { field: 'Cumulative_Sum', type: 'Q', title: 'Cumulative Count of Films' }
  }
})
```

_Let's examine the cumulative distribution of film lengths. We can see that films under 110 minutes make up about half of all the films for which we have running times. We see a steady accumulation of films between 90 minutes and 2 hours, after which the distribution tapers off. Though rare, the dataset does contain multiple films more than 3 hours long!_

<hr/>

## Summary

We've only scratched the surface of what data transformations can do! For more details, including all the available transformations and their parameters, see the [Vega-Lite data transformation documentation](https://vega.github.io/vega-lite/docs/transform.html).

Sometimes you will need to perform significant data transformation to prepare your data _prior_ to using visualization tools. To engage in [_data wrangling_](https://en.wikipedia.org/wiki/Data_wrangling) right here in JavaScript, you can use built-in methods for [arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array), [strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String) and [objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object), or take advantage of additional utilities such as [d3-array](https://github.com/d3/d3-array). For more wrangling methods, see [Learn JS Data](https://observablehq.com/@dakoop/learn-js-data) or the [Arquero library](https://observablehq.com/@uwdata/introducing-arquero). For a deeper dive into windowed transformations, see [Working with Window Queries](https://observablehq.com/@uwdata/working-with-window-queries).
