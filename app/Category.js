class Category extends LazyDB {
	_attr = () => {
		return {
			table 			: 'categories',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new Category()._init();
