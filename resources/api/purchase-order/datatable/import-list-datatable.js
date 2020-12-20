GET('purchase-order/import-items-datatable', () => {
    var instance 		= PurchaseOrderImportHistory.instance(),
		columnToSelect 	= [ 'purchase_order_id', 'total_item', 'total_success', 'total_failed', 'purchase_order_import_histories.created_at as uploaded_at', 
							'purchase_orders.number as purchase_order_number', 
							'creators.username as uploaded_by', 
							'warehouse.id as warehouse_id', 'warehouse.location_code as warehouse_code', 'warehouse.description as warehouse_description'],
        columnToSearch 	= columnToSelect;

	instance.join('users as creators'   	, 'creators.id' 		, 'purchase_order_import_histories.created_by')
			.join('locations as warehouse' 	, 'warehouse.id' 		, 'warehouse_id')
			.join('purchase_orders' 		, 'purchase_orders.id' 	, 'purchase_order_id')

    res(instance.datatable(columnToSelect, columnToSearch));
});
