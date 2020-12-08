const parseJSON = (response: any) =>
  new Promise(resolve =>
    response.json().then(json =>
      resolve({
        status: response.status,
        ok: response.ok,
        json,
      }),
    ),
  )

export const request = (url: string, options: any = {}) =>
  new Promise((resolve, reject) => {
    fetch(url, options)
      .then(parseJSON)
      .then((res: any) => {
        if (res.ok) {
          return resolve(res.json)
        }

        return reject(res.json.meta.error)
      })
      .catch(error =>
        reject({
          networkError: error.message,
        }),
      )
  })
