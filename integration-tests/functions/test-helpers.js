const fetch = require(`node-fetch`)
const execa = require(`execa`)
const fs = require(`fs-extra`)
const path = require(`path`)
const FormData = require("form-data")

export function runTests(env, host) {
  describe(env, () => {
    describe(`routing`, () => {
      test(`top-level API`, async () => {
        const result = await fetch(`${host}/api/top-level`).then(res =>
          res.text()
        )

        expect(result).toMatchSnapshot()
      })
      test(`secondary-level API`, async () => {
        const result = await fetch(
          `${host}/api/a-directory/function`
        ).then(res => res.text())

        expect(result).toMatchSnapshot()
      })
      test(`secondary-level API with index.js`, async () => {
        const result = await fetch(`${host}/api/a-directory`).then(res =>
          res.text()
        )

        expect(result).toMatchSnapshot()
      })
      test(`secondary-level API`, async () => {
        const result = await fetch(`${host}/api/dir/function`).then(res =>
          res.text()
        )

        expect(result).toMatchSnapshot()
      })
      test(`routes with special characters`, async () => {
        const routes = [
          `${host}/api/I-Am-Capitalized`,
          `${host}/api/some whitespace`,
          `${host}/api/with-äöü-umlaut`,
          `${host}/api/some-àè-french`,
          encodeURI(`${host}/api/some-אודות`),
        ]

        for (const route of routes) {
          const result = await fetch(route).then(res => res.text())

          expect(result).toMatchSnapshot()
        }
      })

      test(`dynamic routes`, async () => {
        const routes = [
          `${host}/api/users/23/additional`,
          `${host}/api/dir/super`,
        ]

        for (const route of routes) {
          const result = await fetch(route).then(res => res.json())

          expect(result).toMatchSnapshot()
        }
      })
    })

    describe(`environment variables`, () => {
      test(`can use inside functions`, async () => {
        const result = await fetch(`${host}/api/env-variables`).then(res =>
          res.text()
        )

        expect(result).toEqual(`word`)
      })
    })

    describe(`typescript`, () => {
      test(`typescript functions work`, async () => {
        const result = await fetch(`${host}/api/i-am-typescript`).then(res =>
          res.text()
        )

        expect(result).toMatchSnapshot()
      })
    })

    describe(`response formats`, () => {
      test(`returns json correctly`, async () => {
        const res = await fetch(`${host}/api/i-am-json`)
        const result = await res.json()

        const { date, ...headers } = Object.fromEntries(res.headers)
        expect(result).toMatchSnapshot()
        expect(headers).toMatchSnapshot()
      })
      test(`returns text correctly`, async () => {
        const res = await fetch(`${host}/api/i-am-typescript`)
        const result = await res.text()

        const { date, ...headers } = Object.fromEntries(res.headers)
        expect(result).toMatchSnapshot()
        expect(headers).toMatchSnapshot()
      })
    })

    describe(`functions can send custom statuses`, () => {
      test(`can return 200 status`, async () => {
        const res = await fetch(`${host}/api/status`)

        expect(res.status).toEqual(200)
      })

      test(`can return 404 status`, async () => {
        const res = await fetch(`${host}/api/status?code=404`)

        expect(res.status).toEqual(404)
      })

      test(`can return 500 status`, async () => {
        const res = await fetch(`${host}/api/status?code=500`)

        expect(res.status).toEqual(500)
      })
    })

    describe(`functions can parse different ways of sending data`, () => {
      test(`query string`, async () => {
        const result = await fetch(
          `${host}/api/parser?amIReal=true`
        ).then(res => res.json())

        expect(result).toMatchSnapshot()
      })

      test(`form parameters`, async () => {
        const { URLSearchParams } = require("url")
        const params = new URLSearchParams()
        params.append("a", `form parameters`)
        const result = await fetch(`${host}/api/parser`, {
          method: `POST`,
          body: params,
        }).then(res => res.json())

        expect(result).toMatchSnapshot()
      })

      test(`form data`, async () => {
        const FormData = require("form-data")

        const form = new FormData()
        form.append("a", `form-data`)
        const result = await fetch(`${host}/api/parser`, {
          method: `POST`,
          body: form,
        }).then(res => res.json())

        expect(result).toMatchSnapshot()
      })

      test(`json body`, async () => {
        const body = { a: `json` }
        const result = await fetch(`${host}/api/parser`, {
          method: `POST`,
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
        }).then(res => res.json())

        expect(result).toMatchSnapshot()
      })

      // TODO enable when functions support uploading files.
      // test(`file in multipart/form`, async () => {
      // const { readFileSync } = require("fs")

      // const file = readFileSync(path.join(__dirname, "./fixtures/test.txt"))

      // const form = new FormData()
      // form.append("file", file)
      // const result = await fetch(`${host}/api/parser`, {
      // method: `POST`,
      // body: form,
      // }).then(res => res.json())

      // console.log({ result })

      // expect(result).toMatchSnapshot()
      // })

      // test(`stream a file`, async () => {
      // const { createReadStream } = require("fs")

      // const stream = createReadStream(path.join(__dirname, "./fixtures/test.txt"))
      // const res = await fetch(`${host}/api/parser`, {
      // method: `POST`,
      // body: stream,
      // })

      // console.log(res)

      // expect(result).toMatchSnapshot()
      // })
    })

    // TODO figure out why this gets into endless loops
    // describe.only(`hot reloading`, () => {
    // const fixturesDir = path.join(__dirname, `fixtures`)
    // const apiDir = path.join(__dirname, `../src/api`)
    // beforeAll(() => {
    // try {
    // fs.unlinkSync(path.join(apiDir, `function-a.js`))
    // } catch (e) {
    // // Ignore as this should mostly error with file not found.
    // // We delete to be sure it's not there.
    // }
    // })
    // afterAll(() => {
    // fs.unlinkSync(path.join(apiDir, `function-a.js`))
    // })

    // test(`new function`, cb => {
    // fs.copySync(
    // path.join(fixturesDir, `function-a.js`),
    // path.join(apiDir, `function-a.js`)
    // )
    // setTimeout(async () => {
    // const result = await fetch(
    // `${host}/api/function-a`
    // ).then(res => res.text())

    // console.log(result)
    // expect(result).toMatchSnapshot()
    // cb()
    // }, 400)
    // })
    // })
  })
}
