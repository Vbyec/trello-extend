// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const hideEmptyColumnsCheckbox = document.getElementById('hide_empty_columns');
const hideEmptyColumnsInterval = document.getElementById('hide_empty_columns_interval');

const calculateCustomFieldsSummCheckbox = document.getElementById('calculate_custom_fields_summ');
const calculateCustomFieldsFixedTo = document.getElementById('calculate_custom_fields_fixed_to');

const showCardCountCheckbox = document.getElementById('show_card_count');

const optionForm = document.getElementById('options-form');

chrome.storage.sync.get({
  hideEmptyColumns: false,
  hideEmptyColumnsInterval: 1,

  calculateCustomFieldsSumm: true,
  calculateCustomFieldsFixedTo: 2,

  showCardCount: true
}, function (result) {
  hideEmptyColumnsCheckbox.checked = result.hideEmptyColumns;
  hideEmptyColumnsInterval.value = result.hideEmptyColumnsInterval;

  calculateCustomFieldsSummCheckbox.checked = result.calculateCustomFieldsSumm;
  calculateCustomFieldsFixedTo.value = result.calculateCustomFieldsFixedTo;

  showCardCountCheckbox.checked = result.showCardCount;
});

optionForm.addEventListener('submit', () => {
  chrome.storage.sync.set({
    hideEmptyColumns: hideEmptyColumnsCheckbox.checked,
    hideEmptyColumnsInterval: hideEmptyColumnsInterval.value,

    calculateCustomFieldsSumm: calculateCustomFieldsSummCheckbox.checked,
    calculateCustomFieldsFixedTo: calculateCustomFieldsFixedTo.value,

    showCardCount: showCardCountCheckbox.checked,
  });
});
