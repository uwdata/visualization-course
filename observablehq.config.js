// See https://observablehq.com/framework/config for documentation.
export default {
  // The project’s title; used in the sidebar and webpage titles.
  title: 'Data Visualization Course',

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    {
      name: "Vega-Lite",
      pages: [
        {name: "Introduction to Vega-Lite", path: "vega-lite/introduction"},
        {name: "Data Types, Graphical Marks, and Visual Encoding Channels", path: "vega-lite/data-types-graphical-marks-encoding-channels"},
        {name: "Data Transformation", path: "vega-lite/data-transformation"},
        {name: "Scales, Axes, and Legends", path: "vega-lite/scales-axes-legends"},
        {name: "Multi-View Composition", path: "vega-lite/multi-view-composition"},
        {name: "Interaction", path: "vega-lite/interaction"},
        {name: "Cartographic Visualization", path: "vega-lite/cartographic-visualization"}
      ]
    },
    {
      name: 'Vega-Lite Examples',
      pages: [
        {name: 'U.S. Population 1850-2000', path: 'vega-lite/examples/us-population-1850-2000'},
        {name: 'Annotated Time Series', path: 'vega-lite/examples/annotated-time-series'},
        {name: 'Airport Connections', path: 'vega-lite/examples/airport-connections'}
      ]
    },
    {
      name: 'D3',
      pages: [
        {name: 'Introduction, Part 1', path: 'd3/introduction-part-1'},
        {name: 'Introduction, Part 2', path: 'd3/introduction-part-2'}
      ]
    }
  ],

  // Content to add to the head of the page, e.g. for a favicon:
  head: '<link rel="icon" href="favicon.png" type="image/png" sizes="32x32">',

  // The path to the source root.
  root: "src",

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  footer: null, // what to show in the footer (HTML)
  // sidebar: true, // whether to show the sidebar
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
  // output: "dist", // path to the output root for build
  // search: true, // activate search
  // linkify: true, // convert URLs in Markdown to links
  // typographer: false, // smart quotes and other typographic improvements
  // cleanUrls: true, // drop .html from URLs
};
