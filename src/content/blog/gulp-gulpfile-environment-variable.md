---
title: "How to get environment variables in a gulpfile"
description: "Use an environment variable to build conditional functions in a gulpfile. Really useful for multi-environment configurations."
pubDate: 2015-10-13
updatedDate: 2020-04-09
tags: [development]
---

As described on the [Gulp website](http://gulpjs.com/), this tool allows you to **automate and enhance your workflow** and is
**Easy to Learn**, **Easy to use**, **Efficient** and **High Quality**... I totally agree with this.
But I've been stuck by a small problem in the past few days: how to get an environment variable to build conditional tasks?

## Gulp util install

First of all you need to add a new node dependency called [gulp-util](https://github.com/gulpjs/gulp-util) in your `packages.json` file:

```bash
"devDependencies": {
    "gulp-util": "x.y.z"
},
```

Install it with your favorite command:

```bash
npm install
```

## Use gulp util in your Gulpfile.js

- Require:

```js
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
...
var gutil = require('gulp-util');
```

- Tasks:

```js
gulp.task("stylesheet", function () {
  return gulp
    .src([])
    .pipe(sass())
    .pipe(concat("styles.css"))
    .pipe(gutil.env.env === "prod" ? minifyCss() : gutil.noop())
    .pipe(gulp.dest("web/css"));
});
```

- DRY

It's possible that you have many gulp tasks that need this behavior:

```js
function minifyIfNeeded() {
  return gutil.env.env === "prod" ? minify() : gutil.noop();
}

gulp.task("stylesheet", function () {
  return gulp
    .src([])
    .pipe(sass())
    .pipe(concat("styles.css"))
    .pipe(minifyIfNeeded())
    .pipe(gulp.dest("web/css"));
});
```

## Give gulp configuration through the command line

```bash
gulp stylesheet
gulp --env=prod stylesheet
gulp --env=dev stylesheet
gulp --env=$(ENVIRONMENT_VAR) stylesheet
```

you could change the `--env` option with anything else:

```bash
gulp --type=prod stylesheet
```

and use this in your `Gulpfile.js`:

```js
gulp.task("stylesheet", function () {
  return gulp
    .src([])
    .pipe(sass())
    .pipe(concat("styles.css"))
    .pipe(gutil.env.type === "prod" ? minifyCss() : gutil.noop())
    .pipe(gulp.dest("web/css"));
});
```

## More resources

- [http://www.mikestreety.co.uk/blog/an-advanced-gulpjs-file](http://www.mikestreety.co.uk/blog/an-advanced-gulpjs-file)
- [https://gist.github.com/youknowriad/f90b535d151b2794e42f](https://gist.github.com/youknowriad/f90b535d151b2794e42f)
