self.onmessage = function(e) {
  const { code, queryObject } = e.data;
  
  try {
    const evalContext = `
      const queryObject = ${JSON.stringify(queryObject)};
      ${code}
    `;
    
    const result = eval(evalContext);
    
    if (result === undefined) {
      self.postMessage({ 
        success: false, 
        error: 'Code execution returned undefined. Make sure your code returns a value.' 
      });
    } else {
      self.postMessage({ 
        success: true, 
        result: result 
      });
    }
  } catch (error) {
    self.postMessage({ 
      success: false, 
      error: error.message 
    });
  }
};