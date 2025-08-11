import React from 'react';

// Using the icon imports you have
import search from '../../assets/icons/search.svg';
import close from '../../assets/icons/close.svg';
import keyboard_arrow_down from '../../assets/icons/keyboard_arrow_down.svg';
import keyboard_arrow_up from '../../assets/icons/keyboard_arrow_up.svg';

interface SearchPanelProps {
    onClose: () => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    searchResults: { count: number, current: number };
    onNext: () => void;
    onPrevious: () => void;
    }

    const SearchPanel: React.FC<SearchPanelProps> = ({
        onClose,
        searchQuery,
        setSearchQuery,
        searchResults,
        onNext,
        onPrevious
    }) => {
    // Styles from your instructions
    const outerBoxStyle: React.CSSProperties = {
        position: 'absolute',
        left: '271px',
        top: 0,
        display: 'flex',
        padding: '12px',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
        borderRadius: '0px 0px 8px 8px',
        background: 'var(--neutral-light-for-white-bg-neutral-1300, #0C1927)',
        zIndex: 50,
        fontFamily: "'Noto Sans', sans-serif"
    };

    const searchInputBoxStyle: React.CSSProperties = {
        display: 'flex',
        width: '318px',
        height: '40px',
        padding: '8px 12px',
        alignItems: 'center',
        gap: '12px',
        borderRadius: '8px',
        border: '1px solid  var(--neutral-light-for-white-bg-neutral-a-100, rgba(108, 132, 157, 0.18)',
        background: ' var(--neutral-light-for-white-bg-neutral-a-100, #243547)'
    };

    return (
        // Main Container ("other box")
        <div style={outerBoxStyle}>

        {/* Top Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

            {/* Search Input Group ("inner box") */}
            <div style={searchInputBoxStyle}>
            <img src={search} alt="Search" style={{ flexShrink: 0 , width: '16px', height: '16px' }} />
            <input
                type="text"
                placeholder="Search by keywords"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#FFFFFF',
                fontSize: '14px'
                }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            <span style={{ color: '#E5E7EB', fontSize: '14px', flexShrink: 0, whiteSpace: 'nowrap' }}>
                {searchResults.count > 0 ? `${searchResults.current}/${searchResults.count}` : ''}
            </span>
            <button onClick={onPrevious} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
                <img src={keyboard_arrow_up} alt="Previous" />
            </button>
            <button onClick={onNext} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer' }}>
                <img src={keyboard_arrow_down} alt="Next" />
            </button>
            </div>
            </div>

            

            <button onClick={onClose} style={{ background: 'none', border: 'none', padding: '4px', cursor: 'pointer', flexShrink: 0 }}>
            <img src={close} alt="Close" />
            </button>
        </div>

        </div>
    );
};

export default SearchPanel;
