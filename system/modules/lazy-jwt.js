module.exports.jwt = new class LazyJWT {
	#jwt 		= require('express-jwt');
	#token 		= require('jsonwebtoken');
	#hash 		= '';
	#enabled 	= '';
	#expiration = '';
	#source 	= '';

	constructor(){
		this.#enabled		= config('jwt.enabled');
		this.#source 		= config('jwt.source');
		

		if(this.#enabled){
			if(this.#source === 'config'){
				this.#hash 			= config('jwt.hash');
				this.#expiration 	= config('jwt.expiration');
			} else {
				this.#hash 			= db('config').where('name', 'jwt_hash').first().props('value');
				this.#expiration 	= db('config').where('name', 'jwt_expiration').first().props('value');
			}
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
		return this.#token.decode(token);
	}

	encode  	= (object) => {
		if(config('jwt.hash') === '' || config('jwt.expiration') === ''){
			console.error(`--- ERROR: JWT configuration not set! ---`);
			return object;
		}
		return this.#token.sign(object, config('jwt.hash'), {expiresIn: config('jwt.expiration')});
	}

	middleware	= () => {
		return this.#jwt({
			secret 		: this.#hash,
			expire 		: this.#expiration,
			algorithms 	: ['RS256']
		});
	}
};
