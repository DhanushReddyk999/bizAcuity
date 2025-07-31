import { useState } from 'react';

export default function wallDimensions({width,height,setWidth,setHeight}){
  // Helper to extract numeric part
  const getNumeric = (val) => val.replace(/[^0-9]/g, '');

  return (
    <div className="wallDimensionsPanel" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5em',
      width: '100%',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      background: 'none',
      border: 'none',
      boxShadow: 'none',
      padding: 0,
      margin: 0
    }}>
      <span style={{
        fontWeight: 800,
        color: '#1769aa',
        fontSize: '1.6em',
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        marginBottom: '0.5em'
      }}>Wall Settings</span>
      
      <div style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '2em',
        width: '100%',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5em',
          flex: 1,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 6px rgba(33,150,243,0.07)',
          border: '1.5px solid #e5e7eb',
          padding: '1.1em 1.2em',
          alignItems: 'center',
        }}>
          <label htmlFor="width" style={{
            fontSize: '1.1em',
            fontWeight: 600,
            color: '#1769aa',
            marginBottom: '0.3em',
            marginRight: '0.5em',
          }}>Width</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f9fafb', borderRadius: 8, border: '1.5px solid #d1d5db', padding: '0.2em 0.7em' }}>
            <input
              type="number"
              value={getNumeric(width)}
              name="width"
              onChange={(e) => setWidth(e.target.value ? `${e.target.value}px` : '')}
              placeholder="800"
              min="1"
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '1.1em',
                background: 'transparent',
                width: 70,
                color: '#1769aa',
                fontWeight: 600
              }}
            />
            <span style={{ color: '#b5b5d6', fontWeight: 500, marginLeft: 4 }}>px</span>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5em',
          flex: 1,
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 1px 6px rgba(33,150,243,0.07)',
          border: '1.5px solid #e5e7eb',
          padding: '1.1em 1.2em',
          alignItems: 'center',
        }}>
          <label htmlFor="height" style={{
            fontSize: '1.1em',
            fontWeight: 600,
            color: '#1769aa',
            marginBottom: '0.3em',
            marginRight: '0.5em',
          }}>Height</label>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f9fafb', borderRadius: 8, border: '1.5px solid #d1d5db', padding: '0.2em 0.7em' }}>
            <input
              type="number"
              value={getNumeric(height)}
              name="height"
              onChange={(e) => setHeight(e.target.value ? `${e.target.value}px` : '')}
              placeholder="500"
              min="1"
              style={{
                border: 'none',
                outline: 'none',
                fontSize: '1.1em',
                background: 'transparent',
                width: 70,
                color: '#1769aa',
                fontWeight: 600
              }}
            />
            <span style={{ color: '#b5b5d6', fontWeight: 500, marginLeft: 4 }}>px</span>
          </div>
        </div>
      </div>
    </div>
  )
}