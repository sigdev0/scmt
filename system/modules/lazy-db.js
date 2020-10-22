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

	global.raw 		= (query, binding) => {
		// console.log('binding');
		// console.log(knex.raw(query, binding));
		return knex.raw(query, binding);
	}

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

global.primaries = {};

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

	getQuery(){
		return this.#knex.toSQL().sql;
	}

	/* Clear */
	clearSelect 		= () => {
		this.#knex.clearSelect();
		return this;
	}

	clearWhere 			= () => {
		this.#knex.clearWhere();
		return this;
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
			var result 			= new LazyDB(this._attr()),
				primaryValue	= hasKey(data, this.primary()) ? data[this.primary()] : message;

			foreach(this.where({id : primaryValue}).first(), (key, value) => {
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
		// console.log('in');
		if(count(column) === 1 && Array.isArray(column[0])){
			console.log('array');
			foreach(column[0], (i, each) => {
				this.#knex.column(each);
			});
		} else {
			this.#knex.column(column);
		}
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
			message = +values(empty(result) ? [0] : result[0]);
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

	datatable 			= (columnToSelect, columnToSearch) => {
		this.select(columnToSelect);

		var keyword = req('search').value;
		if(!empty(keyword)) {
			foreach(columnToSearch, (index, each) => {
				if(i(index) == 0){
					this.whereLike(each, keyword);
				} else {
					this.orWhereLike(each, keyword);
				}
			});
		}

		this.limit(req('length'));
		this.offset(req('start'));
		this.orderBy(columnToSelect[i(req('order')[0].column)], req('order')[0].dir)


		var recordsTotal 	= this.instance().count(),
			recordsFiltered = this.instance().clearSelect().count(),
			data 			= [];

		foreach(this.get(), (index, row) => {
			row.index = (i(req('length')) * i(req('start'))) + (i(index) + 1);
			data.push(row.props());
		});

		return {
			draw 			: req('draw'),
			recordsTotal 	: recordsTotal,
			recordsFiltered : recordsFiltered,
			data 			: data
		};
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
		if(typeof column === 'function') this.#knex.having(column); else this.#knex.having(column, operator, value);
		this.#hasCondition = true;
		return this;
	}

	havingBetween       = (column, value) => {
		if(typeof column === 'function') this.#knex.havingBetween(column); else this.#knex.havingBetween(column, value);
		this.#hasCondition = true;
		return this;
	}

	havingIn            = (column, value) => {
		if(typeof column === 'function') this.#knex.havingIn(column); else this.#knex.havingIn(column, value);
		this.#hasCondition = true;
		return this;
	}

	havingNotBetween    = (column, value) => {
		if(typeof column === 'function') this.#knex.havingNotBetween(column); else this.#knex.havingNotBetween(column, value);
		this.#hasCondition = true;
		return this;
	}

	havingNotIn         = (column, value) => {
		if(typeof column === 'function') this.#knex.havingNotIn(column); else this.#knex.havingNotIn(column, value);
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
		if(typeof column === 'function') this.#knex.orWhere(column); else this.#knex.orWhere(column, operator, value);
		this.#hasCondition = true;
		return this;
	}

	orWhereBetween      = (column, range) => {
		if(typeof column === 'function') this.#knex.orWhereBetween(column); else this.#knex.orWhereBetween(column, range);
		this.#hasCondition = true;
		return this;
	}

	orWhereIn           = (column, value) => {
		if(typeof column === 'function') this.#knex.orWhereIn(column); else this.#knex.orWhereIn(column, value);
		this.#hasCondition = true;
		return this;
	}

	orWhereLike         = (column, value) => {
		// value = String(value).replace(`"`,``).replace(`'`,``).toLowerCase();

		this.#knex.orWhereRaw(`LOWER(:column:) LIKE :value`, {column : column, value : `%${value}%`});
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
		if(typeof column === 'function') this.#knex.orWhereNot(column); else this.#knex.orWhereNot(column, operator, value);
		this.#hasCondition = true;
		return this;
	}    

	orWhereNotIn        = (column, value) => {
		if(typeof column === 'function') this.#knex.OrWhereNotIn(column); else this.#knex.orWhereNotIn(column, value);
		this.#hasCondition = true;
		return this;
	}

	orWhereNotNull      = (column) => {
		this.#knex.orWhereNotNull(column);
		this.#hasCondition = true;
		return this;
	}

	orWhereNotBetween   = (column, range) => {
		if(typeof column === 'function') this.#knex.orWhereNotBetween(column); else this.#knex.orWhereNotBetween(column, range);
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
		// value = String(value).replace(`"`,``).replace(`'`,``).toLowerCase();

		// this.#knex.where(knex.raw(`LOWER(${column}) LIKE '%${value}%'`));
		
		this.#knex.whereRaw(`LOWER(:column:) LIKE :value`, {column : column, value : `%${value}%`});
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
		if(typeof column === 'function') this.#knex.whereNot(column); else this.#knex.whereNot(column, operator, value);
		this.#hasCondition = true;
		return this;
	}    

	whereNotIn          = (column, value) => {
		if(typeof column === 'function') this.#knex.whereNotIn(column); else this.#knex.whereNotIn(column, value);
		this.#hasCondition = true;
		return this;
	}

	whereNotNull        = (column) => {
		this.#knex.whereNotNull(column);
		this.#hasCondition = true;
		return this;
	}

	whereNotBetween     = (column, range) => {
		if(typeof column === 'function') this.#knex.whereNotBetween(column); else this.#knex.whereNotBetween(column, range);
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

module.exports.db 		= (table, primaryColumn) => {
	var instance = new LazyDB({
		table 			: table,
		primaryColumn 	: primaries[table] || primaryColumn
	});
	return instance._init();
};

module.exports.LazyDB	= LazyDB;
