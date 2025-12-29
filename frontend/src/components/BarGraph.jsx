import { Bar } from "react-chartjs-2";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    ChartDataLabels
);

const ApplicationsStatusBar = ({ stats }) => {
    const labels = ["Applied", "Under Review", "Shortlisted", "Rejected"];

    const values = [
        Number(stats?.applied) || 0,
        Number(stats?.underReview) || 0,
        Number(stats?.shortlisted) || 0,
        Number(stats?.rejected) || 0,
    ];

    const data = {
        labels,
        datasets: [
            {
                label: "Applications",
                data: values,
                backgroundColor: [
                    "#6366f1",
                    "#facc15",
                    "#22c55e",
                    "#ef4444",
                ],
                borderRadius: 5,
                barThickness: 20,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: "y",

        scales: {
            x: {
                grid: { display: false },
                ticks: { precision: 0 },
            },
            y: {
                grid: { display: false },
            },
        },
        layout: {
            padding: {
                top: 20,
                right: 30,
                bottom: 10,
                left: 10,
            },
        },
        plugins: {
            legend: { display: false },

            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.raw} applications`,
                },
            },

            datalabels: {
                anchor: "end",
                align: "right",
                color: "#334155",
                font: { weight: "600" },
                formatter: (v) => (v > 0 ? v : ""),
            },
        },
    };

    return (
        <div className="h-full w-full">
            <Bar data={data} options={options} />
        </div>
    );
};

export default ApplicationsStatusBar;
