/* Details Item */
GET('item/:id', () => {
    var data    = param(),
        rules   = {
            id : ['required', 'exists:items,id']
        };

    validate(data, rules, () => {
        var item = Item.find(data.id);

        if (item) {
            res(item);
        } else {
            res('Item not found', 404);
        }
    })
});

/* List Item */
GET('items', () => {
    var result = Item.instance();
        result.select(
            "id",
            "item_code",
            "product_id",
            "serial_number",
            "registered_location",
            "status_date_changed",
            "last_item_status",
            "item_location",
            "created_at",
            "updated_at"
        );

    var limit   = req("limit"),
        offset  = req("offset"),
        keyword = req("keyword");

    if (!empty(limit))      result.limit(limit);
    if (!empty(offset))     result.offset(offset);
    if (!empty(keyword))    result.whereLike("item_code", keyword);

    res(result.get());
});

/* Insert Item */
POST('item/insert', () => {
    var data    = req("item_code", "product_id", "serial_number", "registered_location", "status_date_changed", "last_item_status", "item_location"),
        rules   = {
            item_code           : ['required'],
            product_id          : ['required'],
            serial_number       : ['required'],
            registered_location : ['required'],
            status_date_changed : ['required'],
            last_item_status    : ['required'],
            item_location       : ['required'],
        };

    validate(data, rules, () => {
        data.created_at = now(true);
        data.updated_at = now(true);

        var item = Item.insert(data);
        if (item) {
            res(item);
        } else {
            res('Internal server error', 500)
        }
    })
});

/* Update Item */
PUT('item/update', () => {
    var data    = req("id", "item_code", "product_id", "serial_number", "registered_location", "status_date_changed", "last_item_status", "item_location"),
        rules   = {
            id                  : ['required', 'exists:items,id'],
            item_code           : ['required'],
            product_id          : ['required'],
            serial_number       : ['required'],
            registered_location : ['required'],
            status_date_changed : ['required'],
            last_item_status    : ['required'],
            item_location       : ['required'],
        };

    validate(data, rules, () => {
        var item                        = Item.find(data.id);
            item.item_code              = data.item_code;
            item.product_id             = data.product_id;
            item.serial_number          = data.serial_number;
            item.registered_location    = data.registered_location;
            item.status_date_changed    = data.status_date_changed;
            item.last_item_status       = data.last_item_status;
            item.location               = data.location;
            item.updated_at 			= now(true);

        var success = item.update();
        if (success) {
            res("Item successfully updated");
        } else {
            res('internal server error', 500)
        }
    })
});

/* Delete Item */
DELETE('item/:id', () => {
    var data = param(),
        rules = {
            id: ['required', 'exists:items,id']
        };

    validate(data, rules, () => {
        var success = Item.delete({ 'id': data.id });
        if (success) {
            res("Item sucessfully deleted");
        } else {
            res('Item cannot be deleted as it is being used by another records', 500);
        }
    })
});
