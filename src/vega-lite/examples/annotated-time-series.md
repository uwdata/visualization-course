```js
import { timeSeries } from '../../components/annotated-time-series.js';
```

# Vega-Lite Annotated Time Series

Interactive details on demand for tech company stock prices. Starting with a log-scaled line chart of stock prices, adds an interactive guide line and price labels for the date nearest to the mouse cursor.

```js
const plot = timeSeries();
```

```js
plot.render()
```

Vega-Lite JSON specification:

<pre>
${JSON.stringify(plot.toObject(), 0, 2)}
</pre>
