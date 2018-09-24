'use strict';

const path = require('path');
const gulp = require('gulp');
const gulpif = require('gulp-if');
const htmlmin = require('gulp-htmlmin');
const inject = require('gulp-inject');
const sourcemaps = require('gulp-sourcemaps');
const imagemin = require('gulp-imagemin');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const watchify = require('watchify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const del = require('del');
const browserSync = require('browser-sync');

function gulpDevFn(gulp, config) {
	// ============ CLEANING tasks =========
	//#region Cleaning tasks
	gulp.task('clean:temp-css', function cleanTempCss() {
		return del([config.temp_css_dir]);
	});

	gulp.task('clean:temp-js', function cleanTempJs() {
		return del([config.temp_js_dir]);
	});

	gulp.task('clean:temp-html', function() {
		return del([path.join(config.temp_dir, '*.html')]);
	});

	gulp.task(
		'clean-temp',
		gulp.parallel('clean:temp-html', 'clean:temp-css', 'clean:temp-js')
	);

	gulp.task(
		'clean-temp',
		gulp.parallel('clean:temp-html', 'clean:temp-css', 'clean:temp-js')
	);
	//#endregion

	// ============ PUBLIC tasks =========
	// moves all files from public into root directory of dev server
	gulp.task('public-dev', function() {
		return gulp
			.src([path.join(config.public_dir, '*.*')])
			.pipe(gulp.dest(config.temp_dir));
	});

	// ============ HTML tasks =========
	gulp.task('inject-assets', function() {
		//Moves all html files into dev root dir, injects css and js assets
		//NOTE this task must be built after css & js assets get compiled
		const cssSources = gulp.src(path.join(config.temp_css_dir, '**/*.css'), {
			read: false,
		});

		//TEMP: assuming a single bundle.js file, file ordering is not yet addressed
		const jsSources = gulp.src(path.join(config.temp_js_dir, '**/*.js'));

		const ignorePath = path.relative(config.project_root, config.temp_dir);

		return gulp
			.src(path.join(config.src_dir, '/*.html'))
			.pipe(inject(cssSources, { ignorePath }))
			.pipe(inject(jsSources, { ignorePath }))
			.pipe(
				gulpif(
					config.dev_html_minify,
					htmlmin({
						collapseWhitespace: config.dev_html_collapse_whitespace,
						removeComments: config.dev_html_remove_comments,
					})
				)
			)
			.pipe(gulp.dest(config.temp_dir));
	});

	// ============ IMAGES tasks =========
	gulp.task('img-dev', function() {
		const relPath = path.relative(config.src_dir, config.src_img_dir);
		return gulp
			.src(`${config.src_img_dir}/**/*.*`)
			.pipe(gulpif(config.dev_img_minify, imagemin()))
			.pipe(gulp.dest(path.join(config.temp_dir, relPath)));
	});

	// ============ CSS tasks =========
	gulp.task('scss', function() {
		var sass_config = {
			errLogToConsole: true,
			outputStyle: 'expanded',
		};

		const plugins = [
			autoprefixer({ browsers: ['last 2 versions', '>5%', 'Firefox ESR'] }),
		];

		return gulp
			.src(config.src_sass_entry_dir)
			.pipe(sourcemaps.init())
			.pipe(sass(sass_config).on('error', sass.logError))
			.pipe(postcss(plugins))
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(config.temp_css_dir));
	});

	// ============ JS/Browserify =====
	//#region browserify() && watchify()
	gulp.task('browserify', function() {
		let entryFile = path.join(config.src_js_dir, config.src_js_entry_file);
		const b = browserify({
			entries: [entryFile],
			debug: true,
		});

		return b
			.bundle()
			.on('error', function(e) {
				// console.log(`Browserify error: ${e}`);
			})
			.pipe(source('bundle.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init())
			.pipe(
				babel({
					presets: ['@babel/env'],
				})
			)
			.pipe(sourcemaps.write())
			.pipe(gulp.dest(config.temp_js_dir));
	});

	gulp.task('watchify', function() {
		let entryFile = path.join(config.src_js_dir, config.src_js_entry_file);
		const opts = Object.assign({}, watchify.args, {
			entries: [entryFile],
			debug: true,
			//https://github.com/browserify/watchify/issues/312
			cache: {}, // required by watchify plugin
			packageCache: {}, // required by watchify plugin
		});
		var bWatcher = watchify(browserify(opts));
		bWatcher.on('update', bundle);
		// bWatcher.on('log', log => {
		// 	console.log(`LOG: ${log}`);
		// });
		bWatcher.on('error', e => {
			console.log(`Watchify error: ${e}`);
		});

		function bundle() {
			// console.log('BUNDLING ...');
			return bWatcher
				.bundle()
				.on('error', function(e) {
					console.log(`Browserify error: ${e}`);
				})
				.pipe(source('bundle.js'))
				.pipe(buffer())
				.pipe(sourcemaps.init())
				.pipe(
					babel({
						presets: ['@babel/env'],
					})
				)
				.pipe(sourcemaps.write())
				.pipe(gulp.dest(config.temp_js_dir))
				.pipe(server.reload({ stream: true }));
			// TODO: gulp-notify
		}

		return bundle();
	});
	//#endregion

	// ============ Hot reload =====
	//#region hotreload
	const server = browserSync.create();

	function reload(done) {
		server.reload();
		done();
	}

	function serve(done) {
		server.init({
			server: {
				baseDir: config.temp_dir,
			},
		});
		done();
	}

	gulp.task('htmlWatcher', function() {
		const htmlDir = path.join(config.src_dir, '/*.html');
		const htmlWatcher = gulp.watch(
			htmlDir,
			gulp.series('clean:temp-html', 'inject-assets', reload)
		);
		htmlWatcher.on('change', function(filename) {
			console.log(`File: ${filename} changed!, running tasks ...`);
		});

		return htmlWatcher;
	});

	gulp.task('scssWatcher', function() {
		const scssWatcher = gulp.watch(
			config.src_sass_dir,
			gulp.series('clean:temp-css', 'scss', reload)
		);
		scssWatcher.on('change', function(filename) {
			console.log(`File: ${filename} changed!, running tasks ...`);
		});

		return scssWatcher;
	});

	gulp.task('jsWatcher', function() {
		const jsWatcher = gulp.watch(
			config.src_js_dir,
			// gulp.series('browserify', reload)
			gulp.series('browserify', reload)
		);
		jsWatcher.on('change', function(filename) {
			console.log(`File: ${filename} changed!, running tasks ...`);
		});
		return jsWatcher;
	});
	//#endregion

	// ============ DEFAULT DEV TASK =====
	// DEFAULT DEV TASK HERE:
	return gulp.series(
		'clean-temp',
		'public-dev', // copies public/ dir over
		'scss', // compiles css --> scss
		'watchify', // compiles js --> browserify
		'inject-assets', // pipes html & injects assets
		'img-dev',
		serve,
		gulp.parallel('htmlWatcher', 'scssWatcher', 'jsWatcher')
	);
}

module.exports = exports = gulpDevFn;
