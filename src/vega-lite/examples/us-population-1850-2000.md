```js
import { render } from '../../components/vega-lite.js';
```

# U.S. Population 1850-2000

---
## Sum of People Across All Census Decades

```js echo
render({
  mark: { type: 'bar', tooltip: true },
  data: { values: census },
  encoding: {
    x: {
      aggregate: 'sum', field: 'people',
      title: 'Sum of people (all years)',
      axis: { format: ',d' }
    }
  },
  width: 640
})
```

---
## People by Census Decade

```js echo
render({
  mark: { type: 'bar', tooltip: true },
  data: { values: census },
  encoding: {
    x: { field: 'year', type: 'O', axis: { labelAngle: 0 } }, // <-- add year to x channel
    y: { aggregate: 'sum', field: 'people' }
  },
  width: 640,
  height: 300
})
```

---
## People by Census Decade and Sex (Stacked)

```js echo
render({
  mark: { type: 'bar', tooltip: true },
  data: { values: census },
  encoding: {
    x: { field: 'year', type: 'O', axis: { labelAngle: 0 } },
    y: { aggregate: 'sum', field: 'people' },
    color: { field: 'sex', type: 'N' } // <- add sex to color channel
  },
  width: 640,
  height: 300
})
```

---
## People by Census Decade and Sex (Side-by-Side)

```js echo
render({
  mark: { type: 'bar', tooltip: true },
  data: { values: census },
  encoding: {
    column: { field: 'sex', type: 'N' }, // <-- add sex to column channel (redundant encoding)
    x: { field: 'year', type: 'O', axis: { labelAngle: 0 } },
    y: { aggregate: 'sum', field: 'people' },
    color: { field: 'sex', type: 'N' }
  },
  width: 400,
  height: 300
})
```

---
## People by Census Decade and Sex (Grouped)

```js echo
render({
  mark: { type: 'bar', tooltip: true },
  data: { values: census },
  encoding: {
    column: { field: 'year', type: 'N', title: null, spacing: 5 }, // <-- move year to column channel
    x: { field: 'sex', type: 'N', title: null }, // <-- move sex to x channel
    y: { aggregate: 'sum', field: 'people' },
    color: { field: 'sex', type: 'N' }
  },
  height: 300
})
```

---
## Population Pyramid for 2000 (Take 1)

```js echo
render({
  mark: { type: 'bar', tooltip: true },
  data: { values: census },
  transform: [
    { filter: 'datum.year === 2000' } // <-- look at 2000 only
  ],
  encoding: {
    column: { field: 'sex', type: 'N', title: null, spacing: 10 },
    x: { aggregate: 'sum', field: 'people' }, // <-- move people to x channel
    y: { field: 'age', type: 'O', scale: { reverse: true } }, // <-- add age to y channel
    color: { field: 'sex', type: 'N' }
  },
  width: 320,
  height: 300
})
```

---
## Population Pyramid for 2000 (Take 2)

```js
render({
  data: { values: census },
  transform: [
    { filter: 'datum.year === 2000' }
  ],
  hconcat: [
    {
      mark: { type: 'bar' },
      title: 'Female',
      transform: [
        { filter: 'datum.sex === "Female"' }
      ],
      encoding: {
        y: { field: 'age', type: 'O', axis: null, sort: 'descending' },
        x: {
          aggregate: 'sum', field: 'people', title: 'population',
          axis: { format: 's' }, sort: 'descending'
        },
        color: {
          field: 'sex', type: 'N', legend: null,
          scale: { range: ['#675193', '#ca8861'] }
        }
      },
      width: 320
    },
    {
      mark: { type: 'text', align: 'center' },
      transform: [
        { aggregate: [{ op: 'count' }], groupby: ['age'] }
      ],
      encoding: {
        y: { field: 'age', type: 'O', axis: null, sort: 'descending' },
        text: { field: 'age', type: 'Q' },

      },
      width: 25
    },
    {
      mark: { type: 'bar' },
      title: 'Male',
      transform: [
        { filter: 'datum.sex === "Male"' }
      ],
      encoding: {
        y: { field: 'age', type: 'O', axis: null, sort: 'descending' },
        x: {
          aggregate: 'sum', field: 'people', title: 'population',
          axis: { format: 's' }
        },
        color: {
          field: 'sex', type: 'N', legend: null,
          scale: { range: ['#675193', '#ca8861'] }
        }
      },
      width: 320
    }
  ],
  spacing: 0,
  config: { view: { stroke: null }, axis: { grid: false } }
})
```

---
## Interactive Pyramid

```js
const year_ip = view(
  Inputs.range([1850, 2000], { label: 'Year', value: 2000, step: 10 })
)
```

```js
render({
  data: { values: census },
  transform: [
    { filter: `datum.year === ${year_ip}` }
  ],
  hconcat: [
    {
      mark: { type: 'bar' },
      title: 'Female',
      transform: [
        { filter: 'datum.sex === "Female"' }
      ],
      encoding: {
        y: { field: 'age', type: 'O', axis: null, sort: 'descending' },
        x: {
          aggregate: 'sum', field: 'people', title: 'population',
          scale: { domain: [0, 12e6] }, axis: { format: 's' }, sort: 'descending'
        },
        color: {
          field: 'sex', type: 'N', legend: null,
          scale: { range: ['#675193', '#ca8861'] }
        }
      },
      width: 320
    },
    {
      mark: { type: 'text', align: 'center' },
      transform: [
        { aggregate: [{ op: 'count' }], groupby: ['age'] }
      ],
      encoding: {
        y: { field: 'age', type: 'O', axis: null, sort: 'descending' },
        text: { field: 'age', type: 'Q' },

      },
      width: 25
    },
    {
      mark: { type: 'bar' },
      title: 'Male',
      transform: [
        { filter: 'datum.sex === "Male"' }
      ],
      encoding: {
        y: { field: 'age', type: 'O', axis: null, sort: 'descending' },
        x: {
          aggregate: 'sum', field: 'people', title: 'population',
          scale: { domain: [0, 12e6] }, axis: { format: 's' }
        },
        color: {
          field: 'sex', type: 'N', legend: null,
          scale: { range: ['#675193', '#ca8861'] }
        }
      },
      width: 320
    }
  ],
  spacing: 0,
  config: { view: { stroke: null }, axis: { grid: false } }
})
```

---
## Interactive Pyramid by Marital Status

```js
const year_ipm = view(
  Inputs.range([1900, 2000], { label: 'Year', value: 1900, step: 10 })
)
```

```js
render({
  data: { values: census },
  transform: [
    { filter: `datum.year === ${year_ipm}` }
  ],
  hconcat: [
    {
      mark: { type: 'bar' },
      title: 'Female',
      transform: [
        { filter: 'datum.sex === "Female"' }
      ],
      encoding: {
        y: { field: 'age', type: 'O', axis: null, sort: 'descending' },
        x: {
          aggregate: 'sum', field: 'people', title: 'population',
          scale: { domain: [0, 12e6] }, axis: { format: 's' }, sort: 'descending'
        },
        color: {
          field: 'marst', type: 'N',
          scale: { domain: marst_domain, range: colors }
        },
        order: { field: 'order', type: 'N' }
      },
      width: 320
    },
    {
      mark: { type: 'text', align: 'center' },
      transform: [
        { aggregate: [{ op: 'count' }], groupby: ['age'] }
      ],
      encoding: {
        y: { field: 'age', type: 'O', axis: null, sort: 'descending' },
        text: { field: 'age', type: 'Q' },

      },
      width: 25
    },
    {
      mark: { type: 'bar' },
      title: 'Male',
      transform: [
        { filter: 'datum.sex === "Male"' }
      ],
      encoding: {
        y: { field: 'age', type: 'O', axis: null, sort: 'descending' },
        x: {
          aggregate: 'sum', field: 'people', title: 'population',
          scale: { domain: [0, 12e6] }, axis: { format: 's' }
        },
        color: {
          field: 'marst', type: 'N',
          scale: { domain: marst_domain, range: colors }
        },
        order: { field: 'order', type: 'N' }
      },
      width: 320
    }
  ],
  spacing: 0,
  config: { view: { stroke: null }, axis: { grid: false } }
})
```

---
## Interactive Pyramid by Marital Status (Normalized)

```js
const year_ipmn = view(
  Inputs.range([1900, 2000], { label: 'Year', value: 1900, step: 10 })
)
```

```js
render({
  data: { values: census },
  transform: [
    { filter: `datum.year === ${year_ipmn}` },
    {
      window: [{ op: 'sum', field: 'people', as: 'group' }], frame: [null, null],
      groupby: ['age', 'sex']
    },
    { calculate: 'datum.people / datum.group', as: 'perc' }
  ],
  hconcat: [
    {
      mark: { type: 'bar' },
      title: 'Female',
      transform: [
        { filter: 'datum.sex === "Female"' }
      ],
      encoding: {
        y: { field: 'age', type: 'O', axis: null, sort: 'descending' },
        x: {
          field: 'perc', type: 'Q', title: 'population',
          scale: { domain: [0, 1] }, axis: { format: '%' }, sort: 'descending'
        },
        color: {
          field: 'marst', type: 'N',
          scale: { domain: marst_domain, range: colors }
        },
        order: { field: 'order', type: 'N' }
      },
      width: 320
    },
    {
      mark: { type: 'text', align: 'center' },
      transform: [
        { aggregate: [{ op: 'count' }], groupby: ['age'] }
      ],
      encoding: {
        y: { field: 'age', type: 'O', axis: null, sort: 'descending' },
        text: { field: 'age', type: 'Q' },

      },
      width: 25
    },
    {
      mark: { type: 'bar' },
      title: 'Male',
      transform: [
        { filter: 'datum.sex === "Male"' }
      ],
      encoding: {
        y: { field: 'age', type: 'O', axis: null, sort: 'descending' },
        x: {
          field: 'perc', type: 'Q', title: 'population',
          scale: { domain: [0, 1] }, axis: { format: '%' }
        },
        color: {
          field: 'marst', type: 'N',
          scale: { domain: marst_domain, range: colors }
        },
        order: { field: 'order', type: 'N' }
      },
      width: 320
    }
  ],
  spacing: 0,
  config: { view: { stroke: null }, axis: { grid: false } }
})
```

---
## Data Preparation

```js echo
const rows = await FileAttachment('../../data/census.txt').tsv({ typed: true });
const census = rows.map(datum => {
  const marst = alias_marst.get(datum.marst); // map integer codes to string
  const sex = alias_sex.get(datum.sex);       // map integer codes to string
  const order = -marst_domain.indexOf(marst); // add ordering field by marital status
  return { ...datum, marst, sex, order };     // return new object with computed properties
});
```

```js echo
const alias_sex = new Map().set(1, 'Male').set(2, 'Female')
```

```js echo
const alias_marst = new Map()
  .set(0, 'Unknown')
  .set(1, 'Married')
  .set(2, 'Married, Spouse Absent')
  .set(3, 'Separated')
  .set(4, 'Divorced')
  .set(5, 'Widowed')
  .set(6, 'Single')
```

```js echo
const marst_domain = [
  'Unknown',
  'Single',
  'Widowed',
  'Divorced',
  'Separated',
  'Married, Spouse Absent',
  'Married'
]
```

```js echo
const colors = [
  '#C7C7C7', // unknown
  '#9EDAE5', // single
  '#7F7F7F', // widowed
  '#9467BD', // divorced
  '#F7B6D2', // separated
  '#FFBB78', // married, spouse absent
  '#FFBB78'  // married
]
```
