import parseHtml from './parse-html';
import processType from './process-type';

export default function parseReturn($parameters) {
  const $constructorParams = $parameters.find('dt:nth-child(4n-1)');
  const parameters = [];

  $constructorParams.each((index, el) => {
    const $ = parseHtml();
    const $dt = $(el);

    const nextTerm = $dt.next('dt').text();
    let descriptor;

    if (!nextTerm.trim()) {
      descriptor = $dt.nextAll('dt').first().next('dd').text();
    }

    const returnsTypeText = $dt
      .next('dd')
      .find('samp')
      .text();

    const typeRaw = processType(returnsTypeText);

    const type = typeRaw.replace('=', '');

    parameters.push({
      type,
      bracketedType: `{${typeRaw}}`,
      descriptor,
      optional: type !== typeRaw,
    });
  });

  return parameters;
}