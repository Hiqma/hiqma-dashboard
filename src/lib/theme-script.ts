export const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      var initialTheme = theme || 'light';
      
      if (initialTheme === 'dark') {
        document.documentElement.classList.add('dark');
      }
    } catch (e) {}
  })();
`;