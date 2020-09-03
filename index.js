require('./system/lazify');

console.log(process.env.DB_HOST);
console.log(process.env.DB_PORT);
console.log(process.env.DB_NAME);
console.log(process.env.DB_SCHEMA);
console.log(process.env.DB_USERNAME);
console.log(process.env.DB_PASSWORD);

serve(false);
