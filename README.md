# Static Site Boilerplate

> gulp-powered static site boilerplate to get up and running

## Table of contents

- [Getting Started](#getting-started)
- [Deploying](#deploying)
  - [Surge](#surge)
  - [Github pages](#github-pages)
- [Build With](#build-with)
- [License](#license)

## Getting Started

### installing

Make sure you have node v8.11.4 or higher installed. May work on older versions as well.

```
$ git clone git@github.com:thechutrain/gulp-sass-boilerplate.git
$ npm install
$ npm dev
```

## Deploying

### Surge

Make sure you have surge installed globally `npm i -g surge` and have set up an account with them

Then, run the `surge` command locally and ensure that the project points to your `dist/` folder.

You can either pick a custom domain name or use the random url surge generates. Once you have confirmed that your site is properly deployed live, update the `publish:surge` scripts command in the `package.json` to reflect your new domain name.

### Github Pages

## Built With

## License

This project is licensed under the MIT License
