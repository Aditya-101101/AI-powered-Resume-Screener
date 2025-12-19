const StatCard = ({ title, value, gradient, color }) => (
    <div className={`
        p-5 rounded-xl
        bg-linear-to-br ${gradient}
        shadow-md hover:shadow-lg
        transition
    `}>
        <p className="text-xs text-slate-600 mb-1">
            {title}
        </p>
        <p className={`text-3xl font-bold ${color}`}>
            {value}
        </p>
    </div>
);

export default StatCard