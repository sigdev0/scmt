### Lazify Reborn
##### By A-SM

> Server Function

- `serve(withJWT = true)`
  - start server, if withJWT is set to false then all jwt validation for all routes will be disabled
- `DELETE(url, callback, withJWT = true)`
  - assign `DELETE` REST endpoint, set `withJWT` to false to exlude it from JWT validation
- `GET(url, callback, withJWT = true)`
  - assign `GET` REST endpoint, set `withJWT` to false to exlude it from JWT validation
- `POST(url, callback, withJWT = true)`
  - assign `POST` REST endpoint, set `withJWT` to false to exlude it from JWT validation
- `PUT(url, callback, withJWT = true)`
  - assign `PUT` REST endpoint, set `withJWT` to false to exlude it from JWT validation
- `res(message, status) / response(message, status)`
  - send response message with optional http status code (default 200)
- `req(...key) / request(...key)`
  - get single or multiple request value by `key` as identifier
- `param(...key)`
  - get single or multiple url params by `key` as identifier
- `header(key)`
  - get all or single header value identified by `key`

> Request File Function

_assumes you declare `var photo = req('photo')` as variable holder for `photo` request file_

- `photo.store(path = optional, filename = optional)` / `photo.save(path = optional, filename = optional)`
  - save uploaded `file_name` to `path` (if defined, otherwise in base `storage` dir) with `filename` as its name (otherwise will use original file name), returns aliased filename;
- `photo.undo()`
  - this undo (delete) corresponding uploaded file
- `photo.empty()`
  - returns `true` if uploaded file is null, empty or not detected
- `photo.getContent()`
  - returns file contents

> Storage Function

- `Storage.delete(file);`
  - deletes `file` from storage (uploaded file)

> REST Function

- `rest.get(url, data, header)`
  - do GET rest action to `url` with `data` as its body, and optional `header` is specified
- `rest.post(url, data, header)`
  - do `PUT` rest action to `url` with `data` as its body, and optional `header` is specified
- `rest.put(url, data, header)`
  - do `PUT` rest action to `url` with `data` as its body, and optional `header` is specified
- `rest.delete(url, data, header)`
  - do `DELETE` rest action to `url` with `data` as its body, and optional `header` is specified

> Data Type Function

- `i(value)`
  - convert value to integer
- `f(value)`
  - convert value to float
- `s(value)`
  - convert value to string

> Path Function

- `bpath(file)`
  - get `file` from base project path
- `config(section)`
  - get `section` part from config, can be nested like `server.port`

> String Function
- `contains(string, search)`
  - check if `string` contains `search`, return `true` if it does
- `containsr(string, search)`
  - check if `string` contains `search` in regex mode, return `true` if it does
- `cutl(string, amount)`
  - substring `string` from left `amount` times -> `cutl('nodejs', 4)` = `'js'`
- `cutr(string, amount)`
  - substring `string` from right `amount` times -> `cutr('nodejs', 2)` = `'node'`
- `endsWith(string, pattern)`
  - check if `string` endsWith `pattern`, return `true` if it does
- `lower(string)`
  - convert `string` to lowercase
- `replace(string, search, replacement)`
  - search `search` in `string` and replace it with `replacement`
- `replacer(string, search, replacement)`
  - search `search` in regex mode in `string` and replace it with `replacement`
- `split(string, delimiter)`
  - split `string` by `delimiter`
- `startsWith(string, pattern)`
  - check if `string` startsWith `pattern`, return `true` if it does
- `subl(string, amount)`
  - substring `string` from left `amount` times -> `subl('nodejs', 4)` = `'node'`
- `subr(string, amount)`
  - substring `string` from right `amount` times -> `subl('nodejs', 2)` = `'js'`
- `substr(string, from, to)` or `substring(string, from, to)`
  - substring `string` from index `from` to index `to`
- `title(string)`
  - convert `string` to title case (This Is Title)
- `trim(string, char)`
  - trims `char` (default is space) from both side of `string`
- `triml(string, char)`
  - trims `char` from left side of `string`
- `trimr(string, char)`
  - trims `char` from right side of `string`
- `upper(string)`
  - convert `string` to uppercase
- `words(string, count, suffix = '...')`
  - get only first `count` words of `string` and add `suffix`

> Additional Function

- `count(object)` or `size(object)`
  - counts length of `object`, can be string, array or object
- `empty(object)`
  - check if `object` is empty, blank, null, undefined or has no element
- `foreach(collection, callback)`
  - foreach loop equivalent, loop `collection` and execute `callback` each time
- `hasKey(key, object)`
  - check if `object` has key `key`, returns `true` if it does
- `hasValue(value, object)`
  - check if `object` has value `value`, returns `true` if it does
- `isIn(element, array)`
  - check if `element` exists in `array`, returns `true` if it does
- `isAlpha(param)`
  - returns true if `param` is alphabet characters
- `isAlphaDash()`
  - returns true if `param` is alphabet and dash characters
- `isAlphaNumeric(param)`
  - returns true if `param` is alphabet and numeric characters
- `isEmail(param)`
  - returns true if `param` is in email format
- `isFloat(param)`
  - returns true if `param` is instance of float
- `isFunction(param)`
  - returns true if `param` is a function
- `isNumeric(param)`
  - returns true if `param` is instance of number
- `isNull(param)`
  - returns true if `param` is null
- `isObject(param)`
  - returns true if `param` is object
- `isString(param)`
  - returns true if `param` is instance of string
- `isUndefined(param)`
  - returns true if `param` is undefined
- `keys(object)`
  - returns keys of `object`
- `log(content, dir)`
  - logs `content` to `log/${dir}` directory
- `md5(string)`
  - returns md5 hash from `string`
- `random(length = 4, chars = '0123456789')`
  - returns `length` random `chars`, `length` and `chars` can be changed
- `sha1(string)`
  - returns sha1 hash from `string`
- `uuid()`
  - returns timestamp based uuid
- `values(object)`
  - returns values of `object`
