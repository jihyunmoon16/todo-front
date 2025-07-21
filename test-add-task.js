const puppeteer = require('puppeteer');

async function testAddTask() {
  const browser = await puppeteer.launch({ 
    headless: false, 
    slowMo: 1000,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    console.log('🚀 브라우저를 시작하고 페이지로 이동합니다...');
    await page.goto('http://localhost:9002', { waitUntil: 'networkidle0' });
    
    // 로그인 페이지에서 임의의 이메일과 비밀번호 입력
    console.log('📝 로그인 폼을 작성합니다...');
    await page.waitForSelector('input[placeholder="m@example.com"]');
    await page.type('input[placeholder="m@example.com"]', 'test@example.com');
    await page.type('input[type="password"]', '123456');
    
    // 로그인 버튼 클릭
    console.log('🔐 로그인 버튼을 클릭합니다...');
    await page.click('button[type="submit"]');
    
    // 대시보드 로드 대기
    console.log('⏳ 대시보드 로드를 기다립니다...');
    await page.waitForSelector('h1:has-text("Eisenhower Matrix")', { timeout: 10000 });
    
    // Add Task 버튼 클릭
    console.log('➕ Add Task 버튼을 클릭합니다...');
    await page.waitForSelector('button:has-text("Add Task")');
    await page.click('button:has-text("Add Task")');
    
    // 다이얼로그 로드 대기
    console.log('⏳ 다이얼로그 로드를 기다립니다...');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // 폼 필드 작성
    console.log('📝 폼 필드를 작성합니다...');
    
    // 제목 입력
    await page.waitForSelector('input[placeholder="e.g. Finish project proposal"]');
    await page.type('input[placeholder="e.g. Finish project proposal"]', 'Test Task');
    
    // 설명 입력
    await page.waitForSelector('textarea[placeholder="Add more details..."]');
    await page.type('textarea[placeholder="Add more details..."]', 'This is a test task description');
    
    // 날짜 선택
    console.log('📅 날짜를 선택합니다...');
    await page.waitForSelector('button:has-text("Pick a date")');
    await page.click('button:has-text("Pick a date")');
    
    // 캘린더 팝오버 대기
    await page.waitForSelector('[data-radix-popper-content-wrapper]', { timeout: 5000 });
    
    // 내일 날짜 선택 (오늘 날짜가 비활성화되어 있을 수 있으므로)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDay = tomorrow.getDate();
    
    // 캘린더에서 내일 날짜 클릭
    await page.waitForSelector('[role="grid"]');
    const dayButtons = await page.$$('[role="grid"] button[aria-label]');
    
    // 내일 날짜 찾기
    for (const button of dayButtons) {
      const ariaLabel = await button.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.includes(tomorrowDay.toString())) {
        await button.click();
        console.log(`📅 ${tomorrowDay}일을 선택했습니다.`);
        break;
      }
    }
    
    // 태그 입력
    console.log('🏷️ 태그를 입력합니다...');
    await page.waitForSelector('input[placeholder="e.g. Work"]');
    await page.type('input[placeholder="e.g. Work"]', 'Test');
    
    // 쿼드런트 선택 (Q1 선택)
    console.log('🎯 쿼드런트를 선택합니다...');
    await page.waitForSelector('input[value="Q1"]');
    await page.click('input[value="Q1"]');
    
    // Save Task 버튼 클릭
    console.log('💾 Save Task 버튼을 클릭합니다...');
    await page.waitForSelector('button:has-text("Save Task")');
    await page.click('button:has-text("Save Task")');
    
    // 다이얼로그가 닫히는지 확인
    console.log('⏳ 다이얼로그가 닫히는지 확인합니다...');
    await page.waitForFunction(() => {
      return !document.querySelector('[role="dialog"]');
    }, { timeout: 5000 });
    
    // 새로 추가된 태스크가 목록에 나타나는지 확인
    console.log('✅ 새로 추가된 태스크를 확인합니다...');
    await page.waitForSelector('text="Test Task"', { timeout: 5000 });
    
    console.log('🎉 테스트가 성공적으로 완료되었습니다!');
    
    // 스크린샷 저장
    await page.screenshot({ path: 'test-result.png', fullPage: true });
    console.log('📸 스크린샷이 test-result.png에 저장되었습니다.');
    
  } catch (error) {
    console.error('❌ 테스트 중 오류가 발생했습니다:', error.message);
    
    // 오류 발생 시 스크린샷 저장
    try {
      await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
      console.log('📸 오류 스크린샷이 error-screenshot.png에 저장되었습니다.');
    } catch (screenshotError) {
      console.error('스크린샷 저장 실패:', screenshotError.message);
    }
  } finally {
    // 5초 후 브라우저 종료
    setTimeout(async () => {
      await browser.close();
      console.log('🔚 브라우저를 종료합니다.');
    }, 5000);
  }
}

// 테스트 실행
testAddTask().catch(console.error); 