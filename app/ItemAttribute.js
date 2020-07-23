class ItemAttribute extends LazyDB {
	_attr = () => {
		return {
			table 			: 'items_attribut',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new ItemAttribute()._init();
