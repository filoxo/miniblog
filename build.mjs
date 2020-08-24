////////////////////////////////////////////////////////////////////////////////
// Create a directory called "pages" next to
// this file, put markdown files in there, and
// then run:
//
// ```
// $ node build.mjs
// ```
//
// Then deploy the "build" directory somewhere.
//

import path from "path";
import { promises as fs } from "fs";
import shell from "shelljs";
import report from "vfile-reporter";
import React from "react";
import ReactDOMServer from "react-dom/server.js";
import MDX from "@mdx-js/runtime";

////////////////////////////////////////////////////////////////////////////////
const __dirname = path.resolve();
const pagesDirectory = "pages";

////////////////////////////////////////////////////////////////////////////////
go();

////////////////////////////////////////////////////////////////////////////////
async function go() {
  shell.rm("-rf", "build");
  shell.mkdir("build");
  let pages = await fs.readdir(path.join(__dirname, pagesDirectory));
  await Promise.all(
    pages.map(async (filename) => {
      let page = path.join(__dirname, pagesDirectory, filename);
      let body = await createPage(page);
      await fs.writeFile(
        path.join(__dirname, "build", filename.replace(/\.md$/, ".html")),
        body
      );
      console.log("›", filename);
    })
  );
  console.log("Done!");
}

async function createPage(filePath) {
  let markdown = await fs.readFile(filePath);
  return new Promise(async (resolve, reject) => {
    try {
      // NOTE: This is a Node environment, and JSX isn't possible without a build step.
      const page = ReactDOMServer.renderToString(
        React.createElement(MDX, { children: markdown })
      );
      resolve(page);
    } catch (err) {
      console.error(report(err));
      reject(err);
    }
  });
}
