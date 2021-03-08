const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve('Data A Loaded'), 1000)
    setTimeout(() => resolve('Data B Loaded'), 2000)
})
// Chain a promise
promise
    .then((firstResponse) => {
        // Return a new value for the next then
        return firstResponse + ' And chaining!'
    })
    .then((secondResponse) => {
        console.log(secondResponse)
    })