import RoundButton from "@/app/ui/buttons/RoundButton";

interface ConfirmationPopupProps {
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export default function ConfirmationPopup({ message, onConfirm, onCancel }: ConfirmationPopupProps) {
    return (
        <div className="fixed inset-0 z-50">
            {/* Dark overlay - clicking this closes the popup */}
            <div 
                className="absolute inset-0 bg-black opacity-50"
                onClick={onCancel}
            ></div>
            
            {/* Popup content */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div 
                    className="relative rounded-lg shadow-lg p-6 flex flex-col items-center pointer-events-auto"
                    style={{ 
                        backgroundColor: 'var(--background)',
                        width: '80%',
                        maxWidth: '600px'
                    }}
                >
                    <p className="text-center text-lg mb-6">{message}</p>
                    <div className="flex space-x-4">
                        <RoundButton 
                            svgIconPath={{ src: "/images/wrong.svg", alt: "Cancel" }}
                            size="s"
                            onClick={onCancel}
                        />
                        <RoundButton 
                            svgIconPath={{ src: "/images/tick.svg", alt: "Confirm" }}
                            size="s"
                            onClick={onConfirm}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
