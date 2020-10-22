module.exports.Hash = new class LazyHash {
	
	#bcrypt = null;

	constructor(){
		this.#bcrypt = require('bcryptjs');
	}

	check 	= (string, hash) => {
		return this.#bcrypt.compareSync(string, hash);
	}

	make 	= (string, saltRound = 8) => {
		return this.#bcrypt.hashSync(string, saltRound);
	}
}
