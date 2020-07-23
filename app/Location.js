class User extends LazyDB {
	_attr = () => {
		return {
			table 			: 'locations',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new User()._init();
