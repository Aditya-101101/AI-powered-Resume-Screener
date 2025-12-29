import React, { useEffect } from 'react'
import api from '../api/axios'
import Error from './Error'
import { useState } from 'react'


const Resume = ({ closeResume, Application }) => {

  // console.log(Application)
  const [showerror, setshowError] = useState(false)
  const [error, setError] = useState({ code: null, message: "" })
  const [showOptions, setShowOptions] = useState(false)
  const [review, setReview] = useState({

  })

  const onClose = () => {
    setshowError(false)
  }

  const handleGetReview = async () => {
    const data = { application: Application }
    try {
      const response = await api.post('/jobs/application-review', data)

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
                      bg-slate-50 p-5 flex-col`}>
            <div>

              <h3 className="text-sm flex justify-between font-semibold text-slate-700 mb-2">
                <span>
                  Resume Review
                </span>
                {showOptions && <button className="p-1 rounded-md hover:bg-red-100 transition" onClick={() => setShowOptions(false)}>✕</button>}

              </h3>
              <p className="text-xs text-slate-500 overflow-auto leading-relaxed">

              </p>
            </div>
            <div className='flex w-full justify-around'>
              <button onClick={() => handleSetStatus("Accepted")} className='bg-green-200 text-green-400 px-4 py-1 rounded hover:outline-1 hover:cursor-pointer hover:scale-95'>Accept</button>
              <button onClick={() => handleSetStatus("Rejected")} className='bg-red-200 text-red-400 px-4 py-1 rounded hover:outline-1 hover:cursor-pointer hover:scale-95'>Reject</button>
            </div>
          </div>

          {/* RIGHT — PREVIEW */}
          <div className={`${showOptions ? "hidden sm:flex" : "flex"} flex-1 flex-col`}>

            {/* Header */}
            <div className="h-14 px-5 flex items-center justify-between 
                        border-b border-slate-200 bg-white">
              <button className='block lg:hidden' onClick={() => setShowOptions(true)}><img src="../src/assets/menuIcon.png" alt="menu" /></button>
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

            {/* Iframe */}
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
