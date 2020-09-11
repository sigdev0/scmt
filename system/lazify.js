module.exports = new class Lazify {

	constructor() {

		/* Base Level */
		this.#assign('./modules/lazy-data');
		this.#assign('./modules/lazy-string');
		this.#assign('./modules/lazy-function');
		this.#assign('./modules/lazy-path');
		this.#assign('./modules/lazy-file');
		this.#assign('./modules/lazy-storage');
		this.#assign('./modules/lazy-rest');
		this.#assign('./modules/lazy-jwt');
		this.#assign('./modules/lazy-db');
		this.#assign('./modules/lazy-validator');

		/* Server Level */
		this.#assign('./modules/lazy-express');

		this.#autoRegisterModel();
	}

	/* Base Function */
	#assign = (object) => {
		object = require(object);

		var keys = Object.keys(object);
		for (var i = 0; i < keys.length; i++) {
			global[keys[i]] = object[keys[i]];
		}
	};

	#autoRegisterModel = () => {
		if(config('db.active')){
			var primaries = {};
			File.list('app', (file, staticPath, dynamicPath) => {
				var modelName = replace(file, '.js', '');
				if(File.isFile(staticPath) && endsWith(file, 'js')){
					var model = require(staticPath);
					primaries[model._attr().table] = model._attr().primaryColumn;
					global[modelName] = model;
				} 
			});

			global.primaries = primaries;
		} else {
			console.log('Note : Database is not set to active, app models will not be autoregistered');
		}
	}
};
