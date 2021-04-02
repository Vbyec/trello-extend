chrome.storage.sync.get({
  hideEmptyColumns: false,
  calculateCustomFieldsSumm: true,
  fullWidthCard: false,
}, function (result) {
  const hideEmptyColumnsCheckbox = document.getElementById('hide_empty_columns');
  const calculateCustomFieldsCheckbox = document.getElementById('calculate_custom_fields');
  const fullWidthCardCheckbox = document.getElementById('full_width_card');

  hideEmptyColumnsCheckbox.checked = result.hideEmptyColumns;
  calculateCustomFieldsCheckbox.checked = result.calculateCustomFieldsSumm;
  fullWidthCardCheckbox.checked = result.fullWidthCard;

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

  fullWidthCardCheckbox.addEventListener('change', () => {
    chrome.storage.sync.set({
      fullWidthCard: fullWidthCardCheckbox.checked,
    });
  });

  showPageActions();
});

function showPageActions() {
  document.querySelector('.page-actions').classList.remove('hide');
}
