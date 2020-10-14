(function () {
  const lastColumnsSummary = {};
  const selectedByColumns = {};
  let calculateCustomFieldsFixedTo = 2;
  const boardObserver = new MutationObserver(onBoardMutate);

  chrome.storage.sync.get({ calculateCustomFieldsSumm: true, calculateCustomFieldsFixedTo: 2 }, function (result) {
    if (result.calculateCustomFieldsSumm) {
      calculateCustomFieldsFixedTo = result.calculateCustomFieldsFixedTo;
      start();
    }
  });

  chrome.storage.onChanged.addListener(function (changes) {
    if (changes.hasOwnProperty('calculateCustomFieldsSumm')) {
      if (changes['calculateCustomFieldsSumm'].newValue) {
        start();
      } else {
        stop();
      }
    }
  });

  function start() {
    calculateColumnsCustomFieldsSum();

    afterContentCreated()
      .then(content => {
        boardObserver.observe(content, {
          childList: true,
          subtree: true,
        });
      });
  }

  function onBoardMutate(mutations) {
    if (mutations.filter(mutation => mutation.type === 'childList' && mutation.addedNodes.length && mutation.target.classList.contains('js-custom-field-badges')).length > 0) {
      calculateColumnsCustomFieldsSum();
    }
  }

  function afterContentCreated() {
    return new Promise(resolve => {
      if (document.getElementById('content')) {
        resolve(document.getElementById('content'));
      } else {
        const observer = new MutationObserver(function (mutations) {
          mutations.forEach(mutation => {
            if (mutation.type === 'childList' && Array.isArray(mutation.addedNodes) && mutation.addedNodes.find(node => node.id === 'content')) {
              resolve(document.getElementById('content'));
              observer.disconnect()
            }
          })
        });
        observer.observe(document, {
          childList: true,
          subtree: true,
        });
      }
    });
  }

  function stop() {
    boardObserver.disconnect();
    clear();
  }

  function clear() {
    document.querySelectorAll('.js-list.list-wrapper').forEach(removeSummaryBlock);
    resetCache();
  }

  function resetCache() {
    for (const key in lastColumnsSummary) {
      if (lastColumnsSummary.hasOwnProperty(key)) {
        delete lastColumnsSummary[key]
      }
    }
  }

  function calculateColumnsCustomFieldsSum() {
    document.querySelectorAll('.js-list.list-wrapper').forEach(calculateCustomFieldsForColumn);
  }

  function calculateCustomFieldsForColumn(columnNode) {
    const result = {};
    const columnName = getColumnName(columnNode);
    columnNode
      .querySelectorAll('.js-custom-field-badges .badge-text')
      .forEach(item => {
        const key = item.innerText.split(':')[0];
        let value = prepareValue(item.innerText.split(':')[1]);

        if (!result.hasOwnProperty(key)) {
          result[key] = 0;
        }
        result[key] = result[key] + value;
      });
    if (!lastColumnsSummary.hasOwnProperty(columnName)) {
      lastColumnsSummary[columnName] = '';
    }

    if (lastColumnsSummary[columnName] !== JSON.stringify(result)) {
      lastColumnsSummary[columnName] = JSON.stringify(result);
      redraw(columnNode, JSON.parse(lastColumnsSummary[getColumnName(columnNode)]));
    }
  }

  function prepareValue(value) {
    return value
      .replace(',', '.')
      .replace(/[^\d.+]+/ig, '')
      .split('+')
      .map(parseFloat)
      .filter(item => !isNaN(item))
      .slice(0, 1)
      .reduce((a, b) => a + b, 0);
  }

  function redraw(columnNode, result) {
    const selectedKeys = getSelectedForColumn(columnNode);
    const filteredSelectedKeys = Object.keys(result).filter(n => selectedKeys.indexOf(n) !== -1);
    setSelectedForColumn(columnNode, filteredSelectedKeys);

    drawSummary(columnNode, result);
    clearFiltered(columnNode);
    filterColumnByCF(columnNode);
  }

  function drawSummary(columnNode, result) {
    let summaryBlock = getSummaryBlock(columnNode);
    if (!summaryBlock) {
      addSummaryBlock(columnNode);
      summaryBlock = getSummaryBlock(columnNode)
    } else {
      clearBlock(summaryBlock);
    }

    for (let key in sortObjectByKey(result)) {
      if (result.hasOwnProperty(key)) {
        const item = addSummaryItem(columnNode, summaryBlock, key, result[key]);
        item.onclick = () => onSummaryItemClick(item, columnNode, key);
      }
    }
  }

  function clearBlock(node) {
    node.innerHTML = '';
  }

  function addSummaryBlock(node) {
    const div = document.createElement('div');
    const referenceNode = node.querySelector('.list-header');
    div.className = 'summary-block js-summary-block';

    referenceNode.parentNode.insertBefore(div, referenceNode.nextSibling);
  }

  function removeSummaryBlock(node) {
    const summaryBlock = getSummaryBlock(node);
    if (summaryBlock) {
      clearBlock(summaryBlock);
    }
  }

  function getSummaryBlock(node) {
    return node.querySelector('.js-summary-block');
  }

  function addSummaryItem(columnNode, node, key, value) {
    const item = document.createElement('div');
    item.className = 'summary-item';
    item.classList.toggle('summary-item--selected', getSelectedForColumn(columnNode).indexOf(key) !== -1);
    item.innerHTML = `<span>${key}:</span> <strong>${+value.toFixed(calculateCustomFieldsFixedTo)}</strong>`;
    node.appendChild(item);
    return item;
  }

  function onSummaryItemClick(node, columnNode, key) {
    const selectedKeys = getSelectedForColumn(columnNode);
    const clickedKeyIndex = selectedKeys.indexOf(key);
    if (clickedKeyIndex !== -1) {
      selectedKeys.splice(clickedKeyIndex, 1);
    } else {
      selectedKeys.push(key);
    }
    setSelectedForColumn(columnNode, selectedKeys);
    redraw(columnNode, JSON.parse(lastColumnsSummary[getColumnName(columnNode)]));
  }

  function clearFiltered(columnNode) {
    columnNode
      .querySelectorAll('.list-card')
      .forEach(card => card.classList.remove('js-custom-filed--hide'))
  }

  function filterColumnByCF(columnNode) {
    const cfNames = getSelectedForColumn(columnNode);
    if (cfNames.length === 0) {
      return;
    }
    columnNode
      .querySelectorAll('.list-card')
      .forEach(card => {
        const keys = [];
        card.querySelectorAll('.js-custom-field-badges .badge-text')
          .forEach(customFieldTag => keys.push(customFieldTag.innerText.split(':')[0]));
        card.classList.toggle('js-custom-filed--hide', cfNames.filter(n => keys.indexOf(n) !== -1).length === 0);
      });
  }

  function sortObjectByKey(object) {
    return Object.keys(object)
      .sort()
      .reduce((acc, key) => ({
        ...acc, [key]: object[key]
      }), {});
  }

  function getColumnName(columnNode) {
    return columnNode.querySelector('.list-header-name-assist').textContent;
  }

  function getSelectedForColumn(columnNode) {
    if (!selectedByColumns.hasOwnProperty(getColumnName(columnNode))) {
      selectedByColumns[getColumnName(columnNode)] = [];
    }

    return selectedByColumns[getColumnName(columnNode)];
  }

  function setSelectedForColumn(columnNode, selected) {
    if (!selectedByColumns.hasOwnProperty(getColumnName(columnNode))) {
      selectedByColumns[getColumnName(columnNode)] = [];
    }

    selectedByColumns[getColumnName(columnNode)] = selected;
  }
})();
