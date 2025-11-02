/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { analytics } from '../lib/firebase';
import { logEvent as firebaseLogEvent } from 'firebase/analytics';
import { useCallback } from 'react';

export const useAnalytics = () => {
    const logEvent = useCallback((eventName: string, eventParams?: { [key: string]: any }) => {
        analytics.then(analyticsInstance => {
            if (analyticsInstance) {
                firebaseLogEvent(analyticsInstance, eventName, eventParams);
            }
        });
    }, []);

    return { logEvent };
};
