module.exports.jwt = new class LazyJWT {
	#jwt = require('jsonwebtoken');

	decode  	= (token) => {
		if(config('jwt.hash') === '' || config('jwt.expiration') === ''){
			console.error(`--- ERROR: JWT configuration not set! ---`);
			return token;
		}
		return this.#jwt.decode(token);
	}

	encode  	= (object) => {
		if(config('jwt.hash') === '' || config('jwt.expiration') === ''){
			console.error(`--- ERROR: JWT configuration not set! ---`);
			return object;
		}
		return this.#jwt.sign(object, config('jwt.hash'), {expiresIn: config('jwt.expiration')});
	}
};
