/**
 * Добавьте этот код В ВАШ СУЩЕСТВУЮЩИЙ скрипт таблицы (в тот же проект, где doPost/doGet).
 *
 * 1. ЗАМЕНИТЕ вашу функцию doGet на вариант ниже (добавлена ветка action === "display" и CORS).
 * 2. Скопируйте в конец скрипта функции: responseWithCors, getDataForDisplay,
 *    readEmployeesForDisplay, readVisitsForDisplay.
 */

// ========== ЗАМЕНИТЕ ВАШУ ФУНКЦИЮ doGet НА ЭТУ: ==========

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "";
  if (action === "display") {
    try {
      var result = getDataForDisplay();
      return responseWithCors(result);
    } catch (err) {
      return responseWithCors({ ok: false, error: err.toString() });
    }
  }
  if (action === "employees") {
    try {
      var ids = getEmployeeIdsFromSheet();
      return responseWithCors({ ok: true, employeeIds: ids });
    } catch (err) {
      return responseWithCors({ ok: false, error: err.toString() });
    }
  }
  return responseWithCors({ ok: true, message: "FingerServer Google Sheets sync is active." });
}

// ========== ДОБАВЬТЕ ЭТИ ФУНКЦИИ В КОНЕЦ СКРИПТА: ==========

function responseWithCors(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader("Access-Control-Allow-Origin", "*");
}

function getDataForDisplay() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var employeesSheet = ss.getSheetByName("Сотрудники");
  var visitsSheet = ss.getSheetByName("Посещения");

  if (!employeesSheet || !visitsSheet) {
    return {
      error: "Не найдены листы Сотрудники или Посещения",
      employees: [],
      visits: [],
      updated: new Date().toISOString()
    };
  }

  var employees = readEmployeesForDisplay(employeesSheet);
  var visits = readVisitsForDisplay(visitsSheet);

  return {
    updated: new Date().toISOString(),
    employees: employees,
    visits: visits
  };
}

function readEmployeesForDisplay(sheet) {
  var data = sheet.getDataRange().getValues();
  var formulas = sheet.getLastRow() >= 2 && sheet.getLastColumn() >= 7
    ? sheet.getRange(2, 7, sheet.getLastRow(), 7).getFormulas() : [];
  if (!data.length || data.length < 2) return [];

  var list = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[0] && !row[1]) continue;
    var photoUrl = row[6] != null ? String(row[6]).trim() : "";
    if (!photoUrl && formulas[i - 1] && formulas[i - 1][0]) {
      var match = formulas[i - 1][0].match(/=IMAGE\s*\(\s*"([^"]+)"/);
      if (match) photoUrl = match[1];
    }
    list.push({
      id: row[0] != null ? String(row[0]).trim() : "",
      name: row[1] != null ? String(row[1]).trim() : "",
      department: row[2] != null ? String(row[2]).trim() : "",
      position: row[3] != null ? String(row[3]).trim() : "",
      comment: row[4] != null ? String(row[4]).trim() : "",
      createdAt: row[5] != null ? String(row[5]).trim() : "",
      photoUrl: photoUrl
    });
  }
  return list;
}

function readVisitsForDisplay(sheet) {
  var data = sheet.getDataRange().getValues();
  if (!data.length || data.length < 2) return [];

  var list = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    if (!row[1] && !row[2]) continue;
    list.push({
      eventId: row[0] != null ? String(row[0]).trim() : "",
      employeeId: row[1] != null ? String(row[1]).trim() : "",
      name: row[2] != null ? String(row[2]).trim() : "",
      action: row[3] != null ? String(row[3]).trim() : "",
      time: row[4] != null ? String(row[4]).trim() : "",
      device: row[5] != null ? String(row[5]).trim() : ""
    });
  }
  list.sort(function (a, b) {
    var t1 = a.time || "";
    var t2 = b.time || "";
    return t2.localeCompare(t1);
  });
  return list;
}
