module.exports = new class LazyPath {
	#path = require('path')

	active = (section = '') => {
		var config = require(this.bpath('config/server'));

		if (section) {
			foreach(split(section, '.'), (index, each) => {
				config = config[each];
			});
		}

		return config[config['active']];
	}

	bpath = (subdir = '') => {
		if(subdir) subdir = '/' + subdir;
		return (this.#path.dirname(require.main.filename || process.mainModule.filename).replace(/\\/gi, '/')) + subdir;
	}

	config = (section = '') => {
		var config = require(this.bpath('config/server'));

		if (section) {
			foreach(split(section, '.'), (index, each) => {
				config = config[each];
			});
		}

		return config;
	}

	spath = (key = '') => {
		return require(bpath('system/path'))[key];
	}

};
