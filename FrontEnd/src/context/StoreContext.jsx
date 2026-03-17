import React, { createContext, useContext, useState, useEffect } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cartCount, setCartCount] = useState(0);
    const [wishlist, setWishlist] = useState(() => {
        try {
            const saved = localStorage.getItem('wishlist');
            const parsed = saved ? JSON.parse(saved) : [];
            // Migration: robust check for objects with valid IDs (including ID 0)
            return parsed.filter(item =>
                typeof item === 'object' &&
                item !== null &&
                (typeof item.id !== 'undefined' && item.id !== null)
            );
        } catch {
            return [];
        }
    });

    // Handle full product objects in wishlist for immediate UI availability

    // Persist wishlist
    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    // Fetch cart count
    const refreshCart = async () => {
        if (!isAuthenticated) {
            setCartCount(0);
            return;
        }
        try {
            const res = await cartAPI.get();
            const count = res.data.items?.reduce((s, i) => s + i.quantity, 0) || 0;
            setCartCount(count);
        } catch {
            setCartCount(0);
        }
    };

    // Initial fetch on auth change
    useEffect(() => {
        refreshCart();
    }, [isAuthenticated]);

    const toggleWishlist = (product) => {
        setWishlist((prev) => {
            const exists = prev.find(p => p.id === product.id);
            if (exists) {
                return prev.filter(p => p.id !== product.id);
            } else {
                return [...prev, product];
            }
        });
    };

    const isInWishlist = (productId) => wishlist.some(p => p.id === productId);

    return (
        <StoreContext.Provider value={{
            cartCount,
            refreshCart,
            wishlist,
            toggleWishlist,
            isInWishlist
        }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within a StoreProvider');
    return context;
};
