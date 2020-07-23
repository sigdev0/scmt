// const Category = require("../../app/Category");

/* Details Category */
GET('category/:id', () => {
    var data = param(),
        rules = {
            id: ['required', 'exists:categories,id']
        };

    validate(data, rules, () => {
        var category = Category.find(data.id);

        if (category) {
            res(category);
        } else {
            res('Category not found', 404);
        }
    })
});

GET('category', () => {
    var result = Category.instance();
    result.select(
        "id",
        "category_description",
        "category_code",
        "created_at",
        "updated_at"
    );

    var keyword = req("keyword"),
        limit = req("limit"),
        offset = req("offset");

    if (!empty(limit)) result.limit(limit);
    if (!empty(offset)) result.offset(offset);
    if (!empty(keyword)) result.whereLike("category_code", keyword);

    res(result.get());
});

POST('category/insert', () => {
    var data = req("category_description", "category_code"),
        rules = {
            category_code: ['required'],
            category_description: ['required'],
        };
    validate(data, rules, () => {
        data.id = Category.max('id') + 1;
        data.created_at = now(true);
        data.updated_at = now(true);
        var category = Category.insert(data);
        if (category) {
            res(category);
        } else {
            res('Internal server error', 500)
        }
    })
});

PUT('category/update', () => {
    var data = req("id", "category_description", "category_code"),
        rules = {
            id: ["required|exists:categories,id"],
            category_description: ['required'],
            category_code: ['required']
        };

    validate(data, rules, () => {
        var category = Category.find(data.id);
        category.category_description = data.category_description;
        category.category_code = data.category_code;
        category.updated_at = now(true);

        var success = category.update();
        if (success) {
            res("Category successfully updated");
        } else {
            res('Internal server error', 500)
        }
    })
});

DELETE('category/delete/:id', () => {
    var data = param(),
        rules = {
            id: ['required', 'exists:categories,id']
        };

    validate(data, rules, () => {
        var success = Category.delete({ id: data.id });

        if (success) {
            res("Item Category succesfully deleted");
        } else {
            res('Item Category cannot be deleted as it is being used by another record', 500);
        }
    })
});
