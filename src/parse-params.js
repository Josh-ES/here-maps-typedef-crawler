import parseHtml from './parse-html';
import processType from './process-type';

export default function parseParams($parameters) {
  const $constructorParams = $parameters.find('dt samp');
  const parameters = [];

  $constructorParams.each((index, el) => {
    const $ = parseHtml();
    const $parameter = $(el);
    const $dt = $parameter.parents('dt');

    const nextTerm = $dt.next('dt').text();
    let descriptor;

    if (!nextTerm.trim()) {
      descriptor = $dt.nextAll('dt').first().next('dd').text();
    }

    const name = $parameter.text();

    const parameterTypeText = $parameter
      .parent()
      .next('dd')
      .find('samp')
      .text();

    const typeRaw = processType(parameterTypeText);

    const type = typeRaw.replace('=', '');

    parameters.push({
      name,
      type,
      bracketedType: `{${typeRaw}}`,
      descriptor,
      optional: type !== typeRaw,
    });
  });

  return parameters;
}