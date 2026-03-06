// Figma Plugin: Migrate to TDS v3
// Mode Collection 루트 레벨 변수 우선 매칭

(async function() {
  try {
    var selection = figma.currentPage.selection;
    if (selection.length === 0) {
      figma.notify('선택된 노드가 없습니다.');
      figma.closePlugin();
      return;
    }

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
      figma.notify('Mode Collection을 찾을 수 없습니다.');
      figma.closePlugin();
      return;
    }

    var modeVariables = [];
    for (var v = 0; v < variables.length; v++) {
      if (variables[v].variableCollectionId === modeCollection.id) {
        modeVariables.push(variables[v]);
      }
    }
    console.log('Mode Collection 변수: ' + modeVariables.length + '개');

    // 이름으로 검색 맵 (루트 레벨 우선)
    var variableByFullName = {};  // 전체 경로 매칭
    var variableByShortName = {}; // 짧은 이름 매칭 (루트 레벨 우선)

    for (var i = 0; i < modeVariables.length; i++) {
      var v = modeVariables[i];
      var fullName = v.name;
      var parts = fullName.split('/');
      var shortName = parts[parts.length - 1];
      var isRootLevel = parts.length === 1; // 경로 없음 = 루트 레벨

      // 전체 경로는 항상 저장
      variableByFullName[fullName] = v;

      // 짧은 이름: 루트 레벨 우선, 이미 루트 레벨이 있으면 덮어쓰지 않음
      if (isRootLevel) {
        variableByShortName[shortName] = v;
      } else if (!variableByShortName[shortName]) {
        // 루트 레벨 없을 때만 nested 변수 저장
        variableByShortName[shortName] = v;
      }
    }

    // 변수 찾기 함수 (전체 경로 우선 → 짧은 이름)
    function findTdsVariable(originalName) {
      var parts = originalName.split('/');
      var shortName = parts[parts.length - 1];

      // 1. 전체 경로 매칭
      if (variableByFullName[originalName]) {
        return variableByFullName[originalName];
      }

      // 2. 짧은 이름 매칭 (루트 레벨 우선)
      if (variableByShortName[shortName]) {
        return variableByShortName[shortName];
      }

      return null;
    }

    var effectByName = {};
    var effectByShortName = {};
    for (var e = 0; e < effectStyles.length; e++) {
      var effectName = effectStyles[e].name;
      effectByName[effectName] = effectStyles[e];
      // shadows/sm → sm 으로도 검색 가능하게
      var effectParts = effectName.split('/');
      if (effectParts.length > 1) {
        var effectShortName = effectParts[effectParts.length - 1];
        effectByShortName[effectShortName] = effectStyles[e];
      }
    }

    // Effect Style 찾기 함수
    function findTdsEffectStyle(originalName) {
      // 1. 전체 이름 매칭
      if (effectByName[originalName]) {
        return effectByName[originalName];
      }
      // 2. shadows/ 접두어 추가해서 매칭
      if (effectByName['shadows/' + originalName]) {
        return effectByName['shadows/' + originalName];
      }
      // 3. 짧은 이름 매칭
      var parts = originalName.split('/');
      var shortName = parts[parts.length - 1];
      if (effectByShortName[shortName]) {
        return effectByShortName[shortName];
      }
      return null;
    }

    var textStyleByName = {};
    for (var t = 0; t < textStyles.length; t++) {
      textStyleByName[textStyles[t].name] = textStyles[t];
    }

    var stats = {
      effects: 0,
      fills: 0,
      strokes: 0,
      textStyles: 0,
      skipped: 0
    };

    // 노드 순회
    async function processNode(node) {
      // 아이콘 컴포넌트만 스킵 (Icon/ 으로 시작하는 경우)
      if (node.name.indexOf('Icon/') === 0 || node.name === 'Icon') {
        stats.skipped++;
        return;
      }

      // 1. Effect Style 교체
      if ('effectStyleId' in node && node.effectStyleId) {
        try {
          var currentEffectStyle = await figma.getStyleByIdAsync(node.effectStyleId);
          if (currentEffectStyle) {
            console.log('Effect found: ' + currentEffectStyle.name + ' (id: ' + node.effectStyleId + ')');
            var tdsEffectStyle = findTdsEffectStyle(currentEffectStyle.name);
            if (tdsEffectStyle) {
              console.log('TDS Effect found: ' + tdsEffectStyle.name + ' (id: ' + tdsEffectStyle.id + ')');
              if (tdsEffectStyle.id !== node.effectStyleId) {
                await node.setEffectStyleIdAsync(tdsEffectStyle.id);
                stats.effects++;
                console.log('Effect: ' + currentEffectStyle.name + ' → TDS ' + tdsEffectStyle.name);
              } else {
                console.log('Effect: 이미 TDS 스타일임');
              }
            } else {
              console.log('Effect: TDS에서 매칭되는 스타일 없음 - ' + currentEffectStyle.name);
            }
          } else {
            console.log('Effect: 현재 스타일 조회 실패 - ' + node.effectStyleId);
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
                // custom/ 접두어는 스킵
                if (currentFillVar.name.indexOf('custom/') === 0) {
                  newFills.push(fill);
                  continue;
                }
                var tdsFillVar = findTdsVariable(currentFillVar.name);

                if (tdsFillVar && tdsFillVar.id !== currentFillVar.id) {
                  fill = figma.variables.setBoundVariableForPaint(fill, 'color', tdsFillVar);
                  fillChanged = true;
                  stats.fills++;
                  console.log('Fill: ' + currentFillVar.name + ' → TDS ' + tdsFillVar.name);
                }
              }
            } catch (err) {
              console.log('Fill bind error: ' + err.message);
            }
          }
          newFills.push(fill);
        }

        if (fillChanged) {
          node.fills = newFills;
        }
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
                // custom/ 접두어는 스킵
                if (currentStrokeVar.name.indexOf('custom/') === 0) {
                  newStrokes.push(stroke);
                  continue;
                }
                var tdsStrokeVar = findTdsVariable(currentStrokeVar.name);

                if (tdsStrokeVar && tdsStrokeVar.id !== currentStrokeVar.id) {
                  stroke = figma.variables.setBoundVariableForPaint(stroke, 'color', tdsStrokeVar);
                  strokeChanged = true;
                  stats.strokes++;
                  console.log('Stroke: ' + currentStrokeVar.name + ' → TDS ' + tdsStrokeVar.name);
                }
              }
            } catch (err) {
              console.log('Stroke bind error: ' + err.message);
            }
          }
          newStrokes.push(stroke);
        }

        if (strokeChanged) {
          node.strokes = newStrokes;
        }
      }

      // 4. Text Style 교체
      if (node.type === 'TEXT') {
        if (node.textStyleId && typeof node.textStyleId === 'string') {
          try {
            var currentTextStyle = await figma.getStyleByIdAsync(node.textStyleId);
            if (currentTextStyle) {
              console.log('Text Style found: ' + currentTextStyle.name + ' (id: ' + node.textStyleId + ')');
              var tdsTextStyle = textStyleByName[currentTextStyle.name];
              if (tdsTextStyle) {
                console.log('TDS Text Style found: ' + tdsTextStyle.name + ' (id: ' + tdsTextStyle.id + ')');
                if (tdsTextStyle.id !== node.textStyleId) {
                  await node.setTextStyleIdAsync(tdsTextStyle.id);
                  stats.textStyles++;
                  console.log('Text Style: ' + currentTextStyle.name + ' → TDS');
                } else {
                  console.log('Text Style: 이미 TDS 스타일임');
                }
              } else {
                console.log('Text Style: TDS에서 매칭되는 스타일 없음 - ' + currentTextStyle.name);
              }
            } else {
              console.log('Text Style: 현재 스타일 조회 실패 - ' + node.textStyleId);
            }
          } catch (err) {
            console.log('Text Style error: ' + err.message);
          }
        }
      }

      // 자식 노드 처리
      if ('children' in node) {
        for (var ci = 0; ci < node.children.length; ci++) {
          await processNode(node.children[ci]);
        }
      }
    }

    // 실행
    for (var n = 0; n < selection.length; n++) {
      await processNode(selection[n]);
    }

    var total = stats.effects + stats.fills + stats.strokes + stats.textStyles;
    figma.notify('✅ 완료: Effect ' + stats.effects + ', Fill ' + stats.fills + ', Stroke ' + stats.strokes + ', Text Style ' + stats.textStyles + ' (스킵: ' + stats.skipped + ')');
    console.log('Stats:', stats);

  } catch (error) {
    console.error('Plugin error:', error);
    figma.notify('❌ 오류: ' + error.message, { error: true });
  }

  figma.closePlugin();
})();
