export function generateJsonSchema(obj, title = 'QueryObject') {
  const schema = {
    $schema: "http://json-schema.org/draft-07/schema#",
    title,
    type: "object",
    properties: {}
  };

  // First pass: collect all unique values for each property
  const propertyValues = collectPropertyValues(obj);

  // Second pass: generate schema with enums where appropriate
  for (const [key, value] of Object.entries(obj)) {
    schema.properties[key] = getPropertyType(value, propertyValues[key]);
  }

  return schema;
}

function collectPropertyValues(obj) {
  const values = {};

  // Helper function to collect values from an object or array
  function collect(item, parentKey = '') {
    if (item === null || typeof item !== 'object') {
      return;
    }

    if (Array.isArray(item)) {
      item.forEach(element => {
        if (typeof element === 'object' && element !== null) {
          collect(element, parentKey);
        }
      });
    } else {
      for (const [key, value] of Object.entries(item)) {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        
        if (!values[fullKey]) {
          values[fullKey] = new Set();
        }

        if (value !== null && typeof value === 'object') {
          collect(value, fullKey);
        } else if (value !== undefined) {
          values[fullKey].add(value);
        }
      }
    }
  }

  collect(obj);
  return values;
}

function getPropertyType(value, uniqueValues) {
  if (value === null) return { type: "null" };
  
  const type = typeof value;
  
  switch (type) {
    case "string":
    case "number":
    case "boolean": {
      const schema = { type };
      
      // If we have unique values and there are fewer than 20, add them as an enum
      if (uniqueValues && uniqueValues.size < 20) {
        schema.enum = Array.from(uniqueValues).sort();
      }
      
      return schema;
    }
    case "object":
      if (Array.isArray(value)) {
        const arraySchema = {
          type: "array",
          items: value.length > 0 ? getPropertyType(value[0]) : {}
        };

        // If array contains objects, we need to handle nested properties
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          const nestedValues = {};
          value.forEach(item => {
            for (const [key, val] of Object.entries(item)) {
              if (!nestedValues[key]) {
                nestedValues[key] = new Set();
              }
              if (val !== undefined) {
                nestedValues[key].add(val);
              }
            }
          });

          arraySchema.items = {
            type: "object",
            properties: {}
          };

          for (const [key, val] of Object.entries(value[0])) {
            arraySchema.items.properties[key] = getPropertyType(val, nestedValues[key]);
          }
        }

        return arraySchema;
      }
      return generateJsonSchema(value);
    default:
      return { type: "string" };
  }
}