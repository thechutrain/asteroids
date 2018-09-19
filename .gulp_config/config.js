'use strict';

const path = require('path');
const defaultConfig = require('./config.default');
// let userConfig = {};

// TEMP: will need to reconsider how we merge objects with nested properties & arrays
const config = Object.assign({}, defaultConfig);

// takes configuration object, fixes all relative urls --> absolute
function createConfig(rootDir) {
	// Set Project Root:
	config.project_root = rootDir || config.project_root;
	const objKeys = Object.keys(config);

	// Convert main dir --> abs paths
	const mainDirRegex = /^src_dir$|^temp_dir$|^dist_dir$|^public_dir$/gi;
	const mainDirs = objKeys.filter(key => key.match(mainDirRegex));
	mainDirs.forEach(path_key => {
		config[path_key] = path.join(rootDir, config[path_key]);
	});

	// Convert sub dir --> abs path
	const subDirRegex = /^src_.+dir$|^temp_.+dir$|^dist_.+dir$/gi;
	const subDirs = objKeys.filter(key => key.match(subDirRegex));
	subDirs.forEach(path_key => {
		let full_path;
		const dir_match = (path_key.match(/^src|^temp|^dist|^public/) || [])[0];

		switch (dir_match) {
			case 'src':
				full_path = path.join(config.src_dir, config[path_key]);
				break;
			case 'temp':
				full_path = path.join(config.temp_dir, config[path_key]);
				break;
			case 'dist':
				full_path = path.join(config.dist_dir, config[path_key]);
				break;
			default:
				throw new Error('Subdirectory not found');
				break;
		}

		config[path_key] = full_path;
	});

	// console.log(config);
	return config;
}

//TODO: update the createConfig fn so that it takes in the pathname
// of where the folders belong etc.
//TESTING
// createConfig(path.join(__dirname, '..'));

module.exports = exports = createConfig;
