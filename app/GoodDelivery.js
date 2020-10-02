class GoodDelivery extends LazyDB {
	_attr = () => {
		return {
			table 			: 'good_deliveries',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new GoodDelivery()._init();
