'use strict';
const path = require('path');

module.exports = {
	//#region project directory structure
	project_root: path.join(__dirname, '../'),

	// Source directory
	src_dir: 'src',
	src_html_dir: '.', //html directory, relative to src_dir
	// TODO: ADD FLEXIBILITY FOR SCSS OR SASS
	src_sass_entry_dir: 'assets/sass/*.scss', //sass or scss directory relative to src
	src_sass_dir: 'assets/sass/**/*.*', // watch files
	src_js_dir: 'scripts/', //js directory relative to src
	src_js_entry_file: 'index.js',
	src_img_dir: 'assets/images',

	// Temp directory, development server
	temp_dir: '.temp',
	temp_css_dir: 'assets/css', //css directory, relative to temp_dir
	temp_js_dir: 'scripts',
	// temp_img_dir: 'assets/images'

	// Distribution directory
	dist_dir: 'dist',
	dist_css_dir: 'assets/css',
	dist_js_dir: 'scripts',
	// dist_img_dir: 'assets/images',

	// Public directory:
	public_dir: 'public',

	// ======= Development server config ==========
	dev_html_minify: false,
	dev_html_collapse_whitespace: false,
	dev_html_remove_comments: false,

	dev_img_minify: false,

	// ======= Production Build config ==========
	prod_img_minify: true,

	//#endregion

	//TODO: setting for css file order with injections
};
