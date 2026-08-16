import React, { forwardRef, useEffect, useRef } from 'react';

export default forwardRef(function SelectInput(
    { className = '', isFocused = false, children, ...props },
    ref
) {
    const localRef = useRef();

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <select
            {...props}
            className={
                'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm ' +
                className
            }
            ref={localRef}
        >
            {children}
        </select>
    );
});
