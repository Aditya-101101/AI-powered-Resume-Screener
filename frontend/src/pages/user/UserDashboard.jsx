import React, { useState, useEffect } from "react";
import StatCard from "../../components/StatCard";
import api from '../../api/axios'
import Error from "../../components/Error";
import { useNavigate } from 'react-router-dom'

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
    const [content, setContent] = useState("")

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

    return (
        <div className="min-h-screen w-full bg-linear-to-br from-[#eef2ff] via-[#f8fafc] to-[#ecfeff] flex items-center justify-center text-slate-800">

            {showerror && <Error error={error} onClose={onClose} />}
            <div className="relative h-[95vh] w-[95vw] rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] bg-white/60 backdrop-blur-xl">

                <div className="flex h-full">
                    <aside
                        className={` w-65 p-5 bg-linear-to-b from-indigo-300 via-slate-100 to-white border-r border-slate-200 fixed lg:static inset-y-0 left-0 z-30 transition-transform duration-300 ${showSidebar ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>

                        <img src="../public/resumeScreenerLogo.png" alt="logo" className="mb-7 flex h-12" />



                        <nav className="space-y-2 text-sm">

                            <div className="px-3 items-center justify-start py-2 gap-3 rounded-lg flex text-slate-700 cursor-pointer bg-indigo-500/10 hover:bg-indigo-700/10 hover:text-indigo-600 transition" >
                                <img src={`../public/userAvatars/${userAvatar}.png`} alt="userAvatar" className="h-15 w-15 rounded-full" /><span className="text-xl font-semibold wrap-break-word">{userName}</span>
                            </div>
                            <div className="text-sm font-semibold text-center">{email}</div>
                        </nav>
                        <div className="space-y-2 text-sm p-4 my-10 rounded-lg bg-indigo-500/10">
                            <ul className="gap-3 ">
                                <li name="overview" onClick={()=>setContent("overview")} className="px-3 items-center rounded-lg justify-start py-2 gap-3  flex text-slate-700 cursor-pointer font-semibold hover:bg-indigo-700/10 hover:text-indigo-600 transition">Overview</li>
                                <li name="jobs" onClick={()=>setContent("jobs")} className="px-3 items-center rounded-lg justify-start py-2 gap-3  flex text-slate-700 cursor-pointer font-semibold  hover:bg-indigo-700/10 hover:text-indigo-600 transition">Jobs</li>
                            </ul>
                        </div>
                        <button onClick={handleUserLogout} className="px-4 bottom-8 absolute flex gap-1 rounded-xl py-1.5 text-slate-600 hover:text-red-500 hover:bg-red-600/20 hover:fill-red-500 transition">
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


                    <main className="flex-1 flex flex-col">


                        <header className="
                            h-14 px-5 flex items-center
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


                        {content === "overview" && <section className="flex-1 p-6 bg-linear-to-br from-slate-50 via-white to-cyan-50">
                            <div className="
                                h-full rounded-2xl
                                bg-white/80 backdrop-blur
                                shadow-lg
                                p-6">
                                <h2 className="text-lg font-semibold text-slate-700 mb-6">
                                    Overview
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
