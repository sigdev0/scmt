class PurchaseOrder extends LazyDB {
	_attr = () => {
		return {
			table 			: 'purchase_orders',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new PurchaseOrder()._init();
