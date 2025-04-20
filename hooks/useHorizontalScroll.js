import { useEffect, useRef } from "react";

const useHorizontalScroll = () => {
    const scrollRef = useRef(null);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container) return;

        const handleWheel = (e) => {
            if (e.deltaY === 0) return;
            e.preventDefault();
            container.scrollLeft += e.deltaY;
        };

        container.addEventListener("wheel", handleWheel, { passive: false });
        return () => container.removeEventListener("wheel", handleWheel);
    }, []);

    return scrollRef;
};

export default useHorizontalScroll;