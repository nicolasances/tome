import './Loading.css'

export function LoadingBar({ label, hideLabel }: { label?: string, hideLabel?: boolean }) {

    const loadingLabel = label ? label : "Loading.. ";

    return (
        <div className={`np-loading-bar min-w-12`}>
            {!hideLabel && <div className='label'>{loadingLabel}</div>}
            <div className="progress">
            </div>
        </div>
    )
}