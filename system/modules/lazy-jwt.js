module.exports.jwt = new class LazyJWT {
	#jwt 		= require('jsonwebtoken');
	#hash 		= '';
	#enabled 	= '';
	#expiration = '';
	#source 	= '';

	constructor(){
		this.#source 		= config('jwt.source');
		this.#hash 			= config('jwt.hash');
		this.#enabled		= config('jwt.enabled');
		this.#expiration	= config('jwt.expiration');

		if(this.#source === 'database'){
			this.#hash 			= db('config').where('name', 'jwt_hash').first();
			this.#enabled 		= db('config').where('name', 'jwt_enabled').first();
			this.#expiration 	= db('config').where('name', 'jwt_expiration').first();

			if(this.#hash) 			this.#hash 			= this.#hash.props('value');
			if(this.#enabled) 		this.#enabled 		= this.#enabled.props('value') === 'true';
			if(this.#expiration) 	this.#expiration 	= this.#expiration.props('value');
		}
	}

	debug		= () => {
		console.log(`JWT Hash : ${this.#hash}`);
		console.log(`JWT Enabled : ${this.#enabled}`);
		console.log(`JWT Expiration : ${this.#expiration}`);
	}

	enabled 	= () => {
		return this.#enabled;
	}

	expiration 	= () => {
		return this.#expiration;
	}

	hash 		= () => {
		return this.#hash;
	}

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
