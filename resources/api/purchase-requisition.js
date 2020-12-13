const   PR  = PurchaseRequisition,
        PRD = PurchaseRequisitionDetail,
        PO  = PurchaseOrder,
        POD = PurchaseOrderDetail;

/* PR Details */
GET('purchase-requisition/:id', () => {
    var data = param(),
        rule = {
            id: ['required', 'exists:purchase_requisitions']
        };

    validate(data, rule, () => {
        var pr = PR.select('purchase_requisitions.id', 'number', 'remarks', 'status', 'processed_date', 'approved_date', 'cancelled_date', 'purchase_requisitions.created_at', 'purchase_requisitions.updated_at', 'locations.id as business_unit_id', 'locations.location_code as business_unit', 'processors.username as processed_by', 'approvers.username as approved_by', 'cancellers.username as cancelled_by', 'creators.username as created_by', 'updaters.username as updated_by')
            .leftJoin('locations', 'locations.id', 'business_unit_id')
            .leftJoin('users as processors', 'processors.id', 'purchase_requisitions.processed_by')
            .leftJoin('users as approvers', 'approvers.id', 'purchase_requisitions.approved_by')
            .leftJoin('users as cancellers', 'cancellers.id', 'purchase_requisitions.cancelled_by')
            .leftJoin('users as creators', 'creators.id', 'purchase_requisitions.created_by')
            .leftJoin('users as updaters', 'updaters.id', 'purchase_requisitions.updated_by')
            .where('purchase_requisitions.id', data.id).first(),

            prDetails = PRD.select('purchase_requisition_details.id', 'quantity', 'target_date', 'purchase_requisition_details.created_at', 'purchase_requisition_details.updated_at', 'product_id', 'product_code', 'products.description', 'location_id', 'location_code', 'locations.description as location_description')
            .leftJoin('products', 'products.id', 'product_id')
            .leftJoin('locations', 'locations.id', 'location_id')
            .where({ purchase_requisition_id: pr.id }).get();

        pr.details = prDetails;

        res(pr);
    });
});

/* PR List */
GET('purchase-requisition', () => {
    var pr = PR.instance();

    pr.select('purchase_requisitions.id', 'number', 'remarks', 'status', 'processed_date', 'approved_date', 'cancelled_date', 'purchase_requisitions.created_at', 'purchase_requisitions.updated_at', 'locations.location_code as business_unit', 'processors.username as processed_by', 'approvers.username as approved_by', 'cancellers.username as cancelled_by', 'creators.username as created_by', 'updaters.username as updated_by')
        .leftJoin('locations', 'locations.id', 'business_unit_id')
        .leftJoin('users as processors', 'processors.id', 'purchase_requisitions.processed_by')
        .leftJoin('users as approvers', 'approvers.id', 'purchase_requisitions.approved_by')
        .leftJoin('users as cancellers', 'cancellers.id', 'purchase_requisitions.cancelled_by')
        .leftJoin('users as creators', 'creators.id', 'purchase_requisitions.created_by')
        .leftJoin('users as updaters', 'updaters.id', 'purchase_requisitions.updated_by');

    var limit = req('limit'),
        offset = req('offset'),
        keyword = req('keyword');

    if (!empty(limit)) pr.limit(limit);
    if (!empty(offset)) pr.offset(offset);
    if (!empty(keyword)) pr.whereLike('purchase_requisitions.number', keyword).orWhereLike('purchase_requisitions.remarks', keyword);

    var purchase_requisitions = [];
    foreach(pr.get(), (indexPR, eachPR) => {
        var details = PRD.instance();

        details.select('purchase_requisition_details.id', 'quantity', 'target_date', 'purchase_requisition_details.created_at', 'purchase_requisition_details.updated_at', 'product_id', 'product_code', 'products.description', 'location_id', 'location_code', 'locations.description as location_description')
            .leftJoin('products', 'products.id', 'product_id')
            .leftJoin('locations', 'locations.id', 'location_id')
            .where({ purchase_requisition_id: eachPR.id });

        eachPR.details = details.get() || {};

        purchase_requisitions.push(eachPR);
    });

    res(purchase_requisitions);
});

/* PR List Datatable */
GET('purchase-requisition-datatable', () => {
    var instance = PR.instance(),
        columnToSelect = ['purchase_requisitions.id', 'number', 'remarks', 'status', 'processed_date', 'approved_date', 'cancelled_date', 'purchase_requisitions.created_at', 'purchase_requisitions.updated_at', 'locations.location_code as business_unit', 'processors.username as processed_by', 'approvers.username as approved_by', 'cancellers.username as cancelled_by', 'creators.username as created_by', 'updaters.username as updated_by'],
        columnToSearch = ['purchase_requisitions.number', 'purchase_requisitions.remarks'];

    instance.leftJoin('locations', 'locations.id', 'business_unit_id')
            .leftJoin('users as processors', 'processors.id', 'purchase_requisitions.processed_by')
            .leftJoin('users as approvers', 'approvers.id', 'purchase_requisitions.approved_by')
            .leftJoin('users as cancellers', 'cancellers.id', 'purchase_requisitions.cancelled_by')
            .leftJoin('users as creators', 'creators.id', 'purchase_requisitions.created_by')
            .leftJoin('users as updaters', 'updaters.id', 'purchase_requisitions.updated_by');

    res(instance.datatable(columnToSelect, columnToSearch));
});

/* PR Insert */
POST('purchase-requisition/insert', () => {
    var data = req('remarks', 'status', 'created_by', 'status', 'business_unit_id'),
        rule = {
            // number      : ['required', 'unique:purchase_requisitions'],
            status      : ['required', 'in:cancel,draft,submitted,approved,rejected'],
            created_by  : ['required', 'exists:users,id']
        };

    validate(data, rule, () => {
        data.id = PR.max('id') + 1;
        // data.status = req('status');
        // data.photo = req().file('photo').save('photos/');

        data.number     = `PR-${moment().format('YYYYMMDD-HHmmss')}-${data.created_by}`;
        data.created_at = now(true);
        data.updated_at = now(true);

        var purchase_requisition = PR.insert(data);

        if (purchase_requisition) {
            // console.log(req('details'));
            for (var i = 0; i < count(req('details')); i++) {
                var detail = PRD.instance();
                detail.id = PRD.max('id') + 1;
                detail.quantity = req('details')[i]['quantity'];
                detail.target_date = req('details')[i]['target_date'];
                detail.created_at = now(true);
                detail.updated_at = now(true);
                detail.product_id = req('details')[i]['product_id'];
                detail.location_id = req('details')[i]['location_id'];
                detail.purchase_requisition_id = purchase_requisition.id

                detail.insert();
            }

            res(purchase_requisition);
        } else {
            res('Internal server error occured', 500);
        }
    });
});

/* PR Update */
PUT('purchase-requisition/update', () => {
    var data = req('id', 'number', 'remarks', 'status', 'updated_by', 'business_unit_id'),
        rule = {
            id          : ['required', 'exists:purchase_requisitions'],
            number      : ['required', 'unqiue:purchase_requisitions,number,id,' + data.number],
            updated_by  : ['required', 'exists:users,id'],
            status      : ['required', 'in:cancel,draft,submitted,approved,rejected'],
        };

    validate(data, rule, () => {
        var condition = { id: data.id };

        data.updated_at = now(true);
        delete data.id;

        var purchase_requisition = PR.update(data, condition);

        if (purchase_requisition) {
            for (var i = 0; i < count(req('details')); i++) {
                var detailCondition = { id: req('details')[i]['id'] },
                    detailData = {
                        quantity: req('details')[i]['quantity'],
                        target_date: req('details')[i]['target_date'],
                        updated_at: now(true),
                        product_id: req('details')[i]['product_id'],
                        location_id: req('details')[i]['location_id'],
                        purchase_requisition_id: purchase_requisition.id,
                    };

                PRD.update(detailData, detailCondition);
            }

            res(purchase_requisition);
        } else {
            res('Internal server error occured', 500);
        }
    });
});

/* PR Delete */
DELETE('purchase-requisition/delete/:id', () => {
    var data = param(),
        rule = {
            id: ['required', 'exists:purchase_requisitions']
        };

    validate(data, rule, () => {
        var poDetail = POD.find(data.id);
        if (poDetail) {
            res(`Purchase Requisition with ID of ${param('id')} is being used in PO Details`, 500);
        } else {
            var prdDelete = PRD.delete({ purchase_requisition_id: data.id }),
                prDelete = PR.delete(data);

            if (prdDelete && prDelete) {
                res(`Purchase Requisition with ID '${data.id}' successfully deleted`);
            } else {
                res('Internal server error occured', 500);
            }
        }
    });
});

/* Set Approval, Cancel and Process */
PUT('purchase-requisition/set-status/:action/:id', () => {
    var data = Object.assign(param(), req().all()),
        rule = {
            id      : ['required', 'exists:purchase_requisitions'],
            action  : ['required', 'in:approve,cancel,process'],
            user    : ['required', 'exists:users,id']
        };

    validate(data, rule, () => {
        var purchase_requisition = PR.find(data.id),
            action = '';

        purchase_requisition.approved_date  = null;
        purchase_requisition.approved_by    = null;
        purchase_requisition.cancelled_date = null;
        purchase_requisition.cancelled_by   = null;
        purchase_requisition.processed_date = null;
        purchase_requisition.processed_by   = null;

        if (data.action === 'approve') {
            action = 'approved';
            purchase_requisition.status = 'approved';
            purchase_requisition.approved_date = now(true);
            purchase_requisition.approved_by = data.user;
        } else if (data.action === 'cancel') {
            action = 'cancelled';
            purchase_requisition.status = 'cancelled';
            purchase_requisition.cancelled_date = now(true);
            purchase_requisition.cancelled_by = data.user;
        } else if (data.action === 'process') {
            action = 'processed';
            purchase_requisition.status = 'processed';
            purchase_requisition.processed_date = now(true);
            purchase_requisition.processed_by = data.user;
        }

        console.log(purchase_requisition.props());
        if (purchase_requisition.update()) {
            res(`Purchase Requisition with ID '${data.id}' successfully '${action}'`);
        } else {
            res('Internal server error occured', 500);
        }
    });
});

/*
 *
 * Details
 *
 */

/* PR Details Datatable */
GET('purchase-requisition-details-datatable/:id', () => {
    var data = param(),
        rule = {
            id : ['required', 'exists:purchase_requisitions']
        };
    
    validate(data, rule, () => {
        var columnToSelect  = ['purchase_requisition_details.id', 'quantity', 'target_date', 'purchase_requisition_details.created_at', 'purchase_requisition_details.updated_at', 'product_id', 'product_code', 'products.description', 'location_id', 'location_code', 'locations.description as location_description']
            columnToSearch  = ['product_code', 'location_code'],
            keyword         = req('search').value,
            length          = req('length'),
            start           = req('start'),
            orderBy         = i(req('order')[0].column),
            orderType       = req('order')[0].dir;
            // keyword         = '',
            // length          = 10,
            // start           = 0,
            // orderBy         = '-',
            // orderType       = '-';

        var whereQuery  = '',
            orderQuery  = '',
            limitQuery  = `LIMIT ${length} OFFSET ${start}`;

        foreach(columnToSearch, (index, each) => {
            whereQuery += (i(index) === 0 ? '' : ' OR ') + `${each} LIKE '%${keyword}%'`;
        });

        if(orderBy !== '-' && orderType !== '-'){
            orderQuery = `ORDER BY ${columnToSelect[orderBy]} ${orderType}`;
        }

        var recordsTotal    = PRD.instance().count(),
        
            recordsFiltered = query(`SELECT COUNT(*) AS total
                                     FROM dev.purchase_requisition_details
                                     JOIN dev.products  ON products.id  = product_id
                                     JOIN dev.locations ON locations.id = location_id
                                     WHERE purchase_requisition_id = '${data.id}'`).first().total,

            rawResult       = query(`SELECT ${columnToSelect.join(', ')}
                                     FROM dev.purchase_requisition_details
                                     JOIN dev.products  ON products.id  = product_id
                                     JOIN dev.locations ON locations.id = location_id
                                     WHERE purchase_requisition_id = '${data.id}' AND (${whereQuery})
                                     ${orderQuery}
                                     ${limitQuery}`).get();

        var result = [];
        foreach(rawResult, (index, row) => {
            row.index = (i(length)) * i(start) + (i(index) + 1);
			result.push(row);
        });
        
        res({
            draw 			: req('draw'),
			recordsTotal 	: recordsTotal,
			recordsFiltered : recordsFiltered,
			data 			: result
        });
    });
});

/* PR Details Update */
PUT('purchase-requisition-details/update/:id', () => {
    var condition   = param(),
        rule        = {
            id : ['required', 'exists:purchase_requisition_details']
        };
    
    validate(condition, rule, () => {
        var data = {
            quantity        : req('quantity'),
            target_date     : req('target_date'),
            updated_at      : now(true),
            product_id      : req('product_id'),
            location_id     : req('location_id'),
        };

        var details = PRD.update(data, condition);
        if(details){
            res(details) 
        } else {
            res('Internal server error occured', 500);
        }
    });
});

/* PR Details Delete */
DELETE('purchase-requisition-details/delete/:id', () => {
    var data = param(),
        rule = {
            id: ['required', 'exists:purchase_requisition_details']
        };

    validate(data, rule, () => {
        if (PRD.delete({id : data.id})) {
            res(`Purchase Requisition Details with ID '${data.id}' successfully deleted`);
        } else {
            res('Internal server error occured', 500);
        }
    });
});


/* 
 * 
 * PR By PC
 * 
 */
GET('purchase-requisition/by-purchase-contract/:number', () => {
    var data = param(),
        rule = {
            number : ['exists:purchase_contracts,number']
        };
    
    validate(data, rule, () => {
        var pr = PR.instance();

        pr = PurchaseRequisition
            .select('purchase_requisitions.id', 'purchase_requisitions.number', 'business_unit.location_code as business_unit_code', 'business_unit.description as business_unit_description')

            .join('purchase_requisition_details', 'purchase_requisition_id'                     , 'purchase_requisitions.id')
            .join('purchase_contract_details'   , 'purchase_contract_details.product_id'        , 'purchase_requisition_details.product_id')
            .join('purchase_contracts'          , 'purchase_contracts.id'                       , 'purchase_contract_id')
            .join('locations as business_unit'  , 'purchase_requisitions.business_unit_id'      , 'business_unit.id')

            .where('purchase_contracts.number', data.number)
            .groupBy('purchase_requisitions.id', 'purchase_requisitions.number', 'business_unit.location_code', 'business_unit.description')
            .get();

        foreach(pr, (index, each) => {
            each.details = PR.select('products.id as product_id', 'products.brand', 'products.product_code', 'products.type', 'products.description', 'purchase_contract_details.price', 'purchase_contract_details.quantity', 'warehouse.location_code as warehouse_code', 'warehouse.description as warehouse_description')

                            .join('purchase_requisition_details'    , 'purchase_requisition_id'                     , 'purchase_requisitions.id')
                            .join('products'                        , 'products.id'                                 , 'purchase_requisition_details.product_id')
                            .join('purchase_contract_details'       , 'purchase_contract_details.product_id'        , 'purchase_requisition_details.product_id')
                            .join('purchase_contracts'              , 'purchase_contracts.id'                       , 'purchase_contract_id')
                            .join('locations as warehouse'          , 'purchase_requisition_details.location_id'    , 'warehouse.id')

                            .where('purchase_requisitions.id', each.id)
                            .get();
        });


        res(pr);
    });
});
