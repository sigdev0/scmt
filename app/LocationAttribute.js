class User extends LazyDB {
	_attr = () => {
		return {
			table 			: 'location_attrs',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new User()._init();
