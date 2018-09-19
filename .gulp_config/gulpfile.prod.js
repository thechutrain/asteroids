'use strict';

const path = require('path');
const gulp = require('gulp');
const gulpif = require('gulp-if');
// const sourcemaps = require('gulp-sourcemaps');
const inject = require('gulp-inject');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const del = require('del');

function gulpProdFn(gulp, config) {
	// ============ Gulp Helper Tasks =========
	//#region Cleaning tasks
	gulp.task('clean:build', function cleanBuild() {
		return del([`${config.dist_dir}/**/*`]);
	});

	gulp.task('public-prod', function() {
		return gulp
			.src([path.join(config.public_dir, '*.*')])
			.pipe(gulp.dest(config.dist_dir));
	});
	//#endregion

	// ============ HTML tasks =========
	gulp.task('html-prod', function() {
		//NOTE this task must be built after css & js assets get compiled
		const cssSources = gulp.src(path.join(config.dist_css_dir, '**/*.css'), {
			read: false,
		});

		//TEMP: assuming a single bundle.js file, file ordering is not yet addressed
		const jsSources = gulp.src(path.join(config.dist_js_dir, '**/*.js'));

		const ignorePath = path.relative(config.project_root, config.dist_dir);

		return gulp
			.src(path.join(config.src_dir, '/*.html'))
			.pipe(inject(cssSources, { ignorePath }))
			.pipe(inject(jsSources, { ignorePath }))
			.pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
			.pipe(gulp.dest(config.dist_dir));
	});

	// ============ IMAGES tasks =========
	gulp.task('img-prod', function() {
		const relPath = path.relative(config.src_dir, config.src_img_dir);
		return gulp
			.src(`${config.src_img_dir}/**/*.*`)
			.pipe(gulpif(config.prod_img_minify, imagemin()))
			.pipe(gulp.dest(path.join(config.dist_dir, relPath)));
	});
	// ============ CSS tasks =========
	gulp.task('css-build', function() {
		const plugins = [
			autoprefixer({ browsers: ['last 2 versions', '>5%', 'Firefox ESR'] }),
			cssnano(),
		];

		return gulp
			.src(config.src_sass_entry_dir)
			.pipe(
				sass({
					errLogToConsole: true,
				})
			)
			.on('error', sass.logError)
			.pipe(postcss(plugins))
			.pipe(gulp.dest(config.dist_css_dir));
	});

	// ============ JS/Browserify =====
	gulp.task('browserify-build', function() {
		let entryFile = path.join(config.src_js_dir, config.src_js_entry_file);
		const b = browserify({
			entries: [entryFile],
			debug: false,
		});

		return b
			.bundle()
			.on('error', function(e) {
				console.log('Browserify Error');
			})
			.pipe(source('bundle.js'))
			.pipe(buffer())
			.pipe(
				babel({
					presets: ['@babel/env'],
				})
			)
			.pipe(uglify())
			.pipe(gulp.dest(config.dist_js_dir));
	});

	// ============ DEFAULT PROD TASK =====
	// DEFAULT PROD TASK HERE:
	return gulp.series(
		'clean:build',
		gulp.parallel('css-build', 'browserify-build', 'public-prod', 'img-prod'),
		'html-prod'
	);
}

module.exports = exports = gulpProdFn;
