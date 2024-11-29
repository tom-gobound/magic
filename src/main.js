import { availableDataFiles, getSelectedData } from './data/index.js';
import { analyzeQuery, displayResult } from './utils/queryAnalyzer.js';

function initializeDataSelector() {
    const documentGroup = document.getElementById('document-group');
    Object.keys(availableDataFiles).forEach(filename => {
        const label = document.createElement('label');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'dataFiles';
        checkbox.value = filename;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(filename));
        documentGroup.appendChild(label);
    });
}

async function handleAnalyzeQuery() {
    const question = document.getElementById('question').value;
    const context = document.getElementById('context').value;
    const mode = document.querySelector('input[name="mode"]:checked').value;
    const responseDiv = document.getElementById('response');
    
    const selectedFiles = Array.from(document.querySelectorAll('input[name="dataFiles"]:checked'))
        .map(checkbox => checkbox.value);
    
    if (selectedFiles.length === 0) {
        responseDiv.innerHTML = '<div class="error">Please select at least one data file.</div>';
        return;
    }

    responseDiv.innerHTML = 'Loading data and analyzing...';

    try {
        const queryObject = await getSelectedData(selectedFiles);
        const result = await analyzeQuery(queryObject, question, context, mode);
        displayResult(result, responseDiv);
    } catch (error) {
        responseDiv.innerHTML = `<div class="error">Error: ${error.message}</div>`;
    }
}

document.addEventListener('DOMContentLoaded', initializeDataSelector);
window.analyzeQuery = handleAnalyzeQuery;