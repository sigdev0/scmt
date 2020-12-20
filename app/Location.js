class Location extends LazyDB {
	_attr = () => {
		return {
			table 			: 'locations',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new Location()._init();