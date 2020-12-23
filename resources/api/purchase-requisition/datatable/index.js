GET('purchase-requisition-datatable', () => {
    var instance = PurchaseRequisition.instance(),
        columnToSelect = ['purchase_requisitions.id', 'number', 'remarks', 'status', 'processed_date', 'approved_date', 'cancelled_date', 'purchase_requisitions.created_at', 'purchase_requisitions.updated_at', 'locations.id as business_unit_id', 'locations.location_code as business_unit_code', 'locations.description as business_unit_description', 'processors.username as processed_by', 'approvers.username as approved_by', 'cancellers.username as cancelled_by', 'creators.username as created_by', 'updaters.username as updated_by'],
        columnToSearch = ['purchase_requisitions.number', 'purchase_requisitions.remarks'];

    instance.leftJoin('locations', 'locations.id', 'business_unit_id')
            .leftJoin('users as processors', 'processors.id', 'purchase_requisitions.processed_by')
            .leftJoin('users as approvers', 'approvers.id', 'purchase_requisitions.approved_by')
            .leftJoin('users as cancellers', 'cancellers.id', 'purchase_requisitions.cancelled_by')
            .leftJoin('users as creators', 'creators.id', 'purchase_requisitions.created_by')
            .leftJoin('users as updaters', 'updaters.id', 'purchase_requisitions.updated_by');

    res(instance.datatable(columnToSelect, columnToSearch));
});
