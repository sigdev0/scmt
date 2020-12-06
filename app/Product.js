class Product extends LazyDB {
	_attr = () => {
		return {
			table 			: 'products',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new Product()._init();