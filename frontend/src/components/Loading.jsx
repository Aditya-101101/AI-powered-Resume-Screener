import React from 'react'

const Loading = () => {
    return (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center">
            <button
                type="button"
                disabled
                className="flex items-center gap-3 px-6 py-3 rounded-xl
               bg-indigo-600 text-white font-medium
               shadow-lg shadow-indigo-600/30
               cursor-not-allowed"
            >
                <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                </svg>

                Submitting…
            </button>
        </div>

    )
}

export default Loading
