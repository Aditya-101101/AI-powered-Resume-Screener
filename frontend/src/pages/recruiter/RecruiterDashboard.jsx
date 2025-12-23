import React, { useState, useEffect } from "react";
import StatCard from "../../components/StatCard";
import api from '../../api/axios'
import Error from "../../components/Error";
import { useNavigate } from 'react-router-dom'
import Job from "../../components/Job";

const MAX_SKILLS = 5;

const RecruiterDashboard = () => {
  const navigate = useNavigate()

  const [showSidebar, setShowSidebar] = useState(false)
  const [showerror, setshowError] = useState(false)
  const [error, setError] = useState({ code: null, message: "" })
  const [recruiterName, setRecruiterName] = useState("")
  const [recruiterAvatar, setRecruiterAvatar] = useState("")
  const [email, setEmail] = useState("")
  const [jobs, setJobs] = useState([])
  const [content, setContent] = useState("overview")
  const [jobUnderReview, setJobUnderReview] = useState(null)
  const [jobDetail, setJobDetail] = useState({
    title: "",
    desc: "",
    skillsRequired: "",
    experienceRequired: null,
    jobCover: null
  })

  const StringToArray = (skills) => skills.split(",").map(item => item.trim()).filter(Boolean)

  const [jobPageCount, setJobPageCount] = useState(0)
  const [jobPage, setJobPage] = useState(1)

  const getRecruiterData = async () => {
    try {
      const response = await api.get(`/recruiter/data?page=${jobPage}`)
      if (response.status === 200) {
        const recruiterData = response.data.recruiter
        const paginationDetails = response.data.pagination
        setJobPageCount(paginationDetails.pageCount)
        setRecruiterName(recruiterData.name)
        setRecruiterAvatar(recruiterData.recruiterAvatar)
        setEmail(recruiterData.email)
        console.log(paginationDetails.jobsData)
        setJobs(paginationDetails.jobsData)
      }
    } catch (err) {
      setshowError(true)
      setError({
        code: err.response?.status || 500,
        message: err.response?.data?.message || "Something went wrong"
      })
      setTimeout(() => {
        setshowError(false)
        setError({
          code: null,
          message: ""
        })
      }, 5000)

      console.log(err)
    }
  }
  const handleJobPageNext = () => {
    setJobPage(jobPage + 1)
  }
  const handleJobPagePrevious = () => {
    setJobPage(jobPage - 1)
  }

  useEffect(() => {
    getRecruiterData()
  }, [content, jobPage])


  const handleRecruiterLogout = async () => {
    try {
      const response = await api.get('/recruiter/logout')
      if (response.status === 200) {
        navigate('/recruiter-login')
      }
    } catch (err) {
      setshowError(true)
      setError({
        code: err.response?.status || 500,
        message: err.response?.data?.message || "Something went wrong"
      })
      setTimeout(() => {
        setshowError(false)
        setError({
          code: null,
          message: ""
        })
      }, 5000)

      console.log(err)
    }
  }


  const onClose = () => {
    setshowError(false)
  }

  const handleShowJob = (job) => {
    console.log(job)
    setJobUnderReview(job)
  }

  const closeJob = () => {
    setJobUnderReview(null)
  }

  const handleFormDataChange = (e) => {
    setJobDetail(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleJobCoverChange = (e) => {
    setJobDetail(prev => ({ ...prev, "jobCover": e.target.files[0] }))
  }

  const handleJobCreateFormSubmit = async (e) => {
    e.preventDefault()

    if (!jobDetail.jobCover) {
      setshowError(true);
      setError({
        code: 400,
        message: "Please upload job cover image"
      });
      return;
    }
    const skillsArray = StringToArray(jobDetail.skillsRequired)

    const formData = new FormData()

    formData.append("title", jobDetail.title);
    formData.append("desc", jobDetail.desc);
    formData.append("skillsRequired", JSON.stringify(skillsArray));
    formData.append("experienceRequired", jobDetail.experienceRequired);
    formData.append("jobCover", jobDetail.jobCover)

    try {
      const response = await api.post('/recruiter/createJob', formData)
      if (response.status === 201) {
        setJobDetail({
          title: "",
          desc: "",
          skillsRequired: "",
          experienceRequired: null,
          jobCover: null
        })
      }
    } catch (err) {
      setshowError(true)
      setError({
        code: err.response?.status || 500,
        message: err.response?.data?.message || "Something went wrong"
      })
      setTimeout(() => {
        setshowError(false)
        setError({
          code: null,
          message: ""
        })
      }, 5000)

      console.log(err)
    }
  }

  return (
    <div className="h-screen w-screen  bg-linear-to-br from-[#eef2ff] via-[#f8fafc] to-[#ecfeff] flex items-center justify-center text-slate-800">

      {showerror && <Error error={error} onClose={onClose} />}

      <div className="relative h-[95vh] w-[95vw] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] bg-white/60 backdrop-blur-xl">
      {jobUnderReview && <Job closeJob={closeJob} job={jobUnderReview} />}

        <div className="flex w-full h-full">
          <aside
            className={`w-66 p-5 bg-linear-to-b from-indigo-300 via-slate-100 to-white border-r border-slate-200 fixed lg:static inset-y-0 left-0 z-20 transition-transform duration-300 ${showSidebar ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>

            <img src="../public/resumeScreenerLogo.png" alt="logo" className="mb-7 flex h-12" />
            <nav className="space-y-2 text-sm">

              <div className="px-3 items-center justify-start py-2 gap-3 rounded-lg flex text-slate-700 cursor-pointer bg-indigo-500/10 hover:bg-indigo-700/10 hover:text-indigo-600 transition" >
                <img src={`../public/recruiterAvatars/${recruiterAvatar}.png`} alt="recruiterAvatar" className="h-15 w-15 rounded-full" /><span className="text-xl font-semibold wrap-break-word">{recruiterName}</span>
              </div>
              <div className="text-sm font-semibold text-center">{email}</div>
            </nav>
            <div className="space-y-2 text-sm p-4 my-10 rounded-lg bg-indigo-500/10">
              <ul className="gap-3 ">
                <li name="overview" onClick={() => setContent("overview")} className="px-3 items-center rounded-lg justify-start py-2 gap-3  flex text-slate-700 cursor-pointer font-semibold hover:bg-indigo-700/10 hover:text-indigo-600 transition">Overview</li>
                <li name="jobs" onClick={() => setContent("jobs")} className="px-3 items-center rounded-lg justify-start py-2 gap-3  flex text-slate-700 cursor-pointer font-semibold  hover:bg-indigo-700/10 hover:text-indigo-600 transition">Jobs</li>
                <li name="createJob" onClick={() => setContent("createJob")} className="px-3 items-center rounded-lg justify-start py-2 gap-3  flex text-slate-700 cursor-pointer font-semibold  hover:bg-indigo-700/10 hover:text-indigo-600 transition">Create Job</li>
              </ul>
            </div>
            <button onClick={handleRecruiterLogout} className="px-4 bottom-8 absolute flex gap-1 rounded-xl py-1.5 text-slate-600 hover:text-red-500 hover:bg-red-600/20 hover:fill-red-500 transition">
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" /></svg>
              <span className="text-sm">Logout</span>
            </button>
          </aside>

          {showSidebar && (
            <div
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            />
          )}


          <main className="flex-1 relative flex flex-col">

            <header className=" min-w-full
                            min-h-14 px-5 flex items-center
                            bg-linear-to-r from-teal-500/20 via-cyan-400/10 to-transparent
                            border-b border-slate-200
                            backdrop-blur-md
                        ">
              <button
                onClick={() => setShowSidebar(true)}
                className="
                                    lg:hidden mr-4 px-1 py-0.5
                                    rounded-lg 
                                    text-white text-sm shadow
                                "
              >
                <img src="../src/assets/menuIcon.png" alt="menu" />
              </button>

              <h1 className="text-sm font-semibold text-slate-700">
                User Dashboard
              </h1>
            </header>


            {content === "overview" && <section className="flex-1 w-full p-6 bg-linear-to-br from-slate-50 via-white to-cyan-50">
              <div className="h-full  flex flex-col rounded-2xl bg-white/80 backdrop-blur shadow-lg p-6">
                <h2 className="text-lg font-semibold text-slate-700 mb-6">
                  Overview
                </h2>


                <div className="flex md:grid-cols-3 gap-5 mb-6">
                  <StatCard
                    title="Total Jobs"
                    value={jobs.length}
                    gradient="from-indigo-500/20 to-indigo-300/10"
                    color="text-indigo-600" />
                  <StatCard
                    title="Jobs Open"
                    value="4"
                    gradient="from-teal-500/20 to-cyan-300/10"
                    color="text-teal-600" />
                  <StatCard
                    title="Jobs Closed"
                    value="8"
                    gradient="from-rose-500/20 to-pink-300/10"
                    color="text-rose-600"
                  />
                </div>

                {/* <div className="flex-1 overflow-y-auto  rounded-lg p-4 flex flex-col gap-4">
                  {applications.length === 0 ? (
                    <div className="text-2xl font-bold text-center mt-20">
                      !! No Applications to Show !!
                    </div>
                  ) : (
                    applications.map(application => (
                      <div
                        key={application.id}
                        className="flex gap-5 justify-around bg-green-200 rounded p-3"
                      >
                        <span>JobTitle : {application.jobId.title}</span>
                        <span>Application Status : {application.status}</span>
                        <span>AtsScore : {application.atsScore}</span>
                      </div>
                    ))
                  )}
                </div> */}
              </div>
            </section>}

            {content === "jobs" && <section className="flex-1 px-6 py-1.5 lg:py-6 bg-linear-to-br from-slate-50 via-white to-cyan-50">
              <div className="h-full flex flex-col rounded-2xl bg-white/80 backdrop-blur shadow-lg p-3 lg:p-6">
                <h2 className="text-lg font-semibold text-slate-700 mx-4">
                  Jobs
                </h2>


                <div className="flex-1 overflow-y-auto  rounded-lg px-4 py-2 lg:py-6 flex flex-col gap-3">
                  {jobs.length === 0 ? (
                    <div className="text-2xl font-bold text-center mt-20">
                      !! No Job to Show !!
                    </div>
                  ) : (
                    jobs.map(job => (
                      <div
                        key={job.id}
                        className="w-55  flex flex-col gap-4 rounded-2xl bg-white shadow-md border border-slate-200 hover:shadow-lg transition"
                      >
                        {/* <div className="h-32 rounded-t-2xl bg-linear-to-r from-indigo-500/20 via-cyan-400/20 to-teal-300/20 flex items-center justify-center">
                          <span className="text-sm font-semibold text-slate-700">
                            Job Opening
                          </span>
                        </div> */}

                        <div className="p-4 flex flex-col gap-3">
                          <h3 className="text-lg font-semibold text-slate-800">
                            {job.title}
                          </h3>

                          <p className="text-sm text-slate-600 line-clamp-3">
                            {job.desc}
                          </p>


                          <div className="flex flex-wrap gap-2">
                            {job.skillsRequired.slice(0, MAX_SKILLS).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-600"
                              >
                                {skill}
                              </span>
                            ))}

                            {job.skillsRequired.length > MAX_SKILLS && (
                              <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
                                +{job.skillsRequired.length - MAX_SKILLS} more
                              </span>
                            )}
                          </div>



                          <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                            <span className="text-sm font-medium text-slate-700">
                              {job.experienceRequired} yr exp
                            </span>

                            <button onClick={() => handleShowJob(job)}
                              className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                            >
                              View Job Status
                            </button>
                          </div>
                        </div>
                      </div>

                    ))
                  )}
                </div>
                <div className="w-full flex justify-center">
                  <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border">

                    <button
                      disabled={jobPage === 1}
                      onClick={handleJobPagePrevious}
                      className=" px-3 py-1 rounded-md text-sm font-medium disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-slate-100">
                      ← Prev
                    </button>

                    <span className="text-sm font-semibold text-slate-700">
                      Page {jobPage} / {jobPageCount}
                    </span>

                    <button
                      disabled={jobPage === jobPageCount}
                      onClick={handleJobPageNext}
                      className="px-3 py-1 rounded-md text-sm font-medium disabled:text-slate-400 disabled:cursor-not-allowed hover:bg-slate-100">
                      Next →
                    </button>

                    <div className="relative">
                      <select
                        value={jobPage}
                        onChange={e => setJobPage(Number(e.target.value))}
                        className=" appearance-none bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg px-3 py-1.5 pr-8 shadow-sm cursor-pointer hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition">
                        {Array.from({ length: jobPageCount || 10 }).map((_, index) => (
                          <option key={index} value={index + 1}>
                            Page {index + 1}
                          </option>
                        ))}
                      </select>

                      <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-slate-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </section>}

            {content === "createJob" && (
              <section className="flex-1 overflow-y-scroll md:overflow-hidden p-3 bg-linear-to-br from-slate-50 via-white to-cyan-50">
                <div className="h-full flex flex-col rounded-2xl bg-white/80 backdrop-blur shadow-lg p-3">

                  <h2 className="text-xl px-3 font-semibold text-slate-700">
                    Create Job
                  </h2>

                  <div className="flex-1 overflow-y-auto rounded-xl p-4">
                    <form onSubmit={handleJobCreateFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

                      <div className="flex flex-col gap-2">
                        <label htmlFor="title" className="text-sm font-medium text-slate-600">
                          Job Title
                        </label>
                        <input
                          type="text"
                          id="title"
                          name="title"
                          required
                          onChange={handleFormDataChange}
                          placeholder="Frontend Developer"
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 outline-none transition"
                        />
                      </div>


                      <div className="flex flex-col gap-2">
                        <label htmlFor="experienceRequired" className="text-sm font-medium text-slate-600">
                          Experience Required (years)
                        </label>
                        <input
                          type="number"
                          name="experienceRequired"
                          id="experienceRequired"
                          min={0}
                          max={30}
                          step={1}
                          required
                          onChange={handleFormDataChange}
                          placeholder="2"
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 outline-none transition"
                        />
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label htmlFor="desc" className="text-sm font-medium text-slate-600">
                          Job Description
                        </label>
                        <textarea
                          name="desc"
                          id="desc"
                          required
                          onChange={handleFormDataChange}
                          rows={4}
                          placeholder="Describe responsibilities, role expectations..."
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm resize-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 outline-none transition"
                        />
                      </div>


                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label htmlFor="skillsRequired" className="text-sm font-medium text-slate-600">
                          Skills Required
                        </label>
                        <input
                          type="text"
                          id="skillsRequired"
                          name="skillsRequired"
                          required
                          onChange={handleFormDataChange}
                          placeholder="React, Node.js, MongoDB"
                          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 shadow-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 outline-none transition"
                        />
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label htmlFor="jobCover" className="text-sm font-medium text-slate-600">
                          Job Cover Image
                        </label>
                        <div className="w-full flex justify-between items-center">
                          <span
                            className="block sm:hidden rounded-xl bg-cyan-500 px-5 py-2 text-white text-sm font-medium hover:bg-cyan-600 transition"
                          >
                            Choose File
                          </span>
                          <input
                            type="file"
                            id="jobCover"
                            name="jobCover"
                            required
                            accept=".png,.jpg,.jpeg"
                            onChange={handleJobCoverChange}
                            className="hidden sm:block w-[60%] border border-slate-200 shadow-sm  rounded-xl  text-sm text-slate-600
                          md:file:mr-4 file:rounded-xl file:border-0
                          file:bg-cyan-500 file:px-4 file:py-2
                          file:text-white file:font-medium
                          hover:file:bg-cyan-600 transition"
                          />
                          <button
                            type="submit"
                            className="md:mx-10 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 px-6 py-2.5 text-sm font-medium shadow-sm hover:bg-slate-200 active:scale-[0.98] transition-all">
                            Create Job
                          </button>

                        </div>
                      </div>
                    </form>
                  </div>
                </div>
              </section>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};



export default RecruiterDashboard;
