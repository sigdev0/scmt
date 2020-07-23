class PurchaseRequisitionDetail extends LazyDB {
	_attr = () => {
		return {
			table 			: 'purchase_requisition_details',
			primaryColumn 	: 'id'
		}
	}
}

module.exports = new PurchaseRequisitionDetail()._init();
