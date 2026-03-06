// Figma Plugin: Replace Font Family Variable in Text Styles
// fontFamily만 TDS font-sans로 교체 (weight는 이미 내장됨)

(async () => {
  try {
    const textStyles = await figma.getLocalTextStylesAsync();
    console.log(`Found ${textStyles.length} text styles`);

    if (textStyles.length === 0) {
      figma.notify('❌ Text Style이 없습니다.');
      figma.closePlugin();
      return;
    }

    const variables = await figma.variables.getLocalVariablesAsync();
    console.log(`Found ${variables.length} variables`);

    // font-sans 찾기
    const fontSans = variables.find(v => v.name.includes('font-sans'));
    if (!fontSans) {
      figma.notify('❌ font-sans 변수를 찾을 수 없습니다.');
      figma.closePlugin();
      return;
    }
    console.log('font-sans:', fontSans.name);

    // Pretendard 폰트 전부 로드
    const fontStyles = [
      'Thin', 'ExtraLight', 'Light', 'Regular', 'Medium',
      'SemiBold', 'Bold', 'ExtraBold', 'Black'
    ];

    console.log('Loading Pretendard fonts...');
    for (const style of fontStyles) {
      try {
        await figma.loadFontAsync({ family: 'Pretendard', style });
      } catch (e) {
        // 폰트 없으면 스킵
      }
    }

    let updated = 0;
    let failed = 0;

    for (const style of textStyles) {
      try {
        // fontFamily만 바인딩 (weight는 Text Style에 이미 내장)
        await style.setBoundVariable('fontFamily', fontSans);
        updated++;
        console.log(`✓ ${style.name}`);
      } catch (e) {
        failed++;
        console.error(`✗ ${style.name}:`, e.message);
      }
    }

    figma.notify(`✅ ${updated}개 완료, ${failed}개 실패`);
  } catch (error) {
    console.error('Plugin error:', error);
    figma.notify('❌ 오류: ' + error.message, { error: true });
  }

  figma.closePlugin();
})();
