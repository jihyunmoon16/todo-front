const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testCalendarDeselect() {
  const { Builder, By, until } = require('selenium-webdriver');
  const chrome = require('selenium-webdriver/chrome');
  let driver;
  try {
    const options = new chrome.Options();
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    await driver.get('http://localhost:9002');
    // 로그인
    await driver.wait(until.elementLocated(By.css('input[placeholder="m@example.com"]')), 10000);
    await driver.findElement(By.css('input[placeholder="m@example.com"]')).sendKeys('test@example.com');
    await driver.findElement(By.css('input[type="password"]')).sendKeys('123456');
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Eisenhower Matrix')]")), 10000);
    // Add Task 다이얼로그 열기
    await driver.findElement(By.xpath("//button[contains(text(), 'Add Task')]")) .click();
    await driver.wait(until.elementLocated(By.css('[role="dialog"]')), 5000);
    // 캘린더 버튼 클릭
    await driver.findElement(By.css('[role="dialog"] button.w-full.text-left')).click();
    await driver.wait(until.elementLocated(By.css('[role="dialog"] [role="grid"]')), 5000);
    // 19일 버튼 찾기
    const dayButtons = await driver.findElements(By.css('[role="grid"] button'));
    let day19Button = null;
    for (const btn of dayButtons) {
      const text = await btn.getText();
      const disabled = await btn.getAttribute('disabled');
      if (text === '19' && !disabled) {
        day19Button = btn;
        break;
      }
    }
    if (!day19Button) throw new Error('19일 버튼을 찾을 수 없습니다.');
    // 19일 한 번 클릭(선택)
    await day19Button.click();
    await driver.sleep(500);
    // 19일 다시 클릭(해제)
    await day19Button.click();
    await driver.sleep(500);
    // input[type='date'] 값 확인 (비어 있어야 함)
    const dateInput = await driver.findElement(By.css('[role="dialog"] input[type="date"]'));
    const value = await dateInput.getAttribute('value');
    if (value === '') {
      console.log('✅ 19일을 두 번 클릭하면 선택 해제(deselect) 동작이 정상입니다!');
    } else {
      console.log('❌ 19일을 두 번 클릭해도 선택 해제가 되지 않습니다. 현재 값:', value);
    }
  } catch (e) {
    console.error('캘린더 선택 해제 테스트 중 오류:', e);
  } finally {
    if (driver) await driver.quit();
  }
}

async function testAddTaskWithSelenium() {
  let driver;
  
  try {
    console.log('🚀 Chrome 드라이버를 시작합니다...');
    const options = new chrome.Options();
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    console.log('🌐 페이지로 이동합니다...');
    await driver.get('http://localhost:9002');
    // 로그인
    console.log('📝 로그인 폼을 작성합니다...');
    await driver.wait(until.elementLocated(By.css('input[placeholder="m@example.com"]')), 10000);
    const emailInput = await driver.findElement(By.css('input[placeholder="m@example.com"]'));
    const passwordInput = await driver.findElement(By.css('input[type="password"]'));
    await emailInput.sendKeys('test@example.com');
    await passwordInput.sendKeys('123456');
    console.log('🔐 로그인 버튼을 클릭합니다...');
    const loginButton = await driver.findElement(By.css('button[type="submit"]'));
    await loginButton.click();
    // 로그인 성공 여부 확인 (대시보드 타이틀 대기)
    try {
      await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Eisenhower Matrix')]")), 10000);
    } catch (loginError) {
      // 로그인 실패 시 회원가입 시도
      console.log('❌ 로그인 실패, 회원가입을 시도합니다...');
      // 회원가입 페이지로 이동
      await driver.get('http://localhost:9002/signup');
      await driver.wait(until.elementLocated(By.css('input[placeholder="m@example.com"]')), 10000);
      const signupEmailInput = await driver.findElement(By.css('input[placeholder="m@example.com"]'));
      const signupPasswordInput = await driver.findElement(By.css('input[type="password"]'));
      const signupNameInput = await driver.findElement(By.css('input[placeholder="John Doe"]'));
      await signupEmailInput.clear();
      await signupPasswordInput.clear();
      await signupNameInput.clear();
      await signupEmailInput.sendKeys('test@example.com');
      await signupPasswordInput.sendKeys('123456');
      await signupNameInput.sendKeys('테스트');
      const signupButton = await driver.findElement(By.css('button[type="submit"]'));
      await signupButton.click();
      // 회원가입 후 로그인 페이지로 이동 (혹은 자동 이동)
      await driver.wait(until.urlContains('/login'), 10000).catch(() => {});
      // 다시 로그인 시도
      await driver.wait(until.elementLocated(By.css('input[placeholder="m@example.com"]')), 10000);
      const reloginEmailInput = await driver.findElement(By.css('input[placeholder="m@example.com"]'));
      const reloginPasswordInput = await driver.findElement(By.css('input[type="password"]'));
      await reloginEmailInput.clear();
      await reloginPasswordInput.clear();
      await reloginEmailInput.sendKeys('test@example.com');
      await reloginPasswordInput.sendKeys('123456');
      const reloginButton = await driver.findElement(By.css('button[type="submit"]'));
      await reloginButton.click();
      // 대시보드 타이틀 대기
      await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Eisenhower Matrix')]")), 10000);
    }
    // 대시보드 로드 대기
    console.log('⏳ 대시보드 로드를 기다립니다...');

    // 오늘, 내일, 모레 날짜 배열 생성
    const dates = [0, 1, 2].map(offset => {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      return d;
    });

    for (const dateObj of dates) {
      const year = dateObj.getFullYear();
      const month = dateObj.getMonth() + 1;
      const day = dateObj.getDate();
      const dayLabel = dateObj.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
      // Add Task 버튼 클릭
      console.log(`➕ Add Task 버튼을 클릭합니다... (${dayLabel})`);
      const addTaskButton = await driver.findElement(By.xpath("//button[contains(text(), 'Add Task')]"));
      await addTaskButton.click();
      
      // 다이얼로그가 완전히 로드될 때까지 대기
      console.log('⏳ 다이얼로그 로드를 기다립니다...');
      await driver.wait(until.elementLocated(By.css('[role="dialog"]')), 10000);
      await driver.sleep(2000); // 추가 대기 시간
      
      // 다이얼로그가 여전히 열려있는지 확인
      const dialogs = await driver.findElements(By.css('[role="dialog"]'));
      if (dialogs.length === 0) {
        console.log('❌ 다이얼로그가 닫혔습니다. 다시 시도합니다.');
        continue;
      }
      
      console.log('✅ 다이얼로그가 열렸습니다.');
      
      // 제목 입력
      console.log('📝 제목을 입력합니다...');
      await driver.wait(until.elementLocated(By.css('input[placeholder="e.g. Finish project proposal"]')), 5000);
      const titleInput = await driver.findElement(By.css('input[placeholder="e.g. Finish project proposal"]'));
      await titleInput.clear();
      await titleInput.sendKeys(`Test Task ${dayLabel}`);
      
      // 설명 입력
      console.log('📄 설명을 입력합니다...');
      const descriptionInput = await driver.findElement(By.css('textarea[placeholder="Add more details..."]'));
      await descriptionInput.clear();
      await descriptionInput.sendKeys(`This is a test task for ${dayLabel}`);
      
      // 날짜는 기본값(오늘) 사용 - 복잡한 날짜 선택 건너뛰기
      console.log('📅 기본 날짜(오늘)를 사용합니다...');
      
      // 태그 입력
      console.log('🏷️ 태그를 입력합니다...');
      try {
        const tagInput = await driver.findElement(By.css('input[placeholder="e.g. Work"]'));
        await tagInput.clear();
        await tagInput.sendKeys('Test');
        console.log('✅ 태그 입력 완료');
      } catch (error) {
        console.log('⚠️ 태그 입력 필드를 찾을 수 없습니다. 건너뜁니다.');
      }
      
      // 쿼드런트 선택 (Q1)
      console.log('🎯 쿼드런트를 선택합니다...');
      try {
        // Q1 쿼드런트의 FormLabel을 찾아서 클릭
        const q1Label = await driver.findElement(By.xpath("//label[contains(@class, 'flex') and contains(@class, 'border-muted') and contains(text(), 'Q1')]"));
        await q1Label.click();
        console.log('✅ 쿼드런트 선택 완료');
        
        // 선택이 제대로 되었는지 확인
        await driver.sleep(1000);
        const selectedQuadrant = await driver.findElement(By.css('[role="dialog"] label.border-primary'));
        const quadrantText = await selectedQuadrant.getText();
        console.log(`🎯 선택된 쿼드런트: ${quadrantText}`);
      } catch (error) {
        console.log('⚠️ 쿼드런트 선택에 실패했습니다. 기본값 사용');
      }
      
      // 폼 상태 확인 및 디버깅
      console.log('🔍 폼 상태를 확인합니다...');
      try {
        // 모든 입력 필드의 값을 확인
        const titleInput = await driver.findElement(By.css('input[placeholder="e.g. Finish project proposal"]'));
        const titleValue = await titleInput.getAttribute('value');
        console.log(`📝 제목 입력값: "${titleValue}"`);
        
        const descriptionInput = await driver.findElement(By.css('textarea[placeholder="Add more details..."]'));
        const descriptionValue = await descriptionInput.getAttribute('value');
        console.log(`📄 설명 입력값: "${descriptionValue}"`);
        
        // 폼 에러 메시지 확인
        const errorMessages = await driver.findElements(By.css('[role="dialog"] .text-destructive'));
        if (errorMessages.length > 0) {
          console.log('❌ 폼 에러 메시지:');
          for (const error of errorMessages) {
            const errorText = await error.getText();
            console.log(`  - ${errorText}`);
          }
        } else {
          console.log('✅ 폼 에러 메시지 없음');
        }
        
        // Save Task 버튼 상태 확인
        const saveButtons = await driver.findElements(By.xpath("//button[contains(text(), 'Save Task')]"));
        if (saveButtons.length > 0) {
          const isEnabled = await saveButtons[0].isEnabled();
          console.log(`💾 Save Task 버튼 활성화 상태: ${isEnabled}`);
        } else {
          console.log('❌ Save Task 버튼을 찾을 수 없습니다');
        }
        
      } catch (error) {
        console.log('⚠️ 폼 상태 확인 중 오류:', error.message);
      }
      
      // Save Task 버튼 클릭
      console.log('💾 Save Task 버튼을 클릭합니다...');
      try {
        const saveButton = await driver.findElement(By.xpath("//button[contains(text(), 'Save Task')]"));
        await saveButton.click();
        console.log('✅ Save Task 버튼 클릭 완료');
        
        // API 호출 결과 확인을 위한 대기
        console.log('⏳ API 응답을 기다립니다...');
        await driver.sleep(3000);
        
        // 브라우저 콘솔 로그 확인
        const logs = await driver.manage().logs().get('browser');
        console.log('🔍 브라우저 콘솔 로그:');
        logs.forEach(log => {
          if (log.message.includes('Failed to create todo') || 
              log.message.includes('Error') || 
              log.message.includes('api/todos') ||
              log.message.includes('백엔드로 전송할 데이터') ||
              log.message.includes('API 호출 성공') ||
              log.message.includes('API 호출 실패') ||
              log.message.includes('Failed to load') ||
              log.message.includes('AxiosError')) {
            console.log(`  - ${log.message}`);
          }
        });
        
        // 모든 로그를 한 번 더 확인 (더 많은 정보를 위해)
        console.log('🔍 전체 브라우저 로그 (최근 10개):');
        const recentLogs = logs.slice(-10);
        recentLogs.forEach(log => {
          console.log(`  - ${log.message}`);
        });
        
      } catch (error) {
        console.log('❌ Save Task 버튼을 찾을 수 없습니다:', error.message);
        // 다이얼로그 닫기
        const cancelButton = await driver.findElement(By.xpath("//button[contains(text(), 'Cancel')]"));
        await cancelButton.click();
        continue;
      }
      
      // 다이얼로그가 닫히는지 확인
      console.log('⏳ 다이얼로그가 닫히는지 확인합니다...');
      await driver.wait(async () => {
        const dialogs = await driver.findElements(By.css('[role="dialog"]'));
        return dialogs.length === 0;
      }, 10000);
      
      // 다이얼로그가 닫힌 후, 새로 추가된 태스크가 대시보드에 나타나는지 확인
      console.log('✅ 새로 추가된 태스크를 확인합니다...');
      let taskFound = false;
      try {
        await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), 'Test Task ${dayLabel}')]`)), 10000);
        console.log(`✅ ${dayLabel} 태스크가 성공적으로 추가되었습니다!`);
        taskFound = true;
      } catch (error) {
        console.log(`❌ ${dayLabel} 태스크가 대시보드에 나타나지 않았습니다:`, error.message);
        // "This Week" 탭으로 전환해서 확인해보기
        console.log('🔄 "This Week" 탭으로 전환해서 확인합니다...');
        try {
          const thisWeekTab = await driver.findElement(By.xpath("//button[contains(text(), 'This Week')]"));
          await thisWeekTab.click();
          await driver.sleep(2000);
          await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), 'Test Task ${dayLabel}')]`)), 10000);
          console.log(`✅ ${dayLabel} 태스크가 "This Week" 탭에서 발견되었습니다!`);
          taskFound = true;
        } catch (weekError) {
          console.log(`❌ "This Week" 탭에서도 ${dayLabel} 태스크를 찾을 수 없습니다:`, weekError.message);
        }
      }
      // 새로고침 후에도 태스크가 보이는지 확인
      if (taskFound) {
        console.log('🔄 페이지를 새로고침해서 태스크가 유지되는지 확인합니다...');
        await driver.navigate().refresh();
        await driver.sleep(2000);
        try {
          await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), 'Test Task ${dayLabel}')]`)), 10000);
          console.log(`✅ 새로고침 후에도 ${dayLabel} 태스크가 정상적으로 보입니다!`);
        } catch (refreshError) {
          console.log(`❌ 새로고침 후 ${dayLabel} 태스크가 보이지 않습니다:`, refreshError.message);
        }
      }
    }
  } catch (error) {
    console.error('테스트 중 오류 발생:', error);
  } finally {
    if (driver) {
      await driver.quit();
      console.log('👋 Chrome 드라이버를 종료합니다.');
    }
  }
}

// 기존 테스트 실행 전 캘린더 deselect 테스트 먼저 실행
(async () => {
  await testCalendarDeselect();
  await testAddTaskWithSelenium();
})();