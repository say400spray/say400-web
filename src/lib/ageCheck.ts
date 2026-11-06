export const AGE_KEY = 'age_confirmed'
export const AGE_PENDING = 'age-pending'

/**
 * Runs in <head>, before the page is painted: on a first visit it covers the page straight away,
 * so the shop never flashes for a moment before the age question appears (see AgeGate).
 */
export const AGE_COVER_SCRIPT = `try{if(localStorage.getItem('${AGE_KEY}')!=='1'&&!location.pathname.startsWith('/legal'))document.documentElement.classList.add('${AGE_PENDING}')}catch(e){}`
