/* eslint-disable @typescript-eslint/no-explicit-any */
import {  useEffect, useRef } from 'react';


export  const useOutClick=(callback:any)=> {

    const ref = useRef<any>(null);

    const handleClickOutside = (event:any) => {
        if (ref.current && !ref.current.contains(event.target)) {
         callback();
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    
    return ref ;

}