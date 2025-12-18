import React from 'react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import Error from '../../components/Error'

const UserSignUp = () => {
    const navigate = useNavigate()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [userAvatar, setUserAvatar] = useState("")
    const [showSelectAvatar, setShowSelectAvatar] = useState(false)
    const [showerror, setshowError] = useState(false)
    const [error, setError] = useState({ code: null, message: "" })

    const handleFormSubmit = async (e) => {
        e.preventDefault()

        const userData = {
            name,
            email,
            password,
            userAvatar
        }

        try {
            const response = await api.post('/user/signup', userData)
            if (response.status === 201) {
                console.log(response.data.user)

                navigate('/user-dashboard')

                setName("")
                setEmail("")
                setPassword("")
                setUserAvatar("")
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
        <div className="min-h-screen w-full flex items-center justify-center bg-linear-to-br from-[#f8f8f9] via-[#ebedf1] to-[#e0e3eb]">
            {showerror && <Error error={error} onClose={onClose} />}
            <div className="w-full max-w-md rounded-2xl my-8 bg-white/40 backdrop-blur-lg shadow-2xl px-6 py-8">


                <div className="text-center mb-6">
                    <img
                        src="/resumeScreenerLogo.png"
                        alt="Logo"
                        className="mx-auto h-16 mb-3"
                    />
                    <h2 className="text-2xl font-bold text-slate-800">
                        Create your account
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Sign up to start reviewing resumes
                    </p>
                </div>


                <form className="space-y-4" onSubmit={handleFormSubmit}>


                    <div>
                        <label className="block text-sm font-medium text-slate-600">
                            Full name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-800 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-slate-600">
                            Email address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-800 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-slate-600">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-800 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-slate-600 mb-2">
                            Avatar
                        </label>

                        <div className="flex items-center gap-4">

                            <div className="h-14 w-14 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                                {userAvatar ? (
                                    <img
                                        src={`/userAvatars/${userAvatar}.png`}
                                        alt="avatar"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-xs text-slate-400">None</span>
                                )}
                            </div>


                            <button
                                type="button"
                                onClick={() => setShowSelectAvatar(true)}
                                className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 transition"
                            >
                                Choose Avatar
                            </button>
                        </div>
                    </div>


                    <button
                        type="submit"
                        className="mt-4 w-full rounded-lg bg-indigo-500 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition"
                    >
                        Register
                    </button>
                </form>


                <p className="mt-6 text-center text-sm text-slate-500">
                    Already registered?{" "}
                    <Link
                        to="/user-login"
                        className="font-medium text-indigo-500 hover:underline"
                    >
                        Login
                    </Link>
                    <span> | Register as a
                        <Link to="/recruiter-register">
                            <span className='pl-1 font-medium text-indigo-500 hover:underline hover:cursor-pointer'>Recruiter</span>
                        </Link>
                    </span>
                </p>
            </div>


            {showSelectAvatar && (
                <>
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-10"
                        onClick={() => setShowSelectAvatar(false)}
                    />

                    <div className="fixed inset-0 z-20 flex items-center justify-center">
                        <div className="w-85 rounded-xl bg-white p-5 shadow-2xl">
                            <h3 className="text-center text-sm font-semibold text-slate-800 mb-4">
                                Select Avatar
                            </h3>

                            <div className="grid grid-cols-3 gap-3 place-items-center">
                                {Array.from({ length: 6 }).map((_, i) => {
                                    const avatar = `userAvatar_${i + 1}`;
                                    return (
                                        <img
                                            key={avatar}
                                            src={`/userAvatars/${avatar}.png`}
                                            alt={avatar}
                                            onClick={() => {
                                                setUserAvatar(avatar);
                                                setShowSelectAvatar(false);
                                            }}
                                            className={`h-16 w-16 cursor-pointer rounded-full object-cover transition
                                                ${userAvatar === avatar
                                                    ? "ring-2 ring-indigo-500 scale-105"
                                                    : "hover:ring-2 hover:ring-indigo-300"
                                                }`}
                                        />
                                    );
                                })}
                            </div>

                            <p className="mt-4 text-center text-xs text-slate-500">
                                Click an avatar to select
                            </p>
                        </div>
                    </div>
                </>
            )}
        </div>

    )
}

export default UserSignUp
