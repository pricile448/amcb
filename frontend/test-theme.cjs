const puppeteer = require('puppeteer');

async function testThemeSwitching() {
  console.log('🧪 Testing theme switching functionality...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  try {
    const page = await browser.newPage();
    
    // Navigate to the application
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    console.log('✅ Application loaded');
    
    // Wait for the page to load completely
    await page.waitForTimeout(2000);
    
    // Check initial theme state
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    });
    console.log(`🌅 Initial theme: ${initialTheme}`);
    
    // Navigate to settings page
    await page.click('a[href="/dashboard/settings"]');
    await page.waitForTimeout(1000);
    console.log('✅ Navigated to settings page');
    
    // Click on preferences tab
    await page.click('button:has-text("Preferences")');
    await page.waitForTimeout(500);
    console.log('✅ Clicked on preferences tab');
    
    // Test light theme
    console.log('\n☀️ Testing light theme...');
    await page.click('button:has-text("Light")');
    await page.waitForTimeout(500);
    
    const lightThemeApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('light') && 
             !document.documentElement.classList.contains('dark');
    });
    console.log(`Light theme applied: ${lightThemeApplied ? '✅' : '❌'}`);
    
    // Test dark theme
    console.log('\n🌙 Testing dark theme...');
    await page.click('button:has-text("Dark")');
    await page.waitForTimeout(500);
    
    const darkThemeApplied = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') && 
             !document.documentElement.classList.contains('light');
    });
    console.log(`Dark theme applied: ${darkThemeApplied ? '✅' : '❌'}`);
    
    // Test auto theme
    console.log('\n🔄 Testing auto theme...');
    await page.click('button:has-text("Auto")');
    await page.waitForTimeout(500);
    
    const autoThemeApplied = await page.evaluate(() => {
      const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDarkMode ? 
        document.documentElement.classList.contains('dark') :
        document.documentElement.classList.contains('light');
    });
    console.log(`Auto theme applied: ${autoThemeApplied ? '✅' : '❌'}`);
    
    // Check localStorage
    const savedTheme = await page.evaluate(() => {
      return localStorage.getItem('theme');
    });
    console.log(`💾 Saved theme in localStorage: ${savedTheme}`);
    
    // Test visual changes
    console.log('\n🎨 Testing visual changes...');
    
    // Check if background color changes
    const backgroundColor = await page.evaluate(() => {
      return getComputedStyle(document.body).backgroundColor;
    });
    console.log(`Background color: ${backgroundColor}`);
    
    // Check if text color changes
    const textColor = await page.evaluate(() => {
      return getComputedStyle(document.body).color;
    });
    console.log(`Text color: ${textColor}`);
    
    console.log('\n✅ Theme switching test completed!');
    
  } catch (error) {
    console.error('❌ Error during theme testing:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testThemeSwitching().catch(console.error); 