import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import api from '../../api/axios'
import Error from '../../components/Error'

const UserLogin = () => {
    const navigate = useNavigate()

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState({ code: null, message: "" })
    const [showerror, setshowError] = useState(false)

    const handleFormSubmit = async (e) => {
        e.preventDefault()

        const data = {
            email,
            password
        }
        try {
            const response = await api.post('/user/login', data)
            if (response.status === 200) {
                console.log(response)
                navigate('/user-dashboard')

                setEmail("")
                setPassword("")
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
                        Login to your account
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Login to continue reviewing resumes
                    </p>
                </div>


                <form className="space-y-4" onSubmit={handleFormSubmit} >
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
                            placeholder='use a-z , A-Z , 0-9 , @$#!%*?& , min-length-8'
                            onChange={e => setPassword(e.target.value)}
                            required
                            pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&]).{8,}"
                            className="mt-1 w-full rounded-lg bg-white/70 px-3 py-2 text-sm text-slate-800 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-indigo-400"
                        />
                    </div>
                    <button
                        type="submit"
                        className="mt-4 w-full rounded-lg bg-indigo-500 py-2 text-sm font-semibold text-white hover:bg-indigo-600 transition"
                    >
                        Login
                    </button>
                </form>


                <p className="mt-6 text-center text-sm text-slate-500">
                    New Here?{" "}
                    <Link
                        to="/user-register"
                        className="font-medium text-indigo-500 hover:underline"
                    >
                        Register to start reviewing your resume
                    </Link>
                </p>
            </div>

        </div>
    )
}

export default UserLogin
