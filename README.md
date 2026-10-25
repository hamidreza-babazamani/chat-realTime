# Chat Realtime

MERN stack realtime chat application.

## Tech Stack

- Node.js, Express
- MongoDB, Mongoose
- Socket.io
- JWT Authentication
- bcrypt

## Features

- User signup and login with JWT
- Realtime messaging via Socket.io
- Online users presence
- Unseen message counts
- Message seen receipts
- Profile and password management

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/signup | Register user |
| POST | /api/auth/login | Login |
| GET | /api/auth/check | Verify token |
| GET | /api/messages/users | Get sidebar users |
| GET | /api/messages/:id | Get conversation |
| POST | /api/messages/send/:id | Send message |
| PUT | /api/messages/mark/:id | Mark message as seen |

## Environment Variables

```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173
```

## Run Locally

```bash
npm install
npm run server
```

---

# چت آنلاین

اپلیکیشن چت realtime با استک MERN.

## تکنولوژی‌ها

- Node.js, Express
- MongoDB, Mongoose
- Socket.io
- احراز هویت JWT
- bcrypt

## امکانات

- ثبت‌نام و ورود با JWT
- پیام‌رسانی realtime با Socket.io
- نمایش کاربران آنلاین
- شمارش پیام‌های دیده‌نشده
- رسید خوانده‌شدن پیام
- مدیریت پروفایل و رمز عبور

## اجرای پروژه

```bash
npm install
npm run server
```
