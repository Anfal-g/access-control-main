
export const generateRequestId = () => {
    const prefix = 'REQ';
    const uniquePart = Date.now().toString().slice(-6); // e.g., 857321
    return `${prefix}-${uniquePart}`;
  };