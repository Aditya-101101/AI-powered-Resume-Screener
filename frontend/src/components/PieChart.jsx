import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const ApplicationStatusPie = ({ stats }) => {
  const labels = ["Applied", "Under Review", "Shortlisted", "Rejected"];

  const values = [
    Number(stats?.applied) || 0,
    Number(stats?.underReview) || 0,
    Number(stats?.shortlisted) || 0,
    Number(stats?.rejected) || 0,
  ];

  const total = values.reduce((a, b) => a + b, 0);
  const nonZeroCount = values.filter(v => v > 0).length;

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: [
          "#6366f1", // Applied
          "#facc15", // Under review
          "#22c55e", // Shortlisted
          "#ef4444", // Rejected
        ],
        borderColor: "#ffffff",
        borderWidth: 0,
        cutout: "60%",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,

    layout: {
      padding: 50,
    },

    plugins: {
      legend: { display: false },

      tooltip: {
        callbacks: {
          label: (ctx) => {
            const value = ctx.raw;
            const percent = total
              ? ((value / total) * 100).toFixed(1)
              : 0;
            return `${ctx.label}: ${value} (${percent}%)`;
          },
        },
      },

      datalabels: {
        display: (ctx) =>
          ctx.dataset.data[ctx.dataIndex] > 0 && nonZeroCount > 1,

        color: "#334155",
        font: {
          size: 11,
          weight: "600",
        },

        formatter: (value, ctx) =>
          `${ctx.chart.data.labels[ctx.dataIndex]}\n${value}`,

        anchor: "end",
        align: "end",
        offset: 20,

        clamp: false,
        overflow: "visible",
      },
    },
  };

  return (
    <div className="relative h-full w-full">
      <Pie data={data} options={options} />
    </div>
  );
};

export default ApplicationStatusPie;
