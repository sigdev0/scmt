GET('purchase-requisition', () => {
    var result = PurchaseRequisition.instance();

    result 	.select('purchase_requisitions.id', 'number', 'remarks', 'status', 'processed_date', 'approved_date', 'cancelled_date', 'purchase_requisitions.created_at', 'purchase_requisitions.updated_at', 'locations.location_code as business_unit', 'processors.username as processed_by', 'approvers.username as approved_by', 'cancellers.username as cancelled_by', 'creators.username as created_by', 'updaters.username as updated_by')
			.leftJoin('locations', 'locations.id', 'business_unit_id')
			.leftJoin('users as processors', 'processors.id', 'purchase_requisitions.processed_by')
			.leftJoin('users as approvers', 'approvers.id', 'purchase_requisitions.approved_by')
			.leftJoin('users as cancellers', 'cancellers.id', 'purchase_requisitions.cancelled_by')
			.leftJoin('users as creators', 'creators.id', 'purchase_requisitions.created_by')
			.leftJoin('users as updaters', 'updaters.id', 'purchase_requisitions.updated_by');

    var limit = req('limit'),
        offset = req('offset'),
        keyword = req('keyword');

    if (!empty(limit)) result.limit(limit);
    if (!empty(offset)) result.offset(offset);
    if (!empty(keyword)) result.whereLike('purchase_requisitions.number', keyword).orWhereLike('purchase_requisitions.remarks', keyword);

    var purchase_requisitions = [];
    foreach(result.get(), (indexPR, eachPR) => {
        // var details = PRD.instance();

        // details.select('purchase_requisition_details.id', 'quantity', 'target_date', 'purchase_requisition_details.created_at', 'purchase_requisition_details.updated_at', 'product_id', 'product_code', 'products.description', 'location_id', 'location_code', 'locations.description as location_description')
        //     .leftJoin('products', 'products.id', 'product_id')
        //     .leftJoin('locations', 'locations.id', 'location_id')
        //     .where({ purchase_requisition_id: eachPR.id });

		// eachPR.details = details.get() || {};
		
		var details = PurchaseRequisitionDetail	.select('purchase_requisition_details.id', 'quantity', 'target_date', 'purchase_requisition_details.created_at', 'purchase_requisition_details.updated_at', 'product_id', 'product_code', 'products.description', 'location_id', 'location_code', 'locations.description as location_description')
												.leftJoin('products', 'products.id', 'product_id')
												.leftJoin('locations', 'locations.id', 'location_id')
												.where({ purchase_requisition_id: eachPR.id }).get();
		eachPR.details = [];
		foreach(details, (index, each) => {
			each.quantity_fulfilled = PurchaseRequisitionQuantityStock.where('purchase_requisition_detail_id', each.id).sum('quantity_fulfilled');
			each.quantity_left 		= each.quantity - each.quantity_fulfilled;

			eachPR.details.push(each);
		});

        purchase_requisitions.push(eachPR);
    });

    res(purchase_requisitions);
});
