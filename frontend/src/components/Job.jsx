import React from 'react'
import api from '../api/axios'
import Error from './Error'
import { useState, useEffect } from 'react'
import Resume from './Resume'


const MAX_SKILLS = 8


const Job = ({ closeJob, job }) => {
  const [showerror, setshowError] = useState(false)
  const [error, setError] = useState({ code: null, message: "" })
  const [applications, setApplications] = useState([])
  const [Application, setApplication] = useState(null)
  const [applicationPageCount, setApplicationPageCount] = useState(1)
  const [applicationPage, setApplicationPage] = useState(1)
  const [showJob, setShowJob] = useState(false)

  const getApplications = async () => {
    try {
      const response = await api.get(`/jobs/applications?jobId=${job.id}&page=${applicationPage}`)
      if (response.status === 200) {
        const paginationDetails = response.data.pagination
        setApplicationPageCount(paginationDetails.pageCount)
        setApplications(response.data.applications)
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

  const handleApplicationPageNext = () => {
    setApplicationPage(applicationPage + 1)
  }
  const handleApplicationPagePrevious = () => {
    setApplicationPage(applicationPage - 1)
  }

  useEffect(() => {
    getApplications()
  }, [applicationPage])

  const onClose = () => {
    setshowError(false)
  }

  const handleViewResume = (application) => {
    setApplication(application)
  }

  const closeResume = () => {
    setApplication(null)
  }

  const handleCloseJob = async () => {
    if (confirm("Sure Close Job!")) {
      try {
        const data = {
          jobId: job.id,
          status: false
        }
        const response = await api.patch('/recruiter/update', data)
        if (response.status === 200)
          alert("!! Job Closed Successfully !!")
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
    } else {
      return null;
    }
  }

  return (
    <div>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">

        {Application && <Resume closeResume={closeResume} Application={Application} jobId={job.id} />}
        {showerror && <Error error={error} onClose={onClose} />}

        <div className="h-full w-full max-w-7xl rounded-2xl bg-white shadow-2xl flex overflow-hidden">


          <div className={`${showJob ? "flex" : "hidden"} sm:flex justify-between ${showJob ? "w-full sm:w-[40%]" : "md:w-[40%] sm:w-[45%] "} border-r border-slate-200 
                      bg-slate-50 p-5 flex-col`}>


            <div className='w-full pb-2 flex justify-between pl-5'>
              <span className='font-semibold text-xl'>Job</span>
              <button className="p-1 sm:hidden rounded-md hover:bg-red-100 transition" onClick={() => setShowJob(false)}>✕</button>
            </div>
            <div className="min-h-44 max-h-88 bg-slate-800">
              <img
                src={job.jobCover}
                alt="Job Cover"
                className="h-full w-full object-cover"
              />
            </div>


            <div className="flex-1 overflow-y-auto p-5 pb-1 flex flex-col gap-4">

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  {job.title}
                </h2>
                <p className="text-xs text-slate-500">
                  Job Opening
                </p>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">
                <p className="text-sm  text-slate-600 leading-relaxed ">
                  {job.desc}
                </p>

                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">
                    Required Skills
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
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-slate-200 text-slate-600">
                        +{job.skillsRequired.length - MAX_SKILLS} more
                      </span>
                    )}
                  </div>
                </div>
              </div>


              <div className="mt-auto pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
                <div className="text-sm text-slate-600">
                  Experience:{" "}
                  <span className="font-medium text-slate-800">
                    {job.experienceRequired} yrs
                  </span>
                </div>

                <button
                  onClick={handleCloseJob}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg 
                         bg-red-100 text-red-600 
                         hover:bg-red-600 hover:text-white 
                         transition"
                >
                  Close Job
                </button>
              </div>
            </div>
          </div>


          <div className={`${showJob ? "hidden sm:flex" : "flex"} flex-1 flex-col`}>


            <div className="h-14 px-5 flex items-center justify-between border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg flex gap-5 font-semibold text-slate-800">
                <button className='block sm:hidden' onClick={() => setShowJob(true)}><img src="/assets/menuIcon.png" alt="menu" /></button>
                Applications
              </h2>

              <button
                onClick={closeJob}
                className="p-1 rounded-md hover:bg-red-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-3">
              {applications.length === 0 ? (
                <div className="text-lg font-semibold text-slate-400 text-center mt-24">
                  No applications found
                </div>
              ) : (
                applications.map(application => (
                  <div
                    key={application._id}
                    className="rounded-xl border border-slate-200 bg-white p-4 
                           shadow-sm hover:shadow-md transition flex flex-col gap-3"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {application.submittedBy.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {application.submittedBy.email}
                        </p>
                      </div>

                      <span className="px-2.5 py-1 text-xs font-semibold rounded-full 
                                   bg-indigo-50 text-indigo-600 border border-indigo-100">
                        ATS {application.atsScore}
                      </span>
                    </div>

                    <div className="h-px bg-slate-200" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        Resume
                      </span>

                      <button
                        onClick={() => handleViewResume(application)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-md 
                               bg-indigo-600 text-white 
                               hover:bg-indigo-700 transition"
                      >
                        View
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="py-3 flex justify-center border-t border-slate-200">
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border">

                <button
                  disabled={applicationPage === 1}
                  onClick={handleApplicationPagePrevious}
                  className="px-2 py-1 text-xs rounded-md 
                         disabled:text-slate-400 disabled:cursor-not-allowed 
                         hover:bg-slate-100 transition">
                  ←
                </button>

                <span className="text-xs font-semibold text-slate-700">
                  {applicationPage} / {applicationPageCount}
                </span>

                <button
                  disabled={applicationPage === applicationPageCount}
                  onClick={handleApplicationPageNext}
                  className="px-2 py-1 text-xs rounded-md 
                         disabled:text-slate-400 disabled:cursor-not-allowed 
                         hover:bg-slate-100 transition">
                  →
                </button>

                <select
                  value={applicationPage}
                  onChange={e => setApplicationPage(Number(e.target.value))}
                  className="ml-2 text-xs rounded-md border border-slate-300 
                         px-2 py-1 cursor-pointer
                         hover:border-indigo-400 focus:ring-2 focus:ring-indigo-300 transition"
                >
                  {Array.from({ length: applicationPageCount || 10 }).map((_, i) => (
                    <option key={i} value={i + 1}>
                      Page {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

  )
}

export default Job
