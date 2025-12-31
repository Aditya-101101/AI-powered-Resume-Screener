import React from 'react'
import api from '../api/axios'
import Error from './Error'
import { useState } from 'react'
import Loading from './Loading'

const MAX_SKILLS = 5

const Application = ({ job, closeApplication }) => {

    console.log(job)
    const [resume, setResume] = useState(null)
    const [showerror, setshowError] = useState(false)
    const [error, setError] = useState({ code: null, message: "" })
    const [loading, setLoading] = useState(false)

    const handleResumeChange = (e) => {
        setResume(e.target.files[0])
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        if (!resume) {
            setshowError(true);
            setError({
                code: 400,
                message: "Please upload your resume"
            });
            return;
        }
        const data = new FormData()
        data.append("resume", resume)
        data.append("jobId", job.id)
        console.log(job.id)
        try {
            const response = await api.post('/user/application', data)
            if (response.status === 201) {
                closeApplication()
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
        } finally {
            setLoading(false)
        }
    }

    const onClose = () => {
        setshowError(false)
    }

    return (
        <div className='absolute z-20 h-full w-full flex flex-col gap-3 sm:gap-5 sm:flex-row items-center justify-center px-5 py-3 rounded-r-lg overflow-hidden shadow bg-black/10 backdrop-blur-xl'>
            {showerror && <Error error={error} onClose={onClose} />}
            {loading && <Loading />}
            <div className="h-14 w-full flex sm:hidden items-center justify-between px-6
                    rounded-lg bg-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">
                    Apply Now
                </h2>

                <svg
                    onClick={closeApplication}
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
            <div className="flex flex-row sm:flex-col h-full w-full sm:max-w-[60%] lg:max-w-1/3 rounded-2xl overflow-hidden bg-white shadow-md">

             
                <div className="h-full sm:h-56 lg:h-50 w-0 sm:w-full overflow-hidden bg-slate-800 shrink-0">
                    <img
                        src={`${job.jobCover}`}
                        alt="Job Cover"
                        className="w-full h-full object-cover"
                    />
                </div>

              
                <div className="flex flex-col flex-1 min-h-0 p-5 pt-3 sm:px-3 gap-4">

                 
                    <div>
                        <h2 className="text-xl font-semibold leading-tight">
                            {job.title}
                        </h2>
                        <p className="text-sm text-slate-500">Job opening</p>
                    </div>

                    
                    <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-4">

                        <div className="h-60 block sm:hidden w-full bg-slate-800 shrink-0">
                            <img
                                src={`${job.jobCover}`}
                                alt="Job Cover"
                                className="w-full h-full object-cover"
                            />
                        </div>

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

                    <div className="pt-3  border-t text-sm text-slate-700 flex justify-between shrink-0">
                        <span>Experience Required</span>
                        <span className="font-medium">
                            {job.experienceRequired} yrs
                        </span>
                    </div>

                </div>
            </div>




            <div className="flex flex-col w-full sm:min-w-[40%] lg:min-w-2/3 sm:h-full">
                <div className="h-14 hidden w-full sm:flex items-center justify-between px-6 mb-4
                    rounded-2xl bg-slate-100">
                    <h2 className="text-lg font-semibold text-slate-800">
                        Apply Now
                    </h2>

                    <svg
                        onClick={closeApplication}
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


                <div className="w-full sm:flex-1 py-3 md:py-5 px-10 sm:p-10 rounded-2xl bg-white shadow-md
                    flex items-center justify-center">

                    <form onSubmit={handleFormSubmit} className="w-full min-w-0 sm:space-y-6">
                        <h3 className="text-2xl font-semibold text-slate-800 text-center">
                            Upload Resume
                        </h3>

                        <div className="w-full py-1 md:justify-center flex items-center sm:flex-col justify-around gap-5
                flex-row md:flex-none ">


                            <input
                                type="file"
                                accept=".pdf"
                                name="resume"
                                onChange={handleResumeChange}
                                required
                                className="min-w-30 sm:w-[50%] text-sm text-slate-600
                            sm:file:mr-3 file:py-2 file:px-4 font-semibold
                            file:rounded-lg file:border-0
                            file:bg-slate-800 file:text-white
                           hover:file:bg-slate-700"
                            />

                            <button
                                type="submit"
                                className=" sm:w-[70%] min-w-25 px-2 py-2 sm:py-3 rounded-lg bg-slate-800 text-white 
                            hover:bg-slate-700 transition font-medium">
                                Submit <span className='hidden sm:inline-block'>Application</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>



        </div>
    )
}

export default Application
