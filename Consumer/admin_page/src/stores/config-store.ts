import { makeObservable, observable, action, runInAction } from "mobx"
import { ApiReceiverManager } from "../api/api"

class ConfigStore { 
    public consumers: any = {};
    public providers: any = {};
    public loading = false;

    constructor() {
        makeObservable(this, {
            providers: observable.deep,
            consumers: observable.deep,
            loading: observable,
            update: action
        })
    }

    public update() {
        this.loading = true;
        ApiReceiverManager.callMethod<any>("receiver.config.get", {}).then((result) => {
            runInAction(() => {
                this.providers = result.data.providers;
                this.consumers = result.data.consumers;
                this.loading = false;
            })
        })
    }

  }

export { ConfigStore }