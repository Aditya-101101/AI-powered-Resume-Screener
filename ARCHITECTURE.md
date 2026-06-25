# reScreener Architecture

## Overview

reScreener is a full-stack ATS-powered resume screening platform built using the MERN stack.

It allows:

* Candidates to upload resumes and apply for jobs
* Recruiters to create jobs and review applications
* Automatic ATS evaluation using resume parsing, embeddings, and heuristic scoring

---

# Tech Stack

| Layer          | Technologies                         |
| -------------- | ------------------------------------ |
| Frontend       | React 19, Vite, TailwindCSS, DaisyUI |
| Backend        | Express 5, Mongoose, JWT             |
| Storage        | MongoDB Atlas                        |
| File Storage   | Cloudinary                           |
| AI Services    | HuggingFace Inference API            |
| Resume Parsing | pdf-parse                            |
| Authentication | JWT in HTTP-only cookies             |

---

# Project Structure

```text
backend/
├── controllers/
├── middlewares/
├── models/
├── routes/
├── services/
├── public/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   ├── api/
│   └── App.jsx
```

---

# Database Design

## User

```text
name
email
password
userAvatar
role
```

---

## Recruiter

```text
name
email
password
recruiterAvatar
role
```

---

## Job

```text
title
desc
skillsRequired
experienceRequired
jobCover
createdBy
status
embedding
```

---

## Application

```text
submittedBy
jobId
skills
experience
resume
atsScore
atsBreakdown
atsExplanation
status
feedback
```

---

# Authentication Flow

```text
Login

↓

JWT Generation

↓

HTTP Only Cookie

↓

Browser Stores Cookie

↓

Protected Route

↓

Middleware Verification

↓

Controller Access
```

---

# Resume Processing Pipeline

```text
PDF Upload

↓

Multer Storage

↓

pdf-parse

↓

cleanResumeText()

↓

extractSkillsAndExperience()

↓

Embedding Generation

↓

ATS Calculation

↓

Cloudinary Upload

↓

MongoDB Storage
```

---

# ATS Scoring System

Maximum Score = 85

Skills
40 Points

Experience
25 Points

Education
10 Points

Keywords
10 Points

Formula

ATS Score

=

Skills Score

*

Experience Score

*

Education Score

*

Keyword Score

---

# Embedding Pipeline

Resume Text

↓

HuggingFace API

↓

Normalized Vector

↓

Cosine Similarity

↓

Keyword Matching Score

---

# Frontend Architecture

Pages

↓

Dashboard Components

↓

Axios Client

↓

Express API

↓

MongoDB

No Redux or Context API is used.

All state is managed with React hooks.

---

# Deployment

Backend

Render

Frontend

Vite Static Build

Cloudinary

Resume Storage

MongoDB Atlas

Database

---

# Planned Improvements

* Integrate resumeParser.js
* DOCX Support
* Resume Embedding Cache
* Job Recommendation System
* Redis Caching
* Split large dashboard components
* Introduce validation layer
* Add rate limiting
* Add unit tests
