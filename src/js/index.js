const fetch = require('node-fetch');

// rewrite async
// function loadJson(url) {
//     return fetch(url)
//         .then(response => {
//             if (response.status == 200) {
//                 return response.json();
//             } else {
//                 throw new Error(response.status);
//             }
//         })
// }
//
// async function asyncLoadJson(url) {
//
//     let response = await fetch(url);
//     if (response.status === 200) {
//         let respJson = await response.json();
//         console.log('json: ', respJson)
//         return respJson;
//     }
//
//     throw new Error(response.status)
// }
//
// asyncLoadJson('https://jsonplaceholder.typicode.com/todos/1')
//     .catch(console.log('faulty request'));

// rewrite async 2

class HttpError extends Error {
    constructor(response) {
        super(`${response.status} for ${response.url}`);
        this.name = 'HttpError';
        this.response = response;
    }
}

async function asyncLoadJson(url) {
    let response = await fetch(url);
    if (response.status === 200) {
        let respJson = await response.json();
        return respJson;
    }
    throw new HttpError(response);
}

// Запрашивать логин, пока github не вернёт существующего пользователя.
async function demoGithubUser() {
    let user;

    while(true) {
        let name = prompt("Введите логин?", "iliakan");
        try {
            let githubUser = await asyncLoadJson(`https://api.github.com/users/${name}`);
            alert(`Полное имя: ${githubUser.name}.`);
            return user;

        } catch (err) {
            if (err instanceof HttpError && err.response.status == 404) {
                alert("Такого пользователя не существует, пожалуйста, повторите ввод.");
                return demoGithubUser();
            } else {
                throw err;
            }
        }
    }
}

demoGithubUser('BruceAndyLee')
    .catch();