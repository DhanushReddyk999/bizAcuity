import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const PlanContext = createContext();

export function PlanProvider({ children }) {
  const [plan, setPlan] = useState(null); // { plan, plan_id, expires }
  const [planFeatures, setPlanFeatures] = useState({}); // all feature flags
  const [loading, setLoading] = useState(true);

  // Fetch plan info for the current user
  const fetchPlan = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      if (!user || !user.id) {
        setPlan(null);
        setPlanFeatures({});
        setLoading(false);
        return;
      }
      
      const res = await fetch(`/api/subscriptions/status/${user.id}`);
      const planStatus = await res.json();
      setPlan(planStatus);
      
      // Fetch plan features
      const plansRes = await fetch('/api/plans');
      const plans = await plansRes.json();
      
      let planObj;
      if (planStatus && planStatus.plan_id) {
        // User has a specific plan
        planObj = plans.find(p => p.id === planStatus.plan_id);
      } else {
        // User has no plan, use free plan as default
        planObj = plans.find(p => p.name.toLowerCase() === 'free');
      }
      
      // Fallback to free plan if no plan is found
      if (!planObj) {
        planObj = plans.find(p => p.name.toLowerCase() === 'free');
      }
      
      setPlanFeatures(planObj || {});
    } catch (err) {
      console.error('Error fetching plan:', err);
      setPlan(null);
      setPlanFeatures({});
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return (
    <PlanContext.Provider value={{ plan, planFeatures, loading, refreshPlan: fetchPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
} 