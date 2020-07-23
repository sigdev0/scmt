class PurchaseOrderDetail extends LazyDB {
	_attr = () => {
		return {
			table 			: 'purchase_order_details',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new PurchaseOrderDetail()._init();
