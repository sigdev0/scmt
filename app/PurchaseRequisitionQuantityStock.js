class PurchaseRequisitionQuantityStock extends LazyDB {
	_attr = () => {
		return {
			table 			: 'purchase_requisition_quantity_stocks',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new PurchaseRequisitionQuantityStock()._init();