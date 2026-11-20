---
title: "Merge Less, Sass and CSS into a single file with Gulp"
description: "Merging Less, Sass and plain CSS into one stylesheet with Gulp is not obvious. Here is a gulpfile that outputs a single minified CSS file."
pubDate: 2015-10-22
updatedDate: 2020-04-09
tags: [development]
---

Sometimes when working on "frontend tasks" with gulp,
we need to merge different formats such as **less**, **scss**, **css** into a single minified css file.

![Gulp](../../assets/posts/gulp.gif)

## Modules

**Of course you have to install and require the good modules:**

```js
{
  "name": "project",
  "version": "0.1.0",
  "main": "gulpfile.js",
  "dependencies": {},
  "devDependencies": {
    "gulp": "^3.9.0",
    "gulp-concat": "^2.6.0",
    "gulp-less": "^3.0.3",
    "gulp-minify-css": "^1.2.1",
    "gulp-sass": "^2.0.4",
    "merge-stream": "^1.0.0"
  }
}

```

```js
var gulp = require("gulp");
var sass = require("gulp-sass");
var less = require("gulp-less");
var concat = require("gulp-concat");
var minify = require("gulp-minify-css");
var merge = require("merge-stream");
```

## Task

To do this we need to have multiple steps inside the gulp task.

- LESS:

```js
var lessStream = gulp.src([...])
    .pipe(less())
    .pipe(concat('less-files.less'))
;
```

- SCSS/SASS:

```js
var scssStream = gulp.src([...])
    .pipe(sass())
    .pipe(concat('scss-files.scss'))
;
```

- CSS:

```js
var cssStream = gulp.src([...])
    .pipe(concat('css-files.css'))
;
```

- The final gulp task:

```js
gulp.task('build/admin', function() {

    var lessStream = gulp.src([...])
        .pipe(less())
        .pipe(concat('less-files.less'))
    ;

    var scssStream = gulp.src([...])
        .pipe(sass())
        .pipe(concat('scss-files.scss'))
    ;

    var cssStream = gulp.src([...])
        .pipe(concat('css-files.css'))
    ;

    var mergedStream = merge(lessStream, scssStream, cssStream)
        .pipe(concat('styles.css'))
        .pipe(minify())
        .pipe(gulp.dest('web/css'));

    return mergedStream;
});
```
