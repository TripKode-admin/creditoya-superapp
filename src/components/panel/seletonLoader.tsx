"use client"

import React from 'react';

function SkeletonLoader({ type }: { type: 'avatar' | 'form' | 'verification' | 'select' }) {
    if (type === 'avatar') {
        return (
            <div className="animate-pulse">
                <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
        );
    }

    if (type === 'form') {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-6"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
        );
    }

    if (type === 'verification') {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
        );
    }

    if (type === 'select') {
        return (
            <div className="animate-pulse mt-6">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            </div>
        );
    }

    return null;
}

export default SkeletonLoader;