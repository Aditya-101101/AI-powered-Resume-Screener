import React, { useEffect } from 'react'
import api from '../api/axios'
import Error from './Error'
import AtsExplanation from './AtsExplanation'
import { useState } from 'react'


const Resume = ({ closeResume, Application }) => {
  // console.log(Application._id)
  const [showerror, setshowError] = useState(false)
  const [error, setError] = useState({ code: null, message: "" })
  const [showOptions, setShowOptions] = useState(false)
  const [feedback, setFeedback] = useState("")
  const [review, setReview] = useState({
    meta: {},
    numericReview: {},
    textualReview: {}
  })

  const onClose = () => {
    setshowError(false)
  }

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault()
    const data = {
      feedback: feedback,
      jobId: Application.jobId,
      applicationId: Application._id
    }
    try {
      const response = await api.post('/recruiter/feedback', data)
      if (response.status === 201) {
        alert('feedback submitted successfully')
        setFeedback("")
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
  const handleGetReview = async () => {
    const data = { application: Application }
    try {
      const response = await api.post('/jobs/application-review', data)
      if (response.status === 201) {
        // console.log(response.data.review)
        setReview(response.data.review)
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
    handleGetReview()
  }, [])

  const handleSetStatus = async (status) => {
    const data = {
      applicationId: Application._id,
      applicationStatus: status
    }
    try {
      const response = await api.patch('/recruiter/update-applicationStatus', data)
      if (response.status === 200) {
        alert(`Application ${status} Successfully!`)
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
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center 
                  bg-black/30 backdrop-blur-sm p-4">

        {showerror && <Error error={error} onClose={onClose} />}

        <div className="h-full w-full max-w-7xl rounded-2xl 
                    bg-white/90 shadow-2xl overflow-hidden flex">


          <div className={`${showOptions ? "flex" : "hidden"} lg:flex justify-between ${showOptions ? "w-full sm:w-[40%]" : "w-[22%]"} border-r border-slate-200 
                      bg-slate-50 p-5 sm:py-3 px-5 flex-col`}>
            <div>

              <h3 className="text-sm flex justify-between font-semibold text-slate-700 mb-2">
                <span>
                  Resume Review
                </span>
                {showOptions && <button className="p-1 rounded-md hover:bg-red-100 transition" onClick={() => setShowOptions(false)}>✕</button>}

              </h3>
              <div className="space-y-4 sm:space-y-2 text-xs text-slate-600">


                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Overall Verdict
                  </p>
                  <p
                    className={`mt-1 text-sm font-semibold ${review.textualReview.overall === "Strong Fit"
                      ? "text-green-600"
                      : review.textualReview.overall === "Moderate Fit"
                        ? "text-yellow-600"
                        : "text-red-600"
                      }`}
                  >
                    {review.textualReview.overall || "—"}
                  </p>
                </div>


                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-white p-2 text-center shadow-sm">
                    <p className="text-[10px] text-slate-400">Experience</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {review.numericReview.experienceScore ?? "-"} / 10
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-2 text-center shadow-sm">
                    <p className="text-[10px] text-slate-400">Skills</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {review.numericReview.skillsScore ?? "-"} / 20
                    </p>
                  </div>

                  <div className="rounded-lg bg-white p-2 text-center shadow-sm">
                    <p className="text-[10px] text-slate-400">Total</p>
                    <p className="text-sm font-semibold text-slate-800">
                      {review.numericReview.totalScore ?? "-"} / 30
                    </p>
                  </div>
                </div>


                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Experience Review
                  </p>
                  <p className="mt-1 text-slate-500 leading-relaxed">
                    {review.textualReview.experience || "No experience review available."}
                  </p>
                </div>

                <div className="rounded-lg bg-white p-3 shadow-sm">
                  <p className="text-[11px] uppercase tracking-wide text-slate-400">
                    Skills Review
                  </p>
                  <p className="mt-1 text-slate-500 leading-relaxed">
                    {review.textualReview.skills || "No skills review available."}
                  </p>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Matched {review.meta.matchedSkills ?? 0} of{" "}
                    {review.meta.totalSkills ?? 0} required skills
                  </p>
                </div>

                {Application.atsExplanation && (
                  <div className="rounded-lg bg-white p-3 shadow-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-400 mb-2">
                      ATS Score Breakdown
                    </p>
                    <AtsExplanation
                      explanation={Application.atsExplanation}
                      breakdown={Application.atsBreakdown}
                      score={Application.atsScore}
                    />
                  </div>
                )}

                <div className="rounded-lg bg-white p-1.5 shadow-sm">
                  <form className='flex flex-col gap-2' onSubmit={handleFeedbackSubmit}>
                    <textarea value={feedback} name="feedback" id="feedback" placeholder='enter your feedback' onChange={e => setFeedback(e.target.value)} row={3} required className='resize-none min-h-25 sm:min-h-13 p-1 outline-blue-500'></textarea>
                    <button type="submit" className='bg-blue-400 text-white rounded px-4 py-2 hover:cursor-pointer hover:outline-1 hover:outline-cyan-400'>Add Feedback</button>
                  </form>
                </div>

              </div>

            </div>
            <div className='flex w-full justify-around'>
              <button onClick={() => handleSetStatus("Accepted")} className='bg-green-200 text-green-400 px-4 py-1 rounded hover:outline-1 hover:cursor-pointer hover:scale-95'>Accept</button>
              <button onClick={() => handleSetStatus("Rejected")} className='bg-red-200 text-red-400 px-4 py-1 rounded hover:outline-1 hover:cursor-pointer hover:scale-95'>Reject</button>
            </div>
          </div>

          <div className={`${showOptions ? "hidden sm:flex" : "flex"} flex-1 flex-col`}>

            <div className="h-14 px-5 flex items-center justify-between 
                        border-b border-slate-200 bg-white">
              <button className='block lg:hidden' onClick={() => setShowOptions(true)}><img src="/assets/menuIcon.png" alt="menu" /></button>
              <h2 className="text-lg font-semibold text-slate-800">
                Resume
              </h2>

              <button
                onClick={closeResume}
                className="p-1 rounded-md hover:bg-red-100 transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 bg-slate-100 p-3">
              <div className="h-full w-full rounded-xl overflow-hidden 
                          bg-white shadow-inner border border-slate-200">
                <iframe
                  loading="lazy"
                  src={Application.resume}
                  title="Resume Preview"
                  className="w-full h-full"
                />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>


  )
}

export default Resume
