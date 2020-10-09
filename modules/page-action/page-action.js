chrome.storage.sync.get({
  hideEmptyColumns: false,
  calculateCustomFieldsSumm: true,
}, function (result) {
  const hideEmptyColumnsCheckbox = document.getElementById('hide_empty_columns');
  const calculateCustomFieldsCheckbox = document.getElementById('calculate_custom_fields');

  hideEmptyColumnsCheckbox.checked = result.hideEmptyColumns;
  calculateCustomFieldsCheckbox.checked = result.calculateCustomFieldsSumm;

  calculateCustomFieldsCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({
      calculateCustomFieldsSumm: calculateCustomFieldsCheckbox.checked,
    });
  });

  hideEmptyColumnsCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({
      hideEmptyColumns: hideEmptyColumnsCheckbox.checked,
    });
  });

  showPageActions();
});

function showPageActions() {
  document.querySelector('.page-actions').classList.remove('hide');
}
