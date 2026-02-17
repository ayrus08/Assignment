1️⃣ Start Mongo

docker run -d \
  -p 27017:27017 \
  --name mongo \
  mongo:7
  
2️⃣ Start NATS (with WebSocket)

From folder containing nats.conf:

docker run -d \
  -p 4222:4222 \
  -p 8080:8080 \
  --name nats \
  -v $(pwd)/nats.conf:/nats.conf \
  nats:latest -c /nats.conf

Minimal nats.conf:

port: 4222

websocket {
  port: 8080
  no_tls: true
}

3️⃣ Start Backend
cd myapp_backend
npm install
npm start

Backend runs on:
http://localhost:3001

4️⃣ Start Frontend
cd myapp
npm install
npm run dev

Frontend runs on:
http://localhost:5173

👤 Test Users

Create users manually in Mongo:

db.users.insertOne({
  email: "admin@test.com",
  password: "<bcrypt hash>",
  role: "admin"
})

Same for member/viewer.

Default password used in testing:
123456
