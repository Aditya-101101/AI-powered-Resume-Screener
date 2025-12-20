import React, { useState, useEffect } from "react";
import StatCard from "../../components/StatCard";
import api from '../../api/axios'
import Error from "../../components/Error";
import { useNavigate } from 'react-router-dom'
import Application from "../../components/Application";

const UserDashboard = () => {
    const navigate = useNavigate()

    const [showSidebar, setShowSidebar] = useState(false)
    const [showerror, setshowError] = useState(false)
    const [error, setError] = useState({ code: null, message: "" })
    const [userName, setuserName] = useState("")
    const [userAvatar, setuserAvatar] = useState("")
    const [email, setEmail] = useState("")
    const [jobs, setJobs] = useState([])
    const [applications, setApplications] = useState([])
    const [content, setContent] = useState("overview")
    const [jobDetail, setJobDetail] = useState({
        title: "",
        desc: "",
        skillsRequired: [],
        experienceRequired: null,
        jobCoverUrl: null
    })
    const [showApplication, setshowApplication] = useState(false)

    useEffect(() => {
        const getUserData = async () => {

            try {
                const response = await api.get('/user/data')
                if (response.status === 200) {
                    const userData = response.data.user
                    setuserName(userData.name)
                    setuserAvatar(userData.userAvatar)
                    setEmail(userData.email)
                    const Applications = response.data.applications
                    console.log(Applications)
                    setApplications(Applications)
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
        getUserData()
    }, [])

    useEffect(() => {
        const getJobs = async () => {
            try {
                const response = await api.get('/jobs/')
                if (response.status === 200) {
                    const jobs = response.data.jobs
                    setJobs(jobs)
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
        getJobs()
    }, [])


    const handleUserLogout = async () => {
        try {
            const response = await api.get('/user/logout')
            if (response.status === 200) {
                navigate('/user-login')
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

    const handleJobApply = (job) => {
        setJobDetail({
            id: job._id,
            title: job.title,
            desc: job.desc,
            skillsRequired: job.skillsRequired,
            experienceRequired: job.experienceRequired,
            jobCoverUrl: job.jobCoverUrl
        })
        setshowApplication(true)
    }
    const closeApplication = () => setshowApplication(false)

    return (
        <div className="h-screen w-screen bg-linear-to-br from-[#eef2ff] via-[#f8fafc] to-[#ecfeff] flex items-center justify-center text-slate-800">

            {showerror && <Error error={error} onClose={onClose} />}

            <div className="relative h-[95vh] w-[95vw] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] bg-white/60 backdrop-blur-xl">

                <div className="flex w-full h-full">
                    <aside
                        className={`w-66 p-5 bg-linear-to-b from-indigo-300 via-slate-100 to-white border-r border-slate-200 fixed lg:static inset-y-0 left-0 z-30 transition-transform duration-300 ${showSidebar ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>

                        <img src="../public/resumeScreenerLogo.png" alt="logo" className="mb-7 flex h-12" />
                        <nav className="space-y-2 text-sm">

                            <div className="px-3 items-center justify-start py-2 gap-3 rounded-lg flex text-slate-700 cursor-pointer bg-indigo-500/10 hover:bg-indigo-700/10 hover:text-indigo-600 transition" >
                                <img src={`../public/userAvatars/${userAvatar}.png`} alt="userAvatar" className="h-15 w-15 rounded-full" /><span className="text-xl font-semibold wrap-break-word">{userName}</span>
                            </div>
                            <div className="text-sm font-semibold text-center">{email}</div>
                        </nav>
                        <div className="space-y-2 text-sm p-4 my-10 rounded-lg bg-indigo-500/10">
                            <ul className="gap-3 ">
                                <li name="overview" onClick={() => setContent("overview")} className="px-3 items-center rounded-lg justify-start py-2 gap-3  flex text-slate-700 cursor-pointer font-semibold hover:bg-indigo-700/10 hover:text-indigo-600 transition">Overview</li>
                                <li name="jobs" onClick={() => setContent("jobs")} className="px-3 items-center rounded-lg justify-start py-2 gap-3  flex text-slate-700 cursor-pointer font-semibold  hover:bg-indigo-700/10 hover:text-indigo-600 transition">Jobs</li>
                                <li name="applications" onClick={() => setContent("applications")} className="px-3 items-center rounded-lg justify-start py-2 gap-3  flex text-slate-700 cursor-pointer font-semibold  hover:bg-indigo-700/10 hover:text-indigo-600 transition">Applications</li>
                            </ul>
                        </div>
                        <button onClick={() => handleUserLogout} className="px-4 bottom-8 absolute flex gap-1 rounded-xl py-1.5 text-slate-600 hover:text-red-500 hover:bg-red-600/20 hover:fill-red-500 transition">
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

                        {showApplication && <Application closeApplication={closeApplication} job={jobDetail} />}
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
                                        title="Applications"
                                        value={applications.length}
                                        gradient="from-indigo-500/20 to-indigo-300/10"
                                        color="text-indigo-600" />
                                    <StatCard
                                        title="Shortlisted"
                                        value="4"
                                        gradient="from-teal-500/20 to-cyan-300/10"
                                        color="text-teal-600" />
                                    <StatCard
                                        title="Rejected"
                                        value="8"
                                        gradient="from-rose-500/20 to-pink-300/10"
                                        color="text-rose-600"
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto  rounded-lg p-4 flex flex-col gap-4">
                                    {applications.length === 0 ? (
                                        <div className="text-2xl font-bold text-center mt-20">
                                            !! No Applications to Show !!
                                        </div>
                                    ) : (
                                        applications.map(application => (
                                            <div
                                                key={application._id}
                                                className="flex gap-5 bg-green-200 rounded p-3"
                                            >
                                                <span>{application.status}</span>
                                                <span>{application.atsScore}</span>
                                            </div>
                                        ))
                                    )}
                                </div>

                            </div>
                        </section>}

                        {content === "jobs" && <section className="flex-1 p-6 bg-linear-to-br from-slate-50 via-white to-cyan-50">
                            <div className="h-full flex flex-col rounded-2xl bg-white/80 backdrop-blur shadow-lg p-6">
                                <h2 className="text-lg font-semibold text-slate-700 mb-6">
                                    Jobs
                                </h2>


                                <div className="flex-1 overflow-y-auto  rounded-lg p-4 flex flex-col gap-4">
                                    {jobs.length === 0 ? (
                                        <div className="text-2xl font-bold text-center mt-20">
                                            !! No Job to Show !!
                                        </div>
                                    ) : (
                                        jobs.map(job => (
                                            <div
                                                key={job._id}
                                                className="w-55 flex flex-col gap-4 rounded-2xl bg-white shadow-md border border-slate-200 hover:shadow-lg transition"
                                            >
                                                <div className="h-32 rounded-t-2xl bg-linear-to-r from-indigo-500/20 via-cyan-400/20 to-teal-300/20 flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-slate-700">
                                                        Job Opening
                                                    </span>
                                                </div>


                                                <div className="p-4 flex flex-col gap-3">
                                                    <h3 className="text-lg font-semibold text-slate-800">
                                                        {job.title}
                                                    </h3>

                                                    <p className="text-sm text-slate-600 line-clamp-3">
                                                        {job.desc}
                                                    </p>

                                                    <div className="flex flex-wrap gap-2">
                                                        {job.skillsRequired.map((skill, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-1 text-xs font-medium rounded-full bg-indigo-500/10 text-indigo-600"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>


                                                    <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                                                        <span className="text-sm font-medium text-slate-700">
                                                            {job.experienceRequired} yr exp
                                                        </span>

                                                        <button onClick={() => handleJobApply(job)}
                                                            className="px-4 py-1.5 text-sm font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition"
                                                        >
                                                            Apply
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                        ))
                                    )}
                                </div>

                            </div>
                        </section>}

                        {content === "applications" && <section className="flex-1 p-6 bg-linear-to-br from-slate-50 via-white to-cyan-50">
                            <div className="
                                h-full rounded-2xl
                                bg-white/80 backdrop-blur
                                shadow-lg
                                p-6">
                                <h2 className="text-lg font-semibold text-slate-700 mb-6">
                                    Applications
                                </h2>


                                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                    <StatCard
                                        title="Applications"
                                        value={applications.length}
                                        gradient="from-indigo-500/20 to-indigo-300/10"
                                        color="text-indigo-600"
                                    />
                                    <StatCard
                                        title="Shortlisted"
                                        value="4"
                                        gradient="from-teal-500/20 to-cyan-300/10"
                                        color="text-teal-600"
                                    />
                                    <StatCard
                                        title="Rejected"
                                        value="8"
                                        gradient="from-rose-500/20 to-pink-300/10"
                                        color="text-rose-600"
                                    />
                                </div>
                            </div>
                        </section>}
                    </main>
                </div>
            </div>
        </div>
    );
};



export default UserDashboard;
