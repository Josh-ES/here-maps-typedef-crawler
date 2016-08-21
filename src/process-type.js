export default function processType(type) {
  return type
    // remove curly brackets around the type
    .replace(/[{}]+/g, '')
    // remove any optional indicators from the type string
    .replace(/\s*\[optional\]/g, '')
    // replace '!Function' with simply 'Function'
    .replace('!Function', 'Function')
}
