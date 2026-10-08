const messages: Record<string, [string, string]> = {
  'Invalid asset id': ['Карточка не найдена', 'Card not found'],
  'Asset not found': ['Карточка не найдена', 'Card not found'],
  'Not found': ['Запись не найдена', 'Record not found'],
  'Missing file': ['Выберите файл', 'Please select a file'],
  'No files selected': ['Выберите файлы', 'Please select files'],
  'Only images': ['Можно загружать только изображения', 'Only images can be uploaded'],
  'File too large': ['Файл слишком большой', 'The file is too large'],
  'Unsupported image type': ['Формат изображения не поддерживается', 'Unsupported image format'],
  'Access denied': ['Недостаточно прав для этого действия', 'You do not have permission to perform this action'],
  'Invalid request': ['Проверьте заполнение полей', 'Please check the form fields'],
  'Validation failed': ['Проверьте заполнение полей', 'Please check the form fields']
};
export function localizedActionError(message: string | undefined | null, locale: string) {
  const known = message ? messages[message] : undefined;
  if (known) return known[locale === 'ru' ? 0 : 1];
  if (locale === 'ru' && message && /[а-яё]/i.test(message)) return message;
  return locale === 'ru' ? 'Не удалось выполнить действие. Попробуйте ещё раз.' : 'Could not complete the action. Please try again.';
}
