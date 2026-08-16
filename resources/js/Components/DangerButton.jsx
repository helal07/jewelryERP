export default function DangerButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            className={
                `inline-flex items-center rounded-md border border-transparent px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 hover:opacity-90 active:opacity-100 ${
                    disabled && 'opacity-25'
                } ` + className
            }
            style={{ backgroundColor: 'rgb(177,118,51)' }}
            disabled={disabled}
        >
            {children}
        </button>
    );
}
