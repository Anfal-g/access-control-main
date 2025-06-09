
export const generateVisitorId = () => {
    const prefix = 'VIS';
    const uniquePart = Date.now().toString().slice(-6); // e.g., 857321
    return `${prefix}-${uniquePart}`;
  };