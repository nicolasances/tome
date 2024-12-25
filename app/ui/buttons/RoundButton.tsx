export default function RoundButton({ icon }: { icon: React.ReactNode }) {

    return (
        <div className="bg-cyan-200 rounded-full p-3 shadow hover:shadow-lg">
            <div className="w-10 h-10 fill-cyan-800">
                {icon}
            </div>
        </div>
    )

}