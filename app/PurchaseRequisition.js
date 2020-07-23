class PurchaseRequisition extends LazyDB {
	_attr = () => {
		return {
			table 			: 'purchase_requisitions',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new PurchaseRequisition()._init();
