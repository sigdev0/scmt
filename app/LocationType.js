class User extends LazyDB {
	_attr = () => {
		return {
			table 			: 'location_types',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new User()._init();
