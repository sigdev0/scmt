module.exports = new class LazyFunction {
	
	#dateFormat = null;
	#moment 	= null;
	#md5 		= null;
	#sha1 		= null;
	#uuid 		= null;
	#sync 		= null;
	#voca 		= null;

	constructor(){
		this.#sync 			= require('deasync');
		this.#dateFormat    = require('dateformat');
		this.#moment    	= require('moment-timezone');
		this.#md5 			= require('md5');
		this.#sha1 			= require('sha1');
		this.#uuid 			= require('uuid').v1;
		this.#voca 			= require('voca');
	}

	count 			= (param) => {
		if(typeof param === 'string' || typeof param === 'number'){
			return String(param).length;
		} else if(typeof param === 'object'){
			return Object.keys(param).length;
		}

		return 0;
	}

	dateFormat 		= (date, format) => {
		return this.#dateFormat(date, format);
	}

	empty 			= (param) => {
		var isEmptyArray    = typeof param === 'object'     && param !== null && Array.isArray(param) && !param.length,
			isEmptyObject   = typeof param === 'object'     && param !== null && !Object.keys(param).length,
			isEmptyString   = typeof param === 'string'     && !param.length,
			isFalse         = typeof param === 'boolean'    && !param,
			isNull          = param === null,
			isZero          = typeof param === 'number'     && param === 0,
			isUndefined     = typeof param === 'undefined';
	
		return (isEmptyArray || isEmptyObject || isEmptyString || isFalse || isNull || isZero || isUndefined);
	}

	foreach 		= (collection, callback) => {
		var keys = Object.keys(collection);

		for(var i = 0; i < keys.length; i++){
			callback(isNumeric(keys[i]) ? parseInt(keys[i]) : keys[i], collection[keys[i]]);
		}
	}

	hasKey 			= (param, filter) => {
		var keys = Object.keys(param);
		for(var i = 0 ; i < keys.length; i++){
			if(keys[i] === filter) return true;
		}

		return false;
	}

	hasValue 		= (param, search) => {
		var values = Object.values(param);
		for(var i = 0 ; i < values.length; i++){
			if(values[i] === search) return true;
		}

		return false;
	}

	isIn 			= (param, haystack) => {
		var filters = Object.values(haystack);
		for(var i = 0 ; i < filters.length; i++){
			if(filters[i] === param) return true;
		}

		return false;
	}

	isAlpha 		=  (param) => {
		return String(param).search('^[\\s+a-zA-Z]+$') >= 0;
	}

	isAlphaDash 	= (param) => {
		return String(param).search('^[-_\\s+a-zA-Z]+$') >= 0;
	}

	isAlphaNumeric  = (param) => {
		return String(param).search('^[0-9a-zA-Z]+$') >= 0;
	}

	isEmail 		=  (param) => {
		return String(param).search('^[a-zA-Z_\\.]+@[a-zA-Z]+(\\.[a-zA-Z]+)+$') >= 0;
	}

	isFloat 		=  (param) => {
		return !isNaN(parseFloat(param)) && String(param).search('^[0-9]+(\\.{1}[0-9]+){0,1}$') >= 0 ;
	}

	isFunction      = (param) => {
		return typeof param === 'function';
	}

	isNumeric       = (param) => {
		return typeof param === 'number' || String(param).search('\\D+') === -1;
	}

	isNull 			= (param) => {
		return param === null;
	}

	isObject        = (param) => {
		return typeof param === 'object';
	}

	isString        = (param) => {
		return typeof param === 'string';
	}
	
	keys 		= (param) => {
		return Object.keys(param);
	}

	log 		= (content, dir = '') => {
		var logName 	= `logs/${dir ? dir + '/' : ''}${dateFormat(new Date, 'yymmdd-HHMM-ssl')}.log`,
			success 	= File.write(logName, content);

		return success ? logName : 'error';
	}

	md5 		= (param) => {
		return this.#md5(param);
	}

	now 		= (withTime = false) => {
		return this.#moment().tz('Asia/Jakarta').format(`YYYY-MM-DD${withTime ? ' HH:mm:ss' : ''}`);
	}

	random 		= (length = 4, pattern = '0123456789') => {
		var result = '';
		for (var i = 0; i < length; i++ ) {
			result += pattern.charAt(Math.floor(Math.random() * pattern.length));
		}
		return result;
	};

	sha1 		= (param) => {
		return this.#sha1(param);
	}

	size 		= (param) => {
		if(typeof param === 'string' || typeof param === 'number'){
			return String(param).length;
		} else if(typeof param === 'object'){
			return Object.keys(param).length;
		}

		return 0;
	}

	sync 		= (condition) => {
		this.#sync.loopWhile(condition);
	}

	uuid 		= () => {
		return this.#uuid();
	}

	values 		= (param) => {
		return Object.values(param);
	}

	voca 		= () => {
		return this.#voca;
	}
	

}
