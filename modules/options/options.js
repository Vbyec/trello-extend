// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

const hideEmptyColumnsCheckbox = document.getElementById('hide_empty_columns');
const hideEmptyColumnsInterval = document.getElementById('hide_empty_columns_interval');

const calculateCustomFieldsSummCheckbox = document.getElementById('calculate_custom_fields_summ');
const calculateCustomFieldsFixedTo = document.getElementById('calculate_custom_fields_fixed_to');
const optionForm = document.getElementById('options-form');

chrome.storage.sync.get({
  hideEmptyColumns: false,
  hideEmptyColumnsInterval: 1,

  calculateCustomFieldsSumm: true,
  calculateCustomFieldsFixedTo: 2,
}, function (result) {
  hideEmptyColumnsCheckbox.checked = result.hideEmptyColumns;
  hideEmptyColumnsInterval.value = result.hideEmptyColumnsInterval;

  calculateCustomFieldsSummCheckbox.checked = result.calculateCustomFieldsSumm;
  calculateCustomFieldsFixedTo.value = result.calculateCustomFieldsFixedTo;
});

optionForm.addEventListener('submit', () => {
  chrome.storage.sync.set({
    hideEmptyColumns: hideEmptyColumnsCheckbox.checked,
    hideEmptyColumnsInterval: hideEmptyColumnsInterval.value,

    calculateCustomFieldsSumm: calculateCustomFieldsSummCheckbox.checked,
    calculateCustomFieldsFixedTo: calculateCustomFieldsFixedTo.value,
  });
});
