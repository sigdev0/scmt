class GoodDeliveryDetail extends LazyDB {
	_attr = () => {
		return {
			table 			: 'good_delivery_details',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new GoodDeliveryDetail()._init();
