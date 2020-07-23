module.exports = new class LazyString {

	// camel
	// snake
	// title
	// ucwords

	contains 	= (param, pattern) => {
		return String(param).search(pattern) >= 0;
	}

	containsr 	= (param, pattern) => {
		return String(param).search(new RegExp(pattern, 'g')) >= 0;
	}

	cutl 		= (string, amount) => {
		return this.substr(string, amount, count(string));
	}

	cutr 		= (string, amount) => {
		return this.substr(string, 0, count(string) - amount);
	}

	endsWith 	= (param, filter) => {
		return String(param).endsWith(filter);
	}

	split 	= (string, delimiter) => {
		return String(string).split(delimiter);
	}

	lower 		= (string) => {
		return String(string).toLowerCase();
	}

	replace 	= (param, search, replacement = '') => {
		return String(param).replace(search, replacement);
	}

	replacer 	= (param, search, replacement = '') => {
		return String(param).replace(new RegExp(search, 'gm'));
	}

	subl 		= (string, amount) => {
		return this.substr(string, 0, amount);
	}

	subr 		= (string, amount) => {
		return this.substr(string, string.length - amount, string.length);
	}

	substr 		= (param, from, to) => {
		return String(param).substring(from, to);
	}

	substring 	= (param, from, to) => {
		return String(param).substring(from, to);
	}

	startsWith 	= (param, filter) => {
		return String(param).startsWith(filter);
	}

	title 		= (string) => {
		var capitalized = '',
			phrase      = String(string).toLowerCase().trim().split(' ');

		for(var i = 0; i < phrase.length ; i++){
			capitalized += String(phrase[i]).toUpperCase().substring(0, 1) + String(phrase[i]).toLowerCase().substring(1) + ' ';
		}

		return String(capitalized).trim();
	}

	trim 		= (param, char = '') => {

		if (char) {
			while(this.startsWith(param, char)){
				param = this.cutl(param, char.length);
			}
			while(this.endsWith(param, char)){
				param = this.cutr(param, char.length);
			}

			return param;
		}

		return String(param).trim();
	}

	triml		= (param, char = '') => {
		while(this.startsWith(param, char)){
			param = this.cutl(param, char.length);
		}

		return param;
	}
	
	trimr		= (param, char = '') => {
		while(this.endsWith(param, char)){
			param = this.cutr(param, char.length);
		}

		return param;
	}

	upper 		= (string) => {
		return String(string).toUpperCase();
	}

	words 		= (string, count, suffix = '...') => {
		var word 	= '',
			words 	= this.split(string, ' ');

		for(var i = 0; i < count; i++){
			word += words[i] + ' ';
		}

		return this.trim(word) + suffix;
	}

}
