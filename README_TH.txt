OH Daily KPI - เว็บไซต์ออนไลน์ + Cloudflare Pages + D1 (SQLite-compatible) + Excel

เหตุผลที่ต้องใช้ D1:
เว็บไซต์แบบ static pages.dev ที่ไม่มี API จะเก็บข้อมูลไว้ใน localStorage ของแต่ละ browser เท่านั้น จึงไม่เห็นข้อมูลร่วมกันเมื่อส่งลิงก์ให้ผู้อื่น การแก้ไขนี้เพิ่ม Cloudflare Pages Functions เป็น API และ Cloudflare D1 เป็นฐานข้อมูลออนไลน์กลาง

ก่อนเริ่ม (สำคัญมาก):
1. เปิดเว็บไซต์เดิมที่มีข้อมูล แล้วกด “ส่งออก CSV” เพื่อสำรองข้อมูลเดิมไว้ก่อน
2. ชุดนี้เป็นไฟล์โปรเจกต์สำหรับนำไป deploy ไม่ได้แก้เว็บไซต์ออนไลน์ของคุณโดยตรง และไม่ได้ publish ให้โดยอัตโนมัติ

วิธี deploy บน Cloudflare Pages:
1. แตก ZIP นี้ แล้วอัปโหลดโฟลเดอร์ OH_Daily_KPI_Cloudflare เข้า GitHub repository ใหม่ (หรือใช้วิธีเชื่อม Git ที่ Cloudflare Pages รองรับ)
2. ใน Cloudflare Dashboard สร้าง D1 database ชื่อ oh-daily-kpi-db
3. เปิด D1 > Console แล้วรัน SQL ในไฟล์ schema.sql เพื่อสร้างตาราง app_state
4. ไปที่ Workers & Pages > สร้าง/เลือก Pages project ที่จะใช้สำหรับ OH Daily KPI แล้วเชื่อม repository
5. Build settings: Framework preset = None, Build command = เว้นว่าง, Build output directory = / (root) หรือ . ตามตัวเลือกที่หน้า Dashboard รองรับ
6. ตั้งค่า D1 binding สำหรับ Pages project: Variable name = DB และเลือกฐานข้อมูล oh-daily-kpi-db
7. ตรวจสอบว่าโฟลเดอร์ functions/ อยู่ที่ root เดียวกับ index.html เพื่อให้ Pages Functions ถูก deploy
8. package.json มี dependency xlsx สำหรับส่งออก Excel; หากใช้ Git integration ให้ตั้ง Build command เป็น `npm install` หากระบบต้องติดตั้ง dependencies ก่อน deploy และ output directory เป็น `.`
9. Deploy แล้วเปิด URL เว็บไซต์ใหม่
10. กด “นำเข้า CSV” แล้วเลือกไฟล์ CSV ที่สำรองจากเว็บไซต์เดิม เพื่อย้ายข้อมูลเข้า D1 กลาง รอให้สถานะบอกว่าบันทึกสำเร็จ
11. ทดสอบเปิด URL เดียวกันในหน้าต่างไม่ระบุตัวตนหรืออีกเครื่อง ตรวจว่าข้อมูลชุดเดียวกันปรากฏ และทดสอบปุ่ม “บันทึกเป็น Excel (.xlsx)” 

ไฟล์สำคัญ:
- index.html: หน้าจอโปรแกรม OH Daily KPI
- functions/api/state.js: API โหลด/บันทึกข้อมูลอัตโนมัติลง D1
- functions/api/export.js: สร้างไฟล์ Excel .xlsx จากข้อมูล D1
- schema.sql: SQL สำหรับสร้างตาราง
- package.json: dependency สำหรับสร้างไฟล์ Excel
- wrangler.toml.example: ตัวอย่าง config สำหรับ D1 binding; database_id ต้องเป็น ID จริงของคุณ ห้ามใช้ placeholder

ข้อควรทราบ:
- D1 เป็นฐานข้อมูลออนไลน์แบบ SQLite-compatible ที่ Cloudflare จัดการให้ ไม่ใช่ไฟล์ .sqlite3 ในเครื่อง
- เมื่อ deploy และผูก D1 ถูกต้อง ผู้ใช้ทุกคนที่เปิด URL เดียวกันจะอ่าน/บันทึกข้อมูลชุดกลางได้
- เว็บไซต์ที่เปิดให้ใครก็ได้เข้าถึงโดยไม่มีการล็อกอิน อาจอนุญาตให้ผู้ที่มีลิงก์แก้ไขหรือลบข้อมูลได้ ควรจำกัดผู้ใช้ด้วย Cloudflare Access/ระบบล็อกอินก่อนใช้กับข้อมูลจริง
- ไฟล์นี้ยังไม่ได้ publish ไปยังบัญชี Cloudflare ของคุณ เพราะต้องใช้สิทธิ์เข้าถึงบัญชีและการตั้งค่า D1 ของเจ้าของเว็บไซต์


ฟังก์ชันเพิ่มเติมในเวอร์ชันนี้:
- เส้น Target KPI อ้างอิงค่าตั้งต้น และแสดงเส้นประ Target Dynamic เมื่อมี Target รายวันที่ต่างจากค่าตั้งต้น (ทุก KPI)
- คลิกป้าย “วัน | ผ่าน Target” เพื่อแก้จำนวนที่แสดงได้ โดยปล่อยช่องว่างเพื่อกลับไปคำนวณอัตโนมัติ
- ลากการ์ดกราฟขึ้น/ลงเพื่อจัดลำดับ; ลำดับจะถูกบันทึกไปยัง D1 เมื่อเชื่อมต่อสำเร็จ
