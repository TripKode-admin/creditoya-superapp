import { useState, useEffect } from 'react';
import { useDarkMode } from '@/context/DarkModeContext';
import { useRouter } from 'next/navigation';

function useNavBar() {
    const { darkmode, changeDarkMode } = useDarkMode();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const router = useRouter();

    // Detectar cuando se ha desplazado la página
    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            if (isScrolled !== scrolled) {
                setScrolled(isScrolled);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [scrolled]);

    return {
        scrolled,
        darkmode,
        isMenuOpen,
        router,
        changeDarkMode,
        setIsMenuOpen
    }
}

export default useNavBar