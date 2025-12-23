import React from 'react'
import api from '../api/axios'
import Error from './Error'
import { useState } from 'react'

const Resume = ({ closeResume, resumeUrl }) => {

    const [showerror, setshowError] = useState(false)
    const [error, setError] = useState({ code: null, message: "" })

    const onClose = () => {
        setshowError(false)
    }
    return (
        <div>
            <div className='absolute z-40 top-0 left-0 p-2 h-full w-full flex items-center justify-between overflow-hidden  bg-linear-to-br from-[#eef2ff] via-[#f8fafc] to-[#ecfeff]'>

                {showerror && <Error error={error} onClose={onClose} />}

                <div className="h-full mr-5 min-w-1/4 rounded-2xl overflow-hidden bg-white/90 shadow-sm shadow-slate-300 flex flex-col">
                </div>

                <div className="flex-1 flex-col h-full">
                    <div className="h-[10%] w-full flex items-center justify-between px-6 mb-4 rounded-2xl bg-white/90  shadow-sm shadow-slate-300">
                        <h2 className=" mx-4 text-xl font-semibold text-slate-800">
                            Resume
                        </h2>

                        <svg
                            onClick={closeResume}
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

                    <div className="h-[87%] p-3 rounded bg-white/95 shadow-sm shadow-slate-300 flex items-center justify-center">
                     <iframe loading='lazy' src={resumeUrl} className='w-full h-full'  title='Resume Preview'></iframe>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Resume
