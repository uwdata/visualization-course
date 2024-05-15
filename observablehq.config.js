// See https://observablehq.com/framework/config for documentation.
export default {
  // The project’s title; used in the sidebar and webpage titles.
  title: "Data Visualization Course",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
  pages: [
    {
      name: "Topics",
      pages: [
        {name: "Introduction", path: "/introduction/"},
        {name: "Visual Encoding", path: "visual-encoding/"},
        {name: "Visual Analysis", path: "visual-analysis/"},
        {name: "Interaction", path: "interaction/"},
        {name: "Perception", path: "perception/"},
        {name: "Maps", path: "maps/"},
        {name: "Web Visualization", path: "web-visualization/"},
        {name: "Networks", path: "networks/"},
        {name: "Communication", path: "comunication/"},
        {name: "Evaluation", path: "evaluation/"}
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
