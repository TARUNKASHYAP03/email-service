class Queue {
  constructor() {
    this.tasks = [];
    this.isProcessing = false;
  }

  enqueue(task) {
    this.tasks.push(task);
    this.processQueue();
  }
    async processQueue() {
        if (this.isProcessing || this.tasks.length ===0) return;
        this.isProcessing = true;
    
        while (this.tasks.length > 0) {
        const task = this.tasks.shift();
        try {
            await task.fn();
            task.resolve();
        } catch (error) {
            console.error("Task failed:", error);
            task.reject(error);
        }
        }
    
        this.isProcessing = false;
    }
}

module.exports = Queue;