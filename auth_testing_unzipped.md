Step 1: MongoDB Verification
mongosh
use test_database
db.users.find({role: "admin"}).pretty()

Step 2: API Testing
curl -c cookies.txt -X POST http://localhost:8001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@truejodi.com","password":"admin123"}'
curl -b cookies.txt http://localhost:8001/api/auth/me
