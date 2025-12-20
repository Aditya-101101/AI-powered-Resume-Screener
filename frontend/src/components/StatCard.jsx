const StatCard = ({ title, value, gradient, color }) => (
    <div className={`
        p-5 rounded-xl flex-col
        bg-linear-to-br ${gradient}
        shadow-md hover:shadow-lg
        justify-center items-center md:justify-start md:items-start
        gap-x-3  
        transition flex-1`}>

        <p className="text-xs lg:text-start text-center text-slate-600 font-semibold mb-1">
            {title}
        </p>
        <p className={`text-3xl lg:text-start text-center font-bold ${color}`}>
            {value}
        </p>
    </div>
)

export default StatCard