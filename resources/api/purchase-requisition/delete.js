DELETE('purchase-requisition/delete/:id', () => {
    var data = param(),
        rule = {
            id: ['required', 'exists:purchase_requisitions']
        };

    validate(data, rule, () => {
		var poDetail = PurchaseOrderDetail.where('purchase_requisition_id', data.id).first();
        if (poDetail) {
            res(`Purchase Requisition with ID of ${param('id')} is being used in PO Details`, 500);
        } else {
            var prdDelete 	= PurchaseRequisitionDetail.delete({ purchase_requisition_id: data.id }),
                prDelete 	= PurchaseRequisition.delete(data);

            if (prdDelete && prDelete) {
                res(`Purchase Requisition with ID '${data.id}' successfully deleted`);
            } else {
                res('Internal server error occured', 500);
            }
        }
    });
});
