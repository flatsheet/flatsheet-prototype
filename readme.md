# flatsheet-prototype

> The first version of flatsheet!

This is a prototype. A disposable prototype. It will be used for the first round of user testing, and likely replaced by a more permanent solution.


## What is this?

Have you ever used Google Spreadsheets with something like Tabletop.js to create a sortof ad-hoc mini CMS?

Flatsheet is meant to solve that problem more effectively.

Any time a human needs to edit a dataset regularly and that dataset needs to be exposed as a JSON API, Flatsheet can be your friend. Because a lot of times a full CMS for content like that is overkill, Google Spreadsheets might rate-limit your production app if traffic is big, and the Flatsheet API can be one of the small services in your Service-Oriented Architecture.

Flatsheet is a tool for managing tabular data with a friendly editor and a simple JSON API. The editor allows the creation of rows and columns of data, similar to a spreadsheet. The JSON API exposes that data so it can be easily utilized by websites and applications.

The prototype users Rails, Postgresql, Backbone, and modules from npm.

## What happens next?

The current goals are to improve the editor UI to create the simplest possible editing experience, to create integrations with other tools, like syncing with Google Spreadsheets and dat, and to allow group collaboration on a dataset through the UI.

**Also:**

Conducting user testing with the existing proof of concept version of the project, and iteratively creating new versions of flatsheet based on what's learned from each round of user testing.

Writing documentation, developing API client libraries (the javascript client is in development), creating example projects that show usage of the API, and integrating with related tools.

## API

There are currently two API endpoints.

**To get a list of sheets:** `/api/v1/sheets?username=example`

**To get individual sheets:** `/api/v1/sheets/:id`

###`/api/v1/sheets?username=example` Response example

```
[
  {
    id: 1,
    slug: "tcuxl49owsafl-jgp5qrta",
    name: "Pizza",
    description: "A sheet about pizza.",
    url: "http://flatsheet.herokuapp.com/sheets/tcuxl49owsafl-jgp5qrta"
  }
]
```

###`/api/v1/sheets/:id` Response example

```
{
  id: 1,
    slug: "tcuxl49owsafl-jgp5qrta",
    name: "Pizza",
    description: "A sheet about pizza.",
  rows: [
    {
      toppings: "pepperoni, olive, sausage",
      cheese: "cheddar",
      crust: "deep dish"
    },
    {
      toppings: "salmon, artichoke, basil",
      cheese: "mozzarella",
      crust: "thin"
    }
  ],
  created_at: "2014-04-24T03:22:03.255Z",
  updated_at: "2014-04-24T03:25:14.359Z"
}
```

## Contribute
- Fork the repo
- Clone your fork
- Make a branch of your changes
- Make a pull request through GitHub, and clearly describe your changes


## Install
- Clone your fork of the repository.
- Run `bundle`.
- Setup the postgresql db.
- Run `rake db:migrate`
- Run `npm install`.
- Run `npm start` to start the local server at localhost:3333.

(TODO: comprehensive install instructions)


## License
MIT