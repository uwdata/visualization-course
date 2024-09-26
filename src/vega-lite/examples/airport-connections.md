```js
import { airportConnections } from '../../components/airport-connections.js';
```

# Vega-Lite Airport Connections

An interactive visualization of connections among major U.S. airports in 2008. Based on a [U.S. airports example](https://mbostock.github.io/d3/talk/20111116/airports.html) by Mike Bostock.

```js
const plot = airportConnections();
```

```js
plot.render()
```

Vega-Lite JSON specification:

<pre>
${JSON.stringify(plot.toObject(), 0, 2)}
</pre>
