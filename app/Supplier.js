class User extends LazyDB {
	_attr = () => {
		return {
			table 			: 'suppliers',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new User()._init();
