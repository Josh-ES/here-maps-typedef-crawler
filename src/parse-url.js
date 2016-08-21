import request from 'request';
import Promise from 'bluebird';
import assignIn from 'lodash.assignIn';
import parseParams from './parse-params';
import parseReturns from './parse-returns';
import parseHtml from './parse-html';
import processType from './process-type';

export default function parseUrl(url) {
  return new Promise((resolve, reject) => {
    request(url, (error, response, html) => {
      // first, make sure no errors occurred during the request
      if (!error) {
        const $ = parseHtml(html);

        const $documentation = $('#documentation');
        const $topicTitle = $documentation.find('h1.topictitle1');
        const $typeTitle = $documentation.find('.summary h2.sectiontitle').first();

        // get the name of the object within the library
        const topic = $topicTitle.text();

        // get the isolated name of the class, type or interface
        const name = $topicTitle
          .clone()
          .children()
          .remove()
          .end()
          .text();

        // get the type of object that is present here
        let type;

        switch ($typeTitle.text()) {
          // if the type is an interface
          case 'Interface Summary':
            type = 'interface';
            break;

          // if the type is a class
          case 'Class Summary':
            type = 'class';
            break;

          // if the type is an enum
          case 'Enumeration Summary':
            type = 'enum';
            break;

          // if the type is a type definition, make it an interface as well
          case 'Type Definition Summary':
            type = 'interface';
            break;
        }

        const $baseDetails = $documentation.find(`.${type === 'enum' ? 'enumeration' : type}.details p, .typedef p`).first();
        const baseDetail = $baseDetails.text();

        const dataObject = {
          topic,
          name: name.trim(),
          type,
          baseDetail,
        };

        // get the class constructor details
        // if it's a class or an interface
        if (type === 'class' || type === 'interface') {
          const $constructorParams = $documentation.find('.class-constructor.details .parameters dl');
          const constructorParams = parseParams($constructorParams);

          const $methods = $documentation.find(`.${type}-methods.details div.method`);
          const methods = [];

          $methods.each((index, el) => {
            const $method = $(el);
            const $methodPara = $method.find('p.method');
            const name = $methodPara.find('strong').text().trim();
            const description = $methodPara.next('p').text().trim();

            const $methodParams = $method.find('.parameters dl');
            const params = parseParams($methodParams);

            const $methodReturns = $method.find('.returns dl');
            const returns = parseReturns($methodReturns);

            methods.push({
              name,
              description,
              params,
              returns,
              static: $methodPara.hasClass('static'),
            });
          });

          const $properties = $documentation.find(`.${type}-properties.details div.property, .typedef-properties.details div.property`);
          const properties = [];

          $properties.each((index, el) => {
            const $property = $(el);
            const $propertyPara = $property.find('p.property');
            const name = $propertyPara.find('strong').text().trim();
            const description = $propertyPara.next('p').text().trim();
            const propertyTypeText = $propertyPara.find('span.property-type').text();

            const typeRaw = processType(propertyTypeText);

            const type = typeRaw.replace('=', '');

            properties.push({
              name,
              description,
              type,
              bracketedType: `{${typeRaw}}`,
              optional: type !== typeRaw,
              static: $propertyPara.hasClass('static'),
            });
          });

          const $extendsPara = $documentation.find('strong:contains(\'Extends\')');
          const base = $extendsPara.siblings('a').text();

          const $implementsPara = $documentation.find('strong:contains(\'Implements\')');
          const baseInterface = $implementsPara.siblings('a').text();

          assignIn(dataObject, { properties, constructorParams, methods, base, baseInterface });
        }

        // if it's an enum type
        if (type === 'enum') {
          const $properties = $documentation.find(`.enumeration-properties.details div.property`);
          const enumProps = [];

          $properties.each((index, el) => {
            const $property = $(el);
            const $propertyPara = $property.find('p.property');
            const name = $propertyPara.find('strong').text().trim();
            const description = $propertyPara.next('p').text().trim();
            const propertyTypeText = $propertyPara.find('span.property-type').text();

            const typeRaw = processType(propertyTypeText);

            const type = typeRaw.replace('=', '');

            enumProps.push({
              name,
              description,
            });
          });

          assignIn(dataObject, { enumProps });
        }

        resolve(dataObject)
      } else {
        reject(error);
      }
    })
  })
}