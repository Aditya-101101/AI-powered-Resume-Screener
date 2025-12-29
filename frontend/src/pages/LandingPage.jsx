import React from "react"
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import api from "../api/axios"

const LandingPage = () => {

    const navigate = useNavigate()

    useEffect(() => {
        const handleLoggedUserRedirect = async () => {
            try {

                const response = await api.get('/')
                if (response.status === 200) {
                    if (response.data.role === "USER")
                        navigate('/user-dashboard', { replace: true })
                    else if (response.data.role === "RECRUITER")
                        navigate('/recruiter-dashboard', { replace: true })
                }
            } catch (err) {
            }
        }

        handleLoggedUserRedirect()
    }, [])



    const handleLoginClick = () => {
        navigate('/user-login')
    }

    const handleGetStartedClick = () => {
        navigate('/user-register')
    }

    const handleRegisterRecruiterClick = () => {
        navigate('/recruiter-register')
    }

    return (
        <div className="min-h-screen pb-10 bg-linear-to-br from-[#f7f8fb] via-[#eef1f7] to-[#e8ecf4] text-[#1e293b]">

            <nav className="flex justify-between items-center px-3 sm:px-12 py-6">
                <h1 className="text-xl font-semibold tracking-wide">
                    Re<span className="text-teal-500">Screener</span>
                </h1>
                <div className="flex gap-4">
                    <button onClick={handleLoginClick} className="px-4 py-2 rounded-xl text-md hover:bg-black/5 transition">
                        Login
                    </button>
                    <button onClick={handleGetStartedClick} className="sm:px-6 px-2 py-2 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition shadow-md">
                        Get Started
                    </button>
                </div>
            </nav>


            <section className="mt-24 text-center px-6">
                <h2 className="text-5xl font-bold max-w-4xl mx-auto leading-tight">
                    Automated Resume
                    <span className="text-teal-500"> Screening Platform</span>
                </h2>

                <p className="mt-6 max-w-2xl mx-auto text-slate-600">
                    A structured ATS-style system where candidates check resume
                    compatibility and recruiters screen applications efficiently.
                </p>

                <div className="mt-10 flex justify-center gap-6">
                    <button onClick={handleGetStartedClick} className="px-8 py-3 rounded-2xl bg-teal-500 text-white hover:bg-teal-600 transition shadow-lg">
                        For Candidates
                    </button>
                    <button onClick={handleRegisterRecruiterClick} className="px-8 py-3 rounded-2xl bg-white/60 backdrop-blur-md border border-white shadow-md hover:bg-white transition">
                        For Recruiters
                    </button>
                </div>
            </section>


            <section className="mt-28 px-10">
                <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">


                    <div className="
                        p-10 rounded-4xl
                        bg-white/60 backdrop-blur-xl
                        border border-white
                        shadow-[0_20px_40px_rgba(0,0,0,0.08)]
                    ">
                        <h3 className="text-2xl font-semibold text-teal-600 mb-4">
                            For Candidates
                        </h3>
                        <ul className="space-y-4 text-slate-600">
                            <li>• Upload your resume in PDF format</li>
                            <li>• Get an ATS-style compatibility score</li>
                            <li>• Apply to jobs using a single profile</li>
                            <li>• Track application status</li>
                        </ul>
                        <button className="mt-8 px-6 py-3 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition">
                            Upload Resume
                        </button>
                    </div>


                    <div className="
                        p-10 rounded-4xl
                        bg-white/60 backdrop-blur-xl
                        border border-white
                        shadow-[0_20px_40px_rgba(0,0,0,0.08)]
                    ">
                        <h3 className="text-2xl font-semibold text-violet-600 mb-4">
                            For Recruiters
                        </h3>
                        <ul className="space-y-4 text-slate-600">
                            <li>• Create and manage job postings</li>
                            <li>• Automatically screen incoming resumes</li>
                            <li>• Rank candidates using ATS scores</li>
                            <li>• Update application status</li>
                        </ul>
                        <button className="mt-8 px-6 py-3 rounded-xl bg-violet-500 text-white hover:bg-violet-600 transition">
                            Post a Job
                        </button>
                    </div>

                </div>
            </section>


            <section className="mt-32 px-10 text-center">
                <h3 className="text-3xl font-semibold mb-16">
                    How It Works
                </h3>

                <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto text-slate-600">
                    <div>
                        <h4 className="text-teal-500 font-semibold mb-2">Upload</h4>
                        <p>Candidates upload resumes and recruiters post job requirements.</p>
                    </div>
                    <div>
                        <h4 className="text-teal-500 font-semibold mb-2">Score</h4>
                        <p>Resumes are evaluated using structured ATS-style logic.</p>
                    </div>
                    <div>
                        <h4 className="text-teal-500 font-semibold mb-2">Shortlist</h4>
                        <p>Recruiters review ranked applications and take action.</p>
                    </div>
                </div>
            </section>

            <section className="mt-36 mb-24 px-6 flex justify-center">
                <div className="
                    max-w-4xl w-full p-12 rounded-[36px]
                    bg-linear-to-br from-teal-400/20 to-violet-400/20
                    backdrop-blur-xl
                    border border-white
                    shadow-[0_25px_60px_rgba(0,0,0,0.12)]
                    text-center
                ">
                    <h3 className="text-3xl font-bold mb-4">
                        Simple. Transparent. Practical.
                    </h3>
                    <p className="text-slate-600 mb-8">
                        Built for clear resume screening without unnecessary complexity.
                    </p>
                    <button onClick={handleGetStartedClick} className="px-8 py-3 rounded-xl bg-teal-500 text-white hover:bg-teal-600 transition">
                        Get Started
                    </button>
                </div>
            </section>

        </div>
    )
}

export default LandingPage
