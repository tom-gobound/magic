export class CodeExecutor {
  constructor() {
    this.worker = new Worker(new URL('../workers/codeExecutor.js', import.meta.url), { type: 'module' });
  }

  execute(code, queryObject) {
    return new Promise((resolve, reject) => {
      const handleMessage = (event) => {
        this.worker.removeEventListener('message', handleMessage);
        if (event.data.success) {
          resolve(event.data.result);
        } else {
          reject(new Error(event.data.error));
        }
      };

      this.worker.addEventListener('message', handleMessage);
      this.worker.postMessage({ code, queryObject });
    });
  }

  terminate() {
    this.worker.terminate();
  }
}