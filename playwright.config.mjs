import{defineConfig,devices}from'@playwright/test';
const iphone={...devices['iPhone 13']};delete iphone.defaultBrowserType;
export default defineConfig({
 testDir:'./tests/qa',timeout:90_000,expect:{timeout:5_000},workers:1,retries:1,
 use:{baseURL:'http://127.0.0.1:4173',...iphone,browserName:'chromium',headless:true,video:'retain-on-failure',trace:'retain-on-failure',screenshot:'only-on-failure'},
 webServer:{command:'python3 -m http.server 4173',url:'http://127.0.0.1:4173',reuseExistingServer:true,timeout:30_000},
 reporter:[['line'],['html',{open:'never',outputFolder:'playwright-report'}]]
});
