#!/usr/bin/env node
import program from 'commander';
import parseUrl from './parse-url';
import Handlebars from 'handlebars';
import fs from 'fs';

program
  .version('1.0.0')
  .option('-u, --url [href]', 'HERE Maps Documentation URL')
  .parse(process.argv);

if (program.url) {
  parseUrl(program.url)
    .then((dataObject) => {
      fs.readFile('src/main.hbs', (err, data) => {
        if (err) throw err;

        const template = data.toString();
        const outputJavascriptTemplate = Handlebars.compile(template);
        const outputJavascript = outputJavascriptTemplate(dataObject);

        fs.writeFile('output/out.txt', outputJavascript, (err) => {
          if (err) throw err;
          console.log(`Successfully Completed the Crawl of ${program.url}`)
        })
      })
    })
}