console.log("Selenium test script started");

const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

(async function testAuth() {
  let driver;
  let uniqueTitle = '';
  let testEmail, testPassword;
  
  try {
    console.log('🚀 Starting authentication test...');
    
    // Chrome 옵션 설정
    const options = new chrome.Options();
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    // options.addArguments('--headless'); // 헤드리스 모드 (필요시 주석 해제)
    
    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
    
    await driver.manage().window().maximize();
    await driver.manage().setTimeouts({ implicit: 10000 });
    
    const baseUrl = 'http://localhost:9002';
    
    // 1. Signup 테스트
    console.log('📝 Testing signup...');
    ({ testEmail, testPassword } = await testSignup(driver, baseUrl));
    
    // 잠시 대기
    await driver.sleep(2000);
    
    // 2. Login 테스트
    console.log('🔐 Testing login...');
    await testLogin(driver, baseUrl, testEmail, testPassword);
    
    // 3. Dashboard 확인
    console.log('📊 Testing dashboard...');
    await testDashboard(driver);

    // 4. Todo 생성 테스트
    console.log('📝 Testing create todo...');
    uniqueTitle = `Test Todo ${Date.now()}`;
    await testCreateTodo(driver, uniqueTitle);

    // 5. Start Focus (Pomodoro) Test
    // Find the just-created todo card (by title)
    const todoCard = await driver.wait(
      until.elementLocated(By.xpath(`//div[contains(@class,'rounded-lg') and .//div[contains(@class,'text-lg') and contains(text(),'${uniqueTitle}')]]`)),
      5000,
      'Todo card not found after creation'
    );
    // Click the 'Start Focus' button inside this card
    const startFocusBtn = await todoCard.findElement(By.xpath(".//button[contains(.,'Start Focus')]"));
    await startFocusBtn.click();
    await driver.sleep(1000);

    // 6. In FocusView: check for 'Focusing on:' and timer UI
    await driver.wait(until.elementLocated(By.xpath("//*[contains(text(),'Focusing on:')]")), 5000);
    await driver.wait(until.elementLocated(By.xpath(`//*[contains(text(),'${uniqueTitle}')]`)), 5000);
    // Set timer to 10 sec (테스트용)
    const tenSecBtn = await driver.findElement(By.xpath("//button[contains(.,'10 sec')]"));
    await tenSecBtn.click();
    await driver.sleep(500);
    // Start timer
    const playBtn = await driver.findElement(By.xpath("//button[contains(.,'Play')]"));
    await playBtn.click();
    // Wait for timer to reach 00:00 (약 12초 대기)
    await driver.sleep(12000);
    // After timer ends, should exit focus mode (no more 'Focusing on:')
    let focusGone = false;
    for (let i = 0; i < 10; i++) {
      const elements = await driver.findElements(By.xpath("//*[contains(text(),'Focusing on:')]"));
      if (elements.length === 0) {
        focusGone = true;
        break;
      }
      await driver.sleep(1000);
    }
    if (!focusGone) {
      const bodyHtml = await driver.findElement(By.tagName('body')).getAttribute('innerHTML');
      console.error('Focus mode not exited. Current page HTML:\n', bodyHtml);
      throw new Error('Focus mode did not exit after timer finished');
    }
    // 대시보드 복귀 체크: 'Add Task' 버튼이 보이는지
    const addTaskBtn = await driver.findElement(By.xpath("//button[contains(.,'Add Task')]"));
    if (!addTaskBtn) throw new Error('Did not return to dashboard after focus mode');
    // 7. Check that the todo card now shows '1 min focused' (or 0 if test was too short)
    const updatedCard = await driver.findElement(By.xpath(`//div[contains(@class,'rounded-lg') and .//div[contains(@class,'text-lg') and contains(text(),'${uniqueTitle}')]]`));
    let focusedText = '';
    let found = false;
    for (let i = 0; i < 5; i++) {
      const elements = await updatedCard.findElements(By.xpath(".//*[contains(text(),'focused')]"));
      if (elements.length > 0) {
        focusedText = await elements[0].getText();
        found = true;
        break;
      }
      await driver.sleep(1000);
    }
    if (!found) {
      const cardHtml = await updatedCard.getAttribute('innerHTML');
      console.error('No focused text found in card. Card HTML:\n', cardHtml);
      throw new Error('Pomodoro time not updated on todo card');
    }
    console.log('Pomodoro result:', focusedText);
    if (!focusedText.match(/min focused/)) throw new Error('Pomodoro time not updated on todo card');

    console.log('✅ All authentication tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    throw error;
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
})()

async function testSignup(driver, baseUrl) {
  await driver.get(`${baseUrl}/signup`);
  
  // 페이지 로딩 대기: 'Sign Up' 텍스트 또는 이름 입력란이 보일 때까지 대기
  await driver.wait(until.elementLocated(By.xpath("//*[text()='Sign Up']")), 10000);
  // 또는 아래 코드로 대체 가능:
  // await driver.wait(until.elementLocated(By.css('input[placeholder="John Doe"]')), 10000);
  
  // 폼 필드 찾기
  const nameInput = await driver.findElement(By.css('input[placeholder="John Doe"]'));
  const emailInput = await driver.findElement(By.css('input[placeholder="m@example.com"]'));
  const passwordInput = await driver.findElement(By.css('input[type="password"]'));
  const submitButton = await driver.findElement(By.css('button[type="submit"]'));
  
  // 테스트 데이터 입력
  const testEmail = `test${Date.now()}@example.com`;
  const testName = 'Test User';
  const testPassword = '123456';
  
  await nameInput.clear();
  await nameInput.sendKeys(testName);
  
  await emailInput.clear();
  await emailInput.sendKeys(testEmail);
  
  await passwordInput.clear();
  await passwordInput.sendKeys(testPassword);
  
  console.log(`   Creating account: ${testName} (${testEmail})`);
  
  // 폼 제출
  await submitButton.click();
  
  // 성공 메시지 또는 로그인 페이지로 리다이렉트 확인
  try {
    await driver.wait(until.urlContains('/login'), 10000);
    console.log('   ✅ Signup successful - redirected to login page');
    return { testEmail, testPassword };
  } catch (error) {
    // 에러 메시지 확인
    try {
      const errorMessage = await driver.findElement(By.css('[role="alert"]'));
      const errorText = await errorMessage.getText();
      console.log(`   ❌ Signup failed: ${errorText}`);
    } catch {
      // 추가: 현재 URL과 전체 HTML 출력
      const currentUrl = await driver.getCurrentUrl();
      const pageSource = await driver.getPageSource();
      console.log('   ❌ Signup failed - unknown error');
      console.log('   Current URL:', currentUrl);
      console.log('   Page HTML:\n', pageSource);
    }
    throw new Error('Signup failed');
  }
}

async function testLogin(driver, baseUrl, testEmail, testPassword) {
  await driver.get(`${baseUrl}/login`);
  
  // 페이지 로딩 대기: 이메일 입력란이 보일 때까지 대기
  try {
    await driver.wait(until.elementLocated(By.css('input[placeholder="m@example.com"]')), 10000);
  } catch (error) {
    // 추가: 현재 URL과 전체 HTML 출력
    const currentUrl = await driver.getCurrentUrl();
    const pageSource = await driver.getPageSource();
    console.log('   ❌ Login page did not load email input');
    console.log('   Current URL:', currentUrl);
    console.log('   Page HTML:\n', pageSource);
    throw error;
  }
  
  // 폼 필드 찾기
  const emailInput = await driver.findElement(By.css('input[placeholder="m@example.com"]'));
  const passwordInput = await driver.findElement(By.css('input[type="password"]'));
  const submitButton = await driver.findElement(By.css('button[type="submit"]'));
  
  // 테스트 데이터 입력 (signup에서 사용한 데이터)
  await emailInput.clear();
  await emailInput.sendKeys(testEmail);
  
  await passwordInput.clear();
  await passwordInput.sendKeys(testPassword);
  
  console.log(`   Logging in: ${testEmail}`);
  
  // 폼 제출
  await submitButton.click();
  
  // 대시보드로 리다이렉트 확인
  try {
    await driver.wait(until.urlContains('/dashboard'), 10000);
    console.log('   ✅ Login successful - redirected to dashboard');
  } catch (error) {
    // 에러 메시지 확인
    try {
      const errorMessage = await driver.findElement(By.css('[role="alert"]'));
      const errorText = await errorMessage.getText();
      console.log(`   ❌ Login failed: ${errorText}`);
    } catch {
      // 추가: 현재 URL과 전체 HTML 출력
      const currentUrl = await driver.getCurrentUrl();
      const pageSource = await driver.getPageSource();
      console.log('   ❌ Login failed - unknown error');
      console.log('   Current URL:', currentUrl);
      console.log('   Page HTML:\n', pageSource);
    }
    throw new Error('Login failed');
  }
}

async function testDashboard(driver) {
  // 대시보드 페이지 로딩 대기
  await driver.wait(until.elementLocated(By.css('h1')), 10000);
  
  // 사용자 정보 표시 확인
  try {
    const welcomeText = await driver.findElement(By.xpath("//span[contains(text(), 'Welcome')]"));
    const welcomeMessage = await welcomeText.getText();
    console.log(`   ✅ Dashboard loaded: ${welcomeMessage}`);
  } catch (error) {
    console.log('   ⚠️  Welcome message not found, but dashboard loaded');
  }
  
  // 로그아웃 버튼 확인
  try {
    const logoutButton = await driver.findElement(By.xpath("//button[contains(text(), 'Logout')]"));
    console.log('   ✅ Logout button found');
  } catch (error) {
    console.log('   ❌ Logout button not found');
  }
  
  // Add Task 버튼 확인
  try {
    const addTaskButton = await driver.findElement(By.xpath("//button[contains(text(), 'Add Task')]"));
    console.log('   ✅ Add Task button found');
  } catch (error) {
    console.log('   ❌ Add Task button not found');
  }
  
  console.log('   ✅ Dashboard test completed');
}

async function testCreateTodo(driver, uniqueTitle) {
  // 1. Add Task 버튼 클릭
  const addTaskButton = await driver.findElement(By.xpath("//button[contains(., 'Add Task')]"));
  await addTaskButton.click();
  await driver.sleep(1000);

  // 2. 제목 입력 (실제 placeholder에 맞게 수정)
  const titleInput = await driver.findElement(By.css('input[placeholder="e.g. Finish project proposal"]'));
  await titleInput.clear();
  await titleInput.sendKeys(uniqueTitle);

  // 3. 설명 입력 (optional)
  try {
    const descInput = await driver.findElement(By.css('textarea[placeholder="Description"]'));
    await descInput.clear();
    await descInput.sendKeys('자동화 테스트 설명');
  } catch {}

  // 4. 날짜 선택 (오늘)
  try {
    const dateButton = await driver.findElement(By.xpath("//button[contains(., 'Pick a date')]"));
    await dateButton.click();
    await driver.sleep(500);
    const today = new Date();
    const day = today.getDate().toString();
    const dayButton = await driver.findElement(By.xpath(`//button[normalize-space(text())='${day}']`));
    await dayButton.click();
  } catch {}

  // 5. 태그 입력 (optional)
  try {
    const tagInput = await driver.findElement(By.css('input[placeholder="Tag"]'));
    await tagInput.clear();
    await tagInput.sendKeys('자동화');
  } catch {}

  // 6. 쿼드런트 선택 (Q1)
  try {
    const q1Radio = await driver.findElement(By.xpath("//label[contains(., 'Q1') or contains(., 'Urgent')]"));
    await q1Radio.click();
  } catch {}

  // 7. Save 버튼 클릭
  const saveButton = await driver.findElement(By.xpath("//button[contains(., 'Save') or contains(., 'Create')]"));
  await saveButton.click();
  await driver.sleep(1500);

  // 8. 새로 생성된 todo가 목록에 나타나는지 확인
  const todoItem = await driver.findElement(By.xpath(`//*[contains(text(), '${uniqueTitle}')]`));
  if (todoItem) {
    console.log('   ✅ Todo created and found in the list:', uniqueTitle);
  } else {
    throw new Error('Todo not found in the list after creation');
  }
}

// 테스트 실행
// testAuth()
//   .then(() => {
//     console.log('🎉 Authentication test completed successfully!');
//     process.exit(0);
//   })
//   .catch((error) => {
//     console.error('💥 Authentication test failed:', error);
//     process.exit(1);
//   }); 