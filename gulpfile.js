'use strict';

const path = require('path');
const gulp = require('gulp');

const config = require('./.gulp_config/config')(path.join(__dirname));
const gulpDevFn = require('./.gulp_config/gulpfile.dev')(gulp, config);
const gulpProdFn = require('./.gulp_config/gulpfile.prod')(gulp, config);

gulp.task('dev', gulpDevFn);

gulp.task('build', gulpProdFn);
