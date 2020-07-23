/* Details Supplier */
GET('supplier/:id', () => {
    var data    = param(),
        rules   = {
            id: ['required', 'exists:suppliers,id']
        };

    validate(data, rules, () => {
        var supplier = Supplier.find(data.id);

        if (supplier) {
            res(supplier);
        } else {
            res('Internal server error', 500)
        }
    })
});

/* List Suppliers */
GET('suppliers', () => {
    var result = Supplier.instance();
        result.select(
            "id",
            "supplier_description",
            "address_number",
            "address_street",
            "address_city",
            "address_country",
            "telephone_number",
            "cellular_number",
            "email_address",
            "parent_supplier_id",
            "created_at",
            "updated_at"
        );

    var limit   = req("limit"),
        offset  = req("offset"),
        keyword = req("keyword");
            
    if (!empty(limit))      result.limit(limit);
    if (!empty(offset))     result.offset(offset);
    if (!empty(keyword))    result.whereLike("supplier_description", keyword);

    res(result.get());
});

/* Insert Supplier */
POST('supplier/insert', () => {
    var data    = req("supplier_description", "address_number", "address_street", "address_city", "address_country", 
                "telephone_number", "cellular_number", "email_address", "parent_supplier_id"),
        rules   = {
            supplier_description        : ['required'],
            address_number              : ['required'],
            address_street              : ['required'],
            address_city                : ['required'],
            address_country             : ['required'],
            telephone_number            : ['required'],
            cellular_number             : ['required'],
            email_address               : ['required'],
            parent_supplier_id          : ['required'],
        };

    validate(data, rules, () => {
		data.id 		= Supplier.max('id') + 1;
        data.created_at = now(true);
        data.updated_at = now(true);

        var supplier = Supplier.insert(data);
        if (supplier) {
            res(supplier);
        } else {
            res('Internal server error', 500)
        }
    })
});

/* Update Supplier */
PUT('supplier/update', () => {
    var data    = req("id", "supplier_description", "address_number", "address_street", "address_city", "address_country", 
                "telephone_number", "cellular_number", "email_address", "parent_supplier_id"),
        rules   = {
            id                          : ['required', 'exists:suppliers,id'],
            supplier_description        : ['required'],
            address_number              : ['required'],
            address_street              : ['required'],
            address_city                : ['required'],
            address_country             : ['required'],
            telephone_number            : ['required'],
            cellular_number             : ['required'],
            email_address               : ['required'],
            parent_supplier_id          : ['required'],
        };

    validate(data, rules, () => {
        var supplier                            = Supplier.find(data.id);
            supplier.supplier_description       = data.location_id;
            supplier.address_number             = data.location_id;
            supplier.address_street             = data.location_id;
            supplier.address_city               = data.description;
            supplier.address_country            = data.value;
            supplier.telephone_number           = data.location_id;
            supplier.cellular_number            = data.location_id;
            supplier.email_address              = data.location_id;
            supplier.parent_supplier_id         = data.location_id;
            supplier.updated_at                 = now(true);

        var success = supplier.update();
        if (success) {
            res("Supplier successfully updated");
        } else {
            res('Internal server error', 500)
        }
    })
});

/* Delete Supplier */
DELETE('supplier/delete/:id', () => {
    var data    = param(),
        rules   = {
            id: ['required', 'exists:suppliers,id']
        };

    validate(data, rules, () => {
        var success = Supplier.delete({ 'id': data.id });

        if (success) {
            res("Supplier successfully deleted");
        } else {
            res('Cannot delete Supplier as it is being used by another records', 500);
        }
    })
});
