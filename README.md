# Library_Full_Stack_App

Pull down repository using 
```git pull```

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

Connect database to backend
```
Add your SQL password into server/index.js (line 15)
const db = mysql.createConnection({
	...
	...
	password: "InsertSQLpasswordHere!",
	...
});



Copy over scripts/my_library_tables.sql into mySQL and generate database
```
