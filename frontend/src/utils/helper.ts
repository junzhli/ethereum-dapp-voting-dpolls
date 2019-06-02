export const PROMISE_TIMEOUT_MESSAGE = "Promise timeout";

export const promiseTimeout = (ms: number, promise: Promise<any>) => {
    // Create a promise that rejects in <ms> milliseconds
    const timeout = new Promise((resolve, reject) => {
        const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error(PROMISE_TIMEOUT_MESSAGE));
        }, ms);
    });

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
        promise,
        timeout,
    ]);
};
