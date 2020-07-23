class Item extends LazyDB {
	_attr = () => {
		return {
			table 			: 'items',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new Item()._init();
