import cheerio from 'cheerio';

let $;

export default function parseHtml(html) {
  if (!$) {
    $ = cheerio.load(html);
  }

  return $;
}
