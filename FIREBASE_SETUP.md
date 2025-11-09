# 🔥 Firebase Setup Guide

## ขั้นตอนการตั้งค่า Firebase สำหรับ Save Zone

### 1. สร้าง Firebase Project

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. คลิก **"Add project"** หรือ **"เพิ่มโปรเจ็กต์"**
3. ตั้งชื่อโปรเจ็กต์ เช่น `savezone`
4. ปิด Google Analytics (ไม่จำเป็น)
5. คลิก **"Create project"**

### 2. เปิดใช้งาน Realtime Database

1. ในเมนูด้านซ้าย เลือก **"Realtime Database"**
2. คลิก **"Create Database"**
3. เลือก Location: `asia-southeast1` (Singapore)
4. เลือก Security rules: **"Start in test mode"**
5. คลิก **"Enable"**

### 3. ตั้งค่า Database Rules

1. ไปที่แท็บ **"Rules"**
2. แทนที่ด้วยโค้ดนี้:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

3. คลิก **"Publish"**

> ⚠️ **คำเตือน:** Rules นี้ใช้สำหรับ Demo เท่านั้น ในการใช้งานจริงควรตั้งค่า Authentication

### 4. รับ Firebase Configuration

1. ไปที่ **Project Overview** (ไอคอนเฟืองด้านบน) > **Project settings**
2. เลื่อนลงไปที่ **"Your apps"**
3. คลิกที่ไอคอน **Web** `</>`
4. ตั้ง App nickname: `savezone-web`
5. **ไม่ต้อง** เลือก Firebase Hosting
6. คลิก **"Register app"**
7. คัดลอกส่วน `firebaseConfig`

จะได้แบบนี้:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "savezone-xxxxx.firebaseapp.com",
  databaseURL: "https://savezone-xxxxx-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "savezone-xxxxx",
  storageBucket: "savezone-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};
```

### 5. อัพเดท index.html

1. เปิดไฟล์ `index.html`
2. หาส่วนนี้ (ประมาณบรรทัดที่ 212):

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
```

3. แทนที่ด้วย config ที่คัดลอกมาจากขั้นตอนที่ 4
4. บันทึกไฟล์

### 6. ทดสอบ

1. เปิดไฟล์ `login.html` ในเบราว์เซอร์
2. Login ด้วย:
   - Username: `third` หรือ `yimmy`
   - Password: `1234`
3. ทดสอบฟีเจอร์ต่างๆ:
   - ส่งแชท
   - เขียนความรู้สึก
   - สร้างโน้ต
   - คำนวณวันตกไข่

### 7. Deploy ไปยัง GitHub Pages

```bash
# ไปที่โฟลเดอร์โปรเจค
cd /Users/tawinkanthasa/Desktop/savezone

# Initialize git
git init

# Add remote
git remote add origin https://github.com/tawin2350/savezone.git

# Add and commit
git add .
git commit -m "🎉 Initial commit - Save Zone Love Website"

# Push
git branch -M main
git push -u origin main
```

จากนั้น:
1. ไปที่ GitHub repository
2. Settings > Pages
3. Source: Deploy from a branch
4. Branch: main / (root)
5. Save

เว็บจะพร้อมใช้งานที่: **https://tawin2350.github.io/savezone/**

---

## 🔒 Security Tips (ถ้าต้องการความปลอดภัยมากขึ้น)

### Database Rules แบบปลอดภัย:

```json
{
  "rules": {
    "chats": {
      ".read": true,
      ".write": true
    },
    "feelings": {
      ".read": true,
      ".write": true
    },
    "missing": {
      ".read": true,
      ".write": true
    },
    "notes": {
      ".read": true,
      ".write": true
    }
  }
}
```

### เพิ่ม API Key Restrictions:

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. เลือกโปรเจค Firebase ของคุณ
3. APIs & Services > Credentials
4. เลือก API key ของคุณ
5. Application restrictions: HTTP referrers
6. เพิ่ม: `https://tawin2350.github.io/savezone/*`

---

## 📞 Support

หากมีปัญหาหรือข้อสงสัย สามารถ:
- เช็ค [Firebase Documentation](https://firebase.google.com/docs/database)
- เช็ค console ในเบราว์เซอร์ (F12)
- ตรวจสอบว่า Firebase config ถูกต้อง

---

**เสร็จแล้ว! 🎉 Happy Coding! 💕**
