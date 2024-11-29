import { generateJsonSchema } from './schemaGenerator.js';
import { CodeExecutor } from './workerManager.js';

const API_BASE_URL = 'https://javascript-code-generator.onrender.com/api';

export async function analyzeQuery(queryObject, question, context, mode) {
  if (!queryObject || Object.keys(queryObject).length === 0) {
    throw new Error('Query object is required');
  }

  if (mode === 'server') {
    return await analyzeWithServer(queryObject, question, context);
  } else {
    return await analyzeWithClient(queryObject, question, context);
  }
}

async function analyzeWithServer(queryObject, question, context) {
  const response = await fetch(`${API_BASE_URL}/analyze/server`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      queryObject,
      question,
      context,
    }),
  });

  if (!response.ok) {
    throw new Error('Server response was not ok');
  }

  return await response.json();
}

async function analyzeWithClient(queryObject, question, context) {
  const schema = generateJsonSchema(queryObject);
  const response = await fetch(`${API_BASE_URL}/analyze/client`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      schema,
      question,
      context,
    }),
  });

  if (!response.ok) {
    throw new Error('Server response was not ok');
  }

  const result = await response.json();
  const codeExecutor = new CodeExecutor();

  try {
    const evaluationResult = await codeExecutor.execute(
      result.javascript,
      queryObject
    );
    codeExecutor.terminate();

    return {
      ...result,
      evaluationResult,
      schema,
    };
  } catch (error) {
    codeExecutor.terminate();
    return {
      ...result,
      evaluationResult: `Error evaluating code: ${error.message}`,
      schema,
    };
  }
}

export function displayResult(result, responseDiv) {
  responseDiv.innerHTML = `
    <h4>Human Response:</h4>
    <p>${result.humanResponse}</p>

    <h4>Evaluation Result:</h4>
    <div class="evaluation-result">${JSON.stringify(
      result.evaluationResult,
      null,
      2
    )}</div>
    
    <h4>JavaScript Code:</h4>
    <pre><code>${result.javascript}</code></pre>

    <h4>Generated Schema:</h4>
    <pre><code>${JSON.stringify(result.schema, null, 2)}</code></pre>
  `;
}
