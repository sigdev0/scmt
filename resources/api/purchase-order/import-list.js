GET('purchase-order/import-items', () => {
	var instance 		= PurchaseOrderImportHistory.instance();
	
	var limit = req('limit'),
        offset = req('offset'),
        keyword = req('keyword');

    if (!empty(limit)) instance.limit(limit);
    if (!empty(offset)) instance.offset(offset);
    if (!empty(keyword)) instance.whereLike('purchase_requisitions.number', keyword);

	instance.select('purchase_order_id', 'total_item', 'total_success', 'total_failed', 'failed_remarks', 'purchase_order_import_histories.created_at as uploaded_at', 
					'purchase_orders.number as purchase_order_number', 
					'creators.username as uploaded_by', 
					'warehouse.id as warehouse_id', 'warehouse.location_code as warehouse_code', 'warehouse.description as warehouse_description')

			.join('users as creators'   	, 'creators.id' 		, 'purchase_order_import_histories.created_by')
			.join('locations as warehouse' 	, 'warehouse.id' 		, 'warehouse_id')
			.join('purchase_orders' 		, 'purchase_orders.id' 	, 'purchase_order_id')

    res(instance.gets());
});
