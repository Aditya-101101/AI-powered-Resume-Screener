import React, { useState, useEffect } from "react";
import StatCard from "../../components/StatCard";
import api from "../../api/axios";
import Error from "../../components/Error";
import { useNavigate } from "react-router-dom";
import Job from "../../components/Job";
import ApplicationsStatusBar from "../../components/BarGraph";
import Loading from '../../components/Loading'

const MAX_SKILLS = 5;

const RecruiterDashboard = () => {
  const navigate = useNavigate();

  const [showSidebar, setShowSidebar] = useState(false);
  const [showerror, setshowError] = useState(false);
  const [error, setError] = useState({ code: null, message: "" });
  const [recruiterName, setRecruiterName] = useState("");
  const [recruiterAvatar, setRecruiterAvatar] = useState("");
  const [email, setEmail] = useState("");
  const [jobs, setJobs] = useState([]);
  const [content, setContent] = useState("overview");
  const [loading, setLoading] = useState(false)
  const [applicationsStats, setApplicationStats] = useState({
    total: 0,
    accepted: 0,
    rejected: 0,
    underReview: 0,
    today: 0
  })
  const [jobsStatus, setJobsStatus] = useState({
    total: 0,
    closed: 0,
    open: 0,
  });
  const [jobUnderReview, setJobUnderReview] = useState(null);

  const [jobDetail, setJobDetail] = useState({
    title: "",
    desc: "",
    skillsRequired: "",
    experienceRequired: null,
    jobCover: null,
  });

  const StringToArray = (skills) =>
    skills
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

  const [jobPageCount, setJobPageCount] = useState(0);
  const [jobPage, setJobPage] = useState(1);

  const getRecruiterData = async () => {
    try {
      const response = await api.get(`/recruiter/data?page=${jobPage}`);
      if (response.status === 200) {
        const recruiterData = response.data.recruiter;
        const paginationDetails = response.data.pagination;
        setJobsStatus({
          total: paginationDetails.jobCount,
          closed: paginationDetails.jobsClosed,
          open: paginationDetails.jobsOpen,
        });
        setApplicationStats({
          total: paginationDetails.applicationsStats.totalApplications,
          accepted: paginationDetails.applicationsStats.acceptedApplications,
          rejected: paginationDetails.applicationsStats.rejectedApplications,
          underReview: paginationDetails.applicationsStats.applicationsRemainingToReview,
          today: paginationDetails.applicationsStats.applicationsSubmittedToday
        })
        setJobPageCount(paginationDetails.pageCount);
        setRecruiterName(recruiterData.name);
        setRecruiterAvatar(recruiterData.recruiterAvatar);
        setEmail(recruiterData.email);
        setJobs(paginationDetails.jobsData);
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
  const handleJobPageNext = () => {
    setJobPage(jobPage + 1);
  };
  const handleJobPagePrevious = () => {
    setJobPage(jobPage - 1);
  };

  useEffect(() => {
    getRecruiterData();
  }, [content, jobPage]);

  const handleRecruiterLogout = async () => {
    try {
      const response = await api.get("/recruiter/logout");
      if (response.status === 200) {
        navigate("/recruiter-login");
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

  const handleShowJob = (job) => {
    setJobUnderReview(job);
  };

  const closeJob = () => {
    setJobUnderReview(null);
  };

  const handleFormDataChange = (e) => {
    setJobDetail((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleJobCoverChange = (e) => {
    setJobDetail((prev) => ({ ...prev, jobCover: e.target.files[0] }));
  };

  const handleJobCreateFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)

    if (!jobDetail.jobCover) {
      setshowError(true);
      setError({
        code: 400,
        message: "Please upload job cover image",
      });
      return;
    }
    const skillsArray = StringToArray(jobDetail.skillsRequired);

    const formData = new FormData();

    formData.append("title", jobDetail.title);
    formData.append("desc", jobDetail.desc);
    formData.append("skillsRequired", JSON.stringify(skillsArray));
    formData.append("experienceRequired", jobDetail.experienceRequired);
    formData.append("jobCover", jobDetail.jobCover);

    try {
      const response = await api.post("/recruiter/createJob", formData);
      if (response.status === 201) {
        setContent("createJob");
        setJobDetail({
          title: "",
          desc: "",
          skillsRequired: "",
          experienceRequired: null,
          jobCover: null,
        });
        alert("Job Created!");
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
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen w-screen  bg-linear-to-br from-[#eef2ff] via-[#f8fafc] to-[#ecfeff] flex items-center justify-center text-slate-800">
      {showerror && <Error error={error} onClose={onClose} />}

      <div className="relative md:h-[95vh] md:w-[95vw] w-full h-full md:rounded-2xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.15)] bg-white/60 backdrop-blur-xl">
        {jobUnderReview && <Job closeJob={closeJob} job={jobUnderReview} />}

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
               {recruiterAvatar&&<img
                  src={`/recruiterAvatars/${recruiterAvatar}.png`}
                  alt="recruiterAvatar"
                  className="h-15 w-15 rounded-full"
                />}
                <span className="text-xl font-semibold wrap-break-word">
                  {recruiterName}
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
                  name="createJob"
                  onClick={() => setContent("createJob")}
                  className="px-3 items-center rounded-lg justify-start py-2 gap-3  flex text-slate-700 cursor-pointer font-semibold  hover:bg-indigo-700/10 hover:text-indigo-600 transition"
                >
                  Create Job
                </li>
              </ul>
            </div>
            <button
              onClick={handleRecruiterLogout}
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

          <main className="flex-1 h-full relative flex flex-col">
            <header
              className=" min-w-full min-h-14 px-5 flex items-center
              bg-linear-to-r from-teal-500/20 via-cyan-400/10 to-transparent
              border-b border-slate-200 backdrop-blur-md">
              <button
                onClick={() => setShowSidebar(true)}
                className="lg:hidden mr-4 px-1 py-0.5 rounded-lg  text-white text-sm shadow"
              >
                <img src="/assets/menuIcon.png" alt="menu" />
              </button>

              <h1 className="text-sm font-semibold text-slate-700">
                Dashboard
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
                      Quick summary of your recruitment activity
                    </p>
                  </div>


                  <div className="overflow-y-auto lg:overflow-y-hidden min-w-0 h-full ">

                    <div className="px-1 md:px-5 py-3 lg:pt-1 min-w-0 shrink-0">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <StatCard
                          title="Total Jobs"
                          value={jobsStatus.total}
                          gradient="from-indigo-500/20 to-indigo-300/10"
                          color="text-indigo-600"
                        />
                        <StatCard
                          title="Jobs Open"
                          value={jobsStatus.open}
                          gradient="from-teal-500/20 to-cyan-300/10"
                          color="text-teal-600"
                        />
                        <StatCard
                          title="Jobs Closed"
                          value={jobsStatus.closed}
                          gradient="from-rose-500/20 to-pink-300/10"
                          color="text-rose-600"
                        />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 md:overflow-y-auto min-h-0 px-1 md:px-5 pb-5 lg:pb-2 ">
                      <div className="flex flex-col min-w-0 lg:flex-row gap-5 min-h-0 lg:h-full ">


                        <div
                          className="lg:flex-2 flex flex-col md:min-h-65 lg:min-h-0 min-w-0
                          rounded-2xl bg-linear-to-br from-white/90 to-slate-50/60 
                          shadow-md md:px-5 md:py-3 hover:shadow-lg transition"
                        >
                          <div className="shrink-0 px-5">
                            <h3 className="text-sm font-semibold text-slate-700">
                              Application Status
                            </h3>
                            <p className="text-xs text-slate-500">
                              Current distribution of applications
                            </p>
                          </div>

                          <div className="flex-auto min-w-0 min-h-30 lg:min-h-35 xl:min-h-55 mt-3">
                            <ApplicationsStatusBar
                              stats={{
                                applied: applicationsStats.total,
                                underReview: applicationsStats.underReview,
                                shortlisted: applicationsStats.accepted,
                                rejected: applicationsStats.rejected,
                              }}
                            />
                          </div>
                        </div>


                        <div
                          className="lg:flex-1 min-h-30 flex flex-col justify-between md:min-h-27 lg:min-h-0
                          rounded-2xl bg-linear-to-br from-cyan-50/80 to-teal-50/60 min-w-0
                          shadow-md p-3 mx-5 md:mx-0 md:p-5 hover:shadow-lg transition"
                        >
                          <div>
                            <h3 className="text-sm font-semibold text-slate-700">
                              Applications Today
                            </h3>
                            <p className="text-xs text-slate-500">
                              New submissions received
                            </p>
                          </div>

                          <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold text-teal-600">
                              {applicationsStats.today}
                            </span>
                            <span className="text-sm text-slate-500 mb-1">
                              today
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
              <section className="h-[90%] md:flex-1 md:px-5 md:py-4 bg-linear-to-br from-slate-50 via-white to-cyan-50">
                <div className="h-full md:flex-1 flex flex-col md:rounded-2xl bg-white/85 backdrop-blur-xl shadow-lg border border-slate-200">

                  <div className="px-5 py-3 border-b border-slate-200 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800">
                      Jobs
                    </h2>
                    <span className="text-xs text-slate-500">
                      {jobs.length} total
                    </span>
                  </div>


                  <div className="max-h-[90%] md:flex-1 overflow-y-auto px-5 py-4">
                    {jobs.length === 0 ? (
                      <div className="text-lg font-semibold text-slate-400 text-center mt-24">
                        No jobs available
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-4">
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


                              <div className="py-2 mt-1 flex items-center justify-between border-b border-slate-100">
                                <span className="text-[11px] font-medium text-slate-500">
                                  {job.experienceRequired} yr exp
                                </span>

                                <button
                                  onClick={() => handleShowJob(job)}
                                  className="px-2.5 py-1 text-[11px] font-semibold rounded-md 
                                  bg-indigo-600 text-white 
                                  hover:bg-indigo-700 
                                  active:scale-[0.97] transition"
                                >
                                  View Applications
                                </button>
                              </div>
                              <div className="mt-2">
                                <h3 className="text-[12px] font-semibold text-slate-700 tracking-wider mb-1">
                                  Stats
                                </h3>

                                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px]">
                                  <div className="flex justify-between text-slate-600 tracking-tight">
                                    <span className="tracking-wide font-semibold">Total</span>
                                    <span className="font-semibold text-slate-800 tracking-wide">
                                      {job.stats.totalApplications}
                                    </span>
                                  </div>

                                  <div className="flex justify-between text-green-600 tracking-tight">
                                    <span className="tracking-wide font-semibold">Accepted</span>
                                    <span className="font-semibold tracking-wide">
                                      {job.stats.acceptedApplications}
                                    </span>
                                  </div>

                                  <div className="flex justify-between text-red-500 tracking-tight">
                                    <span className="tracking-wide font-semibold">Rejected</span>
                                    <span className="font-semibold tracking-wide">
                                      {job.stats.rejectedApplications}
                                    </span>
                                  </div>

                                  <div className="flex justify-between text-amber-600 tracking-tight">
                                    <span className="tracking-wide font-semibold">To Review</span>
                                    <span className="font-semibold tracking-wide">
                                      {job.stats.applicationsRemainingToReview}
                                    </span>
                                  </div>

                                  <div className="col-span-2 flex justify-between text-indigo-600 pt-1 border-t border-slate-200/60 tracking-tight">
                                    <span className="tracking-wide font-semibold">Submitted Today</span>
                                    <span className="font-semibold tracking-wide">
                                      {job.stats.applicationsSubmittedToday}
                                    </span>
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="py-3 mt-auto flex justify-center border-t border-slate-200">
                    <div
                      className="flex items-center gap-2 bg-white/90 
                      px-4 py-2 rounded-xl shadow-sm border"
                    >
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
                        onChange={(e) => setJobPage(Number(e.target.value))}
                        className="ml-2 text-xs rounded-md border border-slate-300 
                        px-2 py-1 cursor-pointer
                        hover:border-indigo-400 
                        focus:ring-2 focus:ring-indigo-300 
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

            {loading && <Loading />}
            {content === "createJob" && (
              <section
                className="flex-1 overflow-y-scroll md:overflow-hidden relative
              px-4 py-4 
              bg-linear-to-br from-slate-50 via-white to-cyan-50"
              >

                <div
                  className="h-full flex flex-col 
                  rounded-2xl 
                  bg-white/80 backdrop-blur 
                  shadow-lg 
                  border border-slate-200"
                >

                  <div className="px-5 py-4 border-b border-slate-200">
                    <h2 className="text-lg font-semibold text-slate-800">
                      Create Job
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Publish a new job opening
                    </p>
                  </div>


                  <div className="flex-1 overflow-y-auto px-5 py-5">
                    <form
                      onSubmit={handleJobCreateFormSubmit}
                      className="grid grid-cols-1 md:grid-cols-2 
                   gap-x-6 gap-y-5"
                    >

                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">
                          Job Title
                        </label>
                        <input
                          type="text"
                          name="title"
                          required
                          onChange={handleFormDataChange}
                          placeholder="Frontend Developer"
                          className="rounded-lg border border-slate-300 
                       bg-white px-3 py-2.5 
                       text-sm text-slate-700 shadow-sm
                       focus:border-indigo-400 
                       focus:ring-1 focus:ring-indigo-200 
                       outline-none transition"
                        />
                      </div>


                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">
                          Experience (years)
                        </label>
                        <input
                          type="number"
                          name="experienceRequired"
                          min={0}
                          max={30}
                          required
                          onChange={handleFormDataChange}
                          placeholder="2"
                          className="rounded-lg border border-slate-300 
                       bg-white px-3 py-2.5 
                       text-sm text-slate-700 shadow-sm
                       focus:border-indigo-400 
                       focus:ring-1 focus:ring-indigo-200 
                       outline-none transition"
                        />
                      </div>


                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">
                          Job Description
                        </label>
                        <textarea
                          name="desc"
                          rows={4}
                          required
                          onChange={handleFormDataChange}
                          placeholder="Describe responsibilities, role expectations..."
                          className="rounded-lg border border-slate-300 
                       bg-white px-3 py-2.5 
                       text-sm text-slate-700 shadow-sm
                       resize-none
                       focus:border-indigo-400 
                       focus:ring-1 focus:ring-indigo-200 
                       outline-none transition"
                        />
                      </div>


                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-xs font-medium text-slate-600">
                          Skills Required
                        </label>
                        <input
                          type="text"
                          name="skillsRequired"
                          required
                          onChange={handleFormDataChange}
                          placeholder="React, Node.js, MongoDB"
                          className="rounded-lg border border-slate-300 
                       bg-white px-3 py-2.5 
                       text-sm text-slate-700 shadow-sm
                       focus:border-indigo-400 
                       focus:ring-1 focus:ring-indigo-200 
                       outline-none transition"
                        />
                      </div>


                      <div
                        className="md:col-span-2 
                        flex items-center justify-between 
                        gap-4 pt-4 mt-2 
                        border-t border-slate-200"
                      >
                        <input
                          type="file"
                          name="jobCover"
                          required
                          accept=".png,.jpg,.jpeg"
                          onChange={handleJobCoverChange}
                          className="w-full md:w-[65%] 
                       rounded-lg border border-slate-300 
                       text-xs text-slate-600 shadow-sm
                       file:mr-4 file:rounded-lg file:border-0
                       file:bg-indigo-600 file:px-3 file:py-2
                       file:text-white file:font-medium
                       hover:file:bg-indigo-700 transition"
                        />

                        <button
                          type="submit"
                          className="rounded-lg bg-indigo-600 
                       text-white px-6 py-2.5 text-[8px]
                       md:text-sm font-semibold
                       shadow-sm hover:bg-indigo-700 
                       active:scale-[0.97] transition"
                        >
                          Create Job
                        </button>
                      </div>
                    </form>
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

export default RecruiterDashboard;
