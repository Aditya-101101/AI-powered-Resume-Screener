import React, { useState, useEffect } from "react";
import StatCard from "../../components/StatCard";
import api from "../../api/axios";
import Error from "../../components/Error";
import { useNavigate } from "react-router-dom";
import Application from "../../components/Application";
import ApplicationStatusPie from "../../components/PieChart";

const MAX_SKILLS = 5;

const UserDashboard = () => {
  const navigate = useNavigate();

  const [showSidebar, setShowSidebar] = useState(false);
  const [showerror, setshowError] = useState(false);
  const [error, setError] = useState({ code: null, message: "" });
  const [userName, setuserName] = useState("");
  const [userAvatar, setuserAvatar] = useState("");
  const [email, setEmail] = useState("");
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [atsStats, setAtsStats] = useState({
    avg: 0,
    max: 0,
    min: 0,
  });
  const [applicationsStatusCount, setApplicationsStatusCount] = useState({
    totalCount: 0,
    acceptedCount: 0,
    underReviewCount: 0,
    rejectedCount: 0,
  });
  const [content, setContent] = useState("overview");
  const [jobDetail, setJobDetail] = useState({
    title: "",
    desc: "",
    skillsRequired: [],
    experienceRequired: null,
    jobCover: null,
  });

  const [showApplication, setshowApplication] = useState(false);

  const [applicationPageCount, setApplicationPageCount] = useState(0);
  const [applicationPage, setApplicationPage] = useState(1);

  const [jobPageCount, setJobPageCount] = useState(0);
  const [jobPage, setJobPage] = useState(1);

  const getTheme = (status) => {

    if (status === "Applied" || status === "UnderReview")
      return "bg-indigo-50 text-indigo-600  border-indigo-100";
    else if (status === "Accepted")
      return "bg-green-50 text-green-600  border-green-100";
    else return "bg-red-50 text-red-600  border-red-100";
  };

  const getUserData = async () => {
    try {
      const response = await api.get(`/user/data?page=${applicationPage}`);
      if (response.status === 200) {
        const userData = response.data.user;
        const paginationDetails = response.data.pagination;
        setApplicationsStatusCount({
          totalCount: paginationDetails.applicationCount,
          acceptedCount: paginationDetails.acceptedCount,
          underReviewCount: paginationDetails.underReviewCount,
          rejectedCount: paginationDetails.rejectedCount,
        });
        setAtsStats({
          avg: userData.avgScore,
          min: userData.lowestScore,
          max: userData.highestScore,
        });
        setApplicationPageCount(paginationDetails.pageCount);
        setuserName(userData.name);
        setuserAvatar(userData.userAvatar);
        setEmail(userData.email);
        const Applications = response.data.applications;
        // console.log(Applications)
        setApplications(Applications);
      }
    } catch (err) {
      setshowError(true);
      setError({
        code: err.response?.status || 500,
        message: err.response?.data?.message || "Something went wrong",
      });
      setTimeout(() => {
        setshowError(false);
        setError({
          code: null,
          message: "",
        });
      }, 5000);

      console.log(err);
    }
  };

  const handleApplicationPageNext = () => {
    setApplicationPage(applicationPage + 1);
  };
  const handleApplicationPagePrevious = () => {
    setApplicationPage(applicationPage - 1);
  };
  const handleJobPageNext = () => {
    setJobPage(jobPage + 1);
  };
  const handleJobPagePrevious = () => {
    setJobPage(jobPage - 1);
  };

  useEffect(() => {
    getUserData();
  }, [content, applicationPage]);

  const getJobs = async () => {
    try {
      const response = await api.get(`/jobs/?page=${jobPage}`);
      if (response.status === 200) {
        const jobs = response.data.jobs;
        const paginationDetails = response.data.pagination;
        setJobPageCount(paginationDetails.pageCount);
        setJobs(jobs);
      }
    } catch (err) {
      setshowError(true);
      setError({
        code: err.response?.status || 500,
        message: err.response?.data?.message || "Something went wrong",
      });
      setTimeout(() => {
        setshowError(false);
        setError({
          code: null,
          message: "",
        });
      }, 5000);

      console.log(err);
    }
  };

  useEffect(() => {
    getJobs();
  }, [jobPage]);

  const handleUserLogout = async () => {
    try {
      const response = await api.get("/user/logout");
      if (response.status === 200) {
        navigate("/user-login");
      }
    } catch (err) {
      setshowError(true);
      setError({
        code: err.response?.status || 500,
        message: err.response?.data?.message || "Something went wrong",
      });
      setTimeout(() => {
        setshowError(false);
        setError({
          code: null,
          message: "",
        });
      }, 5000);

      console.log(err);
    }
  };

  const onClose = () => {
    setshowError(false);
  };

  const handleJobApply = (job) => {
    setJobDetail({
      id: job._id,
      title: job.title,
      desc: job.desc,
      skillsRequired: job.skillsRequired,
      experienceRequired: job.experienceRequired,
      jobCover: job.jobCover,
    });
    setshowApplication(true);
  };
  const closeApplication = () => setshowApplication(false);

  return (
    <div className="h-screen w-screen bg-linear-to-br from-[#eef2ff] via-[#f8fafc] to-[#ecfeff] flex items-center justify-center text-slate-800">
      {showerror && <Error error={error} onClose={onClose} />}

      <div className="relative md:h-[95vh] md:w-[95vw] w-full h-full md:rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] bg-white/60 backdrop-blur-xl">
        <div className="flex w-full h-full">
          <aside
            className={`max-w-66 md:w-66 p-5 bg-linear-to-b from-indigo-300 via-slate-100 to-white border-r border-slate-200 fixed lg:static inset-y-0 left-0 z-30 transition-transform duration-300 ${showSidebar ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
          >
            <img
              src="/resumeScreenerLogo.png"
              alt="logo"
              className="mb-7 flex h-12"
            />
            <nav className="space-y-2 text-sm">
              <div className="px-3 items-center justify-start py-2 gap-3 rounded-lg flex text-slate-700 cursor-pointer bg-indigo-500/10 hover:bg-indigo-700/10 hover:text-indigo-600 transition">
                <img
                  src={`/userAvatars/${userAvatar}.png`}
                  alt="userAvatar"
                  className="h-15 w-15 rounded-full"
                />
                <span className="text-xl font-semibold wrap-break-word">
                  {userName}
                </span>
              </div>
              <div className="text-sm font-semibold text-center">{email}</div>
            </nav>
            <div className="space-y-2 text-sm p-4 my-10 rounded-lg bg-indigo-500/10">
              <ul className="gap-3 ">
                <li
                  name="overview"
                  onClick={() => setContent("overview")}
                  className="px-3 items-center rounded-lg justify-start py-2 gap-3  flex text-slate-700 cursor-pointer font-semibold hover:bg-indigo-700/10 hover:text-indigo-600 transition"
                >
                  Overview
                </li>
                <li
                  name="jobs"
                  onClick={() => setContent("jobs")}
                  className="px-3 items-center rounded-lg justify-start py-2 gap-3  flex text-slate-700 cursor-pointer font-semibold  hover:bg-indigo-700/10 hover:text-indigo-600 transition"
                >
                  Jobs
                </li>
                <li
                  name="applications"
                  onClick={() => setContent("applications")}
                  className="px-3 items-center rounded-lg justify-start py-2 gap-3  flex text-slate-700 cursor-pointer font-semibold  hover:bg-indigo-700/10 hover:text-indigo-600 transition"
                >
                  Applications
                </li>
              </ul>
            </div>
            <button
              onClick={handleUserLogout}
              className="px-4 bottom-8 absolute flex gap-1 rounded-xl py-1.5 text-slate-600 hover:text-red-500 hover:bg-red-600/20 hover:fill-red-500 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="24px"
                viewBox="0 -960 960 960"
                width="24px"
                fill="currentColor"
              >
                <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
              </svg>
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
            {showApplication && (
              <Application
                closeApplication={closeApplication}
                job={jobDetail}
              />
            )}
            <header
              className=" min-w-full min-h-14 px-5 flex items-center bg-linear-to-r from-teal-500/20 via-cyan-400/10 to-transparent border-b border-slate-200 backdrop-blur-md">
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden mr-4 px-1 py-0.5  rounded-lg  text-white text-sm shadow">
                <img src="../src/assets/menuIcon.png" alt="menu" />
              </button>

              <h1 className="text-sm font-semibold text-slate-700">
                User Dashboard
              </h1>
            </header>

            {content === "overview" && (
              <section
                className="flex-1 md:h-[88%] md:w-full min-w-0 md:px-5 md:py-3 box-border overflow-y-auto
  bg-linear-to-br from-slate-50 via-white to-cyan-50"
              >
                <div
                  className="flex h-full min-w-0 flex-col md:rounded-2xl md:p-0 overflow-y-auto
    bg-white/85 backdrop-blur-xl shadow-lg lg:overflow-hidden"
                >

                  <div className="px-5 py-3 border-b min-w-0 border-slate-200/60 shrink-0">
                    <h2 className="text-lg font-semibold text-slate-800">
                      Overview
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Application & ATS summary
                    </p>
                  </div>

                  <div className="overflow-y-auto lg:overflow-y-hidden min-w-0 h-full ">


                    <div className="px-1 md:px-5 py-3 lg:pt-1 min-w-0 shrink-0">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <StatCard
                          title="Applied"
                          value={applicationsStatusCount.totalCount}
                          gradient="from-indigo-500/20 to-indigo-300/5"
                          color="text-indigo-700"
                        />
                        <StatCard
                          title="Shortlisted"
                          value={applicationsStatusCount.acceptedCount}
                          gradient="from-emerald-500/20 to-emerald-300/5"
                          color="text-emerald-700"
                        />
                        <StatCard
                          title="Rejected"
                          value={applicationsStatusCount.rejectedCount}
                          gradient="from-rose-500/20 to-rose-300/5"
                          color="text-rose-700"
                        />
                      </div>
                    </div>


                    <div className="flex-1 px-3 sm:px-5 pb-2 overflow-y-auto">
                      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

                        <div
                          className="lg:col-span-3 rounded-2xl
                        bg-linear-to-br from-white/80 to-slate-50/60
                        shadow-md sm:px-4 py-4 px-1 
                        flex flex-col items-center justify-center"
                        >
                          <div className="w-full h-55">
                            <ApplicationStatusPie
                              stats={{
                                applied: applicationsStatusCount.totalCount,
                                underReview:
                                  applicationsStatusCount.underReviewCount,
                                shortlisted:
                                  applicationsStatusCount.acceptedCount,
                                rejected: applicationsStatusCount.rejectedCount,
                              }}
                            />
                          </div>


                          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                            <span className="flex items-center gap-2 text-indigo-600">
                              <span className="w-2 h-2 rounded-full bg-indigo-500" />
                              Applied
                            </span>
                            <span className="flex items-center gap-2 text-yellow-500">
                              <span className="w-2 h-2 rounded-full bg-yellow-400" />
                              Under Review
                            </span>
                            <span className="flex items-center gap-2 text-emerald-600">
                              <span className="w-2 h-2 rounded-full bg-emerald-500" />
                              Shortlisted
                            </span>
                            <span className="flex items-center gap-2 text-rose-600">
                              <span className="w-2 h-2 rounded-full bg-rose-500" />
                              Rejected
                            </span>
                          </div>
                        </div>


                        <div
                          className="lg:col-span-2 rounded-2xl
                        bg-linear-to-br from-indigo-50 via-white to-cyan-50
                        shadow-md p-4 gap-3
                        flex flex-col justify-between"
                        >
                          <h3 className="text-xs font-semibold text-slate-600 uppercase">
                            ATS Summary
                          </h3>

                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Highest</span>
                            <span className="font-semibold text-emerald-600">
                              {atsStats.max}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Lowest</span>
                            <span className="font-semibold text-rose-600">
                              {atsStats.min}
                            </span>
                          </div>

                          <div
                            className="mt-2 p-3 rounded-xl
                          bg-linear-to-r from-indigo-500/10 to-cyan-500/10
                          flex items-center justify-between"
                          >
                            <span className="text-xs text-slate-600">
                              Avg ATS
                            </span>
                            <span className="text-2xl font-bold text-indigo-600">
                              {atsStats.avg?.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {content === "jobs" && (
              <section className="h-[90%] md:flex-1 px-5 py-4 bg-linear-to-br from-slate-50 via-white to-cyan-50">
                <div className="h-full md:flex-1 flex flex-col rounded-2xl bg-white/85 backdrop-blur-xl shadow-lg border border-slate-200">

                  <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">
                      Jobs
                    </h2>
                    <span className="text-xs text-slate-500">
                      {jobs.length} listings
                    </span>
                  </div>


                  <div className="max-h-[90%] md:flex-1  overflow-y-auto px-5 py-4">
                    {jobs.length === 0 ? (
                      <div className="text-lg font-semibold text-slate-400 text-center mt-24">
                        No jobs available
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {jobs.map((job) => (
                          <div
                            key={job._id}
                            className="group relative rounded-xl bg-white border border-slate-200 shadow-sm 
                         hover:shadow-md hover:-translate-y-0.5 transition-all"
                          >

                            <div
                              className="absolute left-0 top-0 h-full w-1 rounded-l-xl 
                              bg-linear-to-b from-indigo-500 to-cyan-400"
                            />

                            <div className="p-3 h-full pl-4 flex justify-between  flex-col gap-2">

                              <div className="flex flex-col gap-2">
                                <h3
                                  className="text-sm font-semibold text-slate-800 truncate 
                               group-hover:text-indigo-600 transition"
                                >
                                  {job.title}
                                </h3>


                                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                                  {job.desc}
                                </p>


                                <div className="flex flex-wrap gap-1.5">
                                  {job.skillsRequired
                                    .slice(0, MAX_SKILLS)
                                    .map((skill) => (
                                      <span
                                        key={skill}
                                        className="px-2 py-0.5 text-[10px] rounded-full 
                                                                bg-indigo-50 text-indigo-600 border border-indigo-100"
                                      >
                                        {skill}
                                      </span>
                                    ))}

                                  {job.skillsRequired.length > MAX_SKILLS && (
                                    <span
                                      className="px-2 py-0.5 text-[10px] rounded-full 
                                                                bg-slate-100 text-slate-600"
                                    >
                                      +{job.skillsRequired.length - MAX_SKILLS}
                                    </span>
                                  )}
                                </div>
                              </div>


                              <div className="pt-2 mt-1 flex items-center justify-between border-t border-slate-100">
                                <span className="text-[11px] font-medium text-slate-500">
                                  {job.experienceRequired} yr exp
                                </span>

                                <button
                                  onClick={() => handleJobApply(job)}
                                  className="px-2.5 py-1 text-[11px] font-semibold rounded-md 
                               bg-indigo-600 text-white 
                               hover:bg-indigo-700 active:scale-[0.97] transition"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="py-3 mt-auto flex justify-center border-t border-slate-200">
                    <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-xl shadow-sm border">
                      <button
                        disabled={jobPage === 1}
                        onClick={handleJobPagePrevious}
                        className="px-2 py-1 text-xs rounded-md 
                                            disabled:text-slate-400 disabled:cursor-not-allowed 
                                            hover:bg-slate-100 transition"
                      >
                        ←
                      </button>

                      <span className="text-xs font-semibold text-slate-700">
                        {jobPage} / {jobPageCount}
                      </span>

                      <button
                        disabled={jobPage === jobPageCount}
                        onClick={handleJobPageNext}
                        className="px-2 py-1 text-xs rounded-md 
                                            disabled:text-slate-400 disabled:cursor-not-allowed 
                                            hover:bg-slate-100 transition"
                      >
                        →
                      </button>

                      <select
                        value={jobPage}
                        onChange={(e) =>
                          setApplicationPage(Number(e.target.value))
                        }
                        className="ml-2 text-xs rounded-md border border-slate-300 
                                            px-2 py-1 cursor-pointer
                                            hover:border-indigo-400 focus:ring-2 focus:ring-indigo-300 
                                            transition"
                      >
                        {Array.from({ length: jobPageCount || 10 }).map(
                          (_, index) => (
                            <option key={index} value={index + 1}>
                              Page {index + 1}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {content === "applications" && (
              <section className="h-[90%] md:flex-1 px-5 py-4 bg-linear-to-br from-slate-50 via-white to-cyan-50">
                <div className="h-full flex flex-col rounded-2xl bg-white/85 backdrop-blur-xl shadow-lg border border-slate-200">

                  <div className="px-5 py-3 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">
                      Applications
                    </h2>
                  </div>


                  <div className="max-h-[90%] md:flex-1   w-full overflow-y-scroll">
                    <div className="px-5 py-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <StatCard
                          title="Applications"
                          value={applicationsStatusCount.totalCount}
                          gradient="from-indigo-500/20 to-indigo-300/10"
                          color="text-indigo-600"
                        />
                        <StatCard
                          title="Shortlisted"
                          value={applicationsStatusCount.acceptedCount}
                          gradient="from-teal-500/20 to-cyan-300/10"
                          color="text-teal-600"
                        />
                        <StatCard
                          title="Rejected"
                          value={applicationsStatusCount.rejectedCount}
                          gradient="from-rose-500/20 to-pink-300/10"
                          color="text-rose-600"
                        />
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-5 pb-5">
                      {applications.length === 0 ? (
                        <div className="text-lg font-semibold text-slate-400 text-center mt-24">
                          No applications received
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {applications.map((application) => (
                            <div
                              key={application.id}
                              className="group relative rounded-xl bg-white border border-slate-200 
                                                p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 
                                                transition-all flex flex-col"
                            >

                              <div className="mb-3">
                                <p className="text-xs text-slate-500 mb-0.5">
                                  Job Title
                                </p>
                                <p className="text-sm font-semibold text-slate-800 line-clamp-1">
                                  {application.jobId.title}
                                </p>
                              </div>


                              <div className="flex items-center justify-between mb-4">
                                <span
                                  className={`px-2.5 py-1 text-xs font-medium rounded-full 
                                                            ${getTheme(application.status)} border`}
                                >
                                  {application.status}
                                </span>

                                <span
                                  className="px-2.5 py-1 text-xs font-semibold rounded-full 
                                                            bg-emerald-50 text-emerald-600 border border-emerald-100"
                                >
                                  ATS {application.atsScore}
                                </span>
                              </div>

                              <a
                                href={application.resume}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-auto text-center py-2 rounded-lg text-sm font-semibold 
                                                        text-indigo-600 border border-indigo-200 
                                                        hover:bg-indigo-600 hover:text-white 
                                                        active:scale-[0.97] transition"
                              >
                                View Resume
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>


                  <div className="py-3 mt-auto flex justify-center border-t border-slate-200">
                    <div className="flex items-center gap-2 bg-white/90 px-4 py-2 rounded-xl shadow-sm border">
                      <button
                        disabled={applicationPage === 1}
                        onClick={handleApplicationPagePrevious}
                        className="px-2 py-1 text-xs rounded-md 
                     disabled:text-slate-400 disabled:cursor-not-allowed 
                     hover:bg-slate-100 transition"
                      >
                        ←
                      </button>

                      <span className="text-xs font-semibold text-slate-700">
                        {applicationPage} / {applicationPageCount}
                      </span>

                      <button
                        disabled={applicationPage === applicationPageCount}
                        onClick={handleApplicationPageNext}
                        className="px-2 py-1 text-xs rounded-md 
                     disabled:text-slate-400 disabled:cursor-not-allowed 
                     hover:bg-slate-100 transition"
                      >
                        →
                      </button>

                      <select
                        value={applicationPage}
                        onChange={(e) =>
                          setApplicationPage(Number(e.target.value))
                        }
                        className="ml-2 text-xs rounded-md border border-slate-300 
                     px-2 py-1 cursor-pointer
                     hover:border-indigo-400 focus:ring-2 focus:ring-indigo-300 
                     transition"
                      >
                        {Array.from({ length: applicationPageCount || 10 }).map(
                          (_, index) => (
                            <option key={index} value={index + 1}>
                              Page {index + 1}
                            </option>
                          ),
                        )}
                      </select>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
