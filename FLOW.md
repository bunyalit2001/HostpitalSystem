# HospitalSystem API Flow and Route Map

เอกสารนี้ลงรายละเอียด API path ของ backend สำหรับ dev ที่ต้องตาม flow ระหว่าง React frontend กับ Go/Gin backend

## Base URL

- Local frontend เรียก backend ที่ `http://process.env.REACT_APP_API_URL:8080`
- Backend entrypoint: `backend/main.go`
- Protected routes ต้องส่ง header:

```http
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

## Authentication Flow

1. ผู้ใช้เลือกหน้า login ตาม role ใน frontend
2. Frontend เรียก public login endpoint ตาม role
3. Backend ตรวจ email/password ด้วย bcrypt
4. Backend ออก JWT อายุ 24 ชั่วโมง
5. Frontend เก็บ `token`, `uid`, `role` ใน `localStorage`
6. ทุก protected API จะผ่าน `middlewares.Authorizes()` และ validate JWT ก่อนเข้า controller

| Role | Login endpoint | Credential field หลัก | Frontend role |
| --- | --- | --- | --- |
| Officer/Admin | `POST /login` | `email`, `password` | `officer` |
| Medical employee | `POST /login_s` | ดู payload ใน `authentication_Med_employee.go` | `med_employee` |
| Screening officer | `POST /login_screen` | ดู payload ใน `authentication_screening.go` | `screening_officer` |
| Doctor | `POST /login_Doctor` | `email`, `DocPassword` | `doctor` |

Public endpoint เพิ่มเติม:

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/signup` | สมัคร/สร้าง officer |

## Frontend Page Flow

หลัง login แล้ว `frontend/src/App.tsx` แสดงเมนูตาม `role`:

| Role | Main pages |
| --- | --- |
| `officer` | Screening officer, Doctor, Medical employee |
| `screening_officer` | Patient, Appointment |
| `med_employee` | Medical equipment, Lab request, Lab result |
| `doctor` | Treatment, Dispense, In-patient admission, Operating room |

## Core Business Flow

1. `officer` สร้างข้อมูลเจ้าหน้าที่/แพทย์/บุคลากร
2. `screening_officer` ลงทะเบียนผู้ป่วยผ่าน `/Patients/create`
3. `doctor` บันทึกการรักษาผ่าน `/treatments`
4. จาก treatment เดียวกันสามารถต่อ flow ไปยัง:
   - จ่ายยา: `/dispense`
   - นัดหมาย: `/appoint`
   - รับไว้รักษาในโรงพยาบาล: `/Save_ITICreate`
   - จองห้องผ่าตัด: `/Operating_RoomCreate`
5. `med_employee` จัดการอุปกรณ์แลปและคำขอเบิกผ่าน `/medicalequipments` และ `/requests`

## Protected API Routes

ทุก endpoint ในส่วนนี้ต้องมี JWT

### Officer

| Method | Path | Controller |
| --- | --- | --- |
| `GET` | `/officers` | `ListOfficers` |
| `GET` | `/officer/:id` | `GetOfficer` |
| `PATCH` | `/officers` | `UpdateOfficer` |
| `DELETE` | `/officers/:id` | `DeleteOfficer` |

### Staff and People

| Domain | List | Detail | Create | Update | Delete |
| --- | --- | --- | --- | --- | --- |
| Screening officer | `GET /Screening_officers` | `GET /Screening_officer/:id` | `POST /Screening_officer/create` | `PATCH /Screening_officerUpdate/:id` | `DELETE /Screening_officers/:id` |
| Patient | `GET /Patients` | `GET /Patient/:id` | `POST /Patients/create` | `PATCH /PatientsUpdate/:id` | `DELETE /Patients/:id` |
| Doctor | `GET /Doctors` | `GET /Doctor/:id`, `GET /DoctorFind/:id` | `POST /Doctor` | `PATCH /Doctor` | `DELETE /Doctor/:id` |
| Medical employee | `GET /medemployees` | `GET /medemployees/:id` | `POST /medemployees/create` | `PATCH /medemployeesUpdate` | `DELETE /medemployees/:id` |

### Treatment and Clinical Work

| Domain | List | Detail | Create | Update | Delete | Extra |
| --- | --- | --- | --- | --- | --- | --- |
| Treatment | `GET /treatments` | `GET /treatment/:id` | `POST /treatments` | `PATCH /treatmentsUpdate/:id` | `DELETE /treatment/:id` | `GET /treatments/ready`, `GET /treatments/readyyy`, `GET /treatments/readyapp`, `GET /treatmentstatus` |
| Dispense | `GET /dispenses` | `GET /dispensess/:id` | `POST /dispense` | `PATCH /DispenseUpdate/:id` | `DELETE /dispense/:id` | - |
| Appointment | `GET /appoints` | `GET /appointss/:id` | `POST /appoint` | `PATCH /AppointUpdate/:id` | `DELETE /appoint/:id` | - |
| Save ITI | `GET /Save_ITIs` | `GET /Save_ITI/:id` | `POST /Save_ITICreate` | `PATCH /Save_ITIUpdate` | `DELETE /Save_ITI/:id` | `GET /Save_ITIs/ready` |
| Operating room | `GET /Operating_Rooms` | `GET /Operating_Room/:id` | `POST /Operating_RoomCreate` | `PATCH /Operating_RoomUpdate/:id` | `DELETE /Operating_Room/:id` | - |
| Lab | `GET /Labs` | `GET /Lab/:id` | `POST /Lab` | `PATCH /Lab` | `DELETE /Lab/:id` | - |
| Request | `GET /requests` | `GET /request/:id` | `POST /requests` | `PATCH /requestsUpdate/:id` | `DELETE /request/:id` | - |

### Master Data

| Domain | List | Detail | Create | Update | Delete |
| --- | --- | --- | --- | --- | --- |
| Building | `GET /Buildings` | `GET /Building/:id` | `POST /Building` | `PATCH /Building` | `DELETE /Building/:id` |
| Room | `GET /Rooms` | `GET /Room/:id` | `POST /Room` | `PATCH /Room` | `DELETE /Room/:id` |
| State | `GET /States` | `GET /State/:id` | `POST /States` | `PATCH /States` | `DELETE /State/:id` |
| Prefix | `GET /Prefixs` | `GET /Prefix/:id` | `POST /Prefix` | `PATCH /Prefix` | `DELETE /Prefix/:id` |
| Gender | `GET /Genders` | `GET /Gender/:id` | `POST /Gender` | `PATCH /Gender` | `DELETE /Gender/:id` |
| Education | `GET /Educations` | `GET /Education/:id` | `POST /Educations` | `PATCH /Educations` | `DELETE /Education/:id` |
| Blood | `GET /Bloods` | `GET /Blood/:id` | `POST /Blood` | `PATCH /Blood` | `DELETE /Blood/:id` |
| Nationality | `GET /Nationalities` | `GET /Nationality/:id` | `POST /Nationality` | `PATCH /Nationality` | `DELETE /Nationality/:id` |
| Marital | `GET /Maritals` | `GET /Marital/:id` | `POST /Marital` | `PATCH /Marital` | `DELETE /Marital/:id` |
| Religion | `GET /Religions` | `GET /Religion/:id` | `POST /Religion` | `PATCH /Religion` | `DELETE /Religion/:id` |
| DocPrefix | `GET /DocPrefixs` | `GET /DocPrefix/:id` | `POST /DocPrefix` | `PATCH /DocPrefix` | `DELETE /DocPrefix/:id` |
| Lab name | `GET /LabNames` | `GET /LabName/:id` | `POST /LabName` | `PATCH /LabName` | `DELETE /LabName/:id` |
| Disease | `GET /diseases` | `GET /diseases/:id` | `POST /disease` | `PATCH /disease` | `DELETE /disease/:id` |
| Status | `GET /statuses` | `GET /status/:id` | `POST /statuses` | `PATCH /statuses` | `DELETE /status/:id` |
| Track | `GET /tracks` | `GET /tracks/:id` | `POST /tracks` | `PATCH /tracks` | `DELETE /track/:id` |
| Drug | `GET /drugs` | `GET /drug/:id` | `POST /drugs` | `PATCH /drugs` | `DELETE /drugs/:id` |
| Practice | `GET /practices` | `GET /practice/:id` | `POST /practice` | `PATCH /practice` | `DELETE /practice/:id` |
| Department | `GET /departments` | `GET /department/:id` | `POST /department` | `PATCH /department` | `DELETE /department/:id` |
| Level cure | `GET /levelcures` | `GET /levelcure/:id` | `POST /levelcure` | `PATCH /levelcure` | `DELETE /levelcure/:id` |
| Brand | `GET /brands` | `GET /brands/:id` | `POST /brands` | `PATCH /brands` | `DELETE /brands/:id` |
| Medical status | `GET /medstatuses` | `GET /medstatuses/:id` | `POST /medstatuses` | `PATCH /medstatuses` | `DELETE /medstatuses/:id` |
| Medical equipment | `GET /medicalequipments` | `GET /medicalequipment/:id` | `POST /medicalequipments` | `PATCH /medicalequipmentsUpdate` | `DELETE /medicalequipments/:id` |
| Location | `GET /locations` | `GET /locations/:id` | `POST /locations` | `PATCH /locations` | `DELETE /location/:id` |
| Address Thailand | `GET /AddressThailands` | `GET /AddressThailand/:id`, `GET /ZipAddressThailand/:id` | `POST /AddressThailand` | `PATCH /AddressThailand` | `DELETE /AddressThailand/:id` |

## Response Shape

Controller ส่วนใหญ่ตอบกลับในรูปแบบ:

```json
{
  "data": {}
}
```

เมื่อ validation หรือ database error มักตอบ:

```json
{
  "error": "message"
}
```

## Notes for Devs

- ชื่อ path บางส่วนยังไม่ consistent เช่น `dispensess`, `appointss`, uppercase/lowercase ปนกัน และ update บาง endpoint มี `:id` บาง endpoint ไม่มี
- Frontend ผูกกับ `http://process.env.REACT_APP_API_URL:8080` แบบ hard-coded ใน `frontend/src/Services/HttpClientService.tsx`
- Role-based access หลักอยู่ฝั่ง frontend menu ส่วน backend ปัจจุบันตรวจแค่ว่า JWT ถูกต้อง ไม่ได้ enforce permission ตาม role ใน middleware
