GET('purchase-requisition/list-order/:id', () => {
    var data = param(),
        rule = {
            id : ['exists:purchase_requisition_details,id']
        };
    
    validate(data, rule, () => {
		var result = PurchaseRequisitionQuantityStock	.select('purchase_orders.id as purchase_order_id', 'purchase_orders.number as purchase_order_number', 'purchase_orders.reference as purchase_order_reference', 'purchase_requisition_quantity_stocks.quantity_fulfilled as quantity_fulfilled')
														.join('purchase_order_details', 'purchase_requisition_quantity_stocks.purchase_order_detail_id', 'purchase_order_details.id')
														.join('purchase_orders', 'purchase_orders.id', 'purchase_order_details.purchase_order_id')
														
														.groupBy('purchase_orders.id', 'purchase_orders.number', 'purchase_orders.reference', 'purchase_requisition_quantity_stocks.quantity_fulfilled')
														.where('purchase_requisition_quantity_stocks.purchase_requisition_detail_id', data.id)
														.whereNotNull('purchase_requisition_quantity_stocks.quantity_fulfilled')
														.get()

		res(result);
    });
});
