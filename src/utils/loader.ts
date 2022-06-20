export class Loader {
  batchLoader: Function
  requestedIds: Array<String>
  queuedIds: Array<String>
  store: any

  batchRequest

  constructor(batchLoader, store) {
    this.batchLoader = batchLoader
    this.requestedIds = []
    this.queuedIds = []
    this.store = store
  }

  async load (id): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.requestedIds.push(id)
      process.nextTick(async () => {

        let missingIds = this.requestedIds.filter(_id => this.queuedIds.indexOf(_id) === -1)
        this.requestedIds = []
        if (missingIds.length > 0) {
          this.batchRequest = this.batchLoader(missingIds)
          this.queuedIds = [...new Set(this.queuedIds.concat(missingIds))]
        }

        try {
          const items = await this.batchRequest
          this.store = {... this.store, ... items }
          resolve(this.store[id])
        } catch (e) {
          reject()
        }
      })
    })
  }

  remove (id) {
    delete this.queuedIds[this.queuedIds.indexOf(id)]
  }
}  