import React from 'react'
import api from '../api/axios'
import Error from './Error'
import { useState } from 'react'

const Application = ({ job, closeApplication }) => {

    const [resume, setResume] = useState(null)
    const [showerror, setshowError] = useState(false)
    const [error, setError] = useState({ code: null, message: "" })
    console.log(job)
    const handleResumeChange = (e) => {
        setResume(e.target.files[0])
    }

    const handleFormSubmit = async (e) => {
        e.preventDefault()
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
        }
    }

    const onClose = () => {
        setshowError(false)
    }

    return (
        <div className='absolute z-20 h-full w-full flex items-center justify-center p-5 rounded-r-lg overflow-hidden shadow bg-black/10 backdrop-blur-xl'>
            {showerror && <Error error={error} onClose={onClose} />}

            <div className="h-full mr-5 max-w-1/3 rounded-2xl overflow-hidden bg-white shadow-md flex flex-col">


                <div className="h-60 bg-slate-800 overflow-hidden">
                    <img
                        // src={job.jobCoverUrl}
                        src="../src/assets/FrontendDev.jpg"
                        alt="Job Cover"
                        className="w-full h-full object-cover"
                    />
                </div>



                <div className="flex flex-col gap-4 p-5 flex-1">

                    <div className="">
                        <h2 className="text-xl font-semibold leading-tight">
                            {job.title}
                        </h2>
                        <p className="text-sm">
                            Job opening
                        </p>
                    </div>

                    <p className="text-sm text-slate-600 leading-relaxed line-clamp-6">
                        {job.desc}
                    </p>


                    <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase">
                            Required Skills
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {job.skillsRequired.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 text-xs rounded-full
                                   bg-indigo-50 text-indigo-600"
                                >
                                    {skill}
                                </span>
                            ))}
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


                <div className=" flex-1 p-10 rounded-2xl bg-white shadow-md
                    flex items-center justify-center">

                    <form onSubmit={handleFormSubmit} className="w-full max-w-sm space-y-6">
                        <h3 className="text-2xl font-semibold text-slate-800 text-center">
                            Upload Resume
                        </h3>

                        <input
                            type="file"
                            accept=".pdf"
                            name="resume"
                            onChange={handleResumeChange}
                            required
                            className="block w-full text-sm text-slate-600
                           file:mr-3 file:py-2 file:px-4
                           file:rounded-lg file:border-0
                           file:bg-slate-800 file:text-white
                           hover:file:bg-slate-700"
                        />

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-slate-800 text-white
                           hover:bg-slate-700 transition font-medium">
                            Submit Application
                        </button>
                    </form>
                </div>
            </div>



        </div>
    )
}

export default Application
