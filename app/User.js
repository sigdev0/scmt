class User extends LazyDB {
	_attr = () => {
		return {
			table 			: 'users',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new User()._init();
