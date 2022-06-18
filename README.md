# librusjs

[![npm](https://img.shields.io/npm/v/librusjs.svg?style=flat)](https://www.npmjs.com/package/librusjs)
[![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat)](http://opensource.org/licenses/MIT)

Javascript library to interact with librus api, and present complete data in nice way

## FULL TYPESCRIPT SUPPORT!

doesnt work in browser because of cors

tested and works in node and react native

## Installation:

```
npm install librusjs
```

## Usage

```javascript
import Librus from 'librusjs'
// or const Librus = require('librusjs').default

Librus("username", "password")
.then( (session) => {
  session.getLuckyNumber().then( (num) => /* ... */);

  session.getAccountInfo().then( (accInfo) => /* ... */);

  session.getGrades().then( (grades) => /* ... */);

  // getMostRecent?: boolean, lastXDays?: number
  // both are optional, add to output
  // most recently added grade and grades from last 7 days
  session.getGrades(true, 7).then( (grades) => /* ... */);

  // current week + includes school free days
  session.getTimetable().then( (timetable) => /* ... */);

  // optional - get timetable from other week
  session.getTimetable("2022-06-20").then( (timetable) => /* ... */);
})
.catch( (err) => {
  // Failed to auth!
  console.log(err);
});
```
