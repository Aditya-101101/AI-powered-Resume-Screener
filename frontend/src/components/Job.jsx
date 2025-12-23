import React from 'react'
import api from '../api/axios'
import Error from './Error'
import { useState, useEffect } from 'react'
import Resume from './Resume'
const MAX_SKILLS = 8

const Job = ({ closeJob, job }) => {
  // console.log(job)
  const [showerror, setshowError] = useState(false)
  const [error, setError] = useState({ code: null, message: "" })
  const [applications, setApplications] = useState([])
  const [resumeUrl, setResumeUrl] = useState(null)

  const getApplications = async () => {
    try {
      const response = await api.get(`/jobs/applications?jobId=${job.id}`)
      if (response.status === 200) {
        console.log(response.data.applications)
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

  useEffect(() => {
    getApplications()
  }, [])

  const onClose = () => {
    setshowError(false)
  }

  const handleViewResume = (resumeUrl) => {
    setResumeUrl(resumeUrl)
  }

  const closeResume = () => {
    setResumeUrl(null)
  }

  return (
    <div>
      <div className='absolute z-30 top-0 left-0 h-full w-full flex items-center justify-center p-5 rounded-r-lg overflow-hidden shadow bg-black/10 backdrop-blur-xl'>
        {resumeUrl&&<Resume closeResume={closeResume} resumeUrl={resumeUrl}/>}
        {showerror && <Error error={error} onClose={onClose} />}
        <div className="h-full mr-5 max-w-1/3 rounded-2xl overflow-hidden bg-white shadow-md flex flex-col">


          <div className="min-h-50 bg-slate-800 overflow-hidden">
            <img
              src={job.jobCover}
              alt="Job Cover"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex overflow-y-auto flex-col gap-4 p-5 flex-1">

            <div className="">
              <h2 className="text-xl font-semibold leading-tight">
                {job.title}
              </h2>
              <p className="text-sm">
                Job opening
              </p>
            </div>

            <p className="text-sm text-slate-600 overflow-y-scroll leading-relaxed line-clamp-6">
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
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-200 text-gray-600">
                    +{job.skillsRequired.length - MAX_SKILLS} more
                  </span>
                )}
              </div>
            </div>

            <div className="mt-auto border-t pt-4 space-y-2 text-sm text-slate-700">
              <div className="flex justify-between">
                <span>Experience Required</span>
                <span className="font-medium">
                  {job.experienceRequired} yrs
                </span>
              </div>
            </div>
          </div>
        </div>



        <div className="flex flex-col min-w-2/3 h-full">
          <div className="h-14 w-full flex items-center justify-between px-6 mb-4
                    rounded-2xl bg-slate-100">
            <h2 className="text-lg font-semibold text-slate-800">
              Applications
            </h2>

            <svg
              onClick={closeJob}
              className="cursor-pointer hover:fill-red-600 transition"
              xmlns="http://www.w3.org/2000/svg"
              height="22"
              viewBox="0 -960 960 960"
              width="22"
              fill="#475569"
            >
              <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
            </svg>
          </div>

          <div className=" flex-1 p-10 rounded-2xl bg-white shadow-md
                    flex items-center justify-center">

            <div className="flex-1 overflow-y-auto  rounded-lg p-4 flex flex-col gap-4">
              {applications.length === 0 ? (
                <div className="text-2xl font-bold text-center mt-20">
                  !! No Applications to Show !!
                </div>
              ) : (
                applications.map(application => (
                  <div
                    key={application.id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                  >

                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-slate-800">
                          ApplicantName : {application.submittedBy.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          Email : {application.submittedBy.email}
                        </span>
                      </div>

                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-700">
                        ATS {application.atsScore}
                      </span>
                    </div>

                    <div className="h-px w-full bg-slate-200" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Resume</span>

                      <button onClick={() => handleViewResume(application.resume)} className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 transition">

                        View
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7h6m0 0v6m0-6L10 20"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Job
