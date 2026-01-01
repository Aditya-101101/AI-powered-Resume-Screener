import React from "react";

const Footer = () => {
    return (
        <footer className="mt-auto w-full group">
            <div className=" mx-auto max-w-6xl px-6 py-4 text-center text-xs text-slate-500 transition-all duration-300 group-hover:text-slate-800">
                <span className="opacity-100 group-hover:opacity-0 transition">
                    © {new Date().getFullYear()} • Built with care
                </span>

                <span className=" absolute left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition  ">
                    Crafted by Aditya 🚀
                </span>
            </div>
            <div className=" h-px w-0 bg-linear-to-r from-indigo-500 to-cyan-400 mx-auto transition-all duration-500 group-hover:w-2/3 " />
        </footer>
    );
};

export default Footer;
