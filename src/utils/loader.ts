export class Loader {
  batchLoader: Function;
  requestedIds: Set<string>;
  queuedIds: Set<string>;
  store: Record<string, any>;
  batchRequest: Promise<any> | null;

  constructor(batchLoader, store) {
    this.batchLoader = batchLoader;
    this.requestedIds = new Set();
    this.queuedIds = new Set();
    this.store = store;
    this.batchRequest = null;
  }

  async load(id: string): Promise<any> {
    if (id in this.store) {
      return this.store[id]; // Return cached value immediately
    }

    return new Promise((resolve, reject) => {
      this.requestedIds.add(id);

      Promise.resolve().then(async () => {
        const missingIds = Array.from(this.requestedIds).filter(id => !this.queuedIds.has(id));
        this.requestedIds.clear();

        if (missingIds.length > 0) {
          try {
            this.batchRequest = Promise.resolve(this.batchLoader(missingIds));
          } catch (e) {
            reject(e);
            return;
          }
          missingIds.forEach(id => this.queuedIds.add(id));
        }

        try {
          const items = await this.batchRequest;
          Object.assign(this.store, items);

          // Remove the ID from the queue after loading
          this.remove(id);

          resolve(this.store[id]);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  remove(id: string) {
    this.queuedIds.delete(id);
  }
}  
