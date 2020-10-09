(function () {
  const lastColumnsSummary = {};
  let calculateCustomFieldsFixedTo = 2;
  let intervalId, timeInterval;

  chrome.storage.sync.get({ calculateCustomFieldsSumm: true, calculateCustomFieldsInterval: 1, calculateCustomFieldsFixedTo: 2 }, function (result) {
    if (result.calculateCustomFieldsSumm) {
      calculateCustomFieldsFixedTo = result.calculateCustomFieldsFixedTo;
      timeInterval = result.calculateCustomFieldsInterval;
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
    intervalId = setInterval(calculateColumnsCustomFieldsSum, timeInterval * 1000);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      clear();
    }
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
    const columnName = columnNode.querySelector('.list-header-name-assist').textContent;
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
      drawSummary(columnNode, result);
    }
  }

  function prepareValue(value) {
    return value
      .replace(',', '.')
      .replace(/[^\d.+]+/ig, '')
      .split('+')
      .map(parseFloat)
      .filter(item => !isNaN(item))
      .reduce((a, b) => a + b, 0);
  }

  function drawSummary(node, result) {
    let summaryBlock = getSummaryBlock(node);
    if (!summaryBlock) {
      addSummaryBlock(node);
      summaryBlock = getSummaryBlock(node)
    } else {
      clearBlock(summaryBlock);
    }

    for (let key in sortObjectByKey(result)) {
      if (result.hasOwnProperty(key)) {
        addSummaryItem(summaryBlock, key, result[key])
      }
    }
  }

  function clearBlock(node) {
    node.innerHTML = '';
  }

  function addSummaryBlock(node) {
    const div = document.createElement('div');
    div.className = 'summary-block js-summary-block';
    node
      .querySelector('.list-header')
      .appendChild(div)
  }

  function removeSummaryBlock(node) {
    const summaryBlock = node.querySelector('.summary-block.js-summary-block');
    if (summaryBlock) {
      summaryBlock.remove();
    }
  }

  function getSummaryBlock(node) {
    return node.querySelectorAll('.list-header .js-summary-block')[0];
  }

  function addSummaryItem(node, key, value) {
    const item = document.createElement('div');
    item.className = 'summary-item';
    item.innerHTML = `<span>${key}:</span> <strong>${+value.toFixed(calculateCustomFieldsFixedTo)}</strong>`;
    node.appendChild(item);
  }

  function sortObjectByKey(object) {
    return Object.keys(object)
      .sort()
      .reduce((acc, key) => ({
        ...acc, [key]: object[key]
      }), {});
  }
})();
