import './Loading.css'

export function LoadingBar({ label }: { label?: string}) {

    const loadingLabel = label ? label : "Loading.. ";

    return (
        <div className="np-loading-bar">
            <div className='label'>{loadingLabel}</div>
            <div className="progress">
            </div>
        </div>
    )
}