# reScreener (Beta) 🚀  
A full-stack resume screening and job application platform.

🔗 **Live Beta:** https://rescreener-62.onrender.com  

---

## 📌 Overview

**reScreener** is a resume screening platform designed to simplify the hiring workflow.  
Candidates can apply for jobs by uploading resumes, while recruiters can create job postings, review applications, and analyze resume compatibility using ATS-style scoring.

> ⚠️ This is a **Beta version**, built for learning, iteration, and real-world testing.

---

## 🧩 Key Features

### 👤 User (Candidate)
- User authentication (JWT + HTTP-only cookies)
- Browse available job postings
- Apply for jobs by uploading PDF resumes
- Automatic resume text extraction
- Skill matching against job requirements
- View application status and ATS compatibility score
- Paginated application history

---

### 🧑‍💼 Recruiter
- Recruiter authentication and protected routes
- Create, update, and delete job postings
- Upload custom job cover images
- View all applications per job
- Resume preview and download
- ATS score-based sorting and pagination
- Dashboard analytics (applications, scores, job status)

---

### ⚙️ System & Backend
- Role-based access control (User / Recruiter)
- PDF resume upload using **Multer** (memory + disk storage)
- Server-side validation and error handling
- Resume text parsing and normalization
- Skill extraction and matching logic
- RESTful API architecture
- Production deployment with environment-based configs

---

## 🛠 Tech Stack

**Frontend**
- React.js
- Tailwind CSS
- Axios
- React Router

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multer (File Uploads)

**Deployment**
- Render (Backend + Frontend)

---

## 🚦 How to Use

### 👤 For Candidates
1. Sign up or log in as a **User**
2. Browse available jobs
3. Select a job and upload your resume (PDF)
4. Submit your application
5. View ATS score and application status in your dashboard

---

### 🧑‍💼 For Recruiters
1. Sign up or log in as a **Recruiter**
2. Create job postings with required skills and experience
3. Upload job cover images
4. View applications per job
5. Analyze resumes using ATS score sorting
6. Download or preview candidate resumes

---

## 🗺 Route Legend

### 🔐 Auth Routes
| Method | Route | Description |
|------|------|-------------|
| POST | `/auth/register` | Register user or recruiter |
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET  | `/auth/me` | Get authenticated user |

---

### 👤 User Routes
| Method | Route | Description |
|------|------|-------------|
| GET  | `/jobs` | Fetch all available jobs |
| POST | `/application/apply` | Apply for a job (resume upload) |
| GET  | `/application/my-applications` | Get user applications |

---

### 🧑‍💼 Recruiter Routes
| Method | Route | Description |
|------|------|-------------|
| POST | `/recruiter/create-job` | Create a new job |
| GET  | `/recruiter/jobs` | Get recruiter’s jobs |
| GET  | `/recruiter/applications/:jobId` | Get applications for a job |
| DELETE | `/recruiter/job/:jobId` | Delete a job |

---

### 📂 File Upload Routes
| Method | Route | Description |
|------|------|-------------|
| POST | `/application/apply` | Upload resume (PDF) |
| POST | `/recruiter/create-job` | Upload job cover image |

---

## 📊 ATS Scoring (Simplified)

ATS compatibility score is calculated using:
- Skill overlap between resume and job requirements
- Normalized keyword matching
- Weighted scoring logic

> ⚠️ This is **not AI-generated** scoring — logic-based for transparency and speed.

---

## 🧪 Beta Limitations
- Basic keyword-based ATS scoring
- Limited analytics visualizations
- No email notifications (yet)
- Optimized for desktop usage

---

## 🚧 Future Improvements
- Advanced ATS scoring logic
- Resume feedback suggestions
- Recruiter analytics charts
- Email notifications
- Admin moderation panel
- Search & filtering for recruiters

---

## 👨‍💻 Author
**Aditya Kumar**  
Built as a full-stack learning project with real-world architecture and deployment.

---

## 📄 License
This project is for educational and learning purposes.
