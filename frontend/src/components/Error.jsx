import { XCircle } from "lucide-react";

const Error = ({ error, onClose }) => {
    if (!error?.message) return null;

    return (
        <div className="fixed top-6 left-1/2 z-50 w-[90%] max-w-2xl -translate-x-1/2">
            <div className="flex items-start gap-4 rounded-xl bg-red-500/90 px-5 py-4 text-white shadow-xl backdrop-blur-md animate-slide-down">


                <XCircle className="h-6 w-6 shrink-0 mt-0.5" />


                <div className="flex-1">
                    <p className="text-sm font-semibold">
                        Error {error.code}
                    </p>
                    <p className="text-sm opacity-90">
                        {error.message}
                    </p>
                </div>

                <button
                    onClick={onClose}
                    className="opacity-80 hover:opacity-100 transition"
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default Error;
