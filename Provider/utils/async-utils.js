
function concurrencyLimiter(async_function, limit) {
    let running = 0;
    let queue = [];

    let onEmptyQueue = () => {};
    let emptyQueuePromise = new Promise(resolve => resolve());

    async function wrapper() {
        const currentArgs = arguments;
        const currentThis = this;

        if (running >= limit) {
            if ( queue.length === 0 ) {
                emptyQueuePromise = new Promise(resolve => {onEmptyQueue = resolve});
            }

            return new Promise((resolve, reject) => {
                queue.push({ resolve, reject, currentArgs, currentThis, time: performance.now() })
            })
        }

        running += 1;
        const time = performance.now();
        return async_function.apply(currentThis, currentArgs).finally(() => {
            //console.log("TIME", performance.now() - time);
            running -= 1;
            if ( queue.length > 0 ) {
                const savedTask = queue.shift();
                wrapper.apply(savedTask.currentThis, savedTask.currentArgs).finally(() => {
                    //console.log("QUEUE", performance.now() - savedTask.time);
                }).then(savedTask.resolve, savedTask.reject);
            } else onEmptyQueue();
        });
    }

    async function waitEmptyQueue() {
        return emptyQueuePromise;
    }

    function getRunningCount() {
        return running;
    }

    function getQueueSize(params) {
        return queue.length;
    }


    return [ wrapper, { getQueueSize, getRunningCount, waitEmptyQueue } ];
}


const AsyncUtils = { concurrencyLimiter }

module.exports = { AsyncUtils };