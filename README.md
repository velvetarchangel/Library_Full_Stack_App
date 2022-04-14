# Library_Full_Stack_App

Pull down repository using 
```git pull```

Connect database to backend
```
Add your SQL password into server/index.js (line 15)
const db = mysql.createConnection({
	...
	...
	password: "InsertSQLpasswordHere!",
	...
});

Note: may need MySQL to be set up using "Legacy Password Encryption" to get application working


Copy over scripts/my_library_tables.sql into mySQL and generate database
```

Compile backend
```
cd server/
npm install
npm run start
```

Compile frontend
```
cd client-vue/
npm install
npm run serve
```

Login Credentials: (can also view through the my_library_tables.SQL file through the "library_user" relation

```
Example Library Customer Login Credentials:
Email: margot@outlook.com
Password: abc
```

```
Example Librarian Login Credentials:
Email: testlibrarian@test.com
Password: abc
```
