"use strict";
const bcrypt = require('bcryptjs');
const myPassword = '1'; // كلمة المرور التي تريدها
bcrypt.hash(myPassword, 10, (err, hash) => {
    if (err)
        throw err;
    console.log("Your New Hash is:");
    console.log(hash); // انسخ هذا الناتج بالكامل
});
