/**
 * Скрипт для передачи данных из листов "Сотрудники" и "Посещения"
 * в платформу показа посещаемости через URL (веб-приложение).
 *
 * Инструкция:
 * 1. В редакторе скриптов таблицы: Расширения → Apps Script
 * 2. Добавьте этот файл или скопируйте код в новый .gs файл
 * 3. Разверните как веб-приложение: Развернуть → Новое развертывание →
 *    Тип: Веб-приложение, Запуск от имени: меня, Доступ: любой с ссылкой
 * 4. Скопируйте URL развертывания и укажите его в платформе показа
 */

/**
 * Обработчик GET-запроса — отдаёт JSON с сотрудниками и посещениями.
 * Этот URL вызывается платформой показа для получения данных.
 */
function doGet(e) {
  const result = getDataForDisplay();
  const json = JSON.stringify(result);
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*');
}

/**
 * Возвращает объект с массивами сотрудников и посещений для платформы.
 * Можно вызывать из другого скрипта таблицы, чтобы передать данные по своему URL.
 */
function getDataForDisplay() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const employeesSheet = ss.getSheetByName('Сотрудники');
  const visitsSheet = ss.getSheetByName('Посещения');

  if (!employeesSheet || !visitsSheet) {
    return {
      error: 'Не найдены листы "Сотрудники" или "Посещения"',
      employees: [],
      visits: []
    };
  }

  const employees = readEmployees(employeesSheet);
  const visits = readVisits(visitsSheet);

  return {
    updated: new Date().toISOString(),
    employees: employees,
    visits: visits
  };
}

/**
 * Читает лист "Сотрудники".
 * Колонки: A=ID, B=ФИО, C=Подразделение, D=Должность, E=Комментарий, F=Дата создания, G=Фото
 */
function readEmployees(sheet) {
  const data = sheet.getDataRange().getValues();
  if (!data.length || data.length < 2) return [];

  const headers = data[0];
  const rows = data.slice(1);
  const list = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row[0] && !row[1]) continue; // пустая строка
    list.push({
      id: row[0] != null ? String(row[0]).trim() : '',
      name: row[1] != null ? String(row[1]).trim() : '',
      department: row[2] != null ? String(row[2]).trim() : '',
      position: row[3] != null ? String(row[3]).trim() : '',
      comment: row[4] != null ? String(row[4]).trim() : '',
      createdAt: row[5] != null ? String(row[5]).trim() : '',
      photoUrl: row[6] != null ? String(row[6]).trim() : ''
    });
  }
  return list;
}

/**
 * Читает лист "Посещения".
 * Колонки: A=ID события, B=ID сотрудника, C=ФИО, D=Действие, E=Время, F=Устройство
 */
function readVisits(sheet) {
  const data = sheet.getDataRange().getValues();
  if (!data.length || data.length < 2) return [];

  const rows = data.slice(1);
  const list = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!row[1] && !row[2]) continue;
    list.push({
      eventId: row[0] != null ? String(row[0]).trim() : '',
      employeeId: row[1] != null ? String(row[1]).trim() : '',
      name: row[2] != null ? String(row[2]).trim() : '',
      action: row[3] != null ? String(row[3]).trim() : '',
      time: row[4] != null ? String(row[4]).trim() : '',
      device: row[5] != null ? String(row[5]).trim() : ''
    });
  }
  // Сортируем по времени (новые сверху)
  list.sort(function (a, b) {
    const t1 = a.time || '';
    const t2 = b.time || '';
    return t2.localeCompare(t1);
  });
  return list;
}
