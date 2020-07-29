if (config('db.active') && global.knex == null) {
	global.knexLog 	= false;
	global.knex 	=  require('knex')({
		client 		: config('db.client'),
		connection 	: {
			host  		: config('db.host'),
			port  		: config('db.port'),
			user		: config('db.username'),
			password 	: config('db.password'),
			database 	: config('db.database'),
			schema		: config('db.schema')
		}
	});

	if (config('db.logging') && !knexLog) {
		knex.on('query', (rawQuery) => {
			var query = rawQuery.sql;

			foreach(rawQuery.bindings, (i, each) => {
				query = replace(query, '?', `'${each}'`, false);
			});

			console.log(query);
		});

		knexLog = true;
	}
}

class LazyDB {

	#attributes 	= {};
	#knex 			= null;
	#table 			= null;
	#hasCondition 	= false;
	#logging		= false;

	constructor(attributes = {}){
		this.#attributes = attributes;
	}

	_attr				= () => {
		return this.#attributes;
	}

	_init 				= () => {
		this.#hasCondition 	= false;

		if (config('db.client') === 'postgres') {
			this.#knex = knex(this._attr().table).withSchema(config(`db.schema`));
		} else {
			this.#knex = knex(this._attr().table);
		}

		// this.#knex 			= knex(this._attr().table);

		return this;
	}

	instance 			= () => {
		var instance = new LazyDB(this._attr());
		instance._init();

		return instance;
	}

	from 				= (param) => {
		var instance = new LazyDB(this._attr());
		foreach(param, (key, value) => {
			instance[key] = value;
		});
		instance._init();

		return instance;
	}

	primary 			= () => {
		return this._attr().primaryColumn;
	}

	/* Prop Function */
	empty  				= () => {
		return empty(this.props());
	}

	props 				= (key = '') => {
		var props = {};
		foreach(this, (name, value) => {
			if(typeof value !== 'function') props[name] = value;
		});

		return empty(key) ? props : props[key];
	}

	/* CRUD Action */
	add 				= (data = {}, condition = {}) => {	
		var //condition 		= this.#refineCondition({condition : condition, pkDefiner : condition}),
			message 		= null,
			
			column 			= keys(data)[0],
			value 			= values(data)[0],
			
			conditionColumn = keys(condition)[0],
			conditionValue 	= values(condition)[0];

		this.#knex.where(condition).increment(column, value).then((result) => {
			message = `Success [db.add]`;
		}).catch((error) => {
			message = `${String(error).toLowerCase().replace('error: ', 'ERROR [db.sub] : ')}`;
		});

		sync(() => message === null); this._init();

		return message;
	}

	delete              = (...callback) => {
		var message     = null,
			condition   = count(callback) > 0 ? callback[0] : {},
			onSuccess   = count(callback) > 1 ? callback[1] : (result)  => {},
			onError     = count(callback) > 2 ? callback[2] : (message) => { typeof res !== 'undefined' && typeof res === 'function' ? res(message, 500) : console.error(message); };

		// if (this.#processable) {
			condition 		= Object.assign(this.props(), condition);
			// condition 	    = this.#refineCondition(condition);

			var column 		= keys(condition)[0],
				value 		= values(condition)[0];

			if(!this.#hasCondition) this.#knex.where(condition);

			this.#knex.delete().then((result) => {
				message = `Success [db.delete] : ` + JSON.stringify(condition);
				onSuccess(message);
			}).catch((error) => { 
				message = false;
				onError(`${String(error).toLowerCase().replace('error: ', 'ERROR [db.delete] : ')}`);
			});
			
			sync(() => message === null); this._init();

			// console.log(message);
			return message;

			// return {
			// 	success : !startsWith(message, 'ERROR'),
			// 	body    : message
			// };
		// } else {
		// 	return {
		// 		success : false,
		// 		body    : this.#error
		// 	};
		// }
	}

	insert              = (...callback) => {
		var message     = null,
			data        = count(callback) > 0 ? callback[0] : {},
			onSuccess   = count(callback) > 1 ? callback[1] : (result) 	=> {},
			onError     = count(callback) > 2 ? callback[2] : (message) => { typeof res !== 'undefined' && typeof res === 'function' ? res(message, 500) : console.error(message) };

		// if (this.#processable) {
		data = Object.assign(this.props(), data);

		var action = null;

		if(config('db.client') === 'mysql'){
			action = this.#knex.insert(data);
		} else {
			action = this.#knex.returning('id').insert(data);
		}

		action.then((result) => {
			message = result[0];
			onSuccess(message);
		}).catch((error) => {
			message = false;
			onError(`${String(error).toLowerCase().replace('error: ', 'ERROR [eloquent.insert] : ')}`);
		});

		sync(() => message === null); this._init();

		if(message){
			var result = new LazyDB(this._attr());
			foreach(this.where({id : message}).first(), (key, value) => {
				result[key] = value;
			})

			result._init();
			message = result;
		}

		return message;

		// 	return {
		// 		success : !$.startsWith(message, 'ERROR'),
		// 		body    : message
		// 	};
		// } else {
		// 	onError(this.#error);

		// 	return {    
		// 		success : false,
		// 		body    : this.#error
		// 	};
		// }
	}

	save 				= (...param) => {
		var isUpdate = hasKey(this._attr(), 'primaryColumn') && !empty(this.props(this._attr().primaryColumn));
		return isUpdate ? this.update(param) : this.insert(param);

	}

	sub 				= (data = {}, condition = {}) => {	
		var //condition 		= this.#refineCondition({condition : condition, pkDefiner : condition}),
			message 		= null,
			
			column 			= keys(data)[0],
			value 			= values(data)[0],
			
			conditionColumn = keys(condition)[0],
			conditionValue 	= values(condition)[0];

		this.#knex.where(condition).decrement(column, value).then((result) => {
			message = `Success [db.sub]`;
		}).catch((error) => {
			message = `${String(error).toLowerCase().replace('error: ', 'ERROR [db.sub] : ')}`;
		});

		sync(() => message === null); this._init();

		return message;
	}

	truncate            = (...callback) => {
		var message     = null,
			onSuccess   = count(callback) > 0 ? callback[0] : (result) 	=> {},
			onError     = count(callback) > 1 ? callback[1] : (message) => { typeof res !== 'undefined' && typeof res === 'function' ? res(message, 500) : console.error(message) };

		// if (this.#processable) {
		this.#knex.truncate().then((result) => {
			// console.log(result);
			message = result;
			onSuccess(message);
		}).catch((error) => { 
			message = false;
			onError(`${String(error).toLowerCase().replace('error: ', 'ERROR [db.truncate]: ')}`);
		});

		sync(() => message === null); this._init();

		return message;

		// return {
		// 	success : !startsWith(message, 'ERROR'),
		// 	body    : message
		// };
		// } else {
		// 	onError(this.#error);

		// 	return {
		// 		success : false,
		// 		body    : this.#error
		// 	};
		// }
		
	}

	update              = (...param) => {
		var message     = null,
			data 		= count(param) > 0 ? param[0] : {},
			condition 	= count(param) > 1 ? param[1] : {},
			onSuccess   = count(param) > 2 ? param[2] : (result)  => { },
			onError   	= count(param) > 3 ? param[3] : (message) => { typeof res !== 'undefined' && typeof res === 'function' ? res(message, 500) : console.error(message) },
			primary 	= hasKey(this._attr(), 'primaryColumn') ? this._attr().primaryColumn : false;

		if(primary && empty(condition) && hasKey(this.props(), primary)){
			condition = {};
			condition[primary] = this.props(primary);
		}
		//  else {
			// console.log(`LazyDB : No primary key found, will use defined condition instead`);
		// }

		// if (this.#processable) {
		// condition   = this.#refineCondition(condition);
		data 		= Object.assign(this.props(), data);
		
		// delete data[primary];

		if(!this.#hasCondition) this.#knex.where(condition);

		this.#knex.update(data).then((result) => {
			message = 'success';
			onSuccess(message);
		}).catch((error) => {
			message = false;
			onError(`${String(error).toLowerCase().replace('error: ', 'ERROR [db.update]: ')}`);
		});
		
		sync(() => message === null); this._init();
		if(message === 'success'){
			message = this.where(condition).first();
		}

		return message;

		// 	return {
		// 		success : !$.startsWith(message, 'ERROR'),
		// 		body    : message
		// 	};
		// } else {
		// 	onError(this.#error);

		// 	return {
		// 		success : false,
		// 		body    : this.#error
		// 	};
		// }
	}

	/* Column Selection */
	distinct            = (...column) => {
		this.#knex.distinct(column);
		return this;
	}

	select              = (...column) => {
		this.#knex.column(column);
		return this;
	}

	/* Select Action */
	avg                 = (...param) => {
		var message     = null,
			column 		= param[0],
			onSuccess   = count(param) > 1 ? param[1] : (result) => {},
			onError     = count(param) > 2 ? param[2] : (message) => { typeof res !== 'undefined' && typeof res === 'function' ? res(message, 500) : console.error(message); };

		// if (this.#processable) {
			
		this.#knex.avg(column).then((result) => {
			message = +values(result[0]);
			onSuccess(message);
		}).catch((error) => {
			message = false;
			onError(`${String(error).toLowerCase().replace('error: ', 'ERROR: [db.avg]')}`);
		});

		sync(() => message === null); this._init();

		return message;

		// 	return {
		// 		success : !$.startsWith(message, 'ERROR'),
		// 		body    : message
		// 	};
		// } else {
		// 	onError(this.#error);

		// 	return {
		// 		success : false,
		// 		body    : this.#error
		// 	};
		// }
	}

	count               = (...callback) => {
		var message     = null,
			onSuccess   = count(callback) > 1 ? callback[1] : (result) => {},
			onError     = count(callback) > 2 ? callback[2] : (message) => { typeof res !== 'undefined' && typeof res === 'function' ? res(message, 500) : console.error(message); };

		// if (this.#processable) {

		this.#knex.count().then((result) => {
			message = +values(result[0]);
			onSuccess(message);
		}).catch((error) => {
			message = false;
			onError(`${String(error).toLowerCase().replace('error: ', 'ERROR [db.count]: ')}`);
		});

		sync(() => message === null); this._init();

		return message;

		// 	return {
		// 		success : !$.startsWith(message, 'ERROR'),
		// 		body    : message
		// 	};
		// } else {
		// 	onError(this.#error);

		// 	return {
		// 		success : false,
		// 		body    : this.#error
		// 	};
		// }
	}

	exists              = (...callback) => {
		var message     = null,
			onSuccess   = count(callback) > 1 ? callback[1] : (result) => {},
			onError     = count(callback) > 2 ? callback[2] : (message) => { typeof res !== 'undefined' && typeof res === 'function' ? res(message, 500) : console.error(message); };

		// if (this.#processable) {

		this.#knex.first().then((result) => {
			message = !typeof result === 'undefined';
			onSuccess(message);
		}).catch((error) => {
			message = false;
			onError(`${String(error).toLowerCase().replace('error: ', 'ERROR [db.exists]: ')}`);
		});

		sync(() => message === null); this._init();
	
		return message;

		// 	return {
		// 		success : !$.startsWith(message, 'ERROR'),
		// 		body    : message
		// 	};
		// } else {
		// 	onError(this.#error);

		// 	return {
		// 		success : false,
		// 		body    : this.#error
		// 	};
		// }
	}

	find 				= (value) => {
		// if(!$.isEmpty(this.#info.primary)){
		if (hasKey(this._attr(), 'primaryColumn')) {
			var primaryColumn = this._attr().primaryColumn;
	
			return this.where(primaryColumn, value).first();
		} else {
			console.error('Error [LazyDB] : cannot use `find` function if no primary key is defined');
		}
		// } else {
		// 	console.log(`ERROR [db.find] : No primary column found in table ${this.#info.table}`);
		// }

		return this;
	}

	first               = (...callback) => {
		var message 	= null,
			onSuccess   = count(callback) === 1 ? callback[0] : (result) => {},
			onError     = count(callback) === 2 ? callback[1] : (message) => { typeof res !== 'undefined' && typeof res === 'function' ? res(message, 500) : console.error(message) };

		// if (this.#processable) {
		this.#knex.first().then((result) => {
			message = typeof result === 'undefined' ? false : result;
		}).catch((error) => {
			message = false;
			onError(`${String(error).toLowerCase().replace('error: ', 'ERROR [db.first]: ')}`);
		});

		sync(() => message === null); this._init();

		if (message) {
			var entity = new LazyDB(this._attr());
			foreach(message, (key, value) => {
				entity[key] = value;
			});

			entity._init();
			message = entity;
			onSuccess(message);
		}

		return message;

			// return {
			// 	success : !startsWith(message, 'ERROR'),
			// 	body    : message
			// };
		// } else {
		// 	onError(this.#error);

		// 	return {
		// 		success : false,
		// 		body    : this.#error
		// 	};
		// }
		
	}

	get                 = (...callback) => {
		var message     = null,
			onSuccess   = count(callback) == 1  ? callback[0] : (result)  => {},
			onError     = count(callback) == 2  ? callback[1] : (message) => { typeof res !== 'undefined' && typeof res === 'function' ? res(message, 500) : console.error(message) };

		// if (this.#processable) {

		this.#knex.then((result) => {
			message  = result;
		}).catch((error) => {
			message = false;
			onError(`${String(error).toLowerCase().replace('error: ', 'ERROR [db.get]: ')}`);
		});

		sync(() => message === null); this._init();

		if(message){
			var entities = [];
			foreach(message, (i, each) => {
				var entity = new LazyDB(this._attr());
				foreach(each, (key, value) => {
					entity[key] = value;
				});
				
				entity._init();
				entities.push(entity);
			});      

			message = entities;
			onSuccess(message);
		}

		return message;
			// return {
			// 	success : !startsWith(message, 'ERROR'),
			// 	body    : message
			// };
		// } else {
		// 	onError(this.#error);

		// 	return {
		// 		success : false,
		// 		body    : this.#error
		// 	};
		// }
		
	}

	max                 = (...param) => {
		var message     = null,
			column 		= param[0],
			onSuccess   = count(param) > 1 ? param[1] : (result) => {},
			onError     = count(param) > 2 ? param[2] : (message) => { typeof res !== 'undefined' && typeof res === 'function' ? res(message, 500) : console.error(message); };

		// if (this.#processable) {

			this.#knex.max(column).then((result) => {
				message = +values(result[0]);
				onSuccess(message);
			}).catch((error) => {
				message = false;
				onError(`${String(error).toLowerCase().replace('error: ', 'ERROR [db.max]: ')}`);
			});
	
			sync(() => message === null); this._init();

			return message;

		// 	return {
		// 		success : !$.startsWith(message, 'ERROR'),
		// 		body    : message
		// 	};
		// } else {
		// 	onError(this.#error);

		// 	return {
		// 		success : false,
		// 		body    : this.#error
		// 	};
		// }
	}

	min                 = (...param) => {
		var message     = null,
			column 		= param[0],
			onSuccess   = count(param) > 1 ? param[1] : (result) => {},
			onError     = count(param) > 2 ? param[2] : (message) => { typeof res !== 'undefined' && typeof res === 'function' ? res(message, 500) : console.error(message); };

		// if (this.#processable) {
		this.#knex.min(column).then((result) => {
			message = +values(result[0]);
			onSuccess(message);
		}).catch((error) => {
			message = `${String(error).toLowerCase().replace('error: ', 'ERROR [db.min]: ')}`;
			onError(message);
		});

		sync(() => message === null); this._init();

		return message;

		// 	return {
		// 		success : !$.startsWith(message, 'ERROR'),
		// 		body    : message
		// 	};
		// } else {
		// 	onError(this.#error);

		// 	return {
		// 		success : false,
		// 		body    : this.#error
		// 	};
		// }
	}

	sum                 = (...param) => {
		var message     = null,
			column 		= param[0],
			onSuccess   = count(param) > 1 ? param[1] : (result) => {},
			onError     = count(param) > 2 ? param[2] : (message) => { typeof res !== 'undefined' && typeof res === 'function' ? res(message, 500) : console.error(message); };

		// if (this.#processable) {
		this.#knex.sum(column).then((result) => {
			message = +values(result[0]);
			onSuccess(message);
		}).catch((error) => {
			message = false;
			onError(`${String(error).toLowerCase().replace('error: ', 'ERROR [db.sum]: ')}`);
		});

		sync(() => message === null); this._init();

		return message;

	// 		return {
	// 			success : !$.startsWith(message, 'ERROR'),
	// 			body    : message
	// 		};
	// 	} else {
	// 		onError(this.#error);

	// 		return {
	// 			success : false,
	// 			body    : this.#error
	// 		};
	// 	}
	}	

	/* Limit & Offset */
	limit               = (limit) => {
		this.#knex.limit(limit);
		return this;
	}

	offset              = (offset) => {
		this.#knex.offset(offset);
		return this;
	}

	/* Grouping & Ordering */
	groupBy             = (...column) => {
		this.#knex.groupBy(column);
		return this;
	}

	orderBy             = (column, order) => {
		this.#knex.orderBy(column, order);
		return this;
	}

	/* Join */
	fullOuterJoin       = (table, column1, column2) => {
		this.#knex.fullOuterJoin(table, column1, column2);
		return this;
	}

	innerJoin           = (table, column1, column2) => {
		this.#knex.innerJoin(table, column1, column2);
		return this;
	}

	join                = (table, column1, column2) => {
		this.#knex.innerJoin(table, column1, column2);
		return this;
	}

	leftJoin            = (table, column1, column2) => {
		this.#knex.leftJoin(table, column1, column2);
		return this;
	}

	leftOuterJoin       = (table, column1, column2) => {
		this.#knex.leftOuterJoin(table, column1, column2);
		return this;
	}

	rightJoin           = (table, column1, column2) => {
		this.#knex.rightJoin(table, column1, column2);
		return this;
	}

	rightOuterJoin      = (table, column1, column2) => {
		this.#knex.rightOuterJoin(table, column1, column2);
		return this;
	}
	
	/* Having */
	having              = (column, operator, value) => {
		this.#knex.having(column, operator, value);
		this.#hasCondition = true;
		return this;
	}

	havingBetween       = (column, value) => {
		this.#knex.havingBetween(column, value);
		this.#hasCondition = true;
		return this;
	}

	havingIn            = (column, value) => {
		this.#knex.havingIn(column, value);
		this.#hasCondition = true;
		return this;
	}

	havingNotBetween    = (column, value) => {
		this.#knex.havingNotBetween(column, value);
		this.#hasCondition = true;
		return this;
	}

	havingNotIn         = (column, value) => {
		this.#knex.havingNotIn(column, value);
		this.#hasCondition = true;
		return this;
	}

	havingNotNull       = (column) => {
		this.#knex.havingNotNull(column);
		this.#hasCondition = true;
		return this;
	}

	havingNull          = (column) => {
		this.#knex.havingNotIn(column);
		this.#hasCondition = true;
		return this;
	}

	havingRaw           = (column, operator, value) => {
		this.#knex.havingRaw(column, operator, value);
		this.#hasCondition = true;
		return this;
	}
	
	/* Where OR */
	orWhere             = (column, operator, value) => {
		this.#knex.orWhere(column, operator, value);
		this.#hasCondition = true;
		return this;
	}

	orWhereBetween      = (column, range) => {
		this.#knex.orWhereBetween(column, range);
		this.#hasCondition = true;
		return this;
	}

	orWhereIn           = (column, value) => {
		this.#knex.orWhereIn(column, value);
		this.#hasCondition = true;
		return this;
	}

	orWhereLike         = (column, value) => {
		value = String(value).replace(`"`,``).replace(`'`,``).toLowerCase();

		this.#knex.orWhere(knex.raw(`LOWER(${column}) LIKE '%${value}%'`));
		this.#hasCondition = true;
		return this;
	}

	orWhereNull         = (column) => {
		this.#knex.orWhereNull(column);
		this.#hasCondition = true;
		return this;
	}
	
	orWhereRaw          = (query, value) => {
		this.#knex.orWhereRaw(query, value);
		this.#hasCondition = true;
		return this;
	}

	orWhereNot          = (column, operator, value) => {
		this.#knex.orWhereNot(column, operator, value);
		this.#hasCondition = true;
		return this;
	}    

	orWhereNotIn        = (column, value) => {
		this.#knex.orWhereNotIn(column, value);
		this.#hasCondition = true;
		return this;
	}

	orWhereNotNull      = (column) => {
		this.#knex.orWhereNotNull(column);
		this.#hasCondition = true;
		return this;
	}

	orWhereNotBetween   = (column, range) => {
		this.#knex.orWhereNotBetween(column, range);
		this.#hasCondition = true;
		return this;
	}

	/* Where */
	where               = (column, operator, value) => {
		if(typeof value === 'undefined'){
			value       = operator;
			operator    = "=";
		}

		if(typeof column === 'function') this.#knex.where(column); else this.#knex.where(column, operator, value);
		this.#hasCondition = true;
		return this;
	}

	whereBetween        = (column, range) => {
		if(typeof column === 'function') this.#knex.whereBetween(column); else this.#knex.whereBetween(column, range);
		this.#hasCondition = true;
		return this;
	}

	whereIn             = (column, value) => {
		if(typeof column === 'function') this.#knex.whereIn(column); else this.#knex.whereIn(column, value);
		this.#hasCondition = true;
		return this;
	}

	whereLike           = (column, value) => {
		value = String(value).replace(`"`,``).replace(`'`,``).toLowerCase();

		if(typeof column === 'function') this.#knex.where(column); else this.#knex.where(knex.raw(`LOWER(${column}) LIKE '%${value}%'`));
		this.#hasCondition = true;
		return this;
	}

	whereNull           = (column) => {
		this.#knex.whereNull(column);
		this.#hasCondition = true;
		return this;
	}
	
	whereRaw            = (query, value) => {
		this.#knex.whereRaw(query, value);
		this.#hasCondition = true;
		return this;
	}

	whereNot            = (column, operator, value) => {
		this.#knex.whereNot(column, operator, value);
		this.#hasCondition = true;
		return this;
	}    

	whereNotIn          = (column, value) => {
		this.#knex.whereNotIn(column, value);
		this.#hasCondition = true;
		return this;
	}

	whereNotNull        = (column) => {
		this.#knex.whereNotNull(column);
		this.#hasCondition = true;
		return this;
	}

	whereNotBetween     = (column, range) => {
		this.#knex.whereNotBetween(column, range);
		this.#hasCondition = true;
		return this;
	}
}

module.exports.query 	= (...param) => {
	if(global.knex){
		var message 	= null,
			query 		= param[0],
			onSuccess 	= count(param) > 1 ? param[1] : (result) => {},
			onError 	= count(param) > 2 ? param[2] : (message) => { typeof res !== 'undefined' && typeof res === 'function' ? res(message, 500) : console.error(message) };

			knex.raw(query).then((result) => {
				// console.log(result);
				if(config('db.client') === 'postgres'){
					message = result.rows;
				} else if(config('db.client') === 'mysql'){
					message = result[0];
				}
		}).catch((error) => {
			message = false;
			onError(`${String(error).toLowerCase().replace('error: ', 'ERROR [db.query]: ')}`);
		});

		sync(() => message === null);

		if(message){
			var entities = [];
			foreach(message, (i, each) => {
				// var param   = Object.assign(this.#info, {skipPrimary : true}),
				// 	entity  = new Eloquent(param);
				var entity = {};
				foreach(each, (key, value) => {
					entity[key] = value;
				});

				entities.push(entity);
			});

			message = entities;
		}

		return {
			first 	: () => {
				return message[0];
			},
			get 	: () => {
				return message;
			}
		};
	} else {
		console.error('knex is not initialized');
	}
};

module.exports.db 		= (table) => {
	var instance = new LazyDB({
		table 			: table,
		primaryColumn 	: primaries[table]
	});
	return instance._init();
};

module.exports.LazyDB	= LazyDB;
