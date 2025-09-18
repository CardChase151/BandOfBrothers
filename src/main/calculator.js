import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './content.css';

function Calculator() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [position, setPosition] = useState('');
  const [section, setSection] = useState('');
  const [solveFor, setSolveFor] = useState('');
  const [marketType, setMarketType] = useState('warm');
  const [inputValue, setInputValue] = useState('');
  const [timePeriod, setTimePeriod] = useState('month');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error || !session) {
      navigate('/', { replace: true });
      return;
    }

    setUser(session.user);
    setLoading(false);
  };

  const resetCalculator = () => {
    setPosition('');
    setSection('');
    setSolveFor('');
    setInputValue('');
    setTimePeriod('month');
  };

  const handleBackToHome = () => {
    navigate('/home');
  };

  const positions = {
    representative: { rate: 0.25, name: 'Representative (25%)' },
    district: { rate: 0.5, name: 'District Leader (50%)' },
    division: { rate: 0.6, name: 'Division Leader (60%)' },
    regional: { rate: 0.7, name: 'Regional Leader (70%)' },
    rvp: { rate: 1.1, name: 'Regional VP (110%)' }
  };

  const calculateProduct = () => {
    if (!inputValue) return null;

    const value = parseFloat(inputValue);
    let monthlyAppointments, monthlyPremium, monthlyCash;

    if (solveFor === 'activity') {
      if (timePeriod === 'day') monthlyAppointments = value * 20;
      else if (timePeriod === 'week') monthlyAppointments = value * 4;
      else monthlyAppointments = value;
    } else if (solveFor === 'premium') {
      if (timePeriod === 'day') monthlyPremium = value * 20;
      else if (timePeriod === 'week') monthlyPremium = value * 4;
      else monthlyPremium = value;
      monthlyAppointments = (monthlyPremium / 800) * (8/3);
    } else if (solveFor === 'cash') {
      if (timePeriod === 'day') monthlyCash = value * 20;
      else if (timePeriod === 'week') monthlyCash = value * 4;
      else monthlyCash = value;

      const currentPosition = positions[position];
      monthlyPremium = monthlyCash / (0.75 * currentPosition.rate);
      monthlyAppointments = (monthlyPremium / 800) * (8/3);
    }

    const weeklyAppointments = monthlyAppointments / 4;
    const dailyAppointments = monthlyAppointments / 20;

    const monthlyPlans = (monthlyAppointments / 8) * 5;
    const weeklyPlans = monthlyPlans / 4;
    const dailyPlans = monthlyPlans / 20;

    const monthlySales = (monthlyAppointments / 8) * 3;
    const weeklySales = monthlySales / 4;
    const dailySales = monthlySales / 20;

    monthlyPremium = monthlySales * 800;
    const weeklyPremium = monthlyPremium / 4;
    const dailyPremium = monthlyPremium / 20;

    const currentPosition = positions[position];
    const monthlyCashAdvance = monthlyPremium * 0.75 * currentPosition.rate;

    return {
      appointments: { month: monthlyAppointments, week: weeklyAppointments, day: dailyAppointments },
      plans: { month: monthlyPlans, week: weeklyPlans, day: dailyPlans },
      sales: { month: monthlySales, week: weeklySales, day: dailySales },
      premium: { month: monthlyPremium, week: weeklyPremium, day: dailyPremium },
      cash: { month: monthlyCashAdvance, week: monthlyCashAdvance / 4, day: monthlyCashAdvance / 20 },
      currentPosition
    };
  };

  const calculateBuilding = () => {
    if (!inputValue) return null;

    const value = parseFloat(inputValue);
    let monthlyScheduled, monthlyRecruits;

    if (solveFor === 'activity') {
      if (timePeriod === 'day') monthlyScheduled = value * 20;
      else if (timePeriod === 'week') monthlyScheduled = value * 4;
      else monthlyScheduled = value;
    } else if (solveFor === 'recruits') {
      if (timePeriod === 'day') monthlyRecruits = value * 20;
      else if (timePeriod === 'week') monthlyRecruits = value * 4;
      else monthlyRecruits = value;
    }

    let monthlyShowed, monthlyIntros;

    if (marketType === 'warm') {
      if (solveFor === 'activity') {
        monthlyShowed = monthlyScheduled * 0.4;
        monthlyRecruits = monthlyShowed * 0.33;
      } else {
        monthlyShowed = monthlyRecruits / 0.33;
        monthlyScheduled = monthlyShowed / 0.4;
      }
    } else {
      if (solveFor === 'activity') {
        monthlyShowed = monthlyScheduled * 0.33;
        monthlyIntros = monthlyShowed * 0.66;
        monthlyRecruits = monthlyIntros * 0.33;
      } else {
        monthlyIntros = monthlyRecruits / 0.33;
        monthlyShowed = monthlyIntros / 0.66;
        monthlyScheduled = monthlyShowed / 0.33;
      }
    }

    const monthlyDistrictLeaders = monthlyRecruits * 0.1;

    return {
      scheduled: {
        month: Math.round(monthlyScheduled),
        week: Math.round(monthlyScheduled / 4),
        day: Math.round(monthlyScheduled / 20)
      },
      showed: {
        month: Math.round(monthlyShowed),
        week: Math.round(monthlyShowed / 4),
        day: Math.round(monthlyShowed / 20)
      },
      intros: marketType === 'cold' ? {
        month: Math.round(monthlyIntros),
        week: Math.round(monthlyIntros / 4),
        day: Math.round(monthlyIntros / 20)
      } : null,
      recruits: {
        month: Math.round(monthlyRecruits),
        week: Math.round(monthlyRecruits / 4),
        day: Math.round(monthlyRecruits / 20)
      },
      districtLeaders: {
        month: Math.round(monthlyDistrictLeaders * 10) / 10,
        week: Math.round(monthlyDistrictLeaders / 4 * 10) / 10,
        day: Math.round(monthlyDistrictLeaders / 20 * 10) / 10
      }
    };
  };

  const productResults = section === 'product' ? calculateProduct() : null;
  const buildingResults = section === 'building' ? calculateBuilding() : null;

  if (loading) {
    return (
      <div className="app-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      overflow: 'hidden'
    }}>
      {/* Dynamic Bar Background - Black */}
      <div style={{
        backgroundColor: '#000000',
        position: 'fixed',
        top: '0',
        left: '0',
        right: '0',
        height: '60px',
        zIndex: '999'
      }}></div>

      {/* Back Button - Fixed Position */}
      <button
        onClick={handleBackToHome}
        style={{
          position: 'fixed',
          top: '70px',
          left: '20px',
          zIndex: '1000',
          width: '36px',
          height: '36px',
          fontSize: '1.5rem',
          boxShadow: '0 2px 8px rgba(255, 0, 0, 0.2)',
          borderRadius: '50%',
          backgroundColor: '#ff0000',
          color: '#ffffff',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        ←
      </button>

      {/* Title - Fixed Position */}
      <div style={{
        position: 'fixed',
        top: '70px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: '1000'
      }}>
        <h1 className="app-title" style={{margin: '0', fontSize: '2rem'}}>Calculator</h1>
      </div>

      {/* Scrollable Content Container */}
      <div style={{
        position: 'fixed',
        top: '120px',
        left: '0',
        right: '0',
        bottom: '20px',
        overflowY: 'auto',
        overflowX: 'hidden',
        touchAction: 'pan-y',
        WebkitOverflowScrolling: 'touch'
      }}>
        <div className="app-container" style={{
          marginTop: '0',
          minHeight: '100%',
          paddingBottom: '20px',
          paddingLeft: '20px',
          paddingRight: '25px',
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}>

          <div className="content-section">
            <p>Business calculation tools for sales and recruiting</p>
          </div>

          {/* Position Selection */}
          {!position && (
            <div className="calculator-section">
              <h2 className="calculator-title">What is your position?</h2>
              <div className="calculator-grid">
                <button
                  onClick={() => setPosition('representative')}
                  className="calculator-button"
                >
                  Representative (25%)
                </button>
                <button
                  onClick={() => setPosition('district')}
                  className="calculator-button"
                >
                  District Leader (50%)
                </button>
                <button
                  onClick={() => setPosition('division')}
                  className="calculator-button"
                >
                  Division Leader (60%)
                </button>
                <button
                  onClick={() => setPosition('regional')}
                  className="calculator-button"
                >
                  Regional Leader (70%)
                </button>
                <button
                  onClick={() => setPosition('rvp')}
                  className="calculator-button"
                >
                  Regional VP (110%)
                </button>
              </div>
            </div>
          )}

          {/* Section Selection */}
          {position && !section && (
            <div className="calculator-section">
              <h2 className="calculator-title">Choose your focus:</h2>
              <div className="calculator-grid-two">
                <button
                  onClick={() => setSection('product')}
                  className="calculator-button-large"
                >
                  PRODUCT (Sales)
                </button>
                <button
                  onClick={() => setSection('building')}
                  className="calculator-button-large"
                >
                  BUILDING (Recruiting)
                </button>
              </div>
              <button
                onClick={resetCalculator}
                className="calculator-back-link"
              >
                ← Back to Position
              </button>
            </div>
          )}

          {/* Product Section */}
          {section === 'product' && !solveFor && (
            <div className="calculator-section">
              <h2 className="calculator-title">What do you want to solve for?</h2>
              <div className="calculator-grid-three">
                <button
                  onClick={() => setSolveFor('activity')}
                  className="calculator-button"
                >
                  Activity (Appointments)
                </button>
                <button
                  onClick={() => setSolveFor('premium')}
                  className="calculator-button"
                >
                  Premium ($)
                </button>
                <button
                  onClick={() => setSolveFor('cash')}
                  className="calculator-button"
                >
                  Cash ($)
                </button>
              </div>
              <button
                onClick={resetCalculator}
                className="calculator-back-link"
              >
                ← Back to Position
              </button>
            </div>
          )}

          {/* Building Section */}
          {section === 'building' && !solveFor && (
            <div className="calculator-section">
              <h2 className="calculator-title">What do you want to solve for?</h2>
              <div className="calculator-grid-two">
                <button
                  onClick={() => setSolveFor('activity')}
                  className="calculator-button"
                >
                  Activity (Interviews)
                </button>
                <button
                  onClick={() => setSolveFor('recruits')}
                  className="calculator-button"
                >
                  Recruits
                </button>
              </div>
              <button
                onClick={resetCalculator}
                className="calculator-back-link"
              >
                ← Back to Position
              </button>
            </div>
          )}

          {/* Input Section */}
          {section && solveFor && (
            <div className="calculator-section">
              <div className="calculator-input-container">
                <button
                  onClick={() => setSolveFor('')}
                  className="calculator-back-link"
                  style={{marginBottom: '1rem'}}
                >
                  ← Back
                </button>

                {section === 'building' && (
                  <div className="calculator-radio-group">
                    <label className="calculator-label">Market Type:</label>
                    <div className="calculator-radio-container">
                      <label className="calculator-radio-item">
                        <input
                          type="radio"
                          value="warm"
                          checked={marketType === 'warm'}
                          onChange={(e) => setMarketType(e.target.value)}
                          className="calculator-radio"
                        />
                        Warm Market
                      </label>
                      <label className="calculator-radio-item">
                        <input
                          type="radio"
                          value="cold"
                          checked={marketType === 'cold'}
                          onChange={(e) => setMarketType(e.target.value)}
                          className="calculator-radio"
                        />
                        Cold Market
                      </label>
                    </div>
                  </div>
                )}

                <div className="calculator-input-group">
                  <label className="calculator-label">
                    Enter your {solveFor === 'activity' ? (section === 'product' ? 'appointments' : 'interviews') : solveFor}:
                  </label>
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="calculator-input"
                    placeholder="Enter number..."
                  />
                </div>

                <div className="calculator-time-group">
                  <label className="calculator-label">Time Period:</label>
                  <div className="calculator-time-buttons">
                    <button
                      onClick={() => setTimePeriod('day')}
                      className={`calculator-time-button ${timePeriod === 'day' ? 'active' : ''}`}
                    >
                      Per Day
                    </button>
                    <button
                      onClick={() => setTimePeriod('week')}
                      className={`calculator-time-button ${timePeriod === 'week' ? 'active' : ''}`}
                    >
                      Per Week
                    </button>
                    <button
                      onClick={() => setTimePeriod('month')}
                      className={`calculator-time-button ${timePeriod === 'month' ? 'active' : ''}`}
                    >
                      Per Month
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Section - Product */}
          {productResults && (
            <div className="calculator-results">
              <h3 className="calculator-results-title">Product Results</h3>

              <div className="calculator-results-header">
                <div className="calculator-results-col">Month (4 weeks)</div>
                <div className="calculator-results-col">Week</div>
                <div className="calculator-results-col">Day</div>
              </div>

              <div className="calculator-results-grid">
                <div className="calculator-results-row">
                  <div className="calculator-results-cell">
                    <div className="calculator-results-label">Appointments</div>
                    <div className="calculator-results-value">{Math.round(productResults.appointments.month)}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{Math.round(productResults.appointments.week)}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{Math.round(productResults.appointments.day)}</div>
                  </div>
                </div>

                <div className="calculator-results-row">
                  <div className="calculator-results-cell">
                    <div className="calculator-results-label">Financial Plans</div>
                    <div className="calculator-results-value">{Math.round(productResults.plans.month)}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{Math.round(productResults.plans.week)}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{Math.round(productResults.plans.day)}</div>
                  </div>
                </div>

                <div className="calculator-results-row">
                  <div className="calculator-results-cell">
                    <div className="calculator-results-label">Sales</div>
                    <div className="calculator-results-value">{Math.round(productResults.sales.month)}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{Math.round(productResults.sales.week)}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{Math.round(productResults.sales.day)}</div>
                  </div>
                </div>

                <div className="calculator-results-row">
                  <div className="calculator-results-cell">
                    <div className="calculator-results-label">Premium</div>
                    <div className="calculator-results-value">${Math.round(productResults.premium.month).toLocaleString()}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">${Math.round(productResults.premium.week).toLocaleString()}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">${Math.round(productResults.premium.day).toLocaleString()}</div>
                  </div>
                </div>

                <div className="calculator-results-row">
                  <div className="calculator-results-cell">
                    <div className="calculator-results-label">Cash ({productResults.currentPosition.name})</div>
                    <div className="calculator-results-value">${Math.round(productResults.cash.month).toLocaleString()}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">${Math.round(productResults.cash.week).toLocaleString()}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">${Math.round(productResults.cash.day).toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results Section - Building */}
          {buildingResults && (
            <div className="calculator-results">
              <h3 className="calculator-results-title">Building Results ({marketType} market)</h3>

              <div className="calculator-results-header">
                <div className="calculator-results-col">Month (4 weeks)</div>
                <div className="calculator-results-col">Week</div>
                <div className="calculator-results-col">Day</div>
              </div>

              <div className="calculator-results-grid">
                <div className="calculator-results-row">
                  <div className="calculator-results-cell">
                    <div className="calculator-results-label">Interviews Scheduled</div>
                    <div className="calculator-results-value">{buildingResults.scheduled.month}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{buildingResults.scheduled.week}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{buildingResults.scheduled.day}</div>
                  </div>
                </div>

                <div className="calculator-results-row">
                  <div className="calculator-results-cell">
                    <div className="calculator-results-label">Showed Up</div>
                    <div className="calculator-results-value">{buildingResults.showed.month}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{buildingResults.showed.week}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{buildingResults.showed.day}</div>
                  </div>
                </div>

                {buildingResults.intros && (
                  <div className="calculator-results-row">
                    <div className="calculator-results-cell">
                      <div className="calculator-results-label">Intro/Follow-ups</div>
                      <div className="calculator-results-value">{buildingResults.intros.month}</div>
                    </div>
                    <div className="calculator-results-cell">
                      <div className="calculator-results-value">{buildingResults.intros.week}</div>
                    </div>
                    <div className="calculator-results-cell">
                      <div className="calculator-results-value">{buildingResults.intros.day}</div>
                    </div>
                  </div>
                )}

                <div className="calculator-results-row">
                  <div className="calculator-results-cell">
                    <div className="calculator-results-label">Recruits Joined</div>
                    <div className="calculator-results-value">{buildingResults.recruits.month}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{buildingResults.recruits.week}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{buildingResults.recruits.day}</div>
                  </div>
                </div>

                <div className="calculator-results-row">
                  <div className="calculator-results-cell">
                    <div className="calculator-results-label">Future District Leaders</div>
                    <div className="calculator-results-value">{buildingResults.districtLeaders.month}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{buildingResults.districtLeaders.week}</div>
                  </div>
                  <div className="calculator-results-cell">
                    <div className="calculator-results-value">{buildingResults.districtLeaders.day}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default Calculator;