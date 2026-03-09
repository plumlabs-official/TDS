// Figma Plugin: TDS Migrator
// Style Migration / Icon / Cleanup

figma.showUI(__html__, { width: 280, height: 400 });

figma.ui.onmessage = async function(msg) {
  try {
    if (msg.type === 'migrate') {
      var result = await handleMigrate();
      figma.ui.postMessage({ type: 'result', text: result });
    } else if (msg.type === 'detach-effects') {
      var result = await handleDetachEffects();
      figma.ui.postMessage({ type: 'result', text: result });
    } else if (msg.type === 'bind-icon-colors') {
      var result = await handleBindIconColors();
      figma.ui.postMessage({ type: 'result', text: result });
    } else if (msg.type === 'swap-icons') {
      var result = await handleSwapIcons();
      figma.ui.postMessage({ type: 'result', text: result });
    }
  } catch (error) {
    console.error('Plugin error:', error);
    figma.ui.postMessage({ type: 'result', text: 'Error: ' + error.message });
    figma.notify('Error: ' + error.message, { error: true });
  }
};

// === Detach Effect Styles ===

async function handleDetachEffects() {
  var targets = figma.currentPage.selection.length > 0
    ? figma.currentPage.selection
    : figma.currentPage.children;
  var scope = figma.currentPage.selection.length > 0 ? 'selection' : 'page';

  var count = 0;

  async function detachNode(node) {
    // 디버그: 노드의 effect 관련 속성 확인
    var hasEffectStyleId = 'effectStyleId' in node;
    var effectStyleId = hasEffectStyleId ? node.effectStyleId : 'N/A';
    var hasEffects = 'effects' in node && node.effects && node.effects.length > 0;
    if (hasEffects || effectStyleId) {
      console.log('[DEBUG] ' + node.name + ' | type: ' + node.type + ' | effectStyleId: ' + effectStyleId + ' | effects: ' + (hasEffects ? node.effects.length : 0));
    }

    // Ghost 타입 버튼은 스킵 (Focus ring effect 유지)
    if (node.name && node.name.indexOf('Type=Ghost') !== -1) {
      return;
    }

    // effectStyleId가 있는 경우 — async API로 해제
    if (hasEffectStyleId && node.effectStyleId && node.effectStyleId !== figma.mixed) {
      try {
        var currentStyle = await figma.getStyleByIdAsync(node.effectStyleId);
        var styleName = currentStyle ? currentStyle.name : node.effectStyleId;
        await node.setEffectStyleIdAsync('');
        // DROP_SHADOW만 제거, 나머지 effect 유지
        var remaining = node.effects.filter(function(e) { return e.type !== 'DROP_SHADOW'; });
        node.effects = remaining;
        count++;
        console.log('Removed: ' + styleName + ' on ' + node.name);
      } catch (err) {
        try {
          var remaining = node.effects.filter(function(e) { return e.type !== 'DROP_SHADOW'; });
          node.effects = remaining;
          count++;
          console.log('Removed (fallback): ' + node.name);
        } catch (err2) {
          console.log('Error on ' + node.name + ': ' + err.message);
        }
      }
    }
    // effectStyleId 없지만 effects 배열이 있는 경우
    else if (hasEffects) {
      var hadShadow = node.effects.some(function(e) { return e.type === 'DROP_SHADOW'; });
      if (hadShadow) {
        node.effects = node.effects.filter(function(e) { return e.type !== 'DROP_SHADOW'; });
        count++;
        console.log('Removed local drop shadows on ' + node.name);
      }
    }
    if ('children' in node) {
      for (var i = 0; i < node.children.length; i++) {
        await detachNode(node.children[i]);
      }
    }
  }

  for (var n = 0; n < targets.length; n++) {
    await detachNode(targets[n]);
  }

  var msg = 'Removed ' + count + ' effect(s) from ' + scope;
  figma.notify(msg);
  return msg;
}

// === Bind Icon Colors ===

async function handleBindIconColors() {
  var targets = figma.currentPage.selection.length > 0
    ? figma.currentPage.selection
    : figma.currentPage.children;
  var scope = figma.currentPage.selection.length > 0 ? 'selection' : 'page';

  // Mode Collection에서 foreground 변수 찾기
  var variables = await figma.variables.getLocalVariablesAsync();
  var collections = await figma.variables.getLocalVariableCollectionsAsync();
  var modeCollection = null;
  for (var c = 0; c < collections.length; c++) {
    if (collections[c].name === 'Mode') {
      modeCollection = collections[c];
      break;
    }
  }
  if (!modeCollection) {
    figma.notify('Mode Collection not found.');
    return 'Mode Collection not found';
  }

  var foregroundVar = null;
  for (var v = 0; v < variables.length; v++) {
    if (variables[v].variableCollectionId === modeCollection.id && variables[v].name === 'foreground') {
      foregroundVar = variables[v];
      break;
    }
  }
  if (!foregroundVar) {
    figma.notify('foreground variable not found in Mode Collection.');
    return 'foreground variable not found';
  }
  console.log('Found foreground variable: ' + foregroundVar.id);

  var count = 0;

  async function bindNode(node) {
    // Lucide Icons 컴포넌트 내부의 stroke 바인딩
    var isLucideIcon = node.name && node.name.indexOf('Lucide Icons /') === 0;

    if (isLucideIcon) {
      // 아이콘 자식 노드의 stroke를 foreground로 바인딩
      await bindChildStrokes(node);
    }

    if ('children' in node) {
      for (var i = 0; i < node.children.length; i++) {
        await bindNode(node.children[i]);
      }
    }
  }

  async function bindChildStrokes(node) {
    if ('strokes' in node && node.strokes && node.strokes !== figma.mixed && node.strokes.length > 0) {
      var newStrokes = [];
      var changed = false;
      for (var si = 0; si < node.strokes.length; si++) {
        var stroke = JSON.parse(JSON.stringify(node.strokes[si]));
        // 이미 바인딩되어 있으면 스킵
        var alreadyBound = node.boundVariables && node.boundVariables.strokes && node.boundVariables.strokes[si];
        if (!alreadyBound && stroke.type === 'SOLID') {
          try {
            stroke = figma.variables.setBoundVariableForPaint(stroke, 'color', foregroundVar);
            changed = true;
            count++;
            console.log('Bound stroke to foreground on ' + node.name);
          } catch (err) {
            console.log('Stroke bind error on ' + node.name + ': ' + err.message);
          }
        }
        newStrokes.push(stroke);
      }
      if (changed) node.strokes = newStrokes;
    }

    // fills도 확인 (일부 아이콘은 fill로 색상 적용)
    if ('fills' in node && node.fills && node.fills !== figma.mixed && node.fills.length > 0) {
      var newFills = [];
      var fillChanged = false;
      for (var fi = 0; fi < node.fills.length; fi++) {
        var fill = JSON.parse(JSON.stringify(node.fills[fi]));
        var alreadyBound = node.boundVariables && node.boundVariables.fills && node.boundVariables.fills[fi];
        if (!alreadyBound && fill.type === 'SOLID') {
          // 배경색(#FFFFFF)은 스킵, 전경색만 바인딩
          var r = fill.color.r, g = fill.color.g, b = fill.color.b;
          var isWhite = r > 0.95 && g > 0.95 && b > 0.95;
          if (!isWhite) {
            try {
              fill = figma.variables.setBoundVariableForPaint(fill, 'color', foregroundVar);
              fillChanged = true;
              count++;
              console.log('Bound fill to foreground on ' + node.name);
            } catch (err) {
              console.log('Fill bind error on ' + node.name + ': ' + err.message);
            }
          }
        }
        newFills.push(fill);
      }
      if (fillChanged) node.fills = newFills;
    }

    if ('children' in node) {
      for (var i = 0; i < node.children.length; i++) {
        await bindChildStrokes(node.children[i]);
      }
    }
  }

  for (var n = 0; n < targets.length; n++) {
    await bindNode(targets[n]);
  }

  var msg = 'Bound ' + count + ' color(s) to foreground (' + scope + ')';
  figma.notify(msg);
  return msg;
}

// === Migrate ===

async function handleMigrate() {
  var targets = figma.currentPage.selection.length > 0
    ? figma.currentPage.selection
    : figma.currentPage.children;
  var scope = figma.currentPage.selection.length > 0 ? 'selection' : 'page';

  // TDS 리소스 로드
  var variables = await figma.variables.getLocalVariablesAsync();
  var effectStyles = await figma.getLocalEffectStylesAsync();
  var textStyles = await figma.getLocalTextStylesAsync();

  console.log('Variables: ' + variables.length + ', Effects: ' + effectStyles.length + ', Text Styles: ' + textStyles.length);

  // Mode Collection 변수만 필터
  var collections = await figma.variables.getLocalVariableCollectionsAsync();
  var modeCollection = null;
  for (var c = 0; c < collections.length; c++) {
    if (collections[c].name === 'Mode') {
      modeCollection = collections[c];
      break;
    }
  }

  if (!modeCollection) {
    figma.notify('Mode Collection not found.');
    return 'Mode Collection not found';
  }

  var modeVariables = [];
  for (var v = 0; v < variables.length; v++) {
    if (variables[v].variableCollectionId === modeCollection.id) {
      modeVariables.push(variables[v]);
    }
  }
  console.log('Mode Collection variables: ' + modeVariables.length);

  // 이름으로 검색 맵 (루트 레벨 우선)
  var variableByFullName = {};
  var variableByShortName = {};

  for (var i = 0; i < modeVariables.length; i++) {
    var v = modeVariables[i];
    var fullName = v.name;
    var parts = fullName.split('/');
    var shortName = parts[parts.length - 1];
    var isRootLevel = parts.length === 1;

    variableByFullName[fullName] = v;

    if (isRootLevel) {
      variableByShortName[shortName] = v;
    } else if (!variableByShortName[shortName]) {
      variableByShortName[shortName] = v;
    }
  }

  function findTdsVariable(originalName) {
    var parts = originalName.split('/');
    var shortName = parts[parts.length - 1];
    if (variableByFullName[originalName]) return variableByFullName[originalName];
    if (variableByShortName[shortName]) return variableByShortName[shortName];
    return null;
  }

  var effectByName = {};
  var effectByShortName = {};
  for (var e = 0; e < effectStyles.length; e++) {
    var effectName = effectStyles[e].name;
    effectByName[effectName] = effectStyles[e];
    var effectParts = effectName.split('/');
    if (effectParts.length > 1) {
      effectByShortName[effectParts[effectParts.length - 1]] = effectStyles[e];
    }
  }

  function findTdsEffectStyle(originalName) {
    if (effectByName[originalName]) return effectByName[originalName];
    if (effectByName['shadows/' + originalName]) return effectByName['shadows/' + originalName];
    var parts = originalName.split('/');
    var shortName = parts[parts.length - 1];
    if (effectByShortName[shortName]) return effectByShortName[shortName];
    return null;
  }

  var textStyleByName = {};
  for (var t = 0; t < textStyles.length; t++) {
    textStyleByName[textStyles[t].name] = textStyles[t];
  }

  // font-sans 변수 + font-weight 변수 맵 구축
  var fontSans = null;
  var fontWeightMap = {}; // { 100: var, 200: var, ... 900: var }
  var weightNameMap = {
    100: 'font-thin', 200: 'font-extralight', 300: 'font-light',
    400: 'font-normal', 500: 'font-medium', 600: 'font-semibold',
    700: 'font-bold', 800: 'font-extrabold', 900: 'font-black'
  };
  for (var fv = 0; fv < variables.length; fv++) {
    var vName = variables[fv].name;
    if (vName.indexOf('font-sans') !== -1 && !fontSans) {
      fontSans = variables[fv];
    }
    // font-weight 변수 매칭 (예: font/weight/font-medium, font-medium 등)
    for (var w in weightNameMap) {
      if (vName.indexOf(weightNameMap[w]) !== -1 && !fontWeightMap[w]) {
        fontWeightMap[w] = variables[fv];
      }
    }
  }
  if (fontSans) {
    console.log('Found font-sans: ' + fontSans.name);
    console.log('Font weight vars: ' + Object.keys(fontWeightMap).join(', '));
    // Pretendard 폰트 로드
    var fontStyleNames = ['Thin', 'ExtraLight', 'Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold', 'Black'];
    for (var fl = 0; fl < fontStyleNames.length; fl++) {
      try {
        await figma.loadFontAsync({ family: 'Pretendard', style: fontStyleNames[fl] });
      } catch (e) {}
    }
    // 텍스트 스타일 전역 font-sans 바인딩
    for (var ts = 0; ts < textStyles.length; ts++) {
      try {
        await textStyles[ts].setBoundVariable('fontFamily', fontSans);
      } catch (err) {
        console.log('Style font bind error: ' + textStyles[ts].name + ': ' + err.message);
      }
    }
  }

  var stats = { effects: 0, fills: 0, strokes: 0, textStyles: 0, fonts: 0, skipped: 0 };

  async function processNode(node) {
    if (node.name && (node.name.indexOf('Icon/') === 0 || node.name === 'Icon')) {
      stats.skipped++;
      return;
    }

    // 1. Effect Style 교체
    if ('effectStyleId' in node && node.effectStyleId && node.effectStyleId !== figma.mixed) {
      try {
        var currentEffectStyle = await figma.getStyleByIdAsync(node.effectStyleId);
        if (currentEffectStyle) {
          var tdsEffectStyle = findTdsEffectStyle(currentEffectStyle.name);
          if (tdsEffectStyle && tdsEffectStyle.id !== node.effectStyleId) {
            await node.setEffectStyleIdAsync(tdsEffectStyle.id);
            stats.effects++;
            console.log('Effect: ' + currentEffectStyle.name + ' -> TDS ' + tdsEffectStyle.name);
          }
        }
      } catch (err) {
        console.log('Effect error: ' + err.message);
      }
    }

    // 2. Fill 변수 교체
    if ('fills' in node && node.fills && node.fills !== figma.mixed && node.fills.length > 0) {
      var newFills = [];
      var fillChanged = false;
      for (var fi = 0; fi < node.fills.length; fi++) {
        var fill = JSON.parse(JSON.stringify(node.fills[fi]));
        if (node.boundVariables && node.boundVariables.fills && node.boundVariables.fills[fi]) {
          var fillBinding = node.boundVariables.fills[fi];
          try {
            var currentFillVar = await figma.variables.getVariableByIdAsync(fillBinding.id);
            if (currentFillVar) {
              if (currentFillVar.name.indexOf('custom/') === 0) {
                newFills.push(fill);
                continue;
              }
              var tdsFillVar = findTdsVariable(currentFillVar.name);
              if (tdsFillVar && tdsFillVar.id !== currentFillVar.id) {
                fill = figma.variables.setBoundVariableForPaint(fill, 'color', tdsFillVar);
                fillChanged = true;
                stats.fills++;
                console.log('Fill: ' + currentFillVar.name + ' -> TDS ' + tdsFillVar.name);
              }
            }
          } catch (err) {
            console.log('Fill bind error: ' + err.message);
          }
        }
        newFills.push(fill);
      }
      if (fillChanged) node.fills = newFills;
    }

    // 3. Stroke 변수 교체
    if ('strokes' in node && node.strokes && node.strokes !== figma.mixed && node.strokes.length > 0) {
      var newStrokes = [];
      var strokeChanged = false;
      for (var si = 0; si < node.strokes.length; si++) {
        var stroke = JSON.parse(JSON.stringify(node.strokes[si]));
        if (node.boundVariables && node.boundVariables.strokes && node.boundVariables.strokes[si]) {
          var strokeBinding = node.boundVariables.strokes[si];
          try {
            var currentStrokeVar = await figma.variables.getVariableByIdAsync(strokeBinding.id);
            if (currentStrokeVar) {
              if (currentStrokeVar.name.indexOf('custom/') === 0) {
                newStrokes.push(stroke);
                continue;
              }
              var tdsStrokeVar = findTdsVariable(currentStrokeVar.name);
              if (tdsStrokeVar && tdsStrokeVar.id !== currentStrokeVar.id) {
                stroke = figma.variables.setBoundVariableForPaint(stroke, 'color', tdsStrokeVar);
                strokeChanged = true;
                stats.strokes++;
                console.log('Stroke: ' + currentStrokeVar.name + ' -> TDS ' + tdsStrokeVar.name);
              }
            }
          } catch (err) {
            console.log('Stroke bind error: ' + err.message);
          }
        }
        newStrokes.push(stroke);
      }
      if (strokeChanged) node.strokes = newStrokes;
    }

    // 4. Text Style 교체
    if (node.type === 'TEXT') {
      if (node.textStyleId && typeof node.textStyleId === 'string') {
        try {
          var currentTextStyle = await figma.getStyleByIdAsync(node.textStyleId);
          if (currentTextStyle) {
            var tdsTextStyle = textStyleByName[currentTextStyle.name];
            if (tdsTextStyle && tdsTextStyle.id !== node.textStyleId) {
              await node.setTextStyleIdAsync(tdsTextStyle.id);
              stats.textStyles++;
              console.log('Text Style: ' + currentTextStyle.name + ' -> TDS');
            }
          }
        } catch (err) {
          console.log('Text Style error: ' + err.message);
        }
      }

      // 5. fontFamily + fontWeight 바인딩 (스타일 미적용 텍스트만)
      if (fontSans && !node.textStyleId) {
        try {
          // 현재 폰트 로드 (수정 전 필수)
          if (node.fontName && node.fontName !== figma.mixed) {
            await figma.loadFontAsync(node.fontName);
            try {
              await figma.loadFontAsync({ family: 'Pretendard', style: node.fontName.style });
            } catch (e) {}
          }
          // fontFamily 바인딩
          await node.setBoundVariable('fontFamily', fontSans);
          // fontWeight 바인딩 (현재 weight에 매칭되는 TDS 토큰)
          if (node.fontWeight && node.fontWeight !== figma.mixed && fontWeightMap[node.fontWeight]) {
            await node.setBoundVariable('fontWeight', fontWeightMap[node.fontWeight]);
            console.log('Font weight bound: ' + node.fontWeight + ' on ' + node.name);
          }
          stats.fonts++;
        } catch (err) {
          console.log('Font bind error on ' + node.name + ': ' + err.message);
        }
      }
    }

    if ('children' in node) {
      for (var ci = 0; ci < node.children.length; ci++) {
        await processNode(node.children[ci]);
      }
    }
  }

  for (var n = 0; n < targets.length; n++) {
    await processNode(targets[n]);
  }

  var total = stats.effects + stats.fills + stats.strokes + stats.textStyles + stats.fonts;
  var msg = 'Effect ' + stats.effects + ', Fill ' + stats.fills + ', Stroke ' + stats.strokes + ', Text ' + stats.textStyles + ', Font ' + stats.fonts + ' (' + scope + ', skip: ' + stats.skipped + ')';
  figma.notify('Done: ' + msg);
  console.log('Stats:', stats);
  return msg;
}

// === Swap Icon Sources ===

async function handleSwapIcons() {
  // 1. Icon Library 페이지 로드
  var iconLibraryPage = null;
  for (var p = 0; p < figma.root.children.length; p++) {
    if (figma.root.children[p].name === 'Icon Library') {
      iconLibraryPage = figma.root.children[p];
      break;
    }
  }
  if (!iconLibraryPage) {
    var msg = 'Icon Library page not found.';
    figma.notify(msg);
    return msg;
  }
  await iconLibraryPage.loadAsync();

  // 2. Icon Library 페이지 전체에서 모든 COMPONENT 수집 (Lucide, Tabler, Phosphor, Remix 등)
  var allNodes = iconLibraryPage.findAll(function(n) {
    return n.type === 'COMPONENT';
  });

  var canonicalMap = {};
  for (var i = 0; i < allNodes.length; i++) {
    var comp = allNodes[i];
    if (comp.name) {
      canonicalMap[comp.name] = comp;
    }
  }

  var canonicalCount = Object.keys(canonicalMap).length;
  console.log('Canonical icon components found: ' + canonicalCount);

  if (canonicalCount === 0) {
    var msg = 'No icon components found in Icon Library page.';
    figma.notify(msg);
    return msg;
  }

  // 4. 선택 노드 (없으면 페이지 전체) 재귀 순회
  var targets = figma.currentPage.selection.length > 0
    ? figma.currentPage.selection
    : figma.currentPage.children;
  var scope = figma.currentPage.selection.length > 0 ? 'selection' : 'page';

  var swapCount = 0;

  async function traverseAndSwap(node) {
    // 5. INSTANCE 노드의 mainComponent가 정식이 아니면 교체
    if (node.type === 'INSTANCE') {
      try {
        var mainComp = await node.getMainComponentAsync();
        if (mainComp && mainComp.name) {
          var compName = mainComp.name;
          if (canonicalMap[compName] && canonicalMap[compName].id !== mainComp.id) {
            node.swapComponent(canonicalMap[compName]);
            swapCount++;
            console.log('Swapped: ' + compName + ' on ' + node.name);
          }
        }
      } catch (err) {
        console.log('Swap error on ' + node.name + ': ' + err.message);
      }
    }
    if ('children' in node) {
      for (var i = 0; i < node.children.length; i++) {
        await traverseAndSwap(node.children[i]);
      }
    }
  }

  for (var n = 0; n < targets.length; n++) {
    await traverseAndSwap(targets[n]);
  }

  var msg = 'Swapped ' + swapCount + ' icon instance(s) to canonical sources (' + scope + ')';
  figma.notify(msg);
  return msg;
}

