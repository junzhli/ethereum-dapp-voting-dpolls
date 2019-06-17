export const PROMISE_TIMEOUT_MESSAGE = "Promise timeout";

export const promiseTimeout = <T>(ms: number, promise: Promise<T>) => {
    // Create a promise that rejects in <ms> milliseconds
    const timeout = new Promise<T>((resolve, reject) => {
        const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error(PROMISE_TIMEOUT_MESSAGE));
        }, ms);
    });

    // Returns a race between our timeout and the passed in promise
    return Promise.race<Promise<T>>([
        promise,
        timeout,
    ]);
};

const BLOCK_TIME = 14.5;

export const getEstimatedBlockNumber = (currentTime: number, currentBlockHeight: number, futureTime: number) => {
    return currentBlockHeight + Math.round(((futureTime - currentTime) / 1000) / BLOCK_TIME);
};
