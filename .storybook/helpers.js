const dasherize = function(s) {
  return s.replace(/[A-Z]/g, function(char, index) {
    return (index !== 0 ? '-' : '') + char.toLowerCase();
  });
};
  
export const buildAttributes = function (args) {
  let attrs = []
  for (var key in args) {
    if (args[key] !== '') {
      let value = args[key]
      let quote = '"'

      if (typeof value === 'string') {
        try {
          JSON.parse(value)
          quote = "'"
        } catch (e) {}
      }
      attrs.push(`${dasherize(key)}=${quote}${value}${quote}`)
    }
  }
  return attrs
}